/**
 * dice-heatmap.js — Chaturanga v1.0.5.2
 * Adds "Pāśaka Chronicle" dice distribution section to seer.html post-game.
 * Drop-in: <script src="js/dice-heatmap.js"></script> in seer.html.
 * Call DiceHeatmap.render(containerEl, moveHistory) after game loads.
 */

const DiceHeatmap = (() => {

  const FACE_LABELS = { 1:'Ratha', 2:'Sarvam', 3:'Ashwa', 4:'Danti', 5:'Sarvam', 6:'Nara/Raja' };
  const FACE_COLORS = ['#e84040','#4da6ff','#ffd700','#7be07b','#ff9f43','#d475f5'];
  const PLAYER_COLORS = ['#e84040','#4da6ff','#ffd700','#7be07b'];
  const PLAYER_NAMES  = ['Rakta (Red)','Nila (Blue)','Pita (Yellow)','Harita (Green)'];
  const EXPECTED_PCT  = 100 / 6; // 16.67%

  // ── count dice rolls per player from moveHistory ───────────────────────────
  function tally(moveHistory) {
    // moveHistory entries expected to have: { playerIndex, diceRoll } at minimum
    const counts = [0,1,2,3].map(() => ({ 1:0,2:0,3:0,4:0,5:0,6:0, total:0 }));
    (moveHistory || []).forEach(m => {
      const p = m.playerIndex ?? m.player ?? 0;
      const d = m.diceRoll ?? m.dice ?? m.roll;
      if (d >= 1 && d <= 6 && counts[p]) {
        counts[p][d]++;
        counts[p].total++;
      }
    });
    return counts;
  }

  // ── total across all players ───────────────────────────────────────────────
  function totalTally(counts) {
    const tot = { 1:0,2:0,3:0,4:0,5:0,6:0, total:0 };
    counts.forEach(c => {
      for (let f = 1; f <= 6; f++) { tot[f] += c[f]; tot.total += c[f]; }
    });
    // fix double-counting total
    tot.total = tot[1]+tot[2]+tot[3]+tot[4]+tot[5]+tot[6];
    return tot;
  }

  // ── luck annotation ────────────────────────────────────────────────────────
  function annotate(counts) {
    // Find player most starved of high-value dice (3=Ashwa, 1=Ratha)
    let worstPlayer = -1, worstScore = Infinity;
    counts.forEach((c, i) => {
      if (!c.total) return;
      const highRolls = ((c[1] + c[3]) / c.total) * 100;
      if (highRolls < worstScore) { worstScore = highRolls; worstPlayer = i; }
    });
    if (worstPlayer === -1) return null;
    if (worstScore < 10) return `${PLAYER_NAMES[worstPlayer]} received the "Auspicious Misfortune" — cavalry dice appeared less than 10% of turns.`;
    if (worstScore < 20) return `${PLAYER_NAMES[worstPlayer]}'s dice ran cold on powerful pieces this battle.`;
    return 'Dice distribution was roughly balanced across all players.';
  }

  // ── SVG bar chart ──────────────────────────────────────────────────────────
  function buildSVG(counts, activePlayerCount) {
    const tot = totalTally(counts);
    if (!tot.total) return '<p style="color:#888;font-size:13px">No dice data recorded for this game.</p>';

    const W = 560, H = 240, PAD_L = 50, PAD_B = 50, PAD_T = 16, PAD_R = 20;
    const chartW = W - PAD_L - PAD_R;
    const chartH = H - PAD_B - PAD_T;
    const faces = [1,2,3,4,5,6];
    const groupW = chartW / 6;
    const maxPct = 40; // y axis max %

    let bars = '';
    faces.forEach((f, fi) => {
      // Expected line tick (shared)
      const expY = chartH - (EXPECTED_PCT / maxPct * chartH);

      // Per-player stacked or side-by-side bars
      const activePlayers = counts.filter((c,i) => i < activePlayerCount && c.total > 0);
      const barW = Math.min(18, (groupW - 8) / Math.max(activePlayers.length, 1));
      const groupX = PAD_L + fi * groupW + groupW / 2;

      activePlayers.forEach((c, pi) => {
        const pct = c.total ? (c[f] / c.total * 100) : 0;
        const barH = Math.max(2, pct / maxPct * chartH);
        const x = groupX - (activePlayers.length * (barW + 2)) / 2 + pi * (barW + 2);
        const y = PAD_T + chartH - barH;
        bars += `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="${barW}" height="${barH.toFixed(1)}"
          fill="${PLAYER_COLORS[pi]}" opacity="0.82" rx="2">
          <title>${PLAYER_NAMES[pi]}: ${pct.toFixed(1)}% (${c[f]} rolls)</title></rect>`;
      });

      // Expected dotted line segment
      const lineY = PAD_T + expY;
      bars += `<line x1="${(groupX - groupW/2 + 4).toFixed(1)}" y1="${lineY.toFixed(1)}"
        x2="${(groupX + groupW/2 - 4).toFixed(1)}" y2="${lineY.toFixed(1)}"
        stroke="#c9a84c" stroke-width="1.5" stroke-dasharray="4,3" opacity="0.7"/>`;

      // X label
      const labelY = PAD_T + chartH + 14;
      bars += `<text x="${groupX.toFixed(1)}" y="${labelY}" text-anchor="middle"
        font-size="11" fill="#c9a84c" font-family="Outfit,sans-serif">${f}</text>
        <text x="${groupX.toFixed(1)}" y="${(labelY+12).toFixed(1)}" text-anchor="middle"
        font-size="9" fill="#888" font-family="Outfit,sans-serif">${FACE_LABELS[f]}</text>`;
    });

    // Y axis ticks
    let yTicks = '';
    [0,10,20,30,40].forEach(pct => {
      const y = PAD_T + chartH - (pct / maxPct * chartH);
      yTicks += `<line x1="${PAD_L-4}" y1="${y.toFixed(1)}" x2="${PAD_L + chartW}" y2="${y.toFixed(1)}"
        stroke="#333" stroke-width="0.5"/>
        <text x="${(PAD_L-7).toFixed(1)}" y="${(y+4).toFixed(1)}" text-anchor="end"
        font-size="10" fill="#888" font-family="Outfit,sans-serif">${pct}%</text>`;
    });

    return `<svg width="100%" viewBox="0 0 ${W} ${H}" xmlns="http://www.w3.org/2000/svg">
      ${yTicks}
      ${bars}
      <line x1="${PAD_L}" y1="${PAD_T}" x2="${PAD_L}" y2="${PAD_T+chartH}" stroke="#555" stroke-width="1"/>
      <line x1="${PAD_L}" y1="${PAD_T+chartH}" x2="${PAD_L+chartW}" y2="${PAD_T+chartH}" stroke="#555" stroke-width="1"/>
    </svg>`;
  }

  // ── player legend ──────────────────────────────────────────────────────────
  function buildLegend(counts, activePlayerCount) {
    let html = '<div style="display:flex;flex-wrap:wrap;gap:10px 20px;margin:8px 0 12px">';
    counts.slice(0, activePlayerCount).forEach((c, i) => {
      if (!c.total) return;
      const wr = c.total ? (c[1]+c[3])/c.total*100 : 0;
      html += `<span style="font-size:12px;color:#ccc;font-family:Outfit,sans-serif">
        <span style="display:inline-block;width:10px;height:10px;border-radius:2px;
          background:${PLAYER_COLORS[i]};margin-right:5px;vertical-align:middle"></span>
        ${PLAYER_NAMES[i]} · ${c.total} rolls · ${wr.toFixed(0)}% power dice
      </span>`;
    });
    html += `<span style="font-size:12px;color:#c9a84c;font-family:Outfit,sans-serif">
      <span style="display:inline-block;width:16px;height:2px;background:#c9a84c;
        border-top:1px dashed #c9a84c;margin-right:5px;vertical-align:middle"></span>
      Expected (16.7%)
    </span></div>`;
    return html;
  }

  // ── main render ────────────────────────────────────────────────────────────
  function render(container, moveHistory, activePlayerCount = 4) {
    if (!container) return;
    const counts = tally(moveHistory);
    const annotation = annotate(counts);

    container.innerHTML = `
      <div style="border-top:1px solid #2a2200;margin-top:28px;padding-top:20px">
        <h3 style="font-family:Cinzel,serif;color:#c9a84c;font-size:15px;margin:0 0 4px;letter-spacing:.05em">
          🎲 Pāśaka Chronicle
        </h3>
        <p style="font-size:12px;color:#888;margin:0 0 12px;font-family:Outfit,sans-serif">
          Actual dice distribution vs expected (16.7% per face)
        </p>
        ${buildLegend(counts, activePlayerCount)}
        <div style="background:#0d0a00;border:1px solid #2a2200;border-radius:8px;padding:12px">
          ${buildSVG(counts, activePlayerCount)}
        </div>
        ${annotation ? `<p style="margin:10px 0 0;font-size:12px;font-style:italic;
          color:#b8860b;font-family:Outfit,sans-serif;padding:8px 12px;
          background:#1a1200;border-left:3px solid #c9a84c;border-radius:0 4px 4px 0">
          ${annotation}</p>` : ''}
      </div>`;
  }

  // ── auto-init when seer.html loads a game ─────────────────────────────────
  // Looks for #seerDiceSection injected into seer.html, or appends to #seerBody
  function autoInit() {
    document.addEventListener('DOMContentLoaded', () => {
      const target = document.getElementById('seerDiceSection') ||
                     document.getElementById('seerBody') ||
                     document.querySelector('.seer-content');
      if (!target) return;

      // Try to read from seer vault / granth vault
      function tryRender(gameData) {
        if (!gameData) return;
        const moves = gameData.moveHistory || gameData.moves || [];
        const players = gameData.playerCount || gameData.activePlayers || 4;
        const section = document.getElementById('seerDiceSection') || (() => {
          const d = document.createElement('div');
          d.id = 'seerDiceSection';
          target.appendChild(d);
          return d;
        })();
        render(section, moves, players);
      }

      // Expose for manual call
      window.DiceHeatmap = { render, tryRender };

      // Attempt auto-load from seer vault
      try {
        const vault = JSON.parse(localStorage.getItem('chaturanga_seer_vault') || '[]');
        if (vault.length) tryRender(vault[vault.length - 1]);
      } catch {}
    });
  }

  autoInit();
  window.DiceHeatmap = { render, tally };
  return { render, tally };
})();
