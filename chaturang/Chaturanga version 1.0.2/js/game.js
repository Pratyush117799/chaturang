// Chaturanga 1.0.2 - Chaturaji (4-Player) Game Engine
class Piece {
  constructor(type, color, owner) {
    this.type = type; // 'pawn', 'horse', 'elephant', 'rook', 'king'
    this.color = color; // 'red', 'green', 'blue', 'yellow'
    this.owner = owner; // player id 0..3
    this.hasMoved = false;
  }

  isMinor() {
    return this.type === 'pawn' || this.type === 'horse' || this.type === 'elephant';
  }

  isMajor() {
    return this.type === 'rook' || this.type === 'horse' || this.type === 'king';
  }

  isLarge() {
    return this.type === 'rook' || this.type === 'horse' || this.type === 'elephant' || this.type === 'king';
  }

  getValue() {
    const values = { pawn: 1, horse: 3, elephant: 3, rook: 5, king: Infinity };
    return values[this.type] || 0;
  }
}

class Player {
  constructor(id, color, team) {
    this.id = id;
    this.color = color;
    this.team = team;
    this.frozen = false;
    this.kingsCaptured = 0;
    this.capturedPieces = [];
    this.hasKingOnBoard = true;
    this.eliminated = false; // Single mode: true when king captured
  }
}

class Board {
  constructor() {
    this.squares = {};
  }

  get(square) {
    return this.squares[square] || null;
  }

  set(square, piece) {
    if (piece) {
      this.squares[square] = piece;
    } else {
      delete this.squares[square];
    }
  }

  isEmpty(square) {
    return !(square in this.squares);
  }

  getAllEmptySquares() {
    const empty = [];
    for (let r = 1; r <= 8; r++) {
      for (let f = 0; f < 8; f++) {
        const sq = String.fromCharCode(97 + f) + r;
        if (this.isEmpty(sq)) empty.push(sq);
      }
    }
    return empty;
  }
}

class Game {
  constructor() {
    this.board = new Board();
    this.players = [
      new Player(0, 'red', 0),
      new Player(1, 'blue', 1),
      new Player(2, 'green', 0),
      new Player(3, 'yellow', 1)
    ];
    this.turnIndex = 0;
    this.moveHistory = [];
    this.forcedPiece = null;
    this.lastDice = null;
    this.selectedSquare = null;
    this.legalMoves = [];
    this.pendingKingRespawn = null;
    this.pendingElimination = null; // Single mode: { playerId, squares } for animation
    this.gameOver = false;
    this.winner = null;
    this.winnerPlayerId = null;
    this.gameMode = 'team';
    this.initWarnings = [];
    this.playerLastDice = [null, null, null, null];
    this.initPosition();
  }

  setGameMode(mode) {
    if (this.moveHistory.length === 0) this.gameMode = mode;
  }

  initPosition() {
    this.initWarnings = [];
    this.board.squares = {};
    this.players.forEach(p => {
      p.frozen = false;
      p.kingsCaptured = 0;
      p.capturedPieces = [];
      p.hasKingOnBoard = true;
      p.eliminated = false;
    });

    const place = (type, owner, square) => {
      if (!this.board.isEmpty(square)) {
        this.initWarnings.push(`Setup conflict at ${square}`);
        return false;
      }
      this.board.set(square, new Piece(type, this.players[owner].color, owner));
      return true;
    };

    place('rook', 0, 'a1');
    place('rook', 1, 'h1');
    place('rook', 2, 'h8');
    place('rook', 3, 'a8');

    place('horse', 0, 'b1');
    place('horse', 1, 'h2');
    place('horse', 2, 'g8');
    place('horse', 3, 'a7');

    place('elephant', 0, 'c1');
    place('elephant', 1, 'h3');
    place('elephant', 2, 'f8');
    place('elephant', 3, 'a6');

    place('king', 0, 'd1');
    place('king', 1, 'h4');
    place('king', 2, 'e8');
    place('king', 3, 'a5');

    ['a2', 'b2', 'c2', 'd2'].forEach(sq => place('pawn', 0, sq));
    ['g1', 'g2', 'g3', 'g4'].forEach(sq => place('pawn', 1, sq));
    ['h7', 'g7', 'f7', 'e7'].forEach(sq => place('pawn', 2, sq));
    ['b5', 'b6', 'b7', 'b8'].forEach(sq => place('pawn', 3, sq));
  }

  // Promotion by symmetry: square -> piece type for that player
  getPromotionPieceType(owner, square) {
    const maps = {
      0: { 'a8': 'rook', 'b8': 'horse', 'c8': 'elephant', 'd8': 'king' },
      1: { 'a1': 'rook', 'a2': 'horse', 'a3': 'elephant', 'a4': 'king' },
      2: { 'h1': 'rook', 'g1': 'horse', 'f1': 'elephant', 'e1': 'king' },
      3: { 'h8': 'rook', 'h7': 'horse', 'h6': 'elephant', 'h5': 'king' }
    };
    return maps[owner] && maps[owner][square] ? maps[owner][square] : null;
  }

  isKingPromotionSquare(owner, square) {
    const t = this.getPromotionPieceType(owner, square);
    return t === 'king';
  }

  coordsToSquare(fileIdx, rankIdx) {
    return String.fromCharCode(97 + fileIdx) + (rankIdx + 1);
  }

  squareToCoords(square) {
    const f = square.charCodeAt(0) - 97;
    const r = parseInt(square[1], 10) - 1;
    return [f, r];
  }

  inBounds(f, r) {
    return f >= 0 && f < 8 && r >= 0 && r < 8;
  }

  getPlayer() {
    return this.players[this.turnIndex];
  }

  nextTurn() {
    this.turnIndex = (this.turnIndex + 1) % 4;
    let count = 0;
    while (this.players[this.turnIndex].eliminated && count < 4) {
      this.turnIndex = (this.turnIndex + 1) % 4;
      count++;
    }
    this.selectedSquare = null;
    this.legalMoves = [];
  }

  rollDice() {
    const d = Math.floor(Math.random() * 6) + 1;
    this.lastDice = d;
    this.forcedPiece = this.diceToPiece(d);
    const player = this.getPlayer();
    if (player && !player.eliminated) {
      this.playerLastDice[player.id] = d;
    }
    return d;
  }

  diceToPiece(d) {
    if (d === 1) return 'rook';
    if (d === 2) return 'any';
    if (d === 3) return 'horse';
    if (d === 4) return 'elephant';
    if (d === 5) return 'any';
    if (d === 6) return 'pawn-king';
    return 'any';
  }

  getLegalMoves(square) {
    const piece = this.board.get(square);
    if (!piece) return [];

    const player = this.getPlayer();
    if (!player || piece.owner !== player.id) return [];
    if (player.frozen || player.eliminated) return [];

    if (this.forcedPiece) {
      if (this.forcedPiece === 'pawn-king') {
        if (piece.type !== 'pawn' && piece.type !== 'king') return [];
      } else if (this.forcedPiece !== 'any' && piece.type !== this.forcedPiece) {
        return [];
      }
    }

    const [f, r] = this.squareToCoords(square);
    const moves = [];

    const canCapture = (piece, target) => {
      if (!target || target.owner === piece.owner) return false;
      // Raja cannot capture Raja
      if (piece.type === 'king' && target.type === 'king') return false;
      if (piece.isMinor() && target.isMajor()) return false;
      return true;
    };

    if (piece.type === 'pawn') {
      const owner = piece.owner;
      const tryForward = (df, dr) => {
        const tf = f + df, tr = r + dr;
        if (!this.inBounds(tf, tr)) return;
        const to = this.coordsToSquare(tf, tr);
        if (!this.board.isEmpty(to)) return;
        // King promotion square and king alive -> not valid
        if (this.isKingPromotionSquare(owner, to) && this.players[owner].hasKingOnBoard) return;
        moves.push(to);
      };
      const tryCapture = (df, dr) => {
        const tf = f + df, tr = r + dr;
        if (!this.inBounds(tf, tr)) return;
        const sq = this.coordsToSquare(tf, tr);
        const target = this.board.get(sq);
        if (!canCapture(piece, target)) return;
        if (this.isKingPromotionSquare(owner, sq) && this.players[owner].hasKingOnBoard) return;
        moves.push(sq);
      };

      if (owner === 0 || owner === 2) {
        const dirRank = owner === 0 ? 1 : -1;
        tryForward(0, dirRank);
        tryCapture(-1, dirRank);
        tryCapture(1, dirRank);
      } else if (owner === 1) {
        tryForward(-1, 0);
        tryCapture(-1, 1);
        tryCapture(-1, -1);
      } else {
        tryForward(1, 0);
        tryCapture(1, 1);
        tryCapture(1, -1);
      }
    } else if (piece.type === 'rook') {
      const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      for (const [df, dr] of dirs) {
        let tf = f + df, tr = r + dr;
        while (this.inBounds(tf, tr)) {
          const sq = this.coordsToSquare(tf, tr);
          const target = this.board.get(sq);
          if (!target) {
            moves.push(sq);
          } else {
            if (canCapture(piece, target)) moves.push(sq);
            break;
          }
          tf += df;
          tr += dr;
        }
      }
    } else if (piece.type === 'horse') {
      const offsets = [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]];
      for (const [df, dr] of offsets) {
        const tf = f + df, tr = r + dr;
        if (!this.inBounds(tf, tr)) continue;
        const sq = this.coordsToSquare(tf, tr);
        const target = this.board.get(sq);
        if (!target) moves.push(sq);
        else if (canCapture(piece, target)) moves.push(sq);
      }
    } else if (piece.type === 'elephant') {
      // Danti: exactly 2 squares in any direction EXCEPT left/right (no horizontal)
      const dirs = [[0, 2], [0, -2], [2, 2], [2, -2], [-2, 2], [-2, -2]];
      for (const [df, dr] of dirs) {
        const tf = f + df, tr = r + dr;
        if (!this.inBounds(tf, tr)) continue;
        const sq = this.coordsToSquare(tf, tr);
        const target = this.board.get(sq);
        if (!target) moves.push(sq);
        else if (canCapture(piece, target)) moves.push(sq);
      }
    } else if (piece.type === 'king') {
      for (const df of [-1, 0, 1]) {
        for (const dr of [-1, 0, 1]) {
          if (df === 0 && dr === 0) continue;
          const tf = f + df, tr = r + dr;
          if (!this.inBounds(tf, tr)) continue;
          const sq = this.coordsToSquare(tf, tr);
          const target = this.board.get(sq);
          if (!target) moves.push(sq);
          else if (canCapture(piece, target)) moves.push(sq);
        }
      }
    }

    return moves;
  }

  checkPawnPromotion(square, piece) {
    if (piece.type !== 'pawn') return false;
    const [_, r] = this.squareToCoords(square);
    const promotionRank = (piece.owner === 0 || piece.owner === 3) ? 8 : 1;
    return r + 1 === promotionRank;
  }

  makeMove(from, to) {
    const piece = this.board.get(from);
    if (!piece) return false;

    const legal = this.getLegalMoves(from);
    if (!legal.includes(to)) return false;

    const target = this.board.get(to);
    const player = this.getPlayer();

    // Capture
    if (target) {
      if (target.type === 'king') {
        const capturedPlayer = this.players[target.owner];
        capturedPlayer.kingsCaptured += 1;
        capturedPlayer.hasKingOnBoard = false;

        if (this.gameMode === 'single') {
          capturedPlayer.eliminated = true;
          const toRemove = [];
          for (const sq of Object.keys(this.board.squares)) {
            if (this.board.get(sq).owner === capturedPlayer.id) toRemove.push(sq);
          }
          this.pendingElimination = { playerId: capturedPlayer.id, squares: toRemove.filter(sq => sq !== to) };
        } else {
          const teammate = this.players.find(p => p.team === capturedPlayer.team && p.id !== capturedPlayer.id);
          if (teammate && teammate.kingsCaptured > 0 && teammate.kingsCaptured < 2) {
            this.pendingKingRespawn = { playerId: teammate.id, capturedBy: player.id };
          }
          if (capturedPlayer.kingsCaptured >= 2) capturedPlayer.frozen = true;
        }
      }
      player.capturedPieces.push(target);
    }

    this.board.set(to, piece);
    this.board.set(from, null);
    piece.hasMoved = true;

    let promotedType = null;
    if (this.checkPawnPromotion(to, piece)) {
      promotedType = this.getPromotionPieceType(piece.owner, to);
      if (promotedType) {
        const newPiece = new Piece(promotedType, piece.color, piece.owner);
        this.board.set(to, newPiece);
        if (promotedType === 'king') {
          this.players[piece.owner].hasKingOnBoard = true;
          this.players[piece.owner].kingsCaptured = Math.max(0, this.players[piece.owner].kingsCaptured - 1);
        }
      }
    }

    this.moveHistory.push({
      from,
      to,
      piece,
      cap: target,
      promoted: !!promotedType,
      promotedType: promotedType || undefined,
      playerId: player.id,
      forfeit: false,
      diceValue: this.lastDice,
      pieceType: piece.type
    });

    this.forcedPiece = null;
    this.lastDice = null;
    this.selectedSquare = null;
    this.legalMoves = [];

    this.checkGameEnd();

    this.nextTurn();
    return true;
  }

  respawnKing(square) {
    if (!this.pendingKingRespawn) return false;
    const { playerId } = this.pendingKingRespawn;
    const player = this.players[playerId];
    if (!this.board.isEmpty(square)) return false;
    const king = new Piece('king', player.color, playerId);
    this.board.set(square, king);
    player.hasKingOnBoard = true;
    player.kingsCaptured = Math.max(0, player.kingsCaptured - 1);
    this.pendingKingRespawn = null;
    return true;
  }

  checkGameEnd() {
    if (this.gameMode === 'single') {
      const withKing = this.players.filter(p => !p.eliminated && p.hasKingOnBoard);
      if (withKing.length <= 1) {
        this.gameOver = true;
        if (withKing.length === 1) this.winnerPlayerId = withKing[0].id;
      }
      return;
    }
    const team0Kings = this.players.filter(p => p.team === 0 && p.hasKingOnBoard).length;
    const team1Kings = this.players.filter(p => p.team === 1 && p.hasKingOnBoard).length;
    if (team0Kings === 0) {
      this.gameOver = true;
      this.winner = 1;
      return;
    }
    if (team1Kings === 0) {
      this.gameOver = true;
      this.winner = 0;
      return;
    }
    const currentPlayer = this.getPlayer();
    if (currentPlayer && !currentPlayer.frozen && !currentPlayer.eliminated) {
      let hasLegalMove = false;
      for (let r = 1; r <= 8; r++) {
        for (let f = 0; f < 8; f++) {
          const sq = this.coordsToSquare(f, r);
          const piece = this.board.get(sq);
          if (piece && piece.owner === currentPlayer.id && this.getLegalMoves(sq).length > 0) {
            hasLegalMove = true;
            break;
          }
        }
        if (hasLegalMove) return;
      }
      if (!hasLegalMove) {
        this.gameOver = true;
        this.winner = (currentPlayer.team === 0) ? 1 : 0;
      }
    }
  }

  hasAnyLegalMove() {
    const player = this.getPlayer();
    if (!player || player.frozen || player.eliminated) return false;
    for (let r = 1; r <= 8; r++) {
      for (let f = 0; f < 8; f++) {
        const sq = this.coordsToSquare(f, r);
        const piece = this.board.get(sq);
        if (piece && piece.owner === player.id && this.getLegalMoves(sq).length > 0) return true;
      }
    }
    return false;
  }

  // Call after roll: if no legal move, record forfeit and advance turn. Returns true if forfeited.
  autoForfeitIfNoMove() {
    if (!this.forcedPiece || this.gameOver) return false;
    if (this.hasAnyLegalMove()) return false;
    const player = this.getPlayer();
    if (!player || player.eliminated) return false;
    this.recordForfeit();
    return true;
  }

  forfeitTurn() {
    if (!this.forcedPiece || this.gameOver) return false;
    const player = this.getPlayer();
    if (!player || player.eliminated) return false;
    this.recordForfeit();
    return true;
  }

  recordForfeit() {
    const player = this.getPlayer();
    if (!player) return;
    this.moveHistory.push({
      from: null,
      to: null,
      piece: null,
      cap: null,
      promoted: false,
      playerId: player.id,
      forfeit: true,
      forfeitPiece: this.forcedPiece,
      diceValue: this.lastDice
    });
    this.forcedPiece = null;
    this.lastDice = null;
    this.nextTurn();
  }

  completeElimination() {
    if (!this.pendingElimination) return;
    const { squares } = this.pendingElimination;
    squares.forEach(sq => this.board.set(sq, null));
    this.pendingElimination = null;
    this.checkGameEnd();
  }

  canPlayerMove(playerId) {
    const player = this.players[playerId];
    if (!player || player.frozen || player.eliminated) return false;
    for (let r = 1; r <= 8; r++) {
      for (let f = 0; f < 8; f++) {
        const sq = this.coordsToSquare(f, r);
        const piece = this.board.get(sq);
        if (piece && piece.owner === playerId && this.getLegalMoves(sq).length > 0) return true;
      }
    }
    return false;
  }
}

if (typeof window !== 'undefined') window.ChaturangaGame = Game;
