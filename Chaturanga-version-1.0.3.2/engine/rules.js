/**
 * Chaturanga 1.0.3 — Rules (optional extraction)
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
      if (piece.isMinor && piece.isMinor() && target.isMinor && target.isMinor()) return false;
      return true;
    }
  };
});
