/**
 * adaptive-bot.js — Chaturanga v1.0.5.2
 * Tracks last 10 bot games, auto-adjusts ELO tier.
 * Drop into game.html after ui.js.
 * Usage: Call AdaptiveBot.recordResult('win'|'loss'|'draw') on game end.
 *        Call AdaptiveBot.getAdjustedElo(baseElo) before setBotConfig().
 */

const AdaptiveBot = (() => {
  const HISTORY_KEY = 'chaturanga_bot_history';
  const WINDOW = 10;
  const ELO_STEP = 100;
  const ELO_MIN = 100;
  const ELO_MAX = 1000;
  const WIN_THRESHOLD = 0.70;  // bump up if win rate > 70%
  const LOSS_THRESHOLD = 0.30; // drop down if win rate < 30%

  function getHistory() {
    return JSON.parse(localStorage.getItem(HISTORY_KEY) || '{"results":[],"currentEloOffset":0}');
  }

  function saveHistory(h) {
    localStorage.setItem(HISTORY_KEY, JSON.stringify(h));
  }

  function recordResult(outcome) { // 'win' | 'loss' | 'draw'
    const h = getHistory();
    h.results.push(outcome);
    if (h.results.length > WINDOW) h.results.shift();

    if (h.results.length >= WINDOW) {
      const wins = h.results.filter(r => r === 'win').length;
      const rate = wins / h.results.length;

      let adjusted = false;
      if (rate > WIN_THRESHOLD) {
        h.currentEloOffset = (h.currentEloOffset || 0) + ELO_STEP;
        adjusted = 'up';
      } else if (rate < LOSS_THRESHOLD) {
        h.currentEloOffset = (h.currentEloOffset || 0) - ELO_STEP;
        adjusted = 'down';
      }

      if (adjusted) {
        showToast(adjusted);
        h.results = []; // reset window after adjustment
      }
    }

    saveHistory(h);
  }

  function getAdjustedElo(baseElo) {
    const h = getHistory();
    const offset = h.currentEloOffset || 0;
    return Math.max(ELO_MIN, Math.min(ELO_MAX, baseElo + offset));
  }

  function getStats() {
    const h = getHistory();
    const results = h.results;
    if (!results.length) return { winRate: null, gamesInWindow: 0, offset: h.currentEloOffset || 0 };
    const wins = results.filter(r => r === 'win').length;
    return {
      winRate: wins / results.length,
      gamesInWindow: results.length,
      offset: h.currentEloOffset || 0,
      results
    };
  }

  function reset() {
    localStorage.removeItem(HISTORY_KEY);
  }

  /* ── Toast notification ── */
  function showToast(direction) {
    const msg = direction === 'up'
      ? '⬆ Difficulty adjusted — the battle grows fiercer'
      : '⬇ Difficulty adjusted — the enemy shows mercy';

    const toast = document.createElement('div');
    toast.className = 'abot-toast';
    toast.textContent = msg;
    injectStyles();
    document.body.appendChild(toast);
    requestAnimationFrame(() => toast.classList.add('abot-show'));
    setTimeout(() => {
      toast.classList.remove('abot-show');
      setTimeout(() => toast.remove(), 400);
    }, 3500);
  }

  /* ── Optional HUD badge (shows win rate in last N games) ── */
  function mountHUD(containerEl) {
    if (!containerEl) return;
    injectStyles();

    function update() {
      const s = getStats();
      if (!s.winRate && s.winRate !== 0) {
        containerEl.innerHTML = `<span class="abot-hud-label">Bot Adaptation</span><span class="abot-hud-val">Calibrating…</span>`;
        return;
      }
      const pct = Math.round(s.winRate * 100);
      const color = pct > 65 ? '#6dd56d' : pct < 35 ? '#e07070' : '#b8952a';
      containerEl.innerHTML = `
        <span class="abot-hud-label">Win rate (last ${s.gamesInWindow})</span>
        <span class="abot-hud-val" style="color:${color}">${pct}%</span>
        <span class="abot-hud-offset">${s.offset > 0 ? '+' : ''}${s.offset} ELO</span>`;
    }

    update();
    window.addEventListener('chaturanga:botgame', update);
  }

  function injectStyles() {
    if (document.getElementById('abot-styles')) return;
    const s = document.createElement('style');
    s.id = 'abot-styles';
    s.textContent = `
.abot-toast {
  position: fixed; bottom: 80px; left: 50%; transform: translateX(-50%) translateY(20px);
  background: #1a1209; border: 1px solid #b8952a; border-radius: 8px;
  padding: 12px 22px; color: #e8d5a0; font-family: 'Cinzel', Georgia, serif;
  font-size: .9rem; z-index: 9998; opacity: 0; pointer-events: none;
  transition: opacity .35s, transform .35s;
}
.abot-toast.abot-show { opacity: 1; transform: translateX(-50%) translateY(0); }
.abot-hud-label { font-size: .75rem; color: #9a8a6a; display: block; }
.abot-hud-val { font-size: 1.1rem; font-weight: 700; }
.abot-hud-offset { font-size: .75rem; color: #9a8a6a; margin-left: 8px; }`;
    document.head.appendChild(s);
  }

  /* ── Intercept game-end to auto-record (hooks into ui.js game-over event) ── */
  window.addEventListener('chaturanga:gameend', (e) => {
    const { isBotGame, localPlayerIdx, winner } = e.detail || {};
    if (!isBotGame) return;
    const outcome = winner === localPlayerIdx ? 'win' : winner === -1 ? 'draw' : 'loss';
    recordResult(outcome);
    window.dispatchEvent(new CustomEvent('chaturanga:botgame'));
  });

  return { recordResult, getAdjustedElo, getStats, reset, mountHUD, showToast };
})();
