// game-clock.js — Chaturanga v1.0.5.2
// Per-player countdown timer with three named time controls
// No DOM dependency — pairs with clock-ui.js for display

(function (global) {
  'use strict';

  /**
   * Three time controls matching the names in the original design doc:
   *   Chirantan — no limit (infinite, classic Chaturanga)
   *   Tez       — 5 minutes each, no increment (fast blitz)
   *   Atichitr  — 1 minute + 3 second increment per move (bullet with bonus)
   */
  const MODES = {
    chirantan: { key: 'chirantan', name: 'Chirantan', label: 'No limit', initial: null,   increment: 0    },
    tez:       { key: 'tez',       name: 'Tez',       label: '5+0',     initial: 300000, increment: 0    },
    atichitr:  { key: 'atichitr',  name: 'Atichitr',  label: '1+3',     initial: 60000,  increment: 3000 },
  };

  /**
   * Create a clock instance.
   *
   * @param {string} modeKey      — 'chirantan' | 'tez' | 'atichitr'
   * @param {number} playerCount  — number of active players (1–4)
   * @param {object} callbacks
   *   onTick(playerIndex, snapshot[])  — fired every 100ms while running
   *   onExpire(playerIndex)            — fired the moment a player runs out
   *   onExpiredTurn(playerIndex)       — fired when an already-expired player's
   *                                      turn starts (signal to auto-forfeit)
   */
  function Clock(modeKey, playerCount, callbacks) {
    const mode = MODES[modeKey] || MODES.chirantan;
    const cbs  = callbacks || {};
    const n    = playerCount || 4;

    let times        = Array.from({ length: n }, () => mode.initial); // null = unlimited
    let activeIndex  = -1;
    let expiredSet   = new Set();
    let intervalId   = null;
    let lastTickMs   = 0;
    let ticking      = false;

    // ---- internal ----

    function _snap() {
      return times.map((ms, i) => ({
        player:  i,
        ms,
        expired: expiredSet.has(i),
        active:  i === activeIndex,
      }));
    }

    function _tick() {
      if (!ticking || activeIndex < 0 || mode.initial === null) return;
      const now     = Date.now();
      const elapsed = now - lastTickMs;
      lastTickMs    = now;

      if (expiredSet.has(activeIndex)) return;

      times[activeIndex] = Math.max(0, times[activeIndex] - elapsed);
      if (cbs.onTick) cbs.onTick(activeIndex, _snap());

      if (times[activeIndex] <= 0) {
        expiredSet.add(activeIndex);
        ticking = false;
        if (cbs.onExpire) cbs.onExpire(activeIndex);
      }
    }

    function _ensureInterval() {
      if (!intervalId && mode.initial !== null) {
        intervalId = setInterval(_tick, 100);
      }
    }

    // ---- public API ----

    /**
     * Call when a player's turn begins.
     * Returns false if this player is already expired — caller should auto-forfeit.
     */
    function beginTurn(playerIndex) {
      if (expiredSet.has(playerIndex)) {
        if (cbs.onExpiredTurn) cbs.onExpiredTurn(playerIndex);
        return false;
      }
      activeIndex = playerIndex;
      lastTickMs  = Date.now();
      ticking     = true;
      _ensureInterval();
      if (cbs.onTick) cbs.onTick(activeIndex, _snap());
      return true;
    }

    /**
     * Call when a player completes their move.
     * Applies the increment (if any) and pauses the clock.
     */
    function endTurn(playerIndex) {
      if (playerIndex === activeIndex && mode.increment > 0 && times[playerIndex] !== null) {
        times[playerIndex] = Math.min(
          times[playerIndex] + mode.increment,
          mode.initial * 3  // hard ceiling: 3× initial, prevents abuse
        );
      }
      activeIndex = -1;
      ticking     = false;
      if (cbs.onTick) cbs.onTick(-1, _snap());
    }

    /** Temporarily freeze the clock (e.g. modal open) */
    function pause() { ticking = false; }

    /** Resume after a pause */
    function resume() {
      if (activeIndex >= 0 && !expiredSet.has(activeIndex)) {
        lastTickMs = Date.now();
        ticking    = true;
      }
    }

    /** Clean up — call when the game ends */
    function destroy() {
      if (intervalId) { clearInterval(intervalId); intervalId = null; }
      ticking = false;
    }

    /** Remaining ms for a player (null = unlimited) */
    function getTime(i) { return times[i]; }

    /** True if this player has run out of time */
    function isExpired(i) { return expiredSet.has(i); }

    /** Returns the active mode object */
    function getMode() { return mode; }

    /** Returns the full snapshot array (same shape as onTick) */
    function getSnapshot() { return _snap(); }

    return { beginTurn, endTurn, pause, resume, destroy, getTime, isExpired, getMode, getSnapshot };
  }

  // ---- static helpers ----

  /** Format milliseconds as M:SS — null renders as '∞' */
  function formatTime(ms) {
    if (ms === null) return '∞';
    const s   = Math.max(0, Math.ceil(ms / 1000));
    const min = Math.floor(s / 60);
    const sec = s % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
  }

  global.ChaturangaClock = {
    MODES,
    create:     (modeKey, playerCount, callbacks) => new Clock(modeKey, playerCount, callbacks),
    formatTime,
  };

})(window);
