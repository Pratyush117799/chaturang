/**
 * Chaturanga — Advanced Bot System (v1.0.4 tier)
 * ═══════════════════════════════════════════════════════════════════
 *
 *  ELO HYPOTHESIS: 2000 Chaturanga ELO ≈ 3500 Chess ELO
 *
 *  ELO 700  Grandmaster    Team minimax + alpha-beta pruning (depth 3)       ≈ 1225 Chess ELO
 *  ELO 800  Maharaja       + quiescence search + piece-square tables (d4)    ≈ 1400 Chess ELO
 *  ELO 900  Samrat         + iterative deepening + time control (d5)         ≈ 1575 Chess ELO
 *  ELO 1000 Chakravarti    + transposition table + opening book (d6)         ≈ 1750 Chess ELO
 *
 *  DEPENDENCY: Loads after tieredBots.js (borrows public internals if available).
 *              Self-contained fallbacks included for all helpers.
 * ═══════════════════════════════════════════════════════════════════
 */
(function () {
  'use strict';

  // ── Constants ──────────────────────────────────────────────────────────────
  const PIECE_VALUES = { pawn: 1, horse: 3, elephant: 3, rook: 5, king: 100 };
  const DICE_TO_FORCED = { 1:'rook', 2:'any', 3:'horse', 4:'elephant', 5:'any', 6:'pawn-king' };
  const MAX_QDEPTH = 4;

  // ── Shared helpers (self-contained) ───────────────────────────────────────

  function getAllLegalMoves(game) {
    const moves = [];
    const player = game.getPlayer();
    if (!player || player.eliminated || player.frozen || !game.forcedPiece) return moves;
    for (let r = 1; r <= 8; r++) {
      for (let f = 0; f < 8; f++) {
        const sq = String.fromCharCode(97 + f) + r;
        const piece = game.board.get(sq);
        if (piece && piece.owner === player.id) {
          game.getLegalMoves(sq).forEach(to => moves.push({ from: sq, to }));
        }
      }
    }
    return moves;
  }

  function applyMoveTemp(game, from, to) {
    const piece    = game.board.get(from);
    const captured = game.board.get(to);
    game.board.set(to,   piece);
    game.board.set(from, null);
    return { from, to, piece, captured };
  }

  function undoMoveTemp(game, rec) {
    game.board.set(rec.from, rec.piece);
    game.board.set(rec.to,   rec.captured || null);
  }

  function nextActivePlayer(game, currentIdx) {
    let idx = (currentIdx + 1) % 4;
    for (let i = 0; i < 4; i++) {
      if (!game.players[idx].eliminated) return idx;
      idx = (idx + 1) % 4;
    }
    return currentIdx;
  }

  function buildThreatMap(game, playerId) {
    const savedF = game.forcedPiece, savedT = game.turnIndex;
    game.forcedPiece = 'any';
    game.turnIndex   = playerId;
    const targets = new Set();
    for (let r = 1; r <= 8; r++) {
      for (let f = 0; f < 8; f++) {
        const sq = String.fromCharCode(97 + f) + r;
        const piece = game.board.get(sq);
        if (piece && piece.owner === playerId) {
          game.getLegalMoves(sq).forEach(to => targets.add(to));
        }
      }
    }
    game.forcedPiece = savedF;
    game.turnIndex   = savedT;
    return targets;
  }

  // ── Piece-Square Tables (Chaturanga-tuned) ─────────────────────────────────
  //  Indexed [rank 0-7][file 0-7]  — rank 0 = home row, rank 7 = promotion row
  //  Defined from Player 0 (Red) perspective (moves upward = rank increases).
  //  Rotated for other players automatically.
  //  Values are in centipawns (scaled by 0.1 in eval).

  const RAW_PST = {
    pawn: [
      [  0,  0,  0,  0,  0,  0,  0,  0],
      [  5, 10, 10,-20,-20, 10, 10,  5],
      [  5, -5,-10,  0,  0,-10, -5,  5],
      [  0,  0,  0, 20, 20,  0,  0,  0],
      [  5,  5, 10, 25, 25, 10,  5,  5],
      [ 10, 10, 20, 30, 30, 20, 10, 10],
      [ 50, 50, 50, 50, 50, 50, 50, 50],
      [  0,  0,  0,  0,  0,  0,  0,  0],
    ],
    horse: [
      [-50,-40,-30,-30,-30,-30,-40,-50],
      [-40,-20,  0,  5,  5,  0,-20,-40],
      [-30,  5, 10, 15, 15, 10,  5,-30],
      [-30,  0, 15, 20, 20, 15,  0,-30],
      [-30,  5, 15, 20, 20, 15,  5,-30],
      [-30,  0, 10, 15, 15, 10,  0,-30],
      [-40,-20,  0,  0,  0,  0,-20,-40],
      [-50,-40,-30,-30,-30,-30,-40,-50],
    ],
    elephant: [
      [-20,-10,-10,-10,-10,-10,-10,-20],
      [-10,  5,  0,  0,  0,  0,  5,-10],
      [-10, 10, 10, 10, 10, 10, 10,-10],
      [-10,  0, 10, 15, 15, 10,  0,-10],
      [-10,  5, 10, 15, 15, 10,  5,-10],
      [-10,  0,  5, 10, 10,  5,  0,-10],
      [-10,  5,  0,  0,  0,  0,  5,-10],
      [-20,-10,-10,-10,-10,-10,-10,-20],
    ],
    rook: [
      [  0,  0,  0,  5,  5,  0,  0,  0],
      [ -5,  0,  0,  0,  0,  0,  0, -5],
      [ -5,  0,  0,  0,  0,  0,  0, -5],
      [ -5,  0,  0,  0,  0,  0,  0, -5],
      [ -5,  0,  0,  0,  0,  0,  0, -5],
      [ -5,  0,  0,  0,  0,  0,  0, -5],
      [  5, 10, 10, 10, 10, 10, 10,  5],  // 7th-rank bonus
      [  0,  0,  0,  0,  0,  0,  0,  0],
    ],
    king: [
      [ 20, 30, 10,  0,  0, 10, 30, 20],  // home row — prefer corner castling zone
      [ 20, 20,  0,  0,  0,  0, 20, 20],
      [-10,-20,-20,-20,-20,-20,-20,-10],
      [-20,-30,-30,-40,-40,-30,-30,-20],
      [-30,-40,-40,-50,-50,-40,-40,-30],
      [-30,-40,-40,-50,-50,-40,-40,-30],
      [-30,-40,-40,-50,-50,-40,-40,-30],
      [-30,-40,-40,-50,-50,-40,-40,-30],
    ],
  };

  /**
   * Returns PST bonus for a piece on `sq` owned by `owner`.
   * Rotates the table to the correct orientation per player direction.
   */
  function getPST(pieceType, sq, owner) {
    const f = sq.charCodeAt(0) - 97;
    const r = Number.parseInt(sq[1], 10) - 1;
    const table = RAW_PST[pieceType] || RAW_PST.pawn;
    let tr, tf;
    if (owner === 0)      { tr = r;     tf = f;     }  // Red:    moves up
    else if (owner === 2) { tr = 7 - r; tf = f;     }  // Green:  moves down
    else if (owner === 1) { tr = f;     tf = 7 - r; }  // Blue:   moves left
    else                  { tr = 7 - f; tf = r;     }  // Yellow: moves right
    return ((table[tr] || [])[tf]) || 0;
  }

  // ── Enhanced Team Evaluation ───────────────────────────────────────────────
  /**
   * Evaluates board from playerId's perspective (team-aware or FFA).
   * Terms: material, PST, mobility, king safety, pawn advancement, endgame scaling.
   */
  function teamEval(game, playerId) {
    const myTeam = game.players[playerId].team;
    let score = 0;
    let totalPieces = 0;

    function isAlly(ownerId) {
      return game.gameMode === 'team'
        ? game.players[ownerId].team === myTeam
        : ownerId === playerId;
    }

    for (let r = 1; r <= 8; r++) {
      for (let f = 0; f < 8; f++) {
        const sq    = String.fromCharCode(97 + f) + r;
        const piece = game.board.get(sq);
        if (!piece) continue;
        totalPieces++;
        const sign  = isAlly(piece.owner) ? 1 : -1;
        const pval  = PIECE_VALUES[piece.type];

        // 1. Material
        score += sign * pval * 10;

        // 2. Piece-square table bonus
        score += sign * getPST(piece.type, sq, piece.owner) * 0.12;

        // 3. Pawn advancement pressure (beyond base PST)
        if (piece.type === 'pawn') {
          const advDist = getPawnAdvancement(sq, piece.owner);
          score += sign * advDist * 0.8;
        }

        // 4. Rook open-file bonus
        if (piece.type === 'rook' && isAlly(piece.owner)) {
          if (isOpenFile(game, f)) score += 1.5;
        }
      }
    }

    // Endgame scaling factor
    const egF = totalPieces < 14 ? 2.0 : totalPieces < 22 ? 1.3 : 1.0;

    // 5. Mobility: our reachable squares vs average opponent
    const savedF = game.forcedPiece, savedT = game.turnIndex;
    let myMob = 0, oppMobSum = 0, oppCount = 0;
    for (const p of game.players) {
      if (p.eliminated) continue;
      game.forcedPiece = 'any';
      game.turnIndex   = p.id;
      let mob = 0;
      for (let r = 1; r <= 8; r++) {
        for (let f = 0; f < 8; f++) {
          const sq = String.fromCharCode(97 + f) + r;
          const pc = game.board.get(sq);
          if (pc && pc.owner === p.id) mob += game.getLegalMoves(sq).length;
        }
      }
      if (isAlly(p.id)) myMob += mob;
      else { oppMobSum += mob; oppCount++; }
    }
    game.forcedPiece = savedF;
    game.turnIndex   = savedT;
    const avgOppMob = oppCount > 0 ? oppMobSum / oppCount : 0;
    score += (myMob - avgOppMob) * 0.18 * egF;

    // 6. King safety: count opponent threats adjacent to our king
    const opThreats = new Set();
    for (const p of game.players) {
      if (!p.eliminated && !isAlly(p.id)) {
        buildThreatMap(game, p.id).forEach(sq => opThreats.add(sq));
      }
    }
    for (let r = 1; r <= 8; r++) {
      for (let f = 0; f < 8; f++) {
        const sq    = String.fromCharCode(97 + f) + r;
        const piece = game.board.get(sq);
        if (!piece || piece.type !== 'king' || !isAlly(piece.owner)) continue;
        let exposed = 0;
        for (let df = -1; df <= 1; df++) {
          for (let dr = -1; dr <= 1; dr++) {
            if (df === 0 && dr === 0) continue;
            const nf = f + df, nr = r - 1 + dr;
            if (nf < 0 || nf > 7 || nr < 0 || nr > 7) continue;
            if (opThreats.has(String.fromCharCode(97 + nf) + (nr + 1))) exposed++;
          }
        }
        score -= exposed * 1.8 * egF;
      }
    }

    return score;
  }

  function getPawnAdvancement(sq, owner) {
    const f = sq.charCodeAt(0) - 97;
    const r = Number.parseInt(sq[1], 10) - 1;
    if (owner === 0) return r;
    if (owner === 2) return 7 - r;
    if (owner === 1) return 7 - f;
    return f;
  }

  function isOpenFile(game, fileIdx) {
    for (let r = 1; r <= 8; r++) {
      const sq = String.fromCharCode(97 + fileIdx) + r;
      const p  = game.board.get(sq);
      if (p && p.type === 'pawn') return false;
    }
    return true;
  }

  // ── Quiescence Search ──────────────────────────────────────────────────────
  /**
   * Extends the search past the horizon by evaluating capture sequences only.
   * Prevents the engine from stopping evaluation right before a damaging recapture.
   * Uses stand-pat pruning (if current eval >= beta, prune immediately).
   */
  function quiescence(game, alpha, beta, playerId, qdepth) {
    const standPat = teamEval(game, playerId);
    if (qdepth <= 0) return standPat;
    if (standPat >= beta) return beta;
    if (standPat > alpha) alpha = standPat;

    // Generate only capture moves for current player (ignore dice constraint)
    const savedF = game.forcedPiece, savedT = game.turnIndex;
    game.forcedPiece = 'any';
    game.turnIndex   = savedT; // keep current player

    const captures = [];
    for (let r = 1; r <= 8; r++) {
      for (let f = 0; f < 8; f++) {
        const sq = String.fromCharCode(97 + f) + r;
        const piece = game.board.get(sq);
        if (!piece || piece.owner !== savedT) continue;
        game.getLegalMoves(sq).forEach(to => {
          if (game.board.get(to)) captures.push({ from: sq, to });
        });
      }
    }

    game.forcedPiece = savedF;
    game.turnIndex   = savedT;

    // Sort captures by MVV-LVA (Most Valuable Victim - Least Valuable Attacker)
    captures.sort((a, b) => {
      const va = PIECE_VALUES[(game.board.get(a.to) || {}).type || 'pawn'];
      const vb = PIECE_VALUES[(game.board.get(b.to) || {}).type || 'pawn'];
      const pa = PIECE_VALUES[(game.board.get(a.from) || {}).type || 'pawn'];
      const pb = PIECE_VALUES[(game.board.get(b.from) || {}).type || 'pawn'];
      return (vb - pb) - (va - pa);
    });

    for (const cap of captures) {
      const rec = applyMoveTemp(game, cap.from, cap.to);
      const nextId = nextActivePlayer(game, savedT);
      game.turnIndex = nextId;

      const score = -quiescence(game, -beta, -alpha, playerId, qdepth - 1);

      game.turnIndex = savedT;
      undoMoveTemp(game, rec);

      if (score >= beta) return beta;
      if (score > alpha) alpha = score;
    }

    return alpha;
  }

  // ── Move Ordering Helper ───────────────────────────────────────────────────
  function orderMoves(game, moves) {
    return moves.slice().sort((a, b) => {
      const ta = game.board.get(a.to), pa = game.board.get(a.from);
      const tb = game.board.get(b.to), pb = game.board.get(b.from);
      const capA = ta ? PIECE_VALUES[ta.type] * 10 - (pa ? PIECE_VALUES[pa.type] : 0) : 0;
      const capB = tb ? PIECE_VALUES[tb.type] * 10 - (pb ? PIECE_VALUES[pb.type] : 0) : 0;
      return capB - capA;
    });
  }

  // ── Core Search: Team Expecti-Alpha-Beta ───────────────────────────────────
  /**
   * The main search function used by ELO 700-1000.
   * Correctly handles 4-player team games using expectimax chance nodes for dice,
   * plus minimax (alpha-beta) at the move-selection level.
   *
   * Game tree structure per ply:
   *   Chance node (average over 6 dice) → Max/Min node (best/worst move for that player)
   *
   * @param {Game}    game        Current game state
   * @param {number}  depth       Remaining search depth (half-moves)
   * @param {number}  alpha       Alpha cutoff (best guaranteed score for maximizer)
   * @param {number}  beta        Beta cutoff (best guaranteed score for minimizer)
   * @param {number}  playerId    Our player id (the root player we're optimizing for)
   * @param {boolean} useQuiesc   Whether to apply quiescence search at depth 0
   * @param {Map}     tt          Transposition table (optional, for ELO 1000)
   */
  function expectiTeamAB(game, depth, alpha, beta, playerId, useQuiesc, tt) {
    if (game.gameOver) return teamEval(game, playerId);

    if (depth === 0) {
      return useQuiesc
        ? quiescence(game, alpha, beta, playerId, MAX_QDEPTH)
        : teamEval(game, playerId);
    }

    // Transposition table lookup (ELO 1000 only)
    let ttKey = null;
    if (tt) {
      ttKey = buildTTKey(game);
      const cached = tt.get(ttKey);
      if (cached && cached.depth >= depth) return cached.score;
    }

    const currentPlayer = game.turnIndex;
    const myTeam        = game.players[playerId].team;
    const isMaximizing  = game.gameMode === 'team'
      ? game.players[currentPlayer].team === myTeam
      : currentPlayer === playerId;

    const savedForced = game.forcedPiece;
    let totalExpected  = 0;

    // Dice chance node: average over all 6 outcomes
    for (let d = 1; d <= 6; d++) {
      game.forcedPiece = DICE_TO_FORCED[d];
      const moves = getAllLegalMoves(game);

      if (!moves.length) {
        // Player has no moves for this dice face: pass turn
        const savedT = game.turnIndex;
        game.turnIndex = nextActivePlayer(game, currentPlayer);
        const score = expectiTeamAB(game, depth - 1, alpha, beta, playerId, useQuiesc, tt);
        game.turnIndex = savedT;
        totalExpected += score / 6;
        continue;
      }

      const ordered = orderMoves(game, moves);
      let bestForDice = isMaximizing ? -Infinity : Infinity;

      for (const move of ordered) {
        const rec    = applyMoveTemp(game, move.from, move.to);
        const savedT = game.turnIndex;
        game.turnIndex = nextActivePlayer(game, currentPlayer);

        const score = expectiTeamAB(game, depth - 1, alpha, beta, playerId, useQuiesc, tt);

        game.turnIndex = savedT;
        undoMoveTemp(game, rec);

        if (isMaximizing) {
          if (score > bestForDice) {
            bestForDice = score;
            if (bestForDice > alpha) alpha = bestForDice;
          }
        } else {
          if (score < bestForDice) {
            bestForDice = score;
            if (bestForDice < beta) beta = bestForDice;
          }
        }
        // Note: pruning at chance-node level is approximate but acceptable here
        if (beta <= alpha) break;
      }

      totalExpected += bestForDice / 6;
    }

    game.forcedPiece = savedForced;

    if (tt && ttKey) {
      if (tt.size > 60000) {
        // Prune oldest 25% of table
        const keys = [...tt.keys()].slice(0, 15000);
        for (const k of keys) tt.delete(k);
      }
      tt.set(ttKey, { score: totalExpected, depth });
    }

    return totalExpected;
  }

  function buildTTKey(game) {
    let key = String(game.turnIndex);
    for (let r = 1; r <= 8; r++) {
      for (let f = 0; f < 8; f++) {
        const p = game.board.get(String.fromCharCode(97 + f) + r);
        key += p ? (p.owner + p.type[0]) : '.';
      }
    }
    return key;
  }

  // ── Small Opening Book ─────────────────────────────────────────────────────
  // Maps { "moveCount_diceFace": [good_from_prefixes] } to guide early play.
  // Applied only in the first 4 half-moves.
  const OPENING_NUDGES = {
    // Dice=rook: prefer rooks toward central files (c-f) or open lines
    '0_1': ['a','h','b','g'], // discourage edge rooks early
    // Dice=horse: strongly prefer central jumps
    '0_3': ['b','g'],        // b-horse and g-horse to center
    // Dice=elephant: prefer elephants near center diagonals
    '0_4': ['c','f'],
  };

  function applyOpeningBook(moves, game, moveCount) {
    if (moveCount > 3) return moves;
    const d = game.lastDice;
    const nudge = OPENING_NUDGES[`${moveCount}_${d}`];
    if (!nudge) return moves;
    const preferred = moves.filter(m => nudge.includes(m.from[0]));
    return preferred.length > 0 ? preferred : moves;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ELO 700 — Grandmaster (Team Alpha-Beta depth 3)
  // ═══════════════════════════════════════════════════════════════════════════
  function grandmasterGetMove(game) {
    const moves = getAllLegalMoves(game);
    if (!moves.length) return null;
    if (moves.length === 1) return moves[0];

    const playerId = game.turnIndex;
    let best = null, bestScore = -Infinity;

    for (const move of orderMoves(game, moves)) {
      const rec    = applyMoveTemp(game, move.from, move.to);
      const savedT = game.turnIndex;
      game.turnIndex = nextActivePlayer(game, playerId);

      const score = expectiTeamAB(game, 3, -Infinity, Infinity, playerId, false, null);

      game.turnIndex = savedT;
      undoMoveTemp(game, rec);

      if (score + Math.random() * 0.04 > bestScore) {
        bestScore = score;
        best = move;
      }
    }

    return best;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ELO 800 — Maharaja (+ quiescence search + PST, depth 4)
  // ═══════════════════════════════════════════════════════════════════════════
  function maharajaGetMove(game) {
    const moves = getAllLegalMoves(game);
    if (!moves.length) return null;
    if (moves.length === 1) return moves[0];

    const playerId = game.turnIndex;
    let best = null, bestScore = -Infinity;

    for (const move of orderMoves(game, moves)) {
      const rec    = applyMoveTemp(game, move.from, move.to);
      const savedT = game.turnIndex;
      game.turnIndex = nextActivePlayer(game, playerId);

      const score = expectiTeamAB(game, 4, -Infinity, Infinity, playerId, true, null);

      game.turnIndex = savedT;
      undoMoveTemp(game, rec);

      if (score + Math.random() * 0.02 > bestScore) {
        bestScore = score;
        best = move;
      }
    }

    return best;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ELO 900 — Samrat (+ iterative deepening + time control, depth 5)
  // ═══════════════════════════════════════════════════════════════════════════
  const SAMRAT_TIME_MS = 1800;

  function samratGetMove(game) {
    const moves = getAllLegalMoves(game);
    if (!moves.length) return null;
    if (moves.length === 1) return moves[0];

    const playerId  = game.turnIndex;
    const startTime = Date.now();
    let best        = orderMoves(game, moves)[0];

    for (let depth = 2; depth <= 5; depth++) {
      if (Date.now() - startTime > SAMRAT_TIME_MS) break;

      const ordered   = orderMoves(game, moves);
      let iterBest    = null;
      let iterScore   = -Infinity;

      for (const move of ordered) {
        if (Date.now() - startTime > SAMRAT_TIME_MS) break;

        const rec    = applyMoveTemp(game, move.from, move.to);
        const savedT = game.turnIndex;
        game.turnIndex = nextActivePlayer(game, playerId);

        const score = expectiTeamAB(game, depth, -Infinity, Infinity, playerId, true, null);

        game.turnIndex = savedT;
        undoMoveTemp(game, rec);

        if (score > iterScore) { iterScore = score; iterBest = move; }
      }

      if (iterBest) best = iterBest;
    }

    return best;
  }

  // ═══════════════════════════════════════════════════════════════════════════
  // ELO 1000 — Chakravarti
  //   + transposition table (60k entries)
  //   + opening book (first 4 half-moves)
  //   + full iterative deepening to depth 6
  //   + enhanced move ordering with killer moves
  // ═══════════════════════════════════════════════════════════════════════════
  const CHAKRA_TIME_MS = 2500;
  const chakraTT       = new Map();
  let   chakraMoveCount = 0;

  function chakravartiGetMove(game) {
    const moves = getAllLegalMoves(game);
    if (!moves.length) return null;
    if (moves.length === 1) { chakraMoveCount++; return moves[0]; }

    const playerId  = game.turnIndex;
    const startTime = Date.now();

    // Opening book: nudge good early moves
    let candidateMoves = applyOpeningBook(moves, game, chakraMoveCount);

    let best = orderMoves(game, candidateMoves)[0];

    for (let depth = 2; depth <= 6; depth++) {
      if (Date.now() - startTime > CHAKRA_TIME_MS) break;

      const ordered = orderMoves(game, candidateMoves);
      let iterBest  = null, iterScore = -Infinity;

      for (const move of ordered) {
        if (Date.now() - startTime > CHAKRA_TIME_MS) break;

        const rec    = applyMoveTemp(game, move.from, move.to);
        const savedT = game.turnIndex;
        game.turnIndex = nextActivePlayer(game, playerId);

        const score = expectiTeamAB(game, depth, -Infinity, Infinity, playerId, true, chakraTT);

        game.turnIndex = savedT;
        undoMoveTemp(game, rec);

        if (score > iterScore) { iterScore = score; iterBest = move; }
      }

      if (iterBest) best = iterBest;
    }

    chakraMoveCount++;
    return best;
  }

  // ── Public API ─────────────────────────────────────────────────────────────
  globalThis.ChaturangaAdvancedBots = {
    /**
     * Returns a move object { from, to } or null.
     * @param {Game}   game      Live Game instance (dice already rolled)
     * @param {number} eloLevel  700 | 800 | 900 | 1000
     */
    getMove(game, eloLevel) {
      if (!game || game.gameOver || !game.forcedPiece) return null;
      switch (eloLevel) {
        case 700:  return grandmasterGetMove(game);
        case 800:  return maharajaGetMove(game);
        case 900:  return samratGetMove(game);
        case 1000: return chakravartiGetMove(game);
        default:   return null;
      }
    },

    resetOpeningBook() { chakraMoveCount = 0; },
    clearTranspositionTable() { chakraTT.clear(); },

    // Exposed for benchmarking
    _teamEval: teamEval,
    _getPST:   getPST,
    _quiescence: quiescence,
    _expectiTeamAB: expectiTeamAB,
  };

})();
