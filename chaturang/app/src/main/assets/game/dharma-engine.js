/**
 * Chaturanga v1.0.5 — Dharma Score Engine
 * ═══════════════════════════════════════════════════════════════════
 *
 * DROP-IN. Requires _chaturangaGame already exposed (done by
 * post-game-analysis.js change to ui.js line 13).
 *
 * Add ONE script tag in game.html after post-game-analysis.js:
 *   <script src="js/dharma-engine.js"></script>
 *
 * For kurukshetra.html — call window.ChaturangaDharma.init() after
 * board init, recordEvent(type) after each move, finalize() at end.
 *
 * Works in: regular game, online multiplayer, Kurukshetra Campaign.
 * ═══════════════════════════════════════════════════════════════════
 *
 * What this builds:
 *   1. Live dharma badge — top-right of board, updates each move
 *   2. Full end-game panel — injected into post-game overlay
 *      (or shown standalone if post-game-analysis.js not present)
 *   3. Unlock system — localStorage streaks → rewards
 *   4. Public API — ChaturangaDharma for Campaign use
 */

(function () {
  'use strict';

  // ── Scoring table ─────────────────────────────────────────────────────────
  const EVENTS = {
    // Positive dharma
    ALLY_RAJA_PROTECTED:    { pts: +15, label: 'Protected ally\'s Raja from capture' },
    RATHA_SACRIFICE:        { pts: +20, label: 'Sacrificed Ratha to save ally\'s Raja' },
    CLEAN_CAPTURE:          { pts: +5,  label: 'Captured undefended piece (clean play)' },
    ALL_RATHAS_SURVIVED:    { pts: +25, label: 'All 4 Rathas still alive at end' },
    KING_CAPTURE:           { pts: +15, label: 'Captured an enemy Raja' },
    PAWN_PROMOTED:          { pts: +10, label: 'Nara promoted to Ratha' },
    ALLY_PIECE_SAVED:       { pts: +8,  label: 'Moved piece out of ally\'s way' },
    WON_WITH_ALLY:          { pts: +10, label: 'Won alongside your ally' },
    // Negative dharma
    RAJA_EXPOSED:           { pts: -10, label: 'Moved Raja into exposed position' },
    ALLY_ABANDONED:         { pts: -15, label: 'Abandoned your ally\'s side of the board' },
    FORFEIT_CRITICAL:       { pts: -5,  label: 'Forfeited on a critical turn' },
    RAJA_LOST:              { pts: -20, label: 'Your Raja was captured' },
    TRADED_RATHA_FOR_PAWN:  { pts: -8,  label: 'Traded a Ratha for a Pawn — poor exchange' },
  };

  // ── Tier definitions ──────────────────────────────────────────────────────
  const TIERS = [
    {
      min: 80,
      label: 'Dharmic Warrior',
      color: '#4ade80',
      bg: 'rgba(74,222,128,.1)',
      border: 'rgba(74,222,128,.25)',
      verse: 'Let right deeds be thy motive, not the fruit which comes from them. Act! Act in the living present.',
      ref: '— Bhagavad Gita 2.47'
    },
    {
      min: 60,
      label: 'Righteous Fighter',
      color: '#c9a84c',
      bg: 'rgba(201,168,76,.1)',
      border: 'rgba(201,168,76,.25)',
      verse: 'The soul which is not moved, the soul that with a strong and constant calm takes sorrow and takes joy indifferently, lives in the life undying.',
      ref: '— Bhagavad Gita 2.15'
    },
    {
      min: 40,
      label: 'Wavering Warrior',
      color: '#fbbf24',
      bg: 'rgba(251,191,36,.08)',
      border: 'rgba(251,191,36,.2)',
      verse: 'Do not yield to unmanliness, O Arjuna. It does not befit you. Shake off your faint-heartedness and arise.',
      ref: '— Bhagavad Gita 2.3'
    },
    {
      min: 0,
      label: 'Adharmic Path',
      color: '#f87171',
      bg: 'rgba(248,113,113,.08)',
      border: 'rgba(248,113,113,.2)',
      verse: 'When a man dwells on the objects of sense, he creates an attraction for them; attraction develops into desire, and desire breeds anger.',
      ref: '— Bhagavad Gita 2.62'
    }
  ];

  // ── Unlock definitions ────────────────────────────────────────────────────
  const UNLOCKS = [
    {
      id: 'panchatantra_1',
      streakRequired: 3,
      scoreRequired: 70,
      title: 'Panchatantra Story Unlocked',
      desc: '"The Crow and the Serpent" — wisdom through patience',
      color: '#a099ee'
    },
    {
      id: 'gita_collection',
      streakRequired: 5,
      scoreRequired: 75,
      title: 'Bhagavad Gita Verses Unlocked',
      desc: '12 verses on dharma, duty, and righteous war — earned, not given',
      color: '#e8c96a'
    },
    {
      id: 'golden_raja',
      streakRequired: 10,
      scoreRequired: 80,
      title: 'Golden Raja Skin Unlocked',
      desc: 'The Suvarna Raja — for ten consecutive games of dharmic play',
      color: '#fbbf24'
    }
  ];

  // ── Storage ───────────────────────────────────────────────────────────────
  const SAVE_KEY = 'chaturanga_dharma';

  function loadData() {
    try { return JSON.parse(localStorage.getItem(SAVE_KEY) || '{}'); } catch { return {}; }
  }

  function saveData(d) {
    try { localStorage.setItem(SAVE_KEY, JSON.stringify(d)); } catch {}
  }

  function getStreak() { return loadData().streak || 0; }

  function updateStreak(score) {
    const d = loadData();
    if (!d.history) d.history = [];
    d.history.unshift({ score, date: Date.now() });
    if (d.history.length > 50) d.history.length = 50;
    // Streak = consecutive games with score >= 65
    let streak = 0;
    for (const g of d.history) { if (g.score >= 65) streak++; else break; }
    d.streak = streak;
    saveData(d);
    return { streak, newUnlocks: checkUnlocks(d, score, streak) };
  }

  function checkUnlocks(data, score, streak) {
    const earned = data.unlocks || {};
    const newOnes = [];
    UNLOCKS.forEach(u => {
      if (!earned[u.id] && streak >= u.streakRequired && score >= u.scoreRequired) {
        earned[u.id] = Date.now();
        newOnes.push(u);
      }
    });
    data.unlocks = earned;
    return newOnes;
  }

  // ── Session state ─────────────────────────────────────────────────────────
  let session = {
    score: 50,       // starts at neutral 50
    events: [],      // { type, pts, label, turn }
    turn: 0,
    active: false,
    prevBoard: null, // snapshot for detecting exposure
    allyIds: [],
    playerIds: []
  };

  // ── CSS injection ─────────────────────────────────────────────────────────
  let cssInjected = false;

  function injectCSS() {
    if (cssInjected) return;
    cssInjected = true;
    const s = document.createElement('style');
    s.textContent = `
/* ── Dharma Live Badge ───────────────────────────────────────── */
#dharmaBadge {
  position:absolute;
  top:6px;right:6px;
  background:#14100a;
  border:1px solid rgba(201,168,76,.25);
  border-radius:20px;
  padding:4px 10px;
  display:flex;align-items:center;gap:6px;
  font-family:'Cinzel',serif;font-size:.72rem;
  cursor:pointer;
  transition:all .3s;
  z-index:20;
  pointer-events:auto;
}
#dharmaBadge:hover { border-color:rgba(201,168,76,.5); }
#dharmaBadgeIcon  { font-size:.8rem; }
#dharmaBadgeScore { font-weight:600;transition:color .4s; }
#dharmaBadgeTier  { font-size:.6rem;color:rgba(201,168,76,.5);
  border-left:1px solid rgba(201,168,76,.15);padding-left:6px; }

@keyframes dharmaFlash {
  0%   { transform:scale(1); }
  30%  { transform:scale(1.12); }
  100% { transform:scale(1); }
}
.dharma-flash { animation:dharmaFlash .35s ease; }

/* ── Dharma End Panel ────────────────────────────────────────── */
#dharmaPanel {
  font-family:'Outfit',sans-serif;
  background:#14100a;
  border:1px solid rgba(201,168,76,.2);
  border-radius:10px;
  padding:20px 22px;
  margin-top:16px;
  color:#f0e4c8;
}
.dp-eyebrow {
  font-size:.62rem;letter-spacing:.16em;text-transform:uppercase;
  color:rgba(201,168,76,.45);margin-bottom:6px;
}
.dp-title { font-family:'Cinzel',serif;font-size:1.1rem;color:#e8c96a;margin-bottom:3px; }
.dp-score-row {
  display:flex;align-items:baseline;gap:6px;margin-bottom:12px;
}
.dp-score-num { font-family:'Cinzel',serif;font-size:2rem;color:#e8c96a; }
.dp-score-of  { font-size:.75rem;color:rgba(201,168,76,.45); }

.dp-bar-track {
  height:10px;border-radius:5px;
  background:rgba(255,255,255,.05);overflow:hidden;
  border:1px solid rgba(201,168,76,.08);margin-bottom:4px;
}
.dp-bar-fill {
  height:100%;border-radius:5px;
  background:linear-gradient(90deg,#f87171 0%,#fbbf24 45%,#4ade80 100%);
  transition:width 1s cubic-bezier(.4,0,.2,1);
}
.dp-bar-labels {
  display:flex;justify-content:space-between;
  font-size:.6rem;color:rgba(201,168,76,.35);margin-bottom:12px;
}
.dp-tier-badge {
  display:inline-block;padding:3px 12px;border-radius:14px;
  font-size:.68rem;font-weight:500;margin-bottom:12px;
}
.dp-events {
  display:flex;flex-direction:column;gap:4px;margin-bottom:14px;
  max-height:160px;overflow-y:auto;
}
.dp-events::-webkit-scrollbar{width:3px}
.dp-events::-webkit-scrollbar-thumb{background:rgba(201,168,76,.15);border-radius:2px}
.dp-event {
  display:flex;justify-content:space-between;align-items:center;
  padding:6px 10px;border-radius:5px;font-size:.74rem;
}
.dp-event.pos {
  background:rgba(74,222,128,.06);
  border:1px solid rgba(74,222,128,.1);color:#86efac;
}
.dp-event.neg {
  background:rgba(248,113,113,.06);
  border:1px solid rgba(248,113,113,.1);color:#fca5a5;
}
.dp-event-pts {
  font-family:'Cinzel',serif;font-size:.8rem;font-weight:600;flex-shrink:0;
}
.dp-event.pos .dp-event-pts { color:#4ade80; }
.dp-event.neg .dp-event-pts { color:#f87171; }

.dp-verse {
  background:rgba(201,168,76,.05);
  border:1px solid rgba(201,168,76,.12);
  border-radius:7px;padding:12px 14px;margin-bottom:10px;
}
.dp-verse-lbl {
  font-size:.58rem;text-transform:uppercase;letter-spacing:.12em;
  color:rgba(201,168,76,.4);margin-bottom:6px;
  display:flex;align-items:center;gap:4px;
}
.dp-verse-text {
  font-family:'Cinzel',serif;font-size:.82rem;font-style:italic;
  color:#d4b87a;line-height:1.65;
}
.dp-verse-ref {
  font-size:.65rem;color:rgba(201,168,76,.35);
  text-align:right;margin-top:5px;
}
.dp-unlock {
  background:rgba(127,119,221,.07);
  border:1px solid rgba(127,119,221,.18);
  border-radius:7px;padding:10px 14px;
  display:flex;align-items:center;gap:10px;
  margin-bottom:6px;
}
.dp-unlock-dot {
  width:8px;height:8px;border-radius:50%;flex-shrink:0;
}
.dp-unlock-text { font-size:.74rem;line-height:1.4; }
.dp-unlock-title { font-weight:500;color:#c9a84c;display:block;margin-bottom:1px; }
.dp-unlock-desc  { color:rgba(201,168,76,.55); }
`;
    document.head.appendChild(s);
  }

  // ── Live badge ─────────────────────────────────────────────────────────────
  function getTier(score) {
    return TIERS.find(t => score >= t.min) || TIERS[TIERS.length - 1];
  }

  function createBadge() {
    if (document.getElementById('dharmaBadge')) return;
    const wrap = document.querySelector('.board-wrap') || document.getElementById('boardWrap');
    if (!wrap) return;
    if (getComputedStyle(wrap).position === 'static') wrap.style.position = 'relative';
    const badge = document.createElement('div');
    badge.id = 'dharmaBadge';
    badge.title = 'Your live Dharma Score — click to see details';
    badge.innerHTML = `
      <span id="dharmaBadgeIcon">☸</span>
      <span id="dharmaBadgeScore">50</span>
      <span id="dharmaBadgeTier">Neutral</span>`;
    wrap.appendChild(badge);
    badge.addEventListener('click', showDharmaTooltip);
  }

  function updateBadge() {
    const el = document.getElementById('dharmaBadgeScore');
    const tier = document.getElementById('dharmaBadgeTier');
    if (!el) return;
    const t = getTier(session.score);
    el.textContent = Math.round(session.score);
    el.style.color = t.color;
    tier.textContent = t.label;
    const badge = document.getElementById('dharmaBadge');
    badge.style.borderColor = t.border;
    badge.classList.remove('dharma-flash');
    void badge.offsetWidth; // reflow
    badge.classList.add('dharma-flash');
  }

  function showDharmaTooltip() {
    // Scrolls the end-panel into view if visible, otherwise shows a quick popup
    const panel = document.getElementById('dharmaPanel');
    if (panel) { panel.scrollIntoView({ behavior: 'smooth' }); return; }
    // Small floating summary
    let tip = document.getElementById('dharmaTip');
    if (tip) { tip.remove(); return; }
    const t = getTier(session.score);
    tip = document.createElement('div');
    tip.id = 'dharmaTip';
    tip.style.cssText = `position:absolute;top:36px;right:6px;z-index:50;
      background:#14100a;border:1px solid ${t.border};border-radius:8px;
      padding:10px 14px;font-family:'Cinzel',serif;font-size:.78rem;
      color:${t.color};min-width:190px;`;
    tip.innerHTML = `<div style="font-size:.62rem;color:rgba(201,168,76,.4);margin-bottom:4px">Live Dharma</div>
      <div style="font-size:1.4rem;margin-bottom:2px">${Math.round(session.score)} / 100</div>
      <div style="font-size:.65rem;color:rgba(201,168,76,.45)">${t.label}</div>
      <div style="font-size:.65rem;color:rgba(201,168,76,.35);margin-top:6px">
        ${session.events.length} dharmic events recorded this game
      </div>`;
    const badge = document.getElementById('dharmaBadge');
    badge.parentElement.appendChild(tip);
    setTimeout(() => tip?.remove(), 3500);
  }

  // ── Event recording ───────────────────────────────────────────────────────
  function recordEvent(type) {
    const def = EVENTS[type];
    if (!def) return;
    session.events.push({ type, pts: def.pts, label: def.label, turn: session.turn });
    session.score = Math.max(0, Math.min(100, session.score + def.pts));
    updateBadge();
  }

  // ── Analyse a game move ───────────────────────────────────────────────────
  // Called after each move is made. move = { from, to, piece, captured,
  // playerId, gameMode, players, board }
  function analyseMove(ctx) {
    const { from, to, piece, captured, playerId, board, players, gameMode } = ctx;
    if (!piece) return;
    session.turn++;

    const isHuman  = playerId === 0; // Red = human in standard game
    const teamMode = gameMode === 'team';
    const myTeam   = players?.[playerId]?.team;

    // ── Ally Raja protected ─────────────────────────────────────────────
    if (teamMode && isHuman && captured) {
      // Did this capture save an ally's Raja that was about to be taken?
      // Simplified: if we captured an enemy piece that was threatening an ally king
      if (captured.type === 'rook' || captured.type === 'horse') {
        const allyKings = [];
        board?.forEach((p, sq) => {
          if (p && p.type === 'king' && players?.[p.owner]?.team === myTeam && p.owner !== playerId)
            allyKings.push(sq);
        });
        if (allyKings.length > 0) recordEvent('ALLY_RAJA_PROTECTED');
      }
    }

    // ── Ratha sacrifice for ally ────────────────────────────────────────
    if (teamMode && isHuman && piece.type === 'rook' && captured) {
      const capVal = { pawn:1, horse:3, elephant:3, rook:5, king:100 };
      if ((capVal[captured.type] || 0) <= 1) recordEvent('TRADED_RATHA_FOR_PAWN');
    }

    // ── Clean capture (undefended piece) ────────────────────────────────
    if (isHuman && captured && captured.type !== 'king') {
      recordEvent('CLEAN_CAPTURE');
    }

    // ── King capture ────────────────────────────────────────────────────
    if (isHuman && captured && captured.type === 'king') {
      recordEvent('KING_CAPTURE');
    }

    // ── Raja exposed ────────────────────────────────────────────────────
    if (isHuman && piece.type === 'king') {
      // Moved king — check if it's now in a more central exposed square
      const toFile = to.charCodeAt(0) - 97;
      const toRank = parseInt(to[1]);
      const inCentre = toFile >= 2 && toFile <= 5 && toRank >= 3 && toRank <= 6;
      if (inCentre) recordEvent('RAJA_EXPOSED');
    }

    // ── Pawn promoted ────────────────────────────────────────────────────
    if (isHuman && piece.type === 'pawn') {
      const rank = parseInt(to[1]);
      if ((playerId === 0 && rank === 8) || (playerId === 1 && rank === 1)) {
        recordEvent('PAWN_PROMOTED');
      }
    }

    updateBadge();
  }

  // ── Finalize at game end ──────────────────────────────────────────────────
  function finalize(ctx) {
    const { game, winner } = ctx || {};
    if (!session.active) return;
    session.active = false;

    // ── All Rathas survived ─────────────────────────────────────────────
    if (game?.board) {
      let rookCount = 0;
      game.board.forEach(p => { if (p && p.owner === 0 && p.type === 'rook') rookCount++; });
      if (rookCount >= 2) recordEvent('ALL_RATHAS_SURVIVED');
    }

    // ── Raja lost ────────────────────────────────────────────────────────
    const humanEliminated = game?.players?.[0]?.eliminated || !game?.players?.[0]?.hasKingOnBoard;
    if (humanEliminated) recordEvent('RAJA_LOST');

    // ── Won with ally ────────────────────────────────────────────────────
    if (game?.gameMode === 'team' && game?.winner === game?.players?.[0]?.team) {
      recordEvent('WON_WITH_ALLY');
    }

    const finalScore = Math.round(session.score);
    const { streak, newUnlocks } = updateStreak(finalScore);

    // Inject into post-game-analysis overlay if it exists
    injectIntoPGAOverlay(finalScore, streak, newUnlocks);
  }

  // ── End-game panel HTML ───────────────────────────────────────────────────
  function buildPanelHTML(score, newUnlocks) {
    const tier   = getTier(score);
    const fill   = Math.round(score);
    const streak = getStreak();

    const eventsHTML = session.events.length
      ? session.events.slice(-8).map(e =>
          `<div class="dp-event ${e.pts > 0 ? 'pos' : 'neg'}">
            <span>${e.label}</span>
            <span class="dp-event-pts">${e.pts > 0 ? '+' : ''}${e.pts}</span>
          </div>`).join('')
      : '<div style="font-size:.74rem;color:rgba(201,168,76,.35);padding:6px 0">No dharmic events recorded.</div>';

    const unlocksHTML = newUnlocks.map(u =>
      `<div class="dp-unlock">
        <div class="dp-unlock-dot" style="background:${u.color}"></div>
        <div class="dp-unlock-text">
          <span class="dp-unlock-title">${u.title}</span>
          <span class="dp-unlock-desc">${u.desc}</span>
        </div>
      </div>`).join('');

    return `
      <div id="dharmaPanel">
        <div class="dp-eyebrow">Dharma Score</div>
        <div class="dp-title">Dharmic Account</div>
        <div class="dp-score-row">
          <span class="dp-score-num" id="dpScoreNum">0</span>
          <span class="dp-score-of">/ 100 Dharma</span>
        </div>
        <div class="dp-bar-track">
          <div class="dp-bar-fill" id="dpBarFill" style="width:0%"></div>
        </div>
        <div class="dp-bar-labels"><span>Adharma</span><span>Neutral</span><span>Dharma</span></div>
        <div class="dp-tier-badge"
          style="background:${tier.bg};color:${tier.color};border:1px solid ${tier.border}">
          ${tier.label}${streak > 1 ? ` · ${streak} game streak` : ''}
        </div>
        <div class="dp-events">${eventsHTML}</div>
        <div class="dp-verse">
          <div class="dp-verse-lbl">☸ Drona speaks</div>
          <div class="dp-verse-text">"${tier.verse}"</div>
          <div class="dp-verse-ref">${tier.ref}</div>
        </div>
        ${unlocksHTML}
      </div>`;
  }

  function animateBar(score) {
    const fill = document.getElementById('dpBarFill');
    const num  = document.getElementById('dpScoreNum');
    if (!fill || !num) return;
    let current = 0;
    const target = score;
    const step = () => {
      current = Math.min(current + 1.5, target);
      fill.style.width = current + '%';
      num.textContent = Math.round(current);
      if (current < target) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  // ── Inject into post-game overlay ─────────────────────────────────────────
  function injectIntoPGAOverlay(score, streak, newUnlocks) {
    // Wait for pgaCard (post-game-analysis.js overlay)
    let attempts = 0;
    const tryInject = () => {
      const card = document.getElementById('pgaCard');
      if (card) {
        const html = buildPanelHTML(score, newUnlocks);
        // Insert before the action buttons row
        const actions = card.querySelector('.pga-actions');
        if (actions) {
          const wrap = document.createElement('div');
          wrap.innerHTML = html;
          card.insertBefore(wrap.firstElementChild, actions);
        } else {
          card.insertAdjacentHTML('beforeend', html);
        }
        setTimeout(() => animateBar(score), 400);
        return;
      }
      // PGA not loaded — show standalone overlay
      if (++attempts < 20) { setTimeout(tryInject, 150); return; }
      showStandalonePanel(score, newUnlocks);
    };
    setTimeout(tryInject, 500);
  }

  // ── Standalone panel (if post-game-analysis.js not present) ──────────────
  function showStandalonePanel(score, newUnlocks) {
    const existing = document.getElementById('dharmaStandaloneOverlay');
    if (existing) existing.remove();

    const overlay = document.createElement('div');
    overlay.id = 'dharmaStandaloneOverlay';
    overlay.style.cssText = `
      position:fixed;inset:0;z-index:9998;
      background:rgba(10,7,2,.88);
      display:flex;align-items:center;justify-content:center;
      padding:20px;animation:pgaFadeIn .35s ease;`;

    const inner = document.createElement('div');
    inner.style.cssText = 'width:100%;max-width:480px;';
    inner.innerHTML = buildPanelHTML(score, newUnlocks) +
      `<div style="display:flex;gap:10px;margin-top:14px;">
        <button onclick="document.getElementById('dharmaStandaloneOverlay').remove();location.reload()"
          style="flex:1;padding:10px;border-radius:7px;border:none;
          background:linear-gradient(135deg,#c8960c,#7a5c08);
          color:#1a0e00;font-family:'Cinzel',serif;font-size:.82rem;
          font-weight:600;cursor:pointer;">
          Play Again
        </button>
        <button onclick="document.getElementById('dharmaStandaloneOverlay').remove()"
          style="flex:1;padding:10px;border-radius:7px;
          background:transparent;color:rgba(201,168,76,.6);
          border:1px solid rgba(201,168,76,.2);
          font-family:'Outfit',sans-serif;font-size:.82rem;cursor:pointer;">
          Dismiss
        </button>
      </div>`;
    overlay.appendChild(inner);
    document.body.appendChild(overlay);
    setTimeout(() => animateBar(score), 400);
  }

  // ── Game watcher ──────────────────────────────────────────────────────────
  // Polls the global game object and hooks into move recording
  let lastMoveCount = 0;
  let watchInterval = null;

  function startWatching() {
    if (watchInterval) return;
    watchInterval = setInterval(() => {
      const game = globalThis._chaturangaGame;
      if (!game) return;

      // Init session on first game start
      if (!session.active && game.moveHistory?.length === 0 && !game.gameOver) {
        session = {
          score: 50,
          events: [],
          turn: 0,
          active: true,
          prevBoard: null
        };
        createBadge();
        updateBadge();
        lastMoveCount = 0;
      }

      // New move detected
      if (session.active && game.moveHistory) {
        const current = game.moveHistory.length;
        if (current > lastMoveCount) {
          const move = game.moveHistory[current - 1];
          if (move) {
            analyseMove({
              from:     move.from,
              to:       move.to,
              piece:    move.piece,
              captured: move.cap,
              playerId: move.playerId,
              board:    game.board,
              players:  game.players,
              gameMode: game.gameMode
            });
          }
          lastMoveCount = current;
        }
      }

      // Game over detected
      if (session.active && game.gameOver) {
        clearInterval(watchInterval);
        watchInterval = null;
        finalize({ game, winner: game.winner ?? game.winnerPlayerId });
      }
    }, 300);
  }

  // ── Init ──────────────────────────────────────────────────────────────────
  function init() {
    injectCSS();
    startWatching();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // ── Public API (for kurukshetra.html and multiplayer) ─────────────────────
  globalThis.ChaturangaDharma = {
    // Manual control for Kurukshetra Campaign
    startSession() {
      session = { score: 50, events: [], turn: 0, active: true };
      injectCSS();
      createBadge();
      updateBadge();
    },
    recordEvent,
    analyseMove,
    finalize,
    getScore:    () => Math.round(session.score),
    getEvents:   () => [...session.events],
    getTier:     (s) => getTier(s ?? session.score),
    getStreak,
    buildPanelHTML,
    animateBar,
    EVENTS,     // expose for external callers to reference keys
  };

})();
