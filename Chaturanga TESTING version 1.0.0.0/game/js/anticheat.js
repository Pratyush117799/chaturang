/**
 * Chaturanga v1.0.5 — Anti-Cheat & Fair Play System
 * window.ChaturangaAntiCheat
 */
(function() {
  'use strict';

  const THRESHOLD_WATCH = 0.65;
  const THRESHOLD_FLAG  = 0.85;
  const MIN_MOVES_FOR_FLAG = 10;
  const MIN_INTERVAL_MS = 200;

  const metrics = {}; // per player: { moveTimes: [], botMatches: 0, totalMoves: 0 }

  function ensurePlayer(idx) {
    if (!metrics[idx]) metrics[idx] = { moveTimes: [], botMatches: 0, totalMoves: 0 };
  }

  // ── Rate Limiter ─────────────────────────────────────────────────────────
  const rateLimiter = {
    lastMoveTime: {},
    check(player) {
      const now  = Date.now();
      const last = this.lastMoveTime[player] || 0;
      if (now - last < MIN_INTERVAL_MS) return false;
      this.lastMoveTime[player] = now;
      return true;
    }
  };

  // ── Record Move Time ──────────────────────────────────────────────────────
  function recordMoveTime(playerIdx, durationMs) {
    ensurePlayer(playerIdx);
    metrics[playerIdx].moveTimes.push(durationMs);
  }

  // ── Analyse Player ────────────────────────────────────────────────────────
  function analysePlayer(playerIdx, moveHistory, game) {
    ensurePlayer(playerIdx);
    const m = metrics[playerIdx];
    const reasons = [];

    // Engine correlation
    let correlation = 0;
    if (m.totalMoves > 0) correlation = m.botMatches / m.totalMoves;

    // Timing analysis
    const times = m.moveTimes;
    let avgMoveTime = 0;
    if (times.length > 0) {
      avgMoveTime = times.reduce((a,b) => a+b, 0) / times.length;
      if (avgMoveTime < 800 && times.length >= 5) {
        reasons.push('Consistently fast moves (<800ms avg)');
      }
      if (times.length >= 5) {
        const variance = times.reduce((a,b) => a + Math.pow(b - avgMoveTime, 2), 0) / times.length;
        if (Math.sqrt(variance) < 100) {
          reasons.push('Suspiciously uniform move timing');
        }
      }
    }

    let suspicionLevel = 'clean';
    if (m.totalMoves >= MIN_MOVES_FOR_FLAG) {
      if (correlation > THRESHOLD_FLAG) {
        suspicionLevel = 'flag';
        reasons.push('Engine correlation ' + (correlation * 100).toFixed(1) + '% (threshold: ' + (THRESHOLD_FLAG * 100) + '%)');
      } else if (correlation > THRESHOLD_WATCH) {
        suspicionLevel = 'watch';
      }
    }

    return {
      player: playerIdx,
      avgMoveTimeMs: avgMoveTime,
      movesAnalysed: m.totalMoves,
      engineCorrelation: correlation,
      suspicionLevel,
      reasons
    };
  }

  // ── Show Fair Play Notice ─────────────────────────────────────────────────
  function showFairPlayNotice(playerIdx) {
    const noticeEl = document.getElementById('fairPlayNotice');
    const msgEl    = document.getElementById('fairPlayMsg');
    if (!noticeEl || !msgEl) return;
    const labels = ['Red', 'Blue', 'Green', 'Yellow'];
    msgEl.textContent = 'Unusual move accuracy detected for ' + labels[playerIdx] + '. Ensuring a fair game for everyone.';
    noticeEl.style.display = 'flex';
  }

  // ── Record Bot Move Comparison ────────────────────────────────────────────
  function compareMoveToBot(playerIdx, from, to, game) {
    ensurePlayer(playerIdx);
    const m = metrics[playerIdx];
    m.totalMoves++;
    try {
      if (globalThis.ChaturangaTieredBot) {
        const botMove = globalThis.ChaturangaTieredBot.getMove(game, 600);
        if (botMove && botMove.from === from && botMove.to === to) {
          m.botMatches++;
        }
      }
    } catch(e) {}
  }

  // ── Get Full Fair Play Report ─────────────────────────────────────────────
  function getFairPlayReport(game) {
    const report = [];
    for (let i = 0; i < 4; i++) {
      if (!game.players[i].isBot) {
        report.push(analysePlayer(i, game.seerData ? game.seerData.moveHistory : [], game));
      }
    }
    return report;
  }

  // ── Export Fair Play Log ──────────────────────────────────────────────────
  function exportFairPlayLog() {
    return JSON.stringify(metrics, null, 2);
  }

  // ── Reset for new game ────────────────────────────────────────────────────
  function reset() {
    Object.keys(metrics).forEach(k => delete metrics[k]);
    rateLimiter.lastMoveTime = {};
  }

  // ── Input Sanitisation ────────────────────────────────────────────────────
  function isValidSquare(sq) {
    return typeof sq === 'string' && /^[a-h][1-8]$/.test(sq);
  }

  function validateInputMove(game, from, to) {
    if (!isValidSquare(from) || !isValidSquare(to)) return false;
    const piece = game.board.get(from);
    if (!piece || piece.owner !== game.turnIndex) return false;
    const legal = game.getLegalMoves(from);
    if (!legal.includes(to)) return false;
    const fp = game.forcedPiece;
    if (fp && fp !== 'any') {
      if (fp === 'pawn-king') {
        if (piece.type !== 'pawn' && piece.type !== 'king') return false;
      } else {
        if (piece.type !== fp) return false;
      }
    }
    return true;
  }

  globalThis.ChaturangaAntiCheat = {
    rateLimiter,
    recordMoveTime,
    analysePlayer,
    compareMoveToBot,
    showFairPlayNotice,
    getFairPlayReport,
    exportFairPlayLog,
    validateInputMove,
    isValidSquare,
    reset
  };
})();
