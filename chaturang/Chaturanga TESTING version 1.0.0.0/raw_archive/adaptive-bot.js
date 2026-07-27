/**
 * adaptive-bot.js — Chaturanga v1.0.5.2
 * Tracks last 10 bot games, auto-adjusts difficulty to keep ~40% win rate.
 * Drop-in: <script src="js/adaptive-bot.js"></script> after ui.js in game.html
 * Hooks into window.onBotGameEnd(playerWon) — call this from game-over logic.
 */

const AdaptiveBot = (() => {
  const STORAGE_KEY = 'chaturanga_bot_history';
  const WINDOW_SIZE = 10;
  const ELO_STEP    = 100;
  const MIN_ELO     = 100;
  const MAX_ELO     = 1000;

  // ── persistence ──────────────────────────────────────────────────────────
  function load() {
    try { return JSON.parse(localStorage.getItem(STORAGE_KEY)) || { results: [], currentElo: 400 }; }
    catch { return { results: [], currentElo: 400 }; }
  }
  function save(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }

  // ── win-rate across last N games ──────────────────────────────────────────
  function winRate(results) {
    if (!results.length) return 0.5;
    return results.filter(Boolean).length / results.length;
  }

  // ── toast helper ─────────────────────────────────────────────────────────
  function toast(msg) {
    const el = document.createElement('div');
    el.style.cssText = `position:fixed;bottom:80px;left:50%;transform:translateX(-50%);
      background:#1a1200;border:1px solid var(--gold,#c9a84c);color:var(--gold,#c9a84c);
      padding:8px 18px;border-radius:20px;font-family:Outfit,sans-serif;font-size:13px;
      z-index:9999;opacity:0;transition:opacity .3s;pointer-events:none;`;
    el.textContent = msg;
    document.body.appendChild(el);
    requestAnimationFrame(() => { el.style.opacity = '1'; });
    setTimeout(() => { el.style.opacity = '0'; setTimeout(() => el.remove(), 300); }, 2800);
  }

  // ── public API ────────────────────────────────────────────────────────────

  /** Call after every bot game. playerWon = true/false */
  function recordResult(playerWon) {
    const state = load();
    state.results.push(!!playerWon);
    if (state.results.length > WINDOW_SIZE) state.results.shift();

    const wr = winRate(state.results);
    let adjusted = false;

    if (state.results.length >= 5) {          // need min 5 games to adjust
      if (wr > 0.70 && state.currentElo < MAX_ELO) {
        state.currentElo = Math.min(MAX_ELO, state.currentElo + ELO_STEP);
        adjusted = '↑';
      } else if (wr < 0.30 && state.currentElo > MIN_ELO) {
        state.currentElo = Math.max(MIN_ELO, state.currentElo - ELO_STEP);
        adjusted = '↓';
      }
    }

    save(state);

    if (adjusted) {
      setTimeout(() => toast(`Difficulty adjusted ${adjusted} — Bot ELO now ${state.currentElo}`), 1200);
    }
  }

  /** Returns the ELO bot should use next game. Call before setBotConfig() */
  function recommendedElo() {
    return load().currentElo;
  }

  /** Returns stats object for display */
  function stats() {
    const state = load();
    const results = state.results;
    return {
      currentElo: state.currentElo,
      recentGames: results.length,
      winRate: results.length ? Math.round(winRate(results) * 100) : null,
      history: [...results]
    };
  }

  /** Reset tracking (e.g. on difficulty manual-override) */
  function reset(manualElo) {
    save({ results: [], currentElo: manualElo || 400 });
  }

  // ── auto-hook into existing setBotConfig pattern ──────────────────────────
  // If ui.js exposes window.setBotElo, wrap it to inject recommended ELO
  // before bot starts (only when no explicit override is provided)
  (function patchSettingsDrawer() {
    // Wait for DOM ready
    document.addEventListener('DOMContentLoaded', () => {
      // Patch the new-game button / bot ELO selector if they exist
      const eloInput = document.getElementById('botEloInput') ||
                       document.querySelector('input[name="botElo"]') ||
                       document.querySelector('.bot-elo-select');
      if (eloInput && !eloInput.dataset.adaptivePinned) {
        const rec = recommendedElo();
        eloInput.value = rec;
        eloInput.dataset.adaptivePinned = '1';
      }
    });
  })();

  // Expose global hook so game-over overlay can call it
  window.AdaptiveBot = { recordResult, recommendedElo, stats, reset };

  // Auto-wire to existing window.onBotGameEnd if used in project
  const _prev = window.onBotGameEnd;
  window.onBotGameEnd = function(playerWon) {
    recordResult(playerWon);
    if (typeof _prev === 'function') _prev(playerWon);
  };

  return { recordResult, recommendedElo, stats, reset };
})();
