/**
 * Chaturanga v1.0.4 — Seer Engine (Full Analytics)
 * window.ChaturangaSeer
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

  // ── Public API ─────────────────────────────────────────────────────────────
  globalThis.ChaturangaSeer = {
    detectTurningPoint,
    getInsightAnnotation,
    getMoveQuality,
    computeMaterialBalance,
    exportGameReport,
    saveGame,
    getVault,
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
