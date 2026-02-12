// Improved Chaturanga Game Engine with Complete Rules
class Piece {
  constructor(type, color, owner) {
    this.type = type; // 'pawn', 'camel', 'horse', 'elephant', 'rook', 'king'
    this.color = color; // 'red', 'green', 'black', 'yellow'
    this.owner = owner; // player id 0..3
    this.hasMoved = false; // for pawn promotion tracking
  }

  isMinor() {
    // Minor: Pawn, Horse, Elephant
    return this.type === 'pawn' || this.type === 'horse' || this.type === 'elephant';
  }

  isMajor() {
    // Major: Rook, Horse, King (Horse is both!)
    return this.type === 'rook' || this.type === 'horse' || this.type === 'king';
  }

  isLarge() {
    // Large pieces for display purposes: Rook, Horse, Elephant, King
    return this.type === 'rook' || this.type === 'horse' || this.type === 'elephant' || this.type === 'king';
  }

  getValue() {
    const values = {
      pawn: 1,
      horse: 3.5,
      elephant: 2.5,
      rook: 5,
      king: Infinity
    };
    return values[this.type] || 0;
  }
}

class Player {
  constructor(id, color, team) {
    this.id = id;
    this.color = color;
    this.team = team;
    this.frozen = false; // when king captured twice
    this.kingsCaptured = 0; // death count for king(s)
    this.capturedPieces = []; // pieces captured by this player
    this.hasKingOnBoard = true; // track if king is on board
  }
}

class Board {
  constructor() {
    this.squares = {}; // map square->Piece
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
        if (this.isEmpty(sq)) {
          empty.push(sq);
        }
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
      new Player(1, 'black', 1),
      new Player(2, 'green', 0),
      new Player(3, 'yellow', 1)
    ];
    this.turnIndex = 0;
    this.moveHistory = [];
    this.forcedPiece = null; // piece type forced by dice
    this.lastDice = null;
    this.selectedSquare = null;
    this.legalMoves = [];
    this.pendingPromotion = null;
    this.pendingKingRespawn = null;
    this.gameOver = false;
    this.winner = null;
    this.initWarnings = [];
    this.initPosition();
  }

  initPosition() {
    // Custom initial setup (as provided by user)
    // Players are mapped as:
    // Player 1 -> owner 0 (red)
    // Player 2 -> owner 1 (black)
    // Player 3 -> owner 2 (green)
    // Player 4 -> owner 3 (yellow)

    this.initWarnings = [];
    this.board.squares = {};
    this.players.forEach(p => {
      p.frozen = false;
      p.kingsCaptured = 0;
      p.capturedPieces = [];
      p.hasKingOnBoard = true;
    });

    const place = (type, owner, square) => {
      if (!this.board.isEmpty(square)) {
        this.initWarnings.push(`Setup conflict at ${square}: tried to place ${type} for player ${owner + 1}`);
        return false;
      }
      this.board.set(square, new Piece(type, this.players[owner].color, owner));
      return true;
    };

    // Ratha / Rook
    place('rook', 0, 'a1');
    place('rook', 1, 'h1');
    place('rook', 2, 'h8');
    place('rook', 3, 'a8');

    // Ashva / Horse (Knight)
    place('horse', 0, 'b1');
    place('horse', 1, 'h2');
    place('horse', 2, 'g8');
    place('horse', 3, 'a7');

    // Danti / Elephant
    place('elephant', 0, 'c1');
    place('elephant', 1, 'h3');
    place('elephant', 2, 'f8');
    // Yellow elephant requested at a6
    place('elephant', 3, 'a6');

    // Rajan / King
    place('king', 0, 'd1');
    place('king', 1, 'h4');
    place('king', 2, 'e8');
    place('king', 3, 'a5');

    // Nara / Pawns
    ['a2', 'b2', 'c2', 'd2'].forEach(sq => place('pawn', 0, sq));
    ['g1', 'g2', 'g3', 'g4'].forEach(sq => place('pawn', 1, sq));
    ['h7', 'g7', 'f7', 'e7'].forEach(sq => place('pawn', 2, sq));

    ['b5', 'b6', 'b7', 'b8'].forEach(sq => place('pawn', 3, sq));
  }

  coordsToSquare(fileIdx, rankIdx) {
    return String.fromCharCode(97 + fileIdx) + (rankIdx + 1);
  }

  squareToCoords(square) {
    const f = square.charCodeAt(0) - 97;
    const r = parseInt(square[1]) - 1;
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
    this.selectedSquare = null;
    this.legalMoves = [];
  }

  rollDice() {
    const d = Math.floor(Math.random() * 6) + 1;
    this.lastDice = d;
    this.forcedPiece = this.diceToPiece(d);
    return d;
  }

  diceToPiece(d) {
    // According to rules: 1=Rook, 3=Horse, 4=Elephant, 6=Pawn/King
    // For 2 and 5, we'll use "any" or assign them
    if (d === 1) return 'rook';
    if (d === 2) return 'any'; // Not specified, allow any
    if (d === 3) return 'horse';
    if (d === 4) return 'elephant';
    if (d === 5) return 'any'; // Not specified, allow any
    if (d === 6) return 'pawn-king'; // Can be either pawn or king
    return 'any';
  }

  getLegalMoves(square) {
    const piece = this.board.get(square);
    if (!piece) return [];

    const player = this.getPlayer();
    if (piece.owner !== player.id) return [];
    if (player.frozen) return [];

    // Enforce dice constraint
    if (this.forcedPiece) {
      if (this.forcedPiece === 'pawn-king') {
        if (piece.type !== 'pawn' && piece.type !== 'king') return [];
      } else if (this.forcedPiece !== 'any' && piece.type !== this.forcedPiece) {
        return [];
      }
    }

    const [f, r] = this.squareToCoords(square);
    const moves = [];

    if (piece.type === 'pawn') {
      // Pawn moves one step "forward" and captures diagonally forward.
      // Forward direction depends on player:
      // - Red (0): towards higher ranks  (0, +1)
      // - Black (1): towards lower files (-1, 0)  e.g. g1 -> f1
      // - Green (2): towards lower ranks (0, -1)
      // - Yellow (3): towards higher files (+1, 0) e.g. b6 -> c6

      const owner = piece.owner;

      const tryForward = (df, dr) => {
        const tf = f + df;
        const tr = r + dr;
        if (!this.inBounds(tf, tr)) return;
        const to = this.coordsToSquare(tf, tr);
        if (this.board.isEmpty(to)) moves.push(to);
      };

      const tryCapture = (df, dr) => {
        const tf = f + df;
        const tr = r + dr;
        if (!this.inBounds(tf, tr)) return;
        const sq = this.coordsToSquare(tf, tr);
        const target = this.board.get(sq);
        if (target && target.owner !== piece.owner) {
          if (!piece.isMinor() || !target.isMajor()) {
            moves.push(sq);
          }
        }
      };

      if (owner === 0 || owner === 2) {
        // Vertical movers (red up, green down)
        const dirRank = owner === 0 ? 1 : -1;
        tryForward(0, dirRank);
        tryCapture(-1, dirRank);
        tryCapture(1, dirRank);
      } else if (owner === 1) {
        // Black: moves left along file towards center
        tryForward(-1, 0);
        tryCapture(-1, 1);
        tryCapture(-1, -1);
      } else if (owner === 3) {
        // Yellow: moves right along file towards center
        tryForward(1, 0);
        tryCapture(1, 1);
        tryCapture(1, -1);
      }
    } else if (piece.type === 'rook') {
      // Rook moves like chess rook (horizontal/vertical)
      const dirs = [[1, 0], [-1, 0], [0, 1], [0, -1]];
      for (const [df, dr] of dirs) {
        let tf = f + df;
        let tr = r + dr;
        while (this.inBounds(tf, tr)) {
          const sq = this.coordsToSquare(tf, tr);
          const target = this.board.get(sq);
          if (!target) {
            moves.push(sq);
          } else {
            if (target.owner !== piece.owner) {
              // Check minor/major rule
              if (!piece.isMinor() || !target.isMajor()) {
                moves.push(sq);
              }
            }
            break;
          }
          tf += df;
          tr += dr;
        }
      }
    } else if (piece.type === 'horse') {
      // Horse moves like knight (L-shape)
      const offsets = [[2, 1], [2, -1], [-2, 1], [-2, -1], [1, 2], [1, -2], [-1, 2], [-1, -2]];
      for (const [df, dr] of offsets) {
        const tf = f + df;
        const tr = r + dr;
        if (this.inBounds(tf, tr)) {
          const sq = this.coordsToSquare(tf, tr);
          const target = this.board.get(sq);
          if (!target || target.owner !== piece.owner) {
            if (!target) {
              moves.push(sq);
            } else {
              // Check minor/major rule
              if (!piece.isMinor() || !target.isMajor()) {
                moves.push(sq);
              }
            }
          }
        }
      }
    } else if (piece.type === 'elephant') {
      // Elephant: Version II - moves exactly 2 squares in any direction
      const dirs = [[2, 0], [-2, 0], [0, 2], [0, -2], [2, 2], [2, -2], [-2, 2], [-2, -2]];
      for (const [df, dr] of dirs) {
        const tf = f + df;
        const tr = r + dr;
        if (this.inBounds(tf, tr)) {
          const sq = this.coordsToSquare(tf, tr);
          const target = this.board.get(sq);
          if (!target || (target.owner !== piece.owner)) {
            if (!target) {
              moves.push(sq);
            } else {
              // Check minor/major rule
              if (!piece.isMinor() || !target.isMajor()) {
                moves.push(sq);
              }
            }
          }
        }
      }
    } else if (piece.type === 'king') {
      // King moves one step in any direction
      for (const df of [-1, 0, 1]) {
        for (const dr of [-1, 0, 1]) {
          if (df === 0 && dr === 0) continue;
          const tf = f + df;
          const tr = r + dr;
          if (this.inBounds(tf, tr)) {
            const sq = this.coordsToSquare(tf, tr);
            const target = this.board.get(sq);
            if (!target || target.owner !== piece.owner) {
              if (!target) {
                moves.push(sq);
              } else {
                // Check minor/major rule
                if (!piece.isMinor() || !target.isMajor()) {
                  moves.push(sq);
                }
              }
            }
          }
        }
      }
    }

    return moves;
  }

  checkPawnPromotion(square, piece) {
    // Check if pawn reached promotion square (G2 or corresponding square)
    // For each player, check their promotion rank
    const [f, r] = this.squareToCoords(square);
    const file = String.fromCharCode(97 + f);
    
    // Promotion happens when pawn reaches the opposite side
    // Red/Yellow: rank 8, Black/Green: rank 1
    const promotionRank = (piece.owner === 0 || piece.owner === 3) ? 8 : 1;
    
    if (piece.type === 'pawn' && r + 1 === promotionRank) {
      return true;
    }
    return false;
  }

  makeMove(from, to) {
    const piece = this.board.get(from);
    if (!piece) return false;

    const legal = this.getLegalMoves(from);
    if (!legal.includes(to)) return false;

    const target = this.board.get(to);
    const player = this.getPlayer();

    // Handle capture
    if (target) {
      // Check if capturing king
      if (target.type === 'king') {
        const capturedPlayer = this.players[target.owner];
        capturedPlayer.kingsCaptured += 1;
        capturedPlayer.hasKingOnBoard = false;

        // Check if king can respawn (teammate captured opponent king)
        const teammate = this.players.find(p => p.team === capturedPlayer.team && p.id !== capturedPlayer.id);
        if (teammate && teammate.kingsCaptured > 0 && teammate.kingsCaptured < 2) {
          // Teammate's king can respawn
          this.pendingKingRespawn = {
            playerId: teammate.id,
            capturedBy: player.id
          };
        }

        // If king captured twice, freeze player
        if (capturedPlayer.kingsCaptured >= 2) {
          capturedPlayer.frozen = true;
        }
      }

      // Add to captured pieces
      player.capturedPieces.push(target);
    }

    // Move piece
    this.board.set(to, piece);
    this.board.set(from, null);
    piece.hasMoved = true;

    // Check for pawn promotion
    if (this.checkPawnPromotion(to, piece)) {
      this.pendingPromotion = { square: to, piece: piece };
      this.moveHistory.push({
        from,
        to,
        piece,
        cap: target,
        promoted: true,
        playerId: player.id,
        forfeit: false
      });
      return true; // Promotion will be handled separately
    }

    // Record move
    this.moveHistory.push({
      from,
      to,
      piece,
      cap: target,
      promoted: false,
      playerId: player.id,
      forfeit: false
    });

    // Reset dice
    this.forcedPiece = null;
    this.lastDice = null;
    this.selectedSquare = null;
    this.legalMoves = [];

    // Check for game end
    this.checkGameEnd();

    // Next turn (unless promotion pending)
    if (!this.pendingPromotion) {
      this.nextTurn();
    }

    return true;
  }

  promotePawn(pieceType) {
    if (!this.pendingPromotion) return false;

    const { square, piece } = this.pendingPromotion;
    const newPiece = new Piece(pieceType, piece.color, piece.owner);
    this.board.set(square, newPiece);

    this.pendingPromotion = null;
    this.nextTurn();
    return true;
  }

  respawnKing(square) {
    if (!this.pendingKingRespawn) return false;

    const { playerId } = this.pendingKingRespawn;
    const player = this.players[playerId];

    if (this.board.isEmpty(square)) {
      const king = new Piece('king', player.color, playerId);
      this.board.set(square, king);
      player.hasKingOnBoard = true;
      player.kingsCaptured = Math.max(0, player.kingsCaptured - 1);
      this.pendingKingRespawn = null;
      return true;
    }

    return false;
  }

  checkGameEnd() {
    // Check if any team has lost both kings permanently
    const team0Kings = this.players.filter(p => p.team === 0 && p.hasKingOnBoard).length;
    const team1Kings = this.players.filter(p => p.team === 1 && p.hasKingOnBoard).length;

    if (team0Kings === 0) {
      this.gameOver = true;
      this.winner = 1; // Team 1 wins
      return;
    }

    if (team1Kings === 0) {
      this.gameOver = true;
      this.winner = 0; // Team 0 wins
      return;
    }

    // Check for stalemate (player cannot make any move)
    const currentPlayer = this.getPlayer();
    if (!currentPlayer.frozen) {
      let hasLegalMove = false;
      for (let r = 1; r <= 8; r++) {
        for (let f = 0; f < 8; f++) {
          const sq = this.coordsToSquare(f, r);
          const piece = this.board.get(sq);
          if (piece && piece.owner === currentPlayer.id) {
            const moves = this.getLegalMoves(sq);
            if (moves.length > 0) {
              hasLegalMove = true;
              break;
            }
          }
        }
        if (hasLegalMove) break;
      }

      if (!hasLegalMove) {
        // Stalemate - the player who causes it wins (opponent loses)
        this.gameOver = true;
        this.winner = (currentPlayer.team === 0) ? 1 : 0;
      }
    }
  }

  canPlayerMove(playerId) {
    const player = this.players[playerId];
    if (player.frozen) return false;

    for (let r = 1; r <= 8; r++) {
      for (let f = 0; f < 8; f++) {
        const sq = this.coordsToSquare(f, r);
        const piece = this.board.get(sq);
        if (piece && piece.owner === playerId) {
          const moves = this.getLegalMoves(sq);
          if (moves.length > 0) return true;
        }
      }
    }
    return false;
  }
}

// Expose Game to browser
(function() {
  if (typeof window !== 'undefined') window.ChaturangaGame = Game;
})();
