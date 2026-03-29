# Chaturanga v1.0.5 — Complete Analysis Report
**Date: March 23, 2026 | Analyst: Antigravity AI**

---

## 1. Project Overview

Chaturanga v1.0.5 is a sophisticated browser-based implementation of Chaturaji, the ancient 4-player Indian war game and ancestor of Chess. It is a **pure vanilla HTML/CSS/JavaScript** project (no framework) served over a Node.js/Express backend with an optional WebSocket multiplayer server. The project has a rich feature set across ~20+ pages and modules, but significant messiness from incremental additions and multi-AI editing has introduced architectural inconsistencies and real bugs.

---

## 2. Project Structure

```
Chaturanga-version-1.0.5/
├── game.html               — Main 4-player game board (core page)
├── kurukshetra.html        — Campaign mode (17 historical battle scenarios)
├── akhara.html             — Training/puzzle workout arena
├── puzzles.html            — Standalone puzzle system
├── shubh.html              — Daily challenge mode
├── lessons.html / lessons/ — Interactive lessons hub
├── tournament/             — Tournament system
│   ├── index.html          — Working tournament (v1.0.4 label)
│   ├── tournament-engine.js
│   └── bugs latest needs to be fixed/
│       └── tournament-index.html — BROKEN (crashes on load)
├── granth.html             — Encyclopedia / lore browser
├── seer.html               — Standalone analytics/battle intel page
├── acharya.html            — AI chatbot (Acharya)
├── admin.html              — Admin panel
├── board-forge.html        — Board editor
├── army_builder.html       — Custom army builder
├── panchanga.html          — Calendar/astrology feature
├── benchmark.html          — Bot performance benchmark
├── rashtra-map.html        — Historical India map
├── vyuha_builder.html      — Vyuha (battle formation) builder
├── documentation_hub.html  — Central documentation
├── lobby.html              — Online multiplayer lobby
├── server.js               — Express HTTP server
├── server-ws.js            — WebSocket multiplayer server
├── js/
│   ├── game.js             — Core game engine (Piece, Player, Board, Game classes)
│   ├── ui.js               — Main UI controller (~1037 lines)
│   ├── dice.js             — Dice roll logic and animation
│   ├── seer.js / seer-engine.js — Analytics engine (dual-file duplication)
│   ├── anticheat.js        — Anti-cheat system
│   ├── ui-enhancements.js  — Tooltip, piece hover effects
│   ├── ws-client.js        — WebSocket client
│   ├── vyuha-engine.js     — Battle formation engine
│   ├── chatbot-data.js     — Acharya chatbot knowledge base
│   └── bot/
│       ├── randomMove.js   — ELO 100 bot
│       ├── tieredBots.js   — ELO 200–600 bots
│       └── advancedBots.js — ELO 700–1000 bots
├── css/
│   ├── styles.css          — Master stylesheet (~913 lines)
│   ├── animations.css      — All keyframe animations
│   ├── themes.css          — Night/Parchment theme overrides + extra components
│   └── website-integration.css — Shared header/footer for integrated pages
├── engine/
│   └── randomMoveGenerator.js
├── kurukshetra_days2to12.js — Campaign scenarios Days 2–12
├── kurukshetra_days14to17.js — Campaign scenarios Days 14–17
├── dharma-engine.js        — Dharma scoring engine
├── post-game-analysis.js   — Post-game analysis module
├── advancedBots.js         — Duplicate at root level (vs js/bot/)
├── vyuha-data.js           — Vyuha formation data
├── images/ puzzles/ lessons/ — Static assets and content
└── sw.js                   — Service Worker (PWA)
```

---

## 3. Features, Functions & Capabilities

### 3.1 Core Game Engine ([js/game.js](file:///p:/chaturang/Chaturanga-version-1.0.5/js/game.js))
- **4-player Chaturaji** on an 8×8 board (Ashtāpada)
- **Piece types**: Raja (King), Ratha (Rook), Ashwa (Horse/Knight), Danti (Elephant/Bishop variant), Nara (Pawn)
- **Piece movement**: Standard chess-like but with Chaturaji rules — elephant leaps exactly 2 squares diagonally or orthogonally, no horizontal
- **Dice system**: Pāśaka dice (1–6) maps to forced piece: 1=Ratha, 2=Any, 3=Ashwa, 4=Danti, 5=Any, 6=Nara or Raja
- **Game modes**: Team 2v2 (Red+Green vs Blue+Yellow) and Free for All (Single)
- **King mechanics**: King capture triggers respawn possibility for teammate; 2 king captures = freeze
- **Pawn promotion**: Pawns promote by reaching opponent's starting corner squares
- **Auto-forfeit**: If no legal move exists for the forced piece, turn auto-forfeits (doesn't count against player limit)
- **Manual forfeit**: Max 3 times per player
- **Custom army**: Integration with [army_builder.html](file:///p:/chaturang/Chaturanga-version-1.0.5/army_builder.html) via `localStorage` with 5-min expiry
- **Guptchar (Spy)**: Special army_builder feature — capturing the spy also removes the attacker

### 3.2 UI Engine ([js/ui.js](file:///p:/chaturang/Chaturanga-version-1.0.5/js/ui.js))
- Full board rendering via CSS Grid (64 squares dynamically created)
- **Drag-and-drop** piece movement
- **Click-to-move** piece selection with legal move highlighting (green dots)
- **Move animation**: DOM-based smooth CSS translate over 280ms
- **Piece styles**: Traditional (custom PNG artwork), Unicode (chess symbols), Minimal (letters)
- **Board themes**: Standard (CSS programmatic) and Traditional (board.png image)
- **Rank/file labels** rendered inside board squares
- **Score bar**: Material advantage bar (Team 1 vs Team 2)
- **Move arrow SVG**: Draws a gold arrow showing the last move
- **Sound effects**: Web Audio API tones for move, capture, dice roll (no external files)
- **Mute control**: localStorage-persisted mute state
- **Fullscreen**: Browser Fullscreen API
- **Board size slider**: Dynamically adjusts `--sq` CSS variable (70%–130%)
- **Settings drawer**: Slides in from right — bot count, ELO, game mode, board/piece themes, UI theme
- **Move log**: Scrolling notation history with player color coding
- **Captured pieces panel**: Shows all captured piece types with counts

### 3.3 Analytics — Seer Engine ([js/seer.js](file:///p:/chaturang/Chaturanga-version-1.0.5/js/seer.js) + [js/seer-engine.js](file:///p:/chaturang/Chaturanga-version-1.0.5/js/seer-engine.js))
- **Live Battle Intel panel** in game.html right sidebar
- Tracks: move count, capture count, material balance, most-hunted piece type
- Dynamic insight text (opening/mid-game/endgame commentary)
- **Turning point detection**: Records when game momentum shifts
- **Game Vault**: Stores completed game records in localStorage
- **Export report**: Downloads game analysis as a text file
- **Dedicated full-page view**: [seer.html](file:///p:/chaturang/Chaturanga-version-1.0.5/seer.html)

### 3.4 Bot System (`js/bot/`)
- **10 ELO tiers**: 100 (Random), 200 (Greedy), 300 (Tactical), 400 (Strategic), 500 (Deep Tactical), 600 (Paranoid), 700 (Grandmaster), 800 (Maharaja), 900 (Samrat), 1000 (Chakravarti)
- Bot count configurable: 0 (PvP), 1 (Blue bot), 2 (Team 2 bots), 3, or 4 (Full auto)
- ELO 700+ uses [advancedBots.js](file:///p:/chaturang/Chaturanga-version-1.0.5/advancedBots.js) with deeper search
- URL param `?botCount=N` for direct bot configuration
- Auto-roll mode activates automatically when all bots

### 3.5 Tournament System (`tournament/`)
- **4 formats**:
  - **Arena**: Time-based (3/5/10/15/30 min), continuous auto-pairing, win-streak double points
  - **Swiss**: Fixed rounds (3/5/7/9), Buchholz tiebreaks
  - **Round Robin**: Everyone vs everyone, cross-table matrix
  - **Bot Championship**: All 10 ELO bots in a full round robin (45 games, animated live)
- Global ELO leaderboard (localStorage-persisted across tournaments)
- Tournament history log

### 3.6 Campaign Mode ([kurukshetra.html](file:///p:/chaturang/Chaturanga-version-1.0.5/kurukshetra.html))
- 17 battle scenarios based on Kurukshetra historical events
- Custom win conditions per day (e.g., capture specific piece, reach specific square)
- Scenario data split across [kurukshetra_days2to12.js](file:///p:/chaturang/Chaturanga-version-1.0.5/kurukshetra_days2to12.js) and [kurukshetra_days14to17.js](file:///p:/chaturang/Chaturanga-version-1.0.5/kurukshetra_days14to17.js)

### 3.7 Other Features
- **Puzzle system** ([puzzles.html](file:///p:/chaturang/Chaturanga-version-1.0.5/puzzles.html)): Tactical puzzles with solution checking
- **Daily Shubh Challenge** ([shubh.html](file:///p:/chaturang/Chaturanga-version-1.0.5/shubh.html)): Daily puzzle refreshed by date
- **Akhara Training** ([akhara.html](file:///p:/chaturang/Chaturanga-version-1.0.5/akhara.html)): Extended training/workout mode
- **Lessons Hub** ([lessons.html](file:///p:/chaturang/Chaturanga-version-1.0.5/lessons.html)): Structured interactive lessons
- **Vyuha Builder** ([vyuha_builder.html](file:///p:/chaturang/Chaturanga-version-1.0.5/vyuha_builder.html)): Design/view historical battle formations
- **Army Builder** ([army_builder.html](file:///p:/chaturang/Chaturanga-version-1.0.5/army_builder.html)): Custom piece placement that feeds into game.html
- **Granth** ([granth.html](file:///p:/chaturang/Chaturanga-version-1.0.5/granth.html)): Encyclopedia of Chaturanga history, pieces, rules
- **Acharya** ([acharya.html](file:///p:/chaturang/Chaturanga-version-1.0.5/acharya.html)): AI chatbot answering Chaturanga questions
- **Rashtra Map** ([rashtra-map.html](file:///p:/chaturang/Chaturanga-version-1.0.5/rashtra-map.html)): Historical India interactive map
- **Panchanga** ([panchanga.html](file:///p:/chaturang/Chaturanga-version-1.0.5/panchanga.html)): Hindu calendar/auspicious timing feature
- **Board Forge** ([board-forge.html](file:///p:/chaturang/Chaturanga-version-1.0.5/board-forge.html)): Visual board editor
- **Benchmark** ([benchmark.html](file:///p:/chaturang/Chaturanga-version-1.0.5/benchmark.html)): Bot performance benchmarking with web worker
- **Documentation Hub** ([documentation_hub.html](file:///p:/chaturang/Chaturanga-version-1.0.5/documentation_hub.html)): Central docs page
- **Admin Panel** ([admin.html](file:///p:/chaturang/Chaturanga-version-1.0.5/admin.html)): Administration interface
- **Online Multiplayer Lobby** ([lobby.html](file:///p:/chaturang/Chaturanga-version-1.0.5/lobby.html)): WebSocket-based online play via [server-ws.js](file:///p:/chaturang/Chaturanga-version-1.0.5/server-ws.js)
- **PWA Support**: [manifest.json](file:///p:/chaturang/Chaturanga-version-1.0.5/manifest.json) + [sw.js](file:///p:/chaturang/Chaturanga-version-1.0.5/sw.js) service worker

### 3.8 Animations & Styles
- [animations.css](file:///p:/chaturang/Chaturanga-version-1.0.5/css/animations.css) defines: `diceRoll`, `eliminateFlash`, `pieceDrop`, `legalPulse`, `checkPulse`, `dotGlow`, `cardPulse`, `modalIn`, `historySlideIn`, `seerUpdate`
- [themes.css](file:///p:/chaturang/Chaturanga-version-1.0.5/css/themes.css) defines: Night theme (near-black), Parchment theme (light sepia), + shared components (piece tooltip, seer tabs, danger glow, dice spin, fair play notice)
- Fonts: **Cinzel** (headings/serif), **Outfit** (UI/sans-serif) — loaded from Google Fonts
- Icons: **Font Awesome 6.5** (CDN)
- Color Palette: Warm amber-gold on dark brown — consistent `--gold`, `--bg-base`, `--text-primary` CSS variables

---

## 4. Bug Report — Identified Issues

### BUG-001: Double Navigation Bar — Heading Rectangle Drifts on Scroll ⚠️ HIGH
**Location**: [game.html](file:///p:/chaturang/Chaturanga-version-1.0.5/game.html) lines 36–49 (website integration nav) + [css/styles.css](file:///p:/chaturang/Chaturanga-version-1.0.5/css/styles.css) `.top-nav` definition

**Root Cause**: [game.html](file:///p:/chaturang/Chaturanga-version-1.0.5/game.html) has **two navigation bars injected at the same time**:
1. An **absolute-positioned** website integration nav (line 36: `style="position: absolute; top: 0; width: 100%;..."`)
2. A **fixed-positioned** internal game nav (`<nav class="top-nav" id="topNav">` — defined as `position: fixed` in [styles.css](file:///p:/chaturang/Chaturanga-version-1.0.5/css/styles.css))

When the page is scrolled, the internal fixed nav stays anchored to the viewport (correct), but the absolute outer nav scrolls with the page content. This causes the outer nav to visually "drift" or "move" as the user scrolls — creating the "heading rectangle dynamically moving" bug you observed.

**Fix Required**: Remove one of the two navbars, or change the outer website integration nav from `position: absolute` to `position: fixed`. The inner `top-nav` is the canonical game nav and should be kept. The outer website integration header should be removed from [game.html](file:///p:/chaturang/Chaturanga-version-1.0.5/game.html) or made consistent.

---

### BUG-002: Game Board Not Displayed ⚠️ HIGH
**Location**: [game.html](file:///p:/chaturang/Chaturanga-version-1.0.5/game.html) script loading, [js/ui.js](file:///p:/chaturang/Chaturanga-version-1.0.5/js/ui.js), [js/game.js](file:///p:/chaturang/Chaturanga-version-1.0.5/js/game.js)

**Root Cause**: The board rendering depends on a strict script load order. The [game.html](file:///p:/chaturang/Chaturanga-version-1.0.5/game.html) loads scripts in this order:
```html
<script src="js/game.js"></script>       <!-- Game engine -->
<script src="js/dice.js"></script>        <!-- Dice -->
<script src="engine/randomMoveGenerator.js"></script>
<script src="js/bot/randomMove.js"></script>
<script src="js/bot/tieredBots.js"></script>
<script src="js/bot/advancedBots.js"></script>
<script src="js/seer.js"></script>
<script src="js/anticheat.js"></script>
<script src="js/ws-client.js"></script>
<script src="js/ui-enhancements.js"></script>
<script src="js/ui.js"></script>         <!-- UI (must be LAST) -->
```

[js/ui.js](file:///p:/chaturang/Chaturanga-version-1.0.5/js/ui.js) line 6 checks: `if (!globalThis.ChaturangaGame) { return; }` — if [game.js](file:///p:/chaturang/Chaturanga-version-1.0.5/js/game.js) fails to load or throws an error, the entire UI initialization aborts silently. The board element `#board` is then empty.

**Additionally**: [js/dice.js](file:///p:/chaturang/Chaturanga-version-1.0.5/js/dice.js) has a **class name mismatch**: In [dice.js](file:///p:/chaturang/Chaturanga-version-1.0.5/js/dice.js) it adds class `dice-rolling` (line 7) and `dice-rolled` (line 17) to the dice face element, but [js/ui.js](file:///p:/chaturang/Chaturanga-version-1.0.5/js/ui.js) uses `diceFace.classList.add('rolling')` (line 690) — two different class names for the same animation. The `dice-face-large.rolling` animation in [styles.css](file:///p:/chaturang/Chaturanga-version-1.0.5/css/styles.css) matches [ui.js](file:///p:/chaturang/Chaturanga-version-1.0.5/js/ui.js)'s usage, but [dice.js](file:///p:/chaturang/Chaturanga-version-1.0.5/js/dice.js) uses `dice-rolling` which has no matching CSS rule. The dice face element gets contradictory class treatment.

**Also**: The board render fallback at line 601–613 of [game.html](file:///p:/chaturang/Chaturanga-version-1.0.5/game.html) fires if the board has 0 children after 800ms — but this only shows a text error, it doesn't attempt re-render.

**Fix Required**: 
1. Ensure all JS files are present and load without errors (check browser console).
2. Standardize the dice animation class to `rolling` in both [dice.js](file:///p:/chaturang/Chaturanga-version-1.0.5/js/dice.js) and [ui.js](file:///p:/chaturang/Chaturanga-version-1.0.5/js/ui.js).
3. Add explicit error display when `ChaturangaGame` is missing.

---

### BUG-003: Tournament "bugs latest needs to be fixed" Folder — Blank/Black Screen 🔴 CRITICAL
**Location**: `tournament/bugs latest needs to be fixed/tournament-index.html`

**Root Cause (Found)**: The file at line 162 references:
```html
<script src="tournament-engine.js"></script>
```
This script path resolves relative to the file's directory: `tournament/bugs latest needs to be fixed/tournament-engine.js`. **This file does NOT exist** in that folder — only [tournament-index.html](file:///p:/chaturang/Chaturanga-version-1.0.5/tournament/bugs%20latest%20needs%20to%20be%20fixed/tournament-index.html) is present there.

The working version at [tournament/index.html](file:///p:/chaturang/Chaturanga-version-1.0.5/tournament/index.html) also references [tournament-engine.js](file:///p:/chaturang/Chaturanga-version-1.0.5/tournament/tournament-engine.js) — but in **its** folder, [tournament/tournament-engine.js](file:///p:/chaturang/Chaturanga-version-1.0.5/tournament/tournament-engine.js) exists. 

When [tournament-engine.js](file:///p:/chaturang/Chaturanga-version-1.0.5/tournament/tournament-engine.js) fails to load, `window.ChaturangaTournament` is `undefined`. Every call to [T()](file:///p:/chaturang/Chaturanga-version-1.0.5/tournament/index.html#171-172) (which returns `window.ChaturangaTournament`) returns `undefined`. The [renderMain()](file:///p:/chaturang/Chaturanga-version-1.0.5/tournament/bugs%20latest%20needs%20to%20be%20fixed/tournament-index.html#722-767) call on `DOMContentLoaded` immediately tries [T().BOT_ELOS](file:///p:/chaturang/Chaturanga-version-1.0.5/tournament/index.html#171-172) → throws **`TypeError: Cannot read properties of undefined`** → the entire script crashes → blank/black screen.

**Fix Required**: Copy [tournament/tournament-engine.js](file:///p:/chaturang/Chaturanga-version-1.0.5/tournament/tournament-engine.js) into `tournament/bugs latest needs to be fixed/` OR fix the script `src` path to `"../tournament-engine.js"`.

Also note: the two files ([tournament/index.html](file:///p:/chaturang/Chaturanga-version-1.0.5/tournament/index.html) and `tournament/bugs.../tournament-index.html`) have **identical HTML/JS** except for the nav version label (`v1.0.4` vs `v1.0.5`). The "bugs" version seems to be an unfinished in-progress copy that was abandoned mid-edit when Claude crashed.

---

### BUG-004: King Respawn Modal — Broken HTML Structure ⚠️ HIGH
**Location**: [game.html](file:///p:/chaturang/Chaturanga-version-1.0.5/game.html) lines 435–443

**Root Cause**: The modal overlay div is malformed. The closing `</div>` for `#kingRespawnModal` appears on line 435, and the modal card content is **outside** the overlay div:
```html
<div id="kingRespawnModal" class="modal-overlay" style="display:none"></div>  <!-- Overlay closes here -->
    <div class="modal-card">       <!-- This is now a sibling, not child -->
        ...Raja Respawn content...
    </div>
</div>   <!-- Stray closing div -->
```
The modal overlay uses `display:flex` + `align-items: center; justify-content: center` to center the `.modal-card` child. Since the card is no longer a child of the overlay, the centering CSS doesn't work, and showing the modal may not display the card correctly.

**Fix Required**: Move the closing `</div>` of `#kingRespawnModal` to after the `.modal-card` div.

---

### BUG-005: Guptchar (Spy) Capture — Null `fromSquare` Reference 🔴 CRITICAL
**Location**: [js/game.js](file:///p:/chaturang/Chaturanga-version-1.0.5/js/game.js) lines 439–461, [handleCapture()](file:///p:/chaturang/Chaturanga-version-1.0.5/js/game.js#439-463) function

**Root Cause**: The Guptchar interception code at line 453 attempts:
```js
this.board.set(fromSquare, null); // remove capturing piece too
```
But `fromSquare` is **not passed as a parameter** to [handleCapture](file:///p:/chaturang/Chaturanga-version-1.0.5/js/game.js#439-463). The function signature is:
```js
handleCapture(player, target, toSquare, fromSquare)
```
And the only call site at line 388 is:
```js
this.handleCapture(player, target, to);
```
`fromSquare` is never passed — it arrives as `undefined`. `this.board.set(undefined, null)` sets a key literally called `"undefined"` on the board's squares object without removing anything, silently corrupting board state.

**Fix Required**: Pass `from` to [handleCapture](file:///p:/chaturang/Chaturanga-version-1.0.5/js/game.js#439-463): `this.handleCapture(player, target, to, from);`

---

### BUG-006: Mute State Stored as Boolean, Read as String ⚠️ MEDIUM
**Location**: [js/ui.js](file:///p:/chaturang/Chaturanga-version-1.0.5/js/ui.js) line 67 (read) vs line 1031 (write)

**Root Cause**: 
- **Write** (line 1031): `localStorage.setItem('chaturanga_muted', val)` — stores boolean `true` or `false`
- **Read** (line 67): `localStorage.getItem('chaturanga_muted') === 'true'` — correctly reads string `'true'`

However, game.html's `safeInitFallback` also writes to this key:
- Line 648: `localStorage.setItem('chaturanga_muted', muted ? '1' : '0')` — stores `'1'` or `'0'`

The game page and the fallback use **incompatible storage formats** (`'true'/'false'` vs `'1'/'0'`). If the fallback script runs after [ui.js](file:///p:/chaturang/Chaturanga-version-1.0.5/js/ui.js) (which it does), it overwrites the value to `'1'`/`'0'`. On next load, [ui.js](file:///p:/chaturang/Chaturanga-version-1.0.5/js/ui.js) checks `=== 'true'` which never matches `'1'`, making mute state permanently un-restorable between sessions.

**Fix Required**: Standardize to one key and one format across both [ui.js](file:///p:/chaturang/Chaturanga-version-1.0.5/js/ui.js) and the fallback script in [game.html](file:///p:/chaturang/Chaturanga-version-1.0.5/game.html).

---

### BUG-007: Board Size Slider — Dual localStorage Keys Conflict ⚠️ MEDIUM
**Location**: [js/ui.js](file:///p:/chaturang/Chaturanga-version-1.0.5/js/ui.js) line 880 vs [game.html](file:///p:/chaturang/Chaturanga-version-1.0.5/game.html) fallback script line 625

**Root Cause**:
- [ui.js](file:///p:/chaturang/Chaturanga-version-1.0.5/js/ui.js) reads/writes `chaturanga_boardSize_v3`
- The `safeInitFallback` in [game.html](file:///p:/chaturang/Chaturanga-version-1.0.5/game.html) reads/writes `chaturanga_boardSize`

Two different keys. Neither overrides the other but they can produce unexpected board sizing behavior — e.g., a user sets size via [ui.js](file:///p:/chaturang/Chaturanga-version-1.0.5/js/ui.js) slider, refreshes, but the CSS variable is then re-applied from [ui.js](file:///p:/chaturang/Chaturanga-version-1.0.5/js/ui.js)'s key, while the fallback script silently applies a different scale from its own key, potentially overriding.

---

### BUG-008: Elephant (Danti) Move — Missing Diagonal-Forward-Only Check ⚠️ MEDIUM
**Location**: [js/game.js](file:///p:/chaturang/Chaturanga-version-1.0.5/js/game.js) lines 341–346

The Danti (elephant) in historical Chaturanga moved **exactly 2 squares diagonally** (like a modern bishop's 2-square jump). The current implementation allows:
```js
[0, 2], [0, -2],         // vertical only (2 squares forward/backward)
[2, 2], [2, -2], [-2, 2], [-2, -2]  // diagonals
```
This includes `[0, 2]` and `[0, -2]` — **pure vertical moves** — which are non-standard. Historical Chaturanga sources give the elephant only diagonal moves. This may or may not be intentional for the game's design, but it is inconsistent with the Quick Rules panel displayed in game.html which says "Danti — 2-diag leap" (implying diagonal only).

---

### BUG-009: Dice Animation Class Name Mismatch ⚠️ MEDIUM
**Location**: [js/dice.js](file:///p:/chaturang/Chaturanga-version-1.0.5/js/dice.js) line 7 & 17 vs [js/ui.js](file:///p:/chaturang/Chaturanga-version-1.0.5/js/ui.js) lines 690–691

- [dice.js](file:///p:/chaturang/Chaturanga-version-1.0.5/js/dice.js) applies class `dice-rolling` → no matching CSS rule found in any stylesheet
- [ui.js](file:///p:/chaturang/Chaturanga-version-1.0.5/js/ui.js) applies class `rolling` → matches [css/styles.css](file:///p:/chaturang/Chaturanga-version-1.0.5/css/styles.css) `.dice-face-large.rolling { animation: diceRoll 0.6s... }`
- Result: When dice rolls are triggered via the Roll button (goes through [ui.js](file:///p:/chaturang/Chaturanga-version-1.0.5/js/ui.js)), animation works. When [dice.js](file:///p:/chaturang/Chaturanga-version-1.0.5/js/dice.js)'s own [roll()](file:///p:/chaturang/Chaturanga-version-1.0.5/js/dice.js#3-53) function is called, the animation class does nothing.

---

### BUG-010: Dual Seer Files — Confusion and Potential Override 🔸 LOW–MEDIUM
**Location**: [js/seer.js](file:///p:/chaturang/Chaturanga-version-1.0.5/js/seer.js) (15,432 bytes) and [js/seer-engine.js](file:///p:/chaturang/Chaturanga-version-1.0.5/js/seer-engine.js) (15,219 bytes)

Both files co-exist in the [js/](file:///p:/chaturang/Chaturanga-version-1.0.5/sw.js) folder. [game.html](file:///p:/chaturang/Chaturanga-version-1.0.5/game.html) loads only [js/seer.js](file:///p:/chaturang/Chaturanga-version-1.0.5/js/seer.js). The [seer-engine.js](file:///p:/chaturang/Chaturanga-version-1.0.5/js/seer-engine.js) file is **not loaded in [game.html](file:///p:/chaturang/Chaturanga-version-1.0.5/game.html)** — unclear if [seer.html](file:///p:/chaturang/Chaturanga-version-1.0.5/seer.html) uses it or if it's an orphaned duplicate. This creates confusion about which is the authoritative file.

---

### BUG-011: Duplicate [advancedBots.js](file:///p:/chaturang/Chaturanga-version-1.0.5/advancedBots.js) at Root and `js/bot/` ⚠️ MEDIUM
**Location**: [p:\chaturang\Chaturanga-version-1.0.5\advancedBots.js](file:///p:/chaturang/Chaturanga-version-1.0.5/advancedBots.js) (root) vs `js/bot/advancedBots.js`

[game.html](file:///p:/chaturang/Chaturanga-version-1.0.5/game.html) loads `js/bot/advancedBots.js`. The root-level [advancedBots.js](file:///p:/chaturang/Chaturanga-version-1.0.5/advancedBots.js) is a stale duplicate that may diverge. Any future edits to the wrong copy will cause confusion.

---

### BUG-012: [game.html](file:///p:/chaturang/Chaturanga-version-1.0.5/game.html) Title Still Shows v1.0.4 🔸 LOW
**Location**: [game.html](file:///p:/chaturang/Chaturanga-version-1.0.5/game.html) line 7

```html
<title>Chaturanga 1.0.4 — Ancient 4-Player War Game</title>
```
The meta description (line 8) correctly says v1.0.5, but the browser tab still shows 1.0.4. Minor but visible.

---

### BUG-013: Tournament Nav Links Go to Wrong Relative Paths 🔸 MEDIUM
**Location**: Both tournament HTML files, nav links

Both files link to `../game.html`, `../puzzles.html`, `../lessons.html`. These relative paths work correctly from [tournament/index.html](file:///p:/chaturang/Chaturanga-version-1.0.5/tournament/index.html) (one folder deep). But if served from `tournament/bugs latest needs to be fixed/` (two folders deep), the same `../` paths would point to the `tournament/` folder instead of the project root — producing 404 errors.

---

### BUG-014: [post-game-analysis.js](file:///p:/chaturang/Chaturanga-version-1.0.5/post-game-analysis.js) and [dharma-engine.js](file:///p:/chaturang/Chaturanga-version-1.0.5/dharma-engine.js) Not Validated ⚠️ MEDIUM
Both are loaded in [game.html](file:///p:/chaturang/Chaturanga-version-1.0.5/game.html) (lines 564–565) but are large standalone files. No error handling exists if they throw on load. A runtime error in either would silently break subsequent scripts.

---

### BUG-015: Arena Tournament — Stale DOM Reference After Re-render 🔸 LOW
**Location**: [tournament/index.html](file:///p:/chaturang/Chaturanga-version-1.0.5/tournament/index.html) [renderArenaTimer()](file:///p:/chaturang/Chaturanga-version-1.0.5/tournament/bugs%20latest%20needs%20to%20be%20fixed/tournament-index.html#362-370) function (line 362–368)

[renderArenaTimer()](file:///p:/chaturang/Chaturanga-version-1.0.5/tournament/bugs%20latest%20needs%20to%20be%20fixed/tournament-index.html#362-370) gets `#arenaTimer` element via `$('arenaTimer')`. But [renderArenaActive()](file:///p:/chaturang/Chaturanga-version-1.0.5/tournament/bugs%20latest%20needs%20to%20be%20fixed/tournament-index.html#305-361) at line 312 completely replaces `mainCol.innerHTML`, which destroys and recreates the `#arenaTimer` element. If [onTick](file:///p:/chaturang/Chaturanga-version-1.0.5/tournament/bugs%20latest%20needs%20to%20be%20fixed/tournament-index.html#300-301) fires between a [renderArenaActive()](file:///p:/chaturang/Chaturanga-version-1.0.5/tournament/bugs%20latest%20needs%20to%20be%20fixed/tournament-index.html#305-361) call and the browser repaint, [el](file:///p:/chaturang/Chaturanga-version-1.0.5/js/ui.js#233-239) may still reference the old (detached) DOM node, making the timer update invisible.

---

## 5. Performance & Architecture Concerns

| Concern | Detail |
|---|---|
| **Full board re-render every move** | [renderBoardGrid()](file:///p:/chaturang/Chaturanga-version-1.0.5/js/ui.js#189-200) destroys and recreates all 64 squares every time any move is made. At high ELO bots with auto-roll, this hammers the DOM. | 
| **Bot recovery loop** | If a bot returns no move, it calls `setTimeout(tryAutoRoll, 300)` which can create rapid looping. No exponential backoff. |
| **`requestAnimationFrame` batching** | The `renderPending` guard in [ui.js](file:///p:/chaturang/Chaturanga-version-1.0.5/js/ui.js) is good but only single-level — concurrent bot games in full-auto mode can still trigger multiple overlapping renders. |
| **localStorage size** | Seer Vault stores full game records in `localStorage`. Long sessions with many games could approach the 5MB browser limit. |
| **Missing `engine/randomMoveGenerator.js` guard** | If this file is missing (it's referenced separately from `js/bot/`), the ELO 100 bot silently fails and the entire bot system may degrade. |
| **CSS variable scope collision** | Tournament pages define their own `:root` variables (`--gold`, `--dark`, `--text`, etc.) in inline `<style>` blocks, which conflict with the main game's [styles.css](file:///p:/chaturang/Chaturanga-version-1.0.5/css/styles.css) variable names but use incompatible values. Pages must be kept fully independent. |
| **No error boundaries on page load** | Pages like [kurukshetra.html](file:///p:/chaturang/Chaturanga-version-1.0.5/kurukshetra.html), [akhara.html](file:///p:/chaturang/Chaturanga-version-1.0.5/akhara.html), [shubh.html](file:///p:/chaturang/Chaturanga-version-1.0.5/shubh.html) have no documented fallback if their large embedded JS sections throw. |
| **`tournament/bugs.../` folder name with spaces** | The URL `tournament/bugs%20latest%20needs%20to%20be%20fixed/` is unwieldy and can cause path resolution issues on some servers. |

---

## 6. Summary of Issues by Priority

| Priority | Bug ID | Issue |
|---|---|---|
| 🔴 Critical | BUG-003 | Tournament "bugs" file blank screen (missing [tournament-engine.js](file:///p:/chaturang/Chaturanga-version-1.0.5/tournament/tournament-engine.js)) |
| 🔴 Critical | BUG-005 | Guptchar spy capture silently corrupts board state (`fromSquare` undefined) |
| ⚠️ High | BUG-001 | Double navbar causes heading to drift on scroll |
| ⚠️ High | BUG-002 | Board fails to display (script load failure, class name mismatch) |
| ⚠️ High | BUG-004 | King Respawn modal — broken HTML nesting |
| ⚠️ Medium | BUG-006 | Mute state uses incompatible format between ui.js and fallback |
| ⚠️ Medium | BUG-007 | Board size uses two different localStorage keys |
| ⚠️ Medium | BUG-008 | Elephant moves include non-diagonal (potentially incorrect) |
| ⚠️ Medium | BUG-009 | Dice animation class name mismatch |
| ⚠️ Medium | BUG-010 | Dual seer files — ambiguous authority |
| ⚠️ Medium | BUG-011 | Duplicate [advancedBots.js](file:///p:/chaturang/Chaturanga-version-1.0.5/advancedBots.js) at root and `js/bot/` |
| ⚠️ Medium | BUG-013 | Tournament "bugs" folder — broken nav relative paths |
| ⚠️ Medium | BUG-014 | [post-game-analysis.js](file:///p:/chaturang/Chaturanga-version-1.0.5/post-game-analysis.js) / [dharma-engine.js](file:///p:/chaturang/Chaturanga-version-1.0.5/dharma-engine.js) unguarded on load |
| 🔸 Low | BUG-012 | [game.html](file:///p:/chaturang/Chaturanga-version-1.0.5/game.html) title still shows v1.0.4 |
| 🔸 Low | BUG-015 | Arena timer stale DOM reference |

---

## 7. Recommended Fixes — Quick Wins

1. **BUG-003 (Blank Tournament)**: Copy [tournament-engine.js](file:///p:/chaturang/Chaturanga-version-1.0.5/tournament/tournament-engine.js) into `tournament/bugs latest needs to be fixed/` → instant fix.
2. **BUG-001 (Drifting Navbar)**: Remove the website integration `<nav>` block from [game.html](file:///p:/chaturang/Chaturanga-version-1.0.5/game.html) (lines 33–49) or change `position: absolute` to `position: fixed`.
3. **BUG-004 (Respawn Modal)**: Move the misplaced `</div>` (line 435) to after the `.modal-card` closing tag (line 442).
4. **BUG-005 (Guptchar)**: Add `from` to [handleCapture](file:///p:/chaturang/Chaturanga-version-1.0.5/js/game.js#439-463) call: `this.handleCapture(player, target, to, from);`
5. **BUG-012 (Version label)**: Update `<title>` in game.html to say v1.0.5.
6. **BUG-009 (Dice class)**: Change [dice.js](file:///p:/chaturang/Chaturanga-version-1.0.5/js/dice.js) from `dice-rolling`/`dice-rolled` to `rolling`/`rolled` to match CSS.
7. **BUG-006 & BUG-007**: Consolidate mute and board size localStorage keys to single consistent names.

---

*This report was generated by Antigravity AI through static code analysis of all source files in `p:\chaturang\Chaturanga-version-1.0.5`. No runtime execution was performed.*
