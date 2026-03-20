// Chaturanga v1.0.3.3 — UI Engine
// New piece images · Drag-and-drop · Sound effects · Seer Engine analytics

document.addEventListener('DOMContentLoaded', () => {
  try {
    if (!globalThis.ChaturangaGame) {
      const s = document.getElementById('status');
      if (s) { s.textContent = 'Error: Game engine not loaded.'; }
      return;
    }


    const game = new globalThis.ChaturangaGame();
    initUI(game);
  } catch(err) {
    console.error('Chaturanga UI init error:', err);
    const s = document.getElementById('status');
    if (s) { s.textContent = 'Init error: ' + err.message; }
  }

});

function initUI(game) {
  console.log('Chaturanga: initUI starting...');
  const boardEl = document.getElementById('board');
  if (!boardEl) {
    console.error('Chaturanga: Board element not found!');
    return;
  }

  // ── DOM References ──────────────────────────────────────────────────
  const refs = getDOMReferences();
  console.log('Chaturanga: DOM references obtained:', Object.keys(refs));

  if (!refs.statusEl) {
    console.warn('Chaturanga: statusEl not found in refs');
    return;
  }

  const {
    rollBtn, rollBtnMobile, forfeitBtn, forfeitBtnMobile,
    diceFace, forced, mobForced, turnIndicator, turnDot, statusEl,
    captured, history, downloadHistoryBtn, gameState,
    kingRespawnModal, gameOverOverlay, autoRollDiceEl, autoDownloadOnEndEl,
    focusDiceFace, focusForced, modeTeamBtn, modeSingleBtn,
    botCountEl, botEloEl, boardSizeEl, boardSizeLabel,
    settingsToggle, settingsClose, settingsDrawer,
    fullscreenBtn, rankLabels, boardThemeEl
  } = refs;

  console.log('Chaturanga: Destructuring successful. settingsToggle:', !!settingsToggle);

  // ── Constants ───────────────────────────────────────────────────────
  const { PIECE_NAMES, COLOR_NAMES, PLAYER_LABELS, SYMBOLS, PLAYER_COLORS } = getConstants();

  // Seer analytics state
  let seerCaptures   = 0;
  let seerPieceCount = {};
  let lastMoveFrom   = null;
  let lastMoveTo     = null;

  // ── Mute State ──────────────────────────────────────────────────────
  let isMuted = localStorage.getItem('chaturanga_muted') === 'true';
  initMuteControl(isMuted, (val) => { isMuted = val; });

  // ── State ────────────────────────────────────────────────────────────
  let selectedSquare = null;
  let legalMoves     = [];
  let isAnimating    = false;
  let dragSource     = null;

  // ── Sound Engine ────────────────────────────────────────────────────
  let audioCtx = null;
  const playTone = (freq, type, duration, gain) => {
    if (isMuted) return;
    if (!audioCtx) {
      try {
        audioCtx = new (globalThis.AudioContext || globalThis.webkitAudioContext)();
      } catch (e) {
        console.warn('AudioContext not supported');
        return;
      }
    }
    try {
      const osc = audioCtx.createOscillator();
      const gainNode = audioCtx.createGain();
      osc.connect(gainNode);
      gainNode.connect(audioCtx.destination);
      osc.frequency.value = freq;
      osc.type = type || 'sine';
      gainNode.gain.setValueAtTime(gain || 0.25, audioCtx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + duration);
      osc.start(audioCtx.currentTime);
      osc.stop(audioCtx.currentTime + duration);
    } catch (e) {
      console.error('Audio playback failed', e);
    }
  };

  const playDiceSfx = () => [200, 350, 180, 420].forEach((f, i) => setTimeout(() => playTone(f, 'square', 0.08, 0.15), i * 50));
  const playCaptureSfx = () => {
    playTone(180, 'sawtooth', 0.3, 0.3);
    setTimeout(() => playTone(120, 'sine', 0.4, 0.2), 80);
  };
  const playMoveSfx = () => playTone(520, 'sine', 0.12, 0.15);


    // ── Piece Image URL (uses new clean names in images/pieces/) ─────────
    function pieceImageUrl(piece) {
      const color = COLOR_NAMES[piece.color] || piece.color;
      const type  = PIECE_NAMES[piece.type]  || piece.type;
      return 'images/pieces/' + color + '_' + type.toLowerCase() + '.png';
    }

    function pieceLetter(piece) {
      return { king: 'K', rook: 'R', horse: 'H', elephant: 'E', pawn: 'P' }[piece?.type] || '?';
    }

    // ── Bot Helper ───────────────────────────────────────────────────────
    function getBotMove() {
      const elo = botEloEl ? Number.parseInt(botEloEl.value, 10) : 100;
      if (elo === 100) return globalThis.ChaturangaRandomBot ? globalThis.ChaturangaRandomBot.getMove(game, game.turnIndex) : null;
      return globalThis.ChaturangaTieredBot ? globalThis.ChaturangaTieredBot.getMove(game, elo) : null;
    }
    function isBotTurn() {
      const p = game.getPlayer();
      return p?.isBot && !p.eliminated;
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

    // ── Score Bar ────────────────────────────────────────────────────────
    function updateScoreBar() {
      const fill1 = document.getElementById('scoreFillTeam1');
      const fill2 = document.getElementById('scoreFillTeam2');
      if (!fill1 || !fill2) return;
      let team1Score = 0; // Red (0) + Green (2)
      let team2Score = 0; // Blue (1) + Yellow (3)
      const vals = { pawn:1, horse:3, elephant:3, rook:5, king:0 };
      for (const p of game.board.values()) {
        const v = vals[p.type] || 0;
        if (p.owner === 0 || p.owner === 2) team1Score += v;
        if (p.owner === 1 || p.owner === 3) team2Score += v;
      }
      const total = team1Score + team2Score;
      if (total === 0) {
        fill1.style.width = '50%'; fill2.style.width = '50%';
      } else {
        fill1.style.width = (team1Score / total * 100) + '%';
        fill2.style.width = (team2Score / total * 100) + '%';
      }
    }

    // ─── MAIN RENDER ────────────────────────────────────────────────────
    let renderPending = false;
    function render() {
      if (renderPending) return;
      renderPending = true;
      requestAnimationFrame(performRender);
    }

    function performRender() {
      renderPending = false;
      if (isAnimating) return;
      try {
        renderBoardGrid();
        renderMoveArrow();
        updateScoreBar();
        updateUI();
      } catch(e) {
        if (statusEl) statusEl.textContent = 'Render error: ' + e.message;
      }
    }

    function renderBoardGrid() {
      boardEl.innerHTML = '';
      buildRankLabels();
      for (let r = 8; r >= 1; r--) {
        for (let f = 0; f < 8; f++) {
          const sq = String.fromCodePoint(97 + f) + r;
          const cell = createSquareElement(sq, f, r);
          boardEl.appendChild(cell);
        }
      }
    }

    function createSquareElement(sq, f, r) {
      const cell = document.createElement('div');
      const isLight = (f + r) % 2 === 0;
      let classes = 'square ' + (isLight ? 'light' : 'dark');
      if (['d4', 'd5', 'e4', 'e5'].includes(sq)) classes += ' lotus';
      cell.className = classes;
      cell.dataset.square = sq;

      if (f === 0) addLabel(cell, 'rank-label', r);
      if (r === 1) addLabel(cell, 'file-label', String.fromCodePoint(97 + f));

      if (sq === lastMoveFrom) cell.classList.add('last-move-from');
      if (sq === lastMoveTo) cell.classList.add('last-move-to');
      if (sq === selectedSquare) cell.classList.add('selected');

      if (legalMoves.includes(sq)) {
        cell.classList.add('legal-move');
        const dot = document.createElement('div');
        dot.className = 'move-dot';
        cell.appendChild(dot);
      }

      const piece = game.board.get(sq);
      if (piece) cell.appendChild(createPieceElement(piece, sq));

      cell.addEventListener('click', () => onSquareClick(sq));
      cell.addEventListener('mouseenter', () => { if (legalMoves.includes(sq)) cell.classList.add('legal-hover'); });
      cell.addEventListener('mouseleave', () => cell.classList.remove('legal-hover'));
      addDragDropListeners(cell, sq);
      return cell;
    }

    function addLabel(parent, className, text) {
      const l = document.createElement('div');
      l.className = className;
      l.textContent = text;
      parent.appendChild(l);
    }

    function createPieceElement(piece, sq) {
      const pStyleEl = document.getElementById('pieceStyle');
      const pStyle = pStyleEl?.value || 'traditional';
      let pNode = null;

      if (pStyle === 'unicode') {
        pNode = document.createElement('span');
        pNode.className = 'piece piece-unicode';
        pNode.style.cssText = `font-size:2.8rem; line-height:1; color:${PLAYER_COLORS[piece.owner || 0]}; text-shadow:0 2px 4px rgba(0,0,0,0.5); display:inline-block; cursor:grab; user-select:none; pointer-events:auto;`;
        pNode.textContent = SYMBOLS[piece.type] || '?';
      } else if (pStyle === 'minimal') {
        pNode = document.createElement('span');
        pNode.className = 'piece piece-minimal';
        pNode.style.cssText = `font-size:1.6rem; font-weight:bold; width:80%; height:80%; display:flex; align-items:center; justify-content:center; background:${PLAYER_COLORS[piece.owner || 0]}; color:#fff; border-radius:50%; box-shadow:0 4px 8px rgba(0,0,0,0.4); margin:10%; cursor:grab; user-select:none; pointer-events:auto;`;
        pNode.textContent = pieceLetter(piece);
      } else {
        pNode = document.createElement('img');
        pNode.className = 'piece';
        pNode.alt = (PIECE_NAMES[piece.type] || piece.type) + ' ' + piece.color;
        pNode.title = pNode.alt;
        pNode.src = pieceImageUrl(piece);
        pNode.onerror = function() {
          this.onerror = null;
          this.style.display = 'none';
          const fb = document.createElement('span');
          fb.className = 'piece-fallback';
          fb.style.cssText = 'font-size:2rem; line-height:1;';
          fb.textContent = SYMBOLS[piece.type] || '?';
          this.parentNode?.appendChild(fb);
        };
      }

      pNode.dataset.pieceType = piece.type;
      pNode.dataset.pieceOwner = piece.owner;
      pNode.draggable = true;
      pNode.addEventListener('dragstart', (e) => {
        if (isBotTurn() || game.gameOver || piece.owner !== game.getPlayer().id) {
          e.preventDefault();
          return;
        }
        dragSource = sq;
        pNode.classList.add('dragging');
        e.dataTransfer.effectAllowed = 'move';
        e.dataTransfer.setData('text/plain', sq);
      });
      pNode.addEventListener('dragend', () => pNode.classList.remove('dragging'));
      return pNode;
    }

    function addDragDropListeners(cell, sq) {
      cell.addEventListener('dragover', (e) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
        cell.classList.add('legal-hover');
      });
      cell.addEventListener('dragleave', () => cell.classList.remove('legal-hover'));
      cell.addEventListener('drop', (e) => {
        e.preventDefault();
        cell.classList.remove('legal-hover');
        if (!dragSource || dragSource === sq) return;
        const from = dragSource;
        const to = sq;
        dragSource = null;
        if (selectedSquare !== from) {
          const fp = game.board.get(from);
          if (fp?.owner === game.getPlayer().id) {
            selectedSquare = from;
            legalMoves = game.getLegalMoves(from);
          }
        }
        if (legalMoves.includes(to)) attemptMove(from, to);
        else { selectedSquare = null; legalMoves = []; render(); }
      });
    }

    function renderMoveArrow() {
      const svg = document.getElementById('moveArrowSvg');
      if (!svg) return;
      Array.from(svg.querySelectorAll('line, circle')).forEach(el => el.remove());
      if (lastMoveFrom && lastMoveTo) {
        const getC = (s) => {
          const fileIdx = s.codePointAt(0) - 97;
          const rankIdx = 8 - Number.parseInt(s[1], 10);
          return { x: (fileIdx + 0.5) * 12.5, y: (rankIdx + 0.5) * 12.5 };
        };
        const fromC = getC(lastMoveFrom);
        const toC = getC(lastMoveTo);
        const line = document.createElementNS('http://www.w3.org/2000/svg', 'line');
        line.setAttribute('x1', fromC.x + '%');
        line.setAttribute('y1', fromC.y + '%');
        line.setAttribute('x2', toC.x + '%');
        line.setAttribute('y2', toC.y + '%');
        line.setAttribute('stroke', 'rgba(234, 179, 8, 0.6)');
        line.setAttribute('stroke-width', '1.8%');
        line.setAttribute('stroke-linecap', 'round');
        line.setAttribute('marker-end', 'url(#arrowhead)');
        const dot = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
        dot.setAttribute('cx', fromC.x + '%');
        dot.setAttribute('cy', fromC.y + '%');
        dot.setAttribute('r', '1.5%');
        dot.setAttribute('fill', 'rgba(234, 179, 8, 0.6)');
        svg.appendChild(line);
        svg.appendChild(dot);
      }
    }

    // ── Click Handler ─────────────────────────────────────────────────────
    function onSquareClick(sq) {
      if (isAnimating || game.gameOver || isBotTurn()) return;
      if (game.pendingKingRespawn) {
        handleKingRespawnClick(sq);
      } else {
        handleRegularClick(sq);
      }
    }

    function handleKingRespawnClick(sq) {
      if (game.respawnKing(sq)) {
        if (statusEl) statusEl.textContent = 'Raja respawned!';
        hideModals();
        render();
      } else if (statusEl) {
        statusEl.textContent = 'Invalid square — choose an empty square';
      }
    }

    function handleRegularClick(sq) {
      const piece = game.board.get(sq);
      const player = game.getPlayer();

      if (selectedSquare) {
        if (legalMoves.includes(sq)) {
          attemptMove(selectedSquare, sq);
        } else if (piece && piece.owner === player.id) {
          selectPiece(sq);
        } else {
          selectedSquare = null;
          legalMoves = [];
          render();
        }
      } else if (piece && piece.owner === player.id) {
        if (player.frozen || player.eliminated) return;
        selectPiece(sq);
      } else if (statusEl) {
        statusEl.textContent = 'Select your own piece';
      }
    }


    function selectPiece(sq) {
      selectedSquare = sq;
      legalMoves = game.getLegalMoves(sq);
      if (legalMoves.length === 0) {
        if (statusEl) statusEl.textContent = 'No legal moves for this piece';
        selectedSquare = null;
        legalMoves = [];
      } else if (statusEl) {
        statusEl.textContent = legalMoves.length + ' move(s) available';
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
              if (statusEl) statusEl.textContent = 'Move done';
              selectedSquare = null; legalMoves = [];
              render();
              tryAutoRoll();
            });
          } else {
            if (statusEl) statusEl.textContent = 'Move done';
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
      setTimeout(() => {
        if (callback) { callback(); }
        isAnimating = false;
      }, 300);
    }

    function animateElimination(squares, callback) {
      isAnimating = true;
      squares.forEach(sq => {
        const el = document.querySelector('[data-square="' + sq + '"]');
        if (el) {
          const p = el.querySelector('.piece');
          if (p) { p.classList.add('piece-eliminating'); }
        }
      });
      setTimeout(() => {
        if (callback) { callback(); }
        isAnimating = false;
      }, 600);
    }


    // ── Update UI ─────────────────────────────────────────────────────────
    // ── Update UI ─────────────────────────────────────────────────────────
    function updateUI() {
      const player = game.getPlayer();
      updateTurnIndicator(player);
      updateDiceUI();
      updatePlayerCardsUI();
      updateCapturedPiecesUI();
      updateHistoryUI();
      updateControlsUI(player);
      updateStateModals();
      updateSeer();
    }

    function updateTurnIndicator(player) {
      if (player && !player.eliminated) {
        if (turnIndicator) turnIndicator.textContent = PLAYER_LABELS[player.id] + ' (Team ' + (player.team + 1) + ')';
        if (turnDot) turnDot.className = 'turn-color-dot ' + (player.color || '');
      }
    }

    function updateDiceUI() {
      const isRolled = game.lastDice !== null;
      const diceVal = isRolled ? game.lastDice : '?';

      if (diceFace) {
        diceFace.innerHTML = '<span>' + (isRolled ? game.lastDice : '<i class="fa-solid fa-question"></i>') + '</span>';
      }
      if (focusDiceFace) { focusDiceFace.textContent = diceVal; }

      const forcedName = game.forcedPiece ? (globalThis.Dice?.getPieceName(game.forcedPiece) ?? game.forcedPiece) : null;
      const forcedText = forcedName ? 'Move: ' + forcedName : 'Roll the Pāśaka';
      if (forced) {
        forced.textContent = forcedText;
        forced.className = 'forced-label' + (forcedName ? ' highlighted' : '');
      }
      if (mobForced) { mobForced.textContent = forcedName || '—'; }
      if (focusForced) { focusForced.textContent = forcedName || 'Roll'; }

      for (let i = 0; i < 4; i++) {
        const cell = document.getElementById('diceCell' + i);
        if (cell) {
          const face = cell.querySelector('.dc-face');
          const pDice = game.playerLastDice[i];
          if (face) { face.textContent = pDice !== null ? pDice : '—'; }
          const isCurrent = game.turnIndex === i && (game.getPlayer() && !game.getPlayer().eliminated);
          cell.classList.toggle('current-turn', isCurrent);
        }
      }
    }


    function updatePlayerCardsUI() {
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
        const badge = document.getElementById('pcard' + idx + '-badge');
        if (badge) {
          badge.textContent = 'BOT';
          badge.className = 'pcard-badge' + (p.isBot ? ' bot-badge' : '');
        }
      });
    }

    function updateCapturedPiecesUI() {
      const allCaptured = game.players.flatMap(p => p.capturedPieces || []);
      if (!captured) return;
      if (allCaptured.length) {
        const byType = {};
        allCaptured.forEach(p => { byType[p.type] = (byType[p.type] || 0) + 1; });
        captured.innerHTML = Object.entries(byType)
          .map(([t, c]) => (SYMBOLS[t] || '?') + ' ×' + c)
          .join('  ');
      } else {
        captured.textContent = 'None';
      }
    }

    function updateHistoryUI() {
      if (!history) return;
      const turnNotation = (move) => {
        if (!move) return '—';
        if (move.forfeit) {
          const pn = move.forfeitPiece && globalThis.Dice ? globalThis.Dice.getPieceName(move.forfeitPiece) : (move.forfeitPiece || '?');
          return 'Forfeit(' + pn + ')';
        }
        if (!move.piece || !move.to) return '—';
        return pieceLetter(move.piece) + (move.cap ? '×' : '') + move.to;
      };
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

    function updateControlsUI(player) {
      const hasAnyMove = game.hasAnyLegalMove();
      const atLimit = player && (player.manualForfeitCount || 0) >= 3;

      if (forfeitBtn) { forfeitBtn.disabled = !game.forcedPiece || game.gameOver || atLimit || hasAnyMove; }
      if (forfeitBtnMobile) { forfeitBtnMobile.disabled = !game.forcedPiece || game.gameOver || atLimit || hasAnyMove; }
      if (rollBtn) { rollBtn.disabled = !!(game.forcedPiece || game.gameOver); }
      if (rollBtnMobile) { rollBtnMobile.disabled = !!(game.forcedPiece || game.gameOver); }
    }


    function updateStateModals() {
      if (game.gameOver) {
        let msg = 'Game Over!';
        if (game.gameMode === 'single' && game.winnerPlayerId !== null) { msg = PLAYER_LABELS[game.winnerPlayerId] + ' wins!'; }
        else if (game.winner !== null) { msg = 'Team ' + (game.winner + 1) + ' wins the Ashtāpada!'; }
        if (gameState) { gameState.textContent = msg; gameState.className = 'game-state-badge game-over'; }
        if (gameOverOverlay) {
          gameOverOverlay.style.display = 'flex';
          const ot = document.getElementById('gameOverTitle');
          const om = document.getElementById('gameOverMsg');
          if (ot) { ot.textContent = 'Game Over'; }
          if (om) { om.textContent = msg; }
        }
        if (autoDownloadOnEndEl?.checked) { downloadHistory(); }
      } else if (game.pendingKingRespawn) {
        if (gameState) { gameState.textContent = 'Raja may respawn!'; gameState.className = 'game-state-badge respawn-pending'; }
        showKingRespawnModal();
      } else {
        if (gameState) { gameState.textContent = ''; gameState.className = 'game-state-badge'; }
        hideModals();
      }
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
        if (total === 0) {
          seerInsight.textContent = 'Awaiting battle data…';
        } else if (total < 8) {
          seerInsight.textContent = 'Opening phase — armies deploying.';
        } else if (seerCaptures === 0 && total > 12) {
          seerInsight.textContent = 'No captures yet — a patient war of positioning.';
        } else if (seerCaptures > 10) {
          seerInsight.textContent = 'Highly aggressive game — significant losses on both sides.';
        } else if (player?.isBot) {
          const stage = total < 20 ? 'opening' : total < 40 ? 'mid-game' : 'endgame';
          seerInsight.textContent = 'Bot is evaluating ' + stage + ' strategy.';
        } else {
          seerInsight.textContent = 'Move ' + total + ' — tension is building on the Ashtāpada.';
        }
      }
    }

    // ── Auto-Roll / Bot Turn ──────────────────────────────────────────────
    function tryAutoRoll() {
      if (game.gameOver) { return; }
      const player = game.getPlayer();
      if (!player || player.eliminated) { return; }
      const doRoll = (autoRollDiceEl?.checked) || isBotTurn();
      if (!doRoll) { return; }


      setTimeout(() => {
        if (game.forcedPiece !== null) {
          if (isBotTurn()) { doBotMove(); }
          return;
        }
        if (globalThis.Dice) {
          playDiceSfx();
          if (diceFace) { diceFace.classList.add('rolling'); }
          setTimeout(() => { if (diceFace) { diceFace.classList.remove('rolling'); } }, 660);
          globalThis.Dice.roll(game, diceFace, () => {
            render();
            if (game.autoForfeitIfNoMove()) {
              render();
              tryAutoRoll();
            } else if (isBotTurn()) {
              setTimeout(doBotMove, 400);
            }
          });
        }
      }, 400);
    }

    function doBotMove() {
      if (game.gameOver) { return; }
      const elo = botEloEl ? Number.parseInt(botEloEl.value, 10) : 100;
      if (elo >= 400 && statusEl) { statusEl.textContent = 'Bot is thinking…'; }
      const delay = elo >= 400 ? 600 : 200;
      setTimeout(() => {
        const move = getBotMove();
        if (move && game.makeMove(move.from, move.to)) {
          lastMoveFrom = move.from;
          lastMoveTo   = move.to;
          if (move.cap) {
            playCaptureSfx();
            seerCaptures++;
          } else {
            playMoveSfx();
          }
          if (game.pendingElimination) {
            animateElimination(game.pendingElimination.squares, () => {
              game.completeElimination();
              render();
              tryAutoRoll();
            });
          } else {
            render();
            tryAutoRoll();
          }
        } else if (game.autoForfeitIfNoMove()) {
          render();
          tryAutoRoll();
        } else {
          console.warn('Chaturanga: bot returned no move despite legal moves existing. Recovering turn for player', game.turnIndex);
          game.forcedPiece = null;
          game.lastDice    = null;
          render();
          setTimeout(tryAutoRoll, 300);
        }
      }, delay);
    }


    // ── Roll Button ───────────────────────────────────────────────────────
    function doManualRoll() {
      if (game.forcedPiece) {
        if (statusEl) { statusEl.textContent = 'Move your ' + (PIECE_NAMES[game.forcedPiece] || game.forcedPiece) + ' first'; }
        return;
      }
      if (globalThis.Dice) {
        playDiceSfx();
        if (diceFace) { diceFace.classList.add('rolling'); }
        setTimeout(() => { if (diceFace) { diceFace.classList.remove('rolling'); } }, 660);
        globalThis.Dice.roll(game, diceFace, () => {
          render();
          if (game.autoForfeitIfNoMove()) {
            render();
            tryAutoRoll();
          }
        });
      }
    }

    if (rollBtn) { rollBtn.addEventListener('click', doManualRoll); }
    if (rollBtnMobile) { rollBtnMobile.addEventListener('click', doManualRoll); }


    // ── Forfeit ───────────────────────────────────────────────────────────
    function doForfeit() {
      if (!game.forcedPiece) {
        if (statusEl) { statusEl.textContent = 'No active dice roll to forfeit'; }
        return;
      }
      const player = game.getPlayer();
      if (player && (player.manualForfeitCount || 0) >= 3) {
        if (statusEl) { statusEl.textContent = 'Maximum 3 manual forfeits per player reached'; }
        return;
      }

      if (game.hasAnyLegalMove()) {
        if (statusEl) {
          const pn = globalThis.Dice ? globalThis.Dice.getPieceName(game.forcedPiece) : game.forcedPiece;
          statusEl.textContent = 'You must move — a legal ' + pn + ' move is available';
        }
        return;
      }

      if (game.forfeitTurn()) {
        if (statusEl) { statusEl.textContent = 'Turn forfeited — no legal move for this piece'; }
        selectedSquare = null;
        legalMoves = [];
        render();
        tryAutoRoll();
      }
    }

    if (forfeitBtn) { forfeitBtn.addEventListener('click', doForfeit); }
    if (forfeitBtnMobile) { forfeitBtnMobile.addEventListener('click', doForfeit); }


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
      const params = new URLSearchParams(globalThis.location.search);
      const urlBots = params.get('botCount');
      if (urlBots !== null) {
        const bc = Number.parseInt(urlBots, 10);
        if (bc >= 0 && bc <= 4) {
          botCountEl.value = String(bc);
          game.setBotConfig(bc);
          if (bc === 4 && autoRollDiceEl) autoRollDiceEl.checked = true;
          if (bc > 0) setTimeout(tryAutoRoll, 900);
        }
      }
      botCountEl.addEventListener('change', () => {
        const count = Number.parseInt(botCountEl.value, 10);
        game.setBotConfig(count);
        if (count === 4 && autoRollDiceEl) autoRollDiceEl.checked = true;
        render(); tryAutoRoll();
      });
    }

    // ── Board Size ─────────────────────────────────────────────────────────
    if (boardSizeEl && boardSizeLabel) {
      const saved = localStorage.getItem('chaturanga_boardSize_v3');
      const val   = saved ? Math.min(130, Math.max(70, Number.parseInt(saved, 10))) : 100;
      boardSizeEl.value = val;
      boardSizeLabel.textContent = val + '%';
      const getBase = () => globalThis.innerWidth < 640 ? Math.floor((globalThis.innerWidth - 32) / 8) : 68;
      const applySize = (v) => {
        const s = Math.floor(getBase() * (v / 100));
        document.documentElement.style.setProperty('--sq', s + 'px');
      };
      applySize(val);
      boardSizeEl.addEventListener('input', () => {
        const v = Number.parseInt(boardSizeEl.value, 10);
        boardSizeLabel.textContent = v + '%';
        applySize(v);
        localStorage.setItem('chaturanga_boardSize_v3', String(v));
      });
      globalThis.addEventListener('resize', () => applySize(Number.parseInt(boardSizeEl.value, 10)));
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

    // ── Piece Style ────────────────────────────────────────────────────────
    const pieceStyleEl = document.getElementById('pieceStyle');
    if (pieceStyleEl) {
      const savedStyle = localStorage.getItem('chaturanga_pieceStyle_v4') || 'traditional';
      pieceStyleEl.value = savedStyle;
      pieceStyleEl.addEventListener('change', () => {
        localStorage.setItem('chaturanga_pieceStyle_v4', pieceStyleEl.value);
        render(); // redraw board immediately
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
      a.download = 'chaturanga_v1033_' + new Date().toISOString().slice(0, 19).replaceAll(/[:T]/g, '-') + '.txt';
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
    globalThis.addEventListener('beforeunload', (e) => {
      if (game.moveHistory.length > 0 && !(autoDownloadOnEndEl?.checked)) {
        e.preventDefault();
        return (e.returnValue = ''); // Standard way to trigger browser dialog
      }
    });

  render();
}

function getDOMReferences() {
  return {
    rollBtn: document.getElementById('rollBtn'),
    rollBtnMobile: document.getElementById('rollBtnMobile'),
    forfeitBtn: document.getElementById('forfeitBtn'),
    forfeitBtnMobile: document.getElementById('forfeitBtnMobile'),
    diceFace: document.getElementById('diceFace'),
    forced: document.getElementById('forcedPiece'),
    mobForced: document.getElementById('mobForced'),
    turnIndicator: document.getElementById('turnIndicator'),
    turnDot: document.getElementById('turnDot'),
    statusEl: document.getElementById('status'),

    captured: document.getElementById('captured'),
    history: document.getElementById('history'),
    downloadHistoryBtn: document.getElementById('downloadHistoryBtn'),
    gameState: document.getElementById('gameState'),
    kingRespawnModal: document.getElementById('kingRespawnModal'),
    gameOverOverlay: document.getElementById('gameOverOverlay'),
    autoRollDiceEl: document.getElementById('autoRollDice'),
    autoDownloadOnEndEl: document.getElementById('autoDownloadOnEnd'),
    focusDiceFace: document.getElementById('focusDiceFace'),
    focusForced: document.getElementById('focusForced'),
    modeTeamBtn: document.getElementById('modeTeam'),
    modeSingleBtn: document.getElementById('modeSingle'),
    botCountEl: document.getElementById('botCount'),
    botEloEl: document.getElementById('botElo'),
    boardSizeEl: document.getElementById('boardSize'),
    boardSizeLabel: document.getElementById('boardSizeLabel'),
    settingsToggle: document.getElementById('settingsToggleBtn'),
    settingsClose: document.getElementById('settingsCloseBtn'),
    settingsDrawer: document.getElementById('settingsDrawer'),
    fullscreenBtn: document.getElementById('fullscreenBtn'),
    rankLabels: document.getElementById('rankLabels'),
    boardThemeEl: document.getElementById('boardTheme')
  };
}

function getConstants() {
  return {
    PIECE_NAMES: { king: 'Raja', rook: 'Ratha', pawn: 'Nara', elephant: 'Danti', horse: 'Ashwa' },
    COLOR_NAMES: { red: 'red', blue: 'blue', green: 'green', yellow: 'yellow' },
    PLAYER_LABELS: ['Red', 'Blue', 'Green', 'Yellow'],
    SYMBOLS: { pawn: '♟', horse: '♞', elephant: '♝', rook: '♜', king: '♚' },
    PLAYER_COLORS: ['red', 'blue', 'green', 'yellow']
  };
}

function initMuteControl(isMuted, setter) {
  const muteBtn = document.getElementById('muteBtn');
  const muteIcon = document.getElementById('muteIcon');
  if (muteBtn && muteIcon) {
    if (isMuted) muteIcon.className = 'fa-solid fa-volume-xmark';
    muteBtn.addEventListener('click', () => {
      const val = !isMuted;
      setter(val);
      localStorage.setItem('chaturanga_muted', val);
      muteIcon.className = val ? 'fa-solid fa-volume-xmark' : 'fa-solid fa-volume-high';
    });
  }
}

