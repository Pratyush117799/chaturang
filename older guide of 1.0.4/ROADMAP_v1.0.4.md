# Chaturanga v1.0.4 — Detailed Roadmap

> **Status**: Planning Phase | **Target**: After v1.0.3.3 stable release  
> **Theme**: From Game to Platform — Puzzles, Lessons, Tournaments, and a smarter AI

---

## 1. 🧩 Puzzles System

### Concept
Tactical positions extracted from real bot-vs-bot game logs. The player is given a specific position and must find the optimal move sequence within a limited number of moves.

### Features
- **Puzzle Library**: 50+ curated puzzles at launch (Beginner → Expert)
- **Puzzle Types**:
  - *Win in 2* — Capture an enemy Raja in 2 dice rolls
  - *Save the Raja* — Escape from a dangerous position
  - *Ratha Hunt* — Capture a Ratha with a minor piece sequence
  - *Stalemate Trap* — Force an opponent into stalemate to win
- **Puzzle Rating**: Each puzzle has an ELO difficulty rating (100–800)
- **Streak System**: Solve X consecutive puzzles for a multiplier bonus
- **localStorage Progress**: Puzzle completion and ratings persisted locally
- **Hint System**: 2 hints per puzzle (arrow overlay showing candidate squares)

### Technical Plan
```
puzzles/
  puzzle-data.js    ← JSON array of { id, title, fen, solution[], rating, type }
  puzzle-engine.js  ← validates solution, calculates partial credit
  puzzle-ui.js      ← renders board in fixed state, solution input, hint reveal
puzzles.html        ← Puzzle browser + interactive puzzle board
```

---

## 2. 📚 Lessons Module

### Concept
Guided, scriptable tutorials that walk a player through game concepts step by step, with a "co-pilot" bot that follows a predefined move script.

### Lesson Categories

| Module | Lessons |
|--------|---------|
| **Basics** | Board orientation, piece movements, dice |
| **Opening** | Control of center, piece development priority |
| **Tactics** | Ratha pin, Ashwa fork, Danti leap attacks |
| **Endgame** | King vs King, Ratha advantage technique |
| **Alliance** | Coordinating with your teammate, respawn timing |
| **Advanced** | Asymmetric positions, sacrifice tactics |

### Technical Plan
```
lessons/
  lesson-data.js     ← JSON array of { id, title, steps[], category, difficulty }
  lesson-engine.js   ← scripted bot that follows predefined moves, step validator
  lesson-ui.js       ← narration overlay, highlight arrows, progress bar
lessons.html         ← Lesson browser + interactive lesson board
```

### Lesson Step Format
```json
{
  "step": 1,
  "narration": "Roll the dice. If you get 1, you must move your Ratha.",
  "expectedDice": 1,
  "expectedMove": { "from": "a1", "to": "h1" },
  "highlight": ["a1", "h1"],
  "arrows": [{ "from": "a1", "to": "h1", "color": "gold" }]
}
```

---

## 3. 🏆 Tournament System

### Concept
A local tournament manager using `localStorage` for bracket persistence. No backend needed — supports round-robin and single-elimination formats.

### Features
- **Tournament Types**:
  - *Round Robin* — every player plays every other (up to 8 players)
  - *Single Elimination* — traditional bracket (4, 8, or 16 participants)
  - *Bot Championship* — run a full tournament of bots at different ELO levels (auto-play)
- **ELO Leaderboard**: Running ELO ratings across all games played on the device
- **Player Profiles**: Name + custom color for human players
- **Match Results Export**: Markdown report of the entire tournament
- **Spectator Mode**: Watch bot tournaments play live with speed control

### Technical Plan
```
tournament/
  tournament-engine.js  ← bracket generation, round robin scheduler, ELO update
  tournament-ui.js      ← bracket visualizer, match card, leaderboard table
tournament.html          ← Tournament hub
```

---

## 4. 🤖 Higher-Level Bots (ELO 700–1000)

### Current State (v1.0.3.3)
- ELO 100–600 implemented using weighted random + heuristic scoring

### v1.0.4 Addition
| ELO | Name | Algorithm |
|-----|------|-----------|
| 700 | Grandmaster | Minimax depth 3 + alpha-beta pruning |
| 800 | Maharaja | Minimax depth 4 + quiescence search |
| 900 | Samrat | Minimax depth 5 + iterative deepening |
| 1000 | Chakravarti | Full expectimax (dice probability tree) |

### Technical Plan
```js
// js/bot/minimaxBot.js
function minimax(game, depth, alpha, beta, isMaximising) {
  // 4-player coalition minimax:
  // Team 1 (Red+Green) maximises, Team 2 (Blue+Yellow) minimises
  // Handles dice uncertainty via expectimax at each dice node
  // Evaluation: material + mobility + king safety + alliance bonus
}
```

---

## 5. 🌐 Online Multiplayer (WebSocket)

### Architecture
- **Server**: Node.js + `ws` library (minimal, no heavy framework)
- **Rooms**: 4-player rooms with a 6-character join code
- **Game State Sync**: Server is authoritative, clients are display-only
- **Chat**: In-game chat sidebar (text only)
- **Reconnection**: 60-second grace period after disconnect

### Phase Plan
1. Room creation + join code
2. Game state broadcast on every move
3. Spectator slots (up to 8 spectators per room)
4. Persistent room history (last 5 games)

---

## 6. 📊 Full Seer Engine Analytics

### Features
| Feature | Description |
|---------|-------------|
| **ELO Estimator** | Based on move quality vs optimal (via minimax) |
| **Turning Point Detector** | Identifies the move where material balance shifted |
| **Move Quality Chart** | Visual graph: good/ok/blunder for each move |
| **Insight Annotations** | "Bot chose Ratha capture over King safety due to ELO-300 greedy constraint" |
| **MD Export** | Full Markdown report with tables, diagrams, and analysis |
| **Historical Vault** | Browse past games, filter by date/winner/bot-ELO |

---

## 7. 🎨 UI/UX Improvements

- **Piece Tooltips**: Hover a piece → popup shows movement diagram
- **Theme System**: Choose between 3 board themes (Classical, Night, Parchment)
- **Piece Set Selector**: Choose between 3 artwork styles
- **Accessibility**: Screen reader support, keyboard navigation
- **PWA Support**: Install as a Progressive Web App on mobile

---

## 8. 📱 Mobile App (Stretch Goal)

Wrap the web app using **Capacitor.js** to ship an Android/iOS app with:
- Offline play vs bots
- Push notifications for tournament results
- Native share for game logs

---

## Development Timeline Estimate

| Phase | Target |
|-------|--------|
| Puzzle system (50 puzzles) | Month 1 |
| Lessons Module (3 categories) | Month 2 |
| Higher ELO bots (700–900) | Month 2 |
| Tournament System | Month 3 |
| Seer Engine full | Month 3–4 |
| Online Multiplayer alpha | Month 5–6 |
| v1.0.4 Release | Month 6 |

---

*"The true warrior masters not just the pieces, but the patterns between them."*  
*— Chaturanga Project, v1.0.4 Roadmap*
