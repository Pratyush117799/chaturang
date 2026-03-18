/**
 * Chaturanga 1.0.3 — Heuristic bot (weighted random)
 * Prefer capture, high-value capture; stub for future heuristics.
 */
(function () {
  'use strict';

  if (typeof ChaturangaRandomMoveGenerator === 'undefined') return;

  function getMove(game, playerId) {
    var move = ChaturangaRandomMoveGenerator.getRandomMove(game);
    return move;
  }

  window.ChaturangaHeuristicBot = { getMove: getMove };
})();
