// Core game engine for 4-player Chaturanga (simplified initial implementation)
class Piece {
  constructor(type, color, owner){
    this.type = type; // 'pawn','camel','horse','elephant','king'
    this.color = color; // visual color string 'red','green','black','yellow'
    this.owner = owner; // player id 0..3
  }
  isSmall(){
    return (this.type === 'pawn' || this.type === 'camel');
  }
  isLarge(){
    return (this.type === 'horse' || this.type === 'elephant' || this.type === 'king');
  }
}

class Player {
  constructor(id, color, team){
    this.id = id; this.color = color; this.team = team;
    this.frozen = false; // when king captured
    this.kingsCaptured = 0; // death count for king(s)
  }
}

class Board {
  constructor(){
    // rows 8..1, files a..h; we'll store by 'a1'..'h8'
    this.squares = {}; // map square->Piece
  }
  get(square){ return this.squares[square] || null }
  set(square,piece){ if(piece) this.squares[square]=piece; else delete this.squares[square] }
  isEmpty(square){ return !(square in this.squares) }
}

class Game {
  constructor(){
    this.board = new Board();
    this.players = [new Player(0,'red',0), new Player(1,'black',1), new Player(2,'green',0), new Player(3,'yellow',1)];
    this.turnIndex = 0; // index in players array
    this.moveHistory = [];
    this.forcedPiece = null; // piece type forced by dice
    this.lastDice = null;
    this.initPosition();
  }

  initPosition(){
    // place pieces in corners: left half files a-d, right half e-h
    const placement = {
      0: {majorRank:1, pawnRank:2, files:['a','b','c','d']}, // red bottom-left
      1: {majorRank:8, pawnRank:7, files:['a','b','c','d']}, // black top-left
      2: {majorRank:8, pawnRank:7, files:['e','f','g','h']}, // green top-right
      3: {majorRank:1, pawnRank:2, files:['e','f','g','h']}  // yellow bottom-right
    };

    for(let pid=0; pid<4; pid++){
      const p = placement[pid];
      // majors on files a-d (or e-h) at majorRank
      const typesOrder = ['elephant','horse','camel','king'];
      for(let i=0;i<4;i++){
        const sq = p.files[i]+p.majorRank;
        this.board.set(sq, new Piece(typesOrder[i], this.players[pid].color, pid));
      }
      // pawns
      for(let i=0;i<4;i++){
        const sq = p.files[i]+p.pawnRank;
        this.board.set(sq, new Piece('pawn', this.players[pid].color, pid));
      }
    }
  }

  coordsToSquare(fileIdx, rankIdx){ return String.fromCharCode(97+fileIdx) + (rankIdx+1) }
  squareToCoords(square){ const f = square.charCodeAt(0)-97; const r = parseInt(square[1])-1; return [f,r] }

  inBounds(f,r){ return f>=0 && f<8 && r>=0 && r<8 }

  getPlayer(){ return this.players[this.turnIndex] }
  nextTurn(){ this.turnIndex = (this.turnIndex+1)%4 }

  rollDice(){ const d = Math.floor(Math.random()*6)+1; this.lastDice = d; this.forcedPiece = this.diceToPiece(d); return d }
  diceToPiece(d){ if(d===1) return 'camel'; if(d===2) return 'horse'; if(d===3) return 'elephant'; if(d===4) return 'king'; if(d===5) return 'pawn'; return 'any' }

  getLegalMoves(square){
    const p = this.board.get(square); if(!p) return [];
    const player = this.getPlayer(); if(p.owner!==player.id) return [];
    if(player.frozen) return [];
    // enforce dice
    if(this.forcedPiece && this.forcedPiece!=='any' && p.type !== this.forcedPiece) return [];

    const [f,r] = this.squareToCoords(square);
    const moves = [];
    if(p.type==='pawn'){
      const dir = (p.owner===0||p.owner===3)? 1 : -1; // red/yellow forward up, black/green forward down
      const rf = f; const rr = r+dir;
      if(this.inBounds(rf,rr)){
        const to = this.coordsToSquare(rf,rr);
        if(this.board.isEmpty(to)) moves.push(to);
      }
      // captures diagonally
      for(const df of [-1,1]){
        const tf=f+df, tr=r+dir;
        if(this.inBounds(tf,tr)){
          const sq=this.coordsToSquare(tf,tr); const target=this.board.get(sq);
          if(target && target.owner!==p.owner && target.isSmall()) moves.push(sq);
        }
      }
    }
    else if(p.type==='camel'){
      // bishop-like
      const dirs=[[1,1],[1,-1],[-1,1],[-1,-1]];
      for(const [df,dr] of dirs){ let tf=f+df, tr=r+dr; while(this.inBounds(tf,tr)){ const sq=this.coordsToSquare(tf,tr); const target=this.board.get(sq); if(!target) moves.push(sq); else { if(target.owner!==p.owner && target.isSmall()) moves.push(sq); break } tf+=df; tr+=dr } }
    }
    else if(p.type==='horse'){
      const offsets=[[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]];
      for(const [df,dr] of offsets){ const tf=f+df, tr=r+dr; if(this.inBounds(tf,tr)){ const sq=this.coordsToSquare(tf,tr); const target=this.board.get(sq); if(!target || target.owner!==p.owner) moves.push(sq) }}
    }
    else if(p.type==='elephant'){
      // rook-like
      const dirs=[[1,0],[-1,0],[0,1],[0,-1]];
      for(const [df,dr] of dirs){ let tf=f+df, tr=r+dr; while(this.inBounds(tf,tr)){ const sq=this.coordsToSquare(tf,tr); const target=this.board.get(sq); if(!target) moves.push(sq); else { if(target.owner!==p.owner) moves.push(sq); break } tf+=df; tr+=dr } }
    }
    else if(p.type==='king'){
      for(const df of [-1,0,1]) for(const dr of [-1,0,1]){ if(df===0&&dr===0) continue; const tf=f+df, tr=r+dr; if(this.inBounds(tf,tr)){ const sq=this.coordsToSquare(tf,tr); const target=this.board.get(sq); if(!target||target.owner!==p.owner) moves.push(sq) }}
    }
    // Additional filter: small cannot capture large
    return moves.filter(to=>{
      const target=this.board.get(to);
      if(!target) return true;
      if(p.isSmall() && target.isLarge()) return false;
      return true;
    });
  }

  makeMove(from,to){
    const piece=this.board.get(from); if(!piece) return false; const legal=this.getLegalMoves(from); if(!legal.includes(to)) return false;
    
    // capture handling
    // ...existing code...
    const target=this.board.get(to);
    // capture handling
    if (target && target.type === 'king') {
      // capture allowed per rules (already restricted by getLegalMoves)
      const owner = this.players[target.owner]; owner.kingsCaptured += 1; owner.frozen = true;
      // mark capture in history
      // trigger teammate capture handling (respawn logic)
      try { this.handleTeammateCapture(piece.owner, target); } catch (e) { /* ignore */ }
    }
    this.board.set(to, piece); this.board.set(from, null);
// ...existing code...
      // capture allowed per rules (already restricted by getLegalMoves)
      // if king captured
        // mark capture in history
        // trigger teammate capture handling (respawn logic)
       
    this.moveHistory.push({from,to,piece,cap:target});
    // reset forcedPiece after successful move
    this.forcedPiece = null; this.lastDice = null;
    this.nextTurn();
    return true;
  }

  // simplistic respawn: when teammate captures an enemy king, respawn if deathCount<2
  handleTeammateCapture(capturingPlayerId, capturedPiece){
    if(capturedPiece.type!=='king') return;
    // find owner team
    const owner = this.players[capturedPiece.owner];
    // if owner.kingsCaptured==1 then respawn
    // find teammate
    const teammate = this.players.find(p=>p.team===owner.team && p.id!==owner.id);
    if(!teammate) return;
    // if teammate captured an enemy king (we assume this function called when capture happened), then respawn owner king
    if(owner.kingsCaptured>0 && owner.kingsCaptured<2){
      // find first empty safe square (simplified: first empty)
      for(let r=0;r<8;r++){
        for(let f=0;f<8;f++){
          const sq=this.coordsToSquare(f,r);
          if(this.board.isEmpty(sq)){
            this.board.set(sq, new Piece('king', owner.color, owner.id));
            owner.frozen = false;
            return;
          }
        }
      }
    }
  }
}

// Expose Game to browser or Node global
(function(){
  if(typeof window !== 'undefined') window.ChaturangaGame = Game;
  if(typeof globalThis !== 'undefined') globalThis.ChaturangaGame = Game;
  if(typeof global !== 'undefined' && typeof global.window === 'undefined') global.ChaturangaGame = Game;
})();