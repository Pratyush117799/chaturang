/**
 * weekly-yuddha.js — Chaturanga v1.0.5.2
 * Weekly ELO delta leaderboard resetting every Sunday 00:00 IST.
 * Drop-in: <script src="js/weekly-yuddha.js"></script>
 *
 * Integration:
 *   WeeklyYuddha.recordWin(playerName, eloDelta)
 *   WeeklyYuddha.recordLoss(playerName, eloDelta)
 *   WeeklyYuddha.buildPanel(containerEl)
 *   WeeklyYuddha.getLeaderboard()
 */

const WeeklyYuddha = (() => {

  const KEY_DATA   = 'chaturanga_weekly_yuddha';
  const KEY_GRANTH = 'chaturanga_granth_unlocked';

  // ── week key (IST Sunday-aligned) ────────────────────────────────────────
  function currentWeekKey() {
    const ist = new Date(Date.now() + 5.5 * 3600000);
    const day = ist.getUTCDay();
    const sun = new Date(ist);
    sun.setUTCDate(ist.getUTCDate() - day);
    return `${sun.getUTCFullYear()}-${sun.getUTCMonth()+1}-${sun.getUTCDate()}`;
  }

  function nextResetMs() {
    const ist = new Date(Date.now() + 5.5 * 3600000);
    const daysLeft = (7 - ist.getUTCDay()) % 7 || 7;
    const sun = new Date(ist);
    sun.setUTCDate(ist.getUTCDate() + daysLeft);
    sun.setUTCHours(0, 0, 0, 0);
    return new Date(sun.getTime() - 5.5 * 3600000).getTime() - Date.now();
  }

  function resetCountdown() {
    const ms = nextResetMs();
    const d = Math.floor(ms / 86400000);
    const h = Math.floor((ms % 86400000) / 3600000);
    const m = Math.floor((ms % 3600000) / 60000);
    if (d > 0) return `${d}d ${h}h remaining`;
    return `${h}h ${m}m remaining`;
  }

  // ── storage ───────────────────────────────────────────────────────────────
  function load() {
    try {
      const raw = JSON.parse(localStorage.getItem(KEY_DATA) || '{}');
      const wk  = currentWeekKey();
      if (raw.weekKey !== wk) {
        const fresh = { weekKey: wk, players: {}, archivedWeeks: raw.archivedWeeks || [] };
        if (raw.weekKey && Object.keys(raw.players || {}).length) {
          fresh.archivedWeeks.push({ weekKey: raw.weekKey, players: raw.players });
          if (fresh.archivedWeeks.length > 6) fresh.archivedWeeks.shift();
          grantEndOfWeekAchievements(raw.players);
        }
        save(fresh);
        return fresh;
      }
      return raw;
    } catch {
      return { weekKey: currentWeekKey(), players: {}, archivedWeeks: [] };
    }
  }

  function save(data) {
    try { localStorage.setItem(KEY_DATA, JSON.stringify(data)); } catch {}
  }

  // ── end-of-week Granth grants ─────────────────────────────────────────────
  function grantEndOfWeekAchievements(players) {
    if (!players) return;
    const sorted = Object.entries(players).sort(([,a],[,b]) => b.delta - a.delta);
    const grants = [
      { rank:0, id:'saptaha_vijeta',  name:'Saptaha Vijeta',  title:'Weekly Champion' },
      { rank:1, id:'agrani',          name:'Agrani',          title:'Runner-up'       },
      { rank:2, id:'yoddha_shrestha', name:'Yoddha Shrestha', title:'3rd Place'       }
    ];
    const myName  = localStorage.getItem('chaturanga_player_name') || '';
    const stored  = JSON.parse(localStorage.getItem(KEY_GRANTH) || '{}');
    let changed   = false;
    grants.forEach(g => {
      if (!sorted[g.rank]) return;
      const [pName] = sorted[g.rank];
      if (pName === myName && !stored[g.id]) {
        stored[g.id] = Date.now();
        changed = true;
        if (typeof window.onGranthUnlock === 'function') {
          window.onGranthUnlock({ id:g.id, name:g.name, title:g.title, category:'weekly' });
        }
      }
    });
    if (changed) localStorage.setItem(KEY_GRANTH, JSON.stringify(stored));
  }

  // ── record results ────────────────────────────────────────────────────────
  function recordWin(playerName, eloDelta = 25) {
    if (!playerName) return;
    const state = load();
    if (!state.players[playerName]) state.players[playerName] = { delta:0, wins:0, losses:0, games:0 };
    state.players[playerName].delta  += Math.abs(eloDelta);
    state.players[playerName].wins++;
    state.players[playerName].games++;
    save(state);
    updateLivePanel();
  }

  function recordLoss(playerName, eloDelta = 25) {
    if (!playerName) return;
    const state = load();
    if (!state.players[playerName]) state.players[playerName] = { delta:0, wins:0, losses:0, games:0 };
    state.players[playerName].delta  -= Math.abs(eloDelta);
    state.players[playerName].losses++;
    state.players[playerName].games++;
    save(state);
    updateLivePanel();
  }

  function getLeaderboard() {
    const state = load();
    return Object.entries(state.players)
      .map(([name, d]) => ({ name, ...d }))
      .sort((a, b) => b.delta - a.delta);
  }

  // ── CSS ───────────────────────────────────────────────────────────────────
  function injectCSS() {
    if (document.getElementById('wy-css')) return;
    const s = document.createElement('style');
    s.id = 'wy-css';
    s.textContent = `
      .wy-panel { background:#0d0a00;border:1px solid #2a2200;border-radius:12px;overflow:hidden;font-family:Outfit,sans-serif; }
      .wy-header { background:linear-gradient(135deg,#1a1200,#0d0a00);padding:14px 18px;
        border-bottom:1px solid #2a2200;display:flex;align-items:center;justify-content:space-between; }
      .wy-title { font-family:Cinzel,serif;color:#c9a84c;font-size:15px;font-weight:700; }
      .wy-countdown { font-size:11px;color:#666;padding:3px 8px;background:#1a1200;
        border:1px solid #2a2200;border-radius:20px; }
      .wy-table { width:100%;border-collapse:collapse; }
      .wy-table td { padding:9px 14px;border-bottom:1px solid #111;font-size:13px;color:#ccc; }
      .wy-table tr:last-child td { border-bottom:none; }
      .wy-table tr.wy-me td { background:#1a1200; }
      .wy-table tr:hover td { background:#111; }
      .wy-rank { width:36px;text-align:center;font-size:15px; }
      .wy-name { font-weight:500; }
      .wy-badge { font-size:10px;padding:2px 6px;border-radius:10px;margin-left:6px;vertical-align:middle; }
      .wy-badge-gold   { background:#c9a84c22;color:#c9a84c;border:1px solid #c9a84c55; }
      .wy-badge-silver { background:#aaa2;color:#aaa;border:1px solid #aaa5; }
      .wy-badge-bronze { background:#cd7f3222;color:#cd7f32;border:1px solid #cd7f3255; }
      .wy-delta-pos { color:#4da6ff;font-weight:600; }
      .wy-delta-neg { color:#e84040;font-weight:600; }
      .wy-wl { color:#666;font-size:11px; }
      .wy-empty { padding:24px;text-align:center;color:#555;font-size:13px; }
      .wy-archive-btn { display:block;width:100%;padding:10px;background:none;
        border:none;border-top:1px solid #2a2200;color:#555;font-size:12px;
        cursor:pointer;font-family:Outfit,sans-serif;transition:color .2s; }
      .wy-archive-btn:hover { color:#c9a84c; }
      .wy-archive { padding:14px;border-top:1px solid #2a2200;display:none; }
      .wy-archive h4 { font-family:Cinzel,serif;color:#888;font-size:12px;margin:0 0 10px; }
      .wy-archive-row { font-size:12px;color:#666;display:flex;justify-content:space-between;
        padding:4px 0;border-bottom:1px solid #111; }
    `;
    document.head.appendChild(s);
  }

  // ── build panel HTML ──────────────────────────────────────────────────────
  let _panelEl = null;

  function buildPanel(container) {
    if (!container) return;
    injectCSS();
    _panelEl = container;
    renderPanel(container);
  }

  function renderPanel(container) {
    const board   = getLeaderboard();
    const myName  = localStorage.getItem('chaturanga_player_name') || '';
    const medals  = ['🥇','🥈','🥉'];
    const badges  = ['wy-badge-gold','wy-badge-silver','wy-badge-bronze'];
    const titles  = ['Saptaha Vijeta','Agrani','Yoddha Shrestha'];
    const state   = load();

    let rows = '';
    if (!board.length) {
      rows = `<tr><td colspan="4" class="wy-empty">No battles recorded this week.<br>
        <span style="font-size:11px">Win ranked games to appear here.</span></td></tr>`;
    } else {
      board.slice(0, 10).forEach((p, i) => {
        const isMe    = p.name === myName;
        const rankEl  = i < 3 ? medals[i] : `<span style="color:#555">${i+1}</span>`;
        const badgeEl = i < 3 ? `<span class="wy-badge ${badges[i]}">${titles[i]}</span>` : '';
        const deltaEl = p.delta >= 0
          ? `<span class="wy-delta-pos">+${p.delta}</span>`
          : `<span class="wy-delta-neg">${p.delta}</span>`;
        rows += `<tr class="${isMe ? 'wy-me' : ''}">
          <td class="wy-rank">${rankEl}</td>
          <td class="wy-name">${escHtml(p.name)}${badgeEl}${isMe ? ' <span style="color:#c9a84c;font-size:10px">(you)</span>':''}</td>
          <td>${deltaEl} <span class="wy-wl">ELO</span></td>
          <td class="wy-wl">${p.wins}W / ${p.losses}L</td>
        </tr>`;
      });
    }

    // Archive rows
    let archiveHtml = '';
    if (state.archivedWeeks?.length) {
      state.archivedWeeks.slice().reverse().forEach(week => {
        const top = Object.entries(week.players).sort(([,a],[,b]) => b.delta - a.delta)[0];
        if (top) {
          archiveHtml += `<div class="wy-archive-row">
            <span>${week.weekKey}</span>
            <span>${escHtml(top[0])} <span style="color:#c9a84c">+${top[1].delta}</span></span>
          </div>`;
        }
      });
    }

    container.innerHTML = `
      <div class="wy-panel">
        <div class="wy-header">
          <span class="wy-title">⚔️ Saptaha Yuddha</span>
          <span class="wy-countdown" id="wyCountdown">${resetCountdown()}</span>
        </div>
        <table class="wy-table"><tbody>${rows}</tbody></table>
        ${archiveHtml ? `
          <button class="wy-archive-btn" onclick="
            const a=this.nextElementSibling;
            a.style.display=a.style.display==='block'?'none':'block';
            this.textContent=a.style.display==='block'?'▲ Hide history':'▼ Previous weeks';
          ">▼ Previous weeks</button>
          <div class="wy-archive"><h4>Past Champions</h4>${archiveHtml}</div>
        ` : ''}
      </div>`;

    // Live countdown ticker
    const cdEl = container.querySelector('#wyCountdown');
    if (cdEl) {
      setInterval(() => { if (cdEl.isConnected) cdEl.textContent = resetCountdown(); }, 60000);
    }
  }

  function updateLivePanel() {
    if (_panelEl) renderPanel(_panelEl);
  }

  function escHtml(s) {
    return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  }

  // ── auto-hook into ELO engine if present ──────────────────────────────────
  document.addEventListener('DOMContentLoaded', () => {
    const prev = window.onEloUpdate;
    window.onEloUpdate = function(playerName, delta) {
      if (delta > 0) recordWin(playerName, delta);
      else recordLoss(playerName, Math.abs(delta));
      if (typeof prev === 'function') prev(playerName, delta);
    };
  });

  window.WeeklyYuddha = { recordWin, recordLoss, getLeaderboard, buildPanel, resetCountdown };
  return window.WeeklyYuddha;
})();
