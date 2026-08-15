/**
 * Chaturanga v1.0.6 — Rules (manual.md compliant)
 * Source: manual.md §1 Combat & Capture Rules
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

  // Confirmed pairing: South+North (0,2) vs West+East (1,3) — matches game.js Player ids.
  var TEAMS = { 0: 2, 2: 0, 1: 3, 3: 1 };

  function getPartner(playerId) {
    return TEAMS[playerId] || null;
  }

  function isTeammate(ownerA, ownerB) {
    return ownerA !== ownerB && TEAMS[ownerA] === ownerB;
  }

  var MINOR = new Set(['pawn', 'horse', 'elephant']); // Nara, Ashva, Danti
  var MAJOR = new Set(['rook', 'king']);               // Ratha, Rajan

  /**
   * canCapture — manual.md §1
   * - Cannot capture own piece.
   * - Allies (teammates) CAN capture each other's pieces, EXCEPT partner's King.
   * - Minor pieces cannot capture Major pieces (applies to all targets).
   * - Major pieces can capture any piece, including enemy King (required to win).
   */
  function canCapture(piece, target) {
    if (!target) return false;
    if (target.owner === piece.owner) return false;

    if (isTeammate(piece.owner, target.owner) && target.type === 'king') {
      return false; // partner's King is protected
    }

    if (MINOR.has(piece.type) && MAJOR.has(target.type)) return false;

    return true;
  }

  return {
    TEAMS: TEAMS,
    getPartner: getPartner,
    isTeammate: isTeammate,
    canCapture: canCapture
  };
});
