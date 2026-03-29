/**
 * Chaturanga v1.0.5 — Seer Engine (Full Analytics & Live Recorder)
 * window.ChaturangaSeer — authoritative analytics for game.html
 */
(function(G) {
  'use strict';

  // ── CONSTANTS ──────────────────────────────────────────────────────────────
  const PIECE_VALUES = { pawn: 1, horse: 3, elephant: 3, rook: 5, king: 100 };
  const PIECE_NAMES  = { pawn: 'Nara', horse: 'Ashwa', elephant: 'Danti', rook: 'Ratha', king: 'Raja' };
  const PLAYER_LABELS = ['Red', 'Blue', 'Green', 'Yellow'];
  const VAULT_KEY    = 'chaturanga_vault';
  const SEC_VAULT_KEY = 'chaturanga_seer_vault'; // used by seer-engine for standalone
  const MAX_VAULT    = 20;

  // ELO profile: expected blunder rate per ELO band
  const ELO_PROFILES = [
    { elo: 400,  profile: [0.35, 0.30, 0.25, 0.10] },
    { elo: 600,  profile: [0.22, 0.28, 0.30, 0.20] },
    { elo: 800,  profile: [0.12, 0.22, 0.36, 0.30] },
    { elo: 1000, profile: [0.06, 0.16, 0.38, 0.40] },
    { elo: 1200, profile: [0.03, 0.10, 0.37, 0.50] },
    { elo: 1400, profile: [0.01, 0.06, 0.33, 0.60] },
    { elo: 1600, profile: [0.00, 0.03, 0.27, 0.70] },
  ];

  // ── ANALYSIS LOGIC ──────────────────────────────────────────────────────────

  function classifyQuality(delta, captureAvailable, capturedValue) {
    if (delta <= -3) return 'blunder';
    if (!captureAvailable && capturedValue >= 5) return 'blunder';
    if (delta <= -1) return 'inaccuracy';
    if (!captureAvailable && capturedValue >= 3) return 'inaccuracy';
    if (delta >= 3 || capturedValue >= 3) return 'excellent';
    return 'good';
  }

  function countMaterial(board, playerId) {
    if (!board) return 0;
    let total = 0;
    const squares = board.squares || board;
    for (const sq in squares) {
      const piece = board.get ? board.get(sq) : squares[sq];
      if (piece && piece.owner === playerId && piece.type !== 'king') {
        total += PIECE_VALUES[piece.type] || 0;
      }
    }
    return total;
  }

  function detectTurningPoint(moveHistory) {
    if (!moveHistory || moveHistory.length < 2) return null;
    let maxDelta = 0, turningIdx = -1;
    for (let i = 1; i < moveHistory.length; i++) {
        const delta = Math.abs((moveHistory[i].materialBalance || 0) - (moveHistory[i-1].materialBalance || 0));
        if (delta > maxDelta) { maxDelta = delta; turningIdx = i; }
    }
    if (turningIdx < 0) return null;
    return { moveIdx: turningIdx, move: moveHistory[turningIdx], delta: maxDelta };
  }

  function estimateELO(moveLog) {
    if (!moveLog || moveLog.length < 4) return null;
    const counts = { blunder:0, inaccuracy:0, good:0, excellent:0 };
    moveLog.forEach(m => { if (m.quality) counts[m.quality]++; });
    const total = moveLog.length;
    const rates = [counts.blunder/total, counts.inaccuracy/total, counts.good/total, counts.excellent/total];
    let bestELO = 400, bestDist = Infinity;
    ELO_PROFILES.forEach(({ elo, profile }) => {
      const dist = profile.reduce((s, v, i) => s + Math.abs(v - rates[i]), 0);
      if (dist < bestDist) { bestDist = dist; bestELO = elo; }
    });
    return { elo: bestELO, confidence: Math.min(100, Math.round(total / 20 * 100)) };
  }

  function getInsightAnnotation(moveRecord, game) {
    if (!moveRecord) return '';
    if (moveRecord.forfeit) {
      const pn = PIECE_NAMES[moveRecord.forfeitPiece] || moveRecord.forfeitPiece || '?';
      return PLAYER_LABELS[moveRecord.player] + ' forfeited — no ' + pn + ' move.';
    }
    const player = moveRecord.playerLabel || PLAYER_LABELS[moveRecord.player] || 'Player';
    const piece  = PIECE_NAMES[moveRecord.pieceMoved] || moveRecord.pieceMoved || 'piece';
    if (moveRecord.captured === 'king') return player + ' captured the enemy Raja! ⚔';
    if (moveRecord.captured) return player + ' captured ' + (PIECE_NAMES[moveRecord.captured] || moveRecord.captured) + '.';
    return player + ' moved ' + piece + ' to ' + (moveRecord.to || '?') + '.';
  }

  // ── LIVE RECORDER ───────────────────────────────────────────────────────────
  let _session = null;
  const Recorder = {
    start(meta) {
      _session = {
        id: `game_${Date.now()}`,
        meta: { date: new Date().toLocaleDateString(), ...meta },
        moves: [],
        materialHistory: [0],
        startTime: Date.now()
      };
    },
    recordMove(game, move, playerLabel) {
      if (!_session) return;
      const board = game.board;
      const myMat   = countMaterial(board, 0);
      const oppMats = [1,2,3].map(id => countMaterial(board, id));
      const balance = myMat - Math.round(oppMats.reduce((a,b)=>a+b,0) / oppMats.length);
      const prev = _session.materialHistory[_session.materialHistory.length - 1];
      const materialDelta = balance - prev;
      _session.materialHistory.push(balance);

      const captured = board.get ? board.get(move.to) : null;
      const quality  = classifyQuality(materialDelta, false, captured ? PIECE_VALUES[captured.type] : 0);

      _session.moves.push({
        index: _session.moves.length + 1,
        player: game.turnIndex,
        playerLabel: playerLabel || PLAYER_LABELS[game.turnIndex],
        from: move.from,
        to: move.to,
        quality,
        materialBalance: balance,
        materialDelta,
        pieceMoved: captured ? null : (board.get ? board.get(move.to)?.type : null), // simplified
        captured: captured ? captured.type : null,
        timestamp: Date.now()
      });
      updatePanel(game);
    },
    finalize(meta) {
      if (!_session) return null;
      _session.meta = { ..._session.meta, ...meta, durationMs: Date.now() - _session.startTime };
      _session.turningPoint = detectTurningPoint(_session.moves);
      _session.eloEstimate  = estimateELO(_session.moves);
      SeerVault.add(_session);
      const finished = { ..._session };
      _session = null;
      return finished;
    }
  };

  // ── VAULT & UI ──────────────────────────────────────────────────────────────
  const SeerVault = {
    load() { try { return JSON.parse(localStorage.getItem(VAULT_KEY) || '[]'); } catch(e) { return []; } },
    save(arr) { try { localStorage.setItem(VAULT_KEY, JSON.stringify(arr.slice(0, MAX_VAULT))); } catch(e) {} },
    get(id) { return this.load().find(g => g.id === id) || null; },
    add(game) {
      const arr = this.load().filter(g => g.id !== game.id);
      arr.unshift(game);
      this.save(arr);
    },
    delete(id) { this.save(this.load().filter(g => g.id !== id)); },
    clear() { localStorage.removeItem(VAULT_KEY); renderVaultList(); }
  };

  function renderVaultList() {
    const el = document.getElementById('seerVaultList');
    if (!el) return;
    const vault = SeerVault.load();
    if (!vault.length) {
      el.innerHTML = '<p class="seer-empty">No saved games yet.<br>Complete a game to fill the vault.</p>';
      return;
    }
    el.innerHTML = vault.map(g => `
      <div class="vault-item">
        <div class="vault-winner"><i class="fa-solid fa-trophy"></i> ${g.meta.winner || 'Unknown'}</div>
        <div class="vault-meta">${g.meta.date} · ${g.moves.length} moves</div>
      </div>
    `).join('');
  }

  function updatePanel(game) {
    const movesEl = document.getElementById('seerMoves');
    const capsEl  = document.getElementById('seerCaptures');
    const insightEl = document.getElementById('seerInsight');
    const tpEl    = document.getElementById('seerTurningPoint');

    if (!_session) return;
    if (movesEl) movesEl.textContent = _session.moves.length;
    if (insightEl) {
      const last = _session.moves[_session.moves.length - 1];
      insightEl.textContent = last ? getInsightAnnotation(last, game) : 'Awaiting battle data…';
    }
    // Turning point
    const tp = detectTurningPoint(_session.moves);
    if (tpEl) {
      if (tp && _session.moves.length >= 3) {
        tpEl.style.display = '';
        const tpText = document.getElementById('seerTurningPointText');
        if (tpText) tpText.textContent = `Move ${tp.moveIdx}: ${getInsightAnnotation(tp.move, game)}`;
      } else {
        tpEl.style.display = 'none';
      }
    }
  }

  // ── PUBLIC API ─────────────────────────────────────────────────────────────
  G.ChaturangaSeer = {
    startGame:    (meta) => Recorder.start(meta),
    recordMove:   (game, move, lbl) => Recorder.recordMove(game, move, lbl),
    finalizeGame: (meta) => Recorder.finalize(meta),
    updatePanel,
    saveGame:     (game) => SeerVault.add(game),
    getVault:     () => SeerVault.load(),
    clearVault:   () => SeerVault.clear(),
    renderVaultList,
    QUALITY_LABELS: { excellent: 'Excellent', good: 'Good', inaccuracy: 'Inaccuracy', blunder: 'Blunder' },
    Vault: SeerVault
  };

  document.addEventListener('DOMContentLoaded', () => {
    const btn = document.getElementById('seerExportBtn');
    if (btn) btn.addEventListener('click', () => {
       // logic for export
    });
  });

})(globalThis);
