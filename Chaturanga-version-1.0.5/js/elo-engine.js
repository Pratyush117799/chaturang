// elo-engine.js — Chaturanga v1.0.5.2
// Persistent ELO rating for single-player (vs bot) games
// All data stored in localStorage under 'chaturanga_elo_v2'

(function (global) {
  'use strict';

  const STORAGE_KEY = 'chaturanga_elo_v2';
  const DEFAULT_ELO = 1000;
  const MAX_HISTORY = 100;

  // Sanskrit rank thresholds — highest first
  const RANKS = [
    { min: 1400, title: 'Chakravarti',   sub: 'Emperor of the Ashtāpada'    },
    { min: 1300, title: 'Drona-Shishya', sub: 'Equal of the Acharya himself' },
    { min: 1200, title: 'Rathasena',     sub: 'Lord of the war chariots'     },
    { min: 1100, title: 'Maharathi',     sub: 'Great warrior of the age'     },
    { min: 1000, title: 'Senapati',      sub: 'Commander of armies'          },
    { min:  900, title: 'Yoddha',        sub: 'Proven in battle'             },
    { min:  800, title: 'Sainik',        sub: 'Soldier of the realm'         },
    { min:    0, title: 'Shishya',       sub: 'Student of the ancient game'  },
  ];

  // K-factor: higher early, stabilises with experience
  function _k(games) {
    if (games < 10) return 40;
    if (games < 30) return 32;
    return 20;
  }

  // Expected score given both ELOs
  function _expected(mine, theirs) {
    return 1 / (1 + Math.pow(10, (theirs - mine) / 400));
  }

  function _load() {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) return JSON.parse(raw);
    } catch (_) {}
    return { current: DEFAULT_ELO, peak: DEFAULT_ELO, games: 0, wins: 0, losses: 0, history: [] };
  }

  function _save(s) {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch (_) {}
  }

  /**
   * Record a completed game against a bot.
   *
   * @param {number}  botELO       — difficulty tier (100–1000)
   * @param {boolean} won          — did the human player win?
   * @param {string}  timeControl  — 'chirantan' | 'tez' | 'atichitr'
   * @returns {{ oldELO, newELO, delta, rankChanged, newRank }}
   */
  function recordGame(botELO, won, timeControl) {
    const s       = _load();
    const oldELO  = s.current;
    const oldRank = getRankTitle(oldELO).title;
    const score   = won ? 1 : 0;
    const exp     = _expected(oldELO, botELO);
    const delta   = Math.round(_k(s.games) * (score - exp));
    const newELO  = Math.max(100, oldELO + delta);
    const newRank = getRankTitle(newELO).title;

    s.games++;
    if (won) s.wins++; else s.losses++;
    s.current = newELO;
    s.peak    = Math.max(s.peak, newELO);

    s.history.unshift({
      ts:  Date.now(),
      botELO,
      result: won ? 'W' : 'L',
      delta,
      newELO,
      tc: timeControl || 'chirantan',
    });
    if (s.history.length > MAX_HISTORY) s.history.length = MAX_HISTORY;

    _save(s);
    return { oldELO, newELO, delta, rankChanged: newRank !== oldRank, newRank };
  }

  /** Full stats object for the profile page */
  function getStats() {
    const s = _load();
    return {
      current: s.current,
      peak:    s.peak,
      games:   s.games,
      wins:    s.wins,
      losses:  s.losses,
      winRate: s.games > 0 ? Math.round((s.wins / s.games) * 100) : 0,
      history: s.history,
    };
  }

  /** Rank object for a given ELO */
  function getRankTitle(elo) {
    for (const r of RANKS) if (elo >= r.min) return { title: r.title, sub: r.sub };
    return RANKS[RANKS.length - 1];
  }

  /**
   * Win/loss breakdown split into four bot-difficulty bands.
   * Returns: { '100–299': {w, l}, '300–499': {w, l}, '500–699': {w, l}, '700–1000': {w, l} }
   */
  function getBotBreakdown() {
    const s = _load();
    const bands = {
      '100–299':  { w: 0, l: 0 },
      '300–499':  { w: 0, l: 0 },
      '500–699':  { w: 0, l: 0 },
      '700–1000': { w: 0, l: 0 },
    };
    for (const g of s.history) {
      const b = g.botELO < 300 ? '100–299'
              : g.botELO < 500 ? '300–499'
              : g.botELO < 700 ? '500–699'
              : '700–1000';
      if (g.result === 'W') bands[b].w++; else bands[b].l++;
    }
    return bands;
  }

  /** Wipe all ELO data (for settings/reset) */
  function reset() {
    try { localStorage.removeItem(STORAGE_KEY); } catch (_) {}
  }

  global.ChaturangaELO = { recordGame, getStats, getRankTitle, getBotBreakdown, reset };

})(window);
