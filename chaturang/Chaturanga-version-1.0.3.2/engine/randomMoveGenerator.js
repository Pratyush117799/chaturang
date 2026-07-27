/**
 * Chaturanga 1.0.3 — Random Move Generator (engine)
 * Uses game instance: forcedPiece, turnIndex, getLegalMoves, board.
 * Returns { from, to } or null. Does not mutate game.
 */
(function (root, factory) {
  if (typeof define === 'function' && define.amd) {
    define([], factory);
  } else if (typeof module === 'object' && module.exports) {
    module.exports = factory();
  } else {
    root.ChaturangaRandomMoveGenerator = factory();
  }
})(typeof self !== 'undefined' ? self : this, function () {
  'use strict';

  function diceToPiece(d) {
    if (d === 1) return 'rook';
    if (d === 2 || d === 5) return 'any';
    if (d === 3) return 'horse';
    if (d === 4) return 'elephant';
    if (d === 6) return 'pawn-king';
    return 'any';
  }

  function findPiecesOfType(game, playerId, pieceType) {
    const squares = [];
    for (let r = 1; r <= 8; r++) {
      for (let f = 0; f < 8; f++) {
        const sq = String.fromCharCode(97 + f) + r;
        const piece = game.board.get(sq);
        if (!piece || piece.owner !== playerId) continue;
        if (pieceType === 'pawn-king') {
          if (piece.type === 'pawn' || piece.type === 'king') squares.push(sq);
        } else if (pieceType === 'any') {
          squares.push(sq);
        } else if (piece.type === pieceType) {
          squares.push(sq);
        }
      }
    }
    return squares;
  }

  /**
   * Get one random legal move for the current turn.
   * Assumes game.forcedPiece and game.lastDice are already set (dice already rolled).
   * @param {Game} game - Chaturanga Game instance
   * @returns {{ from: string, to: string } | null}
   */
  function getRandomMove(game) {
    if (!game || game.gameOver) return null;
    const player = game.getPlayer();
    if (!player || player.eliminated || player.frozen) return null;
    const forcedPiece = game.forcedPiece;
    if (!forcedPiece) return null;

    const playerId = game.turnIndex;
    const fromSquares = findPiecesOfType(game, playerId, forcedPiece);
    const allMoves = [];
    for (let i = 0; i < fromSquares.length; i++) {
      const from = fromSquares[i];
      const moves = game.getLegalMoves(from);
      for (let j = 0; j < moves.length; j++) {
        allMoves.push({ from: from, to: moves[j] });
      }
    }
    if (allMoves.length === 0) return null;
    return allMoves[Math.floor(Math.random() * allMoves.length)];
  }

  return {
    diceToPiece: diceToPiece,
    findPiecesOfType: findPiecesOfType,
    getRandomMove: getRandomMove
  };
});
