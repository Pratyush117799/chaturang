'use strict';

/**
 * Chaturanga v1.0.4 — Benchmark Web Worker
 * Handles heavy bot simulations on a background thread.
 * v1.0.4.1: Batch mode — process multiple games per message to reduce IPC overhead.
 */

// Import required engine and bot scripts
// Paths are relative to the worker location within "Chaturanga version 1.0.4"
importScripts('js/game.js', 'js/bot/randomMove.js', 'js/bot/tieredBots.js', 'js/bot/advancedBots.js');

self.onmessage = function(e) {
  try {
    const data = e.data;

    // ── BATCH MODE ─────────────────────────────────────────────────────
    // Caller sends { batch: [{eloA,eloB,gameMode,maxMoves,gameIndex},...] }
    // We process every item and reply once with all results.
    // This removes per-game postMessage overhead (~10x IPC reduction).
    if (data.batch && Array.isArray(data.batch)) {
      const results = data.batch.map(cfg => {
        try {
          const res = simulateOneGame(cfg.eloA, cfg.eloB, cfg.gameMode, cfg.maxMoves || 400);
          return { res, gameIndex: cfg.gameIndex };
        } catch (err) {
          return { error: err.message, gameIndex: cfg.gameIndex };
        }
      });
      self.postMessage({ batch: results });
      return;
    }

    // ── SINGLE MODE (legacy / backward compatible) ─────────────────────
    const { eloA, eloB, gameMode, maxMoves, gameIndex } = data;
    const res = simulateOneGame(eloA, eloB, gameMode, maxMoves || 400);
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
      : (player.id === 0 || player.id === 2); // In FFA, group Red/Green as Team A
    
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
        game.completeElimination();
      }
    } else {
      // Forfeit turn manually if bot failed to find a move
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
    if (game.gameMode === 'team') {
      winner = game.winner;
    } else {
      winner = (game.winnerPlayerId === 0 || game.winnerPlayerId === 2) ? 0 : 1;
    }
  }

  return { winner, moves: moveCount, history: hist, winnerPlayerId: wId };
}
