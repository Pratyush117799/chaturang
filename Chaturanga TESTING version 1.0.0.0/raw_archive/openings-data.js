/**
 * openings-data.js — Chaturanga v1.0.5.2
 * 20 named Chaturanga openings. Pattern-matches first 4 half-moves.
 * Drop-in: <script src="js/openings-data.js"></script> after game.js in game.html + seer.html
 *
 * Integration:
 *   Call OpeningLibrary.check(moveHistory) after each move.
 *   Returns { name, description, granth } or null.
 *   Banner auto-shows if #openingBanner exists in DOM.
 *   Granth achievement fires via OpeningLibrary.onOpeningDetected callback.
 */

const OpeningLibrary = (() => {

  // Move format in patterns: 'piece-fromFile-toFile' or '*' for wildcard
  // Pieces: R=Ratha, A=Ashwa, D=Danti, N=Nara, K=Raja
  // Simplified: match on first 4 moves (2 per team side)

  const OPENINGS = [
    {
      id: 'bhishmas_wall',
      name: "Bhishma's Wall",
      sanskrit: 'भीष्म कवच',
      description: 'Rathas march to central files, building an impenetrable flank.',
      granth: 'bhishmas_wall_first',
      drona: 'The grandsire forms his shield — immovable, patient, unyielding.',
      pattern: (h) => moveIs(h, 0, 'Ratha') && moveIs(h, 1, 'Ratha') && centralFile(h, 0),
      minMoves: 2
    },
    {
      id: 'arjunas_surge',
      name: "Arjuna's Surge",
      sanskrit: 'अर्जुन आक्रमण',
      description: 'Both Ashwas leap forward in the first two turns — maximum cavalry pressure.',
      granth: 'arjunas_surge_first',
      drona: 'The Pandava archer strikes from both wings at once. Prepare your flanks.',
      pattern: (h) => moveIs(h, 0, 'Ashwa') && moveIs(h, 1, 'Ashwa'),
      minMoves: 2
    },
    {
      id: 'karnas_gambit',
      name: "Karna's Gambit",
      sanskrit: 'कर्ण बलिदान',
      description: 'A Nara sacrificed in move 1 to open the central file for Ratha aggression.',
      granth: 'karnas_gambit_first',
      drona: 'Karna gives without hesitation. The open line is his reward.',
      pattern: (h) => moveIs(h, 0, 'Nara') && moveIs(h, 1, 'Ratha') && isCapture(h, 0),
      minMoves: 2
    },
    {
      id: 'dronas_formation',
      name: "Drona's Chakravyuha",
      sanskrit: 'द्रोण चक्रव्यूह',
      description: 'Danti and Nara form a spiraling defensive ring in the first four moves.',
      granth: 'dronas_formation_first',
      drona: 'The spiral tightens. Let them enter — they will not find the exit.',
      pattern: (h) => moveIs(h, 0, 'Danti') && moveIs(h, 2, 'Nara') && moveIs(h, 3, 'Nara'),
      minMoves: 4
    },
    {
      id: 'yudhishthiras_patience',
      name: "Yudhishthira's Patience",
      sanskrit: 'युधिष्ठिर विराम',
      description: 'Three consecutive Nara advances before any major piece moves.',
      granth: 'yudhishthiras_patience_first',
      drona: 'Dharmaraja does not rush. The pawns prepare the field for the kings.',
      pattern: (h) => moveIs(h, 0, 'Nara') && moveIs(h, 1, 'Nara') && moveIs(h, 2, 'Nara'),
      minMoves: 3
    },
    {
      id: 'shakuni_dice',
      name: "Shakuni's Deception",
      sanskrit: 'शकुनि कपट',
      description: 'Immediate forfeit of first turn to bait an aggressive opponent forward.',
      granth: 'shakuni_deception_first',
      drona: 'The uncle of Duryodhana smiles. He gives ground to take more.',
      pattern: (h) => h[0]?.type === 'forfeit' || h[0]?.forfeit,
      minMoves: 1
    },
    {
      id: 'ghatotkacha_leap',
      name: "Ghatotkacha's Leap",
      sanskrit: 'घटोत्कच छलांग',
      description: 'Ashwa jumps to the opposite quadrant in move 1 — extreme long range opening.',
      granth: 'ghatotkacha_leap_first',
      drona: 'The rakshasa-son crosses the sky in a single bound. Watch the far squares.',
      pattern: (h) => moveIs(h, 0, 'Ashwa') && longLeap(h, 0),
      minMoves: 1
    },
    {
      id: 'satyakis_lance',
      name: "Satyaki's Lance",
      sanskrit: 'सात्यकि शूल',
      description: 'Ratha charges straight down the open file in move 1.',
      granth: 'satyakis_lance_first',
      drona: 'The chariot lord strikes like a spear — direct, unstoppable, inevitable.',
      pattern: (h) => moveIs(h, 0, 'Ratha') && straightCharge(h, 0),
      minMoves: 1
    },
    {
      id: 'critical_mass',
      name: 'Pancha Vyuha',
      sanskrit: 'पञ्च व्यूह',
      description: 'Five different piece types moved in the first five turns — perfect opening variety.',
      granth: 'pancha_vyuha_first',
      drona: 'All arms of the army engaged. This general knows balance.',
      pattern: (h) => h.length >= 5 && allDifferentPieces(h.slice(0,5)),
      minMoves: 5
    },
    {
      id: 'raja_march',
      name: "Raja's Gamble",
      sanskrit: 'राज साहस',
      description: 'The Raja moves in the first three turns — an audacious centralization.',
      granth: 'rajas_gamble_first',
      drona: 'The king walks into battle himself. Brave or foolish — only Kala knows.',
      pattern: (h) => (moveIs(h,0,'Raja') || moveIs(h,1,'Raja') || moveIs(h,2,'Raja')),
      minMoves: 2
    },
    {
      id: 'diamond_front',
      name: 'Vajra Formation',
      sanskrit: 'वज्र व्यूह',
      description: 'Nara-Danti-Nara triangle forms a diamond shield across the centre.',
      granth: 'vajra_formation_first',
      drona: 'Indra\'s thunderbolt cannot be broken. Neither can this centre.',
      pattern: (h) => moveIs(h,0,'Nara') && moveIs(h,1,'Danti') && moveIs(h,2,'Nara'),
      minMoves: 3
    },
    {
      id: 'twin_ashwa',
      name: 'Ashwa Yugma',
      sanskrit: 'अश्व युग्म',
      description: 'Both horses placed in forking positions within the first four moves.',
      granth: 'ashwa_yugma_first',
      drona: 'The twin horses circle. Every square on the board begins to tremble.',
      pattern: (h) => countPiece(h, 'Ashwa', 4) >= 2,
      minMoves: 4
    },
    {
      id: 'danti_diagonal',
      name: 'Gaja Trident',
      sanskrit: 'गज त्रिशूल',
      description: 'Three diagonal Danti advances — the elephant controls all diagonal lanes.',
      granth: 'gaja_trident_first',
      drona: 'The war elephant charges diagonally. Nothing in its path survives.',
      pattern: (h) => countPiece(h, 'Danti', 4) >= 2,
      minMoves: 4
    },
    {
      id: 'passive_open',
      name: 'Sanyasi Opening',
      sanskrit: 'संन्यासी आरंभ',
      description: 'No captures in the first 6 moves — pure positional play.',
      granth: 'sanyasi_opening_first',
      drona: 'The sage does not grasp. He positions without desire for blood.',
      pattern: (h) => h.length >= 6 && h.slice(0,6).every(m => !m.captured && !m.capture),
      minMoves: 6
    },
    {
      id: 'aggressive_open',
      name: 'Kshatriya Rush',
      sanskrit: 'क्षत्रिय धावा',
      description: 'Capture on move 1 — the warrior does not wait for pleasantries.',
      granth: 'kshatriya_rush_first',
      drona: 'The warrior class takes immediately. Diplomacy is for the defeated.',
      pattern: (h) => h[0] && (h[0].captured || h[0].capture),
      minMoves: 1
    },
    {
      id: 'four_corners',
      name: 'Kurukshetra Cross',
      sanskrit: 'कुरुक्षेत्र क्रॉस',
      description: 'Moves in all four quadrants within the first four turns.',
      granth: 'kurukshetra_cross_first',
      drona: 'The field of dharma stretches in all directions. Control it.',
      pattern: (h) => allQuadrantsCovered(h.slice(0,4)),
      minMoves: 4
    },
    {
      id: 'ratha_wall',
      name: 'Ratha Sutra',
      sanskrit: 'रथ सूत्र',
      description: 'Two Rathas on adjacent files form a rolling siege wall.',
      granth: 'ratha_sutra_first',
      drona: 'The chariots align like a wave. What they roll over does not rise again.',
      pattern: (h) => countPiece(h, 'Ratha', 4) >= 2 && !isCapture(h, 0),
      minMoves: 4
    },
    {
      id: 'nara_storm',
      name: 'Nara Pravah',
      sanskrit: 'नर प्रवाह',
      description: 'Four consecutive Nara advances — the pawn flood strategy.',
      granth: 'nara_pravah_first',
      drona: 'The common soldier marches. When all march together, kings fall.',
      pattern: (h) => h.slice(0,4).every(m => pieceType(m) === 'Nara'),
      minMoves: 4
    },
    {
      id: 'balanced_advance',
      name: 'Sama Vyuha',
      sanskrit: 'सम व्यूह',
      description: 'Exactly one move each by Nara, Ashwa, Danti, Ratha in first four turns.',
      granth: 'sama_vyuha_first',
      drona: 'Equal measure. No piece neglected. This is the art of balanced war.',
      pattern: (h) => {
        const types = h.slice(0,4).map(m => pieceType(m));
        return ['Nara','Ashwa','Danti','Ratha'].every(t => types.includes(t));
      },
      minMoves: 4
    },
    {
      id: 'double_sacrifice',
      name: 'Mahayagna',
      sanskrit: 'महायज्ञ',
      description: 'Two pieces sacrificed (captured without recapture) in the first six moves.',
      granth: 'mahayagna_first',
      drona: 'The great offering. To give two lives for the dharma of position — rare courage.',
      pattern: (h) => countCaptures(h.slice(0,6)) >= 2,
      minMoves: 6
    }
  ];

  // ── pattern helpers ───────────────────────────────────────────────────────
  function pieceType(move) {
    return move?.pieceName || move?.piece?.name || move?.pieceType || move?.type || '';
  }
  function moveIs(h, idx, type) {
    return h[idx] && pieceType(h[idx]).toLowerCase().includes(type.toLowerCase());
  }
  function isCapture(h, idx) {
    return h[idx] && (h[idx].captured || h[idx].capture || h[idx].isCapture);
  }
  function centralFile(h, idx) {
    const m = h[idx];
    if (!m) return false;
    const to = m.to || m.toSquare || '';
    return /^[c-f][3-6]$/.test(to);
  }
  function longLeap(h, idx) {
    const m = h[idx];
    if (!m) return false;
    const from = (m.from || m.fromSquare || '');
    const to   = (m.to   || m.toSquare   || '');
    if (!from || !to) return false;
    const fc = from.charCodeAt(0) - 97, fr = parseInt(from[1]) - 1;
    const tc = to.charCodeAt(0) - 97,   tr = parseInt(to[1]) - 1;
    return Math.abs(fc - tc) >= 4 || Math.abs(fr - tr) >= 4;
  }
  function straightCharge(h, idx) {
    const m = h[idx];
    if (!m) return false;
    const from = (m.from || m.fromSquare || '');
    const to   = (m.to   || m.toSquare   || '');
    if (!from || !to) return false;
    return from[0] === to[0]; // same file
  }
  function allDifferentPieces(moves) {
    const types = new Set(moves.map(m => pieceType(m).toLowerCase().slice(0,4)));
    return types.size >= 5;
  }
  function countPiece(h, type, limit) {
    return h.slice(0, limit).filter(m => moveIs([m], 0, type)).length;
  }
  function countCaptures(moves) {
    return moves.filter(m => m.captured || m.capture || m.isCapture).length;
  }
  function allQuadrantsCovered(moves) {
    const quads = new Set();
    moves.forEach(m => {
      const to = m?.to || m?.toSquare || '';
      if (!to) return;
      const c = to.charCodeAt(0) - 97, r = parseInt(to[1]) - 1;
      quads.add(`${c < 4 ? 'L' : 'R'}${r < 4 ? 'B' : 'T'}`);
    });
    return quads.size >= 3;
  }

  // ── detection ─────────────────────────────────────────────────────────────
  const _shown = new Set();

  function check(moveHistory) {
    if (!moveHistory?.length) return null;
    for (const op of OPENINGS) {
      if (moveHistory.length < op.minMoves) continue;
      try {
        if (op.pattern(moveHistory)) {
          return { ...op };
        }
      } catch {}
    }
    return null;
  }

  // ── banner UI ─────────────────────────────────────────────────────────────
  function injectBannerCSS() {
    if (document.getElementById('opening-banner-css')) return;
    const s = document.createElement('style');
    s.id = 'opening-banner-css';
    s.textContent = `
      #openingBanner { position:fixed;top:68px;left:50%;transform:translateX(-50%) translateY(-80px);
        background:linear-gradient(135deg,#1a1200ee,#0d0a00ee);
        border:1px solid #c9a84c;border-radius:10px;padding:10px 20px 10px 16px;
        z-index:9000;display:flex;align-items:center;gap:12px;
        transition:transform .4s cubic-bezier(.34,1.56,.64,1),opacity .4s;opacity:0;
        backdrop-filter:blur(6px);max-width:380px; }
      #openingBanner.show { transform:translateX(-50%) translateY(0);opacity:1; }
      .ob-icon { font-size:22px; }
      .ob-body { flex:1;min-width:0; }
      .ob-name { font-family:Cinzel,serif;color:#c9a84c;font-size:13px;font-weight:700; }
      .ob-sanskrit { font-size:10px;color:#888;letter-spacing:.08em; }
      .ob-desc { font-size:11px;color:#ccc;margin-top:2px;font-family:Outfit,sans-serif; }
      .ob-close { cursor:pointer;color:#555;font-size:16px;padding:2px 4px;line-height:1; }
      .ob-close:hover { color:#c9a84c; }
    `;
    document.head.appendChild(s);
  }

  function showBanner(opening) {
    injectBannerCSS();
    let banner = document.getElementById('openingBanner');
    if (!banner) {
      banner = document.createElement('div');
      banner.id = 'openingBanner';
      document.body.appendChild(banner);
    }
    banner.innerHTML = `
      <div class="ob-icon">⚔️</div>
      <div class="ob-body">
        <div class="ob-name">${opening.name}</div>
        <div class="ob-sanskrit">${opening.sanskrit}</div>
        <div class="ob-desc">${opening.description}</div>
      </div>
      <span class="ob-close" onclick="document.getElementById('openingBanner').classList.remove('show')">✕</span>`;
    requestAnimationFrame(() => {
      requestAnimationFrame(() => banner.classList.add('show'));
    });
    setTimeout(() => banner.classList.remove('show'), 6000);

    // Grant Granth achievement if first time
    if (opening.granth && !_shown.has(opening.granth)) {
      _shown.add(opening.granth);
      grantGranthAchievement(opening);
    }
  }

  function grantGranthAchievement(opening) {
    try {
      const key = 'chaturanga_granth_unlocked';
      const unlocked = JSON.parse(localStorage.getItem(key) || '{}');
      if (!unlocked[opening.granth]) {
        unlocked[opening.granth] = Date.now();
        localStorage.setItem(key, JSON.stringify(unlocked));
        // Fire callback if registered
        if (typeof window.onGranthUnlock === 'function') {
          window.onGranthUnlock({ id: opening.granth, name: opening.name, category: 'opening' });
        }
      }
    } catch {}
  }

  // ── auto-hook: patch after every move ─────────────────────────────────────
  function hookAfterMove(moveHistory) {
    const found = check(moveHistory);
    if (found) showBanner(found);
    return found;
  }

  // ── public API ─────────────────────────────────────────────────────────────
  window.OpeningLibrary = {
    check,
    showBanner,
    hookAfterMove,
    all: OPENINGS,
    /** Returns opening for a given game's move history (for Seer display) */
    identify: (moveHistory) => check(moveHistory)
  };

  return window.OpeningLibrary;
})();
