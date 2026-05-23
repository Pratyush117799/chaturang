/**
 * board-themes.js — Locked Board Themes with Granth Achievement Unlock
 * ======================================================================
 * Drop-in for game.html. Add ONE script tag:
 *   <script src="js/board-themes.js"></script>
 *
 * 5 base themes + 5 locked achievement themes.
 * Unlock conditions:
 *   kurukshetra-sunset  → Campaign Day 13 complete  (chakravyuha-survivor Granth entry)
 *   indraprastha-marble → Arjuna rank in Akhara     (arjuna-drshti Granth entry)
 *   ashokas-pillar      → 30-day Shubh streak       (chaturanga_shubh.streak >= 30)
 *   shakuni-court       → Pāśa used in 10 games     (chaturanga_pasha_count >= 10)
 *   midnight-ashtapada  → 5 games between 23–03 IST (chaturanga_midnight_count >= 5)
 *
 * Exposes:
 *   ChaturangaThemes.apply(themeId)        — switch active theme
 *   ChaturangaThemes.unlock(themeId)       — unlock + animate
 *   ChaturangaThemes.checkUnlocks()        — run all unlock checks from localStorage
 *   ChaturangaThemes.buildSelector(el)     — inject picker UI into <el>
 *   ChaturangaThemes.getActive()           — returns current theme id
 */

'use strict';

const ChaturangaThemes = (() => {

  // ── THEME DEFINITIONS ──────────────────────────────────────────────────────
  const THEMES = [
    // ── ALWAYS UNLOCKED ────────────────────────────────────────────────────
    {
      id: 'classic',
      name: 'Classic Ashtāpada',
      description: 'The eternal board. Dark teak and pale sandstone.',
      locked: false,
      vars: {
        '--board-light':       '#e8d5b0',
        '--board-dark':        '#8b6343',
        '--board-border':      '#5a3e28',
        '--board-coord':       '#5a3e28',
        '--board-shadow':      'rgba(0,0,0,0.4)',
        '--piece-red':         '#c0392b',
        '--piece-blue':        '#2980b9',
        '--piece-green':       '#27ae60',
        '--piece-yellow':      '#f39c12',
        '--board-highlight':   'rgba(245,228,160,0.5)',
        '--board-select':      'rgba(201,168,76,0.65)',
      },
    },
    {
      id: 'midnight-base',
      name: 'Midnight Indigo',
      description: 'Deep navy and silver — the board under moonlight.',
      locked: false,
      vars: {
        '--board-light':       '#c5c9d8',
        '--board-dark':        '#2c3454',
        '--board-border':      '#1a2040',
        '--board-coord':       '#7080b0',
        '--board-shadow':      'rgba(0,0,20,0.6)',
        '--piece-red':         '#ef4444',
        '--piece-blue':        '#60a5fa',
        '--piece-green':       '#4ade80',
        '--piece-yellow':      '#fbbf24',
        '--board-highlight':   'rgba(96,165,250,0.4)',
        '--board-select':      'rgba(96,165,250,0.65)',
      },
    },
    {
      id: 'parchment',
      name: 'Ancient Parchment',
      description: 'Aged vellum squares — the colour of the oldest manuscripts.',
      locked: false,
      vars: {
        '--board-light':       '#f5e8c8',
        '--board-dark':        '#c8a870',
        '--board-border':      '#8b6840',
        '--board-coord':       '#5a3820',
        '--board-shadow':      'rgba(90,56,32,0.35)',
        '--piece-red':         '#c0392b',
        '--piece-blue':        '#1a5276',
        '--piece-green':       '#1e8449',
        '--piece-yellow':      '#b7950b',
        '--board-highlight':   'rgba(201,168,76,0.5)',
        '--board-select':      'rgba(201,168,76,0.75)',
      },
    },
    {
      id: 'copper',
      name: 'Copper & Slate',
      description: 'Oxidised copper tiles on river slate.',
      locked: false,
      vars: {
        '--board-light':       '#d4a27a',
        '--board-dark':        '#4a4a5a',
        '--board-border':      '#2a2a36',
        '--board-coord':       '#9a8070',
        '--board-shadow':      'rgba(0,0,0,0.5)',
        '--piece-red':         '#e74c3c',
        '--piece-blue':        '#3498db',
        '--piece-green':       '#2ecc71',
        '--piece-yellow':      '#f1c40f',
        '--board-highlight':   'rgba(212,162,122,0.5)',
        '--board-select':      'rgba(212,162,122,0.75)',
      },
    },
    {
      id: 'ivory-jade',
      name: 'Ivory & Jade',
      description: 'Carved ivory squares with jade inlay — a royal set.',
      locked: false,
      vars: {
        '--board-light':       '#f0ede0',
        '--board-dark':        '#5a8a6a',
        '--board-border':      '#3a6040',
        '--board-coord':       '#3a6040',
        '--board-shadow':      'rgba(0,40,20,0.35)',
        '--piece-red':         '#c0392b',
        '--piece-blue':        '#21618c',
        '--piece-green':       '#1d6a48',
        '--piece-yellow':      '#b7950b',
        '--board-highlight':   'rgba(90,138,106,0.4)',
        '--board-select':      'rgba(90,138,106,0.7)',
      },
    },

    // ── ACHIEVEMENT-LOCKED ──────────────────────────────────────────────────
    {
      id: 'kurukshetra-sunset',
      name: 'Kurukshetra at Sunset',
      description: 'The field glows amber and blood-red. Unlocked on Day 13.',
      locked: true,
      unlockHint: 'Complete Day 13 of the Kurukshetra Campaign (Abhimanyu Scenario).',
      grantedBy: 'granth:chakravyuha-survivor',
      vars: {
        '--board-light':       '#f0c060',
        '--board-dark':        '#8b2020',
        '--board-border':      '#4a0808',
        '--board-coord':       '#f0a040',
        '--board-shadow':      'rgba(80,10,0,0.6)',
        '--piece-red':         '#ff6b35',
        '--piece-blue':        '#4a9eca',
        '--piece-green':       '#68b96a',
        '--piece-yellow':      '#ffd700',
        '--board-highlight':   'rgba(240,160,64,0.5)',
        '--board-select':      'rgba(240,160,64,0.8)',
      },
    },
    {
      id: 'indraprastha-marble',
      name: 'Indraprastha Marble',
      description: 'Polished white and teal marble — the palace of the Pandavas.',
      locked: true,
      unlockHint: 'Reach Arjuna rank (600 ELO) in the Akhara Training Dojo.',
      grantedBy: 'granth:arjuna-drshti',
      vars: {
        '--board-light':       '#eaf4f4',
        '--board-dark':        '#2a7a80',
        '--board-border':      '#165560',
        '--board-coord':       '#2a7a80',
        '--board-shadow':      'rgba(0,60,70,0.4)',
        '--piece-red':         '#e74c3c',
        '--piece-blue':        '#1a8a9a',
        '--piece-green':       '#2ecc71',
        '--piece-yellow':      '#f1c40f',
        '--board-highlight':   'rgba(42,122,128,0.35)',
        '--board-select':      'rgba(42,122,128,0.65)',
      },
    },
    {
      id: 'ashokas-pillar',
      name: "Ashoka's Pillar",
      description: 'Lion capital gold on polished sandstone. 30 dawns earned this.',
      locked: true,
      unlockHint: 'Maintain a 30-day Shubh Challenge streak.',
      grantedBy: 'shubh:streak-30',
      vars: {
        '--board-light':       '#f5e0a0',
        '--board-dark':        '#8b7030',
        '--board-border':      '#5a4818',
        '--board-coord':       '#8b7030',
        '--board-shadow':      'rgba(60,40,0,0.4)',
        '--piece-red':         '#c0392b',
        '--piece-blue':        '#1a5276',
        '--piece-green':       '#1e6a3a',
        '--piece-yellow':      '#c9a84c',
        '--board-highlight':   'rgba(201,168,76,0.55)',
        '--board-select':      'rgba(201,168,76,0.85)',
      },
    },
    {
      id: 'shakuni-court',
      name: "Shakuni's Court",
      description: 'Obsidian squares and bone inlay — the Kaurava gambling hall.',
      locked: true,
      unlockHint: 'Use the Pāśa mechanic in 10 or more games.',
      grantedBy: 'pasha:count-10',
      vars: {
        '--board-light':       '#d8d0c0',
        '--board-dark':        '#1a1a1a',
        '--board-border':      '#0a0a0a',
        '--board-coord':       '#606060',
        '--board-shadow':      'rgba(0,0,0,0.7)',
        '--piece-red':         '#e74c3c',
        '--piece-blue':        '#5dade2',
        '--piece-green':       '#58d68d',
        '--piece-yellow':      '#f9e79f',
        '--board-highlight':   'rgba(216,208,192,0.35)',
        '--board-select':      'rgba(216,208,192,0.6)',
      },
    },
    {
      id: 'midnight-ashtapada',
      name: 'Midnight Ashtāpada',
      description: 'Deep void and starlight silver — played when all others sleep.',
      locked: true,
      unlockHint: 'Play 5 games between 23:00 and 03:00 IST.',
      grantedBy: 'midnight:count-5',
      vars: {
        '--board-light':       '#a0aac0',
        '--board-dark':        '#080c18',
        '--board-border':      '#020408',
        '--board-coord':       '#404860',
        '--board-shadow':      'rgba(0,0,20,0.85)',
        '--piece-red':         '#ff6b6b',
        '--piece-blue':        '#74b9ff',
        '--piece-green':       '#55efc4',
        '--piece-yellow':      '#ffeaa7',
        '--board-highlight':   'rgba(160,170,192,0.3)',
        '--board-select':      'rgba(160,170,192,0.6)',
      },
    },
  ];

  // ── STORAGE ────────────────────────────────────────────────────────────────
  const KEY_UNLOCKED = 'chaturanga_unlocked_themes';
  const KEY_ACTIVE   = 'chaturanga_active_theme';

  function getUnlocked() {
    try { return JSON.parse(localStorage.getItem(KEY_UNLOCKED) || '[]'); }
    catch { return []; }
  }
  function saveUnlocked(list) {
    try { localStorage.setItem(KEY_UNLOCKED, JSON.stringify(list)); } catch {}
  }
  function isUnlocked(id) {
    const theme = THEMES.find(t => t.id === id);
    if (!theme || !theme.locked) return true; // base themes always unlocked
    return getUnlocked().includes(id);
  }
  function getActiveId() {
    return localStorage.getItem(KEY_ACTIVE) || 'classic';
  }
  function saveActive(id) {
    try { localStorage.setItem(KEY_ACTIVE, id); } catch {}
  }

  // ── CSS APPLICATION ────────────────────────────────────────────────────────
  function applyVarsToRoot(vars) {
    const root = document.documentElement;
    for (const [k, v] of Object.entries(vars)) {
      root.style.setProperty(k, v);
    }
  }

  function apply(themeId) {
    const theme = THEMES.find(t => t.id === themeId);
    if (!theme) return;
    if (theme.locked && !isUnlocked(themeId)) return; // safety guard

    applyVarsToRoot(theme.vars);
    saveActive(themeId);

    // Update selector UI if present
    const selector = document.getElementById('ct-theme-selector');
    if (selector) {
      selector.querySelectorAll('.ct-theme-option').forEach(opt => {
        opt.classList.toggle('ct-active', opt.dataset.themeId === themeId);
      });
    }
  }

  // ── UNLOCK ─────────────────────────────────────────────────────────────────
  function unlock(themeId) {
    if (isUnlocked(themeId)) return false; // already unlocked

    const theme = THEMES.find(t => t.id === themeId);
    if (!theme) return false;

    const list = getUnlocked();
    list.push(themeId);
    saveUnlocked(list);

    // Rebuild selector if visible
    const container = document.getElementById('ct-theme-container');
    if (container) buildSelector(container);

    // Celebration animation
    shimmerBoard();

    // Toast
    showToast(`🎨 Board theme unlocked: ${theme.name}`);

    return true;
  }

  // ── UNLOCK CHECKS ──────────────────────────────────────────────────────────
  function checkUnlocks() {
    // 1. Granth: chakravyuha-survivor → kurukshetra-sunset
    try {
      const granth = JSON.parse(localStorage.getItem('chaturanga_granth') || '{}');
      const inscriptions = granth.inscriptions || {};
      if (inscriptions['chakravyuha-survivor']) unlock('kurukshetra-sunset');
      if (inscriptions['arjuna-drshti'])        unlock('indraprastha-marble');
    } catch {}

    // 2. Shubh 30-day streak → ashokas-pillar
    try {
      const shubh  = JSON.parse(localStorage.getItem('chaturanga_shubh') || '{}');
      const streak = shubh.streak ?? shubh.maxStreak ?? 0;
      if (streak >= 30) unlock('ashokas-pillar');
    } catch {}

    // 3. Pāśa count → shakuni-court
    try {
      const pashaCount = parseInt(localStorage.getItem('chaturanga_pasha_count') || '0');
      if (pashaCount >= 10) unlock('shakuni-court');
    } catch {}

    // 4. Midnight games count → midnight-ashtapada
    try {
      // Count games played between 23:00 and 03:00 IST (UTC+5:30)
      const eloData  = JSON.parse(localStorage.getItem('chaturanga_elo_v2') || '{}');
      const history  = eloData.history ?? [];
      const IST_OFFSET = 5.5 * 3600 * 1000; // ms
      let midnightCount = 0;
      for (const entry of history) {
        if (!entry.ts) continue;
        const ist  = new Date(entry.ts + IST_OFFSET);
        const hour = ist.getUTCHours();
        if (hour >= 23 || hour < 3) midnightCount++;
      }
      if (midnightCount >= 5) unlock('midnight-ashtapada');
      // Store count for external reference
      localStorage.setItem('chaturanga_midnight_count', midnightCount);
    } catch {}
  }

  // ── SHIMMER ANIMATION ──────────────────────────────────────────────────────
  function shimmerBoard() {
    const board = document.querySelector(
      '#board, .board, #gameBoard, .game-board, [id*="board"]'
    );
    if (!board) return;

    const shimmer = document.createElement('div');
    shimmer.style.cssText = `
      position:absolute;inset:0;z-index:999;pointer-events:none;
      background:linear-gradient(135deg,
        rgba(201,168,76,0) 0%,
        rgba(201,168,76,0.4) 40%,
        rgba(245,228,160,0.6) 50%,
        rgba(201,168,76,0.4) 60%,
        rgba(201,168,76,0) 100%);
      animation:ct-shimmer 1.5s ease forwards;
    `;

    const style = document.createElement('style');
    style.textContent = `
      @keyframes ct-shimmer {
        0%   { opacity:0; transform:translateX(-100%) skewX(-15deg); }
        30%  { opacity:1; }
        70%  { opacity:1; }
        100% { opacity:0; transform:translateX(200%) skewX(-15deg); }
      }
    `;
    document.head.appendChild(style);

    const pos = getComputedStyle(board).position;
    if (pos === 'static') board.style.position = 'relative';
    board.appendChild(shimmer);
    setTimeout(() => shimmer.remove(), 1600);
  }

  // ── TOAST ──────────────────────────────────────────────────────────────────
  function showToast(msg) {
    // Use existing Chaturanga toast if available
    if (window.showToast) { window.showToast(msg); return; }
    if (window.ui?.toast) { window.ui.toast(msg); return; }

    // Fallback inline toast
    let toast = document.getElementById('ct-toast');
    if (!toast) {
      toast = document.createElement('div');
      toast.id = 'ct-toast';
      toast.style.cssText = `
        position:fixed;bottom:24px;left:50%;transform:translateX(-50%) translateY(20px);
        background:#1c1508;border:1px solid rgba(201,168,76,.4);color:#e8c96a;
        padding:10px 20px;border-radius:8px;font-size:.85rem;
        font-family:'Outfit',sans-serif;z-index:9999;opacity:0;
        transition:all .3s ease;pointer-events:none;white-space:nowrap;
        box-shadow:0 4px 20px rgba(0,0,0,.5);
      `;
      document.body.appendChild(toast);
    }
    toast.textContent = msg;
    requestAnimationFrame(() => {
      toast.style.opacity = '1';
      toast.style.transform = 'translateX(-50%) translateY(0)';
    });
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(-50%) translateY(10px)';
    }, 3000);
  }

  // ── SELECTOR UI ────────────────────────────────────────────────────────────
  /**
   * Builds a theme picker grid inside the given container element.
   * Each theme shows its name, a colour preview, and lock state.
   */
  function buildSelector(containerEl) {
    if (!containerEl) return;

    injectSelectorStyles();

    const activeId   = getActiveId();
    const unlockedIds = getUnlocked();

    containerEl.id = 'ct-theme-container';
    containerEl.innerHTML = `
      <div id="ct-theme-selector">
        <div class="ct-selector-head">
          <span class="ct-selector-title">Board Theme</span>
          <span class="ct-selector-sub">${THEMES.filter(t => !t.locked || unlockedIds.includes(t.id)).length} / ${THEMES.length} unlocked</span>
        </div>
        <div class="ct-theme-grid">
          ${THEMES.map(theme => {
            const unlocked = !theme.locked || unlockedIds.includes(theme.id);
            const isActive = theme.id === activeId;
            const light = theme.vars['--board-light'];
            const dark  = theme.vars['--board-dark'];
            return `
              <div class="ct-theme-option ${isActive ? 'ct-active' : ''} ${unlocked ? 'ct-unlocked' : 'ct-locked'}"
                   data-theme-id="${theme.id}"
                   title="${unlocked ? theme.description : theme.unlockHint ?? 'Locked'}">
                <div class="ct-swatch">
                  <!-- 2×2 checkerboard preview -->
                  <svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg">
                    <rect x="0"  y="0"  width="20" height="20" fill="${light}"/>
                    <rect x="20" y="0"  width="20" height="20" fill="${dark}"/>
                    <rect x="0"  y="20" width="20" height="20" fill="${dark}"/>
                    <rect x="20" y="20" width="20" height="20" fill="${light}"/>
                    ${!unlocked ? '<rect x="0" y="0" width="40" height="40" fill="rgba(0,0,0,0.55)"/>' : ''}
                    ${!unlocked ? '<text x="20" y="25" text-anchor="middle" font-size="16" fill="rgba(255,255,255,0.6)">🔒</text>' : ''}
                  </svg>
                  ${isActive ? '<div class="ct-active-dot"></div>' : ''}
                </div>
                <div class="ct-theme-name">${theme.name}</div>
                ${!unlocked ? `<div class="ct-lock-hint">${theme.unlockHint ?? 'Locked'}</div>` : ''}
              </div>
            `;
          }).join('')}
        </div>
      </div>
    `;

    // Click handlers
    containerEl.querySelectorAll('.ct-theme-option.ct-unlocked').forEach(opt => {
      opt.addEventListener('click', () => {
        const id = opt.dataset.themeId;
        apply(id);
      });
    });
  }

  function injectSelectorStyles() {
    if (document.getElementById('ct-selector-styles')) return;
    const s = document.createElement('style');
    s.id = 'ct-selector-styles';
    s.textContent = `
#ct-theme-selector { width: 100%; }
.ct-selector-head {
  display: flex; align-items: baseline; justify-content: space-between;
  margin-bottom: 12px;
}
.ct-selector-title {
  font-family: 'Cinzel', serif; font-size: .78rem; font-weight: 600;
  color: #c9a84c; letter-spacing: .1em; text-transform: uppercase;
}
.ct-selector-sub {
  font-size: .65rem; color: rgba(201,168,76,.4); font-family: 'Outfit', sans-serif;
}
.ct-theme-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(80px, 1fr));
  gap: 8px;
}
.ct-theme-option {
  cursor: pointer;
  border-radius: 8px;
  padding: 6px;
  border: 1px solid rgba(201,168,76,.12);
  transition: border-color .2s, background .2s;
  text-align: center;
}
.ct-theme-option.ct-locked { cursor: default; opacity: .55; }
.ct-theme-option.ct-unlocked:hover { border-color: rgba(201,168,76,.35); background: rgba(201,168,76,.04); }
.ct-theme-option.ct-active { border-color: #c9a84c; background: rgba(201,168,76,.08); }
.ct-swatch {
  position: relative; width: 100%; aspect-ratio: 1;
  border-radius: 5px; overflow: hidden; margin-bottom: 5px;
}
.ct-swatch svg { width: 100%; height: 100%; display: block; }
.ct-active-dot {
  position: absolute; bottom: 4px; right: 4px;
  width: 8px; height: 8px; border-radius: 50%;
  background: #f5e4a0;
  box-shadow: 0 0 6px rgba(245,228,160,.8);
}
.ct-theme-name {
  font-size: .6rem; color: rgba(201,168,76,.65);
  font-family: 'Outfit', sans-serif;
  line-height: 1.3; word-break: break-word;
}
.ct-lock-hint {
  font-size: .55rem; color: rgba(201,168,76,.35);
  font-family: 'Outfit', sans-serif; line-height: 1.3;
  margin-top: 3px; font-style: italic;
}
    `;
    document.head.appendChild(s);
  }

  // ── PASHA COUNTER HOOK ──────────────────────────────────────────────────────
  /** Call from game.html whenever a Pāśa move is used. */
  function recordPashaUse() {
    const count = parseInt(localStorage.getItem('chaturanga_pasha_count') || '0') + 1;
    localStorage.setItem('chaturanga_pasha_count', count);
    if (count >= 10) unlock('shakuni-court');
  }

  // ── MIDNIGHT GAME HOOK ─────────────────────────────────────────────────────
  /** Call from game.html on game start to record the timestamp for midnight detection. */
  function recordGameStart() {
    // Midnight check happens lazily in checkUnlocks() from elo history.
    // This is a no-op hook for clarity — checkUnlocks() does the real work.
    checkUnlocks();
  }

  // ── AUTO-INIT ──────────────────────────────────────────────────────────────
  function autoInit() {
    injectSelectorStyles();
    checkUnlocks();
    apply(getActiveId());
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }

  return {
    apply,
    unlock,
    checkUnlocks,
    buildSelector,
    getActive: getActiveId,
    recordPashaUse,
    recordGameStart,
    THEMES,
  };

})();

/* ─────────────────────────────────────────────────────────────────────────────
 * INTEGRATION GUIDE
 * ─────────────────────────────────────────────────────────────────────────────
 * 1. Add to game.html and any page with a board:
 *      <script src="js/board-themes.js"></script>
 *
 * 2. Ensure your CSS uses these variables on squares:
 *      .square.light { background: var(--board-light); }
 *      .square.dark  { background: var(--board-dark);  }
 *      .board        { border:     2px solid var(--board-border); }
 *
 * 3. Add the selector widget to your settings panel:
 *      ChaturangaThemes.buildSelector(document.getElementById('theme-picker'));
 *
 * 4. On Pāśa move execution: ChaturangaThemes.recordPashaUse();
 *
 * 5. On Granth achievement grant (already called by grantGranth() flow):
 *      ChaturangaThemes.checkUnlocks();   // or call unlock() directly
 *
 * 6. The shimmer animation fires automatically on unlock.
 * ───────────────────────────────────────────────────────────────────────────── */
