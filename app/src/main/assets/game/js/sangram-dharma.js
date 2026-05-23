/**
 * sangram-dharma.js — Live Dharma Bar for Chaturanga
 * ====================================================
 * Drop-in for game.html. Add ONE script tag:
 *   <script src="js/sangram-dharma.js"></script>
 *
 * Renders an animated 4-segment dharma bar below the board.
 * Updates after every move via SangramDharma.update(moveHistory).
 * On significant events: flashes an annotation above the bar.
 * On Raja capture: full-width gold pulse climax animation.
 *
 * Exposes:
 *   SangramDharma.update(moveHistory)   — recalculate and redraw
 *   SangramDharma.onRajaCapture()       — trigger climax pulse manually
 *   SangramDharma.reset()               — clear to neutral state
 *   SangramDharma.mount(targetEl)       — inject bar after targetEl
 */

'use strict';

const SangramDharma = (() => {

  // ── SCORING RULES ──────────────────────────────────────────────────────────
  const DHARMA_EVENTS = {
    // Positive — dharmic play
    sacrifice:          +20,   // player sacrifices own piece (captured own piece)
    ally_raja_protect:  +15,   // ally Raja is in danger but player defends it
    clean_capture:      +5,    // captures an undefended piece
    full_ratha_win:     +25,   // wins a game with all Rathas still alive
    promotion:          +8,    // Nara reaches last rank

    // Negative — adharmic play
    raja_exposed:       -10,   // player's Raja is moved into exposed square
    ally_abandoned:     -15,   // player forfeits (passes) while ally is in danger
    forfeit:            -8,    // player forfeits turn unnecessarily
    consecutive_same:   -5,    // 3+ consecutive moves with the same piece (greedy)
  };

  // Base dharma for all players
  const BASE = 50;

  // Player display colours
  const PLAYER_COLORS = [
    '#ef4444',  // Red
    '#3b82f6',  // Blue
    '#22c55e',  // Green
    '#eab308',  // Yellow
  ];
  const PLAYER_NAMES = ['Red', 'Blue', 'Green', 'Yellow'];

  // ── PIECE VALUES ──────────────────────────────────────────────────────────
  const PIECE_VAL = { nara:1, ashwa:3, danti:3, ratha:5, raja:100, mantri:9 };
  function pv(name) { return PIECE_VAL[name?.toLowerCase()] ?? 0; }

  // ── STATE ──────────────────────────────────────────────────────────────────
  let _scores  = [BASE, BASE, BASE, BASE];
  let _mounted = false;
  let _lastEventText = '';

  // ── DHARMA ENGINE ──────────────────────────────────────────────────────────
  /**
   * Compute cumulative dharma scores from full moveHistory.
   * moveHistory: array of move objects from game engine.
   * Returns { scores: [R,B,G,Y], lastEvent: {player, delta, label} | null }
   */
  function compute(moveHistory) {
    if (!Array.isArray(moveHistory) || !moveHistory.length) {
      return { scores: [BASE,BASE,BASE,BASE], lastEvent: null };
    }

    const scores = [BASE, BASE, BASE, BASE];
    let lastEvent = null;

    // Track consecutive-move-with-same-piece counter per player
    const lastPiece = [null, null, null, null];
    const consecCount = [0, 0, 0, 0];

    for (let i = 0; i < moveHistory.length; i++) {
      const m = moveHistory[i];
      if (!m) continue;

      const p = m.player ?? m.playerIndex ?? m.playerIdx ?? 0;
      if (p < 0 || p > 3) continue;

      const pieceType  = (m.piece ?? m.pieceType ?? '').toLowerCase();
      const captured   = (m.captured ?? m.capturedPiece ?? '').toLowerCase();
      const isForfeit  = m.forfeit ?? m.pass ?? false;
      const promotion  = m.promotion ?? false;

      // ── Forfeit / pass ────────────────────────────────────────────────
      if (isForfeit) {
        scores[p] += DHARMA_EVENTS.forfeit;
        lastEvent = { player: p, delta: DHARMA_EVENTS.forfeit, label: 'Forfeit — Dharma wanes' };
        continue;
      }

      // ── Consecutive same-piece ────────────────────────────────────────
      const pieceId = `${p}-${m.from}`;
      if (lastPiece[p] === pieceId) {
        consecCount[p]++;
        if (consecCount[p] >= 2) {
          scores[p] += DHARMA_EVENTS.consecutive_same;
          lastEvent = { player: p, delta: DHARMA_EVENTS.consecutive_same, label: 'Same piece again — the warrior grows predictable' };
        }
      } else {
        consecCount[p] = 0;
        lastPiece[p] = pieceId;
      }

      // ── Capture events ────────────────────────────────────────────────
      if (captured) {
        const val = pv(captured);

        // Raja capture — climax
        if (captured === 'raja') {
          scores[p] += 30;
          lastEvent = { player: p, delta: 30, label: `${PLAYER_NAMES[p]}'s Raja falls — Dharma's wheel turns`, isRaja: true };
        } else if (val > 0) {
          scores[p] += DHARMA_EVENTS.clean_capture;
          lastEvent = { player: p, delta: DHARMA_EVENTS.clean_capture, label: `Clean capture — ${PLAYER_NAMES[p]} moves with purpose` };
        }
      }

      // ── Sacrifice (moved own piece into capture — detectable by next move) ──
      // Approximated: if piece captured has same player as capturer → own piece captured
      // (alliance sacrifice mechanics)
      const capturedOwner = m.capturedOwner ?? m.capturedPlayer ?? -1;
      if (capturedOwner === p) {
        scores[p] += DHARMA_EVENTS.sacrifice;
        lastEvent = { player: p, delta: DHARMA_EVENTS.sacrifice, label: `Ratha sacrificed — Dharma rises` };
      }

      // ── Promotion ────────────────────────────────────────────────────
      if (promotion) {
        scores[p] += DHARMA_EVENTS.promotion;
        lastEvent = { player: p, delta: DHARMA_EVENTS.promotion, label: `Nara ascends — Dharma honours the humble` };
      }

      // ── Raja exposed check ────────────────────────────────────────────
      if (pieceType === 'raja' && m.intoCheck) {
        scores[p] += DHARMA_EVENTS.raja_exposed;
        lastEvent = { player: p, delta: DHARMA_EVENTS.raja_exposed, label: `${PLAYER_NAMES[p]}'s Raja steps into danger — Dharma falters` };
      }
    }

    // Clamp all scores to [0, 100]
    for (let i = 0; i < 4; i++) scores[i] = Math.max(0, Math.min(100, scores[i]));

    return { scores, lastEvent };
  }

  // ── INJECT STYLES ──────────────────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('sangram-dharma-styles')) return;
    const s = document.createElement('style');
    s.id = 'sangram-dharma-styles';
    s.textContent = `
/* ── OUTER WRAPPER ─────────────────────────────────────────── */
#sangram-dharma-wrap {
  position: relative;
  width: 100%;
  margin: 6px 0 0 0;
  user-select: none;
}

/* ── ANNOTATION (flashes above bar) ────────────────────────── */
#sangram-annotation {
  position: absolute;
  bottom: calc(100% + 6px);
  left: 50%;
  transform: translateX(-50%);
  white-space: nowrap;
  font-family: 'Cormorant Garamond', serif;
  font-style: italic;
  font-size: .78rem;
  color: rgba(201,168,76,.85);
  pointer-events: none;
  opacity: 0;
  transition: opacity .3s ease;
  z-index: 5;
  text-shadow: 0 0 12px rgba(201,168,76,.4);
}
#sangram-annotation.visible {
  opacity: 1;
}

/* ── LABELS ROW ─────────────────────────────────────────────── */
#sangram-labels {
  display: flex;
  justify-content: space-between;
  margin-bottom: 3px;
}
.sangram-player-label {
  font-size: .58rem;
  font-family: 'Outfit', sans-serif;
  letter-spacing: .04em;
  opacity: .65;
  display: flex;
  align-items: center;
  gap: 3px;
}
.sangram-label-dot {
  width: 5px; height: 5px;
  border-radius: 50%;
}
.sangram-score-num {
  font-family: 'Cinzel', serif;
  font-size: .58rem;
  opacity: .8;
}

/* ── BAR TRACK ──────────────────────────────────────────────── */
#sangram-bar-track {
  position: relative;
  width: 100%;
  height: 6px;
  background: rgba(255,255,255,0.04);
  border-radius: 3px;
  overflow: hidden;
  display: flex;
}

/* ── SEGMENTS ───────────────────────────────────────────────── */
.sangram-segment {
  height: 100%;
  transition: width .4s cubic-bezier(.4,0,.2,1);
  position: relative;
}
.sangram-segment::after {
  content: '';
  position: absolute;
  right: 0; top: 0; bottom: 0;
  width: 1px;
  background: rgba(8,6,3,.5);
}
.sangram-segment:last-child::after { display: none; }

/* ── DHARMA COMPASS (small text below bar) ─────────────────── */
#sangram-compass {
  display: flex;
  justify-content: space-between;
  margin-top: 3px;
}
.sangram-compass-end {
  font-size: .55rem;
  color: rgba(201,168,76,.3);
  font-family: 'Outfit', sans-serif;
  letter-spacing: .06em;
}

/* ── RAJA PULSE ─────────────────────────────────────────────── */
@keyframes sangram-raja-pulse {
  0%   { box-shadow: 0 0 0 0 rgba(201,168,76,0); background: rgba(201,168,76,.05); }
  30%  { box-shadow: 0 0 20px 4px rgba(201,168,76,.5); background: rgba(201,168,76,.15); }
  60%  { box-shadow: 0 0 10px 2px rgba(201,168,76,.3); }
  100% { box-shadow: 0 0 0 0 rgba(201,168,76,0); background: rgba(201,168,76,.05); }
}
#sangram-bar-track.raja-pulse {
  animation: sangram-raja-pulse 1.2s ease forwards;
}

/* ── EVENT FLASH (delta annotation colour) ──────────────────── */
#sangram-annotation.dharma-up   { color: #4ade80; }
#sangram-annotation.dharma-down { color: #f87171; }
#sangram-annotation.dharma-raja { color: #f5e4a0; font-size: .86rem; font-weight: 600; }
    `;
    document.head.appendChild(s);
  }

  // ── BUILD DOM ──────────────────────────────────────────────────────────────
  function buildDOM() {
    const wrap = document.createElement('div');
    wrap.id = 'sangram-dharma-wrap';
    wrap.innerHTML = `
      <div id="sangram-annotation"></div>
      <div id="sangram-labels">
        ${PLAYER_NAMES.map((name, i) => `
          <div class="sangram-player-label" style="color:${PLAYER_COLORS[i]}">
            <div class="sangram-label-dot" style="background:${PLAYER_COLORS[i]}"></div>
            <span>${name}</span>
            <span class="sangram-score-num" id="sd-score-${i}">${BASE}</span>
          </div>
        `).join('')}
      </div>
      <div id="sangram-bar-track">
        ${PLAYER_NAMES.map((_, i) => `
          <div class="sangram-segment"
               id="sd-seg-${i}"
               style="width:25%;background:${PLAYER_COLORS[i]};opacity:.7"></div>
        `).join('')}
      </div>
      <div id="sangram-compass">
        <span class="sangram-compass-end">Adharma</span>
        <span class="sangram-compass-end" style="color:rgba(201,168,76,.5);font-size:.6rem">⬩ Dharma Scale ⬩</span>
        <span class="sangram-compass-end">Dharma</span>
      </div>
    `;
    return wrap;
  }

  // ── MOUNT ──────────────────────────────────────────────────────────────────
  function mount(anchorEl) {
    if (document.getElementById('sangram-dharma-wrap')) return; // already mounted

    injectStyles();
    const wrap = buildDOM();

    if (anchorEl) {
      anchorEl.insertAdjacentElement('afterend', wrap);
    } else {
      // Auto-find the board wrapper
      const board = document.querySelector(
        '#board,#gameBoard,.board,.game-board,[id*="board"]:not([id*="leader"]):not([id*="theme"])'
      );
      if (board) {
        const pos = getComputedStyle(board.parentNode ?? board).position;
        (board.parentNode ?? board).insertAdjacentElement
          ? board.parentNode.insertBefore(wrap, board.nextSibling)
          : document.body.appendChild(wrap);
      } else {
        document.body.appendChild(wrap);
      }
    }

    _mounted = true;
  }

  // ── RENDER ─────────────────────────────────────────────────────────────────
  function render(scores, lastEvent) {
    if (!_mounted) mount();

    const total = scores.reduce((s, v) => s + v, 0) || 1;

    scores.forEach((score, i) => {
      const pct = Math.round((score / total) * 100);
      const seg = document.getElementById(`sd-seg-${i}`);
      if (seg) seg.style.width = `${pct}%`;

      const scoreEl = document.getElementById(`sd-score-${i}`);
      if (scoreEl) scoreEl.textContent = Math.round(score);
    });

    _scores = scores;

    if (lastEvent) showAnnotation(lastEvent);
  }

  // ── ANNOTATION ─────────────────────────────────────────────────────────────
  let _annotationTimer = null;

  function showAnnotation(event) {
    if (Math.abs(event.delta) < 8 && !event.isRaja) return; // too small to show

    const el = document.getElementById('sangram-annotation');
    if (!el) return;

    if (_annotationTimer) clearTimeout(_annotationTimer);

    el.textContent = event.label;
    el.className = '';
    if (event.isRaja) {
      el.classList.add('dharma-raja');
      pulseBar();
    } else if (event.delta > 0) {
      el.classList.add('dharma-up');
    } else {
      el.classList.add('dharma-down');
    }
    el.classList.add('visible');

    _annotationTimer = setTimeout(() => {
      el.classList.remove('visible');
    }, 2200);
  }

  function pulseBar() {
    const track = document.getElementById('sangram-bar-track');
    if (!track) return;
    track.classList.remove('raja-pulse');
    void track.offsetWidth; // reflow to restart animation
    track.classList.add('raja-pulse');
    setTimeout(() => track.classList.remove('raja-pulse'), 1300);
  }

  // ── PUBLIC API ─────────────────────────────────────────────────────────────

  /** Call after every move with the full moveHistory array. */
  function update(moveHistory) {
    if (!_mounted) mount();
    const { scores, lastEvent } = compute(moveHistory);
    render(scores, lastEvent);
  }

  /** Manually trigger the Raja capture climax. */
  function onRajaCapture(playerIdx) {
    const label = `${PLAYER_NAMES[playerIdx] ?? 'A player'}'s Raja falls — the field is decided`;
    showAnnotation({ delta: 30, label, isRaja: true, player: playerIdx });
  }

  /** Reset to neutral state. */
  function reset() {
    _scores = [BASE, BASE, BASE, BASE];
    render(_scores, null);
  }

  /**
   * Get current snapshot for post-game dharma screen.
   * Returns { scores:[R,B,G,Y], winner: playerIdx }
   */
  function getSnapshot() {
    const max = Math.max(..._scores);
    return { scores: [..._scores], winner: _scores.indexOf(max) };
  }

  // ── AUTO-MOUNT on DOM ready ─────────────────────────────────────────────
  function autoMount() {
    mount();

    // Hook into existing game event bus if present
    if (window.ChaturangaEvents) {
      window.ChaturangaEvents.on('move', ({ moveHistory }) => update(moveHistory));
      window.ChaturangaEvents.on('rajaCapture', ({ player }) => onRajaCapture(player));
      window.ChaturangaEvents.on('gameStart', () => reset());
    }

    // Also watch for a global moveHistory variable update
    // (polling fallback for games that don't use an event bus)
    let _lastLength = 0;
    setInterval(() => {
      const history = window.game?.moveHistory ?? window.moveHistory ?? null;
      if (history && history.length !== _lastLength) {
        _lastLength = history.length;
        update(history);
      }
    }, 500);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoMount);
  } else {
    autoMount();
  }

  return { update, onRajaCapture, reset, mount, getSnapshot };

})();

/* ─────────────────────────────────────────────────────────────────────────────
 * INTEGRATION GUIDE
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. Add to game.html:
 *      <script src="js/sangram-dharma.js"></script>
 *
 * 2. After every move resolves in your game engine:
 *      SangramDharma.update(game.moveHistory);
 *
 * 3. On Raja capture:
 *      SangramDharma.onRajaCapture(playerIndex);
 *
 * 4. On game start / reset:
 *      SangramDharma.reset();
 *
 * 5. For post-game dharma summary:
 *      const { scores, winner } = SangramDharma.getSnapshot();
 *
 * The bar auto-detects placement next to the board element.
 * Or specify anchor: SangramDharma.mount(document.getElementById('score-bar'));
 * ───────────────────────────────────────────────────────────────────────────── */
