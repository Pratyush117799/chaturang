const fs = require('fs');
let ui = fs.readFileSync('js/ui_patched.js', 'utf8'); // continuing from my earlier patch_ui.js output

// 3. Start clock when new game begins
// Put it at the end of initUI
const initClockString = `
  // Start Clock
  if (activeClock) activeClock.destroy();
  clockUI = null;
  gameStartTime = Date.now();
  const playerCount = game.players.filter(p => !p.eliminated).length || 4;
  if (typeof ChaturangaClock !== 'undefined') {
      activeClock = ChaturangaClock.create(currentTimeControl, playerCount, {
        onTick: (playerIndex, snapshot) => {
          if (clockUI) clockUI.update(snapshot);
        },
        onExpire: (playerIndex) => {
          if (clockUI) clockUI.showFlagfall(playerIndex);
          console.log(\`Player \${playerIndex} flagfell — auto-forfeit their future turns\`);
        },
        onExpiredTurn: (playerIndex) => {
          // Auto forfeit logic
          game.forfeitTurn(playerIndex);
          if (activeClock) activeClock.endTurn(playerIndex);
          if (activeClock) activeClock.beginTurn(game.turnIndex);
          render();
          tryAutoRoll();
        },
      });
      // Try to find the board container, which is usually a wrapper around #board.
      // In game.html it's typically <main class="board-wrapper"> or we can inject into 'board' parent.
      clockUI = ChaturangaClockUI.initClockUI('board', currentTimeControl, playerCount);
      
      // Begin first turn
      if (activeClock) {
          activeClock.beginTurn(game.turnIndex);
      }
  }

  render();
}
`;
ui = ui.replace('  render();\n}', initClockString);


// 4. Hook into turn changes and ELO in attemptMove, doBotMove, doForfeit
// In attemptMove:
// Replace `const success = game.makeMove(from, to);`
ui = ui.replace('const success = game.makeMove(from, to);', 
`const oldTurn = game.turnIndex;
        const success = game.makeMove(from, to);
        if (success && activeClock) {
            activeClock.endTurn(oldTurn);
            activeClock.beginTurn(game.turnIndex);
        }`);

// In doBotMove:
// Replace `if (game.makeMove(move.from, move.to)) {`
ui = ui.replace('if (game.makeMove(move.from, move.to)) {', 
`const oldTurn = game.turnIndex;
          if (game.makeMove(move.from, move.to)) {
            if (activeClock) {
                activeClock.endTurn(oldTurn);
                activeClock.beginTurn(game.turnIndex);
            }`);

// In doForfeit:
// Replace `if (game.forfeitTurn()) {`
ui = ui.replace('if (game.forfeitTurn()) {', 
`const oldTurn = game.turnIndex;
      if (game.forfeitTurn()) {
        if (activeClock) {
            activeClock.endTurn(oldTurn);
            activeClock.beginTurn(game.turnIndex);
        }`);


// 5. ELO Record on game over
// Inside updateStateModals
// find `if (game.gameOver) {`
const eloRecordString = `if (game.gameOver) {
        const isVsBot = game.players.some(p => p.isBot);
        if (isVsBot && typeof ChaturangaELO !== 'undefined' && !game._eloRecorded) {
            game._eloRecorded = true;
            const humanPlayerIndex = game.players.findIndex(p => !p.isBot);
            const winnerIndex = game.winnerPlayerId !== null ? game.winnerPlayerId : (game.winner !== null ? game.winner : null);
            const botEloValue = botEloEl ? Number.parseInt(botEloEl.value, 10) : 100;
            const humanWon = (winnerIndex === humanPlayerIndex);
            // Quick check if anyone actually won
            if (winnerIndex !== null) {
                const result = ChaturangaELO.recordGame(botEloValue, humanWon, currentTimeControl);
                if (typeof ChaturangaClockUI !== 'undefined') ChaturangaClockUI.showELOToast(result);
            }
            if (activeClock) { activeClock.destroy(); activeClock = null; }
        }
`;
ui = ui.replace('if (game.gameOver) {', eloRecordString);


// 6. Pause clock on modals
// Inside showKingRespawnModal
ui = ui.replace('showKingRespawnModal() {', 'showKingRespawnModal() { if (activeClock) activeClock.pause();');
// Inside hideModals
ui = ui.replace('hideModals() {', 'hideModals() { if (activeClock) activeClock.resume();');


fs.writeFileSync('js/ui.js', ui);
console.log('UI patch phase 2 complete and written to ui.js.');
