// clock-ui.js — Chaturanga v1.0.5.2
// DOM layer for the game clock and ELO toast notification.
// Depends on: game-clock.js (ChaturangaClock), elo-engine.js (ChaturangaELO)

(function (global) {
  'use strict';

  // ─── Player display names and colour map ──────────────────────────────────

  const PLAYER_LABELS  = ['Red', 'Blue', 'Green', 'Yellow'];
  const PLAYER_COLOURS = ['#c94040', '#4070c9', '#40a060', '#c9a030'];

  // ─── Clock UI ─────────────────────────────────────────────────────────────

  /**
   * Initialise the clock strip and inject it into the game page.
   *
   * @param {string} anchorId    — ID of the element to insert the strip before
   *                               (e.g. 'board-container'). Fallback: prepend to body.
   * @param {string} modeKey     — 'chirantan' | 'tez' | 'atichitr'
   * @param {number} playerCount — 2 or 4
   * @returns {ClockUI}          — controller object
   */
  function initClockUI(anchorId, modeKey, playerCount) {
    const n    = playerCount || 4;
    const mode = ChaturangaClock.MODES[modeKey] || ChaturangaClock.MODES.chirantan;

    // ── Build the strip ──
    const strip = document.createElement('div');
    strip.id        = 'cha-clock-strip';
    strip.className = 'cha-clock-strip';
    if (mode.initial === null) strip.classList.add('cha-clock-hidden');

    const cells = [];
    for (let i = 0; i < n; i++) {
      const cell = document.createElement('div');
      cell.className  = 'cha-clock-cell';
      cell.dataset.pi = i;

      const label   = document.createElement('span');
      label.className   = 'cha-clock-label';
      label.textContent = PLAYER_LABELS[i] || `P${i + 1}`;
      label.style.color = PLAYER_COLOURS[i] || '#ccc';

      const time = document.createElement('span');
      time.className   = 'cha-clock-time';
      time.textContent = ChaturangaClock.formatTime(mode.initial);

      cell.appendChild(label);
      cell.appendChild(time);
      strip.appendChild(cell);
      cells.push({ cell, time });
    }

    // ── Inject into DOM ──
    const anchor = document.getElementById(anchorId);
    if (anchor && anchor.parentNode) {
      anchor.parentNode.insertBefore(strip, anchor);
    } else {
      document.body.prepend(strip);
    }

    // ── Inject styles (once) ──
    if (!document.getElementById('cha-clock-css')) {
      const style = document.createElement('style');
      style.id = 'cha-clock-css';
      style.textContent = `
        .cha-clock-strip {
          display: flex;
          justify-content: center;
          gap: 0;
          background: var(--bg-secondary, #111);
          border-bottom: 1px solid rgba(201,168,76,0.18);
          overflow: hidden;
          transition: max-height 0.3s ease, opacity 0.3s ease;
          max-height: 56px;
        }
        .cha-clock-strip.cha-clock-hidden {
          max-height: 0;
          opacity: 0;
          pointer-events: none;
        }
        .cha-clock-cell {
          flex: 1;
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          padding: 6px 8px;
          border-right: 1px solid rgba(255,255,255,0.05);
          transition: background 0.2s;
          min-width: 0;
        }
        .cha-clock-cell:last-child { border-right: none; }
        .cha-clock-cell.cha-clock-active {
          background: rgba(201,168,76,0.10);
        }
        .cha-clock-cell.cha-clock-expired {
          background: rgba(180,60,60,0.12);
          opacity: 0.55;
        }
        .cha-clock-label {
          font-size: 10px;
          letter-spacing: 0.08em;
          text-transform: uppercase;
          opacity: 0.75;
          font-weight: 500;
        }
        .cha-clock-time {
          font-size: 18px;
          font-variant-numeric: tabular-nums;
          font-weight: 600;
          letter-spacing: 0.04em;
          color: var(--text-primary, #e8dfc8);
          transition: color 0.3s;
        }
        .cha-clock-cell.cha-clock-active .cha-clock-time {
          color: #c9a84c;
        }
        .cha-clock-cell.cha-clock-low .cha-clock-time {
          color: #c94040;
          animation: cha-pulse 0.8s ease-in-out infinite;
        }
        .cha-clock-cell.cha-clock-expired .cha-clock-time {
          color: #7a3030;
          animation: none;
        }
        @keyframes cha-pulse {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.55; }
        }

        /* ELO toast */
        #cha-elo-toast {
          position: fixed;
          bottom: 80px;
          left: 50%;
          transform: translateX(-50%) translateY(20px);
          background: #161310;
          border: 1px solid rgba(201,168,76,0.35);
          border-radius: 12px;
          padding: 14px 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 4px;
          opacity: 0;
          pointer-events: none;
          transition: opacity 0.3s ease, transform 0.3s ease;
          z-index: 9999;
          min-width: 220px;
          text-align: center;
          box-shadow: 0 8px 32px rgba(0,0,0,0.6);
        }
        #cha-elo-toast.cha-toast-show {
          opacity: 1;
          transform: translateX(-50%) translateY(0);
        }
        .cha-toast-delta {
          font-size: 28px;
          font-weight: 700;
          font-variant-numeric: tabular-nums;
          letter-spacing: -0.02em;
        }
        .cha-toast-delta.pos { color: #7abf6e; }
        .cha-toast-delta.neg { color: #c47a5a; }
        .cha-toast-elo {
          font-size: 13px;
          color: #c9a84c;
          letter-spacing: 0.06em;
        }
        .cha-toast-rank {
          font-size: 11px;
          color: #9a8e78;
          letter-spacing: 0.08em;
          text-transform: uppercase;
        }
        .cha-toast-rank-up {
          font-size: 12px;
          color: #e8c876;
          letter-spacing: 0.06em;
          margin-top: 4px;
          padding: 3px 10px;
          border: 1px solid rgba(232,200,118,0.3);
          border-radius: 20px;
        }
      `;
      document.head.appendChild(style);
    }

    // ── Clock update handler ──
    function update(snapshot) {
      if (!snapshot) return;
      for (const p of snapshot) {
        const cell = cells[p.player];
        if (!cell) continue;
        cell.cell.classList.toggle('cha-clock-active', p.active);
        cell.cell.classList.toggle('cha-clock-expired', p.expired);

        const ms   = p.ms;
        const low  = ms !== null && ms < 15000 && p.active;
        cell.cell.classList.toggle('cha-clock-low', low);
        cell.time.textContent = ChaturangaClock.formatTime(ms);
      }
    }

    // ── Flagfall visual ──
    function showFlagfall(playerIndex) {
      const cell = cells[playerIndex];
      if (!cell) return;
      cell.cell.classList.add('cha-clock-expired');
      cell.cell.classList.remove('cha-clock-active', 'cha-clock-low');
      cell.time.textContent = '0:00';

      // Brief shake animation
      cell.cell.style.animation = 'cha-shake 0.4s ease';
      setTimeout(() => { cell.cell.style.animation = ''; }, 450);
    }

    // ── Show/hide the whole strip ──
    function setVisible(visible) {
      strip.classList.toggle('cha-clock-hidden', !visible);
    }

    return { update, showFlagfall, setVisible, strip };
  }

  // ─── ELO Toast ────────────────────────────────────────────────────────────

  /**
   * Show the post-game ELO update toast.
   *
   * @param {{ delta, newELO, rankChanged, newRank }} result — from ChaturangaELO.recordGame()
   * @param {number} durationMs — how long to show before auto-dismiss
   */
  function showELOToast(result, durationMs) {
    let toast = document.getElementById('cha-elo-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'cha-elo-toast';
      document.body.appendChild(toast);
    }

    const dur   = durationMs || 3800;
    const sign  = result.delta >= 0 ? '+' : '';
    const rank  = ChaturangaELO ? ChaturangaELO.getRankTitle(result.newELO) : null;

    toast.innerHTML = `
      <div class="cha-toast-delta ${result.delta >= 0 ? 'pos' : 'neg'}">${sign}${result.delta}</div>
      <div class="cha-toast-elo">${result.newELO} ELO</div>
      ${rank ? `<div class="cha-toast-rank">${rank.title}</div>` : ''}
      ${result.rankChanged ? `<div class="cha-toast-rank-up">Rank achieved: ${result.newRank}</div>` : ''}
    `;

    // Animate in
    requestAnimationFrame(() => {
      requestAnimationFrame(() => { toast.classList.add('cha-toast-show'); });
    });

    // Auto-dismiss
    setTimeout(() => {
      toast.classList.remove('cha-toast-show');
    }, dur);
  }

  // ─── Time control selector (for settings drawer) ──────────────────────────

  /**
   * Build and return a time control selector widget (3 buttons).
   * Pass the container element and a change callback.
   *
   * @param {HTMLElement} container
   * @param {function}    onChange(modeKey)
   * @param {string}      currentMode
   */
  function buildTimeControlSelector(container, onChange, currentMode) {
    container.innerHTML = '';

    const wrapper = document.createElement('div');
    wrapper.className = 'cha-tc-selector';
    wrapper.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin-top:4px;';

    for (const [key, m] of Object.entries(ChaturangaClock.MODES)) {
      const btn = document.createElement('button');
      btn.className   = 'cha-tc-btn' + (key === (currentMode || 'chirantan') ? ' cha-tc-active' : '');
      btn.dataset.key = key;
      btn.innerHTML   = `<strong>${m.name}</strong><span>${m.label}</span>`;
      btn.style.cssText = `
        flex:1;min-width:80px;padding:8px 4px;border-radius:8px;border:1px solid rgba(201,168,76,0.2);
        background:var(--bg-secondary,#1a1714);cursor:pointer;
        display:flex;flex-direction:column;align-items:center;gap:2px;
        transition:background 0.15s,border-color 0.15s;font-size:13px;
      `;
      btn.querySelector('span').style.cssText = 'font-size:11px;opacity:0.6;';

      btn.addEventListener('click', () => {
        wrapper.querySelectorAll('.cha-tc-btn').forEach(b => b.classList.remove('cha-tc-active'));
        btn.classList.add('cha-tc-active');
        btn.style.background    = 'rgba(201,168,76,0.12)';
        btn.style.borderColor   = 'rgba(201,168,76,0.5)';
        if (onChange) onChange(key);
        // Reset styles on siblings
        wrapper.querySelectorAll('.cha-tc-btn:not(.cha-tc-active)').forEach(b => {
          b.style.background  = '';
          b.style.borderColor = '';
        });
      });

      if (key === (currentMode || 'chirantan')) {
        btn.style.background  = 'rgba(201,168,76,0.12)';
        btn.style.borderColor = 'rgba(201,168,76,0.5)';
      }

      wrapper.appendChild(btn);
    }

    container.appendChild(wrapper);
  }

  // ─── Expose ───────────────────────────────────────────────────────────────

  global.ChaturangaClockUI = { initClockUI, showELOToast, buildTimeControlSelector };

})(window);
