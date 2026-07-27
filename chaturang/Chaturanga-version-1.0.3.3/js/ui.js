// Chaturanga v1.0.3.3 — UI Engine
// New piece images · Drag-and-drop · Sound effects · Seer Engine analytics

document.addEventListener('DOMContentLoaded', () => {
  try {
    if (!window.ChaturangaGame) {
      document.getElementById('status').textContent = 'Error: Game engine not loaded.';
      return;
    }

    const game = new window.ChaturangaGame();
    const boardEl = document.getElementById('board');
    if (!boardEl) return;

    // ── DOM References ──────────────────────────────────────────────────
    const rollBtn            = document.getElementById('rollBtn');
    const rollBtnMobile      = document.getElementById('rollBtnMobile');
    const forfeitBtn         = document.getElementById('forfeitBtn');
    const forfeitBtnMobile   = document.getElementById('forfeitBtnMobile');
    const diceFace           = document.getElementById('diceFace');
    const forced             = document.getElementById('forcedPiece');
    const mobForced          = document.getElementById('mobForced');
    const turnIndicator      = document.getElementById('turnIndicator');
    const turnDot            = document.getElementById('turnDot');
    const status             = document.getElementById('status');
    const captured           = document.getElementById('captured');
    const history            = document.getElementById('history');
    const downloadHistoryBtn = document.getElementById('downloadHistoryBtn');
    const gameState          = document.getElementById('gameState');
    const kingRespawnModal   = document.getElementById('kingRespawnModal');
    const gameOverOverlay    = document.getElementById('gameOverOverlay');
    const autoRollDiceEl     = document.getElementById('autoRollDice');
    const autoDownloadOnEndEl= document.getElementById('autoDownloadOnEnd');
    const focusDiceFace      = document.getElementById('focusDiceFace');
    const focusForced        = document.getElementById('focusForced');
    const modeTeamBtn        = document.getElementById('modeTeam');
    const modeSingleBtn      = document.getElementById('modeSingle');
    const botCountEl         = document.getElementById('botCount');
    const botEloEl           = document.getElementById('botElo');
    const boardSizeEl        = document.getElementById('boardSize');
    const boardSizeLabel     = document.getElementById('boardSizeLabel');
    const settingsToggle     = document.getElementById('settingsToggleBtn');
    const settingsClose      = document.getElementById('settingsCloseBtn');
    const settingsDrawer     = document.getElementById('settingsDrawer');
    const fullscreenBtn      = document.getElementById('fullscreenBtn');
    const rankLabels         = document.getElementById('rankLabels');
    const boardThemeEl       = document.getElementById('boardTheme');

    // ── Constants ───────────────────────────────────────────────────────
    const PIECE_NAMES  = { king: 'Raja', rook: 'Ratha', pawn: 'Nara', elephant: 'Danti', horse: 'Ashwa' };
    const COLOR_NAMES  = { red: 'red', blue: 'blue', green: 'green', yellow: 'yellow' };
    const PLAYER_LABELS= ['Red', 'Blue', 'Green', 'Yellow'];
    const SYMBOLS      = { pawn: '♟', horse: '♞', elephant: '♝', rook: '♜', king: '♚' };
    const PLAYER_COLORS= ['red', 'blue', 'green', 'yellow'];

    // Seer analytics state
    let seerCaptures   = 0;
    let seerPieceCount = {};
    let lastMoveFrom   = null;
    let lastMoveTo     = null;

    // ── State ────────────────────────────────────────────────────────────
    let selectedSquare = null;
    let legalMoves     = [];
    let isAnimating    = false;
    let dragSource     = null; // square key being dragged from

    // ── Sound Engine (Web Audio API — no external files) ────────────────
    let audioCtx = null;
    function getAudioCtx() {
      if (!audioCtx) {
        try { audioCtx = new (window.AudioContext || window.webkitAudioContext)(); } catch(e) {}
      }
      return audioCtx;
    }
    function playTone(freq, type, duration, gain) {
      const ctx = getAudioCtx();
      if (!ctx) return;
      try {
        const osc = ctx.createOscillator();
        const gainNode = ctx.createGain();
        osc.connect(gainNode);
        gainNode.connect(ctx.destination);
        osc.frequency.value = freq;
        osc.type = type || 'sine';
        gainNode.gain.setValueAtTime(gain || 0.25, ctx.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
        osc.start(ctx.currentTime);
        osc.stop(ctx.currentTime + duration);
      } catch(e) {}
    }
    function playDiceSfx() {
      // Multiple short percussive tones
      [200, 350, 180, 420].forEach((f, i) => {
        setTimeout(() => playTone(f, 'square', 0.08, 0.15), i * 50);
      });
    }
    function playCaptureSfx() {
      playTone(180, 'sawtooth', 0.3, 0.3);
      setTimeout(() => playTone(120, 'sine', 0.4, 0.2), 80);
    }
    function playMoveSfx() {
      playTone(520, 'sine', 0.12, 0.15);
    }

    // ── Piece Image URL (uses new clean names in images/pieces/) ─────────
    function pieceImageUrl(piece) {
      const color = COLOR_NAMES[piece.color] || piece.color;
      const type  = PIECE_NAMES[piece.type]  || piece.type;
      return 'images/pieces/' + color + '_' + type.toLowerCase() + '.png';
    }

    function pieceLetter(piece) {
      return { king: 'K', rook: 'R', horse: 'H', elephant: 'E', pawn: 'P' }[piece && piece.type] || '?';
    }

    // ── Bot Helper ───────────────────────────────────────────────────────
    function getBotMove() {
      const elo = botEloEl ? parseInt(botEloEl.value, 10) : 100;
      if (elo === 100) return window.ChaturangaRandomBot ? window.ChaturangaRandomBot.getMove(game, game.turnIndex) : null;
      return window.ChaturangaTieredBot ? window.ChaturangaTieredBot.getMove(game, elo) : null;
    }
    function isBotTurn() {
      const p = game.getPlayer();
      return p && p.isBot && !p.eliminated;
    }

    // ── Rank Labels ───────────────────────────────────────────────────────
    function buildRankLabels() {
      if (!rankLabels) return;
      rankLabels.innerHTML = '';
      for (let r = 8; r >= 1; r--) {
        const s = document.createElement('span');
        s.textContent = r;
        rankLabels.appendChild(s);
      }
    }

    // ─── MAIN RENDER ────────────────────────────────────────────────────
    function render() {
      if (isAnimating) return;
      try {
        boardEl.innerHTML = '';
        buildRankLabels();

        for (let r = 8; r >= 1; r--) {
          for (let f = 0; f < 8; f++) {
            const sq    = String.fromCharCode(97 + f) + r;
            const cell  = document.createElement('div');
            const isLight = (f + r) % 2 === 0;
            let classes = 'square ' + (isLight ? 'light' : 'dark');
            
            // Add lotus decoration to center 4 squares
            if (['d4', 'd5', 'e4', 'e5'].includes(sq)) {
              classes += ' lotus';
            }
            
            cell.className = classes;
            cell.dataset.square = sq;

            // Rank / file labels in corner squares
            if (f === 0) {
              const rl = document.createElement('div');
              rl.className = 'rank-label';
              rl.textContent = r;
              cell.appendChild(rl);
            }
            if (r === 1) {
              const fl = document.createElement('div');
              fl.className = 'file-label';
              fl.textContent = String.fromCharCode(97 + f);
              cell.appendChild(fl);
            }

            // Last move highlight
            if (sq === lastMoveFrom) cell.classList.add('last-move-from');
            if (sq === lastMoveTo)   cell.classList.add('last-move-to');
            if (sq === selectedSquare) cell.classList.add('selected');

            // Legal move indicator
            if (legalMoves.includes(sq)) {
              cell.classList.add('legal-move');
              const dot = document.createElement('div');
              dot.className = 'move-dot';
              cell.appendChild(dot);
            }

            // Piece image
            const piece = game.board.get(sq);
            if (piece) {
              const img = document.createElement('img');
              img.className = 'piece';
              img.alt   = (PIECE_NAMES[piece.type] || piece.type) + ' ' + piece.color;
              img.title = img.alt;
              img.dataset.pieceType  = piece.type;
              img.dataset.pieceOwner = piece.owner;
              img.src = pieceImageUrl(piece);
              img.onerror = function() {
                this.onerror = null;
                // Fallback: show unicode symbol if image fails
                this.style.display = 'none';
                const fb = document.createElement('span');
                fb.className = 'piece-fallback';
                fb.style.cssText = 'font-size:2rem; line-height:1;';
                fb.textContent = SYMBOLS[piece.type] || '?';
                cell.appendChild(fb);
              };

              // Drag-and-drop (desktop)
              img.draggable = true;
              img.addEventListener('dragstart', (e) => {
                if (isBotTurn() || game.gameOver) { e.preventDefault(); return; }
                if (piece.owner !== game.getPlayer().id) { e.preventDefault(); return; }
                dragSource = sq;
                img.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', sq);
              });
              img.addEventListener('dragend', () => { img.classList.remove('dragging'); });

              cell.appendChild(img);
            }

            // Square event listeners
            cell.addEventListener('click', () => onSquareClick(sq));
            cell.addEventListener('mouseenter', () => { if (legalMoves.includes(sq)) cell.classList.add('legal-hover'); });
            cell.addEventListener('mouseleave', () => cell.classList.remove('legal-hover'));

            // Drop target
            cell.addEventListener('dragover', (e) => {
              e.preventDefault();
              e.dataTransfer.dropEffect = 'move';
              cell.classList.add('legal-hover');
            });
            cell.addEventListener('dragleave', () => cell.classList.remove('legal-hover'));
            cell.addEventListener('drop', (e) => {
              e.preventDefault();
              cell.classList.remove('legal-hover');
              if (!dragSource) return;
              const from = dragSource;
              const to   = sq;
              dragSource = null;
              if (from === to) return;
              // If from square is own piece, try selecting and moving
              if (selectedSquare !== from) {
                const fp = game.board.get(from);
                if (fp && fp.owner === game.getPlayer().id) {
                  selectedSquare = from;
                  legalMoves = game.getLegalMoves(from);
                }
              }
              if (legalMoves.includes(to)) attemptMove(from, to);
              else { selectedSquare = null; legalMoves = []; render(); }
            });

            boardEl.appendChild(cell);
          }
        }
        updateUI();
      } catch(e) {
        if (status) status.textContent = 'Render error: ' + e.message;
      }
    }

    // ── Click Handler ─────────────────────────────────────────────────────
    function onSquareClick(sq) {
      if (isAnimating || game.gameOver || isBotTurn()) return;

      // King respawn mode
      if (game.pendingKingRespawn) {
        if (game.respawnKing(sq)) {
          if (status) status.textContent = 'Raja respawned!';
          hideModals();
          render();
        } else {
          if (status) status.textContent = 'Invalid square — choose an empty square';
        }
        return;
      }

      const piece = game.board.get(sq);
      const player = game.getPlayer();

      if (selectedSquare) {
        if (legalMoves.includes(sq)) {
          attemptMove(selectedSquare, sq);
        } else {
          // Re-select own piece
          if (piece && piece.owner === player.id) selectPiece(sq);
          else { selectedSquare = null; legalMoves = []; render(); }
        }
      } else {
        if (piece && piece.owner === player.id) {
          if (player.frozen || player.eliminated) return;
          selectPiece(sq);
        } else {
          if (status) status.textContent = 'Select your own piece';
        }
      }
    }

    function selectPiece(sq) {
      selectedSquare = sq;
      legalMoves = game.getLegalMoves(sq);
      if (!legalMoves.length) {
        if (status) status.textContent = 'No legal moves for this piece';
        selectedSquare = null; legalMoves = [];
      } else {
        if (status) status.textContent = legalMoves.length + ' move(s) available';
      }
      render();
    }

    // ── Attempt Move (with animation) ─────────────────────────────────────
    function attemptMove(from, to) {
      const target = game.board.get(to);
      const isCapture = !!target;

      animateMove(from, to, () => {
        const success = game.makeMove(from, to);
        if (success) {
          lastMoveFrom = from;
          lastMoveTo   = to;
          if (isCapture) {
            playCaptureSfx();
            seerCaptures++;
            if (target) {
              const tn = PIECE_NAMES[target.type] || target.type;
              seerPieceCount[tn] = (seerPieceCount[tn] || 0) + 1;
            }
          } else {
            playMoveSfx();
          }

          if (game.pendingElimination) {
            animateElimination(game.pendingElimination.squares, () => {
              game.completeElimination();
              if (status) status.textContent = 'Move done';
              selectedSquare = null; legalMoves = [];
              render();
              tryAutoRoll();
            });
          } else {
            if (status) status.textContent = 'Move done';
            selectedSquare = null; legalMoves = [];
            render();
            tryAutoRoll();
          }
        } else {
          selectedSquare = null; legalMoves = [];
          render();
        }
      });
    }

    // ── Move Animation (DOM-based smooth translate) ───────────────────────
    function animateMove(from, to, callback) {
      isAnimating = true;
      const fromEl = document.querySelector('[data-square="' + from + '"]');
      const toEl   = document.querySelector('[data-square="' + to   + '"]');
      if (fromEl && toEl) {
        const pieceEl = fromEl.querySelector('.piece');
        if (pieceEl) {
          const fr = fromEl.getBoundingClientRect();
          const tr = toEl.getBoundingClientRect();
          pieceEl.style.transition = 'transform 0.28s cubic-bezier(0.4,0,0.2,1)';
          pieceEl.style.zIndex = '1000';
          pieceEl.style.transform = 'translate(' + (tr.left - fr.left) + 'px,' + (tr.top - fr.top) + 'px)';
        }
      }
      setTimeout(() => { if (callback) callback(); isAnimating = false; }, 300);
    }

    function animateElimination(squares, callback) {
      isAnimating = true;
      squares.forEach(sq => {
        const el = document.querySelector('[data-square="' + sq + '"]');
        if (el) {
          const p = el.querySelector('.piece');
          if (p) p.classList.add('piece-eliminating');
        }
      });
      setTimeout(() => { if (callback) callback(); isAnimating = false; }, 600);
    }

    // ── Update UI ─────────────────────────────────────────────────────────
    function updateUI() {
      const player = game.getPlayer();

      // Turn banner
      if (player && !player.eliminated) {
        if (turnIndicator) {
          turnIndicator.textContent = PLAYER_LABELS[player.id] + ' (Team ' + (player.team + 1) + ')';
        }
        if (turnDot) {
          turnDot.className = 'turn-color-dot ' + (player.color || '');
        }
      }

      // Dice face
      const diceVal = game.lastDice != null ? game.lastDice : '?';
      if (diceFace) {
        diceFace.innerHTML = '<span>' + (game.lastDice != null ? game.lastDice : '<i class="fa-solid fa-question"></i>') + '</span>';
      }
      if (focusDiceFace) focusDiceFace.textContent = diceVal;

      // Forced piece
      const forcedName = game.forcedPiece
        ? (window.Dice ? window.Dice.getPieceName(game.forcedPiece) : game.forcedPiece)
        : null;
      const forcedText = forcedName ? 'Move: ' + forcedName : 'Roll the Pāśaka';
      if (forced) { forced.textContent = forcedText; forced.className = 'forced-label' + (forcedName ? ' highlighted' : ''); }
      if (mobForced) mobForced.textContent = forcedName || '—';
      if (focusForced) focusForced.textContent = forcedName || 'Roll';

      // Per-player dice strip
      for (let i = 0; i < 4; i++) {
        const cell = document.getElementById('diceCell' + i);
        if (cell) {
          const face = cell.querySelector('.dc-face');
          if (face) face.textContent = game.playerLastDice[i] != null ? game.playerLastDice[i] : '—';
          cell.classList.toggle('current-turn', game.turnIndex === i && player && !player.eliminated);
        }
      }

      // Player cards
      game.players.forEach((p, idx) => {
        const card = document.getElementById('pcard' + idx);
        if (card) {
          card.classList.toggle('current', game.turnIndex === idx && !p.eliminated);
          card.classList.toggle('eliminated', !!p.eliminated);
        }
        const kEl = document.getElementById('player' + idx + '-kings');
        if (kEl) kEl.textContent = '♚ ×' + (p.hasKingOnBoard ? 1 : 0) + (p.frozen ? ' ❄' : '');
        const fEl = document.getElementById('player' + idx + '-forfeits');
        if (fEl) fEl.textContent = (p.manualForfeitCount || 0) + '/3';
        // Bot badge
        const badge = document.getElementById('pcard' + idx + '-badge');
        if (badge) {
          badge.textContent = 'BOT';
          badge.className = 'pcard-badge' + (p.isBot ? ' bot-badge' : '');
        }
      });

      // Captured pieces
      const allCaptured = game.players.flatMap(p => p.capturedPieces || []);
      if (captured) {
        if (allCaptured.length) {
          const byType = {};
          allCaptured.forEach(p => { byType[p.type] = (byType[p.type] || 0) + 1; });
          captured.innerHTML = Object.entries(byType)
            .map(([t, c]) => (SYMBOLS[t] || '?') + ' ×' + c)
            .join('  ');
        } else { captured.textContent = 'None'; }
      }

      // Move history
      const turnNotation = (move) => {
        if (!move) return '—';
        if (move.forfeit) {
          const pn = move.forfeitPiece && window.Dice ? window.Dice.getPieceName(move.forfeitPiece) : (move.forfeitPiece || '?');
          return 'Forfeit(' + pn + ')';
        }
        if (!move.piece || !move.to) return '—';
        return pieceLetter(move.piece) + (move.cap ? '×' : '') + move.to;
      };
      if (history) {
        const rounds = [];
        for (let i = 0; i < game.moveHistory.length; i += 4) rounds.push(game.moveHistory.slice(i, i + 4));
        if (rounds.length) {
          history.innerHTML = rounds.map((rm, ri) => {
            const parts = rm.map(m => '<span class="hist-' + (PLAYER_COLORS[m.playerId] || '') + '">' + PLAYER_LABELS[m.playerId ?? 0][0] + ': ' + turnNotation(m) + '</span>');
            return '<div class="history-item">' + (ri + 1) + '. ' + parts.join(' ') + '</div>';
          }).join('');
          history.scrollTop = history.scrollHeight;
        } else {
          history.textContent = 'No moves yet';
        }
      }

      // Forfeit button state
      if (forfeitBtn) {
        const atLimit = player && (player.manualForfeitCount || 0) >= 3;
        forfeitBtn.disabled = !game.forcedPiece || game.gameOver || atLimit;
      }
      if (forfeitBtnMobile) {
        const atLimit = player && (player.manualForfeitCount || 0) >= 3;
        forfeitBtnMobile.disabled = !game.forcedPiece || game.gameOver || atLimit;
      }

      // Roll button
      if (rollBtn) rollBtn.disabled = !!(game.forcedPiece || game.gameOver);
      if (rollBtnMobile) rollBtnMobile.disabled = !!(game.forcedPiece || game.gameOver);

      // Game over
      if (game.gameOver) {
        let msg = 'Game Over!';
        if (game.gameMode === 'single' && game.winnerPlayerId != null) msg = PLAYER_LABELS[game.winnerPlayerId] + ' wins!';
        else if (game.winner != null) msg = 'Team ' + (game.winner + 1) + ' wins the Ashtāpada!';
        if (gameState) { gameState.textContent = msg; gameState.className = 'game-state-badge game-over'; }
        if (gameOverOverlay) {
          gameOverOverlay.style.display = 'flex';
          const ot = document.getElementById('gameOverTitle');
          const om = document.getElementById('gameOverMsg');
          if (ot) ot.textContent = 'Game Over';
          if (om) om.textContent = msg;
        }
        if (autoDownloadOnEndEl && autoDownloadOnEndEl.checked) downloadHistory();
      } else if (game.pendingKingRespawn) {
        if (gameState) { gameState.textContent = 'Raja may respawn!'; gameState.className = 'game-state-badge respawn-pending'; }
        showKingRespawnModal();
      } else {
        if (gameState) { gameState.textContent = ''; gameState.className = 'game-state-badge'; }
        hideModals();
      }

      // Seer Engine update
      updateSeer();
    }

    // ── Seer Engine ─────────────────────────────────────────────────────
    function updateSeer() {
      const seerMoves = document.getElementById('seerMoves');
      const seerCapEl = document.getElementById('seerCaptures');
      const seerTop   = document.getElementById('seerTopPiece');
      const seerInsight = document.getElementById('seerInsight');

      if (seerMoves) seerMoves.textContent = game.moveHistory.length;
      if (seerCapEl) { seerCapEl.textContent = seerCaptures; seerCapEl.classList.add('updated'); setTimeout(() => seerCapEl.classList.remove('updated'), 700); }

      // Top piece by capture count
      let topPiece = '—';
      if (Object.keys(seerPieceCount).length) {
        topPiece = Object.entries(seerPieceCount).sort((a,b) => b[1] - a[1])[0][0];
      }
      if (seerTop) seerTop.textContent = topPiece;

      // Dynamic insight
      if (seerInsight) {
        const total = game.moveHistory.length;
        const player = game.getPlayer();
        if (total === 0) seerInsight.textContent = 'Awaiting battle data…';
        else if (total < 8) seerInsight.textContent = 'Opening phase — armies deploying.';
        else if (seerCaptures === 0 && total > 12) seerInsight.textContent = 'No captures yet — a patient war of positioning.';
        else if (seerCaptures > 10) seerInsight.textContent = 'Highly aggressive game — significant losses on both sides.';
        else if (player && player.isBot) seerInsight.textContent = 'Bot is evaluating ' + (total < 20 ? 'opening' : total < 40 ? 'mid-game' : 'endgame') + ' strategy.';
        else seerInsight.textContent = 'Move ' + total + ' — tension is building on the Ashtāpada.';
      }
    }

    // ── Auto-Roll / Bot Turn ──────────────────────────────────────────────
    function tryAutoRoll() {
      if (game.gameOver) return;
      const player = game.getPlayer();
      if (!player || player.eliminated) return;
      const doRoll = (autoRollDiceEl && autoRollDiceEl.checked) || isBotTurn();
      if (!doRoll) return;

      setTimeout(() => {
        if (game.forcedPiece != null) {
          if (isBotTurn()) doBotMove();
          return;
        }
        if (window.Dice) {
          playDiceSfx();
          if (diceFace) diceFace.classList.add('rolling');
          setTimeout(() => { if (diceFace) diceFace.classList.remove('rolling'); }, 660);
          window.Dice.roll(game, diceFace, () => {
            render();
            if (game.autoForfeitIfNoMove()) { render(); tryAutoRoll(); }
            else if (isBotTurn()) setTimeout(doBotMove, 400);
          });
        }
      }, 400);
    }

    function doBotMove() {
      if (game.gameOver) return;
      const elo = botEloEl ? parseInt(botEloEl.value, 10) : 100;
      if (elo >= 400 && status) status.textContent = 'Bot is thinking…';
      const delay = elo >= 400 ? 600 : 200;
      setTimeout(() => {
        const move = getBotMove();
        if (move && game.makeMove(move.from, move.to)) {
          lastMoveFrom = move.from;
          lastMoveTo   = move.to;
          const capturedPiece = game.board.get(move.to);
          if (move.cap) { playCaptureSfx(); seerCaptures++; }
          else playMoveSfx();
          if (game.pendingElimination) {
            animateElimination(game.pendingElimination.squares, () => {
              game.completeElimination(); render(); tryAutoRoll();
            });
          } else { render(); tryAutoRoll(); }
        } else if (game.autoForfeitIfNoMove()) { render(); tryAutoRoll(); }
      }, delay);
    }

    // ── Roll Button ───────────────────────────────────────────────────────
    function doManualRoll() {
      if (game.forcedPiece) { if (status) status.textContent = 'Move your ' + (PIECE_NAMES[game.forcedPiece] || game.forcedPiece) + ' first'; return; }
      if (window.Dice) {
        playDiceSfx();
        if (diceFace) diceFace.classList.add('rolling');
        setTimeout(() => diceFace && diceFace.classList.remove('rolling'), 660);
        window.Dice.roll(game, diceFace, () => {
          render();
          if (game.autoForfeitIfNoMove()) { render(); tryAutoRoll(); }
        });
      }
    }
    if (rollBtn)       rollBtn.addEventListener('click', doManualRoll);
    if (rollBtnMobile) rollBtnMobile.addEventListener('click', doManualRoll);

    // ── Forfeit ───────────────────────────────────────────────────────────
    function doForfeit() {
      if (!game.forcedPiece) { if (status) status.textContent = 'No active dice roll to forfeit'; return; }
      const player = game.getPlayer();
      if (player && (player.manualForfeitCount || 0) >= 3) {
        if (status) status.textContent = 'Maximum 3 manual forfeits per player reached';
        return;
      }
      if (game.forfeitTurn()) {
        if (status) status.textContent = 'Turn forfeited';
        selectedSquare = null; legalMoves = [];
        render(); tryAutoRoll();
      }
    }
    if (forfeitBtn)       forfeitBtn.addEventListener('click', doForfeit);
    if (forfeitBtnMobile) forfeitBtnMobile.addEventListener('click', doForfeit);

    // ── Modals ────────────────────────────────────────────────────────────
    function showKingRespawnModal() {
      if (kingRespawnModal) {
        kingRespawnModal.style.display = 'flex';
        const cb = document.getElementById('cancelRespawn');
        if (cb) cb.onclick = () => { game.pendingKingRespawn = null; render(); };
      }
    }
    function hideModals() {
      if (kingRespawnModal) kingRespawnModal.style.display = 'none';
    }

    // ── Settings Drawer ────────────────────────────────────────────────────
    if (settingsToggle) settingsToggle.addEventListener('click', () => settingsDrawer && settingsDrawer.classList.toggle('open'));
    if (settingsClose)  settingsClose.addEventListener('click', () => settingsDrawer && settingsDrawer.classList.remove('open'));

    // ── Fullscreen ────────────────────────────────────────────────────────
    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
        else document.exitFullscreen();
      });
    }

    // ── Game Mode ─────────────────────────────────────────────────────────
    if (modeTeamBtn) modeTeamBtn.addEventListener('click', () => {
      game.setGameMode('team');
      modeTeamBtn.classList.add('active');
      if (modeSingleBtn) modeSingleBtn.classList.remove('active');
    });
    if (modeSingleBtn) modeSingleBtn.addEventListener('click', () => {
      game.setGameMode('single');
      modeSingleBtn.classList.add('active');
      if (modeTeamBtn) modeTeamBtn.classList.remove('active');
    });

    // ── Bot Config (from URL or select) ──────────────────────────────────
    if (botCountEl) {
      const params = new URLSearchParams(window.location.search);
      const urlBots = params.get('botCount');
      if (urlBots !== null) {
        const bc = parseInt(urlBots, 10);
        if (bc >= 0 && bc <= 4) {
          botCountEl.value = String(bc);
          game.setBotConfig(bc);
          if (bc === 4 && autoRollDiceEl) autoRollDiceEl.checked = true;
          if (bc > 0) setTimeout(tryAutoRoll, 900);
        }
      }
      botCountEl.addEventListener('change', () => {
        const count = parseInt(botCountEl.value, 10);
        game.setBotConfig(count);
        if (count === 4 && autoRollDiceEl) autoRollDiceEl.checked = true;
        render(); tryAutoRoll();
      });
    }

    // ── Board Size ─────────────────────────────────────────────────────────
    if (boardSizeEl && boardSizeLabel) {
      const saved = localStorage.getItem('chaturanga_boardSize_v3');
      const val   = saved ? Math.min(130, Math.max(70, parseInt(saved, 10))) : 100;
      boardSizeEl.value = val;
      boardSizeLabel.textContent = val + '%';
      const getBase = () => window.innerWidth < 640 ? Math.floor((window.innerWidth - 32) / 8) : 68;
      const applySize = (v) => {
        const s = Math.floor(getBase() * (v / 100));
        document.documentElement.style.setProperty('--sq', s + 'px');
      };
      applySize(val);
      boardSizeEl.addEventListener('input', () => {
        const v = parseInt(boardSizeEl.value, 10);
        boardSizeLabel.textContent = v + '%';
        applySize(v);
        localStorage.setItem('chaturanga_boardSize_v3', String(v));
      });
      window.addEventListener('resize', () => applySize(parseInt(boardSizeEl.value, 10)));
    }

    // ── Board Theme ────────────────────────────────────────────────────────
    if (boardThemeEl) {
      const savedTheme = localStorage.getItem('chaturanga_boardTheme_v3') || 'standard';
      boardThemeEl.value = savedTheme;
      boardEl.classList.add('theme-' + savedTheme);
      
      boardThemeEl.addEventListener('change', () => {
        const theme = boardThemeEl.value;
        boardEl.classList.remove('theme-standard', 'theme-traditional');
        boardEl.classList.add('theme-' + theme);
        localStorage.setItem('chaturanga_boardTheme_v3', theme);
      });
    }

    // ── Download History ──────────────────────────────────────────────────
    function downloadHistory() {
      const turnNotation = (move) => {
        if (!move) return '—';
        if (move.forfeit) return 'Forfeit(' + (move.forfeitPiece || '?') + ')';
        if (!move.piece || !move.to) return '—';
        return pieceLetter(move.piece) + (move.cap ? '×' : '') + move.to;
      };
      const rounds = [];
      for (let i = 0; i < game.moveHistory.length; i += 4) rounds.push(game.moveHistory.slice(i, i + 4));
      let content = 'Chaturanga v1.0.3.3 — Game Log\n';
      content += '================================\n\n';
      content += rounds.map((rm, ri) => (ri+1) + '. ' + rm.map(m => PLAYER_LABELS[m.playerId ?? 0] + ': ' + turnNotation(m)).join(' | ')).join('\n');
      if (game.gameOver) {
        content += '\n\nResult: ';
        if (game.gameMode === 'single' && game.winnerPlayerId != null) content += PLAYER_LABELS[game.winnerPlayerId] + ' wins!';
        else if (game.winner != null) content += 'Team ' + (game.winner + 1) + ' wins!';
      }
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url;
      a.download = 'chaturanga_v1033_' + new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-') + '.txt';
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    }
    if (downloadHistoryBtn) downloadHistoryBtn.addEventListener('click', downloadHistory);

    // ── History color spans CSS ───────────────────────────────────────────
    const histStyle = document.createElement('style');
    histStyle.textContent = `
      .hist-red    { color:#f87171; }
      .hist-blue   { color:#60a5fa; }
      .hist-green  { color:#4ade80; }
      .hist-yellow { color:#fbbf24; }
      .history-item > span + span::before { content: ' | '; color: var(--text-muted); }
    `;
    document.head.appendChild(histStyle);

    // ── Unload guard ─────────────────────────────────────────────────────
    window.addEventListener('beforeunload', (e) => {
      if (game.moveHistory.length > 0 && !(autoDownloadOnEndEl && autoDownloadOnEndEl.checked)) {
        e.preventDefault();
        e.returnValue = 'Download game history before leaving?';
      }
    });

    // ── Initial render ─────────────────────────────────────────────────
    render();

  } catch(err) {
    console.error('Chaturanga UI init error:', err);
    const s = document.getElementById('status');
    if (s) s.textContent = 'Init error: ' + err.message;
  }
});
