/**
 * Chaturanga v1.0.5 — WebSocket Client
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
    const elo = parseInt(localStorage.getItem('chaturanga_online_elo') || '1200');
    const mode = (settings && settings.mode === '4p') ? '4p' : '2p';
    send({ type: 'create-room', name, elo, mode });
  }

  function joinRoom(code, name) {
    const elo = parseInt(localStorage.getItem('chaturanga_online_elo') || '1200');
    send({ type: 'join-room', code, name, elo });
  }

  function sendMove(from, to) {
    if (myColour === null) return;
    send({ type: 'move', from, to });
  }

  function sendRollDice() {
    send({ type: 'roll-dice' });
  }

  function sendChat(message) {
    if (message.length > 200) message = message.slice(0, 200);
    send({ type: 'chat', message });
  }

  function sendForfeit() {
    send({ type: 'forfeit-turn' });
  }

  function onMessage(data) {
    switch (data.type) {
      case 'room-created':
        roomCode = data.code; myColour = data.seat;
        localStorage.setItem('chaturanga_reconnect_token', data.token);
        updateMpStatus('Room created! Code: <strong>' + data.code + '</strong> — Share it!', 'gold');
        break;
      case 'room-joined':
        roomCode = data.code; myColour = data.seat;
        localStorage.setItem('chaturanga_reconnect_token', data.token);
        updateMpStatus('Joined room ' + data.code + ' as ' + (['Red','Blue','Green','Yellow'][data.seat] || '?') + '.', 'gold');
        break;
      case 'player-joined':
        updateMpStatus((data.name || 'A player') + ' joined the room.', 'green');
        break;
      case 'game-start':
        updateMpStatus('Game started!', 'gold');
        hideMultiplayerModal();
        if (data.snapshot) applySnapshot(data.snapshot);
        break;
      case 'dice-rolled':
        if (globalThis._chaturangaGame) {
          globalThis._chaturangaGame.lastDice    = data.face;
          globalThis._chaturangaGame.forcedPiece = globalThis._chaturangaGame.diceToPiece(data.face);
        }
        if (globalThis._chaturangaRender) globalThis._chaturangaRender();
        break;
      case 'move-made':
        if (globalThis._chaturangaGame && data.from && data.to) {
          const piece = globalThis._chaturangaGame.board.get(data.from);
          globalThis._chaturangaGame.board.set(data.to, piece);
          globalThis._chaturangaGame.board.set(data.from, null);
          if (data.board) applyBoardState(data.board);
          if (globalThis._chaturangaRender) globalThis._chaturangaRender();
        }
        break;
      case 'turn-forfeited':
        if (globalThis._chaturangaRender) globalThis._chaturangaRender();
        break;
      case 'error':
        updateMpStatus('Error: ' + (data.message || data.code || 'unknown'), 'red');
        if (data.code === 'ILLEGAL_MOVE' && globalThis._chaturangaRender) globalThis._chaturangaRender();
        break;
      case 'chat-message':
        console.log('[Chat] ' + (data.name || '?') + ': ' + data.text);
        break;
      case 'player-disconnected':
        updateMpStatus(
          (data.name || 'A player') + ' disconnected. Reconnect window: ' + (data.reconnectWindowSecs || 120) + 's',
          'red'
        );
        break;
      case 'player-reconnected':
        updateMpStatus((data.name || 'A player') + ' reconnected!', 'green');
        break;
      case 'player-forfeited':
        updateMpStatus((data.name || 'A player') + ' forfeited (timeout).', 'red');
        break;
      case 'reconnected':
        updateMpStatus('Reconnected to room ' + roomCode + '.', 'green');
        if (data.snapshot) applySnapshot(data.snapshot);
        break;
      case 'rematch-vote':
        updateMpStatus('Rematch vote: ' + data.votes + '/' + data.needed + '.', 'gold');
        break;
      case 'game-over':
        const winner = data.winnerSeat !== undefined && data.winnerSeat !== null
          ? (['Red','Blue','Green','Yellow'][data.winnerSeat] || '?') + ' wins!'
          : (data.reason === 'forfeit' ? 'Game ended by forfeit.' : 'Game over!');
        updateMpStatus(winner, 'gold');
        break;
      case 'lobby-update':
        // Handled by lobby.html directly; no action needed in game.html context
        break;
      case 'pong':
        break;
      default:
        console.log('[WS] unhandled message type:', data.type);
    }
  }

  // Apply a full board state snapshot from the server
  function applyBoardState(boardObj) {
    if (!globalThis._chaturangaGame || !boardObj) return;
    const game = globalThis._chaturangaGame;
    game.board.squares = {};
    for (const [sq, val] of Object.entries(boardObj)) {
      const [ownerStr, type] = val.split(':');
      const owner = parseInt(ownerStr);
      const color = ['red','blue','green','yellow'][owner] || 'red';
      game.board.set(sq, { type, owner, color, hasMoved: true });
    }
  }

  function applySnapshot(snapshot) {
    if (!snapshot) return;
    if (snapshot.board) applyBoardState(snapshot.board);
    if (globalThis._chaturangaGame && snapshot.currentSeat !== undefined) {
      globalThis._chaturangaGame.turnIndex = snapshot.currentSeat;
    }
    if (globalThis._chaturangaRender) globalThis._chaturangaRender();
  }

  function onDisconnect() {
    let attempts = 0;
    const iv = setInterval(() => {
      attempts++;
      if (ws && ws.readyState === 1) { clearInterval(iv); return; }
      if (attempts >= 20) { clearInterval(iv); updateMpStatus('Reconnection failed.', 'red'); return; }
      updateMpStatus('Reconnecting… (attempt ' + attempts + '/20)', 'orange');
      if (ws) { try { ws.close(); } catch(e) {} }
      // Reconnect to the correct port (8765) and send token if we have one
      const serverUrl = 'ws://' + (location.hostname || 'localhost') + ':8765';
      ws = null;
      connect(serverUrl);
      const savedToken = localStorage.getItem('chaturanga_reconnect_token');
      if (savedToken) {
        // Wait for open then send reconnect
        const attemptReconnect = setInterval(() => {
          if (ws && ws.readyState === 1) {
            send({ type: 'reconnect', token: savedToken });
            clearInterval(attemptReconnect);
          }
        }, 200);
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
