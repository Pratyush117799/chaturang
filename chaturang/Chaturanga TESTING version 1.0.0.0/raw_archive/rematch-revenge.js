/**
 * rematch-revenge.js — Chaturanga v1.0.5.2
 * Adds Rematch + Revenge buttons to game-over overlay.
 * Tracks per-opponent head-to-head record in localStorage.
 * Drop-in: <script src="js/rematch-revenge.js"></script> after ws-client.js in game.html
 *
 * Integration:
 *   Call RematchRevenge.onGameOver({ winnerId, playerNames, playerIds, sides, isOnline })
 *   from your existing game-over handler.
 *   For online: it sends 'rematch-vote' via WS and listens for 'rematch-accept'.
 */

const RematchRevenge = (() => {

  const H2H_KEY = 'chaturanga_h2h';
  const PLAYER_COLORS = ['#e84040','#4da6ff','#ffd700','#7be07b'];

  // ── head-to-head storage ──────────────────────────────────────────────────
  function loadH2H() {
    try { return JSON.parse(localStorage.getItem(H2H_KEY)) || {}; }
    catch { return {}; }
  }
  function saveH2H(data) { localStorage.setItem(H2H_KEY, JSON.stringify(data)); }

  function recordResult(opponentId, playerWon) {
    if (!opponentId) return;
    const h2h = loadH2H();
    if (!h2h[opponentId]) h2h[opponentId] = { wins: 0, losses: 0, name: '' };
    if (playerWon) h2h[opponentId].wins++;
    else h2h[opponentId].losses++;
    saveH2H(h2h);
  }

  function getRecord(opponentId) {
    if (!opponentId) return null;
    return loadH2H()[opponentId] || null;
  }

  // ── inject CSS once ───────────────────────────────────────────────────────
  function injectStyles() {
    if (document.getElementById('rr-styles')) return;
    const s = document.createElement('style');
    s.id = 'rr-styles';
    s.textContent = `
      #rrPanel { position:fixed;inset:0;background:rgba(0,0,0,.82);display:flex;
        align-items:center;justify-content:center;z-index:10000;animation:rrFadeIn .3s ease; }
      @keyframes rrFadeIn { from{opacity:0;transform:scale(.96)} to{opacity:1;transform:scale(1)} }
      .rr-card { background:linear-gradient(160deg,#1a1200,#0a0800);
        border:1px solid #c9a84c;border-radius:14px;padding:32px 36px;
        max-width:420px;width:90%;text-align:center;font-family:Outfit,sans-serif; }
      .rr-title { font-family:Cinzel,serif;color:#c9a84c;font-size:22px;margin:0 0 6px; }
      .rr-sub   { color:#888;font-size:13px;margin:0 0 20px; }
      .rr-h2h   { background:#111;border-radius:8px;padding:12px;margin:0 0 22px;
        font-size:13px;color:#ccc; }
      .rr-h2h strong { color:#c9a84c; }
      .rr-btns  { display:flex;flex-direction:column;gap:10px; }
      .rr-btn   { padding:13px;border-radius:8px;font-size:14px;font-weight:600;
        cursor:pointer;border:none;font-family:Outfit,sans-serif;transition:all .2s;letter-spacing:.03em; }
      .rr-btn-rematch { background:linear-gradient(135deg,#c9a84c,#a07830);color:#0a0800; }
      .rr-btn-revenge { background:transparent;border:1px solid #c9a84c;color:#c9a84c; }
      .rr-btn-skip    { background:transparent;border:1px solid #333;color:#555; }
      .rr-btn:hover { filter:brightness(1.15);transform:translateY(-1px); }
      .rr-vote-wait { color:#c9a84c;font-size:13px;margin-top:12px;animation:rrPulse 1.4s infinite; }
      @keyframes rrPulse { 0%,100%{opacity:.4} 50%{opacity:1} }
      .rr-player-dot { display:inline-block;width:9px;height:9px;border-radius:50%;margin-right:5px;vertical-align:middle; }
    `;
    document.head.appendChild(s);
  }

  // ── build and show panel ──────────────────────────────────────────────────
  let _ctx = null;

  function onGameOver(ctx) {
    /*
     * ctx = {
     *   winnerId        : 0..3 (local index)
     *   playerNames     : ['Red','Blue','Yellow','Green']
     *   playerIds       : ['id0','id1','id2','id3']   (for online h2h key)
     *   localPlayerIdx  : 0..3                         (who is "me")
     *   sides           : [0,1,2,3]                    (current side assignments)
     *   isOnline        : bool
     *   onRematch       : function(swapSides)           (called when rematch agreed)
     *   onRevenge       : function(pickedSide)          (called when revenge agreed)
     * }
     */
    _ctx = ctx;
    injectStyles();

    const myIdx   = ctx.localPlayerIdx ?? 0;
    const won     = ctx.winnerId === myIdx;
    const oppIdx  = ctx.winnerId === myIdx
      ? (myIdx + 1) % 4   // if I won, show closest opponent
      : ctx.winnerId;
    const oppId   = (ctx.playerIds || [])[oppIdx] || `player_${oppIdx}`;
    const oppName = (ctx.playerNames || ['Red','Blue','Yellow','Green'])[oppIdx];

    // Record result
    recordResult(oppId, won);
    const rec = getRecord(oppId);

    // Build h2h string
    let h2hHtml = '';
    if (rec) {
      h2hHtml = `<div class="rr-h2h">
        Head-to-head vs <strong>${oppName}</strong><br>
        <span style="color:#4da6ff">You: ${rec.wins} wins</span> &nbsp;·&nbsp;
        <span style="color:#e84040">Opponent: ${rec.losses} wins</span>
      </div>`;
    }

    // Online: show vote waiting state after click
    const panel = document.createElement('div');
    panel.id = 'rrPanel';
    panel.innerHTML = `
      <div class="rr-card">
        <div class="rr-title">${won ? '⚔️ Victory' : '🏳 Defeated'}</div>
        <div class="rr-sub">${won ? 'Another battle awaits.' : 'The score remains unsettled.'}</div>
        ${h2hHtml}
        <div class="rr-btns">
          <button class="rr-btn rr-btn-rematch" id="rrRematch">
            ⚔️ Rematch — Same players, sides swap
          </button>
          <button class="rr-btn rr-btn-revenge" id="rrRevenge">
            🗡️ Revenge — I choose my colour
          </button>
          <button class="rr-btn rr-btn-skip" id="rrSkip">
            Return to lobby
          </button>
        </div>
        <div id="rrWaitMsg" style="display:none" class="rr-vote-wait">
          Waiting for all players to accept…
        </div>
      </div>`;

    document.body.appendChild(panel);

    document.getElementById('rrRematch').onclick = () => doRematch(false, panel);
    document.getElementById('rrRevenge').onclick = () => doRevenge(panel);
    document.getElementById('rrSkip').onclick    = () => panel.remove();
  }

  function doRematch(revenge, panel) {
    const ctx = _ctx;
    if (ctx.isOnline && window.ws && ws.readyState === 1) {
      ws.send(JSON.stringify({ type: 'rematch-vote', revenge }));
      document.getElementById('rrWaitMsg').style.display = 'block';
      document.getElementById('rrRematch').disabled = true;
      document.getElementById('rrRevenge').disabled = true;
    } else {
      // Local game — swap sides immediately
      panel.remove();
      if (typeof ctx.onRematch === 'function') ctx.onRematch(!revenge);
    }
  }

  function doRevenge(panel) {
    // Show side picker
    const card = panel.querySelector('.rr-card');
    card.innerHTML = `
      <div class="rr-title">Choose Your Colour</div>
      <div class="rr-sub" style="margin-bottom:20px">Pick the side you'll play next battle</div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px">
        ${['Rakta','Nila','Pita','Harita'].map((name,i) =>
          `<button class="rr-btn" onclick="RematchRevenge._pickSide(${i})"
            style="background:${PLAYER_COLORS[i]}22;border:1px solid ${PLAYER_COLORS[i]};color:${PLAYER_COLORS[i]}">
            <span class="rr-player-dot" style="background:${PLAYER_COLORS[i]}"></span>${name}
          </button>`
        ).join('')}
      </div>
      <button class="rr-btn rr-btn-skip" style="margin-top:14px" onclick="document.getElementById('rrPanel').remove()">
        Cancel
      </button>`;
  }

  function _pickSide(sideIdx) {
    const panel = document.getElementById('rrPanel');
    if (panel) panel.remove();
    const ctx = _ctx;
    if (ctx.isOnline && window.ws && ws.readyState === 1) {
      ws.send(JSON.stringify({ type: 'rematch-vote', revenge: true, pickedSide: sideIdx }));
    } else {
      if (typeof ctx.onRevenge === 'function') ctx.onRevenge(sideIdx);
    }
  }

  // ── WS message listener — accept rematch from server ─────────────────────
  // Listens for { type:'rematch-accept', newSides:[] } broadcast from server
  function wireWS() {
    document.addEventListener('DOMContentLoaded', () => {
      // Monkey-patch existing ws message handler
      const _prevHandler = window.onWsMessage;
      window.onWsMessage = function(msg) {
        if (msg.type === 'rematch-accept') {
          const panel = document.getElementById('rrPanel');
          if (panel) panel.remove();
          // Let main app handle new game start with msg.newSides
          if (typeof _ctx?.onRematch === 'function') _ctx.onRematch(msg.newSides);
        }
        if (typeof _prevHandler === 'function') _prevHandler(msg);
      };
    });
  }

  wireWS();
  window.RematchRevenge = { onGameOver, _pickSide, recordResult, getRecord };
  return { onGameOver, recordResult, getRecord };
})();


/* ── SERVER-SIDE PATCH (add to server-ws.js) ──────────────────────────────────
   Paste inside your existing message handler where type === 'rematch-vote':

   case 'rematch-vote': {
     const room = rooms.get(player.roomId);
     if (!room) break;
     if (!room.rematchVotes) room.rematchVotes = new Map();
     room.rematchVotes.set(player.id, data);
     if (room.rematchVotes.size >= room.players.length) {
       // All voted — calculate new sides (swap R↔B and Y↔G for team mode)
       const newSides = [1, 0, 3, 2]; // simple swap
       broadcast(room, { type: 'rematch-accept', newSides });
       room.rematchVotes = new Map();
       room.gameState = null; // reset for new game
     }
     break;
   }
──────────────────────────────────────────────────────────────────────────── */
