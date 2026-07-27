/**
 * Chaturanga v1.0.4 — WebSocket Server (Online Multiplayer)
 * Run: node server-ws.js
 * Requires: npm install ws
 */
const http = require('http');
const WebSocket = require('ws');
const fs   = require('fs');
const path = require('path');

const HTTP_PORT = 8765;
const WS_PORT   = 8766;

// ── Static file server on 8765 ─────────────────────────────────────────────
const MIME = { '.html':'text/html','.js':'application/javascript','.css':'text/css','.png':'image/png','.ico':'image/x-icon','.json':'application/json','.py':'text/plain' };
const httpServer = http.createServer((req, res) => {
  let url = req.url.split('?')[0];
  if (url === '/' || url === '') url = '/game.html';
  const filePath = path.join(__dirname, url);
  fs.readFile(filePath, (err, data) => {
    if (err) { res.writeHead(404); res.end('Not found: ' + url); return; }
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': MIME[ext] || 'application/octet-stream' });
    res.end(data);
  });
});
httpServer.listen(HTTP_PORT, () => console.log('[HTTP] Serving on http://localhost:' + HTTP_PORT));

// ── WebSocket server on 8766 ───────────────────────────────────────────────
const rooms = new Map(); // code -> Room

function genCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTWXYZ23456789';
  let code = '';
  for (let i=0;i<6;i++) code+=chars[Math.floor(Math.random()*chars.length)];
  return rooms.has(code) ? genCode() : code;
}

const wss = new WebSocket.Server({ port: WS_PORT });
console.log('[WS] Listening on ws://localhost:' + WS_PORT);

wss.on('connection', (ws) => {
  ws._player = null;
  ws._room   = null;

  ws.on('message', (raw) => {
    let msg;
    try { msg = JSON.parse(raw); } catch(e) { return; }
    handleMessage(ws, msg);
  });

  ws.on('close', () => onDisconnect(ws));
  ws.on('error', () => {});
});

function handleMessage(ws, msg) {
  switch(msg.type) {
    case 'create_room': {
      const code = genCode();
      const room = {
        code,
        players: [null,null,null,null],
        spectators: [],
        gameState: null,
        chat: [],
        status: 'lobby',
        createdAt: Date.now(),
        settings: msg.settings || {}
      };
      const colour = 0;
      const player = { ws, name: sanitize(msg.name||'Player'), colour, connected: true, disconnectTime: null };
      room.players[colour] = player;
      ws._player = player;
      ws._room   = code;
      rooms.set(code, room);
      send(ws, { type: 'room_created', code, colour });
      break;
    }
    case 'join_room': {
      const code = msg.code ? msg.code.toUpperCase() : '';
      const room = rooms.get(code);
      if (!room) { send(ws, { type: 'error', reason: 'Room not found' }); return; }
      // Check for reconnection
      for (let i=0;i<4;i++) {
        const p = room.players[i];
        if (p && !p.connected && p.name === sanitize(msg.name) && Date.now()-p.disconnectTime < 60000) {
          p.ws = ws; p.connected = true; p.disconnectTime = null;
          ws._player = p; ws._room = code;
          send(ws, { type: 'room_joined', code, colour: i, players: getPlayerList(room) });
          broadcast(room, { type: 'player_reconnected', colour: i }, ws);
          if (room.gameState) send(ws, { type: 'game_state', state: room.gameState });
          return;
        }
      }
      const slot = room.players.findIndex(p => !p);
      if (slot < 0) { room.spectators.push(ws); send(ws, { type: 'joined_as_spectator', code }); return; }
      const colour = slot;
      const player = { ws, name: sanitize(msg.name||'Player'), colour, connected: true, disconnectTime: null };
      room.players[colour] = player;
      ws._player = player; ws._room = code;
      send(ws, { type: 'room_joined', code, colour, players: getPlayerList(room) });
      broadcast(room, { type: 'player_joined', name: player.name, colour }, ws);
      break;
    }
    case 'start_game': {
      const room = getRoom(ws);
      if (!room) return;
      if (room.players.filter(Boolean).length < 2) { send(ws, { type: 'error', reason: 'Need at least 2 players' }); return; }
      room.status = 'playing';
      room.gameState = { turnIndex: 0, forcedPiece: null };
      broadcastAll(room, { type: 'game_started', initialBoard: room.gameState });
      break;
    }
    case 'roll_dice': {
      const room = getRoom(ws);
      if (!room || room.status !== 'playing') return;
      const face = Math.floor(Math.random()*6)+1;
      const forced = diceToPiece(face);
      if (room.gameState) { room.gameState.lastDice=face; room.gameState.forcedPiece=forced; }
      broadcastAll(room, { type: 'dice_rolled', player: ws._player.colour, face, forcedPiece: forced });
      break;
    }
    case 'move': {
      const room = getRoom(ws);
      if (!room || room.status !== 'playing') return;
      if (!ws._player) return;
      // Basic validation (client positions not tracked fully server-side here — future: full engine)
      const from = msg.from, to = msg.to;
      if (!isValidSq(from) || !isValidSq(to)) { send(ws, { type: 'move_rejected', reason: 'Invalid squares' }); return; }
      if (room.gameState) { room.gameState.forcedPiece = null; room.gameState.turnIndex = (room.gameState.turnIndex+1)%4; }
      broadcastAll(room, { type: 'move_applied', from, to, player: ws._player.colour, nextPlayer: room.gameState.turnIndex });
      break;
    }
    case 'chat': {
      const room = getRoom(ws);
      if (!room) return;
      const message = sanitize((msg.message||'').slice(0,200));
      const entry   = { type: 'chat_message', name: ws._player?.name||'?', message, timestamp: Date.now() };
      room.chat.push(entry); if (room.chat.length>50) room.chat.shift();
      broadcastAll(room, entry);
      break;
    }
    case 'forfeit_turn': {
      const room = getRoom(ws);
      if (!room) return;
      if (room.gameState) { room.gameState.forcedPiece=null; room.gameState.turnIndex=(room.gameState.turnIndex+1)%4; }
      broadcastAll(room, { type: 'turn_forfeited', player: ws._player?.colour });
      break;
    }
  }
}

function onDisconnect(ws) {
  const code = ws._room;
  if (!code) return;
  const room = rooms.get(code);
  if (!room || !ws._player) return;
  ws._player.connected = false;
  ws._player.disconnectTime = Date.now();
  broadcast(room, { type: 'player_disconnected', colour: ws._player.colour, gracePeriodSeconds: 60 }, ws);
  // Clean up after 60s if no reconnect
  setTimeout(() => {
    if (!ws._player.connected) {
      const slot = room.players.findIndex(p => p && p.colour === ws._player.colour);
      if (slot >= 0) room.players[slot] = null;
      broadcast(room, { type: 'player_left', colour: ws._player.colour }, null);
    }
  }, 60000);
}

function getRoom(ws) { return ws._room ? rooms.get(ws._room) : null; }
function getPlayerList(room) { return room.players.map(p => p ? { name: p.name, colour: p.colour, connected: p.connected } : null); }
function send(ws, obj) { try { if (ws.readyState===1) ws.send(JSON.stringify(obj)); } catch(e){} }
function broadcast(room, obj, excludeWs) {
  room.players.forEach(p => { if (p && p.ws !== excludeWs) send(p.ws, obj); });
  room.spectators.forEach(s => { if (s !== excludeWs) send(s, obj); });
}
function broadcastAll(room, obj) { broadcast(room, obj, null); }
function sanitize(str) { return String(str||'').replace(/<[^>]*>/g,'').trim().slice(0,100); }
function isValidSq(sq) { return typeof sq==='string' && /^[a-h][1-8]$/.test(sq); }
function diceToPiece(d) {
  if(d===1)return'rook';if(d===2||d===5)return'any';if(d===3)return'horse';if(d===4)return'elephant';if(d===6)return'pawn-king';return'any';
}
