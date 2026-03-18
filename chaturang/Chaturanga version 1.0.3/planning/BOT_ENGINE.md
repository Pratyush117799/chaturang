# Chaturanga 1.0.3 — Bot Engine

## Pipeline (from random_move_generator.json)

1. **Roll dice** — get value 1–6.
2. **Get forced piece type** — diceToPiece(d): rook, horse, elephant, pawn-king, any.
3. **Find pieces** — all squares where current player has a piece of that type.
4. **Get legal moves** — for each such piece, getLegalMoves(square); collect { from, to } list.
5. **Choose move** — random or heuristic (prefer capture, avoid hang, etc.).
6. **Return** — { from, to } or null if no move.

## Web Integration (JS)

- `rollDice()` — 1–6.
- `getPieceType(d)` — dice value → piece type.
- `findPieces(game, playerId, pieceType)` — list of squares.
- `getLegalMoves(game, square)` — delegate to game.getLegalMoves(square).
- `makeRandomMove(game)` — one random legal move for current turn; returns { from, to } or null.
- `getMove(game, playerId, options)` — main bot API; uses game state (forcedPiece, turnIndex) to pick move.

## Bot Modes

- **1 bot:** One player is bot; when turnIndex is bot, call getMove after delay and apply move.
- **2–3 bots:** Multiple seats marked as bot; same loop.
- **4 bots (admin):** All four players are bots; spectate mode; loop until game over. Advanced AI (minimax, MCTS, etc.) can be stubbed in `js/bot/ai/` and plugged in later; engine must not crash if missing.

## Safety

- Bot must only return moves that are legal (present in getLegalMoves). Never mutate game state inside engine; UI applies move via game.makeMove(from, to).

## 2-3 Bots and 4-Bot Admin

- **2-3 bots:** Extend UI to allow multiple bot players (e.g. checkboxes for Blue, Green, Yellow). When turnIndex is in botPlayerIds, use same flow: roll then getMove and makeMove. Team concepts respected (e.g. 2 bots on one team vs 2 humans).
- **4 bots (admin):** Separate mode or flag "Spectate 4 bots". No human moves; loop: for each player roll, getMove, makeMove until game over. Advanced algorithms (minimax, MCTS, etc.) are stubbed in js/bot/ai/stub.js; plug in later without crashing.
