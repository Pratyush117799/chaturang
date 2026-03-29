/**
 * dice-heatmap.js — Chaturanga v1.0.5.2
 * Post-game Dice Chronicle: SVG bar chart expected vs actual dice distribution.
 * Drop into seer.html. Call DiceHeatmap.render(moveHistory, containerEl).
 */

const DiceHeatmap = (() => {
  const FACES = [1, 2, 3, 4, 5, 6];
  const FACE_LABELS = { 1: 'Ratha', 2: 'Any', 3: 'Ashwa', 4: 'Danti', 5: 'Any', 6: 'Nara/Raja' };
  const PLAYER_COLORS = ['#e74c3c', '#3498db', '#2ecc71', '#f1c40f'];
  const PLAYER_NAMES = ['Red', 'Blue', 'Green', 'Yellow'];
  const EXPECTED_RATE = 1 / 6;

  /* ── Count dice rolls per player ── */
  function buildFrequencyTable(moveHistory) {
    // moveHistory items expected: { playerIdx, diceRoll, ... }
    const counts = Array.from({ length: 4 }, () => ({ 1:0, 2:0, 3:0, 4:0, 5:0, 6:0 }));
    const totals = [0, 0, 0, 0];

    for (const move of (moveHistory || [])) {
      const p = move.playerIdx ?? move.player;
      const d = move.diceRoll ?? move.dice ?? move.roll;
      if (p !== undefined && p >= 0 && p < 4 && d >= 1 && d <= 6) {
        counts[p][d]++;
        totals[p]++;
      }
    }
    return { counts, totals };
  }

  /* ── Luck annotation ── */
  function luckyAnnotation(totals, counts) {
    const results = [];
    for (let p = 0; p < 4; p++) {
      if (!totals[p]) continue;
      // Chi-square lite: sum deviation of each face
      let maxDev = 0, worstFace = 0;
      for (const f of FACES) {
        const expected = totals[p] * EXPECTED_RATE;
        const actual = counts[p][f];
        const dev = Math.abs(actual - expected) / Math.max(expected, 1);
        if (dev > maxDev) { maxDev = dev; worstFace = f; }
      }
      if (maxDev > 0.4) {
        const actualFaceRolls = counts[p][worstFace];
        const expectedFaceRolls = Math.round(totals[p] * EXPECTED_RATE);
        const over = actualFaceRolls > expectedFaceRolls;
        results.push({
          player: p,
          label: over
            ? `${PLAYER_NAMES[p]} rolled face ${worstFace} (${FACE_LABELS[worstFace]}) ${actualFaceRolls}× vs expected ${expectedFaceRolls}× — Auspicious surplus`
            : `${PLAYER_NAMES[p]} starved of face ${worstFace} (${FACE_LABELS[worstFace]}) — only ${actualFaceRolls}× vs expected ${expectedFaceRolls}× — Auspicious Misfortune`
        });
      }
    }
    return results;
  }

  /* ── SVG chart for one player ── */
  function buildPlayerChart(playerIdx, counts, total) {
    if (!total) return '';
    const W = 320, H = 120, PAD = { t: 10, r: 10, b: 30, l: 36 };
    const chartW = W - PAD.l - PAD.r;
    const chartH = H - PAD.t - PAD.b;
    const barW = chartW / 6 - 4;
    const maxCount = Math.max(...FACES.map(f => counts[f]), Math.ceil(total * EXPECTED_RATE * 1.5));
    const color = PLAYER_COLORS[playerIdx];
    const expectedH = (EXPECTED_RATE * total / maxCount) * chartH;

    let bars = '';
    let labels = '';
    FACES.forEach((f, i) => {
      const x = PAD.l + i * (chartW / 6) + 2;
      const actualH = (counts[f] / maxCount) * chartH;
      const y = PAD.t + chartH - actualH;
      bars += `<rect x="${x}" y="${y}" width="${barW}" height="${actualH}"
        fill="${color}" opacity=".75" rx="2"/>`;
      bars += `<text x="${x + barW/2}" y="${y - 3}" text-anchor="middle"
        fill="${color}" font-size="9">${counts[f]}</text>`;
      labels += `<text x="${x + barW/2}" y="${H - 6}" text-anchor="middle"
        fill="#9a8a6a" font-size="9">${f}</text>`;
    });

    // Expected line
    const expY = PAD.t + chartH - expectedH;
    const lineX1 = PAD.l;
    const lineX2 = W - PAD.r;

    // Y axis
    const yAxisTicks = [0, Math.round(maxCount / 2), maxCount];
    let yAxis = '';
    yAxisTicks.forEach(v => {
      const yy = PAD.t + chartH - (v / maxCount) * chartH;
      yAxis += `<text x="${PAD.l - 4}" y="${yy + 3}" text-anchor="end"
        fill="#6a5520" font-size="8">${v}</text>
        <line x1="${PAD.l}" x2="${W - PAD.r}" y1="${yy}" y2="${yy}"
        stroke="#2a2010" stroke-width="0.5"/>`;
    });

    return `<svg width="${W}" height="${H}" xmlns="http://www.w3.org/2000/svg">
      ${yAxis}
      ${bars}
      <line x1="${lineX1}" x2="${lineX2}" y1="${expY}" y2="${expY}"
        stroke="#b8952a" stroke-width="1" stroke-dasharray="4,3"/>
      <text x="${lineX2 - 2}" y="${expY - 3}" text-anchor="end"
        fill="#b8952a" font-size="8">Expected</text>
      ${labels}
    </svg>`;
  }

  /* ── Main render ── */
  function render(moveHistory, containerEl) {
    if (!containerEl) return;
    injectStyles();

    const { counts, totals } = buildFrequencyTable(moveHistory);
    const annotations = luckyAnnotation(totals, counts);

    // Only show players who actually rolled
    const activePlayers = FACES.map((_, i) => i).filter(i => totals[i] > 0);
    if (!activePlayers.length) {
      containerEl.innerHTML = '<p class="dhm-empty">No dice rolls recorded in this game.</p>';
      return;
    }

    let html = `<div class="dhm-root">
      <h3 class="dhm-title">⚀ Dice Chronicle — Pāśaka Distribution</h3>
      <p class="dhm-sub">Gold dashed line = expected rate (16.7% per face). Bars = actual rolls.</p>
      <div class="dhm-grid">`;

    for (const p of activePlayers) {
      html += `<div class="dhm-player">
        <div class="dhm-pname" style="color:${PLAYER_COLORS[p]}">${PLAYER_NAMES[p]} — ${totals[p]} rolls</div>
        ${buildPlayerChart(p, counts[p], totals[p])}
      </div>`;
    }

    html += `</div>`;

    if (annotations.length) {
      html += `<div class="dhm-annotations">`;
      for (const a of annotations) {
        html += `<div class="dhm-note">⚠ ${a.label}</div>`;
      }
      html += `</div>`;
    }

    // Overall distribution summary table
    html += `<table class="dhm-table"><thead>
      <tr><th>Face</th><th>Piece</th>${activePlayers.map(p =>
        `<th style="color:${PLAYER_COLORS[p]}">${PLAYER_NAMES[p]}</th>`).join('')}</tr>
    </thead><tbody>`;
    for (const f of FACES) {
      html += `<tr><td>${f}</td><td>${FACE_LABELS[f]}</td>${activePlayers.map(p => {
        const pct = totals[p] ? Math.round(counts[p][f] / totals[p] * 100) : 0;
        const dev = Math.abs(pct - 17);
        const color = dev > 8 ? (pct > 17 ? '#6dd56d' : '#e07070') : '#e8d5a0';
        return `<td style="color:${color}">${counts[p][f]} <small>(${pct}%)</small></td>`;
      }).join('')}</tr>`;
    }
    html += `</tbody></table></div>`;

    containerEl.innerHTML = html;
  }

  function injectStyles() {
    if (document.getElementById('dhm-styles')) return;
    const s = document.createElement('style');
    s.id = 'dhm-styles';
    s.textContent = `
.dhm-root { font-family: 'Cinzel', Georgia, serif; color: #e8d5a0; }
.dhm-title { font-size: 1.1rem; color: #b8952a; margin-bottom: 4px; }
.dhm-sub { font-size: .78rem; color: #9a8a6a; margin-bottom: 16px; }
.dhm-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(280px, 1fr)); gap: 16px; margin-bottom: 16px; }
.dhm-player { background: #13100a; border: 1px solid #2a2010; border-radius: 8px; padding: 12px; }
.dhm-pname { font-size: .85rem; font-weight: 600; margin-bottom: 8px; }
.dhm-annotations { display: flex; flex-direction: column; gap: 6px; margin-bottom: 16px; }
.dhm-note { font-size: .8rem; color: #c8a84a; background: #1a1408; border-left: 3px solid #b8952a; padding: 8px 12px; border-radius: 0 6px 6px 0; }
.dhm-empty { color: #6a5520; font-size: .9rem; }
.dhm-table { width: 100%; border-collapse: collapse; font-size: .82rem; }
.dhm-table th { color: #b8952a; border-bottom: 1px solid #2a2010; padding: 6px 10px; text-align: left; }
.dhm-table td { padding: 5px 10px; border-bottom: 1px solid #1a1408; }
.dhm-table small { color: #6a5520; }`;
    document.head.appendChild(s);
  }

  return { render, buildFrequencyTable };
})();
