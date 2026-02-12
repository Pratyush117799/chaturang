# Chaturanga 1.0.3 — File Structure

## Target Layout

```
Chaturanga version 1.0.3/
├── index.html           # Entry: redirect to homepage or game
├── homepage.html        # Homepage with side login, Play Online / Play Computer, guest
├── game.html            # Main game UI
├── css/
│   ├── styles.css       # Base + focus mode, board scale, forfeit-count
│   ├── animations.css
│   └── auth.css         # Auth and homepage (when added)
├── js/
│   ├── game.js          # Core game (1.0.3 rules, manual forfeit cap)
│   ├── dice.js
│   ├── ui.js            # Board UI, focus mode, resizable board
│   ├── auth.js          # Login, signup, remember me, guest (when added)
│   ├── homepage.js      # Homepage routing (when added)
│   └── bot/
│       ├── index.js     # Bot API: getMove(gameState, playerId, options)
│       ├── randomMove.js
│       ├── heuristicBot.js
│       └── ai/          # Stubs for minimax, MCTS, etc.
├── engine/
│   ├── gameState.js     # Serializable state for bot/replay
│   ├── rules.js         # Kill matrix, legal moves (optional extraction)
│   └── randomMoveGenerator.js
├── server/
│   ├── package.json
│   ├── server.js
│   ├── db/
│   └── routes/
├── database/
│   ├── README.md
│   └── winners/         # Server-side winner storage
├── planning/
│   ├── PLAN.md
│   ├── FILE_STRUCTURE.md
│   ├── RULES_AND_MATRIX.md
│   └── BOT_ENGINE.md
├── docs/
├── new_features.json
├── random_move_generator.json
└── Algorithm.json
```

## Responsibilities

- **game.js**: Piece (isMinor, isMajor), Board, Game (rollDice, getLegalMoves, makeMove, forfeitTurn, recordForfeit(manual)), manualForfeitCount per player.
- **ui.js**: Render board, focus mode toggle, board size slider, forfeit count display, forfeit button disable at limit.
- **engine/**: Pure logic for bot and replay; dice → piece, find pieces, legal moves, random/heuristic move choice.
- **js/bot/**: getMove(game, playerId) → { from, to } or null; uses game.getLegalMoves, game.makeMove.
