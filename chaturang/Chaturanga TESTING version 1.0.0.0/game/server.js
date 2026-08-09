const fs = require('fs');
const path = require('path');
const http = require('http');
const { Server } = require('socket.io');
const port = process.env.PORT || 8765;
const root = path.join(__dirname, '..');

const onlineUsers = new Map();     // userId -> { sockets:Set<Socket>, name, elo }
const pendingInvites = new Map();  // inviteId -> { fromUserId, fromSocket, fromName, toUserId, roomCode, mode, timer }
const INVITE_TIMEOUT_MS = 30000;

// ── Real rules engine + bot AI ────────────────────────────────────────────
// game.js's Game constructor touches localStorage (browser-only custom-army
// feature) — stub it before requiring so construction doesn't throw in Node.
if (typeof globalThis.localStorage === 'undefined') {
  globalThis.localStorage = { getItem: () => null, setItem() {}, removeItem() {} };
}
const Game = require('./js/game.js');            // exports the Game class (globalThis.ChaturangaGame)
require('./js/bot/tieredBots.js');                // attaches globalThis.ChaturangaTieredBot
const TieredBot = globalThis.ChaturangaTieredBot;
const BOT_ELO_TIER = 300; // Paranoid Strategist (~600 ELO)
// NOTE: if bots ever seem to "freeze" the whole server (all rooms stall at
// once, not just one), check that tieredBots.js's search has a wall-clock
// deadline inside its recursive eval — an unbounded minimax/expectimax at
// depth 3+ can block Node's single event loop for seconds, which looks like
// random disconnects/reconnects to every connected client, not just one bot's
// room. Ask me to patch that file directly if you hit this.

const BOT_NAMES = ['Kausalya', 'Arjun', 'Meera', 'Rohan', 'Priya', 'Devan'];
function randomBotBaseName() { return BOT_NAMES[Math.floor(Math.random() * BOT_NAMES.length)]; }

const mimeTypes = {
  '.html': 'text/html', '.css': 'text/css', '.js': 'application/javascript',
  '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml', '.txt': 'text/plain', '.pdf': 'application/pdf'
};

// ── Guest ELO ledger (flat JSON, server-authoritative, atomic writes) ─────
const LEDGER_PATH = path.join(__dirname, 'elo-ledger.json');
const MIN_ELO = 100, MAX_ELO = 3000, PROVISIONAL_GAMES = 10;

function atomicWriteJSON(filePath, data) {
  const tmpPath = filePath + '.tmp-' + process.pid + '-' + Date.now();
  fs.writeFileSync(tmpPath, JSON.stringify(data, null, 2));
  fs.renameSync(tmpPath, filePath); // atomic on POSIX/NTFS — no partial-write window
}
function loadJSONSelfHealing(filePath, label, fallback) {
  if (!fs.existsSync(filePath)) return fallback;
  const raw = fs.readFileSync(filePath, 'utf8');
  if (!raw.trim()) return fallback;
  try {
    return JSON.parse(raw);
  } catch (e) {
    console.warn(`[${label}] Corrupt JSON, resetting. Backed up to ${filePath}.corrupt. Error:`, e.message);
    try { fs.copyFileSync(filePath, filePath + '.corrupt'); } catch (backupErr) {}
    try { atomicWriteJSON(filePath, fallback); } catch (writeErr) {}
    return fallback;
  }
}


function makeInviteId() {
  return 'inv_' + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function markUserOnline(userId, socket, name, elo) {
  if (!userId) return;
  let entry = onlineUsers.get(userId);
  if (!entry) { entry = { sockets: new Set(), name, elo }; onlineUsers.set(userId, entry); }
  entry.sockets.add(socket);
  entry.name = name || entry.name;
  entry.elo = (typeof elo === 'number') ? elo : entry.elo;
  socket._userId = userId;
}
function markUserOffline(socket) {
  const userId = socket._userId;
  if (!userId) return;
  const entry = onlineUsers.get(userId);
  if (!entry) return;
  entry.sockets.delete(socket);
  if (entry.sockets.size === 0) onlineUsers.delete(userId);
}
function sendToUser(userId, obj) {
  const entry = onlineUsers.get(userId);
  if (!entry || entry.sockets.size === 0) return false;
  entry.sockets.forEach(s => send(s, obj));
  return true;
}
// Cancels a pending invite's reserved room (used on decline/timeout/disconnect).
function discardInviteRoom(roomCode) {
  const r = rooms.get(roomCode);
  if (r && r.status === 'waiting') { clearRoomBotFallback(r); rooms.delete(roomCode); broadcastLobby(); }
}
 

function loadLedger() { return loadJSONSelfHealing(LEDGER_PATH, 'ELO', {}); }
function saveLedger(ledger) {
  try { atomicWriteJSON(LEDGER_PATH, ledger); }
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

const HISTORY_PATH = path.join(__dirname, 'game-history.json');
function appendGameHistory(entry) {
  let history = loadJSONSelfHealing(HISTORY_PATH, 'History', []);
  history.push(entry);
  if (history.length > 5000) history = history.slice(-5000);
  try { atomicWriteJSON(HISTORY_PATH, history); }
  catch (e) { console.warn('[History] save failed:', e.message); }
}
function recordGameHistoryForRoom(room, winnerSeats, reason) {
  const winnerSet = new Set(winnerSeats || []);
  const botCount = room.players.filter(p => p && p.isBot).length;
  const gameType = botCount === 0 ? 'pvp' : `${botCount}bot`;
  room.players.filter(Boolean).forEach(p => {
    if (p.isBot) return;
    let result;
    if (winnerSet.size === 0) result = 'draw';
    else if (winnerSet.has(p.seat)) result = 'win';
    else result = (reason === 'resign' && p.seat === room._resignerSeat) ? 'quit' : 'loss';
    appendGameHistory({ token: p.token, userId: p.dbUserId || null, name: p.name, result, reason, gameType, roomCode: room.code, ts: Date.now() });
  });
}

// ── HTTP layer ─────────────────────────────────────────────────────────────
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
    const history = loadJSONSelfHealing(HISTORY_PATH, 'History', []);
    const mine = history.filter(h => h.token === token).slice(-50).reverse();
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify(mine));
    return;
  }

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
  console.log('Backend API and Socket.IO Multiplayer active.');
});

// ═══════════════════════════════════════════════════════════════
// SOCKET.IO MULTIPLAYER SERVER
// ═══════════════════════════════════════════════════════════════
const io = new Server(server, {
  cors: { origin: '*', methods: ['GET', 'POST'] },
  pingTimeout: 30000,   // NEW — was Socket.IO default (~20s total); give slow bot turns more slack
  pingInterval: 10000,  // NEW
});

const rooms = new Map();
const tokens = new Map();
// FIX: this was referenced (removeFromQueue / enqueueQuickMatch / tryFormMatch)
// but never declared anywhere — that's the "matchmakingQueue is not defined" error.
const matchmakingQueue = { '2p': [], '4p': [] };

const RECONNECT_WINDOW_MS = 120_000;
const DICE_TO_PIECE = { 1: 'rook', 2: 'any', 3: 'horse', 4: 'elephant', 5: 'any', 6: 'pawn-king' };
const K = 32;
const DB_API_URL = process.env.DB_API_URL || 'http://localhost:5000';
const QUICK_MATCH_BOT_FALLBACK_MS = 10000;
const ROOM_BOT_FALLBACK_MS = 10000;
const REMATCH_VOTE_TIMEOUT_MS = 30000;

function makeRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}
function makeToken() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 10); }
function resolveToken(msgToken) {
  const t = String(msgToken || '').trim();
  return t ? t : makeToken();
}
function resolveUserId(msgUserId) {
  const id = String(msgUserId || '').trim();
  return id || null;
}
// Design: this is a genuine 4-player free-for-all engine. A "2p" room is a
// human + a human (or bot, via fallback) occupying seats 0/1, with seats 2/3
// permanently auto-filled by bots so the game is always played on the real
// 4-seat board/ruleset. A "4p" room is 4 independently-seeded seats (humans
// and/or bots as they fill in). Both modes always run gameMode 'single'
// (elimination FFA) — there are no 2-team pairings in this game.
function createEngineForRoom() {
  const game = new Game();
  game.setGameMode('single');
  return game;
}

function wireKey(owner, type) { return `${owner}:${type}`; }
function engineToWireBoard(game) {
  const wire = {};
  for (const [sq, piece] of Object.entries(game.board.squares)) {
    wire[sq] = wireKey(piece.owner, piece.type);
  }
  return wire;
}
function getRoomSnapshot(room) {
  return {
    code: room.code, mode: room.mode, status: room.status,
    players: room.players.filter(Boolean).map(p => ({ seat: p.seat, name: p.name, elo: p.elo, connected: p.connected, isBot: !!p.isBot })),
    board: room.board, currentSeat: room.currentSeat, turn: room.turn,
    forcedPiece: room.forcedPiece, diceFace: room.diceFace, chatHistory: room.chatHistory.slice(-30),
  };
}
function syncRoomFromEngine(room) {
  const game = room.engine;
  room.board = engineToWireBoard(game);
  room.currentSeat = game.turnIndex;
  room.forcedPiece = game.forcedPiece;
  room.diceFace = game.lastDice;
}

function expectedScore(ratingA, ratingB) { return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400)); }

function getLobbySnapshot() {
  const openRooms = [];
  rooms.forEach((room, code) => {
    if (room.status === 'waiting') {
      const maxPlayers = 4; // every room is a 4-seat board now
      const filledSeats = room.players.filter(p => p && (p.connected || p.disconnectedAt) && !p.isBot).length;
      const elos = room.players.filter(Boolean).map(p => p.elo);
      const avgElo = elos.length ? Math.round(elos.reduce((a, b) => a + b, 0) / elos.length) : 1200;
      openRooms.push({
        code, mode: room.mode, players: filledSeats, maxPlayers: room.mode === '4p' ? 4 : 2,
        names: room.players.filter(p => p && !p.isBot).map(p => p.name),
        elos: room.players.filter(p => p && !p.isBot).map(p => p.elo),
        avgElo, createdAgo: Math.floor((Date.now() - room.createdAt) / 1000),
      });
    }
  });
  return openRooms;
}
function broadcastLobby() {
  const snapshot = getLobbySnapshot();
  io.to('lobby').emit('message', { type: 'lobby-update', rooms: snapshot });
}
function send(socket, obj) { if (socket && socket.connected) socket.emit('message', obj); }
function broadcast(room, obj, excludeSeat = -1) {
  room.players.forEach(p => {
    if (!p || p.seat === excludeSeat) return;
    if (p.socket && p.socket.connected) p.socket.emit('message', obj);
  });
}

// ── ELO (single-winner — this engine is always FFA/elimination now) ──────
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

async function persistToMongo(player, result, gameType) {
  if (!player || player.isBot || !player.dbUserId) return;
  try {
    await fetch(`${DB_API_URL}/api/user/game-history`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: player.dbUserId,
        startedAt: new Date().toISOString(),
        endedAt: new Date().toISOString(),
        type: gameType,
        result,
        newElo: player.elo
      })
    });
  } catch (e) {
    console.warn('[Mongo] Failed to persist game result for', player.dbUserId, e.message);
  }
}
function recordResult(p, change, result, gameType) {
  if (p.isBot) return;
  if (p.dbUserId) {
    persistToMongo(p, result === 'win' ? 'win' : (result === 'quitted' ? 'quitted' : 'defeat'), gameType);
  } else if (change) {
    upsertPlayerRecord(p.token, p.name, change.newElo, result === 'quitted' ? 'loss' : result);
  }
}

function finishGameWithWinner(room, winnerSeats, reason) {
  room.status = 'finished';
  const seats = Array.isArray(winnerSeats) ? winnerSeats : (winnerSeats === null ? [] : [winnerSeats]);
  const primaryWinner = seats.length ? seats[0] : null;
  const eloChanges = primaryWinner !== null ? computeEloChanges(room, primaryWinner) : {};
  const botCount = room.players.filter(p => p && p.isBot).length;
  const gameType = botCount === 0 ? 'pvp' : `${botCount}bot`;
  const winnerSet = new Set(seats);

  room.players.filter(Boolean).forEach(p => {
    if (p.isBot) return;
    const change = eloChanges[p.seat];
    const result = winnerSet.has(p.seat) ? 'win' : 'loss';
    if (Object.keys(eloChanges).length) recordResult(p, change, result, gameType);
  });

  recordGameHistoryForRoom(room, seats, reason);
  room.lastGameOver = { reason, winnerSeat: primaryWinner, winnerSeats: seats, eloChanges };
  broadcast(room, { type: 'game-over', reason, winnerSeat: primaryWinner, winnerSeats: seats, eloChanges });
  broadcastLobby();
}

function finishGameByAbandon(room, resignerSeat, reason) {
  room.status = 'finished';
  room._resignerSeat = resignerSeat;
  const others = room.players.filter(p => p && p.seat !== resignerSeat && (p.connected || p.isBot));
  const winnerSeats = others.map(p => p.seat);
  const primaryWinner = winnerSeats.length > 0 ? winnerSeats[0] : null;

  let eloChanges = {};
  const botCount = room.players.filter(p => p && p.isBot).length;
  const gameType = botCount === 0 ? 'pvp' : `${botCount}bot`;

  if (primaryWinner !== null) {
    eloChanges = computeEloChanges(room, primaryWinner);
    room.players.filter(Boolean).forEach(p => {
      if (p.isBot) return;
      const change = eloChanges[p.seat];
      const result = winnerSeats.includes(p.seat) ? 'win' : (p.seat === resignerSeat ? 'quitted' : 'loss');
      recordResult(p, change, result, gameType);
    });
  }

  recordGameHistoryForRoom(room, winnerSeats, reason);
  room.lastGameOver = { reason, winnerSeat: primaryWinner, winnerSeats, eloChanges };
  broadcast(room, { type: 'game-over', reason, winnerSeat: primaryWinner, winnerSeats, eloChanges });
  broadcastLobby();
}

function clearRoomBotFallback(room) {
  if (room._botFallbackTimer) { clearTimeout(room._botFallbackTimer); room._botFallbackTimer = null; }
}

function clearRematchTimer(room) {
  if (room._rematchTimer) { clearTimeout(room._rematchTimer); room._rematchTimer = null; }
  room._rematchDeadline = null;
}
function rematchNeededSeats(room) {
  
  return room.players.filter(p => p && !p.isBot && p.connected).map(p => p.seat);
}
function broadcastRematchTally(room) {
  broadcast(room, {
    type: 'rematch-vote',
    votedSeats: [...room.rematchVotes],
    neededSeats: rematchNeededSeats(room),
    deadline: room._rematchDeadline || null,
  });
}

function startGame(room) {
  clearRoomBotFallback(room);
  clearRematchTimer(room);
  room.lastGameOver = null;
  room.status = 'playing';


  
  room.engine = createEngineForRoom();
  syncRoomFromEngine(room);
  room.turn = 0;
  room.rematchVotes = new Set();
  broadcast(room, { type: 'game-start', snapshot: getRoomSnapshot(room) });
  broadcastLobby();
  scheduleBotTurn(room);
}

function checkEngineGameEnd(room) {
  const game = room.engine;
  if (!game.gameOver) return null;
  return game.winnerPlayerId === null ? [] : [game.winnerPlayerId];
}

// ── Bot engine ─────────────────────────────────────────────────────────────
function scheduleBotTurn(room) {
  if (!room || room.status !== 'playing') return;
  const player = room.players[room.currentSeat];
  if (!player || !player.isBot) return;
  setTimeout(() => botTakeTurn(room), 700 + Math.random() * 500);
}
function botTakeTurn(room) {
  if (!room || room.status !== 'playing') return;
  const game = room.engine;
  const seat = room.currentSeat;
  const player = room.players[seat];
  if (!player || !player.isBot) return;

  if (game.forcedPiece === null) {
    const face = game.rollDice();
    syncRoomFromEngine(room);
    broadcast(room, { type: 'dice-rolled', seat, face, forcedPiece: room.forcedPiece });
    if (game.autoForfeitIfNoMove()) {
      syncRoomFromEngine(room);
      broadcast(room, { type: 'turn-forfeited', seat, currentSeat: room.currentSeat, turn: room.turn });
      scheduleBotTurn(room);
      return;
    }
    setTimeout(() => botTakeTurn(room), 600);
    return;
  }

  const move = TieredBot ? TieredBot.getMove(game, BOT_ELO_TIER) : null;
  if (!move) {
    game.forfeitTurn();
    syncRoomFromEngine(room);
    broadcast(room, { type: 'turn-forfeited', seat, currentSeat: room.currentSeat, turn: room.turn });
    scheduleBotTurn(room);
    return;
  }

  const captured = game.board.get(move.to);
  game.makeMove(move.from, move.to);
  if (game.pendingElimination) game.completeElimination(); // actually clear eliminated player's remaining pieces
  room.turn++;
  syncRoomFromEngine(room);

  const winnerSeats = checkEngineGameEnd(room);
  broadcast(room, {
    type: 'move-made', from: move.from, to: move.to,
    captured: captured ? wireKey(captured.owner, captured.type) : null,
    seat, board: room.board, currentSeat: room.currentSeat, turn: room.turn,
    gameOver: !!winnerSeats, winnerSeat: winnerSeats ? (winnerSeats[0] ?? null) : null
  });

  if (winnerSeats) finishGameWithWinner(room, winnerSeats, 'capture');
  else scheduleBotTurn(room);
}

// ── Room-level hidden bot-fallback (manual create-room / join-room) ──────
function scheduleRoomBotFallback(room) {
  clearRoomBotFallback(room);
  room._botFallbackTimer = setTimeout(() => {
    if (room.status !== 'waiting') return;
    fillRoomWithBots(room);
    startGame(room);
  }, ROOM_BOT_FALLBACK_MS);
}
function fillRoomWithBots(room) {
  const referenceElo = (room.players.find(Boolean) || {}).elo || 1200;
  room.players = room.players.map((p, seat) => p || {
    seat, name: `${randomBotBaseName()}`, token: makeToken(), elo: referenceElo,
    socket: null, disconnectedAt: null, connected: true, isBot: true
  });
}

// ── Quick match — mode-aware queue, hidden bot-fallback per seat ─────────
function removeFromQueue(socket) {
  ['2p', '4p'].forEach(mode => {
    const q = matchmakingQueue[mode];
    const idx = q.findIndex(e => e.socket === socket);
    if (idx !== -1) { clearTimeout(q[idx].timer); q.splice(idx, 1); }
  });
}
function enqueueQuickMatch(socket, mode, name, elo, token, userId) {
  const entry = { socket, name, elo, token, userId, mode };
  entry.timer = setTimeout(() => onQueueTimeout(mode, entry), QUICK_MATCH_BOT_FALLBACK_MS);
  matchmakingQueue[mode].push(entry);
  tryFormMatch(mode);
}
function tryFormMatch(mode) {
  const need = 4;
  const q = matchmakingQueue[mode];
  while (q && q.length >= need) {
    const group = q.splice(0, need);
    group.forEach(e => clearTimeout(e.timer));
    createRoomFromEntries(mode, group, []);
  }
}
function onQueueTimeout(mode, triggeringEntry) {
  const q = matchmakingQueue[mode];
  const idx = q ? q.indexOf(triggeringEntry) : -1;
  if (idx === -1) return;
  q.splice(idx, 1);

  const need = 4;
  const extra = q.splice(0, need - 1);
  const group = [triggeringEntry, ...extra];
  group.forEach(e => clearTimeout(e.timer));

  const botsNeeded = 4 - group.length;
  const bots = Array.from({ length: Math.max(0, botsNeeded) }, () => ({ name: randomBotBaseName() }));
  createRoomFromEntries(mode, group, bots);
}
function createRoomFromEntries(mode, humanEntries, botDefs) {
  let code; do { code = makeRoomCode(); } while (rooms.has(code));
  const maxPlayers = 4;
  const players = new Array(maxPlayers).fill(null);
  const referenceElo = humanEntries[0] ? humanEntries[0].elo : 1200;

  humanEntries.forEach((e, i) => {
    const p = { seat: i, name: e.name, token: e.token, elo: e.elo, socket: e.socket, disconnectedAt: null, connected: true, isBot: false, dbUserId: e.userId || null };
    players[i] = p;
    tokens.set(e.token, { roomCode: code, seat: i });
    e.socket._room = code; e.socket._seat = i; e.socket._token = e.token;
    e.socket.leave('lobby');
    e.socket.join(code);
  });
  botDefs.forEach((b, j) => {
    const seat = humanEntries.length + j;
    players[seat] = { seat, name: `${b.name}`, token: makeToken(), elo: referenceElo, socket: null, disconnectedAt: null, connected: true, isBot: true };
  });

  const room = {
    code, mode, status: 'waiting', players, board: null, currentSeat: 0, turn: 0,
    forcedPiece: null, diceFace: null, chatHistory: [], rematchVotes: new Set(), createdAt: Date.now(), engine: null
  };
  rooms.set(code, room);

  const hasBots = botDefs.length > 0;
  humanEntries.forEach((e, i) => {
    const payload = {
      type: hasBots ? 'quick-match-bot' : 'quick-match-found',
      code, seat: i, token: players[i].token, snapshot: getRoomSnapshot(room)
    };
    if (hasBots) payload.botName = botDefs.map(b => b.name).join(', ');
    send(e.socket, payload);
  });

  startGame(room);
}

io.on('connection', socket => {
  socket._room = null;
  socket._seat = null;
  socket._token = null;

  socket.join('lobby');
  send(socket, { type: 'lobby-update', rooms: getLobbySnapshot() });

  socket.on('message', async raw => {
    let msg = raw;
    if (typeof raw === 'string') {
      try { msg = JSON.parse(raw); } catch { return; }
    }
    if (!msg || typeof msg !== 'object') return;

    switch (msg.type) {
      case 'create-room': {
        const mode = msg.mode === '4p' ? '4p' : '2p';
        const name = String(msg.name || 'Player').slice(0, 20);
        const token = resolveToken(msg.token);
        const userId = resolveUserId(msg.userId);
        const elo = await resolveEloAuthoritative(token, msg.elo, userId);
        let code; do { code = makeRoomCode(); } while (rooms.has(code));
        const player = { seat: 0, name, token, elo, socket, disconnectedAt: null, connected: true, isBot: false, dbUserId: userId };
        tokens.set(token, { roomCode: code, seat: 0 });
        // 2p rooms still play on the real 4-seat board — seats 2/3 are
        // permanent bots from the start, not a fallback-timer fill.
        const players = mode === '4p'
          ? [player, null, null, null]
          : [player, null,
             { seat: 2, name: ` ${randomBotBaseName()}`, token: makeToken(), elo, socket: null, disconnectedAt: null, connected: true, isBot: true },
             { seat: 3, name: ` ${randomBotBaseName()}`, token: makeToken(), elo, socket: null, disconnectedAt: null, connected: true, isBot: true }];
        const room = {
          code, mode, status: 'waiting', players,
          board: null, currentSeat: 0, turn: 0, forcedPiece: null, diceFace: null, chatHistory: [], rematchVotes: new Set(), createdAt: Date.now(), engine: null,
        };
        rooms.set(code, room);
        socket._room = code; socket._seat = 0; socket._token = token;
        socket.leave('lobby');
        socket.join(code);
        send(socket, { type: 'room-created', code, seat: 0, token, snapshot: getRoomSnapshot(room) });
        broadcastLobby();
        scheduleRoomBotFallback(room); // fills the remaining human seat(s) if no one joins in time
        break;
      }

      case 'identify': {
  const userId = resolveUserId(msg.userId);
  if (userId) markUserOnline(userId, socket, String(msg.name || 'Player').slice(0, 20), +msg.elo || 1200);
  break;
}


      case 'quick-match': {
        removeFromQueue(socket);
        const mode = msg.mode === '4p' ? '4p' : '2p';
        const token = resolveToken(msg.token);
        const userId = resolveUserId(msg.userId);
        const elo = await resolveEloAuthoritative(token, msg.elo, userId);
        send(socket, { type: 'quick-match-searching' });
        enqueueQuickMatch(socket, mode, String(msg.name || 'Player').slice(0, 20), elo, token, userId);
        break;
      }
      case 'cancel-quick-match': {
        removeFromQueue(socket);
        send(socket, { type: 'quick-match-cancelled' });
        break;
      }
      case 'join-room': {
        const code = String(msg.code || '').toUpperCase().trim();
        const name = String(msg.name || 'Player').slice(0, 20);
        const token = resolveToken(msg.token);
        const userId = resolveUserId(msg.userId);
        const elo = await resolveEloAuthoritative(token, msg.elo, userId);
        const room = rooms.get(code);
        if (!room) { send(socket, { type: 'error', code: 'ROOM_NOT_FOUND', message: `Room ${code} not found.` }); break; }
        if (room.status !== 'waiting') { send(socket, { type: 'error', code: 'ROOM_FULL', message: 'Game already started.' }); break; }

        if (socket._room && socket._room !== code) {
    const current = rooms.get(socket._room);
    if (current && (current.status === 'playing' || current.status === 'waiting')) {
      send(socket, { type: 'error', code: 'ALREADY_IN_ROOM', message: 'Leave your current match before joining another.' });
      break;
    }
  }



        const emptyIdx = room.players.findIndex(p => (p === null || p.isBot));
        if (emptyIdx === -1) { send(socket, { type: 'error', code: 'ROOM_FULL', message: 'Room is full.' }); break; }
        const player = { seat: emptyIdx, name, token, elo, socket, disconnectedAt: null, connected: true, isBot: false, dbUserId: userId };
        tokens.set(token, { roomCode: code, seat: emptyIdx });
        room.players[emptyIdx] = player;
        socket._room = code; socket._seat = emptyIdx; socket._token = token;
        socket.leave('lobby');
        socket.join(code);
        send(socket, { type: 'room-joined', code, seat: emptyIdx, token, snapshot: getRoomSnapshot(room) });
        broadcast(room, { type: 'player-joined', seat: emptyIdx, name, elo }, emptyIdx);
        const humanSeatsNeeded = room.mode === '4p' ? 4 : 2;
        const humanSeatsFilled = room.players.filter(p => p && !p.isBot).length;
        if (humanSeatsFilled >= humanSeatsNeeded) startGame(room);
        else broadcastLobby();
        break;
      }
      case 'reconnect': {
        const entry = tokens.get(String(msg.token || ''));
        if (!entry) { send(socket, { type: 'error', code: 'INVALID_TOKEN', message: 'Session expired.' }); break; }
        const room = rooms.get(entry.roomCode);
        const player = room?.players[entry.seat];
        if (!player) { send(socket, { type: 'error', code: 'ROOM_GONE', message: 'Room gone.' }); break; }
        player.socket = socket; player.connected = true; player.disconnectedAt = null;
        socket._room = entry.roomCode; socket._seat = entry.seat; socket._token = msg.token;
        socket.leave('lobby');
        socket.join(entry.roomCode);
        send(socket, {
          type: 'reconnected', seat: entry.seat, snapshot: getRoomSnapshot(room),
          lastGameOver: room.status === 'finished' ? room.lastGameOver : null,
          rematch: room.status === 'finished'
            ? { votedSeats: [...room.rematchVotes], neededSeats: rematchNeededSeats(room), deadline: room._rematchDeadline || null }
            : null,
        });
        broadcast(room, { type: 'player-reconnected', seat: entry.seat, name: player.name }, entry.seat);
        if (room.status === 'finished') broadcastRematchTally(room); // recompute now that this seat is connected again
        break;
      }
      case 'roll-dice': {
        const room = rooms.get(socket._room);
        if (!room || room.status !== 'playing' || socket._seat !== room.currentSeat || room.forcedPiece !== null) break;
        const face = room.engine.rollDice();
        syncRoomFromEngine(room);
        broadcast(room, { type: 'dice-rolled', seat: socket._seat, face, forcedPiece: room.forcedPiece });
        if (room.engine.autoForfeitIfNoMove()) {
          syncRoomFromEngine(room);
          broadcast(room, { type: 'turn-forfeited', seat: socket._seat, currentSeat: room.currentSeat, turn: room.turn });
          scheduleBotTurn(room);
        }
        break;
      }
      case 'move': {
        const room = rooms.get(socket._room);
        if (!room || room.status !== 'playing' || socket._seat !== room.currentSeat || room.forcedPiece === null) break;
        const { from, to } = msg;
        const game = room.engine;
        const legal = game.getLegalMoves(from);
        if (!legal.includes(to)) { send(socket, { type: 'error', code: 'ILLEGAL_MOVE', message: 'Illegal move' }); break; }
        const capturedPiece = game.board.get(to);
        const ok = game.makeMove(from, to);
        if (!ok) { send(socket, { type: 'error', code: 'ILLEGAL_MOVE', message: 'Illegal move' }); break; }
        if (game.pendingElimination) game.completeElimination();
        room.turn++;
        syncRoomFromEngine(room);

        const winnerSeats = checkEngineGameEnd(room);
        broadcast(room, {
          type: 'move-made', from, to,
          captured: capturedPiece ? wireKey(capturedPiece.owner, capturedPiece.type) : null,
          seat: socket._seat, board: room.board, currentSeat: room.currentSeat, turn: room.turn,
          gameOver: !!winnerSeats, winnerSeat: winnerSeats ? (winnerSeats[0] ?? null) : null
        });
        if (winnerSeats) finishGameWithWinner(room, winnerSeats, 'capture');
        else scheduleBotTurn(room);
        break;
      }
      case 'forfeit-turn': {
        const room = rooms.get(socket._room);
        if (!room || room.status !== 'playing' || socket._seat !== room.currentSeat) break;
        room.engine.forfeitTurn();
        room.turn++;
        syncRoomFromEngine(room);
        broadcast(room, { type: 'turn-forfeited', seat: socket._seat, currentSeat: room.currentSeat, turn: room.turn });
        scheduleBotTurn(room);
        break;
      }
       
case 'check-friends-online': {
  const ids = Array.isArray(msg.friendIds) ? msg.friendIds : [];
  const status = {};
  ids.forEach(id => { status[String(id)] = onlineUsers.has(String(id)); });
  send(socket, { type: 'friends-online-status', status });
  break;
}


      case 'chat': {
        const room = rooms.get(socket._room);
        const player = room?.players[socket._seat];
        if (!player) break;
        const text = String(msg.text || '').slice(0, 200).trim();
        if (!text) break;
        const entry = { seat: socket._seat, name: player.name, text, ts: Date.now() };
        room.chatHistory.push(entry);
        if (room.chatHistory.length > 100) room.chatHistory.shift();
        broadcast(room, { type: 'chat-message', ...entry });
        break;
      }
      case 'resign': {
        const room = rooms.get(socket._room);
        if (!room || room.status !== 'playing') {
          send(socket, { type: 'error', code: 'RESIGN_FAILED', message: 'No active game to resign from.' });
          break;
        }
        finishGameByAbandon(room, socket._seat, 'resign');
        break;
      }
      case 'leave-room': {
        const room = rooms.get(socket._room);
        const seat = socket._seat;
        if (room && room.players[seat]) {
          const player = room.players[seat];
          if (room.status === 'playing') {
            finishGameByAbandon(room, seat, 'resign');
          } else {
            room.players[seat] = null;
            tokens.delete(player.token);
            if (room.rematchVotes) room.rematchVotes.delete(seat);
            broadcast(room, { type: 'player-left', seat, name: player.name }, seat);
            if (room.players.every(p => !p)) { clearRoomBotFallback(room); clearRematchTimer(room); rooms.delete(room.code); }
            else {
              broadcastLobby();
              if (room.status === 'finished') broadcastRematchTally(room);
            }
          }
        }
        socket._room = null; socket._seat = null; socket._token = null;
        socket.join('lobby');
        send(socket, { type: 'lobby-update', rooms: getLobbySnapshot() });
        break;
      }
      case 'rematch-vote': {
        const tokenEntry = tokens.get(String(msg.token || socket._token || ''));
        const roomCode = socket._room || msg.code || tokenEntry?.roomCode;
        const room = rooms.get(roomCode);
        if (!room) {
          console.warn(`[rematch-vote] Room not found for code "${roomCode}"`);
          break;
        }

        // Re-bind socket to room and seat if reconnect hadn't finished
        let seat = socket._seat;
        if (seat === null || seat === undefined || seat < 0) {
          if (tokenEntry && tokenEntry.roomCode === roomCode) {
            seat = tokenEntry.seat;
            socket._seat = seat;
            socket._room = roomCode;
            socket._token = msg.token || socket._token;
            if (room.players[seat]) {
              room.players[seat].socket = socket;
              room.players[seat].connected = true;
            }
          }
        }

        if (room.status !== 'finished' || seat === null || seat === undefined) break;

        room.rematchVotes.add(seat);

        if (!room._rematchTimer) {
          room._rematchDeadline = Date.now() + REMATCH_VOTE_TIMEOUT_MS;
          room._rematchTimer = setTimeout(() => {
            room._rematchTimer = null; room._rematchDeadline = null;
            if (room.status !== 'finished') return;
            room.rematchVotes.clear();
            broadcast(room, { type: 'rematch-timeout' });
          }, REMATCH_VOTE_TIMEOUT_MS);
        }

        const neededSeats = rematchNeededSeats(room);
        broadcastRematchTally(room);

        if (neededSeats.length > 0 && neededSeats.every(s => room.rematchVotes.has(s))) {
          clearRematchTimer(room);
          startGame(room);
        }
        break;
      }
    
      case 'invite-friend': {
  const userId = resolveUserId(msg.userId);
  const targetUserId = resolveUserId(msg.targetUserId);
  if (!userId) { send(socket, { type: 'error', code: 'NOT_LOGGED_IN', message: 'You must be logged in to invite friends.' }); break; }
  if (!targetUserId) break;
  if (!onlineUsers.has(targetUserId)) { send(socket, { type: 'error', code: 'FRIEND_OFFLINE', message: 'That friend is not online right now.' }); break; }
 


  if (socket._room) {
    const existing = rooms.get(socket._room);
    if (existing && (existing.status === 'playing' || existing.status === 'waiting')) {
      send(socket, { type: 'error', code: 'ALREADY_IN_ROOM', message: 'Leave or finish your current match before inviting a friend.' });
      break;
    }
  }


  const name = String(msg.name || 'Player').slice(0, 20);
  const token = resolveToken(msg.token);
  const elo = await resolveEloAuthoritative(token, msg.elo, userId);
  const mode = msg.mode === '4p' ? '4p' : '2p';
 
  // Same room shape as the 'create-room' handler — the inviter takes seat 0
  // and waits; a 2p room's seats 2/3 are permanent bots as usual.
  let code; do { code = makeRoomCode(); } while (rooms.has(code));
  const player = { seat: 0, name, token, elo, socket, disconnectedAt: null, connected: true, isBot: false, dbUserId: userId };
  tokens.set(token, { roomCode: code, seat: 0 });
  const players = mode === '4p'
    ? [player, null, null, null]
    : [player, null,
       { seat: 2, name: ` ${randomBotBaseName()}`, token: makeToken(), elo, socket: null, disconnectedAt: null, connected: true, isBot: true },
       { seat: 3, name: ` ${randomBotBaseName()}`, token: makeToken(), elo, socket: null, disconnectedAt: null, connected: true, isBot: true }];
  const room = {
    code, mode, status: 'waiting', players,
    board: null, currentSeat: 0, turn: 0, forcedPiece: null, diceFace: null,
    chatHistory: [], rematchVotes: new Set(), createdAt: Date.now(), engine: null,
  };
  rooms.set(code, room);
  socket._room = code; socket._seat = 0; socket._token = token;
  socket.leave('lobby');
  socket.join(code);
  send(socket, { type: 'room-created', code, seat: 0, token, snapshot: getRoomSnapshot(room) });
  broadcastLobby();
  // NOTE: no scheduleRoomBotFallback() here — an invite is either accepted,
  // declined, or times out on its own 30s clock (below), so bots should
  // never silently fill a friend-invite room.
 
  const inviteId = makeInviteId();
  const timer = setTimeout(() => {
    const inv = pendingInvites.get(inviteId);
    if (!inv) return;
    pendingInvites.delete(inviteId);
    send(inv.fromSocket, { type: 'invite-timeout', inviteId, toName: inv.toName });
    discardInviteRoom(inv.roomCode);
  }, INVITE_TIMEOUT_MS);
 
  pendingInvites.set(inviteId, {
  inviteId, fromUserId: userId, fromSocket: socket, fromName: name,
  toUserId: targetUserId, toSocket: null,   // NEW — filled in once we know the invitee is deliverable
  roomCode: code, mode, timer
});
 
 const delivered = sendToUser(targetUserId, {
  type: 'game-invite', inviteId, fromUserId: userId, fromName: name, fromElo: elo, mode, roomCode: code
});
if (delivered) {
  const inv = pendingInvites.get(inviteId);
  const entry = onlineUsers.get(targetUserId);
  if (inv && entry) inv.toSocket = [...entry.sockets][0]; // first active socket for the invitee
}
  if (!delivered) {
    clearTimeout(timer);
    pendingInvites.delete(inviteId);
    discardInviteRoom(code);
    send(socket, { type: 'error', code: 'FRIEND_OFFLINE', message: 'That friend just went offline.' });
  }
  break;
}

      case 'invite-response': {
  const inv = pendingInvites.get(msg.inviteId);
  if (!inv) { send(socket, { type: 'error', code: 'INVITE_EXPIRED', message: 'This invite has expired.' }); break; }
  pendingInvites.delete(inv.inviteId);
  clearTimeout(inv.timer);
 
  if (!msg.accepted) {
    send(inv.fromSocket, { type: 'invite-declined', inviteId: inv.inviteId, byName: String(msg.name || 'Friend').slice(0, 20) });
    discardInviteRoom(inv.roomCode);
    break;
  }
  // Tell the invitee to join-room normally with the reserved code — reuses
  // your existing 'join-room' handler/validation instead of duplicating it.
  send(socket, { type: 'invite-accepted-self', roomCode: inv.roomCode });
  send(inv.fromSocket, { type: 'invite-accepted', inviteId: inv.inviteId, roomCode: inv.roomCode });
  break;
}
      
      case 'ping': send(socket, { type: 'pong', ts: Date.now() }); break;
      case 'get-lobby': send(socket, { type: 'lobby-update', rooms: getLobbySnapshot() }); break;
    }
  });

  socket.on('disconnect', () => {
    markUserOffline(socket);
pendingInvites.forEach((inv, id) => {
  if (inv.fromSocket === socket) {
    clearTimeout(inv.timer);
    pendingInvites.delete(id);
    discardInviteRoom(inv.roomCode);
     if (inv.toSocket) send(inv.toSocket, { type: 'invite-cancelled', inviteId: id }); // NEW
  }
});
    removeFromQueue(socket);
    socket.leave('lobby');
    const room = rooms.get(socket._room);
    const player = room?.players[socket._seat];
    if (player && player.socket === socket) {
      player.connected = false; player.disconnectedAt = Date.now(); player.socket = null;
      broadcast(room, { type: 'player-disconnected', seat: socket._seat, name: player.name, reconnectWindowSecs: 120 });
      if (room.status === 'finished') {
        room.rematchVotes.delete(socket._seat);
        broadcastRematchTally(room); // keep the "needed" count honest — a dropped player can't block a rematch
      }
    }
  });
});

async function fetchServerElo(userId) {
  if (!userId) return null;
  try {
    const res = await fetch(`${DB_API_URL}/api/user/${encodeURIComponent(userId)}`);
    if (!res.ok) return null;
    const data = await res.json();
    return (data && data.success && data.user && typeof data.user.elo === 'number') ? data.user.elo : null;
  } catch (e) {
    console.warn('[ELO] Failed to fetch authoritative elo for', userId, e.message);
    return null;
  }
}
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
        broadcast(room, { type: 'player-forfeited', seat: p.seat, name: p.name, reason: 'Timeout' });
        if (room.status === 'playing') finishGameByAbandon(room, p.seat, 'forfeit');
        p.disconnectedAt = null;
      }
    });
    if ((room.status === 'finished' || room.players.every(p => !p || !p.connected)) && (now - room.createdAt > 3600000)) {
      clearRoomBotFallback(room);
      clearRematchTimer(room);
      rooms.delete(code);
    }
  });
}, 10000);