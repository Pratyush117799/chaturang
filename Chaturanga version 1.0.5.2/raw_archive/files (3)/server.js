const fs = require('fs');
const path = require('path');
const WebSocket = require('ws');
const port = 8765;
const root = path.join(__dirname, '..');

const mimeTypes = {
    '.html': 'text/html',
    '.css': 'text/css',
    '.js': 'application/javascript',
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.svg': 'image/svg+xml',
    '.txt': 'text/plain',
    '.pdf': 'application/pdf'
};

const server = http.createServer((req, res) => {
    let urlPath = req.url.split('?')[0];
    if (urlPath === '/') urlPath = '/website/index.html';
    
    // Handle API endpoints

    // GET /api/leaderboard — top 100 players by ELO
    if (req.method === 'GET' && urlPath === '/api/leaderboard') {
      res.writeHead(200, { 'Content-Type': 'application/json', 'Access-Control-Allow-Origin': '*' });
      res.end(JSON.stringify(getLeaderboard()));
      return;
    }

    // GET /api/player/:token — own stats (token is private, used only by that player)
    if (req.method === 'GET' && urlPath.startsWith('/api/player/')) {
      const token = decodeURIComponent(urlPath.split('/api/player/')[1] || '');
      const record = getPlayerRecord(token);
      if (!record) { res.writeHead(404); res.end(JSON.stringify({ error: 'Not found' })); return; }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ ...record, provisional: (record.games||0) < PROVISIONAL_GAMES }));
      return;
    }

    if (req.method === 'POST' && urlPath === '/api/admin/puzzle') {
        let body = '';
        req.on('data', chunk => { body += chunk.toString(); });
        req.on('end', () => {
            try {
                const puzzleData = JSON.parse(body);
                const puzzlesFilePath = path.join(root, 'Chaturanga-version-1.0.5', 'puzzles', 'puzzle-data.js');
                
                // Read current puzzle file
                let content = fs.readFileSync(puzzlesFilePath, 'utf8');
                
                // Inject the new puzzle into the global array
                // Matches: window.ChaturangaPuzzleData = [ ... ];
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
    console.log('Chaturanga v1.0.5 Web Server running at http://localhost:' + port);
    console.log('Backend API and WebSocket Multiplayer active.');
});

// ═══════════════════════════════════════════════════════════════
// WEBSOCKET MULTIPLAYER SERVER (Integrated v1.0.5)
// ═══════════════════════════════════════════════════════════════
const wss = new WebSocket.Server({ server });

// Room & Game Logic (ported from server-ws.js)
const rooms = new Map();
const tokens = new Map();
const RECONNECT_WINDOW_MS = 120_000;
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
const lobbyWatchers = new Set();
const K = 32;
const MIN_ELO = 100;
const MAX_ELO = 3000;
const PROVISIONAL_GAMES = 10; // games before rating is considered established

// ── ELO Ledger (flat JSON file, server-authoritative) ─────────────────────────
// Format: { [token]: { elo, name, wins, losses, draws, games, createdAt, lastSeen } }
const LEDGER_PATH = path.join(__dirname, 'elo-ledger.json');

function loadLedger() {
  try {
    if (fs.existsSync(LEDGER_PATH)) return JSON.parse(fs.readFileSync(LEDGER_PATH, 'utf8'));
  } catch(e) { console.warn('[ELO] Ledger load failed:', e.message); }
  return {};
}
function saveLedger(ledger) {
  try { fs.writeFileSync(LEDGER_PATH, JSON.stringify(ledger, null, 2)); }
  catch(e) { console.warn('[ELO] Ledger save failed:', e.message); }
}
function getPlayerRecord(token) {
  const ledger = loadLedger();
  return ledger[token] || null;
}
function upsertPlayerRecord(token, name, newElo, result) {
  // result: 'win' | 'loss' | 'draw'
  const ledger = loadLedger();
  const existing = ledger[token];
  const now = Date.now();
  if (!existing) {
    ledger[token] = { elo: newElo, name, wins: result==='win'?1:0, losses: result==='loss'?1:0, draws: result==='draw'?1:0, games: 1, createdAt: now, lastSeen: now };
  } else {
    existing.elo      = newElo;
    existing.name     = name; // update display name
    existing.games    = (existing.games || 0) + 1;
    existing.wins     = (existing.wins   || 0) + (result==='win'  ? 1 : 0);
    existing.losses   = (existing.losses || 0) + (result==='loss' ? 1 : 0);
    existing.draws    = (existing.draws  || 0) + (result==='draw' ? 1 : 0);
    existing.lastSeen = now;
  }
  saveLedger(ledger);
  return ledger[token];
}
// Return server-authoritative ELO for a token; fall back to clientElo if unknown
function resolveElo(token, clientElo) {
  if (!token) return Math.max(MIN_ELO, Math.min(MAX_ELO, +clientElo || 1200));
  const record = getPlayerRecord(token);
  if (record) return record.elo; // server wins — prevents spoofing
  return Math.max(MIN_ELO, Math.min(MAX_ELO, +clientElo || 1200));
}
// Add GET /api/leaderboard endpoint in HTTP handler
function getLeaderboard() {
  const ledger = loadLedger();
  return Object.entries(ledger)
    .map(([token, r]) => ({ name: r.name, elo: r.elo, games: r.games||0, wins: r.wins||0, losses: r.losses||0, provisional: (r.games||0) < PROVISIONAL_GAMES }))
    .filter(r => r.games > 0)
    .sort((a, b) => b.elo - a.elo)
    .slice(0, 100); // top 100
}

// Utility functions
function makeRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = '';
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)];
  return code;
}
function makeToken() { return Date.now().toString(36) + Math.random().toString(36).slice(2, 10); }

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
  const [, type] = piece.split(':');
  const r = parseInt(to[1]);
  if (type === 'pawn') {
    if ((playerId === 0 && r === 8) || (playerId === 1 && r === 1)) {
      newBoard[to] = `${playerId}:rook`;
    }
  }
  return { newBoard, captured };
}

function expectedScore(ratingA, ratingB) { return 1 / (1 + Math.pow(10, (ratingB - ratingA) / 400)); }
function newElo(rating, expected, actual) { return Math.round(Math.max(100, rating + K * (actual - expected))); }

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
        elos:  room.players.filter(p=>p).map(p=>p.elo),
        avgElo,
        createdAgo: Math.floor((Date.now() - room.createdAt) / 1000),
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
    players: room.players.filter(Boolean).map(p => ({ seat: p.seat, name: p.name, elo: p.elo, connected: p.connected })),
    board: room.board, currentSeat: room.currentSeat, turn: room.turn,
    forcedPiece: room.forcedPiece, diceFace: room.diceFace, chatHistory: room.chatHistory.slice(-30),
  };
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

wss.on('connection', ws => {
  ws._room = null; ws._seat = null; ws._token = null;
  lobbyWatchers.add(ws);
  send(ws, { type: 'lobby-update', rooms: getLobbySnapshot() });

  ws.on('message', raw => {
    let msg; try { msg = JSON.parse(raw); } catch { return; }
    switch (msg.type) {
      case 'create-room': {
        const mode = msg.mode === '4p' ? '4p' : '2p';
        const name = String(msg.name || 'Player').slice(0, 20);
        // resolveElo uses server ledger if token known — prevents spoofing
        const token = makeToken();
        const elo = resolveElo(msg.token || null, msg.elo || 1200);
        let code; do { code = makeRoomCode(); } while (rooms.has(code));
        const player = { seat:0, name, token, elo, ws, disconnectedAt:null, connected:true };
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
      case 'join-room': {
        const code = String(msg.code || '').toUpperCase().trim();
        const name = String(msg.name || 'Player').slice(0, 20);
        const elo = resolveElo(msg.token || null, msg.elo || 1200);
        const room = rooms.get(code);
        if (!room) { send(ws, { type:'error', code:'ROOM_NOT_FOUND', message:`Room ${code} not found.` }); break; }
        if (room.status !== 'waiting') { send(ws, { type:'error', code:'ROOM_FULL', message:'Game already started.' }); break; }
        const emptyIdx = room.players.findIndex(p => p === null);
        if (emptyIdx === -1) { send(ws, { type:'error', code:'ROOM_FULL', message:'Room is full.' }); break; }
        const token = makeToken();
        const player = { seat:emptyIdx, name, token, elo, ws, disconnectedAt:null, connected:true };
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
        if (captured && captured.split(':')[1] === 'king') { gameOver = true; winnerSeat = ws._seat; room.status = 'finished'; }
        const max = room.mode === '4p' ? 4 : 2;
        let next = (room.currentSeat + 1) % max;
        for (let i = 0; i < max; i++) {
          const ts = (room.currentSeat + 1 + i) % max;
          if (Object.values(room.board).some(v => v === `${ts}:king`)) { next = ts; break; }
        }
        room.currentSeat = gameOver ? -1 : next; room.turn++; room.forcedPiece = null; room.diceFace = null;
        broadcast(room, { type:'move-made', from, to, captured: captured || null, seat: ws._seat, board: room.board, currentSeat: room.currentSeat, turn: room.turn, gameOver, winnerSeat });
        if (gameOver) {
          const eloChanges = computeEloChanges(room, winnerSeat);
          broadcast(room, { type:'game-over', winnerSeat, eloChanges });
          // Persist updated ELOs to server ledger
          room.players.filter(Boolean).forEach(p => {
            const change = eloChanges[p.seat];
            if (change && p.token) {
              const result = p.seat === winnerSeat ? 'win' : 'loss';
              upsertPlayerRecord(p.token, p.name, change.newElo, result);
            }
          });
        }
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
    lobbyWatchers.delete(ws);
    const room = rooms.get(ws._room);
    const player = room?.players[ws._seat];
    if (player) {
      player.connected = false; player.disconnectedAt = Date.now(); player.ws = null;
      broadcast(room, { type:'player-disconnected', seat:ws._seat, name:player.name, reconnectWindowSecs:120 });
    }
  });
});

setInterval(() => {
  const now = Date.now();
  rooms.forEach((room, code) => {
    room.players.forEach(p => {
      if (p && !p.connected && p.disconnectedAt && (now - p.disconnectedAt > RECONNECT_WINDOW_MS)) {
        broadcast(room, { type:'player-forfeited', seat:p.seat, name:p.name, reason:'Timeout' });
        if (room.status === 'playing') { room.status = 'finished'; broadcast(room, { type:'game-over', reason:'forfeit', forfeiter:p.seat }); }
        p.disconnectedAt = null;
      }
    });
    if ((room.status === 'finished' || room.players.every(p=>!p||!p.connected)) && (now - room.createdAt > 3600000)) rooms.delete(code);
  }, 10000);
});
