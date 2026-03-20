/**
 * Chaturanga 1.0.3 — Random move bot (standalone for browser)
 * Uses ChaturangaRandomMoveGenerator from engine if loaded via script tags.
 */
(function () {
  'use strict';

  if (typeof ChaturangaRandomMoveGenerator === 'undefined') {
    console.warn('Chaturanga bot: ChaturangaRandomMoveGenerator not loaded. Load engine/randomMoveGenerator.js first.');
    return;
  }

  (typeof window !== 'undefined' ? window : self).ChaturangaRandomBot = {
    getMove: function (game, playerId) {
      return ChaturangaRandomMoveGenerator.getRandomMove(game);
    }
  };
})();
