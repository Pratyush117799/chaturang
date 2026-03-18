(function () {
  'use strict';
  if (typeof ChaturangaRandomMoveGenerator === 'undefined') return;
  window.ChaturangaAI = window.ChaturangaAI || {};
  window.ChaturangaAI.getMove = function (game, playerId) {
    try { return ChaturangaRandomMoveGenerator.getRandomMove(game); } catch (e) { return null; }
  };
})();
