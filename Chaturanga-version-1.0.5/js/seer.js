/**
 * Chaturanga v1.0.5 — Seer Engine (Full Analytics)
 * window.ChaturangaSeer — includes Vault API, estimateELO, QUALITY_LABELS, exportMarkdown
 *
 * BUG-010 CLARIFICATION: This is the AUTHORITATIVE seer file for game.html.
 * ───────────────────────────────────────────────────────────────
 * - game.html loads: js/seer.js  (this file — v1.0.5 live + vault API)
 * - seer.html loads:  js/seer-engine.js  (v1.0.4 standalone analytics page)
 * Do NOT merge or replace one with the other. They serve different pages.
 * ───────────────────────────────────────────────────────────────
 */
(function() {
  'use strict';

  const PIECE_VALUES = { pawn: 1, horse: 3, elephant: 3, rook: 5, king: 100 };
  const PIECE_NAMES  = { pawn: 'Nara', horse: 'Ashwa', elephant: 'Danti', rook: 'Ratha', king: 'Raja' };
  const PLAYER_LABELS = ['Red', 'Blue', 'Green', 'Yellow'];
  const VAULT_KEY = 'chaturanga_vault';
  const MAX_VAULT = 20;

  // ── Turning Point Detection ────────────────────────────────────────────────
  function detectTurningPoint(moveHistory) {
    if (!moveHistory || moveHistory.length < 3) return null;
    let maxDelta = 0, turningMove = null;
    for (let i = 1; i < moveHistory.length; i++) {
      const prev = moveHistory[i - 1];
      const curr = moveHistory[i];
      const delta = Math.abs((curr.materialBalanceAfter || 0) - (prev.materialBalanceAfter || 0));
      if (delta > maxDelta) { maxDelta = delta; turningMove = curr; }
    }
    return turningMove;
  }

  // ── Insight Annotation ────────────────────────────────────────────────────
  function getInsightAnnotation(moveRecord, game) {
    if (!moveRecord) return '';
    if (moveRecord.forfeit) {
      const pn = PIECE_NAMES[moveRecord.forfeitPiece] || moveRecord.forfeitPiece || '?';
      return PLAYER_LABELS[moveRecord.player] + ' forfeited — no ' + pn + ' move.';
    }
    if (!moveRecord.pieceMoved) return '';

    const player = PLAYER_LABELS[moveRecord.player] || 'Player';
    const piece  = PIECE_NAMES[moveRecord.pieceMoved] || moveRecord.pieceMoved;

    if (moveRecord.captured === 'king') {
      return player + ' captured the enemy Raja! ⚔';
    }
    if (moveRecord.captured === 'rook') {
      return player + ' captured a Ratha! (+5 pts)';
    }
    if (moveRecord.captured && moveRecord.capturedMoveNum === 1) {
      return 'First blood! ' + player + ' made the opening strike.';
    }
    if (moveRecord.captured) {
      const cap = PIECE_NAMES[moveRecord.captured] || moveRecord.captured;
      return player + ' captured ' + cap + '.';
    }
    if (moveRecord.pieceMoved === 'king') {
      return player + '\'s Raja repositions on the Ashtāpada.';
    }
    if (moveRecord.pieceMoved === 'pawn') {
      return player + '\'s Nara advances steadily.';
    }
    return player + ' moves ' + piece + ' to ' + moveRecord.to + '.';
  }

  // ── Material Balance ───────────────────────────────────────────────────────
  function computeMaterialBalance(game, playerId) {
    const myTeam = game.players[playerId].team;
    let balance = 0;
    for (let r = 1; r <= 8; r++) {
      for (let f = 0; f < 8; f++) {
        const sq = String.fromCharCode(97 + f) + r;
        const piece = game.board ? game.board.get(sq) : null;
        if (!piece) continue;
        const val = (piece.type === 'king') ? 0 : (PIECE_VALUES[piece.type] || 0);
        const isAlly = game.gameMode === 'team'
          ? game.players[piece.owner].team === myTeam
          : piece.owner === playerId;
        balance += isAlly ? val : -val;
      }
    }
    return balance;
  }

  // ── Move Quality ───────────────────────────────────────────────────────────
  function getMoveQuality(delta) {
    const d = Math.abs(delta);
    if (d <= 0.5) return 'excellent';
    if (d <= 2.0) return 'good';
    if (d <= 5.0) return 'inaccuracy';
    return 'blunder';
  }

  // ── Export Report ──────────────────────────────────────────────────────────
  function exportGameReport(game) {
    const sd      = game.seerData;
    const date    = new Date().toLocaleString();
    const moves   = sd ? sd.moveHistory.length : 0;
    const caps    = sd ? sd.captureCount : 0;
    const tp      = sd ? detectTurningPoint(sd.moveHistory) : null;

    let md = '# Chaturanga Game Report — ' + date + '\n\n';
    md += '## Summary\n';
    md += '- Moves played: ' + moves + '\n';
    md += '- Pieces captured: ' + caps + '\n';
    md += '- Game mode: ' + (game.gameMode || 'team') + '\n\n';

    if (tp) {
      md += '## Turning Point\n';
      md += 'Move ' + (tp.moveNumber || '?') + ': ' + getInsightAnnotation(tp, game) + '\n';
      md += 'Material balance shifted by ' + Math.abs(tp.materialBalanceAfter || 0) + ' points.\n\n';
    }

    if (sd && sd.pieceCaptureCounts) {
      const sorted = Object.entries(sd.pieceCaptureCounts).sort((a,b) => b[1]-a[1]);
      if (sorted.length) {
        md += '## Most Hunted Piece\n';
        md += sorted[0][0] + ' (' + sorted[0][1] + ' captures)\n\n';
      }
    }

    md += '## Move Log\n';
    if (sd && sd.moveHistory.length) {
      sd.moveHistory.forEach((m, i) => {
        if (m.forfeit) {
          md += (i+1) + '. ' + (PLAYER_LABELS[m.player]||'?') + ': Forfeit\n';
        } else {
          md += (i+1) + '. ' + (PLAYER_LABELS[m.player]||'?') + ': ' + (m.from||'') + '→' + (m.to||'') + (m.captured ? ' ×'+m.captured : '') + '\n';
        }
      });
    } else {
      md += 'No moves recorded.\n';
    }

    return md;
  }

  // ── Vault ──────────────────────────────────────────────────────────────────
  function saveGame(game) {
    if (!game.seerData) return;
    const tp = detectTurningPoint(game.seerData.moveHistory);
    const entry = {
      date: new Date().toISOString(),
      winner: game.winner != null ? 'Team ' + (game.winner + 1) : (game.winnerPlayerId != null ? PLAYER_LABELS[game.winnerPlayerId] : 'Unknown'),
      totalMoves: game.seerData.moveHistory.length,
      turningPoint: tp ? getInsightAnnotation(tp, game) : null,
      materialBalance: game.seerData.materialBalance || [],
      captureCount: game.seerData.captureCount || 0
    };
    let vault = [];
    try { vault = JSON.parse(localStorage.getItem(VAULT_KEY) || '[]'); } catch(e) {}
    vault.unshift(entry);
    if (vault.length > MAX_VAULT) vault.length = MAX_VAULT;
    localStorage.setItem(VAULT_KEY, JSON.stringify(vault));
  }

  function getVault() {
    try { return JSON.parse(localStorage.getItem(VAULT_KEY) || '[]'); } catch(e) { return []; }
  }

  function clearVault() {
    localStorage.removeItem(VAULT_KEY);
    renderVaultList();
  }

  function renderVaultList() {
    const el = document.getElementById('seerVaultList');
    if (!el) return;
    const vault = getVault();
    if (!vault.length) {
      el.innerHTML = '<p class="seer-empty">No saved games yet.<br>Complete a game to fill the vault.</p>';
      return;
    }
    el.innerHTML = vault.map((g, i) =>
      '<div class="vault-item">' +
        '<div class="vault-winner"><i class="fa-solid fa-trophy"></i> ' + (g.winner || '?') + '</div>' +
        '<div class="vault-meta">' + new Date(g.date).toLocaleDateString() + ' · ' + g.totalMoves + ' moves · ' + g.captureCount + ' captures</div>' +
        (g.turningPoint ? '<div class="vault-tp"><i class="fa-solid fa-bolt"></i> ' + g.turningPoint + '</div>' : '') +
      '</div>'
    ).join('');
  }

  // ── Update Panel ───────────────────────────────────────────────────────────
  function updatePanel(game) {
    const sd = game.seerData;
    if (!sd) return;

    const movesEl   = document.getElementById('seerMoves');
    const capsEl    = document.getElementById('seerCaptures');
    const matEl     = document.getElementById('seerMaterial');
    const topEl     = document.getElementById('seerTopPiece');
    const insightEl = document.getElementById('seerInsight');
    const tpEl      = document.getElementById('seerTurningPoint');
    const tpTextEl  = document.getElementById('seerTurningPointText');
    const exportBtn = document.getElementById('seerExportBtn');

    if (movesEl) movesEl.textContent = sd.moveHistory.length;
    if (capsEl)  capsEl.textContent  = sd.captureCount || 0;

    // Material balance
    const matBal = computeMaterialBalance(game, 0);
    if (matEl) {
      matEl.textContent = (matBal >= 0 ? '+' : '') + matBal;
      matEl.style.color = matBal > 0 ? '#4ade80' : matBal < 0 ? '#f87171' : 'var(--gold)';
    }

    // Most hunted
    if (topEl) {
      const counts = sd.pieceCaptureCounts || {};
      const sorted = Object.entries(counts).sort((a,b) => b[1]-a[1]);
      topEl.textContent = sorted.length ? (PIECE_NAMES[sorted[0][0]] || sorted[0][0]) : '—';
    }

    // Insight
    const lastMove = sd.moveHistory[sd.moveHistory.length - 1];
    if (insightEl) {
      if (sd.moveHistory.length === 0) {
        insightEl.textContent = 'Awaiting battle data…';
      } else {
        insightEl.textContent = getInsightAnnotation(lastMove, game);
      }
    }

    // Turning point
    const tp = detectTurningPoint(sd.moveHistory);
    if (tpEl && tpTextEl) {
      if (tp && sd.moveHistory.length >= 3) {
        tpEl.style.display = '';
        tpTextEl.textContent = 'Move ' + (tp.moveNumber || '?') + ': ' + getInsightAnnotation(tp, game);
      } else {
        tpEl.style.display = 'none';
      }
    }

    if (exportBtn) exportBtn.style.display = sd.moveHistory.length > 0 ? '' : 'none';
  }

  // ── Vault API (structured for seer.html) ──────────────────────────────────
  // seer.html expects: S().Vault.load(), .get(id), .add(game), .delete(id)
  // Games are stored as full objects keyed by id inside a single localStorage array.
  const SeerVault = {
    _load() {
      try { return JSON.parse(localStorage.getItem(VAULT_KEY) || '[]'); } catch(e) { return []; }
    },
    _save(arr) {
      try { localStorage.setItem(VAULT_KEY, JSON.stringify(arr.slice(0, MAX_VAULT))); } catch(e) {}
    },
    load()    { return this._load(); },
    get(id)   { return this._load().find(g => g.id === id) || null; },
    add(game) {
      const arr = this._load().filter(g => g.id !== game.id);
      arr.unshift(game);
      this._save(arr);
    },
    delete(id) {
      this._save(this._load().filter(g => g.id !== id));
    }
  };

  // ── ELO Estimator ─────────────────────────────────────────────────────────
  // Estimates player ELO from move quality distribution.
  // Returns { elo, confidence } or null if not enough data.
  function estimateELO(moves) {
    if (!moves || moves.length < 5) return null;
    const counts = { excellent: 0, good: 0, inaccuracy: 0, blunder: 0 };
    moves.forEach(m => { if (m.quality && counts[m.quality] !== undefined) counts[m.quality]++; });
    const total = counts.excellent + counts.good + counts.inaccuracy + counts.blunder;
    if (total === 0) return null;
    // Weighted score 0–100
    const score = (counts.excellent * 3 + counts.good * 2 - counts.inaccuracy * 1 - counts.blunder * 3) / total;
    // Map to ELO range 400–1600
    const elo = Math.round(400 + Math.max(0, Math.min(1, (score + 3) / 6)) * 1200);
    const confidence = Math.min(95, Math.round(40 + total * 2));
    return { elo, confidence };
  }

  // ── Quality Labels ─────────────────────────────────────────────────────────
  const QUALITY_LABELS = {
    excellent:  'Excellent — best or near-best move',
    good:       'Good — solid, no significant error',
    inaccuracy: 'Inaccuracy — a stronger option existed',
    blunder:    'Blunder — serious error, loses material or position'
  };

  // ── Markdown Export ────────────────────────────────────────────────────────
  function exportMarkdown(game) {
    if (!game) return '';
    const moves  = game.moves || [];
    const meta   = game.meta  || {};
    const tp     = game.turningPoint;
    const eloEst = game.eloEstimate;
    const date   = meta.date || new Date().toLocaleString();

    let md = `# Chaturanga — Game Analysis\n`;
    md += `**Date:** ${date}  \n`;
    md += `**Format:** ${meta.format || 'Standard'}  \n`;
    md += `**Winner:** ${meta.winner || 'Unknown'}  \n`;
    md += `**Moves played:** ${moves.length}\n\n`;

    if (eloEst) {
      md += `## Estimated ELO\n`;
      md += `**${eloEst.elo}** (${eloEst.confidence}% confidence)\n\n`;
    }

    if (tp) {
      md += `## Turning Point\n`;
      md += `Move ${tp.index || '?'}: ${tp.player || '?'} — ${tp.from || '?'} → ${tp.to || '?'}  \n`;
      if (tp.quality) md += `Quality: ${tp.quality}  \n`;
      md += '\n';
    }

    const counts = { excellent:0, good:0, inaccuracy:0, blunder:0 };
    moves.forEach(m => { if (m.quality && counts[m.quality] !== undefined) counts[m.quality]++; });
    md += `## Move Quality Summary\n`;
    md += `- Excellent: ${counts.excellent}\n`;
    md += `- Good: ${counts.good}\n`;
    md += `- Inaccuracy: ${counts.inaccuracy}\n`;
    md += `- Blunder: ${counts.blunder}\n\n`;

    md += `## Move Log\n`;
    moves.forEach((m, i) => {
      const q = m.quality ? ` [${m.quality}]` : '';
      md += `${i + 1}. ${m.player || '?'}: ${m.from || '?'} → ${m.to || '?'}${q}\n`;
    });

    return md;
  }

  // ── Public API ─────────────────────────────────────────────────────────────
  globalThis.ChaturangaSeer = {
    detectTurningPoint,
    getInsightAnnotation,
    getMoveQuality,
    computeMaterialBalance,
    exportGameReport,   // legacy (used by game.html export button)
    exportMarkdown,     // new (used by seer.html)
    estimateELO,
    QUALITY_LABELS,
    Vault: SeerVault,   // new structured API used by seer.html
    saveGame,           // legacy (called by ui.js after game ends)
    getVault,           // legacy
    clearVault,
    renderVaultList,
    updatePanel
  };

  // Export button listener (set up once DOM is ready)
  document.addEventListener('DOMContentLoaded', function() {
    const btn = document.getElementById('seerExportBtn');
    if (btn) {
      btn.addEventListener('click', function() {
        if (!globalThis._chaturangaGame) return;
        const md = exportGameReport(globalThis._chaturangaGame);
        const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
        const url  = URL.createObjectURL(blob);
        const a    = document.createElement('a');
        a.href = url;
        a.download = 'chaturanga_report_' + new Date().toISOString().slice(0,10) + '.md';
        document.body.appendChild(a); a.click(); a.remove();
        URL.revokeObjectURL(url);
      });
    }
  });
})();
