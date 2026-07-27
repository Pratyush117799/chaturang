/**
 * Chaturanga v1.0.5 — Rules (optional extraction)
 * Kill matrix and legal moves live in game.js; this module can re-export or mirror for bot use.
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ChaturangaRules = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';
  return {
    canCapture: function (piece, target) {
      if (!target || target.owner === piece.owner) return false;
      if (piece.type === 'king' && target.type === 'king') return false;
      // Minor pieces (pawn/horse/elephant) cannot capture major pieces (rook/king)
      const MINOR = new Set(['pawn', 'horse', 'elephant']);
      const MAJOR = new Set(['rook', 'king']);
      if (MINOR.has(piece.type) && MAJOR.has(target.type)) return false;
      return true;
    }
  };
});
