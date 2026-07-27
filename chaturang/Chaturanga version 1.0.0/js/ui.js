// Minimal UI to exercise the core engine
document.addEventListener('DOMContentLoaded', ()=>{
  const game = new window.ChaturangaGame();
  const boardEl = document.getElementById('board');
  const rollBtn = document.getElementById('rollBtn');
  const forfeitBtn = document.getElementById('forfeitBtn');
  const diceFace = document.getElementById('diceFace');
  const forced = document.getElementById('forcedPiece');
  const turnIndicator = document.getElementById('turnIndicator');
  const status = document.getElementById('status');
  const captured = document.getElementById('captured');
  const history = document.getElementById('history');

const fileClass = f => (f+1)%2===0 ? 'dark' : 'light';



  const render = () => {
    boardEl.innerHTML='';
    for (let r = 8; r >= 1; r--) {
      for (let f = 0; f < 8; f++) {
        const sq = String.fromCharCode(97 + f) + r;
        const cell = document.createElement('div');
        cell.className = 'square ' + (((f + r) % 2 === 0) ? 'light' : 'dark');
        cell.dataset.square = sq;
        const piece = game.board.get(sq);
        if (piece) {
          const span = document.createElement('span'); span.className = 'piece';
          // choose symbol by type
          const sym = symbolFor(piece);
          span.textContent = sym;
          // color by owner/team
          span.style.color = piece.color;
          // size small vs large
          span.style.fontSize = piece.isLarge() ? '40px' : '34px';
          span.title = piece.type + ' (' + piece.color + ')';
          cell.appendChild(span);
        }
        cell.addEventListener('click', () => onSquareClick(sq));
        boardEl.appendChild(cell);
      }
    }
    turnIndicator.textContent = 'Turn: Player ' + game.getPlayer().id + ' (' + game.getPlayer().color + ')';
    forced.textContent = 'Forced: ' + (game.forcedPiece || '—');
    captured.textContent = 'Captured: ' + game.moveHistory.filter(m => m.cap).length;
    history.textContent = 'Moves: ' + game.moveHistory.length;
  };

  const symbolFor = piece => {
    // use unicode chess symbols as placeholders; map by color to visually differ
    const map = { pawn: '♟', camel: '♗', horse: '♞', elephant: '♜', king: '♚' };
    return map[piece.type] || '?';
  };

  let selected = null;
  let currentLegal = [];
  const onSquareClick = sq => {
    const piece = game.board.get(sq);
    if (selected) {
      // attempt move
      // ensure the clicked square is a legal destination
      if (!currentLegal.includes(sq)) { status.textContent = 'Not a legal destination'; selected = null; currentLegal = []; render(); return; }
      const ok = game.makeMove(selected, sq);
      if (!ok) status.textContent = 'Illegal move'; else status.textContent = 'Moved';
      selected = null; currentLegal = []; render();
      return;
    }
    if (piece && piece.owner === game.getPlayer().id) {
      // check if player is frozen
      if (game.getPlayer().frozen) { status.textContent = 'You are frozen (king captured)'; return; }
      // show legal moves
      const moves = game.getLegalMoves(sq);
      if (moves.length === 0) { status.textContent = 'No legal moves for this piece (dice/blocked)'; return; }
      status.textContent = 'Legal moves: ' + moves.join(', ');
      selected = sq; currentLegal = moves;
      // highlight selection and legal moves
      render();
      const selEl = document.querySelector(`[data-square="${sq}"]`);
      if (selEl) selEl.classList.add('selected');
      for (const m of moves) { const el = document.querySelector(`[data-square="${m}"]`); if (el) el.classList.add('legal'); }
    } else {
      status.textContent = 'Select your piece (must be your turn and match dice)';
    }
  };

  rollBtn.addEventListener('click', ()=>{
    const v = window.Dice.roll(game,diceFace);
    forced.textContent = 'Forced: '+game.forcedPiece+' (roll '+v+')';
    status.textContent = 'Rolled '+v+', forced '+game.forcedPiece;
    setTimeout(()=>render(),650);
  });

  forfeitBtn.addEventListener('click', ()=>{ game.forcedPiece=null; game.nextTurn(); status.textContent='Turn forfeited'; render(); });

  render();
});