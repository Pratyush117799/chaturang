/**
 * Chaturanga 1.0.3 — Serializable game state for bot/replay
 * Minimal: expose a snapshot that bot can use without holding game reference.
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ChaturangaGameState = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function snapshot(game) {
    if (!game) return null;
    return {
      turnIndex: game.turnIndex,
      forcedPiece: game.forcedPiece,
      lastDice: game.lastDice,
      gameOver: game.gameOver,
      winner: game.winner,
      winnerPlayerId: game.winnerPlayerId
    };
  }

  return { snapshot: snapshot };
});
