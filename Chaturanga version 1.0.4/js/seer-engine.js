/**
 * Chaturanga — Seer Engine v1.0.4
 * Post-game and live analysis: move quality, ELO estimation,
 * turning point detection, position insight, game vault.
 *
 * Usage (in game.js, after each move):
 *   ChaturangaSeer.recordMove(game, move, playerLabel);
 *   ChaturangaSeer.finalizeGame(metadata);   // at game end
 */
(function (G) {
  'use strict';

  const STORAGE_KEY = 'chaturanga_seer_vault';
  const MAX_VAULT   = 50;

  // ── Piece values ────────────────────────────────────────────────────────────
  const PV = { pawn:1, horse:3, elephant:3, rook:5, king:100 };

  // ── ELO profile: expected blunder rate per ELO band ─────────────────────────
  // [blunder%, inaccuracy%, good%, excellent%]
  const ELO_PROFILES = [
    { elo: 400,  profile: [0.35, 0.30, 0.25, 0.10] },
    { elo: 600,  profile: [0.22, 0.28, 0.30, 0.20] },
    { elo: 800,  profile: [0.12, 0.22, 0.36, 0.30] },
    { elo: 1000, profile: [0.06, 0.16, 0.38, 0.40] },
    { elo: 1200, profile: [0.03, 0.10, 0.37, 0.50] },
    { elo: 1400, profile: [0.01, 0.06, 0.33, 0.60] },
    { elo: 1600, profile: [0.00, 0.03, 0.27, 0.70] },
  ];

  // ── Move quality thresholds (centipawn-equivalent) ───────────────────────────
  // delta = materialAfter - materialBefore (from mover's perspective)
  function classifyQuality(delta, captureAvailable, capturedValue) {
    // Blunder: lost a piece for nothing, or missed a free capture of rook/king
    if (delta <= -3)                                    return 'blunder';
    if (!captureAvailable && capturedValue >= 5)        return 'blunder'; // missed winning capture
    // Inaccuracy: small material loss or missed good capture
    if (delta <= -1)                                    return 'inaccuracy';
    if (!captureAvailable && capturedValue >= 3)        return 'inaccuracy';
    // Excellent: won material or created fork/pin/threat
    if (delta >= 3)                                     return 'excellent';
    if (capturedValue >= 3)                             return 'excellent';
    // Good: everything else
    return 'good';
  }

  // ── Material count for a player ──────────────────────────────────────────────
  function countMaterial(board, playerId) {
    let total = 0;
    board.forEach((piece, sq) => {
      if (piece && piece.owner === playerId && piece.type !== 'king') {
        total += PV[piece.type] || 0;
      }
    });
    return total;
  }

  function totalMaterial(board) {
    let total = 0;
    board.forEach((piece) => {
      if (piece && piece.type !== 'king') total += PV[piece.type] || 0;
    });
    return total;
  }

  // ── Position analysis: advantages & disadvantages ───────────────────────────
  function analyzePosition(game, move, quality) {
    const advantages = [];
    const disadvantages = [];
    const board = game.board;
    const playerId = game.turnIndex; // mover

    // Material balance
    const myMat  = countMaterial(board, playerId);
    const totMat = totalMaterial(board);
    const alive  = game.players ? game.players.filter(p => !p.eliminated).length : 4;
    const avgMat = totMat / alive;
    if (myMat > avgMat + 4)       advantages.push('Material advantage — you have more pieces than average');
    else if (myMat < avgMat - 4)  disadvantages.push('Material deficit — you have fewer pieces than opponents');

    // Open file detection (for rooks)
    const piece = board.get ? board.get(move.from) : board[move.from];
    if (piece && piece.type === 'rook') {
      const file = move.to[0];
      let open = true;
      for (let r = 1; r <= 8; r++) {
        const sq = file + r;
        const p  = board.get ? board.get(sq) : board[sq];
        if (p && p.type === 'pawn') { open = false; break; }
      }
      if (open) advantages.push('Ratha on open file — maximum sliding power activated');
    }

    // King safety heuristic
    if (piece && piece.type === 'king') {
      const r = parseInt(move.to[1]);
      const f = move.to.charCodeAt(0) - 97;
      const inCentre = f >= 2 && f <= 5 && r >= 3 && r <= 6;
      if (inCentre) advantages.push('Raja active in centre — endgame king leads from front');
      else          disadvantages.push('Raja moved — ensure escape squares exist for dice-6 rolls');
    }

    // Capture quality
    const captured = board.get ? board.get(move.to) : board[move.to];
    if (captured && captured.owner !== playerId) {
      const val = PV[captured.type] || 0;
      if (val >= 5)       advantages.push(`Ratha captured (${val} pts) — decisive material gain`);
      else if (val >= 3)  advantages.push(`Minor piece captured (${val} pts) — solid trade`);
      else if (val === 1) advantages.push('Pawn captured — small but steady material gain');
    }

    // Quality-based insights
    if (quality === 'blunder')     disadvantages.push('This move loses significant material or misses a winning capture');
    if (quality === 'inaccuracy')  disadvantages.push('Slight imprecision — a stronger option was available');
    if (quality === 'excellent')   advantages.push('Excellent move — optimal play for this position');

    // Pawn advancement
    if (piece && piece.type === 'pawn') {
      const rank = parseInt(move.to[1]);
      const owner = piece.owner;
      const advancement = owner === 0 ? rank : owner === 2 ? 9-rank : 0;
      if (advancement >= 6) advantages.push('Nara close to promotion — protect and advance');
    }

    // Centre control
    const centreSqs = ['d4','d5','e4','e5'];
    if (centreSqs.includes(move.to)) advantages.push('Central square occupied — maximum piece influence');

    return {
      advantages:    advantages.slice(0,3),
      disadvantages: disadvantages.slice(0,3)
    };
  }

  // ── Turning point ────────────────────────────────────────────────────────────
  function detectTurningPoint(moveLog) {
    if (!moveLog || moveLog.length < 2) return null;
    let maxDelta = 0, turningIdx = -1;
    for (let i = 1; i < moveLog.length; i++) {
      const delta = Math.abs((moveLog[i].materialBalance || 0) - (moveLog[i-1].materialBalance || 0));
      if (delta > maxDelta) { maxDelta = delta; turningIdx = i; }
    }
    if (turningIdx < 0) return null;
    return { moveIdx: turningIdx, move: moveLog[turningIdx], delta: maxDelta };
  }

  // ── ELO estimation ───────────────────────────────────────────────────────────
  function estimateELO(moveLog) {
    if (!moveLog || moveLog.length < 4) return null;
    const counts = { blunder:0, inaccuracy:0, good:0, excellent:0 };
    moveLog.forEach(m => { if (m.quality) counts[m.quality]++; });
    const total = moveLog.length;
    const rates = [
      counts.blunder    / total,
      counts.inaccuracy / total,
      counts.good       / total,
      counts.excellent  / total,
    ];

    // Find closest ELO profile by L1 distance
    let bestELO = 400, bestDist = Infinity;
    ELO_PROFILES.forEach(({ elo, profile }) => {
      const dist = profile.reduce((s, v, i) => s + Math.abs(v - rates[i]), 0);
      if (dist < bestDist) { bestDist = dist; bestELO = elo; }
    });

    // Confidence: high if many moves, low if few
    const confidence = Math.min(100, Math.round(total / 20 * 100));

    return {
      elo: bestELO,
      confidence,
      counts,
      total,
      rates: { blunder: rates[0], inaccuracy: rates[1], good: rates[2], excellent: rates[3] }
    };
  }

  // ── Markdown export ──────────────────────────────────────────────────────────
  function exportMarkdown(game) {
    const meta  = game.meta  || {};
    const moves = game.moves || [];
    const tp    = detectTurningPoint(moves);
    const eloEst = estimateELO(moves);

    const qIcon = { excellent:'★', good:'·', inaccuracy:'?', blunder:'!!' };
    const qLabel = { excellent:'Excellent', good:'Good', inaccuracy:'Inaccuracy', blunder:'Blunder' };

    const lines = [
      `# Chaturanga Game Analysis`,
      `**Date:** ${meta.date || new Date().toLocaleDateString()}`,
      `**Format:** ${meta.format || 'Standard 4-player'}`,
      `**Winner:** ${meta.winner || '—'}`,
      `**Total moves:** ${moves.length}`,
      ``,
      `---`,
      ``,
      `## ELO Estimate`,
    ];

    if (eloEst) {
      lines.push(`**Estimated ELO:** ${eloEst.elo} (confidence: ${eloEst.confidence}%)`);
      lines.push(`| Quality | Count | Rate |`);
      lines.push(`|---------|-------|------|`);
      lines.push(`| ★ Excellent  | ${eloEst.counts.excellent}  | ${Math.round(eloEst.rates.excellent*100)}% |`);
      lines.push(`| · Good       | ${eloEst.counts.good}       | ${Math.round(eloEst.rates.good*100)}% |`);
      lines.push(`| ? Inaccuracy | ${eloEst.counts.inaccuracy} | ${Math.round(eloEst.rates.inaccuracy*100)}% |`);
      lines.push(`| !! Blunder   | ${eloEst.counts.blunder}    | ${Math.round(eloEst.rates.blunder*100)}% |`);
    } else {
      lines.push('_Not enough moves to estimate ELO._');
    }

    lines.push('', '---', '', '## Turning Point');
    if (tp) {
      const m = tp.move;
      lines.push(`**Move ${tp.moveIdx}** — ${m.player}: ${m.from}→${m.to}`);
      lines.push(`Material swing: **${tp.delta} points**`);
      lines.push(`_${m.annotation || 'Decisive moment of the game.'}_`);
    } else {
      lines.push('_No dramatic turning point detected._');
    }

    lines.push('', '---', '', '## Move Log');
    lines.push('| # | Player | Move | Quality | Material Δ | Notes |');
    lines.push('|---|--------|------|---------|-----------|-------|');
    moves.forEach((m, i) => {
      const icon = qIcon[m.quality] || '·';
      const label = qLabel[m.quality] || 'Good';
      const delta = m.materialDelta !== undefined ? (m.materialDelta >= 0 ? `+${m.materialDelta}` : `${m.materialDelta}`) : '—';
      const notes = (m.advantages||[]).concat(m.disadvantages||[]).join('; ').substring(0,60);
      lines.push(`| ${i+1} | ${m.player||'?'} | ${m.from}→${m.to} | ${icon} ${label} | ${delta} | ${notes} |`);
    });

    lines.push('', '---', '', `_Generated by Chaturanga Seer Engine v1.0.4_`);
    return lines.join('\n');
  }

  // ── Vault (localStorage) ─────────────────────────────────────────────────────
  const Vault = {
    load() {
      try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || '[]'); }
      catch(e) { return []; }
    },
    save(games) {
      try { localStorage.setItem(STORAGE_KEY, JSON.stringify(games.slice(0, MAX_VAULT))); }
      catch(e) {}
    },
    add(game) {
      const games = this.load();
      games.unshift({ ...game, savedAt: Date.now() });
      this.save(games);
    },
    get(id) { return this.load().find(g => g.id === id) || null; },
    delete(id) {
      const games = this.load().filter(g => g.id !== id);
      this.save(games);
    },
    clear() { localStorage.removeItem(STORAGE_KEY); }
  };

  // ── Live recorder (used inside game.html) ────────────────────────────────────
  let _session = null;

  const Recorder = {
    start(meta) {
      _session = {
        id:    `game_${Date.now()}`,
        meta:  { date: new Date().toLocaleDateString(), ...meta },
        moves: [],
        materialHistory: [0],
        startTime: Date.now()
      };
    },

    recordMove(game, move, playerLabel) {
      if (!_session) return;
      const board = game.board;
      // Material balance from player 0's perspective
      const myMat   = countMaterial(board, 0);
      const oppMats = [1,2,3].map(id => countMaterial(board, id));
      const balance = myMat - Math.round(oppMats.reduce((a,b)=>a+b,0) / oppMats.length);

      // What was captured?
      const captured = board.get ? board.get(move.to) : null;
      const capVal   = captured ? (PV[captured.type] || 0) : 0;

      // Best capture available (simplified: scan for any capturable piece)
      let bestAvailCap = 0;
      if (board.forEach) {
        board.forEach((p, sq) => {
          if (p && p.owner !== 0 && p.type !== 'king') {
            bestAvailCap = Math.max(bestAvailCap, PV[p.type]||0);
          }
        });
      }

      // Material delta vs previous move
      const prev = _session.materialHistory[_session.materialHistory.length - 1];
      const materialDelta = balance - prev;
      _session.materialHistory.push(balance);

      const quality  = classifyQuality(materialDelta, bestAvailCap > 0, bestAvailCap);
      const analysis = analyzePosition(game, move, quality);

      _session.moves.push({
        index:          _session.moves.length + 1,
        player:         playerLabel || `Player ${game.turnIndex}`,
        from:           move.from,
        to:             move.to,
        dice:           game.lastDice,
        quality,
        materialBalance: balance,
        materialDelta,
        advantages:     analysis.advantages,
        disadvantages:  analysis.disadvantages,
        timestamp:      Date.now()
      });
    },

    finalize(meta) {
      if (!_session) return null;
      _session.meta = { ..._session.meta, ...meta, durationMs: Date.now() - _session.startTime };
      _session.turningPoint = detectTurningPoint(_session.moves);
      _session.eloEstimate  = estimateELO(_session.moves);
      Vault.add(_session);
      const finished = { ..._session };
      _session = null;
      return finished;
    },

    getSession() { return _session; }
  };

  // ── Public API ────────────────────────────────────────────────────────────────
  G.ChaturangaSeer = {
    // Live recording
    startGame:    (meta)             => Recorder.start(meta),
    recordMove:   (game, move, lbl)  => Recorder.recordMove(game, move, lbl),
    finalizeGame: (meta)             => Recorder.finalize(meta),
    getSession:   ()                 => Recorder.getSession(),

    // Analysis
    analyzePosition,
    detectTurningPoint,
    estimateELO,
    classifyQuality,
    exportMarkdown,

    // Vault
    Vault,

    // Helpers
    countMaterial,
    QUALITY_COLORS: {
      excellent:  '#4ade80',
      good:       '#60a5fa',
      inaccuracy: '#fbbf24',
      blunder:    '#f87171'
    },
    QUALITY_LABELS: {
      excellent: '★ Excellent',
      good:      '· Good',
      inaccuracy:'? Inaccuracy',
      blunder:   '!! Blunder'
    }
  };

})(window);
