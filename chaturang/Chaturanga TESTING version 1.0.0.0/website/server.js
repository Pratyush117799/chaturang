const fs = require('fs');
const path = require('path');
const http = require('http');
const WebSocket = require('ws');
const port = process.env.PORT || 8765;
const root = path.join(__dirname, '..');

const BOT_NAMES = ['Bot: Kausalya', 'Bot: Arjun', 'Bot: Meera', 'Bot: Rohan', 'Bot: Priya', 'Bot: Devan'];
function randomBotName() { return BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)]; }

const mimeTypes = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.txt': 'text/plain', '.pdf': 'application/pdf'
};

// ── Guest ELO ledger (flat JSON file, server-authoritative) ──────────────────
// IMPORTANT: this ledger is for GUESTS ONLY (no logged-in account). Registered
// players' elo/history lives exclusively in MongoDB via persistToMongo() below.
// Mixing the two was the cause of the same person showing up twice on the
// leaderboard — once here (keyed by an ephemeral browser token) and once in
// Mongo (keyed by their real account id).
const LEDGER_PATH = path.join(__dirname, 'elo-ledger.json');
const MIN_ELO = 100, MAX_ELO = 3000, PROVISIONAL_GAMES = 10;

function loadLedger() {
  try { if (fs.existsSync(LEDGER_PATH)) return JSON.parse(fs.readFileSync(LEDGER_PATH, 'utf8')); }
  catch (e) { console.warn('[ELO] Ledger load failed:', e.message); }
  return {};
}
function saveLedger(ledger) {
  try { fs.writeFileSync(LEDGER_PATH, JSON.stringify(ledger, null, 2)); }
  catch (e) { console.warn('[ELO] Ledger save failed:', e.message); }
}
function getPlayerRecord(token) {
  if (!token) return null;
  return loadLedger()[token] || null;
}
function upsertPlayerRecord(token, name, newElo, result) {
  if (!token) return null;
  const ledger = loadLedger();
  const existing = ledger[token];
  const now = Date.now();
  if (!existing) {
    ledger[token] = {
      elo: newElo, name,
      wins: result === 'win' ? 1 : 0, losses: result === 'loss' ? 1 : 0, draws: result === 'draw' ? 1 : 0,
      games: 1, createdAt: now, lastSeen: now
    };
  } else {
    existing.elo = newElo;
    existing.name = name;
    existing.games = (existing.games || 0) + 1;
    existing.wins = (existing.wins || 0) + (result === 'win' ? 1 : 0);
    existing.losses = (existing.losses || 0) + (result === 'loss' ? 1 : 0);
    existing.draws = (existing.draws || 0) + (result === 'draw' ? 1 : 0);
    existing.lastSeen = now;
  }
  saveLedger(ledger);
  return ledger[token];
}
// Server-authoritative ELO lookup for a persistent token; falls back to client
// value only for a token the ledger has never seen (brand-new guest).
function resolveElo(token, clientElo) {
  const record = getPlayerRecord(token);
  if (record) return record.elo;
  return Math.max(MIN_ELO, Math.min(MAX_ELO, +clientElo || 1200));
}
function getLeaderboard() {
  const ledger = loadLedger();
  return Object.values(ledger)
    .map(r => ({ name: r.name, elo: r.elo, games: r.games || 0, wins: r.wins || 0, losses: r.losses || 0, provisional: (r.games || 0) < PROVISIONAL_GAMES }))
    .filter(r => r.games > 0)
    .sort((a, b) => b.elo - a.elo)
    .slice(0, 100);
}

// ── Game history log (append-only, server-side only — never client-written) ──
const HISTORY_PATH = path.join(__dirname, 'game-history.json');
function appendGameHistory(entry) {
  let history = [];
  try { if (fs.existsSync(HISTORY_PATH)) history = JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf8')); }
  catch (e) { console.warn('[History] load failed:', e.message); }
  history.push(entry);
  if (history.length > 5000) history = history.slice(-5000);
  try { fs.writeFileSync(HISTORY_PATH, JSON.stringify(history, null, 2)); }
  catch (e) { console.warn('[History] save failed:', e.message); }
}
function recordGameHistoryForRoom(room, winnerSeat, reason) {
  const botCount = room.players.filter(p => p && p.isBot).length;
  const gameType = botCount === 0 ? 'pvp' : `${botCount}bot`;
  room.players.filter(Boolean).forEach(p => {
    if (p.isBot) return;
    let result;
    if (winnerSeat === null) result = 'draw';
    else if (p.seat === winnerSeat) result = 'win';
    else result = (reason === 'resign' && p.seat === room._resignerSeat) ? 'quit' : 'loss';
    appendGameHistory({ token: p.token, userId: p.dbUserId || null, name: p.name, result, reason, gameType, roomCode: room.code, ts: Date.now() });
  });
}

const server = http.createServer((req, res) => {
  let urlPath = req.url.split('?')[0];
  if (urlPath === '/') urlPath = '/website/index.html';

  if (req.method === 'POST' && urlPath === '/api/admin/puzzle') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        const puzzleData = JSON.parse(body);
        const puzzlesFilePath = path.join(root, 'Chaturanga version 1.0.5.2', 'puzzles', 'puzzle-data.js');
        let content = fs.readFileSync(puzzlesFilePath, 'utf8');
        const regex = /(window\.ChaturangaPuzzleData\s*=\s*\[)([\s\S]*?)(\];)/;
        if (regex.test(content)) {
          const newContent = content.replace(regex, (match, p1, p2, p3) => {
            const separator = p2.trim() ? ',\n  ' : '\n  ';
            return `${p1}${p2}${separator}${JSON.stringify(puzzleData, null, 2)}${p3}`;
          });
          fs.writeFileSync(puzzlesFilePath, newContent);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true }));
        } else {
          throw new Error('Could not find window.ChaturangaPuzzleData in puzzle-data.js');
        }
      } catch (err) {
        console.error('API Error:', err);
        res.writeHead(500);
        res.end(JSON.stringify({ success: false, error: err.message }));
      }
    });
    return;
  }

  if (req.method === 'GET' && urlPath.startsWith('/api/history/')) {
    const token = decodeURIComponent(urlPath.split('/api/history/')[1] || '');
    let history = [];
    try { history = JSON.parse(fs.readFileSync(HISTORY_PATH, 'utf8')); } catch (e) {}
    const mine = history.filter(h => h.token === token).slice(-50).reverse();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(mine));
    return;
  }

  // Guest-only leaderboard/lookup. Registered accounts are ranked via the
  // Express API's /api/leaderboard (port 5000), backed by MongoDB.
  if (req.method === 'GET' && urlPath === '/api/leaderboard') {
    res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
    res.end(JSON.stringify(getLeaderboard()));
    return;
  }
  if (req.method === 'GET' && urlPath.startsWith('/api/player/')) {
    const token = decodeURIComponent(urlPath.split('/api/player/')[1] || '');
    const record = getPlayerRecord(token);
    if (!record) { res.writeHead(404); res.end(JSON.stringify({ error: 'Not found' })); return; }
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ ...record, provisional: (record.games || 0) < PROVISIONAL_GAMES }));
    return;
  }

  const fp = path.join(root, urlPath);
  const ext = path.extname(fp);
  try {
    if (!fs.existsSync(fp)) throw new Error('Not found');
    const data = fs.readFileSync(fp);
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'text/plain' });
    res.end(data);
  } catch (e) {
    res.writeHead(404);
    res.end('Not found: ' + fp);
  }
});

server.listen(port, () => {
  console.log('Chaturanga v1.0.5.2 Web Server running at http://localhost:' + port);
  console.log('Backend API and WebSocket Multiplayer active.');
});

// ═══════════════════════════════════════════════════════════════
// WEBSOCKET MULTIPLAYER SERVER
// ═══════════════════════════════════════════════════════════════
const wss = new WebSocket.Server({ server });

const rooms = new Map();
const tokens = new Map();
const RECONNECT_WINDOW_MS = 120_000;
const STARTING_BOARD = {
  'a1':'0:rook','b1':'0:horse','c1':'0:elephant','d1':'0:king',
  'a2':'0:pawn','b2':'0:pawn','c2':'0:pawn','d2':'0:pawn',
  'h1':'1:rook','h2':'1:horse','h3':'1:elephant','h4':'1:king',
  'g1':'1:pawn','g2':'1:pawn','g3':'1:pawn','g4':'1:pawn',
  'h8':'2:rook','g8':'2:horse','f8':'2:elephant','e8':'2:king',
  'h7':'2:pawn','g7':'2:pawn','f7':'2:pawn','e7':'2:pawn',
  'a8':'3:rook','a7':'3:horse','a6':'3:elephant','a5':'3:king',
  'b5':'3:pawn','b6':'3:pawn','b7':'3:pawn','b8':'3:pawn',
};
const DICE_TO_PIECE = {1:'rook',2:'any',3:'horse',4:'elephant',5:'any',6:'pawn-king'};
const lobbyWatchers = new Set();
const K = 32;

function makeRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}
function makeToken() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 10); }
// Reuse the client's existing token when it sent one, instead of always
// minting a fresh identity — this is what lets a guest's elo accumulate
// across games in the flat-file ledger.
function resolveToken(msgToken) {
  const t = String(msgToken || '').trim();
  return t ? t : makeToken();
}
function resolveUserId(msgUserId) {
  const id = String(msgUserId || '').trim();
  return id || null;
}

function sqToFC(sq) { return { f: sq.charCodeAt(0) - 97, r: parseInt(sq[1]) }; }
function fcToSq(f, r) { return (f >= 0 && f <= 7 && r >= 1 && r <= 8) ? String.fromCharCode(97 + f) + r : null; }

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
      [[1,2],[1,-2],[-1,2],[-1,-2],[2,1],[2,-1],[-2,1],[-2,-1]].forEach(([df,dr]) => addSq(f+df, r+dr));
      break;
    case 'elephant':
      [[2,2],[2,-2],[-2,2],[-2,-2]].forEach(([df,dr]) => addSq(f+df, r+dr));
      break;
    case 'king':
      [[0,1],[0,-1],[1,0],[-1,0],[1,1],[1,-1],[-1,1],[-1,-1]].forEach(([df,dr]) => addSq(f+df, r+dr));
      break;
    case 'pawn': {
      const dir = owner === 0 ? 1 : -1;
      const fwd = fcToSq(f, r + dir);
      if (fwd && !boardObj[fwd]) moves.push(fwd);
      [[1,dir],[-1,dir]].forEach(([df,dr]) => {
        const ns = fcToSq(f+df, r+dr);
        if (ns) { const t = boardObj[ns]; if (t && +t.split(':')[0] !== owner) moves.push(ns); }
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
  const [, type] = piece.split(':');
  const r = parseInt(to[1]);
  if (type === 'pawn') {
    if ((playerId === 0 && r === 8) || (playerId === 1 && r === 1)) newBoard[to] = `${playerId}:rook`;
  }
  return { newBoard, captured };
}

function expectedScore(ratingA, ratingB) { return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400)); }

function getLobbySnapshot() {
  const openRooms = [];
  rooms.forEach((room, code) => {
    if (room.status === 'waiting') {
      const maxPlayers = room.mode === '4p' ? 4 : 2;
      const filledSeats = room.players.filter(p => p && (p.connected || p.disconnectedAt)).length;
      const elos = room.players.filter(Boolean).map(p => p.elo);
      const avgElo = elos.length ? Math.round(elos.reduce((a,b)=>a+b,0)/elos.length) : 1200;
      openRooms.push({
        code, mode: room.mode, players: filledSeats, maxPlayers,
        names: room.players.filter(p=>p).map(p=>p.name),
        elos: room.players.filter(p=>p).map(p=>p.elo),
        avgElo, createdAgo: Math.floor((Date.now() - room.createdAt) / 1000),
      });
    }
  });
  return openRooms;
}
function broadcastLobby() {
  const snapshot = getLobbySnapshot();
  const msg = JSON.stringify({ type: 'lobby-update', rooms: snapshot });
  lobbyWatchers.forEach(ws => { if (ws.readyState === WebSocket.OPEN) ws.send(msg); });
}
function send(ws, obj) { if (ws && ws.readyState === WebSocket.OPEN) ws.send(JSON.stringify(obj)); }
function broadcast(room, obj, excludeSeat = -1) {
  const msg = JSON.stringify(obj);
  room.players.forEach(p => {
    if (!p || p.seat === excludeSeat) return;
    if (p.ws && p.ws.readyState === WebSocket.OPEN) p.ws.send(msg);
  });
}
function getRoomSnapshot(room) {
  return {
    code: room.code, mode: room.mode, status: room.status,
    players: room.players.filter(Boolean).map(p => ({ seat: p.seat, name: p.name, elo: p.elo, connected: p.connected, isBot: !!p.isBot })),
    board: room.board, currentSeat: room.currentSeat, turn: room.turn,
    forcedPiece: room.forcedPiece, diceFace: room.diceFace, chatHistory: room.chatHistory.slice(-30),
  };
}

function computeEloChanges(room, winnerSeat) {
  const players = room.players.filter(Boolean);
  const changes = {};
  players.forEach(p => {
    const isWinner = p.seat === winnerSeat;
    let totalExpected = 0;
    players.forEach(opp => { if (opp.seat !== p.seat) totalExpected += expectedScore(p.elo, opp.elo); });
    const opponents = players.length - 1;
    const actual = isWinner ? opponents : 0;
    const delta = Math.round(K * (actual - totalExpected));
    changes[p.seat] = { name: p.name, oldElo: p.elo, delta, newElo: Math.max(100, p.elo + delta) };
    p.elo = changes[p.seat].newElo;
  });
  return changes;
}

const DB_API_URL = process.env.DB_API_URL || 'http://localhost:5000';
// Fire-and-forget server-to-server call — the WS game flow doesn't wait on Mongo latency.
async function persistToMongo(player, result, gameType) {
  if (!player || player.isBot || !player.dbUserId) return; // only real logged-in accounts
  try {
    await fetch(`${DB_API_URL}/api/user/game-history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: player.dbUserId,
        startedAt: new Date().toISOString(),
        endedAt: new Date().toISOString(),
        type: gameType,
        result,               // 'win' | 'defeat' | 'quitted'
        newElo: player.elo    // the value computeEloChanges already wrote onto player.elo
      })
    });
  } catch (e) {
    console.warn('[Mongo] Failed to persist game result for', player.dbUserId, e.message);
  }
}

// Single choke point: a registered player (has dbUserId) is recorded in
// MongoDB ONLY. A guest (no dbUserId) is recorded in the local flat-file
// ledger ONLY. Never both — that split-booking was what produced duplicate
// leaderboard rows for the same logged-in person.
function recordResult(p, change, result, gameType) {
  if (p.isBot) return;
  if (p.dbUserId) {
    persistToMongo(p, result === 'win' ? 'win' : (result === 'quitted' ? 'quitted' : 'defeat'), gameType);
  } else if (change) {
    upsertPlayerRecord(p.token, p.name, change.newElo, result === 'quitted' ? 'loss' : result);
  }
}

// ── Single source of truth for "a game just ended" — used by every path so
// ELO + history logic can never drift out of sync between them again.
function finishGameWithWinner(room, winnerSeat, reason) {
  room.status = 'finished';
  const eloChanges = computeEloChanges(room, winnerSeat); // mutates p.elo in place
  const botCount = room.players.filter(p => p && p.isBot).length;
  const gameType = botCount === 0 ? 'pvp' : `${botCount}bot`;

  room.players.filter(Boolean).forEach(p => {
    if (p.isBot) return;
    const change = eloChanges[p.seat];
    const result = p.seat === winnerSeat ? 'win' : 'loss';
    recordResult(p, change, result, gameType);
  });

  recordGameHistoryForRoom(room, winnerSeat, reason);
  broadcast(room, { type: 'game-over', reason, winnerSeat, eloChanges });
  broadcastLobby();
}

function finishGameByAbandon(room, resignerSeat, reason) {
  room.status = 'finished';
  room._resignerSeat = resignerSeat;
  const others = room.players.filter(p => p && p.seat !== resignerSeat && (p.connected || p.isBot));
  const winnerSeat = others.length === 1 ? others[0].seat : null;
  let eloChanges = {};
  const botCount = room.players.filter(p => p && p.isBot).length;
  const gameType = botCount === 0 ? 'pvp' : `${botCount}bot`;

  if (winnerSeat !== null) {
    eloChanges = computeEloChanges(room, winnerSeat);
    room.players.filter(Boolean).forEach(p => {
      if (p.isBot) return;
      const change = eloChanges[p.seat];
      const result = p.seat === winnerSeat ? 'win' : (p.seat === resignerSeat ? 'quitted' : 'loss');
      recordResult(p, change, result, gameType);
    });
  }

  recordGameHistoryForRoom(room, winnerSeat, reason);
  broadcast(room, { type: 'game-over', reason, winnerSeat, eloChanges });
  broadcastLobby();
}
function startGame(room) {
  room.status = 'playing';
  room.board = JSON.parse(JSON.stringify(STARTING_BOARD));
  room.currentSeat = 0;
  room.turn = 0;
  room.forcedPiece = null;
  room.diceFace = null;
  room.rematchVotes = new Set();
  broadcast(room, { type: 'game-start', snapshot: getRoomSnapshot(room) });
  broadcastLobby();
  scheduleBotTurn(room); // in case a bot ever starts on seat 0
}

// ── Minimal bot: rolls, then plays a random legal move (or forfeits if none) ──
function scheduleBotTurn(room) {
  if (!room || room.status !== 'playing') return;
  const player = room.players[room.currentSeat];
  if (!player || !player.isBot) return;
  setTimeout(() => botTakeTurn(room), 700 + Math.random() * 500);
}
function botTakeTurn(room) {
  if (!room || room.status !== 'playing') return;
  const seat = room.currentSeat;
  const player = room.players[seat];
  if (!player || !player.isBot) return;

  if (room.forcedPiece === null) {
    const face = Math.ceil(Math.random() * 6);
    room.diceFace = face; room.forcedPiece = DICE_TO_PIECE[face];
    broadcast(room, { type: 'dice-rolled', seat, face, forcedPiece: room.forcedPiece });
    setTimeout(() => botTakeTurn(room), 600);
    return;
  }

  const squares = Object.keys(room.board).filter(sq => +room.board[sq].split(':')[0] === seat);
  const candidates = [];
  squares.forEach(sq => getLegalMoves(room.board, sq, room.forcedPiece).forEach(to => candidates.push([sq, to])));

  const max = room.mode === '4p' ? 4 : 2;
  const advanceSeat = () => {
    let next = ((room.currentSeat + 1) % max)
    for (let i = 0; i < max; i++) {
      const ts = (room.currentSeat + 1 + i) % max;
      if (Object.values(room.board).some(v => v === `${ts}:king`)) { next = ts; break; }
    }
    return next;
  };

  if (!candidates.length) {
    room.currentSeat = advanceSeat(); room.turn++; room.forcedPiece = null; room.diceFace = null;
    broadcast(room, { type: 'turn-forfeited', seat, currentSeat: room.currentSeat, turn: room.turn });
    scheduleBotTurn(room);
    return;
  }

  const [from, to] = candidates[Math.floor(Math.random() * candidates.length)];
  const { newBoard, captured } = applyMove(room.board, from, to, seat);
  room.board = newBoard;
  let gameOver = false, winnerSeat = null;
  if (captured && captured.split(':')[1] === 'king') { gameOver = true; winnerSeat = seat; }
  room.currentSeat = gameOver ? -1 : advanceSeat(); room.turn++; room.forcedPiece = null; room.diceFace = null;
  broadcast(room, { type: 'move-made', from, to, captured: captured || null, seat, board: room.board, currentSeat: room.currentSeat, turn: room.turn, gameOver, winnerSeat });
  if (gameOver) finishGameWithWinner(room, winnerSeat, 'capture');
  else scheduleBotTurn(room);
}

// ── Quick match queue ──────────────────────────────────────────────────────
const quickMatchQueue = [];
function removeFromQueue(ws) {
  const i = quickMatchQueue.findIndex(q => q.ws === ws);
  if (i !== -1) quickMatchQueue.splice(i, 1);
}
function tryMatchQueue() {
  while (quickMatchQueue.length >= 2) {
    const a = quickMatchQueue.shift(), b = quickMatchQueue.shift();
    if (a.ws.readyState !== WebSocket.OPEN) continue;
    if (b.ws.readyState !== WebSocket.OPEN) { quickMatchQueue.unshift(a); continue; }
    createMatchedRoom(a, b);
  }
}
// Reuse each player's own persistent token/userId instead of minting new ones —
// otherwise quick-match games never accumulated ELO history for the right identity.
function createMatchedRoom(a, b) {
  let code; do { code = makeRoomCode(); } while (rooms.has(code));
  const pA = { seat:0, name:a.name, token:a.token, elo:a.elo, ws:a.ws, disconnectedAt:null, connected:true, isBot:false, dbUserId:a.userId || null };
  const pB = { seat:1, name:b.name, token:b.token, elo:b.elo, ws:b.ws, disconnectedAt:null, connected:true, isBot:false, dbUserId:b.userId || null };
  tokens.set(a.token, { roomCode:code, seat:0 });
  tokens.set(b.token, { roomCode:code, seat:1 });
  const room = { code, mode:'2p', status:'waiting', players:[pA, pB], board:null,
    currentSeat:0, turn:0, forcedPiece:null, diceFace:null, chatHistory:[], rematchVotes:new Set(), createdAt:Date.now() };
  rooms.set(code, room);
  a.ws._room = code; a.ws._seat = 0; a.ws._token = a.token; lobbyWatchers.delete(a.ws);
  b.ws._room = code; b.ws._seat = 1; b.ws._token = b.token; lobbyWatchers.delete(b.ws);
  send(a.ws, { type:'quick-match-found', code, seat:0, token:a.token, snapshot:getRoomSnapshot(room) });
  send(b.ws, { type:'quick-match-found', code, seat:1, token:b.token, snapshot:getRoomSnapshot(room) });
  startGame(room);
}
function createBotRoom(entry) {
  let code; do { code = makeRoomCode(); } while (rooms.has(code));
  const botName = randomBotName();
  const human = { seat:0, name:entry.name, token:entry.token, elo:entry.elo, ws:entry.ws, disconnectedAt:null, connected:true, isBot:false, dbUserId:entry.userId || null };
  const bot   = { seat:1, name:botName, token:makeToken(), elo:entry.elo, ws:null, disconnectedAt:null, connected:true, isBot:true };
  tokens.set(entry.token, { roomCode:code, seat:0 });
  const room = { code, mode:'2p', status:'waiting', players:[human, bot], board:null,
    currentSeat:0, turn:0, forcedPiece:null, diceFace:null, chatHistory:[], rematchVotes:new Set(), createdAt:Date.now() };
  rooms.set(code, room);
  entry.ws._room = code; entry.ws._seat = 0; entry.ws._token = entry.token;
  lobbyWatchers.delete(entry.ws);
  send(entry.ws, { type:'quick-match-bot', code, seat:0, token:entry.token, botName, snapshot:getRoomSnapshot(room) });
  startGame(room);
}

wss.on('connection', ws => {
  ws._room = null; ws._seat = null; ws._token = null;
  lobbyWatchers.add(ws);
  send(ws, { type: 'lobby-update', rooms: getLobbySnapshot() });

  ws.on('message', async raw => {
    let msg; try { msg = JSON.parse(raw); } catch { return; }
    switch (msg.type) {
      case 'create-room': {
        const mode = msg.mode === '4p' ? '4p' : '2p';
        const name = String(msg.name || 'Player').slice(0, 20);
        const token = resolveToken(msg.token);
         const elo = await resolveEloAuthoritative(token, msg.elo, userId);
        const userId = resolveUserId(msg.userId);
        let code; do { code = makeRoomCode(); } while (rooms.has(code));
        const player = { seat:0, name, token, elo, ws, disconnectedAt:null, connected:true, isBot:false, dbUserId: userId };
        tokens.set(token, { roomCode:code, seat:0 });
        const room = {
          code, mode, status:'waiting', players: [player, null, null, null].slice(0, mode==='4p'?4:2),
          board: null, currentSeat:0, turn:0, forcedPiece:null, diceFace:null, chatHistory: [], rematchVotes: new Set(), createdAt: Date.now(),
        };
        rooms.set(code, room);
        ws._room = code; ws._seat = 0; ws._token = token;
        lobbyWatchers.delete(ws);
        send(ws, { type:'room-created', code, seat:0, token, snapshot:getRoomSnapshot(room) });
        broadcastLobby();
        break;
      }
      case 'quick-match': {
        if (quickMatchQueue.some(q => q.ws === ws)) break;
        const token = resolveToken(msg.token);
        const elo = resolveElo(token, msg.elo);
        const userId = resolveUserId(msg.userId);
        quickMatchQueue.push({ ws, name: String(msg.name || 'Player').slice(0, 20), elo, token, userId });
        send(ws, { type: 'quick-match-searching' });
        tryMatchQueue();
        break;
      }
      case 'cancel-quick-match': {
        removeFromQueue(ws);
        send(ws, { type: 'quick-match-cancelled' });
        break;
      }
      case 'quick-match-timeout': {
        const i = quickMatchQueue.findIndex(q => q.ws === ws);
        if (i === -1) break;
        const entry = quickMatchQueue.splice(i, 1)[0];
        createBotRoom(entry);
        break;
      }
      case 'join-room': {
        const code = String(msg.code || '').toUpperCase().trim();
        const name = String(msg.name || 'Player').slice(0, 20);
        const token = resolveToken(msg.token);
        const elo = resolveElo(token, msg.elo);
        const userId = resolveUserId(msg.userId);
        const room = rooms.get(code);
        if (!room) { send(ws, { type:'error', code:'ROOM_NOT_FOUND', message:`Room ${code} not found.` }); break; }
        if (room.status !== 'waiting') { send(ws, { type:'error', code:'ROOM_FULL', message:'Game already started.' }); break; }
        const emptyIdx = room.players.findIndex(p => p === null);
        if (emptyIdx === -1) { send(ws, { type:'error', code:'ROOM_FULL', message:'Room is full.' }); break; }
        const player = { seat:emptyIdx, name, token, elo, ws, disconnectedAt:null, connected:true, isBot:false, dbUserId: userId };
        tokens.set(token, { roomCode:code, seat:emptyIdx });
        room.players[emptyIdx] = player;
        ws._room = code; ws._seat = emptyIdx; ws._token = token;
        lobbyWatchers.delete(ws);
        send(ws, { type:'room-joined', code, seat:emptyIdx, token, snapshot:getRoomSnapshot(room) });
        broadcast(room, { type:'player-joined', seat:emptyIdx, name, elo }, emptyIdx);
        if (room.players.filter(Boolean).length === (room.mode === '4p' ? 4 : 2)) startGame(room);
        else broadcastLobby();
        break;
      }
      case 'reconnect': {
        const entry = tokens.get(String(msg.token || ''));
        if (!entry) { send(ws, { type:'error', code:'INVALID_TOKEN', message:'Session expired.' }); break; }
        const room = rooms.get(entry.roomCode);
        const player = room?.players[entry.seat];
        if (!player) { send(ws, { type:'error', code:'ROOM_GONE', message:'Room gone.' }); break; }
        player.ws = ws; player.connected = true; player.disconnectedAt = null;
        ws._room = entry.roomCode; ws._seat = entry.seat; ws._token = msg.token;
        lobbyWatchers.delete(ws);
        send(ws, { type:'reconnected', seat:entry.seat, snapshot:getRoomSnapshot(room) });
        broadcast(room, { type:'player-reconnected', seat:entry.seat, name:player.name }, entry.seat);
        break;
      }
      case 'roll-dice': {
        const room = rooms.get(ws._room);
        if (!room || room.status !== 'playing' || ws._seat !== room.currentSeat || room.forcedPiece !== null) break;
        const face = Math.ceil(Math.random() * 6);
        room.diceFace = face; room.forcedPiece = DICE_TO_PIECE[face];
        broadcast(room, { type:'dice-rolled', seat:ws._seat, face, forcedPiece:room.forcedPiece });
        break;
      }
      case 'move': {
        const room = rooms.get(ws._room);
        if (!room || room.status !== 'playing' || ws._seat !== room.currentSeat || room.forcedPiece === null) break;
        const { from, to } = msg;
        const validation = validateMove(room.board, from, to, ws._seat, room.forcedPiece);
        if (!validation.ok) { send(ws, { type:'error', code:'ILLEGAL_MOVE', message:validation.reason }); break; }
        const { newBoard, captured } = applyMove(room.board, from, to, ws._seat);
        room.board = newBoard;
        let gameOver = false, winnerSeat = null;
        if (captured && captured.split(':')[1] === 'king') { gameOver = true; winnerSeat = ws._seat; }
        const max = room.mode === '4p' ? 4 : 2;
        let next = (room.currentSeat + 1) % max;
        for (let i = 0; i < max; i++) {
          const ts = (room.currentSeat + 1 + i) % max;
          if (Object.values(room.board).some(v => v === `${ts}:king`)) { next = ts; break; }
        }
        room.currentSeat = gameOver ? -1 : next; room.turn++; room.forcedPiece = null; room.diceFace = null;
        broadcast(room, { type:'move-made', from, to, captured: captured || null, seat: ws._seat, board: room.board, currentSeat: room.currentSeat, turn: room.turn, gameOver, winnerSeat });
        if (gameOver) finishGameWithWinner(room, winnerSeat, 'capture');
        else scheduleBotTurn(room);
        break;
      }
      case 'forfeit-turn': {
        const room = rooms.get(ws._room);
        if (!room || room.status !== 'playing' || ws._seat !== room.currentSeat) break;
        const max = room.mode === '4p' ? 4 : 2;
        let next = (room.currentSeat + 1) % max;
        for (let i = 0; i < max; i++) {
          const ts = (room.currentSeat + 1 + i) % max;
          if (Object.values(room.board).some(v => v === `${ts}:king`)) { next = ts; break; }
        }
        room.currentSeat = next; room.turn++; room.forcedPiece = null; room.diceFace = null;
        broadcast(room, { type:'turn-forfeited', seat:ws._seat, currentSeat:room.currentSeat, turn:room.turn });
        scheduleBotTurn(room);
        break;
      }
      case 'chat': {
        const room = rooms.get(ws._room);
        const player = room?.players[ws._seat];
        if (!player) break;
        const text = String(msg.text || '').slice(0, 200).trim();
        if (!text) break;
        const entry = { seat:ws._seat, name:player.name, text, ts:Date.now() };
        room.chatHistory.push(entry);
        if (room.chatHistory.length > 100) room.chatHistory.shift();
        broadcast(room, { type:'chat-message', ...entry });
        break;
      }
      case 'resign': {
        const room = rooms.get(ws._room);
        if (!room || room.status !== 'playing') {
          send(ws, { type:'error', code:'RESIGN_FAILED', message:'No active game to resign from.' });
          break;
        }
        finishGameByAbandon(room, ws._seat, 'resign');
        break;
      }
      case 'leave-room': {
        const room = rooms.get(ws._room);
        const seat = ws._seat;
        if (room && room.players[seat]) {
          const player = room.players[seat];
          if (room.status === 'playing') {
            finishGameByAbandon(room, seat, 'resign');
          } else {
            room.players[seat] = null;
            tokens.delete(player.token);
            if (room.rematchVotes) room.rematchVotes.delete(seat);
            broadcast(room, { type:'player-left', seat, name:player.name }, seat);
            if (room.players.every(p => !p)) rooms.delete(room.code);
            else broadcastLobby();
          }
        }
        ws._room = null; ws._seat = null; ws._token = null;
        lobbyWatchers.add(ws);
        send(ws, { type:'lobby-update', rooms: getLobbySnapshot() });
        break;
      }
      case 'rematch': {
        const room = rooms.get(ws._room);
        if (!room || room.status !== 'finished') break;
        room.rematchVotes.add(ws._seat);
        const needed = room.players.filter(Boolean).length;
        broadcast(room, { type:'rematch-vote', seat:ws._seat, votes:room.rematchVotes.size, needed });
        if (room.rematchVotes.size >= needed) startGame(room);
        break;
      }
      case 'ping': send(ws, { type:'pong', ts:Date.now() }); break;
      case 'get-lobby': send(ws, { type:'lobby-update', rooms: getLobbySnapshot() }); break;
    }
  });

  ws.on('close', () => {
    removeFromQueue(ws);
    lobbyWatchers.delete(ws);
    const room = rooms.get(ws._room);
    const player = room?.players[ws._seat];
    if (player) {
      player.connected = false; player.disconnectedAt = Date.now(); player.ws = null;
      broadcast(room, { type:'player-disconnected', seat:ws._seat, name:player.name, reconnectWindowSecs:120 });
    }
  });
});


async function fetchServerElo(userId) {
  if (!userId) return null;
  try {
    const res = await fetch(`${DB_API_URL}/api/user/${encodeURIComponent(userId)}/elo`);
    if (!res.ok) return null;
    const data = await res.json();
    return typeof data.elo === 'number' ? data.elo : null;
  } catch (e) {
    console.warn('[ELO] Failed to fetch authoritative elo for', userId, e.message);
    return null;
  }
}

// Server-authoritative for BOTH guests (flat file) and registered users (Mongo).
// Client-sent elo is only ever used as a last-resort fallback, and is logged
// when that happens so you can catch it if it becomes common.
async function resolveEloAuthoritative(token, clientElo, userId) {
  if (userId) {
    const dbElo = await fetchServerElo(userId);
    if (dbElo !== null) return dbElo;
    console.warn('[ELO] Could not verify server elo for user', userId, '- using client-reported value as fallback.');
    return Math.max(MIN_ELO, Math.min(MAX_ELO, +clientElo || 1200));
  }
  return resolveElo(token, clientElo);
}




setInterval(() => {
  const now = Date.now();
  rooms.forEach((room, code) => {
    room.players.forEach(p => {
      if (p && !p.isBot && !p.connected && p.disconnectedAt && (now - p.disconnectedAt > RECONNECT_WINDOW_MS)) {
        broadcast(room, { type:'player-forfeited', seat:p.seat, name:p.name, reason:'Timeout' });
        if (room.status === 'playing') finishGameByAbandon(room, p.seat, 'forfeit');
        p.disconnectedAt = null;
      }
    });
    if ((room.status === 'finished' || room.players.every(p=>!p||!p.connected)) && (now - room.createdAt > 3600000)) rooms.delete(code);
  });
}, 10000);