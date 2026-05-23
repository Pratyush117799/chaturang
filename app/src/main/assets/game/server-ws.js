/**
 * ═══════════════════════════════════════════════════════════════
 *  CHATURANGA — WebSocket Multiplayer Server v1.0.5
 *  server-ws.js
 *
 *  Run: node server-ws.js
 *  Requires: npm install ws
 *  Default port: 8080 (set PORT env var to override)
 *
 *  Protocol: all messages are JSON over WebSocket.
 *  Every message has a { type, ...payload } shape.
 * ═══════════════════════════════════════════════════════════════
 */

'use strict';

const WebSocket = require('ws');
const PORT = process.env.PORT || 8080;
const wss  = new WebSocket.Server({ port: PORT });

console.log(`Chaturanga WS server running on ws://localhost:${PORT}`);

// ═══════════════════════════════════════════════════════════════
// PIECE RULES — server-side validation (mirrors client engine)
// ═══════════════════════════════════════════════════════════════
const PV = { pawn:1, horse:3, elephant:3, rook:5, king:100 };

function sqToFC(sq) {
  return { f: sq.charCodeAt(0) - 97, r: parseInt(sq[1]) };
}
function fcToSq(f, r) {
  return (f >= 0 && f <= 7 && r >= 1 && r <= 8)
    ? String.fromCharCode(97 + f) + r : null;
}

function getLegalMoves(boardObj, from, forcedPiece) {
  const raw = boardObj[from];
  if (!raw) return [];
  const [ownerStr, type] = raw.split(':');
  const owner = +ownerStr;
  const { f, r } = sqToFC(from);
  const moves = [];

  const fp = forcedPiece;
  if (fp && fp !== 'any') {
    if (fp === 'pawn-king' && type !== 'pawn' && type !== 'king') return [];
    if (fp !== 'pawn-king' && type !== fp) return [];
  }

  const addSq = (nf, nr) => {
    const ns = fcToSq(nf, nr);
    if (!ns) return false;
    const t = boardObj[ns];
    if (t && +t.split(':')[0] === owner) return false;
    moves.push(ns);
    return !t;
  };

  switch (type) {
    case 'rook':
      [[0,1],[0,-1],[1,0],[-1,0]].forEach(([df, dr]) => {
        for (let i = 1; i < 8; i++) {
          const nf = f+df*i, nr = r+dr*i;
          const ns = fcToSq(nf, nr);
          if (!ns) break;
          const t = boardObj[ns];
          if (t) { if (+t.split(':')[0] !== owner) moves.push(ns); break; }
          moves.push(ns);
        }
      });
      break;
    case 'horse':
      [[1,2],[1,-2],[-1,2],[-1,-2],[2,1],[2,-1],[-2,1],[-2,-1]]
        .forEach(([df,dr]) => addSq(f+df, r+dr));
      break;
    case 'elephant':
      [[2,2],[2,-2],[-2,2],[-2,-2]].forEach(([df,dr]) => addSq(f+df, r+dr));
      break;
    case 'king':
      [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]]
        .forEach(([df,dr]) => addSq(f+df, r+dr));
      break;
    case 'pawn': {
      const dir = owner === 0 ? 1 : -1;
      const fwd = fcToSq(f, r + dir);
      if (fwd && !boardObj[fwd]) moves.push(fwd);
      [[1,dir],[-1,dir]].forEach(([df,dr]) => {
        const ns = fcToSq(f+df, r+dr);
        if (ns) {
          const t = boardObj[ns];
          if (t && +t.split(':')[0] !== owner) moves.push(ns);
        }
      });
      break;
    }
  }
  return moves;
}

function validateMove(boardObj, from, to, playerId, forcedPiece) {
  const raw = boardObj[from];
  if (!raw) return { ok: false, reason: 'No piece on source square' };
  const owner = +raw.split(':')[0];
  if (owner !== playerId) return { ok: false, reason: 'Not your piece' };
  const legal = getLegalMoves(boardObj, from, forcedPiece);
  if (!legal.includes(to)) return { ok: false, reason: 'Illegal move' };
  return { ok: true };
}

function applyMove(boardObj, from, to, playerId) {
  const piece = boardObj[from];
  const captured = boardObj[to] || null;
  const newBoard = Object.assign({}, boardObj);
  newBoard[to] = piece;
  delete newBoard[from];

  // Pawn promotion
  const [, type] = piece.split(':');
  const r = parseInt(to[1]);
  if (type === 'pawn') {
    if ((playerId === 0 && r === 8) || (playerId === 1 && r === 1)) {
      newBoard[to] = `${playerId}:rook`;
    }
  }
  return { newBoard, captured };
}

// ═══════════════════════════════════════════════════════════════
// ELO SYSTEM
// ═══════════════════════════════════════════════════════════════
const K = 32;

function expectedScore(ratingA, ratingB) {
  return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400));
}

function newElo(rating, expected, actual) {
  return Math.round(Math.max(100, rating + K * (actual - expected)));
}

// ═══════════════════════════════════════════════════════════════
// ID GENERATORS
// ═══════════════════════════════════════════════════════════════
function makeRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}

function makeToken() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 10);
}

// ═══════════════════════════════════════════════════════════════
// SERVER STATE
// ═══════════════════════════════════════════════════════════════

/**
 * rooms: Map<roomCode, RoomState>
 *
 * RoomState {
 *   code, mode ('2p' | '4p'), status ('waiting' | 'playing' | 'finished'),
 *   players: [PlayerSlot, ...],    // ordered by seat index
 *   board, currentSeat, turn,
 *   forcedPiece, diceFace,
 *   chatHistory: [{seat, name, text, ts}],
 *   rematchVotes: Set<seat>,
 *   createdAt,
 * }
 *
 * PlayerSlot {
 *   seat,           // 0–3
 *   name,           // display name
 *   token,          // reconnection token
 *   elo,            // current online ELO
 *   ws,             // live WebSocket | null (disconnected)
 *   disconnectedAt, // Date | null
 *   connected,      // boolean
 * }
 */
const rooms   = new Map();
const tokens  = new Map();   // token → { roomCode, seat }
const RECONNECT_WINDOW_MS = 120_000; // 2 minutes

const STARTING_BOARD = {
  'a1':'0:rook','b1':'0:horse','c1':'0:elephant','d1':'0:king',
  'f1':'0:elephant','g1':'0:horse','h1':'0:rook',
  'a2':'0:pawn','b2':'0:pawn','c2':'0:pawn','d2':'0:pawn',
  'e2':'0:pawn','f2':'0:pawn','g2':'0:pawn','h2':'0:pawn',
  'a8':'1:rook','b8':'1:horse','c8':'1:elephant','d8':'1:king',
  'f8':'1:elephant','g8':'1:horse','h8':'1:rook',
  'a7':'1:pawn','b7':'1:pawn','c7':'1:pawn','d7':'1:pawn',
  'e7':'1:pawn','f7':'1:pawn','g7':'1:pawn','h7':'1:pawn',
};

const DICE_TO_PIECE = {1:'rook',2:'any',3:'horse',4:'elephant',5:'any',6:'pawn-king'};

// ═══════════════════════════════════════════════════════════════
// LOBBY BROADCAST
// ═══════════════════════════════════════════════════════════════
function getLobbySnapshot() {
  const openRooms = [];
  rooms.forEach((room, code) => {
    if (room.status === 'waiting') {
      const maxPlayers = room.mode === '4p' ? 4 : 2;
      const filledSeats = room.players.filter(p => p.connected || p.disconnectedAt).length;
      openRooms.push({
        code,
        mode: room.mode,
        players: filledSeats,
        maxPlayers,
        names: room.players.filter(p=>p).map(p=>p.name),
        createdAgo: Math.floor((Date.now() - room.createdAt) / 1000),
      });
    }
  });
  return openRooms;
}

// Track lobby watchers (clients who haven't joined a room yet)
const lobbyWatchers = new Set();

function broadcastLobby() {
  const snapshot = getLobbySnapshot();
  const msg = JSON.stringify({ type: 'lobby-update', rooms: snapshot });
  lobbyWatchers.forEach(ws => {
    if (ws.readyState === WebSocket.OPEN) ws.send(msg);
  });
}

// ═══════════════════════════════════════════════════════════════
// ROOM HELPERS
// ═══════════════════════════════════════════════════════════════
function send(ws, obj) {
  if (ws && ws.readyState === WebSocket.OPEN) {
    ws.send(JSON.stringify(obj));
  }
}

function broadcast(room, obj, excludeSeat = -1) {
  const msg = JSON.stringify(obj);
  room.players.forEach(p => {
    if (!p || p.seat === excludeSeat) return;
    if (p.ws && p.ws.readyState === WebSocket.OPEN) p.ws.send(msg);
  });
}

function getRoomSnapshot(room) {
  return {
    code:          room.code,
    mode:          room.mode,
    status:        room.status,
    players:       room.players.filter(Boolean).map(p => ({
      seat: p.seat, name: p.name, elo: p.elo, connected: p.connected
    })),
    board:         room.board,
    currentSeat:   room.currentSeat,
    turn:          room.turn,
    forcedPiece:   room.forcedPiece,
    diceFace:      room.diceFace,
    chatHistory:   room.chatHistory.slice(-30),
  };
}

function startGame(room) {
  room.status      = 'playing';
  room.board       = JSON.parse(JSON.stringify(STARTING_BOARD));
  room.currentSeat = 0;
  room.turn        = 0;
  room.forcedPiece = null;
  room.diceFace    = null;
  room.rematchVotes= new Set();
  broadcast(room, { type: 'game-start', snapshot: getRoomSnapshot(room) });
  broadcastLobby();
}

function checkReconnectExpiry() {
  const now = Date.now();
  rooms.forEach((room, code) => {
    room.players.forEach(p => {
      if (p && !p.connected && p.disconnectedAt) {
        if (now - p.disconnectedAt > RECONNECT_WINDOW_MS) {
          // Session expired — forfeit that player's seat
          broadcast(room, {
            type: 'player-forfeited',
            seat: p.seat,
            name: p.name,
            reason: 'Reconnection window expired',
          });
          // End game if in progress
          if (room.status === 'playing') {
            room.status = 'finished';
            broadcast(room, { type: 'game-over', reason: 'forfeit', forfeiter: p.seat });
          }
          p.disconnectedAt = null;
        }
      }
    });
  });
}

setInterval(checkReconnectExpiry, 10_000);

// Periodically clean up old finished/empty rooms
setInterval(() => {
  const now = Date.now();
  rooms.forEach((room, code) => {
    const age = now - room.createdAt;
    const allGone = room.players.every(p => !p || !p.connected);
    if ((room.status === 'finished' || allGone) && age > 3_600_000) {
      rooms.delete(code);
    }
  });
}, 60_000);

// ═══════════════════════════════════════════════════════════════
// MESSAGE HANDLERS
// ═══════════════════════════════════════════════════════════════
wss.on('connection', ws => {
  ws._room  = null;
  ws._seat  = null;
  ws._token = null;
  lobbyWatchers.add(ws);

  // Send current lobby immediately
  send(ws, { type: 'lobby-update', rooms: getLobbySnapshot() });

  ws.on('message', raw => {
    let msg;
    try { msg = JSON.parse(raw); } catch { return; }

    switch (msg.type) {

      // ── CREATE ROOM ─────────────────────────────────────────
      case 'create-room': {
        const mode = msg.mode === '4p' ? '4p' : '2p';
        const name = String(msg.name || 'Player').slice(0, 20);
        const elo  = Math.max(100, Math.min(3000, +msg.elo || 1200));

        let code;
        do { code = makeRoomCode(); } while (rooms.has(code));

        const token = makeToken();
        const player = { seat:0, name, token, elo, ws, disconnectedAt:null, connected:true };
        tokens.set(token, { roomCode:code, seat:0 });

        const room = {
          code, mode, status:'waiting',
          players: [player, null, null, null].slice(0, mode==='4p'?4:2),
          board: null, currentSeat:0, turn:0,
          forcedPiece:null, diceFace:null,
          chatHistory: [], rematchVotes: new Set(),
          createdAt: Date.now(),
        };
        rooms.set(code, room);

        ws._room  = code;
        ws._seat  = 0;
        ws._token = token;
        lobbyWatchers.delete(ws);

        send(ws, { type:'room-created', code, seat:0, token, snapshot:getRoomSnapshot(room) });
        broadcastLobby();
        break;
      }

      // ── JOIN ROOM ────────────────────────────────────────────
      case 'join-room': {
        const code = String(msg.code || '').toUpperCase().trim();
        const name = String(msg.name || 'Player').slice(0, 20);
        const elo  = Math.max(100, Math.min(3000, +msg.elo || 1200));

        const room = rooms.get(code);
        if (!room) { send(ws, { type:'error', code:'ROOM_NOT_FOUND', message:`Room ${code} not found.` }); break; }
        if (room.status !== 'waiting') { send(ws, { type:'error', code:'ROOM_FULL', message:'That room has already started.' }); break; }

        const emptyIdx = room.players.findIndex(p => p === null);
        if (emptyIdx === -1) { send(ws, { type:'error', code:'ROOM_FULL', message:'Room is full.' }); break; }

        const token  = makeToken();
        const player = { seat:emptyIdx, name, token, elo, ws, disconnectedAt:null, connected:true };
        tokens.set(token, { roomCode:code, seat:emptyIdx });
        room.players[emptyIdx] = player;

        ws._room  = code;
        ws._seat  = emptyIdx;
        ws._token = token;
        lobbyWatchers.delete(ws);

        send(ws, { type:'room-joined', code, seat:emptyIdx, token, snapshot:getRoomSnapshot(room) });
        broadcast(room, { type:'player-joined', seat:emptyIdx, name, elo }, emptyIdx);

        // Auto-start when all seats filled
        const maxPlayers = room.mode === '4p' ? 4 : 2;
        if (room.players.filter(Boolean).length === maxPlayers) {
          startGame(room);
        } else {
          broadcastLobby();
        }
        break;
      }

      // ── RECONNECT ────────────────────────────────────────────
      case 'reconnect': {
        const token = String(msg.token || '');
        const entry = tokens.get(token);
        if (!entry) { send(ws, { type:'error', code:'INVALID_TOKEN', message:'Session not found or expired.' }); break; }

        const room = rooms.get(entry.roomCode);
        if (!room) { send(ws, { type:'error', code:'ROOM_GONE', message:'Room no longer exists.' }); break; }

        const player = room.players[entry.seat];
        if (!player) { send(ws, { type:'error', code:'SEAT_GONE', message:'Your seat no longer exists.' }); break; }

        // Restore connection
        player.ws            = ws;
        player.connected     = true;
        player.disconnectedAt= null;
        ws._room  = entry.roomCode;
        ws._seat  = entry.seat;
        ws._token = token;
        lobbyWatchers.delete(ws);

        send(ws, { type:'reconnected', seat:entry.seat, snapshot:getRoomSnapshot(room) });
        broadcast(room, { type:'player-reconnected', seat:entry.seat, name:player.name }, entry.seat);
        break;
      }

      // ── ROLL DICE ────────────────────────────────────────────
      case 'roll-dice': {
        const room = rooms.get(ws._room);
        if (!room || room.status !== 'playing') break;
        if (ws._seat !== room.currentSeat) {
          send(ws, { type:'error', code:'NOT_YOUR_TURN', message:"It's not your turn." }); break;
        }
        if (room.forcedPiece !== null) {
          send(ws, { type:'error', code:'ALREADY_ROLLED', message:'Dice already rolled this turn.' }); break;
        }
        const face = Math.ceil(Math.random() * 6);
        room.diceFace    = face;
        room.forcedPiece = DICE_TO_PIECE[face];
        broadcast(room, { type:'dice-rolled', seat:ws._seat, face, forcedPiece:room.forcedPiece });
        break;
      }

      // ── MAKE MOVE ─────────────────────────────────────────────
      case 'move': {
        const room = rooms.get(ws._room);
        if (!room || room.status !== 'playing') break;
        if (ws._seat !== room.currentSeat) {
          send(ws, { type:'error', code:'NOT_YOUR_TURN', message:"It's not your turn." }); break;
        }
        if (room.forcedPiece === null) {
          send(ws, { type:'error', code:'ROLL_FIRST', message:'Roll the dice first.' }); break;
        }

        const { from, to } = msg;
        if (typeof from !== 'string' || typeof to !== 'string') break;

        const validation = validateMove(room.board, from, to, ws._seat, room.forcedPiece);
        if (!validation.ok) {
          send(ws, { type:'error', code:'ILLEGAL_MOVE', message:validation.reason }); break;
        }

        const { newBoard, captured } = applyMove(room.board, from, to, ws._seat);
        room.board = newBoard;

        let gameOver   = false;
        let winnerSeat = null;

        if (captured && captured.split(':')[1] === 'king') {
          gameOver   = true;
          winnerSeat = ws._seat;
          room.status= 'finished';
        }

        // Advance turn
        const maxPlayers = room.mode === '4p' ? 4 : 2;
        const activePlayers = room.players.filter(Boolean).filter(p=>p.connected || p.disconnectedAt);
        room.turn++;
        // Cycle through seats that still have a king
        let next = (room.currentSeat + 1) % maxPlayers;
        for (let i = 0; i < maxPlayers; i++) {
          const testSeat = (room.currentSeat + 1 + i) % maxPlayers;
          const hasKing = Object.values(room.board).some(v => v === `${testSeat}:king`);
          if (hasKing) { next = testSeat; break; }
        }
        room.currentSeat  = gameOver ? -1 : next;
        room.forcedPiece  = null;
        room.diceFace     = null;

        broadcast(room, {
          type: 'move-made',
          from, to,
          captured: captured || null,
          seat: ws._seat,
          board: room.board,
          currentSeat: room.currentSeat,
          turn: room.turn,
          gameOver,
          winnerSeat,
        });

        // Handle ELO on game over
        if (gameOver) {
          const eloChanges = computeEloChanges(room, winnerSeat);
          broadcast(room, { type:'game-over', winnerSeat, eloChanges });
        }
        break;
      }

      // ── FORFEIT TURN ─────────────────────────────────────────
      case 'forfeit-turn': {
        const room = rooms.get(ws._room);
        if (!room || room.status !== 'playing') break;
        if (ws._seat !== room.currentSeat) break;

        const maxPlayers = room.mode === '4p' ? 4 : 2;
        let next = (room.currentSeat + 1) % maxPlayers;
        for (let i = 0; i < maxPlayers; i++) {
          const testSeat = (room.currentSeat + 1 + i) % maxPlayers;
          const hasKing = Object.values(room.board).some(v => v === `${testSeat}:king`);
          if (hasKing) { next = testSeat; break; }
        }
        room.currentSeat  = next;
        room.turn++;
        room.forcedPiece  = null;
        room.diceFace     = null;
        broadcast(room, { type:'turn-forfeited', seat:ws._seat, currentSeat:room.currentSeat, turn:room.turn });
        break;
      }

      // ── CHAT ─────────────────────────────────────────────────
      case 'chat': {
        const room = rooms.get(ws._room);
        if (!room) break;
        const player = room.players[ws._seat];
        if (!player) break;
        const text = String(msg.text || '').slice(0, 200).trim();
        if (!text) break;
        const entry = { seat:ws._seat, name:player.name, text, ts:Date.now() };
        room.chatHistory.push(entry);
        if (room.chatHistory.length > 100) room.chatHistory.shift();
        broadcast(room, { type:'chat-message', ...entry });
        break;
      }

      // ── REMATCH REQUEST ───────────────────────────────────────
      case 'rematch': {
        const room = rooms.get(ws._room);
        if (!room || room.status !== 'finished') break;
        room.rematchVotes.add(ws._seat);
        broadcast(room, { type:'rematch-vote', seat:ws._seat, votes:room.rematchVotes.size,
          needed: room.players.filter(Boolean).length });

        const needed = room.players.filter(Boolean).length;
        if (room.rematchVotes.size >= needed) {
          // Reset game — same room, same players
          startGame(room);
        }
        break;
      }

      // ── PING ─────────────────────────────────────────────────
      case 'ping':
        send(ws, { type:'pong', ts:Date.now() });
        break;

      // ── GET LOBBY ─────────────────────────────────────────────
      case 'get-lobby':
        send(ws, { type:'lobby-update', rooms: getLobbySnapshot() });
        break;

      default:
        send(ws, { type:'error', code:'UNKNOWN_MSG', message:`Unknown message type: ${msg.type}` });
    }
  });

  ws.on('close', () => {
    lobbyWatchers.delete(ws);
    const room = rooms.get(ws._room);
    if (!room) return;
    const player = room.players[ws._seat];
    if (!player) return;

    player.connected     = false;
    player.disconnectedAt= Date.now();
    player.ws            = null;

    broadcast(room, {
      type: 'player-disconnected',
      seat: ws._seat,
      name: player.name,
      reconnectWindowSecs: Math.floor(RECONNECT_WINDOW_MS / 1000),
    });
  });

  ws.on('error', err => {
    console.error('WS error:', err.message);
  });
});

// ═══════════════════════════════════════════════════════════════
// ELO CALCULATION
// ═══════════════════════════════════════════════════════════════
function computeEloChanges(room, winnerSeat) {
  const players = room.players.filter(Boolean);
  const changes = {};

  players.forEach(p => {
    const isWinner = p.seat === winnerSeat;
    let totalExpected = 0;
    players.forEach(opp => {
      if (opp.seat === p.seat) return;
      totalExpected += expectedScore(p.elo, opp.elo);
    });
    const opponents = players.length - 1;
    const actual    = isWinner ? opponents : 0;
    const delta     = Math.round(K * (actual - totalExpected));
    changes[p.seat] = {
      name:     p.name,
      oldElo:   p.elo,
      delta,
      newElo:   Math.max(100, p.elo + delta),
    };
    p.elo = changes[p.seat].newElo;
  });
  return changes;
}

// ═══════════════════════════════════════════════════════════════
// GRACEFUL SHUTDOWN
// ═══════════════════════════════════════════════════════════════
process.on('SIGTERM', () => {
  console.log('Shutting down...');
  wss.clients.forEach(ws => {
    ws.send(JSON.stringify({ type:'server-shutdown', message:'Server is restarting. Please reconnect in a moment.' }));
    ws.close();
  });
  wss.close(() => process.exit(0));
});
