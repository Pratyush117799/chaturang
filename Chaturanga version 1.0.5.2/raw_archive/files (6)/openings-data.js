/**
 * openings-data.js — Chaturanga v1.0.5.2
 * 20 named Chaturanga openings. Pattern-matched against first 4 half-moves.
 * Drop into game.html after game.js.
 * Usage: ChaturangaOpenings.check(moveHistory) → { name, description } | null
 *        ChaturangaOpenings.showBanner(name) — call after each move in ui.js
 */

const ChaturangaOpenings = (() => {
  /**
   * Move pattern format: { piece, fromFile, fromRank, toFile, toRank }
   * piece codes: R=Ratha, A=Ashwa, D=Danti, N=Nara, K=Raja (matches game.js Piece.type)
   * null fields = wildcard
   * patterns checked against moveHistory[0..3] for the opening player only
   */
  const OPENINGS = [
    {
      id: 'bhishma_wall',
      name: "Bhishma's Wall",
      sanskrit: 'भीष्म प्राचीर',
      description: 'Rathas advance to command the centre files — impenetrable as the grandsire himself.',
      granth: 'bhishma_wall_opener',
      pattern: [
        { piece: 'R', toFile: 'd' },
        { piece: 'R', toFile: 'e' },
        null, null
      ]
    },
    {
      id: 'arjuna_surge',
      name: "Arjuna's Surge",
      sanskrit: 'अर्जुन वेग',
      description: 'Both Ashwas advance together — cavalry flanks open in the first breath of battle.',
      granth: 'arjuna_surge_opener',
      pattern: [
        { piece: 'A' },
        { piece: 'A' },
        null, null
      ]
    },
    {
      id: 'karna_gambit',
      name: "Karna's Gambit",
      sanskrit: 'कर्ण बलिदान',
      description: 'A Nara sacrificed on the first move to crack open a file — bold as Karna at Kurukshetra.',
      granth: 'karna_gambit_opener',
      pattern: [
        { piece: 'N', toRank: 5 },
        { piece: 'R' },
        null, null
      ]
    },
    {
      id: 'chakravyuha',
      name: 'Chakravyuha',
      sanskrit: 'चक्रव्यूह',
      description: 'Pieces spiral inward to create a rotating defensive web — Drona\'s legendary formation.',
      granth: 'chakravyuha_opener',
      pattern: [
        { piece: 'D' },
        { piece: 'A' },
        { piece: 'R' },
        { piece: 'N' }
      ]
    },
    {
      id: 'drona_diamond',
      name: "Drona's Diamond",
      sanskrit: 'द्रोण हीरा',
      description: 'Dantis open diagonals in both directions — Drona\'s taught patience made geometric.',
      granth: 'drona_diamond_opener',
      pattern: [
        { piece: 'D' },
        { piece: 'D' },
        null, null
      ]
    },
    {
      id: 'garuda_wing',
      name: 'Garuda Wing',
      sanskrit: 'गरुड़ पक्ष',
      description: 'One flank opens completely while the centre holds — like the eagle spreading a single wing.',
      granth: 'garuda_wing_opener',
      pattern: [
        { piece: 'N', toFile: 'a' },
        { piece: 'N', toFile: 'b' },
        { piece: 'R', toFile: 'a' },
        null
      ]
    },
    {
      id: 'yudhishthira_centre',
      name: "Yudhishthira's Centre",
      sanskrit: 'युधिष्ठिर केंद्र',
      description: 'Two Naras claim the centre squares — Dharma-king\'s steady, law-abiding advance.',
      granth: 'yudhishthira_centre_opener',
      pattern: [
        { piece: 'N', toFile: 'd' },
        { piece: 'N', toFile: 'e' },
        null, null
      ]
    },
    {
      id: 'shakuni_trap',
      name: "Shakuni's Trap",
      sanskrit: 'शकुनि जाल',
      description: 'The Ashwa hides behind a Nara screen — invitation to advance into an ambush.',
      granth: 'shakuni_trap_opener',
      pattern: [
        { piece: 'N' },
        { piece: 'A', toFile: 'c' },
        { piece: 'N' },
        null
      ]
    },
    {
      id: 'krishna_chariot',
      name: "Krishna's Chariot",
      sanskrit: 'कृष्ण रथ',
      description: 'The Raja steps forward escorted by Ratha — war counsel from the divine charioteer himself.',
      granth: 'krishna_chariot_opener',
      pattern: [
        { piece: 'K' },
        { piece: 'R' },
        null, null
      ]
    },
    {
      id: 'nakula_swift',
      name: "Nakula's Swift March",
      sanskrit: 'नकुल वेगयात्रा',
      description: 'All four Naras advance one step — an unstoppable wall of soldiers moving in unison.',
      granth: 'nakula_swift_opener',
      pattern: [
        { piece: 'N' },
        { piece: 'N' },
        { piece: 'N' },
        { piece: 'N' }
      ]
    },
    {
      id: 'vyasa_opening',
      name: "Vyāsa's Opening",
      sanskrit: 'व्यास उद्घाटन',
      description: 'Danti opens a diagonal, then the Ashwa claims space — the sage\'s two-voice verse.',
      granth: 'vyasa_opening_opener',
      pattern: [
        { piece: 'D' },
        { piece: 'A' },
        null, null
      ]
    },
    {
      id: 'sahadeva_endgame',
      name: "Sahadeva's Patience",
      sanskrit: 'सहदेव धैर्य',
      description: 'No aggressive moves for 4 half-moves — consolidation before the storm.',
      granth: 'sahadeva_patience_opener',
      pattern: [
        { piece: 'N', toFile: 'a' },
        { piece: 'N', toFile: 'h' },
        { piece: 'R', toFile: null },
        null
      ]
    },
    {
      id: 'drupada_thrust',
      name: "Drupada's Thrust",
      sanskrit: 'द्रुपद प्रहार',
      description: 'Ratha advances deep immediately — aggression on move 1, vengeance in every square.',
      granth: 'drupada_thrust_opener',
      pattern: [
        { piece: 'R', rankDelta: 3 }, // Ratha advances 3+ squares
        null, null, null
      ]
    },
    {
      id: 'ashvatthama_fury',
      name: "Aśvatthāma's Fury",
      sanskrit: 'अश्वत्थामा रोष',
      description: 'Three captures in the first 4 moves — relentless aggression matching the cursed warrior.',
      granth: 'ashvatthama_fury_opener',
      pattern: null, // capture-count based — handled specially
      special: 'captures_in_4'
    },
    {
      id: 'gandhari_veil',
      name: "Gāndhārī's Veil",
      sanskrit: 'गांधारी परदा',
      description: 'All moves stay on back rank — deliberate concealment, power held in reserve.',
      granth: 'gandhari_veil_opener',
      pattern: null,
      special: 'backrank_4'
    },
    {
      id: 'brahmastra',
      name: 'Brahmastra',
      sanskrit: 'ब्रह्मास्त्र',
      description: 'Ratha and Danti both open long lines toward the enemy corner — divine weapon aimed.',
      granth: 'brahmastra_opener',
      pattern: [
        { piece: 'R' },
        { piece: 'D' },
        { piece: 'R' },
        null
      ]
    },
    {
      id: 'kurukshetra_centre',
      name: 'Kurukshetra Flood',
      sanskrit: 'कुरुक्षेत्र बाढ़',
      description: 'All four types of pieces move in the first 4 turns — total war on every front.',
      granth: 'kurukshetra_flood_opener',
      pattern: null,
      special: 'all_piece_types_4'
    },
    {
      id: 'indraprastha_march',
      name: 'Indraprastha March',
      sanskrit: 'इंद्रप्रस्थ गमन',
      description: 'The entire front line of Naras advances two steps — Pandavas leaving their golden city.',
      granth: 'indraprastha_march_opener',
      pattern: [
        { piece: 'N', rankDelta: 2 },
        { piece: 'N', rankDelta: 2 },
        null, null
      ]
    },
    {
      id: 'pashupatastra',
      name: 'Pāśupatāstra',
      sanskrit: 'पाशुपतास्त्र',
      description: 'Ashwa leaps to the centre immediately — Shiva\'s weapon strikes without warning.',
      granth: 'pashupatastra_opener',
      pattern: [
        { piece: 'A', toFile: 'd', toRank: 4 },
        null, null, null
      ]
    },
    {
      id: 'vayu_flank',
      name: 'Vāyu Flank',
      sanskrit: 'वायु पार्श्व',
      description: 'Both Ashwas claim opposite wings simultaneously — wind blowing from all directions.',
      granth: 'vayu_flank_opener',
      pattern: [
        { piece: 'A', toFile: 'c' },
        { piece: 'A', toFile: 'f' },
        null, null
      ]
    }
  ];

  /* ── Pattern matcher ── */
  function matchesMove(move, pattern) {
    if (!pattern) return true; // wildcard
    if (pattern.piece && move.piece !== pattern.piece) return false;
    if (pattern.toFile && move.to && move.to[0] !== pattern.toFile) return false;
    if (pattern.toRank && move.to && parseInt(move.to[1]) !== pattern.toRank) return false;
    if (pattern.fromFile && move.from && move.from[0] !== pattern.fromFile) return false;
    return true;
  }

  function checkSpecial(opening, history4) {
    switch (opening.special) {
      case 'captures_in_4':
        return history4.filter(m => m.capture || m.isCapture).length >= 3;
      case 'backrank_4': {
        const playerRank = history4[0] ? (parseInt(history4[0].from?.[1])) : null;
        return history4.every(m => m.from && Math.abs(parseInt(m.from[1]) - playerRank) <= 1);
      }
      case 'all_piece_types_4': {
        const types = new Set(history4.map(m => m.piece));
        return types.size >= 4;
      }
    }
    return false;
  }

  function check(moveHistory, playerIdx = 0) {
    // Get first 4 moves of player
    const playerMoves = (moveHistory || [])
      .filter(m => (m.playerIdx ?? m.player) === playerIdx)
      .slice(0, 4);

    if (playerMoves.length < 2) return null;

    for (const opening of OPENINGS) {
      if (opening.special) {
        if (playerMoves.length >= 4 && checkSpecial(opening, playerMoves)) return opening;
        continue;
      }
      if (!opening.pattern) continue;

      let matched = true;
      for (let i = 0; i < opening.pattern.length; i++) {
        if (!opening.pattern[i]) continue; // wildcard slot
        if (!playerMoves[i]) { matched = false; break; }
        if (!matchesMove(playerMoves[i], opening.pattern[i])) { matched = false; break; }
      }
      if (matched) return opening;
    }
    return null;
  }

  /* ── In-game banner ── */
  let lastShownOpening = null;

  function showBanner(opening) {
    if (!opening || opening.id === lastShownOpening) return;
    lastShownOpening = opening.id;

    injectStyles();
    const banner = document.createElement('div');
    banner.className = 'cop-banner';
    banner.innerHTML = `
      <div class="cop-sanskrit">${opening.sanskrit}</div>
      <div class="cop-name">${opening.name}</div>
      <div class="cop-desc">${opening.description}</div>`;
    document.body.appendChild(banner);
    requestAnimationFrame(() => banner.classList.add('cop-show'));
    setTimeout(() => {
      banner.classList.remove('cop-show');
      setTimeout(() => banner.remove(), 600);
    }, 4000);

    // Dispatch for Granth achievement
    window.dispatchEvent(new CustomEvent('chaturanga:opening', { detail: opening }));
  }

  /* ── Reset per new game ── */
  function reset() { lastShownOpening = null; }

  /* ── Seer label helper ── */
  function getSeerLabel(moveHistory, playerIdx) {
    const opening = check(moveHistory, playerIdx);
    return opening ? `${opening.name} (${opening.sanskrit})` : null;
  }

  /* ── All openings for library view ── */
  function getAll() { return OPENINGS; }

  function injectStyles() {
    if (document.getElementById('cop-styles')) return;
    const s = document.createElement('style');
    s.id = 'cop-styles';
    s.textContent = `
.cop-banner {
  position: fixed; top: 80px; left: 50%; transform: translateX(-50%) translateY(-30px);
  background: linear-gradient(135deg, #1a1209 0%, #2a1f0f 100%);
  border: 1px solid #b8952a; border-radius: 10px;
  padding: 14px 24px; text-align: center; z-index: 9997;
  opacity: 0; pointer-events: none; transition: opacity .4s, transform .4s;
  font-family: 'Cinzel', Georgia, serif; min-width: 280px;
  box-shadow: 0 4px 30px rgba(184,149,42,.3);
}
.cop-banner.cop-show { opacity: 1; transform: translateX(-50%) translateY(0); }
.cop-sanskrit { font-size: .75rem; color: #9a8a6a; letter-spacing: .08em; }
.cop-name { font-size: 1.1rem; color: #f0c040; font-weight: 700; margin: 4px 0; }
.cop-desc { font-size: .8rem; color: #c8b87a; max-width: 260px; }`;
    document.head.appendChild(s);
  }

  return { check, showBanner, reset, getSeerLabel, getAll, OPENINGS };
})();
