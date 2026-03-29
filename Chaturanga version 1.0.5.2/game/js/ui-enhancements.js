/**
 * Chaturanga v1.0.4 — UI Enhancements
 * Piece tooltips, move/capture/dice animations, king danger glow, keyboard nav, accessibility
 */
(function() {
  'use strict';

  const PIECE_META = {
    king:     { name: 'Raja — King',     value: '∞ (Royal)', move: '1 step any direction', ascii: '·↑·\n←◉→\n·↓·' },
    rook:     { name: 'Ratha — Rook',    value: '5 pts',     move: 'Slides orthogonally any distance', ascii: '·↑·\n←◉→\n·↓·' },
    horse:    { name: 'Ashwa — Horse',   value: '3 pts',     move: 'L-shape jump (±1,±2 or ±2,±1)', ascii: '♞·♞\n·◉·\n♞·♞' },
    elephant: { name: 'Danti — Elephant',value: '3 pts',     move: 'Exactly 2 diagonal squares, leaps over pieces', ascii: '✕·✕\n·◉·\n✕·✕' },
    pawn:     { name: 'Nara — Pawn',     value: '1 pt',      move: '1 step forward; captures diagonally forward', ascii: '·↑·\n·◉·\n···' }
  };

  let tooltipEl = null;
  let tooltipTimer = null;

  // ── Tooltip ──────────────────────────────────────────────────────────────
  function setupTooltip() {
    tooltipEl = document.getElementById('pieceTooltip');
    if (!tooltipEl) {
      tooltipEl = document.createElement('div');
      tooltipEl.id = 'pieceTooltip';
      tooltipEl.className = 'piece-tooltip';
      tooltipEl.style.display = 'none';
      document.body.appendChild(tooltipEl);
    }

    document.addEventListener('mouseover', onPieceHover);
    document.addEventListener('mouseout',  onPieceLeave);
  }

  function onPieceHover(e) {
    const img = e.target.closest('.piece');
    if (!img) return;
    const type = img.dataset.pieceType;
    if (!type || !PIECE_META[type]) return;
    const meta = PIECE_META[type];
    tooltipEl.innerHTML =
      '<div class="tt-name">' + meta.name + '</div>' +
      '<div class="tt-value">Value: ' + meta.value + '</div>' +
      '<div class="tt-move">' + meta.move + '</div>' +
      '<pre class="tt-ascii">' + meta.ascii + '</pre>';

    const rect = img.getBoundingClientRect();
    tooltipEl.style.display = 'block';
    tooltipEl.style.left = Math.min(rect.left + window.scrollX, window.innerWidth - 200) + 'px';
    tooltipEl.style.top  = (rect.bottom + window.scrollY + 6) + 'px';
  }

  function onPieceLeave(e) {
    if (!e.target.closest('.piece')) return;
    clearTimeout(tooltipTimer);
    tooltipTimer = setTimeout(() => {
      if (tooltipEl) tooltipEl.style.display = 'none';
    }, 150);
  }

  // ── King Danger Glow ──────────────────────────────────────────────────────
  function updateKingDangerGlows(game) {
    // Remove all existing danger classes
    document.querySelectorAll('.sq-danger').forEach(el => el.classList.remove('sq-danger'));

    if (!game || game.gameOver) return;
    const player = game.getPlayer();
    if (!player) return;

    // Build threat map for opponents
    const savedF = game.forcedPiece, savedT = game.turnIndex;
    game.forcedPiece = 'any';

    const threats = new Set();
    game.players.forEach(p => {
      if (p.id !== player.id && !p.eliminated) {
        game.turnIndex = p.id;
        for (let r = 1; r <= 8; r++) {
          for (let f = 0; f < 8; f++) {
            const sq = String.fromCharCode(97 + f) + r;
            const piece = game.board.get(sq);
            if (piece && piece.owner === p.id) {
              try { game.getLegalMoves(sq).forEach(to => threats.add(to)); } catch(e) {}
            }
          }
        }
      }
    });

    game.forcedPiece = savedF;
    game.turnIndex   = savedT;

    // Find ally kings and check if they're on threatened squares
    const myTeam = player.team;
    game.players.forEach(p => {
      const isAlly = game.gameMode === 'team' ? p.team === myTeam : p.id === player.id;
      if (!isAlly || p.eliminated) return;
      for (let r = 1; r <= 8; r++) {
        for (let f = 0; f < 8; f++) {
          const sq = String.fromCharCode(97 + f) + r;
          const piece = game.board.get(sq);
          if (piece && piece.type === 'king' && piece.owner === p.id && threats.has(sq)) {
            const el = document.querySelector('[data-square="' + sq + '"]');
            if (el) el.classList.add('sq-danger');
          }
        }
      }
    });
  }

  // ── Dice Roll Animation ────────────────────────────────────────────────────
  function animateDiceRoll(diceFaceEl) {
    if (!diceFaceEl) return;
    diceFaceEl.classList.add('dice-spinning');
    setTimeout(() => diceFaceEl.classList.remove('dice-spinning'), 400);
  }

  // ── Accessibility — ARIA labels ────────────────────────────────────────────
  function updateAriaLabels(game) {
    const PIECE_NAMES = { king: 'Raja', rook: 'Ratha', horse: 'Ashwa', elephant: 'Danti', pawn: 'Nara' };
    const PLAYER_LABELS = ['Red', 'Blue', 'Green', 'Yellow'];

    document.querySelectorAll('[data-square]').forEach(cell => {
      const sq    = cell.dataset.square;
      const piece = game.board ? game.board.get(sq) : null;
      cell.setAttribute('role', 'gridcell');
      cell.setAttribute('aria-label', sq + (piece ? ', ' + PLAYER_LABELS[piece.owner] + ' ' + (PIECE_NAMES[piece.type] || piece.type) : ', empty'));
      if (cell.classList.contains('selected')) cell.setAttribute('aria-selected', 'true');
      else cell.removeAttribute('aria-selected');
    });

    // Turn indicator live region
    const ti = document.getElementById('turnIndicator');
    if (ti && !ti.getAttribute('aria-live')) ti.setAttribute('aria-live', 'polite');

    const gs = document.getElementById('gameState');
    if (gs && !gs.getAttribute('aria-live')) gs.setAttribute('aria-live', 'assertive');
  }

  // ── Keyboard Navigation ────────────────────────────────────────────────────
  let focusedSquare = 'e4'; // start focus in centre

  function setupKeyboardNav() {
    document.addEventListener('keydown', onKeyNav);
  }

  function onKeyNav(e) {
    const boardEl = document.getElementById('board');
    if (!boardEl) return;
    if (!boardEl.contains(document.activeElement) && !['ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.key)) return;

    const sq = focusedSquare;
    if (!sq) return;
    const f = sq.charCodeAt(0) - 97;
    const r = Number.parseInt(sq[1], 10) - 1;

    let nf = f, nr = r;
    if (e.key === 'ArrowUp')    { nr++; e.preventDefault(); }
    if (e.key === 'ArrowDown')  { nr--; e.preventDefault(); }
    if (e.key === 'ArrowLeft')  { nf--; e.preventDefault(); }
    if (e.key === 'ArrowRight') { nf++; e.preventDefault(); }

    if (nf < 0 || nf > 7 || nr < 0 || nr > 7) return;
    focusedSquare = String.fromCharCode(97 + nf) + (nr + 1);
    const cell = document.querySelector('[data-square="' + focusedSquare + '"]');
    if (cell) { cell.setAttribute('tabindex', '0'); cell.focus(); }

    if (e.key === 'Escape') {
      // deselect — handled by UI
      document.dispatchEvent(new CustomEvent('chaturanga:deselect'));
    }

    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      cell && cell.click();
    }
  }

  // ── Init ─────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', function() {
    setupTooltip();
    setupKeyboardNav();
    // Make board cells focusable via Tab
    const boardEl = document.getElementById('board');
    if (boardEl) {
      const obs = new MutationObserver(() => {
        boardEl.querySelectorAll('[data-square]').forEach((cell, i) => {
          if (!cell.getAttribute('tabindex')) cell.setAttribute('tabindex', '0');
        });
      });
      obs.observe(boardEl, { childList: true });
    }
  });

  // ── Public ────────────────────────────────────────────────────────────────
  globalThis.ChaturangaUIEnhancements = {
    animateDiceRoll,
    updateKingDangerGlows,
    updateAriaLabels
  };
})();
