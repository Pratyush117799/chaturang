// Chaturanga v1.0.4 — UI Engine
// Seer Engine integration · Advanced Bots (ELO 700-1000) · Anti-Cheat hooks · UI Enhancements

document.addEventListener('DOMContentLoaded', () => {
  try {
    if (!globalThis.ChaturangaGame) {
      document.getElementById('status').textContent = 'Error: Game engine not loaded.';
      return;
    }

    const game = new globalThis.ChaturangaGame();
    globalThis._chaturangaGame = game; // expose for seer/ws

    // ── Initialise seerData ────────────────────────────────────────────────
    game.seerData = {
      moveHistory: [],
      captureCount: 0,
      pieceCaptureCounts: {},
      materialBalance: [],
      turningPoint: null,
      startTime: Date.now()
    };

    const boardEl = document.getElementById('board');
    if (!boardEl) return;

    // ── DOM References ──────────────────────────────────────────────────────
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

    // ── Constants ───────────────────────────────────────────────────────────
    const PIECE_NAMES   = { king: 'Raja', rook: 'Ratha', pawn: 'Nara', elephant: 'Danti', horse: 'Ashwa' };
    const COLOR_NAMES   = { red: 'red', blue: 'blue', green: 'green', yellow: 'yellow' };
    const PLAYER_LABELS = ['Red', 'Blue', 'Green', 'Yellow'];
    const SYMBOLS       = { pawn: '♟', horse: '♞', elephant: '♝', rook: '♜', king: '♚' };
    const PLAYER_COLORS = ['red', 'blue', 'green', 'yellow'];

    // ── State ────────────────────────────────────────────────────────────────
    let selectedSquare = null;
    let legalMoves     = [];
    let isAnimating    = false;
    let dragSource     = null;
    let lastMoveFrom   = null;
    let lastMoveTo     = null;
    let moveStartTime  = null;

    // Expose render for ws-client
    globalThis._chaturangaRender = () => render();

    // ── Sound Engine ─────────────────────────────────────────────────────────
    let audioCtx = null;
    function getAudioCtx() {
      if (!audioCtx) {
        try { audioCtx = new (globalThis.AudioContext || globalThis.webkitAudioContext)(); } catch(e) {}
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
    function playDiceSfx()   { [200,350,180,420].forEach((f,i) => setTimeout(() => playTone(f,'square',0.08,0.15), i*50)); }
    function playCaptureSfx(){ playTone(180,'sawtooth',0.3,0.3); setTimeout(() => playTone(120,'sine',0.4,0.2), 80); }
    function playMoveSfx()   { playTone(520,'sine',0.12,0.15); }

    // ── Piece Image URL ──────────────────────────────────────────────────────
    function pieceImageUrl(piece) {
      const color = COLOR_NAMES[piece.color] || piece.color;
      const type  = PIECE_NAMES[piece.type]  || piece.type;
      return 'images/pieces/' + color + '_' + type.toLowerCase() + '.png';
    }
    function pieceLetter(piece) {
      return { king:'K', rook:'R', horse:'H', elephant:'E', pawn:'P' }[piece && piece.type] || '?';
    }

    // ── Bot Helper — routes ELO 700+ to advancedBots ─────────────────────────
    function getBotMove() {
      const elo = botEloEl ? Number.parseInt(botEloEl.value, 10) : 300;
      if (elo >= 700 && globalThis.ChaturangaAdvancedBots) {
        return globalThis.ChaturangaAdvancedBots.getMove(game, elo);
      }
      if (elo === 100) return globalThis.ChaturangaRandomBot ? globalThis.ChaturangaRandomBot.getMove(game, game.turnIndex) : null;
      return globalThis.ChaturangaTieredBot ? globalThis.ChaturangaTieredBot.getMove(game, elo) : null;
    }
    function isBotTurn() {
      const p = game.getPlayer();
      return p && p.isBot && !p.eliminated;
    }

    // ── Rank Labels ──────────────────────────────────────────────────────────
    function buildRankLabels() {
      if (!rankLabels) return;
      rankLabels.innerHTML = '';
      for (let r = 8; r >= 1; r--) {
        const s = document.createElement('span');
        s.textContent = r;
        rankLabels.appendChild(s);
      }
    }

    // ─── MAIN RENDER ─────────────────────────────────────────────────────────
    function render() {
      if (isAnimating) return;
      try {
        boardEl.innerHTML = '';
        buildRankLabels();

        for (let r = 8; r >= 1; r--) {
          for (let f = 0; f < 8; f++) {
            const sq   = String.fromCharCode(97 + f) + r;
            const cell = document.createElement('div');
            const isLight = (f + r) % 2 === 0;
            let classes = 'square ' + (isLight ? 'light' : 'dark');

            if (['d4','d5','e4','e5'].includes(sq)) classes += ' lotus';
            cell.className = classes;
            cell.dataset.square = sq;
            cell.setAttribute('role', 'gridcell');

            if (f === 0) {
              const rl = document.createElement('div');
              rl.className = 'rank-label'; rl.textContent = r;
              cell.appendChild(rl);
            }
            if (r === 1) {
              const fl = document.createElement('div');
              fl.className = 'file-label'; fl.textContent = String.fromCharCode(97 + f);
              cell.appendChild(fl);
            }

            if (sq === lastMoveFrom) cell.classList.add('last-move-from');
            if (sq === lastMoveTo)   cell.classList.add('last-move-to');
            if (sq === selectedSquare) cell.classList.add('selected');

            if (legalMoves.includes(sq)) {
              cell.classList.add('legal-move');
              const dot = document.createElement('div');
              dot.className = 'move-dot';
              cell.appendChild(dot);
            }

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
                this.onerror = null; this.style.display = 'none';
                const fb = document.createElement('span');
                fb.className = 'piece-fallback';
                fb.style.cssText = 'font-size:2rem;line-height:1;';
                fb.textContent = SYMBOLS[piece.type] || '?';
                cell.appendChild(fb);
              };
              img.draggable = true;
              img.addEventListener('dragstart', (e) => {
                if (isBotTurn() || game.gameOver) { e.preventDefault(); return; }
                if (piece.owner !== game.getPlayer().id) { e.preventDefault(); return; }
                dragSource = sq;
                img.classList.add('dragging');
                e.dataTransfer.effectAllowed = 'move';
                e.dataTransfer.setData('text/plain', sq);
              });
              img.addEventListener('dragend', () => img.classList.remove('dragging'));
              cell.appendChild(img);
            }

            cell.addEventListener('click',      () => onSquareClick(sq));
            cell.addEventListener('mouseenter', () => { if (legalMoves.includes(sq)) cell.classList.add('legal-hover'); });
            cell.addEventListener('mouseleave', () => cell.classList.remove('legal-hover'));
            cell.addEventListener('dragover',   (e) => { e.preventDefault(); e.dataTransfer.dropEffect = 'move'; cell.classList.add('legal-hover'); });
            cell.addEventListener('dragleave',  () => cell.classList.remove('legal-hover'));
            cell.addEventListener('drop', (e) => {
              e.preventDefault(); cell.classList.remove('legal-hover');
              if (!dragSource) return;
              const from = dragSource, to = sq;
              dragSource = null;
              if (from === to) return;
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

        // UI Enhancements hooks
        if (globalThis.ChaturangaUIEnhancements) {
          ChaturangaUIEnhancements.updateKingDangerGlows(game);
          ChaturangaUIEnhancements.updateAriaLabels(game);
        }
      } catch(e) {
        if (status) status.textContent = 'Render error: ' + e.message;
      }
    }

    // ── Click Handler ──────────────────────────────────────────────────────
    function onSquareClick(sq) {
      if (isAnimating || game.gameOver || isBotTurn()) return;

      if (game.pendingKingRespawn) {
        if (game.respawnKing(sq)) {
          if (status) status.textContent = 'Raja respawned!';
          hideModals(); render();
        } else {
          if (status) status.textContent = 'Invalid square — choose an empty square';
        }
        return;
      }

      const piece  = game.board.get(sq);
      const player = game.getPlayer();

      // Anti-cheat rate limiter
      if (globalThis.ChaturangaAntiCheat && !ChaturangaAntiCheat.rateLimiter.check(player.id)) return;

      if (selectedSquare) {
        if (legalMoves.includes(sq)) {
          // Input sanitisation
          if (globalThis.ChaturangaAntiCheat && !ChaturangaAntiCheat.validateInputMove(game, selectedSquare, sq)) {
            console.warn('[AntiCheat] Move rejected by sanitiser:', selectedSquare, '->', sq);
            selectedSquare = null; legalMoves = []; render(); return;
          }
          attemptMove(selectedSquare, sq);
        } else {
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
      moveStartTime = Date.now();
      render();
    }

    // ── Attempt Move ──────────────────────────────────────────────────────
    function attemptMove(from, to) {
      const target    = game.board.get(to);
      const isCapture = !!target;
      const moveDurationMs = moveStartTime ? Date.now() - moveStartTime : 1000;

      // Anti-cheat: record move time + compare to bot move
      if (globalThis.ChaturangaAntiCheat && !isBotTurn()) {
        ChaturangaAntiCheat.recordMoveTime(game.turnIndex, moveDurationMs);
        ChaturangaAntiCheat.compareMoveToBot(game.turnIndex, from, to, game);
        const report = ChaturangaAntiCheat.analysePlayer(game.turnIndex, game.seerData.moveHistory, game);
        if (report.suspicionLevel === 'flag') {
          ChaturangaAntiCheat.showFairPlayNotice(game.turnIndex);
        }
      }

      // Online multiplayer: route through WS instead of local engine
      if (globalThis.ChaturangaWS && ChaturangaWS.isConnected && game.isOnline) {
        ChaturangaWS.sendMove(from, to);
        return;
      }

      animateMove(from, to, () => {
        const success = game.makeMove(from, to);
        if (success) {
          lastMoveFrom = from;
          lastMoveTo   = to;

          // ── Update seerData ──────────────────────────────────────────
          const seerRecord = {
            moveNumber: game.seerData.moveHistory.length + 1,
            player: game.turnIndex === 0 ? (game.players.length > 0 ? (from ? game.board.get(to)?.owner ?? game.turnIndex : game.turnIndex) : 0) : game.turnIndex,
            from, to,
            pieceMoved: game.board.get(to) ? game.board.get(to).type : null,
            captured: isCapture ? target.type : null,
            capturedMoveNum: isCapture ? game.seerData.captureCount + 1 : null,
            forfeit: false,
            materialBalanceAfter: globalThis.ChaturangaSeer ? ChaturangaSeer.computeMaterialBalance(game, 0) : 0
          };
          // fix player from piece.owner
          const movedPiece = game.board.get(to);
          if (movedPiece) seerRecord.player = movedPiece.owner;

          game.seerData.moveHistory.push(seerRecord);
          if (isCapture) {
            game.seerData.captureCount++;
            const tn = target.type;
            game.seerData.pieceCaptureCounts[tn] = (game.seerData.pieceCaptureCounts[tn] || 0) + 1;
          }
          game.seerData.materialBalance.push(seerRecord.materialBalanceAfter);

          if (isCapture) playCaptureSfx();
          else           playMoveSfx();

          if (game.pendingElimination) {
            animateElimination(game.pendingElimination.squares, () => {
              game.completeElimination();
              if (status) status.textContent = 'Move done';
              selectedSquare = null; legalMoves = [];
              render(); tryAutoRoll();
            });
          } else {
            if (status) status.textContent = 'Move done';
            selectedSquare = null; legalMoves = [];
            render(); tryAutoRoll();
          }
        } else {
          selectedSquare = null; legalMoves = [];
          render();
        }
      });
    }

    // ── Move Animation ────────────────────────────────────────────────────
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
        if (el) { const p = el.querySelector('.piece'); if (p) p.classList.add('piece-eliminating'); }
      });
      setTimeout(() => { if (callback) callback(); isAnimating = false; }, 600);
    }

    // ── Update UI ──────────────────────────────────────────────────────────
    function updateUI() {
      const player = game.getPlayer();

      if (player && !player.eliminated) {
        if (turnIndicator) turnIndicator.textContent = PLAYER_LABELS[player.id] + ' (Team ' + (player.team + 1) + ')';
        if (turnDot)       turnDot.className = 'turn-color-dot ' + (player.color || '');
      }

      const diceVal = game.lastDice != null ? game.lastDice : '?';
      if (diceFace) diceFace.innerHTML = '<span>' + (game.lastDice != null ? game.lastDice : '<i class="fa-solid fa-question"></i>') + '</span>';
      if (focusDiceFace) focusDiceFace.textContent = diceVal;

      // Dice roll animation via ui-enhancements
      if (globalThis.ChaturangaUIEnhancements && game.lastDice != null) {
        ChaturangaUIEnhancements.animateDiceRoll(diceFace);
      }

      const forcedName = game.forcedPiece ? (globalThis.Dice ? globalThis.Dice.getPieceName(game.forcedPiece) : game.forcedPiece) : null;
      const forcedText = forcedName ? 'Move: ' + forcedName : 'Roll the Pāśaka';
      if (forced)    { forced.textContent = forcedText; forced.className = 'forced-label' + (forcedName ? ' highlighted' : ''); }
      if (mobForced) mobForced.textContent = forcedName || '—';
      if (focusForced) focusForced.textContent = forcedName || 'Roll';

      for (let i = 0; i < 4; i++) {
        const cell = document.getElementById('diceCell' + i);
        if (cell) {
          const face = cell.querySelector('.dc-face');
          if (face) face.textContent = game.playerLastDice[i] != null ? game.playerLastDice[i] : '—';
          cell.classList.toggle('current-turn', game.turnIndex === i && player && !player.eliminated);
        }
      }

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

      const allCaptured = game.players.flatMap(p => p.capturedPieces || []);
      if (captured) {
        if (allCaptured.length) {
          const byType = {};
          allCaptured.forEach(p => { byType[p.type] = (byType[p.type] || 0) + 1; });
          captured.innerHTML = Object.entries(byType).map(([t,c]) => (SYMBOLS[t]||'?') + ' ×' + c).join('  ');
        } else { captured.textContent = 'None'; }
      }

      const turnNotation = (move) => {
        if (!move) return '—';
        if (move.forfeit) {
          const pn = move.forfeitPiece && globalThis.Dice ? globalThis.Dice.getPieceName(move.forfeitPiece) : (move.forfeitPiece || '?');
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
            const parts = rm.map(m => '<span class="hist-' + (PLAYER_COLORS[m.playerId]||'') + '">' + PLAYER_LABELS[m.playerId ?? 0][0] + ': ' + turnNotation(m) + '</span>');
            return '<div class="history-item">' + (ri+1) + '. ' + parts.join(' ') + '</div>';
          }).join('');
          history.scrollTop = history.scrollHeight;
        } else { history.textContent = 'No moves yet'; }
      }

      if (forfeitBtn)       forfeitBtn.disabled = !game.forcedPiece || game.gameOver || ((player?.manualForfeitCount||0) >= 3);
      if (forfeitBtnMobile) forfeitBtnMobile.disabled = !game.forcedPiece || game.gameOver || ((player?.manualForfeitCount||0) >= 3);
      if (rollBtn)          rollBtn.disabled = !!(game.forcedPiece || game.gameOver);
      if (rollBtnMobile)    rollBtnMobile.disabled = !!(game.forcedPiece || game.gameOver);

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
        // Save to Seer vault
        if (globalThis.ChaturangaSeer) ChaturangaSeer.saveGame(game);
        if (autoDownloadOnEndEl && autoDownloadOnEndEl.checked) downloadHistory();
      } else if (game.pendingKingRespawn) {
        if (gameState) { gameState.textContent = 'Raja may respawn!'; gameState.className = 'game-state-badge respawn-pending'; }
        showKingRespawnModal();
      } else {
        if (gameState) { gameState.textContent = ''; gameState.className = 'game-state-badge'; }
        hideModals();
      }

      // Seer Engine live panel update
      if (globalThis.ChaturangaSeer) ChaturangaSeer.updatePanel(game);
    }

    // ── Auto-Roll / Bot Turn ─────────────────────────────────────────────
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
        if (globalThis.Dice) {
          playDiceSfx();
          if (diceFace) diceFace.classList.add('rolling');
          setTimeout(() => { if (diceFace) diceFace.classList.remove('rolling'); }, 660);
          globalThis.Dice.roll(game, diceFace, () => {
            render();
            if (game.autoForfeitIfNoMove()) { render(); tryAutoRoll(); }
            else if (isBotTurn()) setTimeout(doBotMove, 400);
          });
        }
      }, 400);
    }

    function doBotMove() {
      if (game.gameOver) return;
      const elo = botEloEl ? Number.parseInt(botEloEl.value, 10) : 300;
      if (elo >= 400 && status) status.textContent = elo >= 700 ? 'Advanced bot thinking…' : 'Bot is thinking…';
      const delay = elo >= 700 ? 800 : elo >= 400 ? 600 : 200;
      setTimeout(() => {
        const move = getBotMove();
        if (move && game.makeMove(move.from, move.to)) {
          lastMoveFrom = move.from;
          lastMoveTo   = move.to;

          // seer tracking for bots too
          game.seerData.moveHistory.push({
            moveNumber: game.seerData.moveHistory.length + 1,
            player: game.turnIndex,
            from: move.from, to: move.to,
            pieceMoved: game.board.get(move.to)?.type || null,
            captured: move.cap ? move.cap : null,
            capturedMoveNum: move.cap ? game.seerData.captureCount + 1 : null,
            forfeit: false,
            materialBalanceAfter: globalThis.ChaturangaSeer ? ChaturangaSeer.computeMaterialBalance(game, 0) : 0
          });
          if (move.cap) {
            game.seerData.captureCount++;
            game.seerData.pieceCaptureCounts[move.cap] = (game.seerData.pieceCaptureCounts[move.cap] || 0) + 1;
            playCaptureSfx();
          } else { playMoveSfx(); }
          game.seerData.materialBalance.push(game.seerData.moveHistory[game.seerData.moveHistory.length-1].materialBalanceAfter);

          if (game.pendingElimination) {
            animateElimination(game.pendingElimination.squares, () => {
              game.completeElimination(); render(); tryAutoRoll();
            });
          } else { render(); tryAutoRoll(); }
        } else if (game.autoForfeitIfNoMove()) {
          game.seerData.moveHistory.push({ moveNumber: game.seerData.moveHistory.length+1, player: game.turnIndex, forfeit:true, forfeitPiece: game.forcedPiece, materialBalanceAfter:0 });
          render(); tryAutoRoll();
        }
      }, delay);
    }

    // ── Roll Button ────────────────────────────────────────────────────────
    function doManualRoll() {
      if (game.forcedPiece) { if (status) status.textContent = 'Move your ' + (PIECE_NAMES[game.forcedPiece] || game.forcedPiece) + ' first'; return; }
      if (globalThis.Dice) {
        playDiceSfx();
        if (diceFace) diceFace.classList.add('rolling');
        setTimeout(() => diceFace && diceFace.classList.remove('rolling'), 660);
        globalThis.Dice.roll(game, diceFace, () => {
          render();
          if (game.autoForfeitIfNoMove()) { render(); tryAutoRoll(); }
        });
      }
    }
    if (rollBtn)       rollBtn.addEventListener('click', doManualRoll);
    if (rollBtnMobile) rollBtnMobile.addEventListener('click', doManualRoll);

    // ── Forfeit ────────────────────────────────────────────────────────────
    function doForfeit() {
      if (!game.forcedPiece) { if (status) status.textContent = 'No active dice roll to forfeit'; return; }
      const player = game.getPlayer();
      if (player && (player.manualForfeitCount || 0) >= 3) {
        if (status) status.textContent = 'Maximum 3 manual forfeits per player reached';
        return;
      }
      if (game.forfeitTurn()) {
        game.seerData.moveHistory.push({ moveNumber: game.seerData.moveHistory.length+1, player: player.id, forfeit:true, forfeitPiece: game.forcedPiece, materialBalanceAfter:0 });
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
    if (settingsClose)  settingsClose.addEventListener('click',  () => settingsDrawer && settingsDrawer.classList.remove('open'));

    // ── Fullscreen ─────────────────────────────────────────────────────────
    if (fullscreenBtn) {
      fullscreenBtn.addEventListener('click', () => {
        if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(() => {});
        else document.exitFullscreen();
      });
    }

    // ── Game Mode ──────────────────────────────────────────────────────────
    if (modeTeamBtn)   modeTeamBtn.addEventListener('click',   () => { game.setGameMode('team');   modeTeamBtn.classList.add('active');   if (modeSingleBtn) modeSingleBtn.classList.remove('active'); });
    if (modeSingleBtn) modeSingleBtn.addEventListener('click', () => { game.setGameMode('single'); modeSingleBtn.classList.add('active'); if (modeTeamBtn)   modeTeamBtn.classList.remove('active'); });

    // ── Bot Config ─────────────────────────────────────────────────────────
    if (botCountEl) {
      const params  = new URLSearchParams(window.location.search);
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
        // Reset opening book / transposition table for advanced bots
        if (globalThis.ChaturangaAdvancedBots) {
          if (ChaturangaAdvancedBots.resetOpeningBook)       ChaturangaAdvancedBots.resetOpeningBook();
          if (ChaturangaAdvancedBots.clearTranspositionTable) ChaturangaAdvancedBots.clearTranspositionTable();
        }
        // Reset seerData
        game.seerData = { moveHistory:[], captureCount:0, pieceCaptureCounts:{}, materialBalance:[], turningPoint:null, startTime:Date.now() };
        if (globalThis.ChaturangaAntiCheat) ChaturangaAntiCheat.reset();
        render(); tryAutoRoll();
      });
    }

    // ── Board Size ──────────────────────────────────────────────────────────
    if (boardSizeEl && boardSizeLabel) {
      const saved = localStorage.getItem('chaturanga_boardSize_v3');
      const val   = saved ? Math.min(130, Math.max(70, Number.parseInt(saved, 10))) : 100;
      boardSizeEl.value = val;
      boardSizeLabel.textContent = val + '%';
      const getBase  = () => globalThis.innerWidth < 640 ? Math.floor((globalThis.innerWidth - 32) / 8) : 68;
      const applySize = (v) => { const s = Math.floor(getBase() * (v / 100)); document.documentElement.style.setProperty('--sq', s + 'px'); };
      applySize(val);
      boardSizeEl.addEventListener('input', () => {
        const v = Number.parseInt(boardSizeEl.value, 10);
        boardSizeLabel.textContent = v + '%';
        applySize(v);
        localStorage.setItem('chaturanga_boardSize_v3', String(v));
      });
      window.addEventListener('resize', () => applySize(Number.parseInt(boardSizeEl.value, 10)));
    }

    // ── Board Theme ─────────────────────────────────────────────────────────
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

    // ── Download History ────────────────────────────────────────────────────
    function downloadHistory() {
      const turnNotation = (move) => {
        if (!move) return '—';
        if (move.forfeit) return 'Forfeit(' + (move.forfeitPiece||'?') + ')';
        if (!move.piece || !move.to) return '—';
        return pieceLetter(move.piece) + (move.cap ? '×' : '') + move.to;
      };
      const rounds = [];
      for (let i = 0; i < game.moveHistory.length; i += 4) rounds.push(game.moveHistory.slice(i, i + 4));
      let content = 'Chaturanga v1.0.4 — Game Log\n================================\n\n';
      content += rounds.map((rm,ri) => (ri+1) + '. ' + rm.map(m => PLAYER_LABELS[m.playerId??0] + ': ' + turnNotation(m)).join(' | ')).join('\n');
      if (game.gameOver) {
        content += '\n\nResult: ';
        if (game.gameMode === 'single' && game.winnerPlayerId != null) content += PLAYER_LABELS[game.winnerPlayerId] + ' wins!';
        else if (game.winner != null) content += 'Team ' + (game.winner + 1) + ' wins!';
      }
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url  = URL.createObjectURL(blob);
      const a    = document.createElement('a');
      a.href = url;
      a.download = 'chaturanga_v104_' + new Date().toISOString().slice(0,19).replace(/[:T]/g,'-') + '.txt';
      document.body.appendChild(a); a.click(); a.remove();
      URL.revokeObjectURL(url);
    }
    if (downloadHistoryBtn) downloadHistoryBtn.addEventListener('click', downloadHistory);

    // ── History color CSS ───────────────────────────────────────────────────
    const histStyle = document.createElement('style');
    histStyle.textContent = `
      .hist-red    { color:#f87171; }
      .hist-blue   { color:#60a5fa; }
      .hist-green  { color:#4ade80; }
      .hist-yellow { color:#fbbf24; }
      .history-item > span + span::before { content: ' | '; color: var(--text-muted); }
    `;
    document.head.appendChild(histStyle);

    // ── Keyboard deselect hook ──────────────────────────────────────────────
    document.addEventListener('chaturanga:deselect', () => {
      selectedSquare = null; legalMoves = []; render();
    });

    // ── Unload guard ─────────────────────────────────────────────────────────
    window.addEventListener('beforeunload', (e) => {
      if (game.moveHistory.length > 0 && !(autoDownloadOnEndEl && autoDownloadOnEndEl.checked)) {
        e.preventDefault();
        e.returnValue = 'Download game history before leaving?';
      }
    });

    // ── Initial render ────────────────────────────────────────────────────
    render();

    // Seer vault list on first load
    if (globalThis.ChaturangaSeer) ChaturangaSeer.renderVaultList();

  } catch(err) {
    console.error('Chaturanga UI init error:', err);
    const s = document.getElementById('status');
    if (s) s.textContent = 'Init error: ' + err.message;
  }
});
