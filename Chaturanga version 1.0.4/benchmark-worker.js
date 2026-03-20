'use strict';

/**
 * Chaturanga v1.0.4 — Benchmark Web Worker
 * Handles heavy bot simulations on a background thread.
 */

// Import required engine and bot scripts
// Paths are relative to the worker location within "Chaturanga version 1.0.4"
importScripts('js/game.js', 'js/bot/randomMove.js', 'js/bot/tieredBots.js', 'js/bot/advancedBots.js');

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
  const game = new ChaturangaGame();
  game.gameMode = gameMode;
  game.players.forEach(p => p.isBot = true);

  // Reset bots if they have state (e.g. ELO 1000 opening book)
  if (globalThis.ChaturangaAdvancedBots && globalThis.ChaturangaAdvancedBots.resetOpeningBook) {
    globalThis.ChaturangaAdvancedBots.resetOpeningBook();
  }

  let moveCount = 0;
  while (!game.gameOver && moveCount < maxMoves) {
    game.rollDice();
    
    // Auto-forfeit if no legal moves for the dice rolled
    if (game.autoForfeitIfNoMove()) {
      moveCount++;
      continue;
    }

    const player = game.getPlayer();
    if (!player || player.eliminated) { 
      game.nextTurn(); 
      moveCount++; 
      continue; 
    }

    const isTeamA = (game.gameMode === 'team') 
      ? (player.team === 0) 
      : (player.id === 0 || player.id === 2); // In FFA, we group Red/Green as Team A for comparison
    
    const elo = isTeamA ? eloA : eloB;

    let move = null;
    if (elo >= 700) {
      move = globalThis.ChaturangaAdvancedBots ? globalThis.ChaturangaAdvancedBots.getMove(game, elo) : null;
    } else if (elo === 100) {
      move = globalThis.ChaturangaRandomBot ? globalThis.ChaturangaRandomBot.getMove(game, player.id) : null;
    } else {
      move = globalThis.ChaturangaTieredBot ? globalThis.ChaturangaTieredBot.getMove(game, elo) : null;
    }

    if (move) {
      game.makeMove(move.from, move.to);
      
      // Handle 1.0.3/1.0.4 specific engine states if they arise during simulation
      // (1.0.4 game.js makeMove handles promotion and captures, but check for manual triggers if needed)
      if (game.pendingKingRespawn) {
        const empty = game.board.getAllEmptySquares();
        if (empty.length > 0) {
          const rSq = empty[Math.floor(Math.random() * empty.length)];
          game.respawnKing(rSq);
        } else {
          game.pendingKingRespawn = null;
        }
      }
      if (game.pendingElimination) {
        // In simulation, we immediately complete elimination without animation delay
        game.completeElimination();
      }
    } else {
      // Forfeit turn manually if bot failed to find a move despite game.autoForfeitIfNoMove()
      if (!game.forfeitTurn()) {
        game.forcedPiece = null; 
        game.lastDice = null; 
        game.nextTurn();
      }
    }
    moveCount++;
  }

  const hist = game.moveHistory;
  const wId = game.winnerPlayerId;
  let winner = null;
  if (game.gameOver) {
    // winner: 0 = Team A (Red/Green), 1 = Team B (Blue/Yellow)
    if (game.gameMode === 'team') {
      winner = game.winner;
    } else {
        // In FFA/Single mode, map winning player to their pseudo-team
        winner = (game.winnerPlayerId === 0 || game.winnerPlayerId === 2) ? 0 : 1;
    }
  }

  return { winner, moves: moveCount, history: hist, winnerPlayerId: wId };
}
