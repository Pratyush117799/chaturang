/**
 * Chaturanga Benchmark Web Worker
 * Handles heavy bot simulations on a background thread to keep the UI responsive.
 */

// Import required engine and bot scripts
// Paths are relative to the worker location or absolute URLs
importScripts('js/game.js', 'engine/randomMoveGenerator.js', 'js/bot/randomMove.js', 'js/bot/tieredBots.js');

self.onmessage = function(e) {
  try {
    const { eloA, eloB, gameMode, maxMoves, gameIndex } = e.data;
    const res = simulateOneGame(eloA, eloB, gameMode, maxMoves);
    self.postMessage({ res, gameIndex });
  } catch (err) {
    self.postMessage({ error: err.message, gameIndex: e.data.gameIndex });
  }
};

function simulateOneGame(eloA, eloB, gameMode, maxMoves) {
  // Use the classes and bots loaded via importScripts
  const game = new ChaturangaGame();
  game.gameMode = gameMode;
  game.players.forEach(p => p.isBot = true);

  let moveCount = 0;
  while (!game.gameOver && moveCount < maxMoves) {
    game.rollDice();
    if (game.autoForfeitIfNoMove()) {
      moveCount++;
      continue;
    }

    const player = game.getPlayer();
    if (!player || player.eliminated) { game.nextTurn(); moveCount++; continue; }

    const isTeamA = player.team === 0;
    const elo = isTeamA ? eloA : eloB;

    let move = null;
    if (elo === 100) {
      move = self.ChaturangaRandomBot ? self.ChaturangaRandomBot.getMove(game, player.id) : null;
    } else {
      move = self.ChaturangaTieredBot ? self.ChaturangaTieredBot.getMove(game, elo) : null;
    }

    if (move) {
      game.makeMove(move.from, move.to);
      if (game.pendingKingRespawn) {
        const empty = game.board.getAllEmptySquares();
        if (empty.length > 0) {
          const rSq = empty[Math.floor(Math.random() * empty.length)];
          game.respawnKing(rSq);
        } else {
          game.pendingKingRespawn = null;
        }
      }
      if (game.pendingElimination) game.completeElimination();
    } else {
      if (!game.forfeitTurn()) {
        game.forcedPiece = null; game.lastDice = null; game.nextTurn();
      }
    }
    moveCount++;
  }

  const hist = game.moveHistory;
  const wId = game.winnerPlayerId;
  let winner = null;
  if (game.gameOver) {
    winner = (game.gameMode === 'team') ? game.winner : (game.winnerPlayerId != null ? game.players[game.winnerPlayerId].team : null);
  }
  return { winner, moves: moveCount, history: hist, winnerPlayerId: wId };
}
