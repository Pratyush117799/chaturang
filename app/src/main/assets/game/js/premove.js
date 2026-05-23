/**
 * premove.js — Chaturanga v1.0.5.2
 * Pre-move system: queue a move during opponent's turn.
 * If legal when your turn starts → executes instantly.
 * If illegal → flashes red, cancels silently.
 *
 * Drop-in: <script src="js/premove.js"></script> after ui.js in game.html
 *
 * Integration (one line each):
 *   PreMove.onTurnStart(currentPlayerIndex)  — in your turn-start handler
 *   PreMove.clear()                          — in game-over handler
 *
 * Expects: window.game (ChaturangaGame instance)
 *          window.executeMove(from, to)      — existing ui.js move runner
 *          Board squares: .sq[data-sq="e4"] or [data-square="e4"]
 */

const PreMove = (() => {

  let _enabled = false;
  let _fromSq  = null;
  let _toSq    = null;
  let _myIdx   = null;   // local player index
  let _pendingFrom = null; // first-click selection

  // ── CSS ───────────────────────────────────────────────────────────────────
  function injectCSS() {
    if (document.getElementById('pm-css')) return;
    const s = document.createElement('style');
    s.id = 'pm-css';
    s.textContent = `
      .sq.pm-from { outline:2px solid #4da6ff!important;outline-offset:-2px;background:rgba(77,166,255,.18)!important }
      .sq.pm-to   { outline:2px solid #4da6ff!important;outline-offset:-2px;background:rgba(77,166,255,.32)!important }
      .sq.pm-bad  { background:rgba(232,64,64,.35)!important;transition:background .4s }
      #pmBanner {
        position:fixed;top:66px;left:50%;transform:translateX(-50%) translateY(-60px);
        background:#0a1a2a;border:1px solid #4da6ff;color:#4da6ff;
        padding:7px 18px;border-radius:20px;font-family:Outfit,sans-serif;font-size:12px;
        z-index:8500;opacity:0;transition:all .3s cubic-bezier(.34,1.56,.64,1);pointer-events:none
      }
      #pmBanner.show { opacity:1;transform:translateX(-50%) translateY(0) }
    `;
    document.head.appendChild(s);
  }

  // ── Banner ────────────────────────────────────────────────────────────────
  let _banner = null;
  function showBanner(txt) {
    if (!_banner) {
      _banner = document.createElement('div');
      _banner.id = 'pmBanner';
      document.body.appendChild(_banner);
    }
    _banner.textContent = txt;
    requestAnimationFrame(() => _banner.classList.add('show'));
  }
  function hideBanner() { _banner?.classList.remove('show'); }

  // ── Square lookup ─────────────────────────────────────────────────────────
  const sqEl = k =>
    document.querySelector(`.sq[data-sq="${k}"]`) ||
    document.querySelector(`[data-square="${k}"]`) ||
    document.querySelector(`#sq-${k}`);

  // ── Highlight helpers ─────────────────────────────────────────────────────
  function clearHighlights() {
    document.querySelectorAll('.sq.pm-from,.sq.pm-to,.sq.pm-bad').forEach(e => {
      e.classList.remove('pm-from','pm-to','pm-bad');
    });
  }

  function flashBad() {
    [_fromSq, _toSq].forEach(k => {
      if (!k) return;
      const el = sqEl(k);
      if (el) { el.classList.add('pm-bad'); setTimeout(() => el.classList.remove('pm-bad'), 480); }
    });
  }

  // ── Set / clear pre-move ──────────────────────────────────────────────────
  function setPreMove(from, to) {
    clearHighlights();
    _fromSq = from; _toSq = to;
    const fe = sqEl(from), te = sqEl(to);
    if (fe) fe.classList.add('pm-from');
    if (te) te.classList.add('pm-to');
    showBanner(`⚡ Pre-move: ${from}→${to} · Right-click or Esc to cancel`);
  }

  function clear() {
    clearHighlights();
    _fromSq = null; _toSq = null; _pendingFrom = null;
    hideBanner();
  }

  // ── Board click interceptor ───────────────────────────────────────────────
  function onBoardPointer(e) {
    if (!_enabled) return;
    const game = window.game || window.ChaturangaGame?.current;
    if (!game) return;

    const cur = game.currentPlayerIndex ?? game.currentPlayer ?? -1;
    if (cur === _myIdx) { _pendingFrom = null; return; } // my turn — let ui.js handle

    const sq = e.target.closest('[data-sq],[data-square]');
    if (!sq) { clear(); return; }
    const key = sq.dataset.sq || sq.dataset.square;
    if (!key) { clear(); return; }

    e.stopPropagation();
    e.preventDefault();

    if (!_pendingFrom) {
      // First click: must be own piece
      const piece = game.board?.get(key) ||
                    (typeof game.getPieceAt === 'function' ? game.getPieceAt(key) : null);
      if (!piece) { clear(); return; }
      const pidx = piece.playerIndex ?? piece.player ?? -1;
      if (pidx !== _myIdx) { clear(); return; }
      _pendingFrom = key;
      clearHighlights();
      sqEl(key)?.classList.add('pm-from');
      showBanner('⚡ Pre-move: select destination…');
    } else {
      if (key === _pendingFrom) { clear(); return; } // deselect
      setPreMove(_pendingFrom, key);
      _pendingFrom = null;
    }
  }

  // ── Execute on turn start ─────────────────────────────────────────────────
  function onTurnStart(playerIdx) {
    _myIdx = playerIdx;
    if (!_fromSq || !_toSq) return;

    const game = window.game || window.ChaturangaGame?.current;
    let legal = false;

    try {
      const moves = game?.getLegalMoves?.(_fromSq) ||
                    game?.getMovesFor?.(_fromSq) || [];
      legal = moves.some(m => {
        const dest = typeof m === 'string' ? m : (m.to || m.toSquare || m.dest);
        return dest === _toSq;
      });
    } catch { legal = false; }

    const from = _fromSq, to = _toSq;
    clear();

    if (legal) {
      setTimeout(() => {
        try {
          if      (typeof window.executeMove === 'function') window.executeMove(from, to);
          else if (typeof window.doMove      === 'function') window.doMove(from, to);
          else if (typeof window.handleMove  === 'function') window.handleMove(from, to);
        } catch(err) { console.warn('[PreMove] exec error:', err); }
      }, 40);
    } else {
      _fromSq = from; _toSq = to;
      flashBad();
      setTimeout(clear, 480);
    }
  }

  // ── Enable ────────────────────────────────────────────────────────────────
  function enable() {
    if (_enabled) return;
    injectCSS();
    _enabled = true;

    const board = document.getElementById('board') ||
                  document.querySelector('.board-container') ||
                  document.querySelector('#chaturangaBoard');
    if (board) {
      // Capture phase — fires before ui.js handlers
      board.addEventListener('pointerdown', onBoardPointer, true);
      board.addEventListener('click', onBoardPointer, true);
    }

    document.addEventListener('contextmenu', () => clear());
    document.addEventListener('keydown', e => { if (e.key === 'Escape') clear(); });
  }

  // ── Auto-wire ─────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    enable();

    // Wrap existing turn-change callback
    const prev = window.onTurnChange;
    window.onTurnChange = function(idx) {
      onTurnStart(idx);
      if (typeof prev === 'function') prev(idx);
    };

    // Detect local player index from URL ?player=0 or ?side=2
    const p = new URLSearchParams(location.search);
    const idx = parseInt(p.get('player') ?? p.get('side'));
    if (!isNaN(idx)) _myIdx = idx;
  });

  window.PreMove = { enable, clear, onTurnStart };
  return { enable, clear, onTurnStart };

})();


/* ── INTEGRATION ──────────────────────────────────────────────────────────────

  1. In ui.js — find start-of-turn logic, add:
       PreMove.onTurnStart(game.currentPlayerIndex);

  2. In game-over / forfeit handler, add:
       PreMove.clear();

  3. For online (ws-client.js), on receiving a turn-change WS message:
       PreMove.onTurnStart(myLocalPlayerIndex);

  No other changes needed. The click interceptor runs in capture phase
  and only activates during opponent turns.

──────────────────────────────────────────────────────────────────────────── */
