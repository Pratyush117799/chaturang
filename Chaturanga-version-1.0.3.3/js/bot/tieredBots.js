/**
 * Chaturanga 1.0.3 — Tiered Bot System
 * ═══════════════════════════════════════════════════════════════════
 *
 *  ELO 100  Pure Random
 *  ELO 200  Greedy
 *  ELO 300  Tactical
 *  ELO 400  Strategic  (1-ply Expectiminimax)
 *  ELO 500  Deep Tactical  (SEE + 2-ply Lookahead + Mobility)
 *  ELO 600  Paranoid Strategist  (Paranoid Algorithm + Rich Eval)
 *
 * Hypothesis: 2000 Chaturanga ELO ≈ 3500 Chess ELO
 *   ELO 500 ≈  875 Chess ELO
 *   ELO 600 ≈ 1050 Chess ELO
 * ═══════════════════════════════════════════════════════════════════
 */
(function () {
  'use strict';

  // ── Constants ─────────────────────────────────────────────────────────────

  const PIECE_VALUES = { pawn: 1, horse: 3, elephant: 3, rook: 5, king: 100 };

  // Maps a dice face to the forcedPiece string used by Game.diceToPiece()
  const DICE_TO_FORCED = {
    1: 'rook',
    2: 'any',
    3: 'horse',
    4: 'elephant',
    5: 'any',
    6: 'pawn-king'
  };

  // ── Shared Helpers ────────────────────────────────────────────────────────

  /**
   * Collect all legal moves for the active player (dice already set).
   * Returns [] when player is frozen / eliminated.
   */
  function getAllLegalMoves(game) {
    const moves = [];
    const player = game.getPlayer();
    if (!player || player.eliminated || player.frozen || !game.forcedPiece) return moves;
    for (let r = 1; r <= 8; r++) {
      for (let f = 0; f < 8; f++) {
        const sq = String.fromCharCode(97 + f) + r;
        const piece = game.board.get(sq);
        if (piece && piece.owner === player.id) {
          game.getLegalMoves(sq).forEach(to => moves.push({ from: sq, to }));
        }
      }
    }
    return moves;
  }

  /**
   * Build the set of squares that `playerId` can theoretically land on
   * with ANY dice roll (used for threat detection without dice constraint).
   * Temporarily overrides turnIndex + forcedPiece, then fully restores them.
   */
  function buildThreatMap(game, playerId) {
    const savedForced = game.forcedPiece;
    const savedTurn   = game.turnIndex;
    game.forcedPiece  = 'any';
    game.turnIndex    = playerId;

    const targets = new Set();
    for (let r = 1; r <= 8; r++) {
      for (let f = 0; f < 8; f++) {
        const sq = String.fromCharCode(97 + f) + r;
        const piece = game.board.get(sq);
        if (piece && piece.owner === playerId) {
          game.getLegalMoves(sq).forEach(to => targets.add(to));
        }
      }
    }

    game.forcedPiece = savedForced;
    game.turnIndex   = savedTurn;
    return targets;
  }

  /**
   * Combined threat map for every active opponent of `playerId`.
   */
  function buildOpponentThreatMap(game, playerId) {
    const threats = new Set();
    game.players.forEach(p => {
      if (p.id !== playerId && !p.eliminated) {
        buildThreatMap(game, p.id).forEach(sq => threats.add(sq));
      }
    });
    return threats;
  }

  /**
   * Chebyshev-based board-centre bonus (0.0 – 1.05).
   * Closer to the centre = higher bonus.
   */
  function centerBonus(sq) {
    const f = sq.charCodeAt(0) - 97;           // file  0-7
    const r = parseInt(sq[1], 10) - 1;          // rank  0-7
    const dist = Math.max(Math.abs(f - 3.5), Math.abs(r - 3.5));
    return (3.5 - dist) * 0.3;                  // range  0 – 1.05
  }

  /**
   * Lightweight, reversible move application.
   * Does NOT update hasMoved / king state — suitable only for eval probing.
   */
  function applyMoveTemp(game, from, to) {
    const piece    = game.board.get(from);
    const captured = game.board.get(to);
    game.board.set(to,   piece);
    game.board.set(from, null);
    return { from, to, piece, captured };
  }

  function undoMoveTemp(game, record) {
    game.board.set(record.from, record.piece);
    game.board.set(record.to,   record.captured || null);
  }

  /**
   * Identify the next non-eliminated player after `currentIdx`.
   */
  function nextActivePlayer(game, currentIdx) {
    let idx = (currentIdx + 1) % 4;
    for (let i = 0; i < 4; i++) {
      if (!game.players[idx].eliminated) return idx;
      idx = (idx + 1) % 4;
    }
    return -1;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ELO 200 — Greedy Bot
  // ═══════════════════════════════════════════════════════════════════════════
  /**
   * Strategy: pick the move that captures the most valuable piece.
   * Ties are broken by a small random perturbation (adds variety).
   *
   * Rationale: real novice players immediately grab whatever they can.
   * The bot has zero concept of piece safety or positional value.
   */
  function greedyGetMove(game) {
    const moves = getAllLegalMoves(game);
    if (!moves.length) return null;

    let best = null, bestScore = -Infinity;
    for (const move of moves) {
      const target = game.board.get(move.to);
      const score  = (target ? PIECE_VALUES[target.type] * 10 : 0) + Math.random() * 0.6;
      if (score > bestScore) { bestScore = score; best = move; }
    }
    return best;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ELO 300 — Tactical Bot
  // ═══════════════════════════════════════════════════════════════════════════

  /**
   * Score a single move using tactical heuristics.
   * Used standalone for ELO 300 and as a fast sub-evaluator inside ELO 400.
   */
  function scoreMoveTablet(game, move, opponentThreats) {
    const piece  = game.board.get(move.from);
    const target = game.board.get(move.to);
    let score    = Math.random() * 0.3;   // small noise to break ties

    // ── 1. Material gain from capture ────────────────────────────────────
    if (target) {
      score += PIECE_VALUES[target.type] * 10;
    }

    // ── 2. Positional bonus (board centre) ───────────────────────────────
    score += centerBonus(move.to);

    // ── 3. Hanging-piece penalty ─────────────────────────────────────────
    //   Moving into a square that opponents could recapture.
    if (opponentThreats.has(move.to)) {
      score -= PIECE_VALUES[piece.type] * 6;
      // If we captured something first, partial compensation for the trade.
      if (target) score += PIECE_VALUES[target.type] * 3;
    }

    // ── 4. Escape bonus ───────────────────────────────────────────────────
    //   Moving a threatened piece to safety is actively good.
    if (opponentThreats.has(move.from) && !opponentThreats.has(move.to)) {
      score += PIECE_VALUES[piece.type] * 4;
    }

    // ── 5. King safety ────────────────────────────────────────────────────
    //   Keep the Raja near the edges early; never walk into a threat.
    if (piece.type === 'king') {
      const f       = move.to.charCodeAt(0) - 97;
      const r       = parseInt(move.to[1], 10) - 1;
      const edgeDst = Math.min(f, 7 - f, r, 7 - r);
      score += edgeDst <= 1 ? 1.5 : -1.0;
      if (opponentThreats.has(move.to)) score -= 40;
    }

    return score;
  }

  /**
   * ELO 300 entry point:
   * Build the combined opponent threat map, then pick the highest-scoring move.
   */
  function tacticalGetMove(game) {
    const moves = getAllLegalMoves(game);
    if (!moves.length) return null;

    const opponentThreats = buildOpponentThreatMap(game, game.turnIndex);

    let best = null, bestScore = -Infinity;
    for (const move of moves) {
      const score = scoreMoveTablet(game, move, opponentThreats);
      if (score > bestScore) { bestScore = score; best = move; }
    }
    return best;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ELO 400 — Strategic Bot  (Expectiminimax, depth 1)
  // ═══════════════════════════════════════════════════════════════════════════
  /**
   * Algorithm:
   *   For each candidate move M of the current player P:
   *
   *   a) Apply M temporarily on the board.
   *
   *   b) Threat-creation bonus: count every newly-threatened opponent piece
   *      from the destination square (from-position vs to-position delta).
   *
   *   c) 1-ply opponent response via Expectiminimax:
   *      For each of the 6 dice outcomes (uniform probability 1/6)
   *        → determine opponent's best greedy response
   *        → accumulate expected material loss to our side
   *      This models "on average, how badly will the next player hurt us?"
   *
   *   d) Undo M. Net score = tactical_score(M) + threat_bonus − expected_loss.
   *
   * This gives the bot forward-looking awareness without needing tree search,
   * and handles the dice randomness explicitly via expectation.
   */
  function strategicGetMove(game) {
    const moves = getAllLegalMoves(game);
    if (!moves.length) return null;
    if (moves.length === 1) return moves[0];   // no choice, skip expensive eval

    const playerId        = game.turnIndex;
    const myTeam          = game.players[playerId].team;
    const opponentThreats = buildOpponentThreatMap(game, playerId);
    const nextOppId       = nextActivePlayer(game, playerId);

    let best = null, bestScore = -Infinity;

    for (const move of moves) {
      // ── Base tactical score ─────────────────────────────────────────────
      let score = scoreMoveTablet(game, move, opponentThreats);

      // ── Apply move temporarily ──────────────────────────────────────────
      const piece = game.board.get(move.from);
      const rec   = applyMoveTemp(game, move.from, move.to);

      // ── Threat-creation bonus ───────────────────────────────────────────
      //   After moving, enumerate squares the piece can reach from its new
      //   position (ignoring dice) and award partial value for newly menaced
      //   opponent pieces.
      {
        const savedF = game.forcedPiece, savedT = game.turnIndex;
        game.forcedPiece = 'any';
        game.turnIndex   = playerId;

        game.getLegalMoves(move.to).forEach(nextSq => {
          const threatened = game.board.get(nextSq);
          if (threatened && threatened.owner !== playerId) {
            score += PIECE_VALUES[threatened.type] * 0.9;
          }
        });

        game.forcedPiece = savedF;
        game.turnIndex   = savedT;
      }

      // ── 1-ply expectiminimax: opponent's response ───────────────────────
      if (nextOppId !== -1) {
        let expectedLoss = 0;

        for (let d = 1; d <= 6; d++) {
          const savedF = game.forcedPiece, savedT = game.turnIndex;
          game.forcedPiece = DICE_TO_FORCED[d];
          game.turnIndex   = nextOppId;

          const oppMoves = getAllLegalMoves(game);

          if (oppMoves.length > 0) {
            // Opponent plays greedy: pick best capture for them.
            let oppBestCapture = 0;
            for (const om of oppMoves) {
              const ot = game.board.get(om.to);
              if (!ot) continue;
              const val = PIECE_VALUES[ot.type];
              // Only measure losses that affect our side
              const isOurSide = game.gameMode === 'team'
                ? game.players[ot.owner].team === myTeam
                : ot.owner === playerId;
              if (isOurSide && val > oppBestCapture) oppBestCapture = val;
            }
            // Each dice face has probability 1/6 (2 and 5 both give 'any',
            // so their combined weight is naturally 2/6 — handled correctly).
            expectedLoss += oppBestCapture / 6;
          }

          game.forcedPiece = savedF;
          game.turnIndex   = savedT;
        }

        // Weight the forward-loss penalty — tuned so it doesn't override
        // good immediate captures but deters walking into obvious danger.
        score -= expectedLoss * 5;
      }

      // ── Restore board ───────────────────────────────────────────────────
      undoMoveTemp(game, rec);

      score += Math.random() * 0.15;   // tiny noise for tie-breaking
      if (score > bestScore) { bestScore = score; best = move; }
    }

    return best;
  }


  // ═══════════════════════════════════════════════════════════════════════════
  // ELO 500 — Deep Tactical  (SEE + 2-ply Lookahead + Mobility)
  // ═══════════════════════════════════════════════════════════════════════════

  // ── Promotion helpers ─────────────────────────────────────────────────────

  /**
   * How many steps is this pawn from its promotion rank?
   * Player orientation:
   *   0 (Red)    → moves up  → promotesAt rank 8  (r index 7)
   *   1 (Blue)   → moves left → promotesAt file a (f index 0)
   *   2 (Green)  → moves down → promotesAt rank 1 (r index 0)
   *   3 (Yellow) → moves right → promotesAt file h (f index 7)
   */
  function pawnDistToPromotion(sq, owner) {
    const f = sq.charCodeAt(0) - 97;
    const r = parseInt(sq[1], 10) - 1;
    if (owner === 0) return 7 - r;
    if (owner === 1) return f;
    if (owner === 2) return r;
    if (owner === 3) return 7 - f;
    return 7;
  }

  /**
   * Promotion pressure score for a single pawn.
   * Closer to promotion + unblocked path = higher value.
   */
  function promotionPressure(game, sq, piece) {
    if (piece.type !== 'pawn') return 0;
    const dist = pawnDistToPromotion(sq, piece.owner);
    if (dist === 0) return 0;                        // already promoted
    const base = (7 - dist) * 0.5;                  // 0 – 3.0

    // Partial clearance check: count empty squares directly ahead
    // (just 1–2 squares forward along the pawn's direction)
    const f = sq.charCodeAt(0) - 97;
    const r = parseInt(sq[1], 10) - 1;
    let clearBonus = 0;
    const checks = [];
    if (piece.owner === 0) { if (r+1<8) checks.push([f,r+1]); if (r+2<8) checks.push([f,r+2]); }
    if (piece.owner === 1) { if (f-1>=0) checks.push([f-1,r]); if (f-2>=0) checks.push([f-2,r]); }
    if (piece.owner === 2) { if (r-1>=0) checks.push([f,r-1]); if (r-2>=0) checks.push([f,r-2]); }
    if (piece.owner === 3) { if (f+1<8) checks.push([f+1,r]); if (f+2<8) checks.push([f+2,r]); }
    for (const [cf, cr] of checks) {
      const ahead = game.board.get(String.fromCharCode(97+cf) + (cr+1));
      if (!ahead) clearBonus += 0.3;
    }

    return base + clearBonus;
  }

  // ── Static Exchange Evaluation (SEE) ──────────────────────────────────────
  /**
   * Evaluates the complete capture-recapture chain on `toSq`.
   * Returns the net material gain for the moving player.
   *
   * Algorithm:
   *   1. Start with gain = value of piece on toSq.
   *   2. All players who can recapture on toSq take turns taking the
   *      smallest-value attacker available (Least Valuable Attacker).
   *   3. Each side decides whether to continue or stop based on
   *      accumulated gain.
   *
   * We model this without actually modifying the board: we track which
   * pieces have been "used" in the exchange via a Set of squares.
   *
   * Returns: positive = good trade, negative = losing trade, 0 = even.
   */
  function see(game, fromSq, toSq, movingPiece) {
    const captured = game.board.get(toSq);
    if (!captured) return 0;

    // Build attacker lists per player: [{sq, value}] sorted LVA (ascending)
    function getAttackers(excludeSet) {
      const attackers = [[], [], [], []];
      const savedF = game.forcedPiece, savedT = game.turnIndex;
      for (let pid = 0; pid < 4; pid++) {
        if (game.players[pid].eliminated) continue;
        game.forcedPiece = 'any';
        game.turnIndex   = pid;
        for (let r = 1; r <= 8; r++) {
          for (let fi = 0; fi < 8; fi++) {
            const sq = String.fromCharCode(97 + fi) + r;
            if (excludeSet.has(sq)) continue;
            const p = game.board.get(sq);
            if (!p || p.owner !== pid) continue;
            const legalDests = game.getLegalMoves(sq);
            if (legalDests.includes(toSq)) {
              attackers[pid].push({ sq, value: PIECE_VALUES[p.type] });
            }
          }
        }
        attackers[pid].sort((a, b) => a.value - b.value);  // LVA first
      }
      game.forcedPiece = savedF;
      game.turnIndex   = savedT;
      return attackers;
    }

    // SEE simulation
    const used    = new Set([fromSq]);
    let gain      = PIECE_VALUES[captured.type];
    let sideGain  = gain;
    let lastValue = PIECE_VALUES[movingPiece.type];

    // Determine turn order starting from next player after mover
    let pid = (movingPiece.owner + 1) % 4;
    const MAX_ROUNDS = 8;
    for (let round = 0; round < MAX_ROUNDS; round++) {
      if (game.players[pid].eliminated) { pid = (pid + 1) % 4; continue; }
      const attackers = getAttackers(used);
      const avail     = attackers[pid];
      if (!avail.length) { pid = (pid + 1) % 4; continue; }

      const lva = avail[0];
      used.add(lva.sq);

      // Stop if recapturing would lose more than gained
      const newGain = lastValue - sideGain;
      if (pid !== movingPiece.owner) {
        sideGain = Math.max(sideGain, lastValue);
      } else {
        gain += newGain;
        sideGain = newGain;
      }
      lastValue = lva.value;
      pid = (pid + 1) % 4;
    }
    return gain;
  }

  // ── Mobility scorer ───────────────────────────────────────────────────────
  /**
   * Count total squares reachable by all pieces belonging to `playerId`.
   * Uses 'any' forced piece to ignore dice constraint.
   */
  function computeMobility(game, playerId) {
    const savedF = game.forcedPiece, savedT = game.turnIndex;
    game.forcedPiece = 'any';
    game.turnIndex   = playerId;
    let count = 0;
    for (let r = 1; r <= 8; r++) {
      for (let f = 0; f < 8; f++) {
        const sq = String.fromCharCode(97 + f) + r;
        const p  = game.board.get(sq);
        if (p && p.owner === playerId) {
          count += game.getLegalMoves(sq).length;
        }
      }
    }
    game.forcedPiece = savedF;
    game.turnIndex   = savedT;
    return count;
  }

  // ── 2-ply static evaluator (used inside ELO 500 lookahead) ───────────────
  /**
   * Evaluate the board from `playerId`'s perspective after a position has
   * been reached. Returns a numeric score. Higher = better for playerId.
   */
  function staticEval500(game, playerId) {
    const myTeam = game.players[playerId].team;
    let score = 0;

    for (let r = 1; r <= 8; r++) {
      for (let f = 0; f < 8; f++) {
        const sq    = String.fromCharCode(97 + f) + r;
        const piece = game.board.get(sq);
        if (!piece) continue;

        const isAlly = game.gameMode === 'team'
          ? game.players[piece.owner].team === myTeam
          : piece.owner === playerId;
        const sign  = isAlly ? 1 : -1;
        const pval  = PIECE_VALUES[piece.type];

        score += sign * pval * 10;
        score += sign * centerBonus(sq);
        score += sign * promotionPressure(game, sq, piece);
      }
    }

    // Mobility delta (our mobility minus average opponent mobility)
    const myMob = computeMobility(game, playerId);
    let oppMobSum = 0, oppCount = 0;
    for (const p of game.players) {
      if (p.id !== playerId && !p.eliminated) {
        oppMobSum += computeMobility(game, p.id);
        oppCount++;
      }
    }
    const avgOppMob = oppCount > 0 ? oppMobSum / oppCount : 0;
    score += (myMob - avgOppMob) * 0.15;

    return score;
  }

  // ── ELO 500 main ─────────────────────────────────────────────────────────
  function deepTacticalGetMove(game) {
    const moves = getAllLegalMoves(game);
    if (!moves.length) return null;
    if (moves.length === 1) return moves[0];

    const playerId        = game.turnIndex;
    const myTeam          = game.players[playerId].team;
    const opponentThreats = buildOpponentThreatMap(game, playerId);
    const nextOppId       = nextActivePlayer(game, playerId);

    let best = null, bestScore = -Infinity;

    for (const move of moves) {
      // ── Base tactical score ─────────────────────────────────────────────
      let score = scoreMoveTablet(game, move, opponentThreats);

      const piece  = game.board.get(move.from);
      const target = game.board.get(move.to);

      // ── SEE: is this capture actually winning? ──────────────────────────
      if (target) {
        const seeVal = see(game, move.from, move.to, piece);
        if (seeVal < 0) {
          // Losing trade — apply penalty proportional to the loss
          score += seeVal * 4;
        } else {
          // Winning trade — extra reward beyond material already counted
          score += seeVal * 1.5;
        }
      }

      // ── Apply move to probe deeper state ───────────────────────────────
      const rec = applyMoveTemp(game, move.from, move.to);

      // ── Mobility improvement ────────────────────────────────────────────
      const mobAfter = computeMobility(game, playerId);
      score += mobAfter * 0.12;

      // ── Promotion pressure after move ───────────────────────────────────
      {
        const p = game.board.get(move.to);
        if (p) score += promotionPressure(game, move.to, p) * 2;
      }

      // ── 2-ply lookahead: opponent's best tactical response ──────────────
      if (nextOppId !== -1) {
        let expectedPositionScore = 0;

        for (let d = 1; d <= 6; d++) {
          const savedF = game.forcedPiece, savedT = game.turnIndex;
          game.forcedPiece = DICE_TO_FORCED[d];
          game.turnIndex   = nextOppId;

          const oppMoves = getAllLegalMoves(game);
          let oppBestScore = -Infinity;
          let oppBestRec   = null;

          for (const om of oppMoves) {
            const oppPiece  = game.board.get(om.from);
            const oppTarget = game.board.get(om.to);
            let omScore = oppTarget ? PIECE_VALUES[oppTarget.type] * 10 : 0;

            // Opp SEE
            if (oppTarget) {
              const oppSee = see(game, om.from, om.to, oppPiece);
              if (oppSee < 0) omScore -= Math.abs(oppSee) * 3;
              else            omScore += oppSee;
            }

            if (omScore > oppBestScore) {
              oppBestScore = omScore;
              oppBestRec   = { move: om, piece: oppPiece, captured: oppTarget };
            }
          }

          // Apply opponent's best move and evaluate resulting position
          let positionScore = 0;
          if (oppBestRec) {
            const oppRec = applyMoveTemp(game, oppBestRec.move.from, oppBestRec.move.to);
            positionScore = staticEval500(game, playerId);
            undoMoveTemp(game, oppRec);
          } else {
            positionScore = staticEval500(game, playerId);
          }

          expectedPositionScore += positionScore / 6;

          game.forcedPiece = savedF;
          game.turnIndex   = savedT;
        }

        // Blend immediate tactical score with forward position quality
        score = score * 0.6 + expectedPositionScore * 0.4;
      }

      undoMoveTemp(game, rec);

      score += Math.random() * 0.1;
      if (score > bestScore) { bestScore = score; best = move; }
    }

    return best;
  }


  // ═══════════════════════════════════════════════════════════════════════════
  // ELO 600 — Paranoid Strategist
  // ═══════════════════════════════════════════════════════════════════════════
  //
  // The Paranoid Algorithm for multi-player games:
  //   "Assume all opponents are playing cooperatively to minimise YOUR score."
  //
  // Search structure (per candidate move of ours):
  //   Our move  →  Opp-1 best response (averaged over 6 dice)
  //             →  Opp-2 best response (averaged over 6 dice)
  //             →  Opp-3 best response (averaged over 6 dice)
  //             →  Evaluate position with richEval600()
  //
  // Per-opponent branching is bounded to a SINGLE best move per dice face
  // (rather than full tree expansion) to keep browser performance acceptable.
  // The dice expectation is handled explicitly at each level.
  //
  // ─────────────────────────────────────────────────────────────────────────

  // ── Rich static evaluator (ELO 600) ─────────────────────────────────────
  /**
   * Full-featured position evaluation from `playerId`'s perspective.
   *
   * Terms:
   *   Material        — standard piece values × 10
   *   Mobility        — total reachable squares (ours minus avg opponent)
   *   Promotion       — pawn advancement / promotion pressure
   *   King Exposure   — penalty for squares adjacent to our king that are attacked
   *   Piece Coordination — bonus for pieces that defend each other
   *   Rook Open File  — bonus when a rook has no pawns on its file
   *   Endgame Factor  — scale coordination/exposure when few pieces remain
   */
  function richEval600(game, playerId) {
    const myTeam  = game.players[playerId].team;
    let score     = 0;

    // Count total pieces (endgame detection)
    let totalPieces = 0;
    for (let r = 1; r <= 8; r++)
      for (let f = 0; f < 8; f++)
        if (game.board.get(String.fromCharCode(97+f)+r)) totalPieces++;
    // Endgame = fewer than 14 pieces on board (was 32 at start minus 2 kings = 30)
    const endgameFactor = totalPieces < 14 ? 2.0 : totalPieces < 22 ? 1.3 : 1.0;

    // Per-piece terms
    for (let r = 1; r <= 8; r++) {
      for (let f = 0; f < 8; f++) {
        const sq    = String.fromCharCode(97 + f) + r;
        const piece = game.board.get(sq);
        if (!piece) continue;

        const isAlly = game.gameMode === 'team'
          ? game.players[piece.owner].team === myTeam
          : piece.owner === playerId;
        const sign  = isAlly ? 1 : -1;

        // Material
        score += sign * PIECE_VALUES[piece.type] * 10;

        // Centre proximity
        score += sign * centerBonus(sq) * 0.8;

        // Promotion pressure (ally pawns)
        if (isAlly && piece.type === 'pawn') {
          score += promotionPressure(game, sq, piece) * 1.8 * endgameFactor;
        }

        // Rook open-file bonus (ally rooks)
        if (isAlly && piece.type === 'rook') {
          let fileOpen = true;
          for (let rr = 1; rr <= 8; rr++) {
            const fSq = String.fromCharCode(97 + f) + rr;
            const fp  = game.board.get(fSq);
            if (fp && fp.type === 'pawn') { fileOpen = false; break; }
          }
          if (fileOpen) score += 1.5;
        }
      }
    }

    // ── Mobility (ours vs average opponent) ─────────────────────────────
    const myMob = computeMobility(game, playerId);
    let oppMobSum = 0, oppCount = 0;
    for (const p of game.players) {
      if (!p.eliminated && p.id !== playerId) {
        oppMobSum += computeMobility(game, p.id);
        oppCount++;
      }
    }
    score += (myMob - (oppCount ? oppMobSum / oppCount : 0)) * 0.2;

    // ── King Exposure (count attacked squares adjacent to our king) ───────
    {
      const opThreats = buildOpponentThreatMap(game, playerId);
      // Find our king
      for (let r = 1; r <= 8; r++) {
        for (let f = 0; f < 8; f++) {
          const sq    = String.fromCharCode(97 + f) + r;
          const piece = game.board.get(sq);
          if (!piece || piece.type !== 'king') continue;
          const isAlly = game.gameMode === 'team'
            ? game.players[piece.owner].team === myTeam
            : piece.owner === playerId;
          if (!isAlly) continue;

          let exposed = 0;
          for (let df = -1; df <= 1; df++) {
            for (let dr = -1; dr <= 1; dr++) {
              if (df===0&&dr===0) continue;
              const nf = f + df, nr = r + dr;
              if (nf<0||nf>7||nr<0||nr>7) continue;
              const nsq = String.fromCharCode(97+nf) + (nr+1);
              if (opThreats.has(nsq)) exposed++;
            }
          }
          score -= exposed * 1.5 * endgameFactor;
        }
      }
    }

    // ── Piece Coordination ────────────────────────────────────────────────
    // Bonus when an ally piece can reach a square occupied by another ally
    // (i.e., it defends that ally). Captures only non-own pieces legally,
    // but we count squares reachable as "covering" — a coordination proxy.
    {
      const savedF = game.forcedPiece, savedT = game.turnIndex;
      game.forcedPiece = 'any';

      for (const p of game.players) {
        const isAlly = game.gameMode === 'team'
          ? p.team === myTeam
          : p.id === playerId;
        if (!isAlly || p.eliminated) continue;

        game.turnIndex = p.id;
        for (let r = 1; r <= 8; r++) {
          for (let f = 0; f < 8; f++) {
            const sq    = String.fromCharCode(97 + f) + r;
            const piece = game.board.get(sq);
            if (!piece || piece.owner !== p.id) continue;
            // For each square this piece could move to, give tiny bonus if
            // another ally piece sits there (defender chain).
            game.getLegalMoves(sq).forEach(dest => {
              const dp = game.board.get(dest);
              if (dp && game.players[dp.owner].team === p.team) {
                score += 0.15;
              }
            });
          }
        }
      }

      game.forcedPiece = savedF;
      game.turnIndex   = savedT;
    }

    return score;
  }

  /**
   * Returns the best (highest-scoring) tactical move for `oppId`
   * with the given dice forced piece, or null if no moves.
   * Uses ELO 400-style tactical scoring for speed.
   */
  function getBestOppMove(game, oppId, forced) {
    const savedF = game.forcedPiece, savedT = game.turnIndex;
    game.forcedPiece = forced;
    game.turnIndex   = oppId;

    const oppMoves = getAllLegalMoves(game);
    const opThreats = buildOpponentThreatMap(game, oppId);

    let best = null, bestScore = -Infinity;
    for (const om of oppMoves) {
      let s = scoreMoveTablet(game, om, opThreats);
      // SEE for captures
      const oppPiece  = game.board.get(om.from);
      const oppTarget = game.board.get(om.to);
      if (oppTarget) {
        const sv = see(game, om.from, om.to, oppPiece);
        s += sv * 2;
      }
      if (s > bestScore) { bestScore = s; best = om; }
    }

    game.forcedPiece = savedF;
    game.turnIndex   = savedT;
    return best;
  }

  /**
   * Simulate one opponent's turn (expected-value over 6 dice),
   * apply their best move for each face, then invoke `continuation()`
   * to evaluate. Returns the average score across all 6 dice outcomes.
   *
   * @param {Game}     game         current game state (modified in place, restored)
   * @param {number}   oppId        opponent player index
   * @param {Function} continuation () => number — deeper evaluation
   */
  function simulateOppTurnExpected(game, oppId, continuation) {
    if (game.players[oppId].eliminated) return continuation();

    let expectedScore = 0;
    for (let d = 1; d <= 6; d++) {
      const forced = DICE_TO_FORCED[d];
      const oppMove = getBestOppMove(game, oppId, forced);

      let rec = null;
      if (oppMove) rec = applyMoveTemp(game, oppMove.from, oppMove.to);

      expectedScore += continuation() / 6;

      if (rec) undoMoveTemp(game, rec);
    }
    return expectedScore;
  }

  // ── ELO 600 main ─────────────────────────────────────────────────────────
  function paranoidGetMove(game) {
    const moves = getAllLegalMoves(game);
    if (!moves.length) return null;
    if (moves.length === 1) return moves[0];

    const playerId = game.turnIndex;

    // Determine the 3 opponents in turn order (paranoid: all against us)
    const oppSequence = [];
    let idx = (playerId + 1) % 4;
    for (let i = 0; i < 3; i++) {
      oppSequence.push(idx);
      idx = (idx + 1) % 4;
    }
    // Skip eliminated opponents
    const activeOpps = oppSequence.filter(id => !game.players[id].eliminated);

    let best = null, bestScore = -Infinity;

    for (const move of moves) {
      const piece  = game.board.get(move.from);
      const target = game.board.get(move.to);

      // ── Immediate SEE check ────────────────────────────────────────────
      let seeBonus = 0;
      if (target) {
        seeBonus = see(game, move.from, move.to, piece);
      }

      // ── Apply our move ─────────────────────────────────────────────────
      const rec = applyMoveTemp(game, move.from, move.to);

      // ── Paranoid simulation: opponents respond in sequence ─────────────
      //   Each opponent plays their best expected-value tactical move.
      //   We chain simulateOppTurnExpected for each active opponent.
      //
      //   Final leaf: richEval600(game, playerId)
      //
      //   With 3 opponents this creates:
      //     6 (opp1 dice) × 6 (opp2 dice) × 6 (opp3 dice) = 216 leaf evals
      //   per candidate move — acceptable in-browser.

      let paranoidScore;

      if (activeOpps.length === 0) {
        paranoidScore = richEval600(game, playerId);
      } else if (activeOpps.length === 1) {
        paranoidScore = simulateOppTurnExpected(game, activeOpps[0], () =>
          richEval600(game, playerId)
        );
      } else if (activeOpps.length === 2) {
        paranoidScore = simulateOppTurnExpected(game, activeOpps[0], () =>
          simulateOppTurnExpected(game, activeOpps[1], () =>
            richEval600(game, playerId)
          )
        );
      } else {
        paranoidScore = simulateOppTurnExpected(game, activeOpps[0], () =>
          simulateOppTurnExpected(game, activeOpps[1], () =>
            simulateOppTurnExpected(game, activeOpps[2], () =>
              richEval600(game, playerId)
            )
          )
        );
      }

      undoMoveTemp(game, rec);

      // ── Blend immediate material + SEE with paranoid position score ────
      const immediateVal = (target ? PIECE_VALUES[target.type] * 10 : 0)
                           + seeBonus * 3;
      const finalScore   = immediateVal * 0.35 + paranoidScore * 0.65
                           + Math.random() * 0.08;

      if (finalScore > bestScore) { bestScore = finalScore; best = move; }
    }

    return best;
  }


  // ══════════════════════════════════════════════════════════════════════════
  // Public API
  // ══════════════════════════════════════════════════════════════════════════
  (typeof window !== 'undefined' ? window : self).ChaturangaTieredBot = {
    /**
     * Returns a move object { from, to } or null.
     *
     * @param {Game}   game      Live Game instance (dice already rolled)
     * @param {number} eloLevel  100 | 200 | 300 | 400 | 500 | 600
     */
    getMove(game, eloLevel) {
      if (!game || game.gameOver || !game.forcedPiece) return null;
      switch (eloLevel) {
        case 200: return greedyGetMove(game);
        case 300: return tacticalGetMove(game);
        case 400: return strategicGetMove(game);
        case 500: return deepTacticalGetMove(game);
        case 600: return paranoidGetMove(game);
        case 100:
        default:
          const randomBot = (typeof window !== 'undefined' ? window : self).ChaturangaRandomBot;
          return randomBot
            ? randomBot.getMove(game, game.turnIndex)
            : null;
      }
    },

    // Expose internals for benchmark runner / testing
    _getAllLegalMoves:   getAllLegalMoves,
    _buildThreatMap:    buildThreatMap,
    _applyMoveTemp:     applyMoveTemp,
    _undoMoveTemp:      undoMoveTemp,
    _nextActivePlayer:  nextActivePlayer,
    _PIECE_VALUES:      PIECE_VALUES,
    _see:               see,
    _computeMobility:   computeMobility,
    _richEval600:       richEval600
  };

})();
