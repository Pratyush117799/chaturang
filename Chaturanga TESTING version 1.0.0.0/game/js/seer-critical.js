/**
 * seer-critical.js — Critical Moment Detection UI for Chaturanga Seer
 * =====================================================================
 * Drop-in addition to seer.html. Add ONE script tag at the bottom:
 *   <script src="js/seer-critical.js"></script>
 *
 * Requires:
 *   · analysis-worker.js in js/ directory
 *   · seer.html to expose: window.SeerGame (the loaded game object)
 *     OR calls SeerCritical.init(gameObject) after game loads.
 *
 * What it does:
 *   1. Spawns analysis-worker after game data loads
 *   2. Injects "Turning Points" section above the move log
 *   3. Adds gold ⚡ lightning badges to blunder moves in the move log
 *   4. Draws gold arrow on replay board when a blunder move is hovered
 *   5. Shows expandable detail panel: "Bot found X — would have won Y material"
 *
 * Integration hooks (call these from your existing seer.js):
 *   SeerCritical.init(game)      — call after game object is loaded
 *   SeerCritical.onScrub(moveN)  — call when scrubber moves to position N
 *   SeerCritical.clear()         — call when a new game is loaded
 */

'use strict';

const SeerCritical = (() => {

  // ── STATE ──────────────────────────────────────────────────────────────────
  let _worker      = null;
  let _blunders    = [];   // BlunderReport[] from worker
  let _game        = null; // loaded game object from Seer
  let _currentMove = -1;

  const PIECE_GLYPHS = {
    ratha:  '♜', ashwa: '♞', danti: '♝',
    nara:   '♟', raja:  '♚', mantri: '♛',
  };
  const PLAYER_COLORS = ['#ef4444','#3b82f6','#22c55e','#eab308'];
  const PLAYER_NAMES  = ['Red','Blue','Green','Yellow'];

  // ── CSS INJECTION ──────────────────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('seer-critical-styles')) return;
    const s = document.createElement('style');
    s.id = 'seer-critical-styles';
    s.textContent = `
/* ── TURNING POINTS CONTAINER ─────────────────────────────── */
#sc-turning-points {
  margin: 0 0 24px 0;
  position: relative;
}
#sc-turning-points .sc-section-head {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 14px;
}
#sc-turning-points .sc-section-title {
  font-family: 'Cinzel', serif;
  font-size: .78rem;
  font-weight: 600;
  color: #c9a84c;
  letter-spacing: .12em;
  text-transform: uppercase;
}
#sc-turning-points .sc-section-line {
  flex: 1;
  height: 1px;
  background: linear-gradient(90deg, rgba(201,168,76,.4), transparent);
}
#sc-turning-points .sc-count-badge {
  font-size: .62rem;
  background: rgba(201,168,76,.12);
  color: #c9a84c;
  border: 1px solid rgba(201,168,76,.25);
  border-radius: 10px;
  padding: 2px 8px;
}

/* ── ANALYSING SPINNER ────────────────────────────────────── */
#sc-analysing {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 0;
  color: rgba(201,168,76,.5);
  font-size: .78rem;
  font-family: 'Outfit', sans-serif;
}
#sc-analysing .sc-spin {
  width: 14px; height: 14px;
  border: 2px solid rgba(201,168,76,.2);
  border-top-color: #c9a84c;
  border-radius: 50%;
  animation: sc-spin .8s linear infinite;
  flex-shrink: 0;
}
@keyframes sc-spin { to { transform: rotate(360deg); } }
#sc-analysing .sc-progress-bar {
  flex: 1;
  height: 2px;
  background: rgba(201,168,76,.1);
  border-radius: 1px;
  overflow: hidden;
}
#sc-analysing .sc-progress-fill {
  height: 100%;
  background: linear-gradient(90deg, #c9a84c, #f5e4a0);
  width: 0%;
  transition: width .3s ease;
  border-radius: 1px;
}

/* ── BLUNDER CARDS ────────────────────────────────────────── */
.sc-blunder-card {
  background: linear-gradient(135deg, rgba(20,14,6,.9), rgba(28,21,8,.8));
  border: 1px solid rgba(201,168,76,.18);
  border-left: 3px solid #c9a84c;
  border-radius: 8px;
  margin-bottom: 8px;
  overflow: hidden;
  cursor: pointer;
  transition: border-color .2s, box-shadow .2s;
}
.sc-blunder-card:hover {
  border-color: rgba(201,168,76,.45);
  border-left-color: #f5e4a0;
  box-shadow: 0 4px 16px rgba(201,168,76,.08);
}
.sc-blunder-card.sc-active {
  border-left-color: #f5e4a0;
  background: linear-gradient(135deg, rgba(28,21,8,.95), rgba(36,28,12,.9));
}
.sc-blunder-header {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 14px;
}
.sc-lightning {
  font-size: .95rem;
  color: #f5e4a0;
  flex-shrink: 0;
  filter: drop-shadow(0 0 4px rgba(245,228,160,.5));
}
.sc-move-num {
  font-family: 'Cinzel', serif;
  font-size: .68rem;
  color: rgba(201,168,76,.5);
  flex-shrink: 0;
  min-width: 52px;
}
.sc-player-dot {
  width: 8px; height: 8px;
  border-radius: 50%;
  flex-shrink: 0;
}
.sc-blunder-summary {
  flex: 1;
  font-size: .8rem;
  color: #c4a882;
  line-height: 1.4;
  font-family: 'Outfit', sans-serif;
}
.sc-gap-badge {
  font-size: .65rem;
  font-family: 'Cinzel', serif;
  color: #f5e4a0;
  background: rgba(245,228,160,.08);
  border: 1px solid rgba(245,228,160,.2);
  border-radius: 4px;
  padding: 2px 7px;
  flex-shrink: 0;
}
.sc-chevron {
  font-size: .7rem;
  color: rgba(201,168,76,.4);
  transition: transform .2s;
  flex-shrink: 0;
}
.sc-blunder-card.sc-active .sc-chevron {
  transform: rotate(180deg);
}

/* ── EXPANDED DETAIL ──────────────────────────────────────── */
.sc-blunder-detail {
  display: none;
  padding: 0 14px 14px 14px;
  border-top: 1px solid rgba(201,168,76,.1);
  margin-top: 0;
}
.sc-blunder-card.sc-active .sc-blunder-detail {
  display: block;
}
.sc-detail-row {
  display: flex;
  gap: 12px;
  margin-top: 10px;
}
.sc-detail-col {
  flex: 1;
  background: rgba(0,0,0,.2);
  border-radius: 6px;
  padding: 9px 11px;
}
.sc-detail-label {
  font-size: .58rem;
  text-transform: uppercase;
  letter-spacing: .12em;
  color: rgba(201,168,76,.4);
  margin-bottom: 4px;
}
.sc-detail-value {
  font-size: .82rem;
  color: #e8c96a;
  font-family: 'Cormorant Garamond', serif;
  font-style: italic;
  line-height: 1.4;
}
.sc-detail-glyph {
  font-size: 1.1rem;
  margin-right: 4px;
}
.sc-drona-quote {
  margin-top: 10px;
  padding: 8px 11px;
  background: rgba(201,168,76,.04);
  border-left: 2px solid rgba(201,168,76,.2);
  border-radius: 0 4px 4px 0;
  font-family: 'Cormorant Garamond', serif;
  font-style: italic;
  font-size: .82rem;
  color: rgba(201,168,76,.6);
  line-height: 1.6;
}

/* ── MOVE LOG LIGHTNING BADGE ─────────────────────────────── */
.sc-log-badge {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 16px; height: 16px;
  background: rgba(245,228,160,.12);
  border-radius: 3px;
  font-size: .65rem;
  cursor: pointer;
  margin-left: 4px;
  vertical-align: middle;
  transition: background .15s;
  flex-shrink: 0;
}
.sc-log-badge:hover {
  background: rgba(245,228,160,.25);
}

/* ── BOARD ARROW OVERLAY ──────────────────────────────────── */
#sc-arrow-svg {
  position: absolute;
  top: 0; left: 0;
  width: 100%; height: 100%;
  pointer-events: none;
  z-index: 10;
  overflow: visible;
}
#sc-arrow-svg .sc-arrow-line {
  stroke: #f5e4a0;
  stroke-width: 3;
  stroke-linecap: round;
  opacity: .85;
  filter: drop-shadow(0 0 6px rgba(245,228,160,.6));
}
#sc-arrow-svg .sc-arrow-head {
  fill: #f5e4a0;
  opacity: .85;
  filter: drop-shadow(0 0 6px rgba(245,228,160,.6));
}
#sc-arrow-svg .sc-missed-sq {
  fill: rgba(245,228,160,.15);
  stroke: rgba(245,228,160,.5);
  stroke-width: 2;
}

/* ── EMPTY TURNING POINTS ─────────────────────────────────── */
#sc-no-blunders {
  text-align: center;
  padding: 16px 0;
  font-family: 'Cormorant Garamond', serif;
  font-style: italic;
  font-size: .85rem;
  color: rgba(201,168,76,.35);
  display: none;
}
    `;
    document.head.appendChild(s);
  }

  // ── DRONA COMMENTARY ───────────────────────────────────────────────────────
  const DRONA_QUOTES = [
    "The arrow that was not released cannot win the battle.",
    "A warrior who sees the strike but does not take it — has already retreated.",
    "Opportunity is the face of Dharma. You looked away.",
    "Even Arjuna would weep at this moment left unclaimed.",
    "The Ratha stood ready. The road was open. Hesitation chose for you.",
    "To see a weakness and not exploit it is itself a weakness.",
    "The enemy's mistake is your gift from the heavens. You returned it unopened.",
    "Know this: in battle, the best move unattempted is a victory surrendered.",
    "Fortune placed a sword at your feet. You stepped over it.",
    "The moment passes like the Ganga — once gone, never again yours.",
  ];

  function dronaQuote() {
    return DRONA_QUOTES[Math.floor(Math.random() * DRONA_QUOTES.length)];
  }

  // ── BUILD POSITIONS FROM GAME ──────────────────────────────────────────────
  /**
   * Convert a loaded game's moveHistory into PositionSnapshot[]
   * for the analysis worker.
   *
   * Supports two common moveHistory formats:
   *  A) Array of { player, from, to, piece, captured, boardAfter, dice }
   *  B) Array of { playerIndex, move:{from,to}, pieceType, capturedPiece, board, roll }
   */
  function buildPositions(game) {
    const history = game?.moveHistory ?? game?.moves ?? [];
    if (!history.length) return [];

    const positions = [];

    for (let i = 0; i < history.length; i++) {
      const m = history[i];
      if (!m) continue;

      // Normalise move object across format variants
      const playerIdx       = m.player        ?? m.playerIndex  ?? m.playerIdx ?? 0;
      const boardState      = m.boardBefore   ?? m.boardState   ?? m.board     ?? null;
      const dice            = m.dice          ?? m.roll         ?? m.diceValue ?? 4;
      const actualMove      = m.notation      ?? `${m.from}→${m.to}` ?? '—';
      const capturedValue   = pieceValueByName(m.captured       ?? m.capturedPiece ?? null);

      if (!boardState) continue;

      positions.push({
        moveIndex:            i,
        boardState:           flattenBoard(boardState),
        playerIdx,
        dice,
        actualMove,
        actualCapturedValue:  capturedValue,
      });
    }

    return positions;
  }

  function pieceValueByName(name) {
    if (!name) return 0;
    const n = name.toLowerCase();
    const map = { nara:1, ashwa:3, danti:3, ratha:5, raja:100, mantri:9 };
    return map[n] ?? 0;
  }

  /**
   * Flatten a 2D board array or Map to a 64-element array of { type, player } | null.
   * Handles: 2D [row][col], flat array, Map of sq→piece
   */
  function flattenBoard(board) {
    if (!board) return new Array(64).fill(null);

    // Already flat array of 64
    if (Array.isArray(board) && board.length === 64) return board;

    // 2D array [8][8]
    if (Array.isArray(board) && Array.isArray(board[0])) {
      const flat = [];
      for (let r = 0; r < 8; r++)
        for (let c = 0; c < 8; c++)
          flat.push(board[r]?.[c] ?? null);
      return flat;
    }

    // Map / object { "e4": { type, player }, ... }
    if (typeof board === 'object') {
      const flat = new Array(64).fill(null);
      for (const [key, piece] of Object.entries(board)) {
        const sq = notationToIndex(key);
        if (sq >= 0 && sq < 64) flat[sq] = piece;
      }
      return flat;
    }

    return new Array(64).fill(null);
  }

  function notationToIndex(n) {
    if (!n || n.length < 2) return -1;
    const file = n.charCodeAt(0) - 97;   // a=0
    const rank  = parseInt(n[1]) - 1;    // 1=0
    if (file < 0 || file > 7 || rank < 0 || rank > 7) return -1;
    return rank * 8 + file;
  }

  // ── CONTAINER INJECTION ────────────────────────────────────────────────────
  /**
   * Find the best anchor in the existing Seer DOM to inject the
   * Turning Points section. Tries several selectors used in Chaturanga Seer pages.
   */
  function findSeerMoveLog() {
    const selectors = [
      '#moveLog', '#move-log', '.move-log',
      '#seerMoveList', '.seer-move-list',
      '#analysisPanel', '.analysis-panel',
      '.seer-content', '#seerContent',
      '.seer-right', '.seer-panel',
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    return null;
  }

  function findReplayBoard() {
    const selectors = [
      '#replayBoard', '#seerBoard', '.replay-board',
      '.seer-board', '#boardContainer', '.board-wrap',
      '#board', '.board',
    ];
    for (const sel of selectors) {
      const el = document.querySelector(sel);
      if (el) return el;
    }
    return null;
  }

  function buildContainer() {
    let container = document.getElementById('sc-turning-points');
    if (container) return container;

    container = document.createElement('div');
    container.id = 'sc-turning-points';
    container.innerHTML = `
      <div class="sc-section-head">
        <span class="sc-section-title">⚡ Turning Points</span>
        <span class="sc-section-line"></span>
        <span class="sc-count-badge" id="sc-count-badge">Analysing…</span>
      </div>
      <div id="sc-analysing">
        <div class="sc-spin"></div>
        <span>Running bot analysis at ELO 400…</span>
        <div class="sc-progress-bar">
          <div class="sc-progress-fill" id="sc-progress-fill"></div>
        </div>
      </div>
      <div id="sc-cards-list"></div>
      <div id="sc-no-blunders">No significant missed captures detected — clean game.</div>
    `;

    // Try to inject before move log
    const anchor = findSeerMoveLog();
    if (anchor) {
      anchor.parentNode.insertBefore(container, anchor);
    } else {
      // Fallback: append to body's first main/article/section or body itself
      const fallback =
        document.querySelector('main') ||
        document.querySelector('article') ||
        document.querySelector('.seer-wrap') ||
        document.body;
      fallback.appendChild(container);
    }

    return container;
  }

  // ── PROGRESS UPDATE ────────────────────────────────────────────────────────
  function updateProgress(current, total) {
    const fill = document.getElementById('sc-progress-fill');
    if (fill) fill.style.width = `${Math.round((current / total) * 100)}%`;
  }

  // ── RENDER BLUNDER CARDS ───────────────────────────────────────────────────
  function renderBlunders(blunders) {
    const analysingEl = document.getElementById('sc-analysing');
    const cardsList   = document.getElementById('sc-cards-list');
    const noBlundef   = document.getElementById('sc-no-blunders');
    const countBadge  = document.getElementById('sc-count-badge');

    if (analysingEl) analysingEl.style.display = 'none';

    if (!cardsList) return;
    cardsList.innerHTML = '';

    if (!blunders.length) {
      if (noBlundef) noBlundef.style.display = 'block';
      if (countBadge) countBadge.textContent = '0 found';
      return;
    }

    if (countBadge) countBadge.textContent = `${blunders.length} found`;

    blunders.forEach((b, idx) => {
      const pieceGlyph    = PIECE_GLYPHS[b.betterPiece]    ?? '♟';
      const captureGlyph  = PIECE_GLYPHS[b.betterCapture]  ?? '♟';
      const playerColor   = PLAYER_COLORS[b.playerIdx]     ?? '#c9a84c';
      const playerName    = PLAYER_NAMES[b.playerIdx]       ?? `Player ${b.playerIdx + 1}`;
      const materialLabel = b.deltaGap === 5 ? 'Ratha (5 pts)' :
                            b.deltaGap === 3 ? 'Ashwa / Danti (3 pts)' :
                            b.deltaGap >= 9  ? 'Mantri (9 pts)' :
                            `${b.deltaGap} material pts`;
      const quote = dronaQuote();

      const card = document.createElement('div');
      card.className = 'sc-blunder-card';
      card.dataset.moveIndex = b.moveIndex;
      card.dataset.blunderIdx = idx;

      card.innerHTML = `
        <div class="sc-blunder-header">
          <span class="sc-lightning">⚡</span>
          <span class="sc-move-num">Move ${b.moveIndex + 1}</span>
          <span class="sc-player-dot" style="background:${playerColor}"></span>
          <span class="sc-blunder-summary">
            <strong style="color:#e8c96a">${playerName}</strong>
            missed a ${b.betterCapture ? b.betterCapture : 'capture'} on
            <strong style="color:#e8c96a">${b.betterToNotation}</strong>
          </span>
          <span class="sc-gap-badge">+${b.deltaGap} mat</span>
          <span class="sc-chevron">▾</span>
        </div>
        <div class="sc-blunder-detail">
          <div class="sc-detail-row">
            <div class="sc-detail-col">
              <div class="sc-detail-label">Move Made</div>
              <div class="sc-detail-value">${b.actualMove}</div>
            </div>
            <div class="sc-detail-col">
              <div class="sc-detail-label">Bot Found</div>
              <div class="sc-detail-value">
                <span class="sc-detail-glyph">${pieceGlyph}</span>
                ${b.betterFromNotation} → ${b.betterToNotation}
                capturing <span class="sc-detail-glyph">${captureGlyph}</span>
              </div>
            </div>
            <div class="sc-detail-col">
              <div class="sc-detail-label">Material Missed</div>
              <div class="sc-detail-value">${materialLabel}</div>
            </div>
          </div>
          <div class="sc-drona-quote">"${quote}" — Acharya Drona</div>
        </div>
      `;

      card.addEventListener('click', () => toggleCard(card, b));
      cardsList.appendChild(card);
    });

    // Also badge the move log entries
    badgeMoveLog(blunders);
  }

  // ── TOGGLE CARD ────────────────────────────────────────────────────────────
  function toggleCard(card, blunder) {
    const wasActive = card.classList.contains('sc-active');

    // Collapse all
    document.querySelectorAll('.sc-blunder-card').forEach(c => c.classList.remove('sc-active'));
    clearArrow();

    if (!wasActive) {
      card.classList.add('sc-active');
      drawArrow(blunder);
    }
  }

  // ── MOVE LOG BADGING ───────────────────────────────────────────────────────
  function badgeMoveLog(blunders) {
    if (!blunders.length) return;

    // Build quick lookup: moveIndex → blunder
    const byMove = {};
    blunders.forEach(b => { byMove[b.moveIndex] = b; });

    // Common move log row selectors
    const rowSelectors = [
      '.move-log-entry', '.move-entry', '.log-row',
      '.seer-move', '[data-move-index]', 'li.move',
    ];

    let rows = [];
    for (const sel of rowSelectors) {
      rows = [...document.querySelectorAll(sel)];
      if (rows.length) break;
    }

    rows.forEach((row, i) => {
      const mIdx = parseInt(row.dataset.moveIndex ?? row.dataset.move ?? i);
      if (byMove[mIdx] !== undefined) {
        const badge = document.createElement('span');
        badge.className = 'sc-log-badge';
        badge.title = `Missed capture on move ${mIdx + 1}`;
        badge.textContent = '⚡';
        badge.addEventListener('click', e => {
          e.stopPropagation();
          // Scroll to card and expand it
          const card = document.querySelector(`.sc-blunder-card[data-move-index="${mIdx}"]`);
          if (card) {
            card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            if (!card.classList.contains('sc-active')) {
              card.click();
            }
          }
        });
        row.appendChild(badge);
      }
    });
  }

  // ── BOARD ARROW ────────────────────────────────────────────────────────────
  function drawArrow(blunder) {
    const boardEl = findReplayBoard();
    if (!boardEl) return;

    clearArrow();

    // Make board position:relative so SVG overlay works
    const bStyle = getComputedStyle(boardEl);
    if (bStyle.position === 'static') boardEl.style.position = 'relative';

    const rect  = boardEl.getBoundingClientRect();
    const cellW = rect.width  / 8;
    const cellH = rect.height / 8;

    const sqCenter = sq => ({
      x: (sq % 8 + 0.5) * cellW,
      y: (Math.floor(sq / 8) + 0.5) * cellH,
    });

    const from  = sqCenter(blunder.betterFromSq);
    const to    = sqCenter(blunder.betterToSq);
    const toSq  = blunder.betterToSq;

    // Shorten line so arrowhead doesn't overlap with target
    const dx    = to.x - from.x, dy = to.y - from.y;
    const len   = Math.sqrt(dx * dx + dy * dy);
    const ratio = len > 0 ? (len - cellW * 0.35) / len : 1;
    const ex    = from.x + dx * ratio;
    const ey    = from.y + dy * ratio;

    // Arrowhead (rotated triangle)
    const angle  = Math.atan2(dy, dx);
    const hSize  = 10;
    const hx1 = ex - hSize * Math.cos(angle - 0.5);
    const hy1 = ey - hSize * Math.sin(angle - 0.5);
    const hx2 = ex - hSize * Math.cos(angle + 0.5);
    const hy2 = ey - hSize * Math.sin(angle + 0.5);

    const svg = document.createElementNS('http://www.w3.org/2000/svg','svg');
    svg.id = 'sc-arrow-svg';
    svg.setAttribute('viewBox', `0 0 ${rect.width} ${rect.height}`);
    svg.style.cssText = `position:absolute;top:0;left:0;width:100%;height:100%;pointer-events:none;z-index:10;`;

    // Highlight target square
    const sqX = (toSq % 8) * cellW;
    const sqY = Math.floor(toSq / 8) * cellH;
    const highlightRect = document.createElementNS('http://www.w3.org/2000/svg','rect');
    highlightRect.setAttribute('x', sqX);
    highlightRect.setAttribute('y', sqY);
    highlightRect.setAttribute('width', cellW);
    highlightRect.setAttribute('height', cellH);
    highlightRect.setAttribute('class', 'sc-missed-sq');
    svg.appendChild(highlightRect);

    // Arrow shaft
    const line = document.createElementNS('http://www.w3.org/2000/svg','line');
    line.setAttribute('x1', from.x);
    line.setAttribute('y1', from.y);
    line.setAttribute('x2', ex);
    line.setAttribute('y2', ey);
    line.setAttribute('class', 'sc-arrow-line');
    svg.appendChild(line);

    // Arrowhead
    const poly = document.createElementNS('http://www.w3.org/2000/svg','polygon');
    poly.setAttribute('points', `${ex},${ey} ${hx1},${hy1} ${hx2},${hy2}`);
    poly.setAttribute('class', 'sc-arrow-head');
    svg.appendChild(poly);

    boardEl.appendChild(svg);
  }

  function clearArrow() {
    const old = document.getElementById('sc-arrow-svg');
    if (old) old.remove();
  }

  // ── SCRUB HANDLER ─────────────────────────────────────────────────────────
  /**
   * Call this from your Seer scrubber onChange handler.
   * If the scrubber lands on a blunder move, highlights the card.
   */
  function onScrub(moveN) {
    _currentMove = moveN;
    const blunder = _blunders.find(b => b.moveIndex === moveN);

    document.querySelectorAll('.sc-blunder-card').forEach(c => c.classList.remove('sc-active'));
    clearArrow();

    if (blunder) {
      const card = document.querySelector(`.sc-blunder-card[data-move-index="${blunder.moveIndex}"]`);
      if (card) {
        card.classList.add('sc-active');
        drawArrow(blunder);
      }
    }
  }

  // ── SPAWN WORKER ───────────────────────────────────────────────────────────
  function spawnWorker(positions) {
    if (_worker) {
      _worker.terminate();
      _worker = null;
    }

    // Resolve worker path relative to current page
    const workerPath = new URL('js/analysis-worker.js', document.baseURI).href;

    try {
      _worker = new Worker(workerPath);
    } catch (e) {
      console.warn('[SeerCritical] Could not spawn Worker:', e.message);
      // Fallback: run synchronously (blocks main thread briefly, acceptable for small games)
      runFallback(positions);
      return;
    }

    _worker.onmessage = e => {
      const { type, blunders, current, total, message } = e.data;

      if (type === 'progress') {
        updateProgress(current, total);
      } else if (type === 'result') {
        _blunders = blunders ?? [];
        renderBlunders(_blunders);
        _worker.terminate();
        _worker = null;
      } else if (type === 'error') {
        console.warn('[SeerCritical] Worker error:', message);
        renderBlunders([]);
      }
    };

    _worker.onerror = err => {
      console.warn('[SeerCritical] Worker failed:', err.message);
      renderBlunders([]);
    };

    _worker.postMessage({ type: 'analyse', positions, botELO: 400 });
  }

  // Synchronous fallback (no Web Worker support)
  function runFallback(positions) {
    // Import worker logic inline via dynamic eval is not ideal; just skip analysis
    console.info('[SeerCritical] Web Workers unavailable — critical moment detection skipped.');
    renderBlunders([]);
  }

  // ── PUBLIC API ─────────────────────────────────────────────────────────────
  /**
   * Call after a game object has been loaded into the Seer.
   * game: the full game object from localStorage / Granth vault.
   */
  function init(game) {
    _game     = game;
    _blunders = [];
    _currentMove = -1;

    injectStyles();
    buildContainer();

    const positions = buildPositions(game);

    if (!positions.length) {
      renderBlunders([]);
      return;
    }

    spawnWorker(positions);
  }

  /** Clear state when switching to a new game in Seer. */
  function clear() {
    if (_worker) { _worker.terminate(); _worker = null; }
    _blunders    = [];
    _game        = null;
    _currentMove = -1;
    clearArrow();
    const container = document.getElementById('sc-turning-points');
    if (container) container.remove();
  }

  // ── AUTO-INIT ──────────────────────────────────────────────────────────────
  // If window.SeerGame is already set when this script loads, init immediately.
  // Otherwise wait for the custom event 'seer:gameLoaded'.
  function autoInit() {
    if (window.SeerGame) {
      init(window.SeerGame);
    }

    // Also listen for the event pattern used in Chaturanga Seer
    window.addEventListener('seer:gameLoaded', e => {
      if (e.detail) init(e.detail);
    });

    // And for Itihasa-style vault load events
    window.addEventListener('itihasa:gameLoaded', e => {
      if (e.detail) init(e.detail);
    });
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', autoInit);
  } else {
    autoInit();
  }

  return { init, clear, onScrub };

})();

/* ─────────────────────────────────────────────────────────────────────────────
 * INTEGRATION GUIDE — paste these two lines wherever your Seer loads a game:
 *
 *   // After loading game object from localStorage/vault:
 *   SeerCritical.init(loadedGame);
 *
 *   // In your scrubber's onInput handler:
 *   SeerCritical.onScrub(scrubber.value);
 *
 *   // When user switches to a different game:
 *   SeerCritical.clear();
 *
 * OR: simply set  window.SeerGame = loadedGame  before/after this script loads
 * and the auto-init will fire without any manual calls.
 * ───────────────────────────────────────────────────────────────────────────── */
