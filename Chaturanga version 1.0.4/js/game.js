// Chaturanga 1.0.4 - Chaturaji (4-Player) Game Engine
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

  // 1.0.3: Major = Raja, Ratha only (king, rook). Ashwa (horse) is minor.
  isMajor() {
    return this.type === 'rook' || this.type === 'king';
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
    this.reset();
  }

  reset() {
    this.frozen = false;
    this.kingsCaptured = 0;
    this.capturedPieces = [];
    this.hasKingOnBoard = true;
    this.eliminated = false;
    this.manualForfeitCount = 0;
    this.isBot = false;
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
        const sq = String.fromCodePoint(97 + f) + r;
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

  setBotConfig(count) {
    // Reset all to human first
    this.players.forEach(p => p.isBot = false);

    // Case 1: 1 Bot -> Blue (Team 2)
    if (count >= 1) this.players[1].isBot = true;

    // Case 2: 2 Bots -> Blue & Yellow (Team 2)
    if (count >= 2) this.players[3].isBot = true; // Yellow

    // Case 3: 3 Bots -> Blue, Green (Team 1 with Human), Yellow
    // "3rd bot will be in team of human player". Human is Red (0). So Green (2) is bot.
    if (count >= 3) this.players[2].isBot = true; // Green

    // Special Case: 4 Bots -> All
    if (count >= 4) this.players[0].isBot = true; // Red
  }

  initPosition() {
    this.initWarnings = [];
    this.board.squares = {};
    this.players.forEach(p => p.reset());

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
    return maps[owner]?.[square] ?? null;
  }

  isKingPromotionSquare(owner, square) {
    const t = this.getPromotionPieceType(owner, square);
    return t === 'king';
  }

  coordsToSquare(fileIdx, rankIdx) {
    return String.fromCodePoint(97 + fileIdx) + (rankIdx + 1);
  }

  squareToCoords(square) {
    const f = square.codePointAt(0) - 97;
    const r = Number.parseInt(square[1], 10) - 1;
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

  canCapture(piece, target) {
    if (!target || target.owner === piece.owner) return false;
    if (piece.isMinor()) {
      if (target.isMinor()) return true;
      if (target.isMajor()) return false;
    }
    return true;
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
    switch (piece.type) {
      case 'pawn':     return this.getPawnMoves(f, r, piece);
      case 'rook':     return this.getRookMoves(f, r, piece);
      case 'horse':    return this.getHorseMoves(f, r, piece);
      case 'elephant': return this.getElephantMoves(f, r, piece);
      case 'king':     return this.getKingMoves(f, r, piece);
      default:         return [];
    }
  }

  getPawnMoves(f, r, piece) {
    const moves = [];
    const owner = piece.owner;
    const tryForward = (df, dr) => {
      const tf = f + df, tr = r + dr;
      if (!this.inBounds(tf, tr)) return;
      const to = this.coordsToSquare(tf, tr);
      if (!this.board.isEmpty(to)) return;
      if (this.isKingPromotionSquare(owner, to) && this.players[owner].hasKingOnBoard) return;
      moves.push(to);
    };
    const tryCapture = (df, dr) => {
      const tf = f + df, tr = r + dr;
      if (!this.inBounds(tf, tr)) return;
      const sq = this.coordsToSquare(tf, tr);
      const target = this.board.get(sq);
      if (!this.canCapture(piece, target)) return;
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
    return moves;
  }

  getRookMoves(f, r, piece) {
    const moves = [];
    const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
    for (const [df, dr] of dirs) {
      let tf = f + df, tr = r + dr;
      while (this.inBounds(tf, tr)) {
        const sq = this.coordsToSquare(tf, tr);
        const target = this.board.get(sq);
        if (target) {
          if (this.canCapture(piece, target)) moves.push(sq);
          break;
        } else {
          moves.push(sq);
        }
        tf += df;
        tr += dr;
      }
    }
    return moves;
  }

  getHorseMoves(f, r, piece) {
    return this.getMovesFromOffsets(f, r, piece, [
      [2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]
    ]);
  }

  getElephantMoves(f, r, piece) {
    // Danti: exactly 2 squares in any direction EXCEPT left/right (no horizontal)
    return this.getMovesFromOffsets(f, r, piece, [
      [0, 2], [0, -2], [2, 2], [2, -2], [-2, 2], [-2, -2]
    ]);
  }

  getKingMoves(f, r, piece) {
    return this.getMovesFromOffsets(f, r, piece, [
      [-1, 1], [0, 1], [1, 1], [-1, 0], [1, 0], [-1, -1], [0, -1], [1, -1]
    ]);
  }

  getMovesFromOffsets(f, r, piece, offsets) {
    const moves = [];
    for (const [df, dr] of offsets) {
      const tf = f + df, tr = r + dr;
      if (this.inBounds(tf, tr)) {
        const sq = this.coordsToSquare(tf, tr);
        const target = this.board.get(sq);
        if (!target || this.canCapture(piece, target)) {
          moves.push(sq);
        }
      }
    }
    return moves;
  }

  checkPawnPromotion(square, piece) {
    if (piece.type !== 'pawn') return false;
    const [, r] = this.squareToCoords(square);
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
      this.handleCapture(player, target, to);
    }

    this.board.set(to, piece);
    this.board.set(from, null);
    piece.hasMoved = true;

    const promotedType = this.handlePawnPromotion(to, piece);

    this.recordMove(from, to, piece, target, promotedType);

    this.checkGameEnd();
    this.nextTurn();
    return true;
  }

  handlePawnPromotion(square, piece) {
    if (!this.checkPawnPromotion(square, piece)) return null;
    const promotedType = this.getPromotionPieceType(piece.owner, square);
    if (!promotedType) return null;

    const newPiece = new Piece(promotedType, piece.color, piece.owner);
    this.board.set(square, newPiece);
    if (promotedType === 'king') {
      const player = this.players[piece.owner];
      player.hasKingOnBoard = true;
      player.kingsCaptured = Math.max(0, player.kingsCaptured - 1);
    }
    return promotedType;
  }

  recordMove(from, to, piece, target, promotedType) {
    this.moveHistory.push({
      from,
      to,
      piece,
      cap: target,
      promoted: !!promotedType,
      promotedType: promotedType || undefined,
      playerId: piece.owner,
      forfeit: false,
      diceValue: this.lastDice,
      pieceType: piece.type
    });

    this.forcedPiece = null;
    this.lastDice = null;
    this.selectedSquare = null;
    this.legalMoves = [];
  }

  handleCapture(player, target, toSquare) {
    if (target.type === 'king') {
      this.handleKingCapture(player, target, toSquare);
    }
    player.capturedPieces.push(target);
  }

  handleKingCapture(player, target, toSquare) {
    const capturedPlayer = this.players[target.owner];
    capturedPlayer.kingsCaptured += 1;
    capturedPlayer.hasKingOnBoard = false;

    if (this.gameMode === 'single') {
      this.handleSingleModeElimination(capturedPlayer, toSquare);
    } else {
      this.handleTeamModeKingCapture(player, capturedPlayer);
    }
  }

  handleSingleModeElimination(capturedPlayer, toSquare) {
    capturedPlayer.eliminated = true;
    const toRemove = Object.keys(this.board.squares).filter(sq => {
      const piece = this.board.get(sq);
      return piece && piece.owner === capturedPlayer.id && sq !== toSquare;
    });
    this.pendingElimination = { playerId: capturedPlayer.id, squares: toRemove };
  }

  handleTeamModeKingCapture(player, capturedPlayer) {
    const teammate = this.players.find(p => p.team === capturedPlayer.team && p.id !== capturedPlayer.id);
    if (teammate && teammate.kingsCaptured > 0 && teammate.kingsCaptured < 2) {
      this.pendingKingRespawn = { playerId: teammate.id, capturedBy: player.id };
    }
    if (capturedPlayer.kingsCaptured >= 2) {
      capturedPlayer.frozen = true;
    }
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
      this.checkSingleModeWinner();
    } else {
      this.checkTeamModeWinner();
    }
  }

  checkSingleModeWinner() {
    const withKing = this.players.filter(p => !p.eliminated && p.hasKingOnBoard);
    if (withKing.length === 1) {
      this.gameOver = true;
      this.winnerPlayerId = withKing[0].id;
    } else if (withKing.length === 0) {
      this.gameOver = true;
      this.winnerPlayerId = null;
    }
  }

  checkTeamModeWinner() {
    const team0Kings = this.players.filter(p => p.team === 0 && p.hasKingOnBoard).length;
    const team1Kings = this.players.filter(p => p.team === 1 && p.hasKingOnBoard).length;

    if (team0Kings === 0 || team1Kings === 0) {
      this.gameOver = true;
      this.winner = (team0Kings === 0) ? 1 : 0;
      return;
    }

    if (!this.hasAnyLegalMove()) {
      const currentPlayer = this.getPlayer();
      if (currentPlayer && !currentPlayer.frozen && !currentPlayer.eliminated) {
        this.gameOver = true;
        this.winner = (currentPlayer.team === 0) ? 1 : 0;
      }
    }
  }

  hasAnyLegalMove() {
    const player = this.getPlayer();
    if (!player || player.frozen || player.eliminated) return false;

    // Iterate through all pieces of the current player and check for legal moves
    for (const [sq, piece] of Object.entries(this.board.squares)) {
      if (piece.owner === player.id) {
        if (this.getLegalMoves(sq).length > 0) return true;
      }
    }
    return false;
  }

  // Call after roll: if no legal move, record auto-forfeit (does not count toward manual limit).
  autoForfeitIfNoMove() {
    if (!this.forcedPiece || this.gameOver) return false;
    if (this.hasAnyLegalMove()) return false;
    const player = this.getPlayer();
    if (!player || player.eliminated) return false;
    this.recordForfeit(false);
    return true;
  }

  forfeitTurn() {
    if (!this.forcedPiece || this.gameOver) return false;
    const player = this.getPlayer();
    if (!player || player.eliminated) return false;
    if (player.manualForfeitCount >= 3) return false;
    this.recordForfeit(true);
    return true;
  }

  recordForfeit(isManual) {
    const player = this.getPlayer();
    if (!player) return;
    if (isManual) player.manualForfeitCount = (player.manualForfeitCount || 0) + 1;
    this.moveHistory.push({
      from: null,
      to: null,
      piece: null,
      cap: null,
      promoted: false,
      playerId: player.id,
      forfeit: true,
      forfeitPiece: this.forcedPiece,
      diceValue: this.lastDice,
      manualForfeit: isManual
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
    for (let r = 0; r < 8; r++) {
      for (let f = 0; f < 8; f++) {
        const sq = this.coordsToSquare(f, r);
        const piece = this.board.get(sq);
        if (piece && piece.owner === playerId && this.getLegalMoves(sq).length > 0) return true;
      }
    }
    return false;
  }
}

globalThis.ChaturangaGame = Game;
