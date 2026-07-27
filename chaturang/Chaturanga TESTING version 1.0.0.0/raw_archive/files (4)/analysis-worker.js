/**
 * analysis-worker.js — Chaturanga Critical Moment Detection
 * Web Worker. Runs off main thread. No DOM access.
 *
 * Protocol:
 *   IN  → { type:'analyse', positions:[PositionSnapshot], botELO:400 }
 *   OUT ← { type:'result',  blunders:[BlunderReport] }
 *   OUT ← { type:'progress', current:N, total:N }
 *   OUT ← { type:'error',   message:string }
 *
 * PositionSnapshot  { moveIndex, boardState, currentPlayer, dice,
 *                     actualMove, moveHistory, captured }
 * BlunderReport     { moveIndex, playerIndex, playerName,
 *                     actualMove, betterMove, deltaGap,
 *                     pieceType, fromSq, toSq, betterFromSq, betterToSq }
 */

'use strict';

// ─── PIECE VALUES ─────────────────────────────────────────────────────────────
const PIECE_VALUE = {
  nara:   1,   // pawn
  ashwa:  3,   // knight
  danti:  3,   // bishop / elephant
  ratha:  5,   // rook / chariot
  raja: 100,   // king (effectively ∞)
  mantri: 9,   // queen variant (if present)
};

const PLAYER_NAMES = ['Red', 'Blue', 'Green', 'Yellow'];

// ─── MATERIAL HELPERS ────────────────────────────────────────────────────────
function pieceValue(type) {
  return PIECE_VALUE[type?.toLowerCase?.()] ?? 0;
}

/**
 * Sum material on board for a given player index.
 * boardState is a flat 64-element array of { type, player } | null.
 */
function countMaterial(boardState, playerIdx) {
  let total = 0;
  for (const cell of boardState) {
    if (cell && cell.player === playerIdx) total += pieceValue(cell.type);
  }
  return total;
}

// ─── MOVE GENERATION ─────────────────────────────────────────────────────────
/**
 * Generate all pseudo-legal capture moves for a player given a dice roll.
 * Returns array of { from, to, capturedValue, piece }
 *
 * This is a simplified engine — sufficient for post-game blunder spotting.
 * It does NOT enforce all Chaturanga rules (e.g., raja in check safety)
 * but is accurate enough to detect missed material gains of >= 3 points.
 */
function generateCaptureMoves(boardState, playerIdx, dice) {
  const captures = [];
  const size = 8;
  const toXY = sq => ({ x: sq % size, y: Math.floor(sq / size) });
  const toSq  = (x, y) => y * size + x;
  const inBounds = (x, y) => x >= 0 && x < size && y >= 0 && y < size;
  const isEnemy  = (sq, p) => boardState[sq] && boardState[sq].player !== p;
  const isOccupied = sq => !!boardState[sq];

  for (let from = 0; from < 64; from++) {
    const piece = boardState[from];
    if (!piece || piece.player !== playerIdx) continue;

    const { x, y } = toXY(from);
    const type = piece.type?.toLowerCase();
    const moves = [];

    if (type === 'ratha') {
      // Rook — slides along ranks/files up to dice squares
      for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1]]) {
        for (let step = 1; step <= dice; step++) {
          const nx = x + dx * step, ny = y + dy * step;
          if (!inBounds(nx, ny)) break;
          const to = toSq(nx, ny);
          if (isEnemy(to, playerIdx)) { moves.push(to); break; }
          if (isOccupied(to)) break;
        }
      }
    } else if (type === 'danti') {
      // Bishop — slides diagonals
      for (const [dx, dy] of [[1,1],[1,-1],[-1,1],[-1,-1]]) {
        for (let step = 1; step <= dice; step++) {
          const nx = x + dx * step, ny = y + dy * step;
          if (!inBounds(nx, ny)) break;
          const to = toSq(nx, ny);
          if (isEnemy(to, playerIdx)) { moves.push(to); break; }
          if (isOccupied(to)) break;
        }
      }
    } else if (type === 'ashwa') {
      // Knight — L-shape, dice value used as multiplier in some Chaturanga variants
      // Standard: dice=5 moves 2+3 squares, dice=1 moves 1+2
      // We use classic L-shape regardless of dice for simplicity
      for (const [dx, dy] of [[2,1],[2,-1],[-2,1],[-2,-1],[1,2],[1,-2],[-1,2],[-1,-2]]) {
        const nx = x + dx, ny = y + dy;
        if (!inBounds(nx, ny)) continue;
        const to = toSq(nx, ny);
        if (isEnemy(to, playerIdx)) moves.push(to);
      }
    } else if (type === 'raja') {
      // King — 1 square any direction
      for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]) {
        const nx = x + dx, ny = y + dy;
        if (!inBounds(nx, ny)) continue;
        const to = toSq(nx, ny);
        if (isEnemy(to, playerIdx)) moves.push(to);
      }
    } else if (type === 'nara') {
      // Pawn — captures diagonally forward (toward opponent's side)
      // Direction depends on player: Red(0)→up, Blue(1)→down, Green(2)→left, Yellow(3)→right
      const dirs = { 0:[[-1,1],[1,1]], 1:[[-1,-1],[1,-1]], 2:[[1,-1],[1,1]], 3:[[-1,-1],[-1,1]] };
      const pawnDirs = dirs[playerIdx] ?? [[-1,1],[1,1]];
      for (const [dx, dy] of pawnDirs) {
        const nx = x + dx, ny = y + dy;
        if (!inBounds(nx, ny)) continue;
        const to = toSq(nx, ny);
        if (isEnemy(to, playerIdx)) moves.push(to);
      }
    } else if (type === 'mantri') {
      // Queen — slides in all 8 directions
      for (const [dx, dy] of [[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]) {
        for (let step = 1; step <= 7; step++) {
          const nx = x + dx * step, ny = y + dy * step;
          if (!inBounds(nx, ny)) break;
          const to = toSq(nx, ny);
          if (isEnemy(to, playerIdx)) { moves.push(to); break; }
          if (isOccupied(to)) break;
        }
      }
    }

    for (const to of moves) {
      const target = boardState[to];
      if (target) {
        captures.push({
          from, to, piece: type,
          capturedType:  target.type,
          capturedValue: pieceValue(target.type),
        });
      }
    }
  }

  // Sort by captured value descending — best capture first
  captures.sort((a, b) => b.capturedValue - a.capturedValue);
  return captures;
}

/**
 * For a given position, find the best capture available to the player.
 * Returns { capturedValue, from, to, piece, capturedType } or null.
 */
function bestCapture(boardState, playerIdx, dice) {
  const captures = generateCaptureMoves(boardState, playerIdx, dice);
  return captures.length ? captures[0] : null;
}

// ─── BLUNDER THRESHOLD ───────────────────────────────────────────────────────
// If the bot could capture X material and the player captured Y (or 0),
// and X - Y >= THRESHOLD, it's a missed win (critical moment).
const BLUNDER_THRESHOLD = 3; // Ashwa or better

// ─── MAIN ANALYSIS ───────────────────────────────────────────────────────────
function analysePositions(positions, botELO) {
  const blunders = [];
  const total = positions.length;

  for (let i = 0; i < total; i++) {
    const snap = positions[i];

    // Progress update every 5 positions
    if (i % 5 === 0) {
      postMessage({ type: 'progress', current: i, total });
    }

    try {
      const { moveIndex, boardState, playerIdx, dice,
              actualMove, actualCapturedValue = 0 } = snap;

      if (!boardState || !Array.isArray(boardState)) continue;

      // What was the best capture the player could have made?
      const best = bestCapture(boardState, playerIdx, dice);

      if (!best) continue; // No captures available → nothing to miss

      const deltaGap = best.capturedValue - actualCapturedValue;

      if (deltaGap < BLUNDER_THRESHOLD) continue; // Not significant enough

      // Reconstruct readable square notation (a1–h8)
      const sqNotation = sq => {
        const file = String.fromCharCode(97 + (sq % 8));
        const rank = Math.floor(sq / 8) + 1;
        return `${file}${rank}`;
      };

      blunders.push({
        moveIndex,
        playerIdx,
        playerName:     PLAYER_NAMES[playerIdx] ?? `Player ${playerIdx + 1}`,
        actualMove:     actualMove ?? '—',
        actualCapturedValue,
        betterPiece:    best.piece,
        betterCapture:  best.capturedType,
        betterFromSq:   best.from,
        betterToSq:     best.to,
        betterFromNotation: sqNotation(best.from),
        betterToNotation:   sqNotation(best.to),
        deltaGap,
        botELO,
      });

    } catch (err) {
      // Skip bad positions silently
    }
  }

  return blunders;
}

// ─── MESSAGE HANDLER ─────────────────────────────────────────────────────────
self.onmessage = function(e) {
  const { type, positions, botELO = 400 } = e.data;

  if (type !== 'analyse') return;

  if (!Array.isArray(positions) || positions.length === 0) {
    postMessage({ type: 'result', blunders: [] });
    return;
  }

  try {
    const blunders = analysePositions(positions, botELO);
    postMessage({ type: 'result', blunders });
  } catch (err) {
    postMessage({ type: 'error', message: err.message });
  }
};
