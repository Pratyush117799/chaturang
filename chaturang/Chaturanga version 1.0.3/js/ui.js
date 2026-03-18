// Chaturanga 1.0.3 - UI with focus mode, resizable board, forfeit cap
document.addEventListener('DOMContentLoaded', () => {
  try {
    if (!window.ChaturangaGame) {
      document.getElementById('status').textContent = 'Error: Game class not loaded.';
      return;
    }

    const game = new window.ChaturangaGame();
    const boardEl = document.getElementById('board');
    if (!boardEl) return;

    const rollBtn = document.getElementById('rollBtn');
    const forfeitBtn = document.getElementById('forfeitBtn');
    const diceFace = document.getElementById('diceFace');
    const forced = document.getElementById('forcedPiece');
    const turnIndicator = document.getElementById('turnIndicator');
    const status = document.getElementById('status');
    const captured = document.getElementById('captured');
    const history = document.getElementById('history');
    const downloadHistoryBtn = document.getElementById('downloadHistoryBtn');
    const gameState = document.getElementById('gameState');
    const kingRespawnModal = document.getElementById('kingRespawnModal');
    const autoRollDiceEl = document.getElementById('autoRollDice');
    const autoDownloadOnEndEl = document.getElementById('autoDownloadOnEnd');
    const modeTeamBtn = document.getElementById('modeTeam');
    const modeSingleBtn = document.getElementById('modeSingle');
    const focusModeEl = document.getElementById('focusMode');
    const boardSizeEl = document.getElementById('boardSize');
    const boardSizeLabel = document.getElementById('boardSizeLabel');
    // const playVsBotEl = document.getElementById('playVsBot'); // Removed
    const botCountEl = document.getElementById('botCount');
    const focusDiceFace = document.getElementById('focusDiceFace');
    const focusForced = document.getElementById('focusForced');

    let selectedSquare = null;
    function isBotTurn() {
      // Check if current player is configured as bot
      const player = game.getPlayer();
      return player && player.isBot && !player.eliminated;
    }
    let legalMoves = [];
    let isAnimating = false;

    // ... (keep constants) ...
    const PIECE_NAMES = { king: 'Raja', rook: 'Ratha', pawn: 'Nara', elephant: 'Danti', horse: 'Ashwa' };
    const COLOR_NAMES = { red: 'Red', blue: 'Blue', green: 'Green', yellow: 'Yellow' };

    // ... (helper functions) ...

    function render() {
      // ... (existing render code, omitting for brevity in replace block, assuming partial replace isn't possible, 
      // oh wait I can't strip render() here. I need to be careful.)
      // Actually, I just need to update `updateUI` to sync the focus dice.

      // Let's check where I am replacing.
      // I am replacing the top block of variable declarations and isBotTurn logic.
    }
    // Wait, the tool requires me to supply replacement content for a specific block. I shouldn't delete `render`.
    // I will replace just the top block.



    function pieceImageUrl(piece) {
      const colorName = COLOR_NAMES[piece.color] || piece.color;
      const typeName = PIECE_NAMES[piece.type] || piece.type;
      const base = 'images/pieces/' + colorName + '_' + typeName;
      return base + '.jpeg';
    }

    function pieceLetter(piece) {
      const map = { king: 'K', rook: 'R', horse: 'H', elephant: 'E', pawn: 'P' };
      return map[piece && piece.type] || '?';
    }

    function symbolFor(piece) {
      const symbols = { pawn: '♟', horse: '♞', elephant: '♝', rook: '♜', king: '♚' };
      return symbols[piece && piece.type] || '?';
    }

    function getPieceColor(piece) {
      const colors = { red: '#D32F2F', green: '#388E3C', blue: '#1976D2', yellow: '#FBC02D' };
      return colors[piece.color] || '#666';
    }

    function render() {
      if (isAnimating) return;
      try {
        boardEl.innerHTML = '';
        for (let r = 8; r >= 1; r--) {
          for (let f = 0; f < 8; f++) {
            const sq = String.fromCharCode(97 + f) + r;
            const cell = document.createElement('div');
            cell.className = 'square ' + (((f + r) % 2 === 0) ? 'light' : 'dark');
            cell.dataset.square = sq;
            if (r === 8 && f === 0) {
              const rankLabel = document.createElement('div');
              rankLabel.className = 'rank-label';
              rankLabel.textContent = r;
              cell.appendChild(rankLabel);
            }
            if (r === 1 && f === 7) {
              const fileLabel = document.createElement('div');
              fileLabel.className = 'file-label';
              fileLabel.textContent = String.fromCharCode(97 + f);
              cell.appendChild(fileLabel);
            }
            const piece = game.board.get(sq);
            if (piece) {
              const img = document.createElement('img');
              img.className = 'piece';
              img.style.width = '52px';
              img.style.height = '52px';
              img.alt = piece.type;
              img.title = piece.type + ' (' + piece.color + ')';
              img.dataset.pieceType = piece.type;
              img.dataset.pieceOwner = piece.owner;
              img.src = pieceImageUrl(piece);
              img.onerror = function () {
                this.onerror = null;
                const base = this.src.replace(/\.(jpeg|jpg|png)$/i, '');
                this.src = base + '.png';
                this.onerror = function () { this.style.display = 'none'; };
              };
              cell.appendChild(img);
            }
            if (selectedSquare === sq) cell.classList.add('selected');
            if (legalMoves.includes(sq)) {
              cell.classList.add('legal-move');
              const indicator = document.createElement('div');
              indicator.className = 'move-indicator';
              cell.appendChild(indicator);
            }
            cell.addEventListener('click', () => onSquareClick(sq));
            cell.addEventListener('mouseenter', () => onSquareHover(sq, cell));
            cell.addEventListener('mouseleave', () => onSquareLeave(cell));
            boardEl.appendChild(cell);
          }
        }
        updateUI();
      } catch (e) {
        if (status) status.textContent = 'Render error: ' + e.message;
      }
    }

    function updateUI() {
      const player = game.getPlayer();
      const playerColors = ['Red', 'Blue', 'Green', 'Yellow'];
      if (player && !player.eliminated) {
        turnIndicator.textContent = playerColors[player.id] + ' (Team ' + (player.team + 1) + ')';
        turnIndicator.className = 'player-badge ' + player.color;
      } else {
        turnIndicator.textContent = '—';
        turnIndicator.className = 'player-badge';
      }
      if (game.forcedPiece) {
        forced.textContent = 'Forced: ' + (window.Dice ? window.Dice.getPieceName(game.forcedPiece) : game.forcedPiece);
      } else {
        forced.textContent = 'Forced: —';
      }
      diceFace.textContent = game.lastDice != null ? game.lastDice : '—';
      // Focus overlay update
      if (focusDiceFace) focusDiceFace.textContent = game.lastDice != null ? game.lastDice : '?';
      if (focusForced) {
        if (game.forcedPiece) focusForced.textContent = (window.Dice ? window.Dice.getPieceName(game.forcedPiece) : game.forcedPiece);
        else focusForced.textContent = 'Roll';
      }

      for (let i = 0; i < 4; i++) {
        const cell = document.getElementById('diceCell' + i);
        if (cell) {
          const face = cell.querySelector('.dice-cell-face');
          if (face) face.textContent = game.playerLastDice[i] != null ? game.playerLastDice[i] : '—';
          if (game.turnIndex === i && player && !player.eliminated) cell.classList.add('current-turn');
          else cell.classList.remove('current-turn');
        }
      }
      if (Array.isArray(game.initWarnings) && game.initWarnings.length > 0) {
        status.textContent = 'Setup: ' + game.initWarnings[0];
      }
      const allCaptured = game.players.flatMap(p => p.capturedPieces);
      if (allCaptured.length > 0) {
        const byType = {};
        allCaptured.forEach(p => { byType[p.type] = (byType[p.type] || 0) + 1; });
        captured.innerHTML = Object.entries(byType).map(([t, c]) => symbolFor({ type: t }) + ' × ' + c).join(' ');
      } else captured.textContent = 'None';
      const playerLabel = (id) => (['Red', 'Blue', 'Green', 'Yellow'][id] || 'P' + (id + 1));
      const turnNotation = (move) => {
        if (!move) return '—';
        if (move.forfeit) {
          const pn = move.forfeitPiece && window.Dice ? window.Dice.getPieceName(move.forfeitPiece) : (move.forfeitPiece || '?');
          return 'Forfeit(' + pn + ')';
        }
        if (!move.piece || !move.to) return '—';
        const letter = pieceLetter(move.piece);
        return letter + (move.cap ? 'x' : '') + move.to;
      };
      const rounds = [];
      for (let i = 0; i < game.moveHistory.length; i += 4) rounds.push(game.moveHistory.slice(i, i + 4));
      history.innerHTML = rounds.length ? rounds.map((rm, ri) => {
        const parts = rm.map(m => playerLabel(m.playerId ?? 0) + ': ' + turnNotation(m));
        return '<div class="history-item">' + (ri + 1) + '. ' + parts.join(' | ') + '</div>';
      }).join('') : 'No moves yet';
      if (game.gameOver) {
        if (game.gameMode === 'single' && game.winnerPlayerId != null) {
          gameState.textContent = 'Game Over! ' + playerLabel(game.winnerPlayerId) + ' wins!';
        } else if (game.winner != null) {
          gameState.textContent = 'Game Over! Team ' + (game.winner + 1) + ' wins!';
        } else {
          gameState.textContent = 'Game Over!';
        }
        gameState.className = 'game-state game-over';
        status.textContent = 'Game finished';
        if (autoDownloadOnEndEl && autoDownloadOnEndEl.checked) downloadHistory();
      } else if (game.pendingKingRespawn) {
        gameState.textContent = 'King can respawn - click empty square';
        gameState.className = 'game-state respawn-pending';
        showKingRespawnModal();
      } else {
        gameState.textContent = '';
        gameState.className = 'game-state';
        hideModals();
      }
      game.players.forEach((p, idx) => {
        const el = document.getElementById('player' + idx + '-kings');
        if (el) {
          el.textContent = 'Kings: ' + (p.hasKingOnBoard ? 1 : 0) + (p.frozen ? ' (Frozen)' : '');
          el.parentElement.classList.toggle('eliminated', p.eliminated);
        }
        const forfeitEl = document.getElementById('player' + idx + '-forfeits');
        if (forfeitEl) forfeitEl.textContent = (p.manualForfeitCount || 0) < 3 ? 'Forfeits: ' + (p.manualForfeitCount || 0) + '/3' : 'Forfeits: 3/3 (max)';
      });
      if (forfeitBtn) {
        const player = game.getPlayer();
        const atLimit = player && (player.manualForfeitCount || 0) >= 3;
        forfeitBtn.disabled = !game.forcedPiece || game.gameOver || atLimit;
      }
    }

    function onSquareClick(sq) {
      if (isAnimating || game.gameOver) return;
      if (game.pendingKingRespawn) {
        if (game.respawnKing(sq)) {
          status.textContent = 'King respawned!';
          render();
        } else status.textContent = 'Invalid square for respawn';
        return;
      }
      const piece = game.board.get(sq);
      if (selectedSquare) {
        if (legalMoves.includes(sq)) {
          const from = selectedSquare;
          const to = sq;
          const target = game.board.get(to);
          const wasSingleKingCapture = game.gameMode === 'single' && target && target.type === 'king';
          animateMove(from, to, () => {
            const success = game.makeMove(from, to);
            if (success) {
              if (game.pendingElimination) {
                animateElimination(game.pendingElimination.squares, () => {
                  game.completeElimination();
                  status.textContent = 'Move successful!';
                  selectedSquare = null;
                  legalMoves = [];
                  render();
                  tryAutoRoll();
                });
              } else {
                status.textContent = 'Move successful!';
                selectedSquare = null;
                legalMoves = [];
                render();
                tryAutoRoll();
              }
            } else {
              selectedSquare = null;
              legalMoves = [];
              render();
            }
          });
        } else {
          if (piece && piece.owner === game.getPlayer().id) selectPiece(sq);
          else { selectedSquare = null; legalMoves = []; render(); }
        }
      } else {
        if (piece && piece.owner === game.getPlayer().id) {
          if (game.getPlayer().frozen || game.getPlayer().eliminated) return;
          selectPiece(sq);
        } else status.textContent = 'Select your own piece';
      }
    }

    function animateElimination(squares, callback) {
      isAnimating = true;
      squares.forEach(sq => {
        const el = document.querySelector('[data-square="' + sq + '"]');
        if (el) {
          const pieceEl = el.querySelector('.piece');
          if (pieceEl) pieceEl.classList.add('piece-eliminating');
        }
      });
      setTimeout(() => {
        if (callback) callback();
        isAnimating = false;
      }, 650);
    }

    function selectPiece(sq) {
      selectedSquare = sq;
      legalMoves = game.getLegalMoves(sq);
      if (legalMoves.length === 0) {
        status.textContent = 'No legal moves for this piece';
        selectedSquare = null;
        legalMoves = [];
      } else status.textContent = legalMoves.length + ' legal move(s)';
      render();
    }

    function onSquareHover(sq, cell) {
      if (selectedSquare && legalMoves.includes(sq)) cell.classList.add('legal-hover');
    }
    function onSquareLeave(cell) { cell.classList.remove('legal-hover'); }

    function animateMove(from, to, callback) {
      isAnimating = true;
      const fromEl = document.querySelector('[data-square="' + from + '"]');
      const toEl = document.querySelector('[data-square="' + to + '"]');
      if (fromEl && toEl) {
        const pieceEl = fromEl.querySelector('.piece');
        if (pieceEl) {
          const fromRect = fromEl.getBoundingClientRect();
          const toRect = toEl.getBoundingClientRect();
          pieceEl.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
          pieceEl.style.zIndex = '1000';
          pieceEl.style.transform = 'translate(' + (toRect.left - fromRect.left) + 'px, ' + (toRect.top - fromRect.top) + 'px)';
        }
      }
      setTimeout(() => { if (callback) callback(); isAnimating = false; }, 320);
    }

    function showKingRespawnModal() {
      if (kingRespawnModal) {
        kingRespawnModal.style.display = 'flex';
        const cancelBtn = document.getElementById('cancelRespawn');
        if (cancelBtn) {
          cancelBtn.onclick = () => {
            game.pendingKingRespawn = null;
            render();
          };
        }
      }
    }
    function hideModals() {
      if (kingRespawnModal) kingRespawnModal.style.display = 'none';
    }

    function tryAutoRoll() {
      if (game.gameOver) return;
      const player = game.getPlayer();
      if (!player || player.eliminated) return;
      const doRoll = (autoRollDiceEl && autoRollDiceEl.checked) || isBotTurn();
      if (!doRoll) return;
      setTimeout(() => {
        if (game.forcedPiece != null) {
          if (isBotTurn() && window.ChaturangaRandomBot) {
            const move = window.ChaturangaRandomBot.getMove(game, 1);
            if (move && game.makeMove(move.from, move.to)) {
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
            }
          }
          return;
        }
        window.Dice && window.Dice.roll(game, diceFace);
        setTimeout(() => {
          render();
          if (game.autoForfeitIfNoMove()) {
            render();
            tryAutoRoll();
          } else if (isBotTurn() && window.ChaturangaRandomBot) {
            setTimeout(() => {
              const move = window.ChaturangaRandomBot.getMove(game, 1);
              if (move && game.makeMove(move.from, move.to)) {
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
              }
            }, 400);
          }
        }, 1200);
      }, 400);
    }

    if (rollBtn) {
      rollBtn.addEventListener('click', () => {
        if (game.forcedPiece) {
          status.textContent = 'You already rolled - make a move or forfeit';
          return;
        }
        window.Dice && window.Dice.roll(game, diceFace);
        setTimeout(() => {
          render();
          if (game.autoForfeitIfNoMove()) {
            render();
            tryAutoRoll();
          }
        }, 1200);
      });
    }

    if (forfeitBtn) {
      forfeitBtn.addEventListener('click', () => {
        if (!game.forcedPiece) {
          status.textContent = 'No active dice roll to forfeit';
          return;
        }
        const player = game.getPlayer();
        if (player && (player.manualForfeitCount || 0) >= 3) {
          status.textContent = 'Max 3 manual forfeits per player reached';
          return;
        }
        if (game.forfeitTurn()) {
          status.textContent = 'Turn forfeited';
          selectedSquare = null;
          legalMoves = [];
          render();
          tryAutoRoll();
        }
      });
    }

    const exitFocusBtn = document.getElementById('exitFocusMode');
    if (focusModeEl) {
      const saved = localStorage.getItem('chaturanga_focusMode');
      if (saved === 'true') {
        focusModeEl.checked = true;
        document.body.classList.add('focus-mode');
      }

      const toggleFocus = (isActive) => {
        if (isActive) {
          document.body.classList.add('focus-mode');
          localStorage.setItem('chaturanga_focusMode', 'true');
          if (exitFocusBtn) exitFocusBtn.style.display = 'flex';
        } else {
          document.body.classList.remove('focus-mode');
          localStorage.setItem('chaturanga_focusMode', 'false');
          if (exitFocusBtn) exitFocusBtn.style.display = 'none';
        }
      };

      focusModeEl.addEventListener('change', () => {
        toggleFocus(focusModeEl.checked);
      });

      if (exitFocusBtn) {
        exitFocusBtn.addEventListener('click', () => {
          focusModeEl.checked = false;
          toggleFocus(false);
        });
      }
    }

    if (boardSizeEl && boardSizeLabel) {
      const savedSize = localStorage.getItem('chaturanga_boardSize');
      const val = savedSize ? Math.min(130, Math.max(70, parseInt(savedSize, 10))) : 100;
      boardSizeEl.value = val;
      boardSizeLabel.textContent = val + '%';
      // UPDATED: Change --square-size instead of scale
      // Base square size is 70px.
      const newSize = Math.floor(70 * (val / 100));
      document.documentElement.style.setProperty('--square-size', newSize + 'px');

      boardSizeEl.addEventListener('input', () => {
        const v = parseInt(boardSizeEl.value, 10);
        boardSizeLabel.textContent = v + '%';
        const s = Math.floor(70 * (v / 100));
        document.documentElement.style.setProperty('--square-size', s + 'px');
        localStorage.setItem('chaturanga_boardSize', String(v));
      });
    }

    if (botCountEl) {
      // Init from URL if present (legacy compatibility)
      const params = new URLSearchParams(window.location.search);
      if (params.get('botCount')) {
        // Support ?botCount=1|2|3 from the website launcher
        const bc = parseInt(params.get('botCount'), 10);
        if (bc >= 0 && bc <= 4) {
          botCountEl.value = String(bc);
          game.setBotConfig(bc);
          if (bc === 4 && autoRollDiceEl) autoRollDiceEl.checked = true;
          if (bc > 0) {
            setTimeout(() => tryAutoRoll(), 800);
          }
        }
      } else if (params.get('mode') === 'computer') {
        botCountEl.value = '1';
        game.setBotConfig(1);
      }

      botCountEl.addEventListener('change', () => {
        const count = parseInt(botCountEl.value, 10);
        game.setBotConfig(count);
        // If 4 bots, auto-roll should probably be on?
        // User didn't strictly say so, but "Administrator... gather database" implies auto-play.
        if (count === 4 && autoRollDiceEl) {
          autoRollDiceEl.checked = true;
        }
        render(); // Re-render to update turn indicators?
        tryAutoRoll(); // Start if bot's turn
      });
    }

    function downloadHistory() {
      const playerLabel = (id) => (['Red', 'Blue', 'Green', 'Yellow'][id] || 'P' + (id + 1));
      const turnNotation = (move) => {
        if (!move) return '—';
        if (move.forfeit) {
          const pn = move.forfeitPiece && window.Dice ? window.Dice.getPieceName(move.forfeitPiece) : (move.forfeitPiece || '?');
          return 'Forfeit(' + pn + ')';
        }
        if (!move.piece || !move.to) return '—';
        return pieceLetter(move.piece) + (move.cap ? 'x' : '') + move.to;
      };
      const rounds = [];
      for (let i = 0; i < game.moveHistory.length; i += 4) rounds.push(game.moveHistory.slice(i, i + 4));
      let content = rounds.map((rm, ri) => (ri + 1) + '. ' + rm.map(m => playerLabel(m.playerId ?? 0) + ': ' + turnNotation(m)).join(' | ')).join('\n');
      if (game.gameOver) {
        let winnerLine = '';
        if (game.gameMode === 'single' && game.winnerPlayerId != null) winnerLine = 'Winner: ' + playerLabel(game.winnerPlayerId);
        else if (game.winner != null) winnerLine = 'Winner: Team ' + (game.winner + 1);
        if (winnerLine) content = content + '\n\n' + winnerLine;
      }
      const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      const suffix = game.gameOver && game.winner != null ? 'Team' + (game.winner + 1) : (game.winnerPlayerId != null ? 'Player' + game.winnerPlayerId : '');
      const type = botCountEl && botCountEl.value === '4' ? '_AutoBot_Game' : '';
      a.download = 'chaturanga' + type + '_' + new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-') + (suffix ? '_' + suffix : '') + '.txt';
      document.body.appendChild(a);
      a.click();
      a.remove();
      URL.revokeObjectURL(url);
    }

    if (downloadHistoryBtn) downloadHistoryBtn.addEventListener('click', downloadHistory);

    if (modeTeamBtn) {
      modeTeamBtn.addEventListener('click', () => {
        game.setGameMode('team');
        modeTeamBtn.classList.add('active');
        if (modeSingleBtn) modeSingleBtn.classList.remove('active');
      });
    }
    if (modeSingleBtn) {
      modeSingleBtn.addEventListener('click', () => {
        game.setGameMode('single');
        modeSingleBtn.classList.add('active');
        if (modeTeamBtn) modeTeamBtn.classList.remove('active');
      });
    }

    window.addEventListener('beforeunload', (e) => {
      if (game.moveHistory.length > 0 && (!autoDownloadOnEndEl || !autoDownloadOnEndEl.checked)) {
        e.preventDefault();
        e.returnValue = 'Save game to database? Download game history before closing?';
      }
    });

    render();
  } catch (error) {
    console.error('Error initializing game:', error);
    const statusEl = document.getElementById('status');
    if (statusEl) statusEl.textContent = 'Error: ' + error.message;
  }
});
