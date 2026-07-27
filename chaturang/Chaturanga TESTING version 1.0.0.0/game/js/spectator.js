/**
 * spectator.js — Chaturanga v1.0.5.2
 * Client-side spectator mode. Drop-in for game.html + lobby.html.
 *
 * In game.html: <script src="js/spectator.js"></script> after ws-client.js
 * In lobby.html: same script tag handles the Watch buttons
 *
 * Server patch is in the comment block at the bottom.
 * Exposes: Spectator.init(), Spectator.isWatching()
 */

const Spectator = (() => {

  let _watching = false;
  let _spectatorCount = 0;

  // ── detect if this session joined as spectator ────────────────────────────
  // Set when lobby Watch button sends join-spectate
  function isWatching() { return _watching; }

  // ── lock down game controls for spectators ────────────────────────────────
  function lockControls() {
    // Disable Roll button, board interaction, forfeit
    const selectors = [
      '#rollBtn', '#diceBtn', '.roll-btn',
      '#forfeitBtn', '.forfeit-btn',
      '#boardContainer', '#board'
    ];
    selectors.forEach(sel => {
      const el = document.querySelector(sel);
      if (!el) return;
      el.style.pointerEvents = 'none';
      el.style.opacity       = sel.includes('board') ? '1' : '0.35';
      el.title               = 'Spectators cannot interact';
    });

    // Drag-and-drop — patch ui.js piece handler if exposed
    if (typeof window.setSpectatorMode === 'function') {
      window.setSpectatorMode(true);
    }
  }

  // ── spectator banner ──────────────────────────────────────────────────────
  function injectBanner() {
    if (document.getElementById('spectatorBanner')) return;
    const banner = document.createElement('div');
    banner.id = 'spectatorBanner';
    banner.style.cssText = `
      position:fixed;top:0;left:0;right:0;z-index:8888;
      background:linear-gradient(90deg,#0d0a00,#1a1200,#0d0a00);
      border-bottom:1px solid rgba(201,168,76,0.3);
      padding:6px 16px;display:flex;align-items:center;justify-content:space-between;
      font-family:Outfit,sans-serif;font-size:12px;`;
    banner.innerHTML = `
      <span style="color:#c9a84c;letter-spacing:.08em">👁 WATCHING</span>
      <span id="spectatorCountLabel" style="color:#666">— spectators</span>
      <a href="lobby.html" style="color:#555;text-decoration:none;font-size:11px">← Leave</a>`;
    document.body.prepend(banner);
    // Shift body down so banner doesn't overlap nav
    document.body.style.paddingTop = '32px';
  }

  function updateCount(n) {
    _spectatorCount = n;
    const el = document.getElementById('spectatorCountLabel');
    if (el) el.textContent = `${n} watching`;
  }

  // ── spectator chat sidebar ────────────────────────────────────────────────
  function injectChat() {
    if (document.getElementById('spectatorChat')) return;
    const chat = document.createElement('div');
    chat.id = 'spectatorChat';
    chat.style.cssText = `
      position:fixed;right:0;top:40px;bottom:0;width:220px;
      background:#0a0800;border-left:1px solid #2a2200;
      display:flex;flex-direction:column;z-index:7000;
      font-family:Outfit,sans-serif;font-size:12px;`;
    chat.innerHTML = `
      <div style="padding:8px 12px;border-bottom:1px solid #2a2200;color:#c9a84c;font-size:11px;letter-spacing:.08em">
        SPECTATOR CHAT
      </div>
      <div id="spectatorMessages" style="flex:1;overflow-y:auto;padding:8px;display:flex;flex-direction:column;gap:4px"></div>
      <div style="padding:8px;border-top:1px solid #2a2200;display:flex;gap:6px">
        <input id="spectatorInput" placeholder="Say something…"
          style="flex:1;background:#111;border:1px solid #2a2200;border-radius:6px;
          padding:5px 8px;color:#ccc;font-size:12px;font-family:Outfit,sans-serif;outline:none"/>
        <button id="spectatorSend"
          style="padding:5px 10px;background:#1a1200;border:1px solid #c9a84c;
          border-radius:6px;color:#c9a84c;cursor:pointer;font-size:11px">→</button>
      </div>`;
    document.body.appendChild(chat);

    // Keyboard send
    const input = document.getElementById('spectatorInput');
    const send  = () => {
      const msg = input.value.trim();
      if (!msg) return;
      input.value = '';
      sendChatMessage(msg);
    };
    input.addEventListener('keydown', e => { if (e.key === 'Enter') send(); });
    document.getElementById('spectatorSend').addEventListener('click', send);
  }

  function appendChatMessage(name, msg) {
    const el = document.getElementById('spectatorMessages');
    if (!el) return;
    const row = document.createElement('div');
    row.style.cssText = 'padding:3px 0;border-bottom:1px solid #111;line-height:1.4';
    row.innerHTML = `<span style="color:#c9a84c">${escHtml(name)}:</span>
      <span style="color:#aaa;margin-left:5px">${escHtml(msg)}</span>`;
    el.appendChild(row);
    el.scrollTop = el.scrollHeight;
  }

  function sendChatMessage(msg) {
    if (window.ws && ws.readyState === 1) {
      ws.send(JSON.stringify({ type: 'spectator-chat', msg }));
    }
  }

  // ── WS message hook ───────────────────────────────────────────────────────
  function hookWS() {
    const prev = window.onWsMessage;
    window.onWsMessage = function (data) {
      switch (data.type) {
        case 'spectator-count':
          updateCount(data.count);
          break;
        case 'spectator-chat':
          appendChatMessage(data.name || 'Spectator', data.msg);
          break;
        case 'join-spectate-ack':
          _watching = true;
          init();
          break;
      }
      if (typeof prev === 'function') prev(data);
    };
  }

  // ── init for game.html ────────────────────────────────────────────────────
  function init() {
    if (!_watching) return;
    lockControls();
    injectBanner();
    injectChat();
  }

  // ── auto-join spectate from URL param ?watch=roomId ───────────────────────
  function autoJoinFromURL() {
    const roomId = new URLSearchParams(window.location.search).get('watch');
    if (!roomId) return false;
    _watching = true;
    // Send join-spectate once WS connects
    const _origOpen = window.onWsOpen || function(){};
    window.onWsOpen = function () {
      if (window.ws && ws.readyState === 1) {
        ws.send(JSON.stringify({ type: 'join-spectate', roomId }));
      }
      _origOpen();
    };
    return true;
  }

  // ── lobby Watch button injection ──────────────────────────────────────────
  // Call after rendering room cards in lobby.html
  function addWatchButtons(roomListEl) {
    if (!roomListEl) return;
    injectWatchCSS();
    roomListEl.querySelectorAll('.room-card').forEach(card => {
      if (card.querySelector('.watch-btn')) return; // already has one
      const roomId = card.dataset.roomId || card.dataset.id;
      if (!roomId) return;

      const count = card.querySelector('.spectator-count');
      if (!count) {
        const badge = document.createElement('span');
        badge.className = 'spectator-count';
        badge.dataset.room = roomId;
        badge.style.cssText = 'display:none;font-size:11px;color:#888;margin-left:8px;';
        card.querySelector('.room-title, h3, .room-name')?.appendChild(badge);
      }

      const btn = document.createElement('button');
      btn.className   = 'watch-btn';
      btn.textContent = '👁 Watch';
      btn.addEventListener('click', () => {
        window.location.href = `game.html?watch=${encodeURIComponent(roomId)}`;
      });
      card.appendChild(btn);
    });
  }

  function updateLobbySpectatorCount(roomId, count) {
    const el = document.querySelector(`.spectator-count[data-room="${roomId}"]`);
    if (!el) return;
    el.style.display = count > 0 ? 'inline' : 'none';
    el.textContent   = `${count} watching`;
  }

  function injectWatchCSS() {
    if (document.getElementById('watch-btn-css')) return;
    const s = document.createElement('style');
    s.id = 'watch-btn-css';
    s.textContent = `
      .watch-btn { padding:6px 14px;border-radius:7px;background:transparent;
        border:1px solid rgba(201,168,76,0.3);color:#c9a84c;
        font-family:Outfit,sans-serif;font-size:12px;cursor:pointer;
        transition:background .2s,border-color .2s;margin-left:8px; }
      .watch-btn:hover { background:rgba(201,168,76,0.12);border-color:rgba(201,168,76,0.6); }
    `;
    document.head.appendChild(s);
  }

  function escHtml(s) {
    return String(s).replace(/[&<>"']/g,
      c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  // ── boot ─────────────────────────────────────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    hookWS();
    autoJoinFromURL();
  });

  window.Spectator = { init, isWatching, addWatchButtons, updateLobbySpectatorCount, appendChatMessage };
  return window.Spectator;
})();


/* ═══════════════════════════════════════════════════════════════════════════
   SERVER-WS.JS PATCH — paste inside your message handler switch/if block
   ═══════════════════════════════════════════════════════════════════════════

// At room creation, add spectators set:
//   room.spectators = new Set();

case 'join-spectate': {
  const room = rooms.get(data.roomId);
  if (!room) { ws.send(JSON.stringify({ type: 'error', msg: 'Room not found' })); break; }
  room.spectators.add(ws);
  ws.isSpectator = true;
  ws.roomId = data.roomId;
  // Send current game state snapshot
  if (room.gameState) ws.send(JSON.stringify({ type: 'game-state', state: room.gameState }));
  ws.send(JSON.stringify({ type: 'join-spectate-ack', roomId: data.roomId }));
  // Broadcast updated count to everyone in room
  const count = room.spectators.size;
  broadcastToRoom(room, { type: 'spectator-count', count });
  break;
}

case 'spectator-chat': {
  if (!ws.isSpectator && !ws.playerId) break;
  const room = rooms.get(ws.roomId);
  if (!room) break;
  const name = ws.playerName || 'Spectator';
  // Broadcast to spectators only (don't clutter player chat)
  room.spectators.forEach(s => {
    if (s.readyState === 1) s.send(JSON.stringify({ type: 'spectator-chat', name, msg: data.msg }));
  });
  break;
}

// Guard: reject moves from spectators
case 'move':
case 'roll-dice':
case 'forfeit': {
  if (ws.isSpectator) break; // silently reject
  // ... your existing handler
}

// In broadcastToRoom helper — include spectators:
function broadcastToRoom(room, msg) {
  const str = JSON.stringify(msg);
  room.players.forEach(p => { if (p.ws?.readyState === 1) p.ws.send(str); });
  room.spectators.forEach(s => { if (s.readyState === 1) s.send(str); });
}

// On disconnect — clean up spectator:
ws.on('close', () => {
  if (ws.isSpectator && ws.roomId) {
    const room = rooms.get(ws.roomId);
    if (room) {
      room.spectators.delete(ws);
      broadcastToRoom(room, { type: 'spectator-count', count: room.spectators.size });
    }
  }
  // ... existing player cleanup
});

   ═══════════════════════════════════════════════════════════════════════════ */
