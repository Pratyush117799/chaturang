// Enhanced UI with Smooth Animations and Interactive Features
document.addEventListener('DOMContentLoaded', () => {
  try {
    // Check if game class exists
    if (!window.ChaturangaGame) {
      console.error('ChaturangaGame class not found!');
      document.getElementById('status').textContent = 'Error: Game class not loaded. Check console.';
      return;
    }

    const game = new window.ChaturangaGame();
    
    const boardEl = document.getElementById('board');
    
    if (!boardEl) {
      console.error('Board element not found!');
      return;
    }
    
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
    const promotionModal = document.getElementById('promotionModal');
    const kingRespawnModal = document.getElementById('kingRespawnModal');

  let selectedSquare = null;
  let legalMoves = [];
  let isAnimating = false;

  const pieceLetter = (piece) => {
    const map = { king: 'K', rook: 'R', horse: 'H', elephant: 'E', pawn: 'P' };
    return map[piece.type] || '?';
  };

  const symbolFor = (piece) => {
    const symbols = {
      pawn: '♟',
      horse: '♞',
      elephant: '♝',
      rook: '♜',
      king: '♚'
    };
    return symbols[piece.type] || '?';
  };

  const getPieceColor = (piece) => {
    const colors = {
      red: '#D32F2F',
      green: '#388E3C',
      black: '#212121',
      yellow: '#FBC02D'
    };
    return colors[piece.color] || '#666';
  };

  const render = () => {
    if (isAnimating) return;
    if (!boardEl) {
      console.error('Board element not available for rendering');
      return;
    }
    
    try {
      boardEl.innerHTML = '';
      
      // Create board squares
      for (let r = 8; r >= 1; r--) {
        for (let f = 0; f < 8; f++) {
          const sq = String.fromCharCode(97 + f) + r;
          const cell = document.createElement('div');
          cell.className = 'square ' + (((f + r) % 2 === 0) ? 'light' : 'dark');
          cell.dataset.square = sq;
        
          // Add file and rank labels on edges
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
            try {
              if (piece.type === 'rook' || piece.type === 'elephant') {
                const img = document.createElement('img');
                img.className = 'piece';
                img.style.width = '52px';
                img.style.height = '52px';
                img.alt = piece.type;
                img.title = `${piece.type} (${piece.color}) - ${piece.isMinor() ? 'Minor' : 'Major'}`;
                img.dataset.pieceType = piece.type;
                img.dataset.pieceOwner = piece.owner;

                if (piece.type === 'rook') {
                  img.src = 'images/Ratha.png';
                } else if (piece.type === 'elephant') {
                  img.src = 'images/gaja.jpg';
                }

                cell.appendChild(img);
              } else {
                const span = document.createElement('span');
                span.className = 'piece';
                span.textContent = symbolFor(piece);
                span.style.color = getPieceColor(piece);
                span.style.fontSize = piece.isLarge() ? '42px' : '36px';
                span.title = `${piece.type} (${piece.color}) - ${piece.isMinor() ? 'Minor' : 'Major'}`;
                span.dataset.pieceType = piece.type;
                span.dataset.pieceOwner = piece.owner;
                cell.appendChild(span);
              }
            } catch (pieceError) {
              console.error('Error rendering piece at', sq, pieceError);
            }
          }
        
          // Highlight selected square
          if (selectedSquare === sq) {
            cell.classList.add('selected');
          }
        
          // Highlight legal moves
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

      // Update UI elements
      updateUI();
    } catch (error) {
      console.error('Error rendering board:', error);
      if (status) {
        status.textContent = `Render error: ${error.message}`;
      }
    }
  };

  const updateUI = () => {
    const player = game.getPlayer();
    const playerColors = ['Red', 'Black', 'Green', 'Yellow'];
    turnIndicator.textContent = `${playerColors[player.id]} (Team ${player.team + 1})`;
    turnIndicator.className = `player-badge ${player.color}`;
    
    if (game.forcedPiece) {
      const pieceName = window.Dice.getPieceName(game.forcedPiece);
      forced.textContent = `Forced: ${pieceName}`;
    } else {
      forced.textContent = 'Forced: —';
    }
    
    if (game.lastDice) {
      diceFace.textContent = game.lastDice;
    } else {
      diceFace.textContent = '—';
    }
    
    // Surface any init warnings (e.g., overlapping placements)
    if (Array.isArray(game.initWarnings) && game.initWarnings.length > 0) {
      status.textContent = `Setup note: ${game.initWarnings[0]}`;
    }

    // Update captured pieces
    const allCaptured = game.players.flatMap(p => p.capturedPieces);
    if (allCaptured.length > 0) {
      const capturedByType = {};
      allCaptured.forEach(p => {
        capturedByType[p.type] = (capturedByType[p.type] || 0) + 1;
      });
      captured.innerHTML = Object.entries(capturedByType)
        .map(([type, count]) => `${symbolFor({ type })} × ${count}`)
        .join(' ');
    } else {
      captured.textContent = 'None';
    }
    
    // Update move history, grouping one turn of all 4 players as one move
    if (game.moveHistory.length > 0) {
      const all = game.moveHistory;

      const playerLabel = (id) => {
        const labels = ['Red', 'Black', 'Green', 'Yellow'];
        return labels[id] || `P${(id ?? 0) + 1}`;
      };

      const turnNotation = (move) => {
        if (!move) return '—';
        if (move.forfeit) return 'Forfeit';
        if (!move.piece || !move.to) return '—';
        const letter = pieceLetter(move.piece);
        const captureMark = move.cap ? 'x' : '';
        return `${letter}${captureMark}${move.to}`; // e.g. Kxb4
      };

      const rounds = [];
      for (let i = 0; i < all.length; i += 4) {
        rounds.push(all.slice(i, i + 4));
      }

      history.innerHTML = rounds.map((roundMoves, roundIndex) => {
        const parts = roundMoves.map((move) => {
          const pid = move.playerId ?? 0;
          return `${playerLabel(pid)}: ${turnNotation(move)}`;
        });
        return `<div class="history-item">${roundIndex + 1}. ${parts.join(' | ')}</div>`;
      }).join('');
    } else {
      history.textContent = 'No moves yet';
    }
    
    // Update game state
    if (game.gameOver) {
      const winnerTeam = game.winner;
      const winnerPlayers = game.players.filter(p => p.team === winnerTeam);
      gameState.textContent = `Game Over! Team ${winnerTeam + 1} wins!`;
      gameState.className = 'game-state game-over';
      status.textContent = 'Game finished';
    } else if (game.pendingPromotion) {
      gameState.textContent = 'Choose promotion piece';
      gameState.className = 'game-state promotion-pending';
      showPromotionModal();
    } else if (game.pendingKingRespawn) {
      gameState.textContent = 'King can respawn - click empty square';
      gameState.className = 'game-state respawn-pending';
      showKingRespawnModal();
    } else {
      gameState.textContent = '';
      gameState.className = 'game-state';
      hideModals();
    }
    
    // Update king counts
    game.players.forEach((player, idx) => {
      const kingEl = document.getElementById(`player${idx}-kings`);
      if (kingEl) {
        const kingsOnBoard = player.hasKingOnBoard ? 1 : 0;
        const status = player.frozen ? ' (Frozen)' : '';
        kingEl.textContent = `Kings: ${kingsOnBoard}${status}`;
        if (player.frozen) {
          kingEl.classList.add('frozen');
        } else {
          kingEl.classList.remove('frozen');
        }
      }
    });
  };

  const onSquareClick = (sq) => {
    if (isAnimating || game.gameOver) return;
    
    // Handle king respawn
    if (game.pendingKingRespawn) {
      if (game.respawnKing(sq)) {
        status.textContent = 'King respawned!';
        render();
        return;
      } else {
        status.textContent = 'Invalid square for respawn';
        return;
      }
    }
    
    // Handle promotion (shouldn't happen on square click, but just in case)
    if (game.pendingPromotion) {
      status.textContent = 'Please select promotion piece from modal';
      return;
    }
    
    const piece = game.board.get(sq);
    
    if (selectedSquare) {
      // Attempt to move
      if (legalMoves.includes(sq)) {
        animateMove(selectedSquare, sq, () => {
          const success = game.makeMove(selectedSquare, sq);
          if (success) {
            status.textContent = 'Move successful!';
            selectedSquare = null;
            legalMoves = [];
            render();
          } else {
            status.textContent = 'Move failed';
            selectedSquare = null;
            legalMoves = [];
            render();
          }
        });
      } else {
        // Clicked on non-legal square - deselect or select new piece
        if (piece && piece.owner === game.getPlayer().id) {
          selectPiece(sq);
        } else {
          selectedSquare = null;
          legalMoves = [];
          status.textContent = 'Invalid destination';
          render();
        }
      }
    } else {
      // Select piece
      if (piece && piece.owner === game.getPlayer().id) {
        if (game.getPlayer().frozen) {
          status.textContent = 'You are frozen (king captured twice)';
          return;
        }
        selectPiece(sq);
      } else {
        status.textContent = 'Select your own piece';
      }
    }
  };

  const selectPiece = (sq) => {
    selectedSquare = sq;
    legalMoves = game.getLegalMoves(sq);
    
    if (legalMoves.length === 0) {
      status.textContent = 'No legal moves for this piece (check dice/blocking)';
      selectedSquare = null;
      legalMoves = [];
    } else {
      status.textContent = `${legalMoves.length} legal move(s) available`;
    }
    
    render();
  };

  const onSquareHover = (sq, cell) => {
    if (selectedSquare && legalMoves.includes(sq)) {
      cell.classList.add('legal-hover');
    }
  };

  const onSquareLeave = (cell) => {
    cell.classList.remove('legal-hover');
  };

  const animateMove = (from, to, callback) => {
    isAnimating = true;
    const fromEl = document.querySelector(`[data-square="${from}"]`);
    const toEl = document.querySelector(`[data-square="${to}"]`);
    
    if (fromEl && toEl) {
      const pieceEl = fromEl.querySelector('.piece');
      if (pieceEl) {
        pieceEl.style.transition = 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)';
        pieceEl.style.zIndex = '1000';
        
        // Calculate position
        const fromRect = fromEl.getBoundingClientRect();
        const toRect = toEl.getBoundingClientRect();
        const boardRect = boardEl.getBoundingClientRect();
        
        const deltaX = toRect.left - fromRect.left;
        const deltaY = toRect.top - fromRect.top;
        
        pieceEl.style.transform = `translate(${deltaX}px, ${deltaY}px)`;
        
        setTimeout(() => {
          if (callback) callback();
          isAnimating = false;
        }, 300);
      } else {
        if (callback) callback();
        isAnimating = false;
      }
    } else {
      if (callback) callback();
      isAnimating = false;
    }
  };

  const showPromotionModal = () => {
    if (promotionModal) {
      promotionModal.style.display = 'flex';
      const buttons = promotionModal.querySelectorAll('.promotion-btn');
      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          const pieceType = btn.dataset.piece;
          if (game.promotePawn(pieceType)) {
            status.textContent = `Pawn promoted to ${pieceType}!`;
            render();
          }
        });
      });
    }
  };

  const hideModals = () => {
    if (promotionModal) promotionModal.style.display = 'none';
    if (kingRespawnModal) kingRespawnModal.style.display = 'none';
  };

  const showKingRespawnModal = () => {
    if (kingRespawnModal) {
      kingRespawnModal.style.display = 'flex';
      const cancelBtn = document.getElementById('cancelRespawn');
      if (cancelBtn) {
        cancelBtn.addEventListener('click', () => {
          game.pendingKingRespawn = null;
          render();
        });
      }
    }
  };

  rollBtn.addEventListener('click', () => {
    if (game.forcedPiece) {
      status.textContent = 'You already rolled - make a move or forfeit';
      return;
    }
    const v = window.Dice.roll(game, diceFace);
    if (v !== null && v !== undefined) {
      status.textContent = `Rolling dice...`;
    } else {
      status.textContent = `Rolling dice...`;
    }
    setTimeout(() => {
      if (game.lastDice) {
        status.textContent = `Rolled ${game.lastDice}!`;
      }
      render();
    }, 1200);
  });

  forfeitBtn.addEventListener('click', () => {
    if (!game.forcedPiece) {
      status.textContent = 'No active dice roll to forfeit';
      return;
    }
    const currentPlayerId = game.getPlayer().id;
    // Record forfeit as a history entry
    game.moveHistory.push({
      from: null,
      to: null,
      piece: null,
      cap: null,
      promoted: false,
      playerId: currentPlayerId,
      forfeit: true
    });
    game.forcedPiece = null;
    game.lastDice = null;
    game.nextTurn();
    status.textContent = 'Turn forfeited';
    selectedSquare = null;
    legalMoves = [];
    render();
  });

  const downloadHistory = () => {
    const all = game.moveHistory;

    const playerLabel = (id) => {
      const labels = ['Red', 'Black', 'Green', 'Yellow'];
      return labels[id] || `P${(id ?? 0) + 1}`;
    };

    const turnNotation = (move) => {
      if (!move) return '—';
      if (move.forfeit) return 'Forfeit';
      if (!move.piece || !move.to) return '—';
      const letter = pieceLetter(move.piece);
      const captureMark = move.cap ? 'x' : '';
      return `${letter}${captureMark}${move.to}`;
    };

    const rounds = [];
    for (let i = 0; i < all.length; i += 4) {
      rounds.push(all.slice(i, i + 4));
    }

    const lines = rounds.map((roundMoves, roundIndex) => {
      const parts = roundMoves.map((move) => {
        const pid = move.playerId ?? 0;
        return `${playerLabel(pid)}: ${turnNotation(move)}`;
      });
      return `${roundIndex + 1}. ${parts.join(' | ')}`;
    });
    const content = lines.length ? lines.join('\n') : 'No moves yet';
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `chaturanga-history-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, '-')}.txt`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  if (downloadHistoryBtn) {
    downloadHistoryBtn.addEventListener('click', downloadHistory);
  }

    // Initial render
    render();
  } catch (error) {
    console.error('Error initializing game:', error);
    console.error('Stack:', error.stack);
    const statusEl = document.getElementById('status');
    if (statusEl) {
      statusEl.textContent = `Error: ${error.message}. Check console for details.`;
      statusEl.style.color = 'red';
    }
    
    // Try to render at least an empty board
    const boardEl = document.getElementById('board');
    if (boardEl) {
      boardEl.innerHTML = '<div style="padding: 20px; color: white;">Error loading game. Please refresh the page.</div>';
    }
  }
});
