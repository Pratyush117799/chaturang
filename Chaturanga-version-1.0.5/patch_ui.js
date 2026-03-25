const fs = require('fs');
let ui = fs.readFileSync('js/ui.js', 'utf8');

// 1. Add state variables near the top
if (!ui.includes('let currentTimeControl')) {
    ui = ui.replace('let gameStartTime', 'let _oldGameStartTime'); // in case it exists elsewhere
    ui = ui.replace('// ── State ────────────────────────────────────────────────────────────', 
`// ── Time Control & ELO State ──────────────────────────────────────────
let currentTimeControl = localStorage.getItem('chaturanga_tc') || 'chirantan';
let activeClock        = null;
let clockUI            = null;
let gameStartTime      = 0;

// ── State ────────────────────────────────────────────────────────────`);
}

// 2. Settings drawer - inject TC selector
if (!ui.includes('ChaturangaClockUI.buildTimeControlSelector')) {
    // Look for where settings drawer is built. If not found, we'll append to an init function or a known spot.
    // It says "When you open/build the settings drawer, call..."
    // Let's just put it in initUI after the mute control or somewhere safe.
    ui = ui.replace('initMuteControl(isMuted, (val) => { isMuted = val; });', 
`initMuteControl(isMuted, (val) => { isMuted = val; });
  
  // Inject Time Control Selector
  const tcWrap = document.getElementById('tc-selector-wrap');
  if (tcWrap && typeof ChaturangaClockUI !== 'undefined') {
    ChaturangaClockUI.buildTimeControlSelector(
      tcWrap,
      (newMode) => {
        currentTimeControl = newMode;
        localStorage.setItem('chaturanga_tc', newMode);
      },
      currentTimeControl
    );
  }`);
}

// Ensure the HTML has the tcWrap container.
let gameHtml = fs.readFileSync('game.html', 'utf8');
if (!gameHtml.includes('id="tc-selector-wrap"')) {
    gameHtml = gameHtml.replace('<div class="setting-group">\n                <label class="setting-label">Bot ELO Rating</label>', 
`<div class="setting-group">
                <label class="setting-label">Time control</label>
                <div id="tc-selector-wrap"></div>
            </div>
            <div class="setting-group">
                <label class="setting-label">Bot ELO Rating</label>`);
    fs.writeFileSync('game.html', gameHtml);
}

// 3. Start clock when new game begins. Where does that happen? 
// Probably `function initGame` or similar. Let's look for `game.startGame` or where board is rendered initially.
// We can just put it at the end of `initUI(game)` for the first time, BUT games can restart.
// Actually, let's inject it into `updateStateModals` on game restart, or look for `game = new globalThis.ChaturangaGame()`.
// This is tricky without seeing the whole file. I'll read the restart logic.
fs.writeFileSync('js/ui_patched.js', ui);
console.log('UI patch phase 1 done.');
