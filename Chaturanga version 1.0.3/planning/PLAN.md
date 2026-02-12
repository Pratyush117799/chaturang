# Chaturanga 1.0.3 — Plan Summary

## Scope

- Copy full game structure from 1.0.2 into 1.0.3 (no changes to 1.0.2).
- Fix kill matrix: Minor cannot capture Minor; Major can capture any; Raja cannot capture Raja.
- Max 3 manual forfeits per player; auto-forfeit when no legal move does not count.
- Focus Mode: hide header and side panels; show only board, dice strip, captured pieces.
- Resizable Board: CSS variable `--board-scale` (80%–120%); persisted in localStorage.
- Engine + random bot for Play Computer (1–3 bots).
- Auth + Homepage: login/signup, remember me, guest; Play Online / Play Computer.
- Backend: minimal server for auth and game history; winner folder storage.
- 2–3 bots and 4-bot admin mode with safe AI stubs.

## Implementation Order

1. Copy 1.0.2 into 1.0.3 — Done
2. planning/ docs — Done
3. Rules and forfeit in game.js — Done
4. Focus mode and resizable board — Done
5. Engine + random bot — In progress
6. Auth + Homepage
7. Backend
8. Multi-bot and 4-bot admin

## Key Files

- `game.html` — Main game UI (from 1.0.2 index, extended).
- `js/game.js` — Core game; Piece, canCapture, manualForfeitCount, recordForfeit(isManual).
- `js/ui.js` — Focus mode, board size, forfeit count display.
- `engine/` — gameState, rules, randomMoveGenerator.
- `js/bot/` — Bot API, randomMove, heuristicBot, ai stubs.
