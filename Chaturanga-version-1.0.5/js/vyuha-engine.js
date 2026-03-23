/**
 * Chaturanga Vyuha Engine (14x14/16x16 Formations)
 * A lightweight static renderer for ancient battle formations.
 */

const VyuhaData = {
  chakra: {
    name: 'Chakra Vyuha (Wheel Formation)',
    desc: 'A spinning, multi-layered defensive formation resembling a disc. Extremely difficult to penetrate; designed to trap enemies who map their way inside.',
    size: 14,
    units: [
      { type: 'raja', r: 7, c: 7, color: 'blue' },
      { type: 'danti', r: 6, c: 7, color: 'blue' }, { type: 'danti', r: 8, c: 7, color: 'blue' },
      { type: 'danti', r: 7, c: 6, color: 'blue' }, { type: 'danti', r: 7, c: 8, color: 'blue' },
      // Ring 1 (Infantry/Nara)
      { type: 'nara', r: 5, c: 7, color: 'blue' }, { type: 'nara', r: 9, c: 7, color: 'blue' },
      { type: 'nara', r: 7, c: 5, color: 'blue' }, { type: 'nara', r: 7, c: 9, color: 'blue' },
      { type: 'nara', r: 6, c: 6, color: 'blue' }, { type: 'nara', r: 8, c: 8, color: 'blue' },
      { type: 'nara', r: 6, c: 8, color: 'blue' }, { type: 'nara', r: 8, c: 6, color: 'blue' },
      // Ring 2 (Cavalry/Ashwa)
      { type: 'ashwa', r: 4, c: 7, color: 'blue' }, { type: 'ashwa', r: 10, c: 7, color: 'blue' },
      { type: 'ashwa', r: 7, c: 4, color: 'blue' }, { type: 'ashwa', r: 7, c: 10, color: 'blue' },
      { type: 'ashwa', r: 5, c: 5, color: 'blue' }, { type: 'ashwa', r: 9, c: 9, color: 'blue' },
      { type: 'ashwa', r: 5, c: 9, color: 'blue' }, { type: 'ashwa', r: 9, c: 5, color: 'blue' },
      // Outer ring Chariots (Ratha)
      { type: 'ratha', r: 3, c: 7, color: 'blue' }, { type: 'ratha', r: 11, c: 7, color: 'blue' },
      { type: 'ratha', r: 7, c: 3, color: 'blue' }, { type: 'ratha', r: 7, c: 11, color: 'blue' },
      { type: 'ratha', r: 4, c: 4, color: 'blue' }, { type: 'ratha', r: 10, c: 10, color: 'blue' },
      { type: 'ratha', r: 4, c: 10, color: 'blue' }, { type: 'ratha', r: 10, c: 4, color: 'blue' }
    ],
    arrows: [
      { path: 'M 150 150 A 100 100 0 1 1 150 350 A 100 100 0 1 1 150 150', color: 'rgba(201, 168, 76, 0.4)' }
    ]
  },
  padma: {
    name: 'Padma Vyuha (Lotus Formation)',
    desc: 'An offensive blooming formation. The core is protected while the petals (flanks) expand to encircle the approaching enemy.',
    size: 14,
    units: [
      { type: 'raja', r: 7, c: 7, color: 'red' },
      // Core
      { type: 'danti', r: 6, c: 7, color: 'red' }, { type: 'danti', r: 8, c: 7, color: 'red' },
      { type: 'danti', r: 7, c: 6, color: 'red' }, { type: 'danti', r: 7, c: 8, color: 'red' },
      // Petals (Ratha & Ashwa)
      { type: 'ratha', r: 4, c: 7, color: 'red' }, { type: 'ratha', r: 10, c: 7, color: 'red' },
      { type: 'ratha', r: 7, c: 4, color: 'red' }, { type: 'ratha', r: 7, c: 10, color: 'red' },
      { type: 'ashwa', r: 5, c: 6, color: 'red' }, { type: 'ashwa', r: 5, c: 8, color: 'red' },
      { type: 'ashwa', r: 9, c: 6, color: 'red' }, { type: 'ashwa', r: 9, c: 8, color: 'red' },
      { type: 'ashwa', r: 6, c: 5, color: 'red' }, { type: 'ashwa', r: 8, c: 5, color: 'red' },
      { type: 'ashwa', r: 6, c: 9, color: 'red' }, { type: 'ashwa', r: 8, c: 9, color: 'red' },
      // Infantry screen
      { type: 'nara', r: 3, c: 7, color: 'red' }, { type: 'nara', r: 11, c: 7, color: 'red' },
      { type: 'nara', r: 7, c: 3, color: 'red' }, { type: 'nara', r: 7, c: 11, color: 'red' },
      { type: 'nara', r: 4, c: 6, color: 'red' }, { type: 'nara', r: 4, c: 8, color: 'red' },
      { type: 'nara', r: 10, c: 6, color: 'red' }, { type: 'nara', r: 10, c: 8, color: 'red' },
      { type: 'nara', r: 6, c: 4, color: 'red' }, { type: 'nara', r: 8, c: 4, color: 'red' },
      { type: 'nara', r: 6, c: 10, color: 'red' }, { type: 'nara', r: 8, c: 10, color: 'red' }
    ],
    arrows: [
      { path: 'M 250 250 L 350 150', color: 'rgba(231, 76, 60, 0.4)' },
      { path: 'M 250 250 L 150 150', color: 'rgba(231, 76, 60, 0.4)' },
      { path: 'M 250 250 L 350 350', color: 'rgba(231, 76, 60, 0.4)' },
      { path: 'M 250 250 L 150 350', color: 'rgba(231, 76, 60, 0.4)' }
    ]
  },
  garuda: {
    name: 'Garuda Vyuha (Eagle Formation)',
    desc: 'An aggressive wedge formation mirroring a giant eagle. The \'beak\' pierces the enemy line while the \'wings\' sweep around the flanks.',
    size: 14,
    units: [
      { type: 'raja', r: 11, c: 7, color: 'green' },
      // Beak
      { type: 'danti', r: 2, c: 7, color: 'green' },
      { type: 'ashwa', r: 3, c: 6, color: 'green' }, { type: 'ashwa', r: 3, c: 8, color: 'green' },
      { type: 'ratha', r: 4, c: 7, color: 'green' },
      // Head
      { type: 'nara', r: 4, c: 6, color: 'green' }, { type: 'nara', r: 4, c: 8, color: 'green' },
      { type: 'danti', r: 5, c: 7, color: 'green' },
      // Wings
      { type: 'ratha', r: 6, c: 5, color: 'green' }, { type: 'nara', r: 6, c: 4, color: 'green' }, { type: 'ashwa', r: 6, c: 3, color: 'green' }, { type: 'nara', r: 6, c: 2, color: 'green' },
      { type: 'ratha', r: 6, c: 9, color: 'green' }, { type: 'nara', r: 6, c: 10, color: 'green' }, { type: 'ashwa', r: 6, c: 11, color: 'green' }, { type: 'nara', r: 6, c: 12, color: 'green' },
      { type: 'ashwa', r: 7, c: 4, color: 'green' }, { type: 'nara', r: 7, c: 3, color: 'green' },
      { type: 'ashwa', r: 7, c: 10, color: 'green' }, { type: 'nara', r: 7, c: 11, color: 'green' },
      // Body
      { type: 'nara', r: 7, c: 7, color: 'green' },
      { type: 'danti', r: 8, c: 6, color: 'green' }, { type: 'danti', r: 8, c: 8, color: 'green' },
      { type: 'nara', r: 9, c: 7, color: 'green' },
      { type: 'ratha', r: 10, c: 6, color: 'green' }, { type: 'ratha', r: 10, c: 8, color: 'green' },
      // Tail
      { type: 'nara', r: 12, c: 7, color: 'green' },
      { type: 'ashwa', r: 13, c: 6, color: 'green' }, { type: 'ashwa', r: 13, c: 8, color: 'green' }
    ],
    arrows: [
      { path: 'M 250 150 L 250 50 L 230 70 M 250 50 L 270 70', color: 'rgba(39, 174, 96, 0.4)' }, // Beak thrust
      { path: 'M 100 250 Q 80 150 150 100 L 130 100 M 150 100 L 150 120', color: 'rgba(39, 174, 96, 0.4)' }, // Left wing sweep
      { path: 'M 400 250 Q 420 150 350 100 L 370 100 M 350 100 L 350 120', color: 'rgba(39, 174, 96, 0.4)' }  // Right wing sweep
    ]
  }
};

class VyuhaRenderer {
  constructor(containerId) {
    this.container = document.getElementById(containerId);
  }

  render(vyuhaId) {
    const data = VyuhaData[vyuhaId];
    if (!data || !this.container) return;
    
    this.container.innerHTML = '';
    
    // Create grid background
    const grid = document.createElement('div');
    grid.style.display = 'grid';
    grid.style.gridTemplateColumns = `repeat(${data.size}, 1fr)`;
    grid.style.width = '100%';
    grid.style.aspectRatio = '1/1';
    grid.style.border = '2px solid var(--border)';
    grid.style.background = 'url(../images/board.png)';
    grid.style.position = 'relative';

    // Draw cells
    for (let r = 0; r < data.size; r++) {
      for (let c = 0; c < data.size; c++) {
        const cell = document.createElement('div');
        cell.style.border = '1px solid rgba(255, 255, 255, 0.05)';
        grid.appendChild(cell);
      }
    }

    // SVG Layer for arrows
    const svgLayer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
    svgLayer.setAttribute('viewBox', '0 0 500 500');
    svgLayer.style.position = 'absolute';
    svgLayer.style.top = '0';
    svgLayer.style.left = '0';
    svgLayer.style.width = '100%';
    svgLayer.style.height = '100%';
    svgLayer.style.pointerEvents = 'none';

    (data.arrows || []).forEach(arr => {
      const p = document.createElementNS('http://www.w3.org/2000/svg', 'path');
      p.setAttribute('d', arr.path);
      p.setAttribute('stroke', arr.color);
      p.setAttribute('stroke-width', '10');
      p.setAttribute('fill', 'none');
      p.setAttribute('stroke-linecap', 'round');
      p.setAttribute('stroke-linejoin', 'round');
      svgLayer.appendChild(p);
    });

    grid.appendChild(svgLayer);

    // Place units
    data.units.forEach(u => {
      const piece = document.createElement('img');
      // Translate names to internal map if needed
      const pieceMap = { pawn:'nara', horse:'ashwa', elephant:'danti', rook:'ratha', king:'raja', nara:'nara', ashwa:'ashwa', danti:'danti', ratha:'ratha', raja:'raja' };
      const imgName = pieceMap[u.type] || u.type;
      
      piece.src = `../images/pieces/${u.color}_${imgName}.png`;
      piece.style.position = 'absolute';
      piece.style.width = `${100/data.size * 0.8}%`;
      piece.style.height = `${100/data.size * 0.8}%`;
      piece.style.objectFit = 'contain';
      piece.style.filter = 'drop-shadow(0 2px 4px rgba(0,0,0,0.8))';
      
      // Calculate top/left percentages
      const topPct = (u.r / data.size) * 100;
      const leftPct = (u.c / data.size) * 100;
      // Center within cell
      const offset = (100/data.size) * 0.1;
      
      piece.style.top = `calc(${topPct}% + ${offset}%)`;
      piece.style.left = `calc(${leftPct}% + ${offset}%)`;
      
      grid.appendChild(piece);
    });

    this.container.appendChild(grid);

    // Update details panel if exists
    const titleEl = document.getElementById('vyuhaTitle');
    const descEl = document.getElementById('vyuhaDesc');
    if (titleEl) titleEl.textContent = data.name;
    if (descEl) descEl.textContent = data.desc;
  }
}

globalThis.VyuhaRenderer = VyuhaRenderer;
globalThis.VyuhaData = VyuhaData;
