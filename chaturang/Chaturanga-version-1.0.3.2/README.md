# Chaturanga — Version 1.0.3.2 🐘♟️
### *Higher ELO Bots Edition*

> **Based on:** [Chaturanga v1.0.3](https://github.com/Pratyush117799/chaturang/tree/master/Chaturanga%20version%201.0.3)  
> **New features:** 4-tier AI bot system with real game-tree search intelligence

---

## What's New in v1.0.3.2

Version 1.0.3.2 is a focused bot-intelligence upgrade. The rules, board, and visual game experience are identical to v1.0.3. What changed is what happens under the hood when it's the bot's turn.

| Version | Bot Type | Technique | Approx. ELO |
|---------|----------|-----------|-------------|
| v1.0.3 | Single bot | Basic / random | ~400 |
| v1.0.3.2 | **4 tiers** | Random → Minimax + Quiescence | **~400–1600+** |

---

## Files in This Repository

```
Chaturanga-version-1.0.3.2-higher-elo-bots/
├── game.html          ← Play the game (start here)
├── tieredBots.js      ← AI engine — 4 difficulty tiers
├── ui.js              ← UI logic + difficulty selector
└── benchmark.html     ← Bot-vs-bot automated tester
```

---

## How to Play

1. **Download or clone this repository.**
2. Open `game.html` in any modern browser (Chrome, Firefox, Edge).
3. Select your **difficulty level** from the dropdown before starting.
4. Play as Player 1 against the bot.

No server required. No dependencies. Pure HTML + JavaScript.

---

## Bot Difficulty Tiers

### 🟢 Tier 1 — Novice
**Algorithm:** Random move selection  
The bot picks any legal move at random. Great for learning the rules or
warming up. You should be able to beat this tier consistently after a few games.

---

### 🟡 Tier 2 — Apprentice
**Algorithm:** Greedy one-ply evaluation  
The bot looks one move ahead and always picks the move that captures the
most valuable piece. If no captures are available, it moves randomly. It
has no foresight — it will walk into traps — but it will never pass up a
free piece.

---

### 🟠 Tier 3 — Warrior
**Algorithm:** Minimax with alpha-beta pruning (depth 3)  
The bot searches 3 half-moves (plies) into the future and picks the move
that leads to the best position under the assumption that you will also
play well. It uses:

- **Material evaluation** — sums up piece values for both sides.
- **Positional bonuses** — rewards control of central squares and active pieces.
- **Alpha-beta pruning** — skips branches that cannot affect the outcome,
  making the search fast enough to run in the browser.
- **Move ordering** — tries captures first for better pruning efficiency.

This tier will not blunder pieces and will set up simple traps.

---

### 🔴 Tier 4 — Champion
**Algorithm:** Minimax + alpha-beta + quiescence search (depth 4–5)  
The strongest bot. It uses everything Warrior does, plus:

- **Deeper search (depth 4–5):** Sees further into the game, catching
  multi-move combinations Warrior misses.
- **Piece-square tables:** Each piece type has a bonus table that rewards
  good squares — e.g. cavalry prefers the center, chariots prefer open ranks.
- **Quiescence search:** After the main search depth is reached, the bot
  continues to search capture-only moves until the position is "quiet." This
  prevents the bot from stopping its analysis right before a damaging recapture.

Expect Champion to feel like a real opponent. It plays strategic openings,
avoids tactical blunders, and punishes mistakes.

> ⏳ Champion may take up to 500ms per move on older hardware. A "Bot is
> thinking..." indicator will appear during computation.

---

## Benchmarking

Open `benchmark.html` to run automated bot-vs-bot games.

- Choose **Bot A** and **Bot B** difficulty tiers.
- Set the number of games (10–100 recommended).
- Click **Run Benchmark**.
- Results show win rate and average move time for each tier.

Expected results:
- Apprentice beats Novice ~90% of games.
- Warrior beats Apprentice ~80% of games.
- Champion beats Warrior ~70% of games.

---

## How the AI Works (Technical Summary)

The entire AI lives in `tieredBots.js`. It exposes a single public function:

```javascript
getBotMove(board, player, tier)
// board  — current game state (same format as v1.0.3)
// player — which side the bot is playing
// tier   — 'novice' | 'apprentice' | 'warrior' | 'champion'
// returns a Move object (same format as v1.0.3 legal moves)
```

The function routes to one of four internal bot implementations based on
the tier. All bots call the same `generateLegalMoves()` and `applyMove()`
functions that power the v1.0.3 game — so the bot always plays by the
correct Chaturanga rules.

### Minimax in plain English

The minimax algorithm builds a tree of possible future game states. At each
node the bot simulates a move, then imagines the opponent responds with
their best move, then responds again — and so on up to a fixed depth. At
the bottom of the tree, positions are scored by a fast evaluation function
(counting pieces + positional bonuses). The bot picks the path that leads
to the highest score for itself, assuming the opponent always picks the
lowest score for the bot (hence "minimax").

Alpha-beta pruning makes this practical: if the bot finds that a branch
cannot possibly be better than one it already examined, it stops searching
that branch early. This allows depth-4 search in the browser without freezing.

---

## Version History

| Version | Summary |
|---------|---------|
| v1.0.0 | Initial Chaturanga prototype |
| v1.0.1 | Bug fixes, improved board UI |
| v1.0.2 | Added basic single-player bot (random) |
| v1.0.3 | Polished UI, sound effects, improved rules enforcement |
| **v1.0.3.2** | **4-tier AI bot system — higher ELO bots** |

---

## Chaturanga Rules (Quick Reference)

Chaturanga is the ancient Indian predecessor of chess, played on an 8×8 board.

| Piece | Ancient Name | Moves Like |
|-------|-------------|------------|
| King | Raja | One square any direction |
| Advisor / Minister | Mantri | One square diagonally |
| Elephant | Gaja | Two squares diagonally, jumping |
| Horse / Cavalry | Ashva | L-shape (like chess knight) |
| Chariot | Ratha | Any number of squares in a straight line (like chess rook) |
| Pawn | Padàti | One square forward, captures diagonally forward |

> Note: Rules in this game follow the v1.0.3 implementation.
> See `rules.txt` in the main repository for the full rule set.

---

## Development

### Integrating tieredBots.js into your own build

1. Copy `tieredBots.js` into your project.
2. Include it before your UI script in HTML:
   ```html
   <script src="tieredBots.js"></script>
   <script src="ui.js"></script>
   ```
3. Call `getBotMove(board, player, tier)` whenever it is the bot's turn.
4. Apply the returned move using your existing `applyMove()` function.

### Running on a local server (optional)

```bash
# Python 3
python -m http.server 8080
# Then open http://localhost:8080/game.html
```

---

## Contributing

Pull requests are welcome! If you want to improve the Champion bot, the best
areas to focus on are:

- Better piece-square tables tuned for Chaturanga (not standard chess).
- An opening book of strong first moves.
- Iterative deepening so the bot can search deeper when time allows.
- A transposition table to avoid re-evaluating the same position twice.

---

## License

This project is an extension of the Chaturanga v1.0.3 codebase. Please
refer to the original repository for licensing information.

---

*Chaturanga — Ancient game. Modern intelligence.*
