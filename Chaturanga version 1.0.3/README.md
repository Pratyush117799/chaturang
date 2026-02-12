# Chaturanga 1.0.3

Chaturaji (4-player) with 1.0.3 rules, focus mode, resizable board, manual forfeit cap, Play Computer (1 bot), auth/homepage/guest, and optional backend for game history.

## Features

- **Rules:** Minor cannot capture Minor; Major can capture any; Raja cannot capture Raja. Max 3 manual forfeits per player.
- **Focus mode:** Toggle to show only board, dice strip, and captured pieces.
- **Resizable board:** 80%–120% via slider; persisted in localStorage.
- **Play Computer:** Check "Play vs computer (Blue)" to play vs bot. Open from homepage or `game.html?mode=computer`.
- **Homepage:** `homepage.html` — login/signup (client-side stub), Remember me, guest link, Play Online (coming soon), Play Computer.
- **Backend:** Optional. Run `cd server && npm install && npm start`. API: `POST /api/games` (body: `{ history, winner, winnerPlayerId, gameMode, players }`), `GET /api/games`, `GET /api/games/:id`. Winner folder: `database/winners/teamN/` and `playerN/`.

## How to run

1. **Frontend only:** Open `index.html` or `homepage.html` or `game.html` in a browser (or use a local server to avoid CORS).
2. **With backend:** `cd server && npm install && npm start` then open `http://localhost:3000` (serves the project root).

## File structure

- `game.html` — main game UI
- `homepage.html` — landing with login and Play options
- `index.html` — redirects to homepage or game
- `js/game.js` — core game (1.0.3 rules, forfeit cap)
- `js/ui.js` — focus mode, board size, forfeit display, bot turn
- `js/auth.js`, `js/homepage.js` — auth and routing
- `engine/` — randomMoveGenerator, gameState, rules
- `js/bot/` — randomMove, heuristicBot stub, ai/stub.js
- `planning/` — PLAN.md, FILE_STRUCTURE.md, RULES_AND_MATRIX.md, BOT_ENGINE.md
- `server/` — Express app, routes/auth, routes/games, in-memory DB and winner folder

## Copy from 1.0.2

This version copies structure from Chaturanga 1.0.2 (css, js, images, database). No files under 1.0.2 were modified.
