/**
 * Chaturanga v1.0.5 — Post-Game Seer Analysis
 * ═══════════════════════════════════════════════════════════════════
 *
 * DROP-IN FILE. Add ONE line to ui.js (line 13), then include this
 * script AFTER seer-engine.js in game.html:
 *
 *   ui.js  line 13:  const game = new globalThis.ChaturangaGame();
 *   ADD BELOW IT  →  globalThis._chaturangaGame = game;
 *
 *   game.html (after seer-engine.js):
 *   <script src="js/post-game-analysis.js"></script>
 *
 * That's it. No other changes needed.
 * ═══════════════════════════════════════════════════════════════════
 *
 * What this does:
 *   1. Intercepts game end (watches gameOverOverlay visibility)
 *   2. Analyses game.moveHistory for all 4 players
 *   3. Replaces the plain "Game Over" modal with a full analysis overlay:
 *        · Per-player accuracy bars
 *        · Move quality grid (Excellent / Good / Inaccuracy / Blunder)
 *        · Material gains table
 *        · Turning point callout
 *        · ELO estimate (via seer-engine.js if available)
 *        · Acharya Drona's in-character verdict
 *        · "Study This Game" → saves to vault + opens seer.html
 *        · "Play Again" button
 *   4. Records the game to ChaturangaSeer vault for seer.html replay
 */

(function () {
  'use strict';

  // ── Constants ─────────────────────────────────────────────────────────────
  const PV     = { pawn: 1, horse: 3, elephant: 3, rook: 5, king: 100 };
  const PNAMES = { pawn: 'Nara', horse: 'Ashwa', elephant: 'Danti', rook: 'Ratha', king: 'Raja' };
  const PLABELS  = ['Red', 'Blue', 'Green', 'Yellow'];
  const PCOLORS  = ['#e74c3c', '#60a5fa', '#4ade80', '#fbbf24'];
  const PTEAM    = ['Team 1', 'Team 2', 'Team 1', 'Team 2'];

  // Quality weights for accuracy score
  const Q_WEIGHT = { excellent: 1.0, good: 0.75, inaccuracy: 0.40, blunder: 0.05 };

  // ── Move classifier ───────────────────────────────────────────────────────
  // Works from game.moveHistory entries:
  // { from, to, piece, cap, playerId, forfeit, diceValue, pieceType, promoted }
  function classifyMove(m) {
    if (m.forfeit)                              return 'inaccuracy';
    if (!m.cap)  {
      if (m.pieceType === 'king')               return 'inaccuracy'; // moved raja without capturing
      return 'good';
    }
    const val = PV[m.cap.type] || 0;
    if (m.cap.type === 'king')                  return 'excellent';
    if (val >= 5)                               return 'excellent'; // rook
    if (val >= 3)                               return 'good';      // horse/elephant
    if (val === 1)                              return 'good';      // pawn
    return 'good';
  }

  // ── Per-player statistics ─────────────────────────────────────────────────
  function buildPlayerStats(moveHistory) {
    const stats = [0, 1, 2, 3].map(id => ({
      id,
      label: PLABELS[id],
      color: PCOLORS[id],
      moves: 0,
      forfeits: 0,
      materialGained: 0,
      promotions: 0,
      rajaCaptures: 0,
      qualities: { excellent: 0, good: 0, inaccuracy: 0, blunder: 0 },
      accuracy: 0,
    }));

    moveHistory.forEach(m => {
      const s = stats[m.playerId];
      if (!s) return;
      s.moves++;
      if (m.forfeit) { s.forfeits++; }
      if (m.promoted) { s.promotions++; }
      if (m.cap) {
        const val = PV[m.cap.type] || 0;
        if (m.cap.type !== 'king') s.materialGained += val;
        else s.rajaCaptures++;
      }
      const q = classifyMove(m);
      s.qualities[q]++;
    });

    stats.forEach(s => {
      if (s.moves === 0) { s.accuracy = 100; return; }
      let weightedSum = 0;
      Object.entries(s.qualities).forEach(([q, n]) => { weightedSum += n * (Q_WEIGHT[q] || 0); });
      s.accuracy = Math.round((weightedSum / s.moves) * 100);
    });

    return stats;
  }

  // ── Turning point from move history ──────────────────────────────────────
  // Scans for the single move that transferred the most material
  function findTurningPoint(moveHistory) {
    let best = null, bestVal = 0;
    moveHistory.forEach((m, i) => {
      if (!m.cap || m.forfeit) return;
      const val = PV[m.cap.type] || 0;
      if (val > bestVal) { bestVal = val; best = { move: m, idx: i }; }
    });
    return best;
  }

  // ── Drona verdicts ────────────────────────────────────────────────────────
  const DRONA_VERDICTS = [
    {
      min: 82,
      quote: 'Like Arjuna at Kurukshetra — every arrow found its mark. The Ashtāpada bows before such precision.',
      verse: '— Bhagavad Gita 1.14'
    },
    {
      min: 65,
      quote: 'You fought with the discipline of the Pandavas. Some moves missed their mark, yet the strategy held firm. Study your inaccuracies — they are the distance between good and great.',
      verse: '— Drona Parva, Mahabharata'
    },
    {
      min: 48,
      quote: 'The Arthashastra teaches: a general who sees the battlefield clearly wins before the first piece moves. Your vision wavered today. Return to the Akhara. Sharpen what is dull.',
      verse: '— Kautilya, Arthashastra Book IX'
    },
    {
      min: 0,
      quote: 'Even mighty Karna fell when his chariot wheel sank in the earth. The enemy exploited your blunders mercilessly. Meditate on the positions you abandoned. Defeat today is the seed of victory tomorrow.',
      verse: '— Karna Parva, Mahabharata'
    }
  ];

  function getDronaVerdict(avgAccuracy) {
    return DRONA_VERDICTS.find(v => avgAccuracy >= v.min) || DRONA_VERDICTS[DRONA_VERDICTS.length - 1];
  }

  // ── Winner label ──────────────────────────────────────────────────────────
  function getWinnerLabel(game) {
    if (game.gameMode === 'single' && game.winnerPlayerId != null) {
      return PLABELS[game.winnerPlayerId] + ' wins!';
    }
    if (game.winner != null) {
      return 'Team ' + (game.winner + 1) + ' wins the Ashtāpada!';
    }
    return 'Battle concluded.';
  }

  // ── Save to Seer vault ────────────────────────────────────────────────────
  function saveToVault(game, playerStats) {
    if (!globalThis.ChaturangaSeer?.Vault) return null;
    const moves = (game.moveHistory || []).map((m, i) => ({
      index:          i + 1,
      player:         PLABELS[m.playerId] || 'Unknown',
      from:           m.from || '—',
      to:             m.to   || '—',
      dice:           m.diceValue || '—',
      quality:        classifyMove(m),
      materialDelta:  m.cap ? (PV[m.cap.type] || 0) : 0,
      materialBalance: 0, // simplified
      advantages:     m.cap ? [`Captured ${PNAMES[m.cap.type] || m.cap.type}`] : [],
      disadvantages:  m.forfeit ? ['Turn forfeited — no legal move available'] : [],
    }));

    const gameRecord = {
      id:   'game_' + Date.now(),
      meta: {
        date:    new Date().toLocaleDateString(),
        winner:  getWinnerLabel(game),
        format:  game.gameMode === 'team' ? 'Team 2v2' : '4-Player FFA',
      },
      moves,
      turningPoint:  globalThis.ChaturangaSeer.detectTurningPoint?.(moves) || null,
      eloEstimate:   globalThis.ChaturangaSeer.estimateELO?.(moves) || null,
      savedAt:       Date.now(),
    };

    globalThis.ChaturangaSeer.Vault.add(gameRecord);
    return gameRecord.id;
  }

  // ── Inject CSS (once) ─────────────────────────────────────────────────────
  let cssInjected = false;
  function injectCSS() {
    if (cssInjected) return;
    cssInjected = true;
    const style = document.createElement('style');
    style.textContent = `
/* ── Post-Game Analysis Overlay ─────────────────────────────── */
#pgaOverlay {
  position:fixed;inset:0;z-index:9999;
  background:rgba(10,7,2,.92);
  display:flex;align-items:center;justify-content:center;
  padding:16px;
  animation: pgaFadeIn .35s ease;
}
@keyframes pgaFadeIn { from{opacity:0;transform:scale(.97)} to{opacity:1;transform:scale(1)} }

#pgaCard {
  background:linear-gradient(160deg,#1a1306 0%,#0f0c07 60%,#130e05 100%);
  border:1px solid rgba(201,168,76,.28);
  border-radius:14px;
  width:100%;max-width:780px;max-height:92vh;
  overflow-y:auto;
  box-shadow:0 0 60px rgba(201,168,76,.08),0 24px 60px rgba(0,0,0,.7);
  padding:28px 32px;
  font-family:'Outfit',sans-serif;
  color:#f5ead0;
}
#pgaCard::-webkit-scrollbar{width:4px}
#pgaCard::-webkit-scrollbar-track{background:transparent}
#pgaCard::-webkit-scrollbar-thumb{background:rgba(201,168,76,.2);border-radius:2px}

.pga-eyebrow {
  font-size:.68rem;letter-spacing:.14em;text-transform:uppercase;
  color:rgba(201,168,76,.6);margin-bottom:6px;
  display:flex;align-items:center;gap:6px;
}
.pga-title {
  font-family:'Cinzel',serif;font-size:1.6rem;color:#e8c96a;
  font-weight:600;line-height:1.2;margin-bottom:4px;
}
.pga-subtitle {
  font-size:.82rem;color:rgba(201,168,76,.5);margin-bottom:24px;
}
.pga-divider {
  border:none;border-top:1px solid rgba(201,168,76,.12);margin:20px 0;
}

/* Player accuracy bars */
.pga-players { display:flex;flex-direction:column;gap:10px; }
.pga-player-row {
  display:grid;grid-template-columns:70px 1fr 44px;
  align-items:center;gap:10px;
}
.pga-player-name { font-size:.78rem;font-weight:500; }
.pga-bar-track {
  height:8px;border-radius:4px;background:rgba(255,255,255,.06);
  overflow:hidden;
}
.pga-bar-fill {
  height:100%;border-radius:4px;
  transition:width .8s cubic-bezier(.4,0,.2,1);
}
.pga-pct { font-size:.75rem;color:rgba(201,168,76,.6);text-align:right; }

/* Quality grid */
.pga-quality-grid {
  display:grid;grid-template-columns:repeat(4,1fr);gap:8px;
}
.pga-q-cell {
  padding:12px 8px;border-radius:8px;text-align:center;
  border:1px solid transparent;
}
.pga-q-cell.excellent { background:rgba(74,222,128,.08);border-color:rgba(74,222,128,.15); }
.pga-q-cell.good      { background:rgba(96,165,250,.08);border-color:rgba(96,165,250,.15); }
.pga-q-cell.inaccuracy{ background:rgba(251,191,36,.08);border-color:rgba(251,191,36,.15); }
.pga-q-cell.blunder   { background:rgba(248,113,113,.08);border-color:rgba(248,113,113,.15); }
.pga-q-num  { font-family:'Cinzel',serif;font-size:1.5rem;font-weight:600; }
.pga-q-icon { font-size:.9rem;margin-bottom:2px; }
.pga-q-label{ font-size:.65rem;color:rgba(201,168,76,.5);margin-top:2px; }
.pga-q-cell.excellent .pga-q-num { color:#4ade80; }
.pga-q-cell.good       .pga-q-num { color:#60a5fa; }
.pga-q-cell.inaccuracy .pga-q-num { color:#fbbf24; }
.pga-q-cell.blunder    .pga-q-num { color:#f87171; }

/* Stat chips */
.pga-chips { display:flex;flex-wrap:wrap;gap:8px; }
.pga-chip {
  display:flex;align-items:center;gap:6px;
  background:rgba(201,168,76,.07);border:1px solid rgba(201,168,76,.14);
  border-radius:6px;padding:7px 12px;font-size:.78rem;
}
.pga-chip-val { font-family:'Cinzel',serif;font-size:.95rem;color:#e8c96a; }
.pga-chip-lbl { color:rgba(201,168,76,.55);font-size:.72rem; }

/* Turning point */
.pga-tp {
  background:rgba(248,113,113,.06);
  border:1px solid rgba(248,113,113,.2);
  border-left:3px solid #f87171;
  border-radius:0 8px 8px 0;
  padding:12px 16px;
}
.pga-tp-label { font-size:.68rem;text-transform:uppercase;letter-spacing:.1em;color:#f87171;margin-bottom:4px; }
.pga-tp-move  { font-family:'Cinzel',serif;font-size:1rem;color:#fca5a5; }
.pga-tp-desc  { font-size:.78rem;color:rgba(248,113,113,.7);margin-top:3px; }

/* Drona verdict */
.pga-drona {
  background:rgba(201,168,76,.05);
  border:1px solid rgba(201,168,76,.16);
  border-radius:10px;padding:18px 20px;
}
.pga-drona-label {
  font-size:.68rem;letter-spacing:.12em;text-transform:uppercase;
  color:rgba(201,168,76,.5);margin-bottom:10px;
  display:flex;align-items:center;gap:6px;
}
.pga-drona-quote {
  font-family:'Cinzel',serif;font-size:.92rem;line-height:1.7;
  color:#e8c96a;font-style:italic;
}
.pga-drona-verse {
  font-size:.7rem;color:rgba(201,168,76,.45);margin-top:8px;
  text-align:right;
}

/* ELO banner */
.pga-elo {
  display:flex;align-items:center;justify-content:space-between;flex-wrap:wrap;gap:8px;
  background:rgba(201,168,76,.06);border:1px solid rgba(201,168,76,.14);
  border-radius:8px;padding:12px 16px;
}
.pga-elo-num { font-family:'Cinzel',serif;font-size:1.8rem;color:#e8c96a; }
.pga-elo-conf { font-size:.7rem;color:rgba(201,168,76,.5); }
.pga-elo-bar-track {
  flex:1;min-width:120px;height:6px;border-radius:3px;
  background:rgba(255,255,255,.06);overflow:hidden;
}
.pga-elo-bar-fill {
  height:100%;border-radius:3px;
  background:linear-gradient(90deg,#f87171,#fbbf24,#60a5fa,#4ade80);
}

/* Section labels */
.pga-section-label {
  font-size:.68rem;text-transform:uppercase;letter-spacing:.1em;
  color:rgba(201,168,76,.55);margin-bottom:10px;
  display:flex;align-items:center;gap:5px;
}

/* Buttons */
.pga-actions { display:flex;gap:10px;flex-wrap:wrap; }
.pga-btn {
  flex:1;min-width:140px;
  padding:11px 20px;border-radius:8px;
  font-family:'Outfit',sans-serif;font-size:.88rem;font-weight:500;
  cursor:pointer;transition:all .2s;
  display:flex;align-items:center;justify-content:center;gap:7px;
  border:none;
}
.pga-btn-primary {
  background:linear-gradient(135deg,#c8960c,#7a5c08);color:#1a0e00;
}
.pga-btn-primary:hover { background:linear-gradient(135deg,#e8b52a,#c8960c);transform:translateY(-1px); }
.pga-btn-secondary {
  background:transparent;color:rgba(201,168,76,.8);
  border:1px solid rgba(201,168,76,.25);
}
.pga-btn-secondary:hover { border-color:rgba(201,168,76,.5);background:rgba(201,168,76,.08); }

/* Two-column layout for players + quality */
.pga-grid-2 { display:grid;grid-template-columns:1fr 1fr;gap:20px; }
@media(max-width:600px) {
  .pga-grid-2 { grid-template-columns:1fr; }
  .pga-quality-grid { grid-template-columns:repeat(2,1fr); }
  .pga-title { font-size:1.2rem; }
  #pgaCard { padding:20px 18px; }
}
`;
    document.head.appendChild(style);
  }

  // ── Build overlay HTML ────────────────────────────────────────────────────
  function buildHTML(game, playerStats, vaultId) {
    const moveHistory = game.moveHistory || [];
    const winnerLabel = getWinnerLabel(game);
    const totalMoves  = moveHistory.length;
    const tp          = findTurningPoint(moveHistory);

    // Totals across all players
    const totQuality = { excellent: 0, good: 0, inaccuracy: 0, blunder: 0 };
    let   totalMat   = 0;
    let   totalPromo = 0;
    let   totalForfeits = 0;
    playerStats.forEach(s => {
      Object.entries(s.qualities).forEach(([q, n]) => totQuality[q] += n);
      totalMat      += s.materialGained;
      totalPromo    += s.promotions;
      totalForfeits += s.forfeits;
    });

    // Average accuracy (active players only)
    const activePlayers = playerStats.filter(s => s.moves > 0);
    const avgAccuracy   = activePlayers.length
      ? Math.round(activePlayers.reduce((a, s) => a + s.accuracy, 0) / activePlayers.length)
      : 0;

    const verdict = getDronaVerdict(avgAccuracy);

    // ELO estimate from seer-engine if available
    let eloHTML = '';
    if (globalThis.ChaturangaSeer?.estimateELO && moveHistory.length >= 6) {
      const fakeMoves = moveHistory.map(m => ({ quality: classifyMove(m) }));
      const est = globalThis.ChaturangaSeer.estimateELO(fakeMoves);
      if (est) {
        const fillPct = Math.min(100, Math.round(((est.elo - 400) / 1200) * 100));
        eloHTML = `
          <div class="pga-section-label"><i class="fa-solid fa-ranking-star fa-xs"></i> ELO Estimate</div>
          <div class="pga-elo">
            <div>
              <div class="pga-elo-num">${est.elo}</div>
              <div class="pga-elo-conf">${est.confidence}% confidence · ${totalMoves} moves analysed</div>
            </div>
            <div class="pga-elo-bar-track">
              <div class="pga-elo-bar-fill" style="width:${fillPct}%"></div>
            </div>
          </div>
          <hr class="pga-divider">`;
      }
    }

    // Turning point HTML
    let tpHTML = '';
    if (tp) {
      const m    = tp.move;
      const mover = PLABELS[m.playerId] || '?';
      const capName = PNAMES[m.cap?.type] || m.cap?.type || 'piece';
      const capVal  = PV[m.cap?.type] || 0;
      tpHTML = `
        <div class="pga-section-label"><i class="fa-solid fa-bolt fa-xs"></i> Turning Point</div>
        <div class="pga-tp">
          <div class="pga-tp-label">Move ${tp.idx + 1}</div>
          <div class="pga-tp-move">${m.from} → ${m.to}</div>
          <div class="pga-tp-desc">
            <span style="color:${PCOLORS[m.playerId]}">${mover}</span>
            captured the ${capName} — a swing of <strong>${capVal} point${capVal !== 1 ? 's' : ''}</strong>.
            ${capVal >= 5 ? 'This Ratha capture shifted the balance of power irreversibly.' : ''}
            ${m.cap?.type === 'king' ? 'A Raja fell. The army was absorbed.' : ''}
          </div>
        </div>
        <hr class="pga-divider">`;
    }

    // Player accuracy rows
    const playerRows = activePlayers.map(s => `
      <div class="pga-player-row">
        <div class="pga-player-name" style="color:${s.color}">${s.label}</div>
        <div class="pga-bar-track">
          <div class="pga-bar-fill" style="width:${s.accuracy}%;background:${s.color};opacity:.85"></div>
        </div>
        <div class="pga-pct">${s.accuracy}%</div>
      </div>`).join('');

    // Stat chips
    const chips = [
      { val: totalMoves,    lbl: 'Total moves'   },
      { val: totalMat,      lbl: 'Material taken' },
      { val: totalForfeits, lbl: 'Forfeits'       },
      { val: totalPromo,    lbl: 'Promotions'     },
    ].map(c => `
      <div class="pga-chip">
        <span class="pga-chip-val">${c.val}</span>
        <span class="pga-chip-lbl">${c.lbl}</span>
      </div>`).join('');

    // Study game button
    const studyBtn = vaultId
      ? `<button class="pga-btn pga-btn-primary" onclick="window.location.href='seer.html?game=${vaultId}'">
           <i class="fa-solid fa-magnifying-glass-chart"></i> Study This Game
         </button>`
      : `<button class="pga-btn pga-btn-primary" onclick="window.location.href='seer.html'">
           <i class="fa-solid fa-eye"></i> Open Seer Analysis
         </button>`;

    return `
      <div class="pga-eyebrow">
        <i class="fa-solid fa-eye fa-xs"></i> Seer Analysis
      </div>
      <div class="pga-title">${winnerLabel}</div>
      <div class="pga-subtitle">${game.gameMode === 'team' ? 'Team 2v2' : '4-Player Free-for-All'} · ${totalMoves} moves played</div>

      <div class="pga-grid-2">
        <!-- Left: Player accuracy -->
        <div>
          <div class="pga-section-label">
            <i class="fa-solid fa-chart-bar fa-xs"></i> Accuracy by player
          </div>
          <div class="pga-players">${playerRows}</div>
        </div>
        <!-- Right: Quality grid -->
        <div>
          <div class="pga-section-label">
            <i class="fa-solid fa-list-check fa-xs"></i> Move quality
          </div>
          <div class="pga-quality-grid">
            <div class="pga-q-cell excellent">
              <div class="pga-q-icon">★</div>
              <div class="pga-q-num">${totQuality.excellent}</div>
              <div class="pga-q-label">Excellent</div>
            </div>
            <div class="pga-q-cell good">
              <div class="pga-q-icon">·</div>
              <div class="pga-q-num">${totQuality.good}</div>
              <div class="pga-q-label">Good</div>
            </div>
            <div class="pga-q-cell inaccuracy">
              <div class="pga-q-icon">?</div>
              <div class="pga-q-num">${totQuality.inaccuracy}</div>
              <div class="pga-q-label">Inaccuracy</div>
            </div>
            <div class="pga-q-cell blunder">
              <div class="pga-q-icon">!!</div>
              <div class="pga-q-num">${totQuality.blunder}</div>
              <div class="pga-q-label">Blunder</div>
            </div>
          </div>
        </div>
      </div>

      <hr class="pga-divider">

      <div class="pga-section-label">
        <i class="fa-solid fa-swords fa-xs"></i> Battle summary
      </div>
      <div class="pga-chips">${chips}</div>

      <hr class="pga-divider">

      ${eloHTML}
      ${tpHTML}

      <!-- Drona's verdict -->
      <div class="pga-section-label">
        <i class="fa-solid fa-scroll fa-xs"></i> Acharya Drona's verdict
      </div>
      <div class="pga-drona">
        <div class="pga-drona-label">
          <i class="fa-solid fa-om fa-xs"></i> Drona speaks
        </div>
        <div class="pga-drona-quote">"${verdict.quote}"</div>
        <div class="pga-drona-verse">${verdict.verse}</div>
      </div>

      <hr class="pga-divider">

      <div class="pga-actions">
        ${studyBtn}
        <button class="pga-btn pga-btn-secondary" onclick="window._pgaDismiss()">
          <i class="fa-solid fa-rotate-right"></i> Play Again
        </button>
      </div>
    `;
  }

  // ── Show overlay ──────────────────────────────────────────────────────────
  let overlayShown = false;

  function showAnalysis(game) {
    if (overlayShown) return;
    if (!game || !game.moveHistory || game.moveHistory.length < 2) return;
    overlayShown = true;

    injectCSS();

    const playerStats = buildPlayerStats(game.moveHistory);
    const vaultId     = saveToVault(game, playerStats);

    const overlay = document.createElement('div');
    overlay.id    = 'pgaOverlay';

    const card = document.createElement('div');
    card.id     = 'pgaCard';
    card.innerHTML = buildHTML(game, playerStats, vaultId);
    overlay.appendChild(card);
    document.body.appendChild(overlay);

    // Hide the original game-over overlay so we don't double-show
    const orig = document.getElementById('gameOverOverlay');
    if (orig) orig.style.display = 'none';

    // Play Again handler: dismiss overlay, reload page
    globalThis._pgaDismiss = function () {
      overlay.remove();
      location.reload();
    };
  }

  // ── Game-over watcher ─────────────────────────────────────────────────────
  // Watches #gameOverOverlay becoming visible, then fires the analysis.
  function watchForGameOver() {
    const target = document.getElementById('gameOverOverlay');
    if (!target) {
      // DOM not ready — retry
      setTimeout(watchForGameOver, 200);
      return;
    }

    const observer = new MutationObserver(() => {
      if (target.style.display !== 'none' && target.style.display !== '') {
        const game = globalThis._chaturangaGame;
        if (game && game.gameOver) {
          // Small delay so ui.js can finish its own update first
          setTimeout(() => showAnalysis(game), 350);
          observer.disconnect();
        }
      }
    });

    observer.observe(target, { attributes: true, attributeFilter: ['style'] });
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', watchForGameOver);
  } else {
    watchForGameOver();
  }

})();
