/**
 * Chaturanga v1.0.4 — WebSocket Client
 * window.ChaturangaWS
 */
(function() {
  'use strict';

  let ws       = null;
  let roomCode = null;
  let myColour = null;
  let handlers = {};

  function connect(serverUrl) {
    if (ws && ws.readyState < 2) return; // already open/connecting
    try {
      ws = new WebSocket(serverUrl);
      ws.onopen    = () => { console.log('[WS] Connected to', serverUrl); updateMpStatus('Connected!', 'green'); };
      ws.onmessage = (e) => { try { onMessage(JSON.parse(e.data)); } catch(err) { console.warn('[WS] parse error', err); } };
      ws.onerror   = () => { updateMpStatus('Connection error.', 'red'); };
      ws.onclose   = () => { updateMpStatus('Disconnected.', 'red'); onDisconnect(); };
    } catch(e) {
      updateMpStatus('WebSocket not available: ' + e.message, 'red');
    }
  }

  function send(obj) {
    if (!ws || ws.readyState !== 1) { console.warn('[WS] Not connected'); return; }
    ws.send(JSON.stringify(obj));
  }

  function createRoom(name, settings) {
    send({ type: 'create_room', name, settings });
  }

  function joinRoom(code, name) {
    send({ type: 'join_room', code, name });
  }

  function sendMove(from, to) {
    if (myColour === null) return;
    send({ type: 'move', from, to });
  }

  function sendRollDice() {
    if (!roomCode) return;
    send({ type: 'roll_dice', roomCode });
  }

  function sendChat(message) {
    if (message.length > 200) message = message.slice(0, 200);
    send({ type: 'chat', message });
  }

  function sendForfeit() {
    send({ type: 'forfeit_turn' });
  }

  function onMessage(data) {
    switch (data.type) {
      case 'room_created':
        roomCode = data.code; myColour = data.colour;
        updateMpStatus('Room created! Code: <strong>' + data.code + '</strong> — Share it!', 'gold');
        break;
      case 'room_joined':
        roomCode = data.code; myColour = data.colour;
        updateMpStatus('Joined room ' + data.code + ' as ' + ['Red','Blue','Green','Yellow'][data.colour] + '.', 'gold');
        break;
      case 'player_joined':
        updateMpStatus(data.name + ' joined the room.', 'green');
        break;
      case 'game_started':
        updateMpStatus('Game started!', 'gold');
        hideMultiplayerModal();
        break;
      case 'dice_rolled':
        if (globalThis._chaturangaGame) {
          globalThis._chaturangaGame.lastDice    = data.face;
          globalThis._chaturangaGame.forcedPiece = globalThis._chaturangaGame.diceToPiece(data.face);
        }
        if (globalThis._chaturangaRender) globalThis._chaturangaRender();
        break;
      case 'move_applied':
        if (globalThis._chaturangaGame && data.from && data.to) {
          globalThis._chaturangaGame.board.set(data.to, globalThis._chaturangaGame.board.get(data.from));
          globalThis._chaturangaGame.board.set(data.from, null);
          if (globalThis._chaturangaRender) globalThis._chaturangaRender();
        }
        break;
      case 'move_rejected':
        updateMpStatus('Move rejected: ' + (data.reason || 'illegal'), 'red');
        if (globalThis._chaturangaRender) globalThis._chaturangaRender();
        break;
      case 'chat_message':
        console.log('[Chat] ' + data.name + ': ' + data.message);
        break;
      case 'player_disconnected':
        updateMpStatus((['Red','Blue','Green','Yellow'][data.colour]||'?') + ' disconnected. Grace: ' + data.gracePeriodSeconds + 's', 'red');
        break;
      case 'player_reconnected':
        updateMpStatus((['Red','Blue','Green','Yellow'][data.colour]||'?') + ' reconnected!', 'green');
        break;
      case 'game_over':
        updateMpStatus('Game over! Winner: ' + (data.winner || '?'), 'gold');
        break;
      default:
        console.log('[WS] unhandled message type:', data.type);
    }
  }

  function onDisconnect() {
    // Attempt reconnect every 3s for 60s
    let attempts = 0;
    const iv = setInterval(() => {
      attempts++;
      if (ws && ws.readyState === 1) { clearInterval(iv); return; }
      if (attempts >= 20) { clearInterval(iv); updateMpStatus('Reconnection failed.', 'red'); return; }
      updateMpStatus('Reconnecting… (attempt ' + attempts + '/20)', 'orange');
      if (ws) { try { ws.close(); } catch(e) {} }
      if (roomCode && myColour !== null) {
        connect('ws://localhost:8766');
      }
    }, 3000);
  }

  function updateMpStatus(msg, color) {
    const el = document.getElementById('mpStatus');
    if (el) {
      el.innerHTML = msg;
      el.style.color = color === 'gold' ? 'var(--gold)' : color === 'green' ? '#4ade80' : color === 'red' ? '#f87171' : color;
    }
  }

  function hideMultiplayerModal() {
    const m = document.getElementById('multiplayerModal');
    if (m) m.style.display = 'none';
  }

  globalThis.ChaturangaWS = {
    connect,
    createRoom,
    joinRoom,
    sendMove,
    sendRollDice,
    sendChat,
    sendForfeit,
    get roomCode() { return roomCode; },
    get myColour()  { return myColour; },
    get isConnected() { return ws && ws.readyState === 1; }
  };
})();
