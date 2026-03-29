# Chaturanga v1.0.5.2 — Clock + ELO Integration Guide

## Files added (drop in as-is)

| File | Purpose |
|---|---|
| `js/elo-engine.js` | ELO data/logic — no DOM |
| `js/game-clock.js` | Timer logic — no DOM |
| `js/clock-ui.js`  | DOM layer: clock strip + ELO toast |
| `elo-profile.html` | Standalone Chronicle page |

---

## Step 1 — Load the scripts in game.html

Add these four lines **before** the closing `</body>` tag, after your existing
script tags (ui.js, game.js, etc.):

```html
<script src="js/elo-engine.js"></script>
<script src="js/game-clock.js"></script>
<script src="js/clock-ui.js"></script>
```

---

## Step 2 — Add time control state to ui.js

Near the top of `ui.js`, alongside your other game state variables, add:

```js
let currentTimeControl = localStorage.getItem('chaturanga_tc') || 'chirantan';
let activeClock        = null;   // ChaturangaClock instance, lives for one game
let clockUI            = null;   // ChaturangaClockUI instance
let gameStartTime      = 0;
```

---

## Step 3 — Inject the time control selector into the settings drawer

In your settings drawer HTML (or wherever you build it in ui.js), add a
container element:

```html
<!-- inside your settings drawer -->
<div class="setting-group">
  <label class="setting-label">Time control</label>
  <div id="tc-selector-wrap"></div>
</div>
```

Then when you open/build the settings drawer, call:

```js
ChaturangaClockUI.buildTimeControlSelector(
  document.getElementById('tc-selector-wrap'),
  (newMode) => {
    currentTimeControl = newMode;
    localStorage.setItem('chaturanga_tc', newMode);
  },
  currentTimeControl
);
```

---

## Step 4 — Start the clock when a new game begins

Find the function in `ui.js` that starts a new game (likely called something
like `startGame()`, `initGame()`, or `resetBoard()`). After the board is set
up and players are assigned, add:

```js
// Tear down any existing clock
if (activeClock) activeClock.destroy();
clockUI = null;

gameStartTime = Date.now();

// Count only human + bot players actually in this game
const playerCount = game.players.filter(p => !p.eliminated).length || 4;

activeClock = ChaturangaClock.create(currentTimeControl, playerCount, {
  onTick: (playerIndex, snapshot) => {
    if (clockUI) clockUI.update(snapshot);
  },
  onExpire: (playerIndex) => {
    if (clockUI) clockUI.showFlagfall(playerIndex);
    console.log(`Player ${playerIndex} flagfell — auto-forfeit their future turns`);
    // If this is the human player, you may want to trigger a toast or notification
  },
  onExpiredTurn: (playerIndex) => {
    // This fires at the START of a turn for an already-expired player.
    // Call your existing auto-forfeit / pass-turn logic here:
    // e.g.  game.forfeitTurn(playerIndex);  or  handleAutoForfeit(playerIndex);
  },
});

// Inject the clock strip above the board
// Replace 'board-container' with the actual ID of your board wrapper div
clockUI = ChaturangaClockUI.initClockUI('board-container', currentTimeControl, playerCount);
```

---

## Step 5 — Hook into turn changes

Find where a player's turn begins in `ui.js`. This is typically called after
a move is completed and the next player is determined. Add:

```js
// BEGINNING of a player's turn:
if (activeClock) {
  const canPlay = activeClock.beginTurn(currentPlayerIndex);
  if (!canPlay) {
    // Player is out of time — skip to next
    // your existing forfeit logic handles this via onExpiredTurn callback
    return;
  }
}
```

Find where a move is successfully completed (just before calling
`advanceTurn()` or equivalent). Add:

```js
// AFTER a player's move is committed:
if (activeClock) {
  activeClock.endTurn(currentPlayerIndex);
}
```

---

## Step 6 — Record ELO and show toast on game-over

Find your game-over handler in `ui.js`. Determine:
- `humanPlayerIndex` — which player slot the human controlled (0 for Red)
- `winnerIndex` — which player won
- `botELO` — the ELO setting for the bot (from your existing `getBotELO()` or
  equivalent). For multi-bot games, use the highest-rated bot as the reference.

```js
// In your game-over handler, ONLY record ELO for bot games (not PvP):
const isVsBot = /* your check, e.g. game.players.filter(p=>p.isBot).length > 0 */;

if (isVsBot && typeof ChaturangaELO !== 'undefined') {
  const humanWon = (winnerIndex === humanPlayerIndex);
  const result   = ChaturangaELO.recordGame(botELO, humanWon, currentTimeControl);
  ChaturangaClockUI.showELOToast(result);
}

// Clean up clock
if (activeClock) { activeClock.destroy(); activeClock = null; }
```

---

## Step 7 — Add Chronicle link to your navigation

In any nav bar HTML (or lobby.html, game.html header), add a link:

```html
<a href="elo-profile.html">Chronicle</a>
```

---

## Step 8 — Pause the clock during modals

If any modal opens mid-game (e.g. king respawn, Sankat event, promotion
choice), wrap it:

```js
// When modal opens:
if (activeClock) activeClock.pause();

// When modal closes:
if (activeClock) activeClock.resume();
```

---

## How the three time controls behave

| Control | Initial time | Increment | Flagfall |
|---|---|---|---|
| Chirantan | ∞ | — | Never — clock strip hidden |
| Tez | 5:00 per player | None | Player's future turns are auto-forfeited; game continues |
| Atichitr | 1:00 per player | +3s per move | Same as Tez |

When a player flagfalls, the `onExpiredTurn` callback fires every time their
turn would start, giving you a hook to call your existing auto-forfeit logic.
The game does **not** end — the remaining players keep playing.

---

## ELO behaviour notes

- Starting ELO: **1000** for all new players
- K-factor: 40 (first 10 games) → 32 (games 10–30) → 20 (30+)
- ELO floor: **100** (cannot drop below this)
- Bot ELO maps directly to your existing bot difficulty tiers (100–1000)
- Only games **vs bots** update ELO; PvP games are not rated
- The profile page (`elo-profile.html`) reads from localStorage key
  `chaturanga_elo_v2` and requires no additional setup

---

## Testing checklist

- [ ] Clock strip appears for Tez/Atichitr, hidden for Chirantan
- [ ] Active player's timer counts down; others frozen
- [ ] Increment added on move completion (Atichitr only)
- [ ] Flagfall turns active cell red + shows 0:00
- [ ] Low time (<15s) pulses red on active cell
- [ ] ELO toast appears after bot game ends
- [ ] Toast shows rank-up banner when rank changes
- [ ] elo-profile.html shows rating chart and game log
- [ ] Reset in profile page clears all data
- [ ] Clock properly paused/resumed when modals open
