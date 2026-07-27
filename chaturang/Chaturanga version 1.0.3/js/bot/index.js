/**
 * Chaturanga 1.0.3 — Bot API (browser)
 * getMove(game, playerId) → { from, to } | null
 * Uses ChaturangaRandomMoveGenerator when loaded via script tag.
 */
(function () {
  'use strict';
  var generator = typeof ChaturangaRandomMoveGenerator !== 'undefined' ? ChaturangaRandomMoveGenerator : null;
  window.ChaturangaBot = {
    getMove: function (game, playerId) {
      if (!game || !generator) return null;
      if (game.gameOver) return null;
      if (game.turnIndex !== playerId) return null;
      return generator.getRandomMove(game);
    }
  };
})();
