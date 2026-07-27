const fs = require('fs');
const path = require('path');

// 1. Delete duplicate advancedBots.js
if (fs.existsSync('advancedBots.js')) fs.unlinkSync('advancedBots.js');

// 2. Patch game.html
let gameHtml = fs.readFileSync('game.html', 'utf8');

// Fix Title
gameHtml = gameHtml.replace('<title>Chaturanga 1.0.4 — Ancient 4-Player War Game</title>', '<title>Chaturanga 1.0.5.2 — Ancient 4-Player War Game</title>');

// Remove drifting navbar
// The report says: Location: game.html lines 36–49 (website integration nav).
// We'll regex match the block before <nav class="top-nav" id="topNav">
const navBarRegex = /<!-- BEGIN INTEGRATION HEADER -->[\s\S]*?<!-- END INTEGRATION HEADER -->/;
if(navBarRegex.test(gameHtml)) {
    gameHtml = gameHtml.replace(navBarRegex, '');
} else {
    // If exact comments not found, fallback to removing `<div style="position: absolute;` block if it exists before `<nav class="top-nav"`
    const fallbackRegex = /<div style="position:\s*absolute;[^>]*>[\s\S]*?<\/div>\s*<nav class="top-nav"/;
    if(fallbackRegex.test(gameHtml)) {
        gameHtml = gameHtml.replace(/<div style="position:\s*absolute;[^>]*>[\s\S]*?<\/div>\s*(<nav class="top-nav")/, '$1');
    }
}

// Add new scripts
const scriptsToAdd = `
<!-- v1.0.5.2 Features -->
<script src="js/elo-engine.js"></script>
<script src="js/game-clock.js"></script>
<script src="js/clock-ui.js"></script>
<script src="js/premove.js"></script>
<script src="js/sound-engine.js"></script>
`;
if (!gameHtml.includes('elo-engine.js')) {
    gameHtml = gameHtml.replace(/(<script src="js\/ui\.js"><\/script>)/, `${scriptsToAdd}\n$1`);
}

// Replace mute fallback issue
gameHtml = gameHtml.replace(/localStorage\.setItem\('chaturanga_muted',\s*muted\s*\?\s*'1'\s*:\s*'0'\)/g, "localStorage.setItem('chaturanga_muted', muted ? 'true' : 'false')");
// Replace board size fallback issue
gameHtml = gameHtml.replace(/localStorage\.setItem\('chaturanga_boardSize',\s*size\)/g, "localStorage.setItem('chaturanga_boardSize_v3', size)");
gameHtml = gameHtml.replace(/localStorage\.getItem\('chaturanga_boardSize'\)/g, "localStorage.getItem('chaturanga_boardSize_v3')");

// Fix King Respawn Modal div
// Move closing div of #kingRespawnModal after .modal-card
gameHtml = gameHtml.replace(/<div id="kingRespawnModal" class="modal-overlay" style="display:none"><\/div>\s*<div class="modal-card">([\s\S]*?)<\/div>\s*<\/div>/, `<div id="kingRespawnModal" class="modal-overlay" style="display:none">\n<div class="modal-card">$1</div>\n</div>`);

fs.writeFileSync('game.html', gameHtml);


// 3. Patch dice.js (Animation class name mismatch)
let diceJs = fs.readFileSync('js/dice.js', 'utf8');
diceJs = diceJs.replace(/classList\.add\('dice-rolling'\)/g, "classList.add('rolling')");
diceJs = diceJs.replace(/classList\.remove\('dice-rolling'\)/g, "classList.remove('rolling')");
diceJs = diceJs.replace(/classList\.add\('dice-rolled'\)/g, "classList.add('rolled')");
diceJs = diceJs.replace(/classList\.remove\('dice-rolled'\)/g, "classList.remove('rolled')");
fs.writeFileSync('js/dice.js', diceJs);


// 4. Patch game.js (Guptchar `this.handleCapture(player, target, to)` and elephant moves)
let gameJs = fs.readFileSync('js/game.js', 'utf8');
// Fix elephant
gameJs = gameJs.replace(/\[0,\s*2\],\s*\[0,\s*-2\],\s*\[2,\s*2\],\s*\[2,\s*-2\],\s*\[-2,\s*2\],\s*\[-2,\s*-2\]/, '[2, 2], [2, -2], [-2, 2], [-2, -2]');
// Fix Guptchar capture (find `this.handleCapture(player, target, to);` and replace with `this.handleCapture(player, target, to, from);`)
gameJs = gameJs.replace(/this\.handleCapture\(player,\s*target,\s*to\);/g, 'this.handleCapture(player, target, to, from);');
fs.writeFileSync('js/game.js', gameJs);

console.log("Bug patches applied successfully.");
