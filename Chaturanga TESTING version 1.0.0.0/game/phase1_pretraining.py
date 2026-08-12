"""
Chaturanga v1.0.4 — Phase 1: Supervised Pretraining (Behavioural Cloning)
═══════════════════════════════════════════════════════════════════════════
Purpose:
  Generate expert demonstrations from the ELO 600 Paranoid bot, then train
  a policy network via behavioural cloning. The trained network serves as a
  warm starting point for PPO self-play (Phase 2), skipping the expensive
  random-exploration phase.

ELO Hypothesis: 2000 Chaturanga ELO ≈ 3500 Chess ELO
  ELO 600 bot ≈ 1050 Chess ELO → good enough expert for initial BC.

Architecture:
  - Input : board tensor [8, 8, 40 channels] + dice one-hot [6]
  - Trunk  : 10 residual conv blocks (256 filters, 3×3 kernels)
  - Policy : Conv(2) → Flatten → FC → softmax over 4096 actions
  - Value  : Conv(1) → Flatten → FC → tanh scalar

Dependencies:
  pip install torch numpy tqdm

JS → Python bridge note:
  The actual game runs in JavaScript. Two approaches for Python-side rollouts:
    A) Spawn a Node.js subprocess running a headless game loop that exposes
       a JSON socket API. Python sends actions, receives state JSON.
    B) Rewrite the game rules in Python (chaturanga_env.py below).
  This file implements approach B (pure Python environment) for portability.
"""

import json
import math
import random
import os
import copy
from typing import Optional, Tuple, List, Dict
import numpy as np
try:
    import torch
    import torch.nn as nn
    import torch.nn.functional as F
    from torch.optim import Adam
    from tqdm import tqdm
    TORCH_AVAILABLE = True
except ImportError:
    print("[WARNING] PyTorch not found. Install with: pip install torch tqdm numpy")
    TORCH_AVAILABLE = False

# ─────────────────────────────────────────────────────────────────────────────
# 1. Chaturanga Environment (Python reimplementation of core game rules)
# ─────────────────────────────────────────────────────────────────────────────

PIECE_VALUES = {'pawn': 1, 'horse': 3, 'elephant': 3, 'rook': 5, 'king': 100}
PIECE_TYPES  = ['pawn', 'horse', 'elephant', 'rook', 'king']
FILES = 'abcdefgh'

DICE_TO_FORCED = {1:'rook', 2:'any', 3:'horse', 4:'elephant', 5:'any', 6:'pawn-king'}

def sq_to_idx(sq: str) -> Tuple[int, int]:
    """Convert 'a1' → (rank 0, file 0)"""
    f = FILES.index(sq[0])
    r = int(sq[1]) - 1
    return r, f

def idx_to_sq(r: int, f: int) -> str:
    return FILES[f] + str(r + 1)

def sq_to_flat(sq: str) -> int:
    """'a1' → 0, 'h8' → 63"""
    r, f = sq_to_idx(sq)
    return r * 8 + f

def move_to_action(from_sq: str, to_sq: str) -> int:
    """Encode (from, to) → integer in [0, 4095]"""
    return sq_to_flat(from_sq) * 64 + sq_to_flat(to_sq)

def action_to_move(action: int) -> Tuple[str, str]:
    from_flat = action // 64
    to_flat   = action % 64
    return (idx_to_sq(from_flat // 8, from_flat % 8),
            idx_to_sq(to_flat   // 8, to_flat   % 8))


class Piece:
    __slots__ = ('type', 'owner')
    def __init__(self, type_: str, owner: int):
        self.type  = type_
        self.owner = owner

    def copy(self):
        return Piece(self.type, self.owner)


class ChaturangaEnv:
    """
    Lightweight Python reimplementation of Chaturanga game rules.
    Matches the JS engine semantics closely for compatible data generation.

    4-player, 8×8 board.
    Team mode: players 0+2 vs 1+3.
    Dice face already rolled before move selection.
    """

    INITIAL_POSITIONS = {
        # Player 0 (Red) — bottom, ranks 1-2
        0: {
            'a1':'rook','b1':'horse','c1':'elephant','d1':'king',
            'e1':'elephant','f1':'horse','g1':'rook',
            'a2':'pawn','b2':'pawn','c2':'pawn','d2':'pawn',
            'e2':'pawn','f2':'pawn','g2':'pawn','h2':'pawn',
        },
        # Player 1 (Blue) — right side, files g-h
        1: {
            'h1':'rook','h2':'horse','h3':'elephant','h4':'king',
            'h5':'elephant','h6':'horse','h7':'rook',
            'g1':'pawn','g2':'pawn','g3':'pawn','g4':'pawn',
            'g5':'pawn','g6':'pawn','g7':'pawn','g8':'pawn',
        },
        # Player 2 (Green) — top, ranks 7-8
        2: {
            'a8':'rook','b8':'horse','c8':'elephant','d8':'king',
            'e8':'elephant','f8':'horse','g8':'rook',
            'a7':'pawn','b7':'pawn','c7':'pawn','d7':'pawn',
            'e7':'pawn','f7':'pawn','g7':'pawn','h7':'pawn',
        },
        # Player 3 (Yellow) — left side, files a-b
        3: {
            'a1':'rook','a2':'horse','a3':'elephant','a4':'king',
            'a5':'elephant','a6':'horse','a7':'rook',
            'b1':'pawn','b2':'pawn','b3':'pawn','b4':'pawn',
            'b5':'pawn','b6':'pawn','b7':'pawn','b8':'pawn',
        },
    }

    def __init__(self, game_mode: str = 'team'):
        self.game_mode  = game_mode
        self.board: Dict[str, Optional[Piece]] = {}
        self.players    = [{'id':i,'eliminated':False,'frozen':False,'team':i%2,'forfeits':0}
                           for i in range(4)]
        self.turn_index = 0
        self.forced_piece: Optional[str] = None
        self.last_dice  = 0
        self.game_over  = False
        self.winner     = None
        self.move_count = 0
        self.reset()

    def reset(self):
        self.board = {idx_to_sq(r,f): None for r in range(8) for f in range(8)}
        # Place only player 0 and 1 for 2-player mode (simplified)
        for r in range(8):
            for f in range(8):
                self.board[idx_to_sq(r,f)] = None

        for pid, positions in self.INITIAL_POSITIONS.items():
            for sq, ptype in positions.items():
                if sq in self.board:
                    self.board[sq] = Piece(ptype, pid)

        for p in self.players:
            p['eliminated'] = False
            p['frozen']     = False
            p['forfeits']   = 0

        self.turn_index   = 0
        self.forced_piece = None
        self.last_dice    = 0
        self.game_over    = False
        self.winner       = None
        self.move_count   = 0
        return self.get_state_tensor()

    def roll_dice(self) -> int:
        d = random.randint(1, 6)
        self.last_dice    = d
        self.forced_piece = DICE_TO_FORCED[d]
        return d

    def get_legal_moves(self, sq: str) -> List[str]:
        """Returns list of squares the piece at sq can legally move to."""
        piece = self.board.get(sq)
        if not piece:
            return []
        targets = []
        r, f = sq_to_idx(sq)

        def add(nr, nf):
            if 0 <= nr < 8 and 0 <= nf < 8:
                tsq   = idx_to_sq(nr, nf)
                tgt   = self.board[tsq]
                if self._can_land(piece, tgt):
                    targets.append(tsq)

        if piece.type == 'rook':
            for dr, df in [(0,1),(0,-1),(1,0),(-1,0)]:
                nr, nf = r+dr, f+df
                while 0 <= nr < 8 and 0 <= nf < 8:
                    tsq = idx_to_sq(nr, nf)
                    tgt = self.board[tsq]
                    if tgt:
                        if self._can_capture(piece, tgt):
                            targets.append(tsq)
                        break
                    targets.append(tsq)
                    nr += dr; nf += df

        elif piece.type == 'horse':
            for dr, df in [(-2,-1),(-2,1),(-1,-2),(-1,2),(1,-2),(1,2),(2,-1),(2,1)]:
                add(r+dr, f+df)

        elif piece.type == 'elephant':
            for dr, df in [(-2,-2),(-2,2),(2,-2),(2,2)]:
                add(r+dr, f+df)

        elif piece.type == 'king':
            for dr in [-1,0,1]:
                for df in [-1,0,1]:
                    if dr == 0 and df == 0: continue
                    add(r+dr, f+df)

        elif piece.type == 'pawn':
            # Direction depends on player
            fwd = {0:(1,0), 1:(0,-1), 2:(-1,0), 3:(0,1)}[piece.owner]
            nr2, nf2 = r+fwd[0], f+fwd[1]
            if 0 <= nr2 < 8 and 0 <= nf2 < 8:
                if not self.board[idx_to_sq(nr2, nf2)]:
                    targets.append(idx_to_sq(nr2, nf2))
            # Diagonal captures
            sides = [(-fwd[1], fwd[0]), (fwd[1], -fwd[0])]
            for ds in sides:
                nr3, nf3 = r+fwd[0]+ds[0], f+fwd[1]+ds[1]
                if 0 <= nr3 < 8 and 0 <= nf3 < 8:
                    tgt = self.board[idx_to_sq(nr3, nf3)]
                    if tgt and self._can_capture(piece, tgt):
                        targets.append(idx_to_sq(nr3, nf3))

        return targets

    def _can_land(self, piece: Piece, target: Optional[Piece]) -> bool:
        if target is None:
            return True
        return self._can_capture(piece, target)

    def _can_capture(self, piece: Piece, target: Piece) -> bool:
        if target.owner == piece.owner:
            return False
        if piece.type == 'king' and target.type == 'king':
            return False
        # Minor pieces cannot capture minor pieces
        minor_types = {'pawn', 'horse', 'elephant'}
        if piece.type in minor_types and target.type in minor_types:
            return False
        return True

    def get_all_legal_moves(self) -> List[Tuple[str,str]]:
        """All legal moves for the current player with current forced_piece."""
        player = self.players[self.turn_index]
        if player['eliminated'] or player['frozen'] or not self.forced_piece:
            return []
        moves = []
        for sq, piece in self.board.items():
            if not piece or piece.owner != self.turn_index:
                continue
            if not self._piece_matches_forced(piece.type, self.forced_piece):
                continue
            for to in self.get_legal_moves(sq):
                moves.append((sq, to))
        return moves

    def _piece_matches_forced(self, ptype: str, forced: str) -> bool:
        if forced == 'any':        return True
        if forced == 'pawn-king':  return ptype in ('pawn', 'king')
        return ptype == forced

    def apply_move(self, from_sq: str, to_sq: str):
        """Apply a move, handle captures, advance turn."""
        piece   = self.board[from_sq]
        captured = self.board[to_sq]

        self.board[to_sq]   = piece
        self.board[from_sq] = None

        if captured:
            if captured.type == 'king':
                self.players[captured.owner]['eliminated'] = True

        # Check game over
        alive = [p for p in self.players if not p['eliminated']]
        if len(alive) == 1:
            self.game_over = True
            self.winner    = alive[0]['id']
        elif self.game_mode == 'team':
            teams_alive = set(p['team'] for p in alive)
            if len(teams_alive) == 1:
                self.game_over = True
                self.winner    = teams_alive.pop()

        # Advance turn
        idx = (self.turn_index + 1) % 4
        for _ in range(4):
            if not self.players[idx]['eliminated']:
                self.turn_index = idx
                break
            idx = (idx + 1) % 4

        self.forced_piece = None
        self.move_count  += 1

    # ── State tensor encoding ────────────────────────────────────────────────
    # Shape: [8, 8, C] where C = 40 channels
    #   0-4   : player 0 piece planes (one-hot per type)
    #   5-9   : player 1 piece planes
    #   10-14 : player 2 piece planes
    #   15-19 : player 3 piece planes
    #   20-23 : whose turn (broadcast scalar) for each player
    #   24-29 : dice face one-hot (6 faces)
    #   30-33 : eliminated flags per player (broadcast)
    #   34-39 : padding zeros (reserved)

    def get_state_tensor(self) -> np.ndarray:
        tensor = np.zeros((8, 8, 40), dtype=np.float32)
        for sq, piece in self.board.items():
            if not piece:
                continue
            r, f = sq_to_idx(sq)
            ch   = piece.owner * 5 + PIECE_TYPES.index(piece.type)
            tensor[r, f, ch] = 1.0

        # Turn indicator
        tensor[:, :, 20 + self.turn_index] = 1.0

        # Dice one-hot
        if self.last_dice > 0:
            tensor[:, :, 24 + self.last_dice - 1] = 1.0

        # Eliminated flags
        for i, p in enumerate(self.players):
            if p['eliminated']:
                tensor[:, :, 30 + i] = 1.0

        return tensor

    def get_action_mask(self) -> np.ndarray:
        """Boolean mask over 4096 actions — True = legal."""
        mask = np.zeros(4096, dtype=bool)
        for from_sq, to_sq in self.get_all_legal_moves():
            mask[move_to_action(from_sq, to_sq)] = True
        return mask


# ─────────────────────────────────────────────────────────────────────────────
# 2. ELO 600 Oracle (Greedy re-implementation for data generation)
#    (A simplified version — full paranoid algo needs the JS engine)
# ─────────────────────────────────────────────────────────────────────────────

def greedy_oracle(env: ChaturangaEnv) -> Optional[Tuple[str, str]]:
    """
    Simplified ELO 600-style heuristic oracle.
    Scores moves by: capture value, centre bonus, king safety, escape.
    Used to generate supervised training data.
    """
    moves = env.get_all_legal_moves()
    if not moves:
        return None

    def centre_bonus(sq):
        r, f = sq_to_idx(sq)
        return (3.5 - max(abs(f-3.5), abs(r-3.5))) * 0.3

    def score_move(from_sq, to_sq):
        piece    = env.board[from_sq]
        captured = env.board[to_sq]
        s = random.random() * 0.3
        if captured:
            s += PIECE_VALUES[captured.type] * 10
        s += centre_bonus(to_sq)
        return s

    moves.sort(key=lambda m: score_move(m[0], m[1]), reverse=True)
    return moves[0]


# ─────────────────────────────────────────────────────────────────────────────
# 3. Data Generation
# ─────────────────────────────────────────────────────────────────────────────

def generate_episodes(num_episodes: int = 1000, max_steps: int = 200):
    """
    Play `num_episodes` games using the oracle policy.
    Returns list of (state_tensor, action_index) pairs.
    """
    dataset = []
    env = ChaturangaEnv()

    for ep in range(num_episodes):
        env.reset()
        for _ in range(max_steps):
            if env.game_over:
                break
            env.roll_dice()
            move = greedy_oracle(env)
            if not move:
                # No moves: pass (forfeit)
                env.turn_index = (env.turn_index + 1) % 4
                for _ in range(4):
                    if not env.players[env.turn_index]['eliminated']:
                        break
                    env.turn_index = (env.turn_index + 1) % 4
                continue

            state  = env.get_state_tensor()  # [8, 8, 40]
            action = move_to_action(move[0], move[1])
            dataset.append((state, action))
            env.apply_move(move[0], move[1])

        if (ep + 1) % 100 == 0:
            print(f"  Episode {ep+1}/{num_episodes} — dataset size: {len(dataset)}")

    return dataset


# ─────────────────────────────────────────────────────────────────────────────
# 4. Neural Network Architecture
# ─────────────────────────────────────────────────────────────────────────────

if TORCH_AVAILABLE:
    class ResBlock(nn.Module):
        def __init__(self, channels: int = 256):
            super().__init__()
            self.conv1 = nn.Conv2d(channels, channels, 3, padding=1, bias=False)
            self.bn1   = nn.BatchNorm2d(channels)
            self.conv2 = nn.Conv2d(channels, channels, 3, padding=1, bias=False)
            self.bn2   = nn.BatchNorm2d(channels)

        def forward(self, x):
            out = F.relu(self.bn1(self.conv1(x)))
            out = self.bn2(self.conv2(out))
            return F.relu(out + x)

    class ChaturangaNet(nn.Module):
        """
        Joint policy-value network.
        Input:  [B, 40, 8, 8] board tensor
        Output: policy logits [B, 4096], value scalar [B, 1]
        """
        IN_CHANNELS  = 40
        NUM_ACTIONS  = 4096
        HIDDEN       = 256
        NUM_RESBLOCKS = 10

        def __init__(self):
            super().__init__()
            self.input_conv = nn.Sequential(
                nn.Conv2d(self.IN_CHANNELS, self.HIDDEN, 3, padding=1, bias=False),
                nn.BatchNorm2d(self.HIDDEN),
                nn.ReLU(),
            )
            self.res_blocks = nn.Sequential(
                *[ResBlock(self.HIDDEN) for _ in range(self.NUM_RESBLOCKS)]
            )
            # Policy head
            self.policy_conv = nn.Conv2d(self.HIDDEN, 2, 1, bias=False)
            self.policy_bn   = nn.BatchNorm2d(2)
            self.policy_fc   = nn.Linear(2 * 8 * 8, self.NUM_ACTIONS)

            # Value head
            self.value_conv  = nn.Conv2d(self.HIDDEN, 1, 1, bias=False)
            self.value_bn    = nn.BatchNorm2d(1)
            self.value_fc1   = nn.Linear(1 * 8 * 8, 256)
            self.value_fc2   = nn.Linear(256, 1)

        def forward(self, x):
            # x: [B, 40, 8, 8]
            h = self.input_conv(x)
            h = self.res_blocks(h)

            # Policy
            p = F.relu(self.policy_bn(self.policy_conv(h)))
            p = p.view(p.size(0), -1)
            p = self.policy_fc(p)

            # Value
            v = F.relu(self.value_bn(self.value_conv(h)))
            v = v.view(v.size(0), -1)
            v = F.relu(self.value_fc1(v))
            v = torch.tanh(self.value_fc2(v))

            return p, v

        def get_policy(self, state_np: np.ndarray, legal_mask: np.ndarray) -> np.ndarray:
            """Given numpy state, return softmax probability over legal actions."""
            with torch.no_grad():
                x = torch.from_numpy(state_np).permute(2, 0, 1).unsqueeze(0).float()
                logits, _ = self(x)
                logits = logits.squeeze(0).numpy()
                logits[~legal_mask] = -1e9
                probs = np.exp(logits - logits.max())
                probs /= probs.sum()
            return probs


# ─────────────────────────────────────────────────────────────────────────────
# 5. Training Loop (Behavioural Cloning)
# ─────────────────────────────────────────────────────────────────────────────

def train_bc(
    dataset,
    num_epochs: int = 20,
    batch_size: int = 256,
    lr: float = 1e-3,
    save_path: str = 'chaturanga_bc.pth',
    device: str = 'cpu',
):
    """
    Behavioural cloning: minimize cross-entropy loss between
    network policy and oracle moves.
    """
    if not TORCH_AVAILABLE:
        print("[ERROR] PyTorch required for training.")
        return

    model = ChaturangaNet().to(device)
    opt   = Adam(model.parameters(), lr=lr, weight_decay=1e-4)
    sched = torch.optim.lr_scheduler.CosineAnnealingLR(opt, T_max=num_epochs)

    states  = np.array([d[0] for d in dataset])  # [N, 8, 8, 40]
    actions = np.array([d[1] for d in dataset])   # [N]

    # Convert to tensors: reorder to [N, 40, 8, 8]
    states_t  = torch.from_numpy(states).permute(0, 3, 1, 2).float().to(device)
    actions_t = torch.from_numpy(actions).long().to(device)

    N = len(dataset)
    print(f"\nTraining on {N} samples for {num_epochs} epochs...")

    for epoch in range(num_epochs):
        indices = torch.randperm(N)
        total_loss = 0.0
        batches    = 0

        for start in range(0, N, batch_size):
            idx = indices[start:start+batch_size]
            x   = states_t[idx]
            y   = actions_t[idx]

            logits, _ = model(x)
            loss = F.cross_entropy(logits, y)

            opt.zero_grad()
            loss.backward()
            torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
            opt.step()

            total_loss += loss.item()
            batches    += 1

        avg_loss = total_loss / batches
        sched.step()
        print(f"  Epoch {epoch+1:3d}/{num_epochs}  loss={avg_loss:.4f}  lr={sched.get_last_lr()[0]:.6f}")

    torch.save({
        'model_state_dict': model.state_dict(),
        'epoch': num_epochs,
        'loss':  avg_loss,
    }, save_path)
    print(f"\nModel saved to {save_path}")
    return model


# ─────────────────────────────────────────────────────────────────────────────
# 6. Evaluation
# ─────────────────────────────────────────────────────────────────────────────

def evaluate_model(model, num_games: int = 50):
    """
    Play model vs greedy oracle, measure win rate.
    Higher win rate indicates successful pretraining.
    """
    if not TORCH_AVAILABLE:
        return
    model.eval()
    env   = ChaturangaEnv()
    wins  = 0

    for game in range(num_games):
        env.reset()
        for _ in range(300):
            if env.game_over:
                break
            env.roll_dice()
            mask = env.get_action_mask()
            if not mask.any():
                env.turn_index = (env.turn_index + 1) % 4
                continue

            if env.turn_index == 0:  # model plays as Red
                probs  = model.get_policy(env.get_state_tensor(), mask)
                action = int(np.argmax(probs))
                from_sq, to_sq = action_to_move(action)
                if (from_sq, to_sq) not in env.get_all_legal_moves():
                    # Fallback to greedy if model picks illegal
                    mv = greedy_oracle(env)
                    from_sq, to_sq = mv if mv else ('a1','a1')
            else:
                mv = greedy_oracle(env)
                if not mv: continue
                from_sq, to_sq = mv

            env.apply_move(from_sq, to_sq)

        if env.game_over and env.winner == 0:
            wins += 1
        elif env.game_over and isinstance(env.winner, int):
            if env.players[env.winner]['team'] == 0:
                wins += 1

    wr = wins / num_games * 100
    print(f"Model win rate vs greedy oracle: {wr:.1f}% ({wins}/{num_games})")
    return wr


# ─────────────────────────────────────────────────────────────────────────────
# 7. Main Pipeline
# ─────────────────────────────────────────────────────────────────────────────

if __name__ == '__main__':
    import argparse

    parser = argparse.ArgumentParser(description='Chaturanga Phase 1: Supervised Pretraining')
    parser.add_argument('--generate',  type=int, default=2000, help='Number of oracle episodes to generate')
    parser.add_argument('--epochs',    type=int, default=30,   help='Training epochs')
    parser.add_argument('--batch',     type=int, default=256,  help='Batch size')
    parser.add_argument('--lr',        type=float, default=1e-3)
    parser.add_argument('--save',      type=str, default='chaturanga_bc.pth')
    parser.add_argument('--eval',      action='store_true', help='Run evaluation after training')
    parser.add_argument('--data-path', type=str, default='bc_data.npy', help='Save/load dataset')
    parser.add_argument('--load-data', action='store_true', help='Load existing dataset instead of regenerating')
    args = parser.parse_args()

    if args.load_data and os.path.exists(args.data_path):
        print(f"Loading dataset from {args.data_path}...")
        dataset = np.load(args.data_path, allow_pickle=True).tolist()
        print(f"  Loaded {len(dataset)} samples.")
    else:
        print(f"Generating {args.generate} oracle episodes...")
        dataset = generate_episodes(num_episodes=args.generate)
        np.save(args.data_path, np.array(dataset, dtype=object))
        print(f"  Dataset saved to {args.data_path} ({len(dataset)} samples)")

    if TORCH_AVAILABLE:
        model = train_bc(
            dataset,
            num_epochs=args.epochs,
            batch_size=args.batch,
            lr=args.lr,
            save_path=args.save,
        )
        if args.eval and model:
            print("\nRunning evaluation...")
            evaluate_model(model, num_games=50)
    else:
        print("\n[INFO] Dataset generated. Install PyTorch to run training:")
        print("       pip install torch tqdm")
        print(f"       python {__file__} --load-data --epochs 30")

    print("\n=== Phase 1 complete ===")
    print("Next: Use chaturanga_bc.pth as warm-start policy for Phase 2 PPO self-play.")
    print("      Load via: checkpoint = torch.load('chaturanga_bc.pth')")
    print("                model.load_state_dict(checkpoint['model_state_dict'])")
