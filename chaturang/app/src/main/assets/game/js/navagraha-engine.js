/**
 * Chaturanga v1.0.5.2 — Navagraha Engine
 * ═══════════════════════════════════════════════════════════════════
 * Daily astronomical game modifiers derived from the Hindu Panchanga.
 * Self-contained — computes tithi, nakshatra, vara, yoga, ritu from
 * the current date with no external dependencies.
 *
 * Every day produces a unique combination of modifiers that change:
 *   • How dharma is scored (passive modifiers)
 *   • Subtle gameplay rules (active modifiers)
 *   • The Drona pre-battle briefing
 *
 * Usage:
 *   const today = ChaturangaNavagraha.getToday();
 *   ChaturangaNavagraha.applyToGame(game);   // patches game state
 *   ChaturangaNavagraha.getBriefing();        // Drona's daily message
 */
(function (G) {
  'use strict';

  // ── Astronomical constants ───────────────────────────────────────────────
  const J2000 = 2451545.0;   // Julian date of J2000.0 epoch

  function julianDay(date) {
    const y = date.getFullYear(), m = date.getMonth() + 1, d = date.getDate();
    return 367 * y
      - Math.floor(7 * (y + Math.floor((m + 9) / 12)) / 4)
      + Math.floor(275 * m / 9)
      + d + 1721013.5;
  }

  // Simplified sun longitude (degrees) — accurate to ~1°
  function sunLongitude(jd) {
    const n  = jd - J2000;
    const L  = (280.460 + 0.9856474 * n) % 360;
    const g  = ((357.528 + 0.9856003 * n) % 360) * Math.PI / 180;
    return (L + 1.915 * Math.sin(g) + 0.020 * Math.sin(2 * g) + 360) % 360;
  }

  // Simplified moon longitude (degrees) — accurate to ~5°
  function moonLongitude(jd) {
    const n  = jd - J2000;
    const L  = (218.316 + 13.176396 * n) % 360;
    const M  = ((134.963 + 13.064993 * n) % 360) * Math.PI / 180;
    const F  = ((93.272  + 13.229350 * n) % 360) * Math.PI / 180;
    return (L + 6.289 * Math.sin(M) - 1.274 * Math.sin(M - 2 * F)
            + 0.658 * Math.sin(2 * F) + 360) % 360;
  }

  // Tithi: lunar day 1–30 (Shukla 1–15, Krishna 16–30)
  function getTithi(sunLon, moonLon) {
    const diff = ((moonLon - sunLon) + 360) % 360;
    return Math.floor(diff / 12) + 1; // 1–30
  }

  // Nakshatra: lunar mansion 0–26
  function getNakshatra(moonLon) {
    return Math.floor((moonLon / (360 / 27))) % 27;
  }

  // Yoga: sum of sun + moon longitudes / (360/27)
  function getYoga(sunLon, moonLon) {
    return Math.floor(((sunLon + moonLon) % 360) / (360 / 27));
  }

  // Vara: day of week (0=Sun … 6=Sat)
  function getVara(date) {
    return date.getDay(); // 0=Ravivara, 1=Somavara, 2=Mangalvara … 6=Shanivara
  }

  // Ritu: Hindu season (0=Vasanta … 5=Shishira)
  function getRitu(date) {
    const m = date.getMonth(); // 0-indexed
    if (m === 2 || m === 3)  return 0; // Vasanta  (Mar–Apr)
    if (m === 4 || m === 5)  return 1; // Grishma  (May–Jun)
    if (m === 6 || m === 7)  return 2; // Varsha   (Jul–Aug)
    if (m === 8 || m === 9)  return 3; // Sharad   (Sep–Oct)
    if (m === 10 || m === 11) return 4; // Hemanta  (Nov–Dec)
    return 5;                           // Shishira (Jan–Feb)
  }

  // ── Data tables ──────────────────────────────────────────────────────────

  const VARA_DATA = [
    { id:'ravivara',   planet:'Surya (Sun)',    symbol:'☉',
      name:'Ravivara',    english:'Sunday',
      dharmaNote:'Raja is empowered. Royal moves score double dharma.',
      gameplayNote:'Your Raja may move up to 2 squares once per game (Surya Diksha).',
      modifier:'raja_extended_move',
      briefing:'Today Surya illuminates the Ashtāpada. Your Raja carries divine authority — use it. One royal stride of two squares awaits when the moment is right.' },
    { id:'somavara',   planet:'Chandra (Moon)', symbol:'☽',
      name:'Somavara',    english:'Monday',
      dharmaNote:'Intuition flows. Free-choice dice rolls (2 or 5) award bonus dharma.',
      gameplayNote:'On dice faces 2 or 5, any piece you move earns +1 dharma (Chandra Dristi).',
      modifier:'free_choice_dharma',
      briefing:'The Moon blesses the wandering mind. When fate gives you freedom — face 2 or face 5 — every move you make is watched and weighed.' },
    { id:'mangalvara', planet:'Mangala (Mars)',  symbol:'♂',
      name:'Mangalvara',  english:'Tuesday',
      dharmaNote:'The Ratha surges with martial fire.',
      gameplayNote:'Your Ratha captures award +3 dharma each today (Mangala Shakti).',
      modifier:'ratha_capture_bonus',
      briefing:'Mangala burns in the sky. The chariot screams across the field. Today is the Ratha\'s day — drive it hard and spare nothing in its path.' },
    { id:'budhavara',  planet:'Budha (Mercury)', symbol:'☿',
      name:'Budhavara',   english:'Wednesday',
      dharmaNote:'The Ashwa outsmarts all opponents.',
      gameplayNote:'Horse fork combinations (attacking 2+ pieces) score triple dharma (Budha Cheshta).',
      modifier:'ashwa_fork_triple',
      briefing:'Budha moves like the Ashwa — sideways, leaping, unpredictable. A fork landed today carries three times the glory. Set the trap early.' },
    { id:'guruvara',   planet:'Guru (Jupiter)',  symbol:'♃',
      name:'Guruvara',    english:'Thursday',
      dharmaNote:'Guru blesses the advancing Nara.',
      gameplayNote:'Pawn promotion today creates 2 Naras on adjacent squares (Guru Prasad).',
      modifier:'double_promotion',
      briefing:'Guru\'s hand rests on the shoulder of the humble foot soldier. When your Nara reaches the far shore today, two shall be reborn in its place.' },
    { id:'shukravara', planet:'Shukra (Venus)',  symbol:'♀',
      name:'Shukravara',  english:'Friday',
      dharmaNote:'Alliance captures earn mutual dharma.',
      gameplayNote:'When your teammate captures a piece, you also earn dharma (Mitra Yoga).',
      modifier:'alliance_dharma_share',
      briefing:'Shukra binds allies together. Your partner\'s victories are your victories today. Fight as one and the dharma flows to both.' },
    { id:'shanivara',  planet:'Shani (Saturn)', symbol:'♄',
      name:'Shanivara',   english:'Saturday',
      dharmaNote:'Tapas: sacrifice earns the greatest reward.',
      gameplayNote:'Moving a piece into a threatened square deliberately earns +5 dharma (Shani Tapas).',
      modifier:'sacrifice_dharma',
      briefing:'Shani rewards those who endure. Offer your piece to the fire willingly — the sacrifice is seen, and dharma rises like smoke.' },
  ];

  const NAKSHATRA_DATA = [
    // 0-2: Ashwini, Bharani, Krittika
    { name:'Ashwini',    deity:'Ashwini Kumaras', quality:'healing',
      effect:'First capture of each piece type scores +2 dharma (Ashwini Vara).',
      modifier:'first_capture_bonus' },
    { name:'Bharani',    deity:'Yama',            quality:'sacrifice',
      effect:'Pieces sacrificed to protect the Raja score +4 dharma.',
      modifier:'raja_shield_bonus' },
    { name:'Krittika',   deity:'Agni',            quality:'fire',
      effect:'Ratha and Ashwa captures on the same turn award fire dharma (+3).',
      modifier:'fire_combo_bonus' },
    // 3-5: Rohini, Mrigashira, Ardra
    { name:'Rohini',     deity:'Brahma',          quality:'centre',
      effect:'Pieces occupying d4/d5/e4/e5 award +1 dharma per move.',
      modifier:'centre_dharma' },
    { name:'Mrigashira', deity:'Soma',            quality:'hunt',
      effect:'Each capture of a piece type scores +1 more than the last of same type.',
      modifier:'hunt_escalation' },
    { name:'Ardra',      deity:'Rudra',           quality:'storm',
      effect:'Capturing a defended piece (storm capture) scores double dharma.',
      modifier:'storm_capture' },
    // 6-8: Punarvasu, Pushya, Ashlesha
    { name:'Punarvasu',  deity:'Aditi',           quality:'return',
      effect:'Raja respawn in a central square scores +5 dharma.',
      modifier:'respawn_central_bonus' },
    { name:'Pushya',     deity:'Brihaspati',      quality:'nourish',
      effect:'All dharma gains increased by 25% (Pushya Vridhi).',
      modifier:'dharma_boost_25' },
    { name:'Ashlesha',   deity:'Nagas',           quality:'coil',
      effect:'Encircling the enemy Raja (adjacent on 3+ sides) awards +6 dharma.',
      modifier:'encircle_bonus' },
    // 9-11: Magha, Purva Phalguni, Uttara Phalguni
    { name:'Magha',      deity:'Pitrs',           quality:'ancestral',
      effect:'Opening development moves (turns 1–8) score +1 dharma each.',
      modifier:'opening_dharma' },
    { name:'Purva Phalguni', deity:'Bhaga',       quality:'wealth',
      effect:'Capturing a Ratha (5pt piece) awards +5 bonus dharma.',
      modifier:'ratha_capture_wealth' },
    { name:'Uttara Phalguni',deity:'Aryaman',     quality:'contract',
      effect:'Alliance captures (both teammates capture in same round) award +4.',
      modifier:'alliance_combo' },
    // 12-14: Hasta, Chitra, Swati
    { name:'Hasta',      deity:'Savitar',         quality:'skill',
      effect:'Capturing with the piece forced by dice scores +2 dharma (Hasta Nishtha).',
      modifier:'dice_capture_bonus' },
    { name:'Chitra',     deity:'Vishvakarma',     quality:'beauty',
      effect:'Ashwa fork combinations score double dharma today.',
      modifier:'ashwa_fork_double' },
    { name:'Swati',      deity:'Vayu',            quality:'independence',
      effect:'Moving to a square that was previously controlled by the enemy scores +2.',
      modifier:'reclaim_square' },
    // 15-17: Vishakha, Anuradha, Jyeshtha
    { name:'Vishakha',   deity:'Indra-Agni',      quality:'fork',
      effect:'Horse fork attacks score triple dharma (Vishakha — the forked star).',
      modifier:'vishakha_fork_triple' },
    { name:'Anuradha',   deity:'Mitra',           quality:'friendship',
      effect:'Moving a piece adjacent to a teammate\'s piece awards +1 dharma.',
      modifier:'formation_dharma' },
    { name:'Jyeshtha',   deity:'Indra',           quality:'senior',
      effect:'Capturing the highest-value enemy piece on the board awards +4 dharma.',
      modifier:'alpha_capture' },
    // 18-20: Mula, Purva Ashadha, Uttara Ashadha
    { name:'Mula',       deity:'Nirriti',         quality:'root',
      effect:'Capturing pawns that have advanced 4+ squares scores +3 dharma.',
      modifier:'advanced_pawn_capture' },
    { name:'Purva Ashadha',deity:'Apas',          quality:'purify',
      effect:'All forfeit turns today award +1 dharma (Tapas — purification).',
      modifier:'forfeit_dharma' },
    { name:'Uttara Ashadha',deity:'Vishvedevas',  quality:'victory',
      effect:'Eliminating a player awards +10 dharma (Vijaya bonus).',
      modifier:'elimination_bonus' },
    // 21-23: Shravana, Dhanishtha, Shatabhisha
    { name:'Shravana',   deity:'Vishnu',          quality:'listen',
      effect:'Pawn-chain moves (pawns supporting each other) score +1 each.',
      modifier:'pawn_chain_dharma' },
    { name:'Dhanishtha', deity:'Vasus',           quality:'wealth',
      effect:'Capturing 3+ pieces in one game awards a Dhanishtha bonus of +8.',
      modifier:'three_capture_bonus' },
    { name:'Shatabhisha',deity:'Varuna',          quality:'mystery',
      effect:'Guptchar spy captures do not reveal the spy\'s identity today.',
      modifier:'spy_stealth' },
    // 24-26: Purva Bhadra, Uttara Bhadra, Revati
    { name:'Purva Bhadra',deity:'Aja Ekapada',    quality:'fire-feet',
      effect:'Diagonal captures (Danti captures) score double dharma.',
      modifier:'danti_capture_double' },
    { name:'Uttara Bhadra',deity:'Ahir Budhnya',  quality:'depth',
      effect:'Late-game captures (after move 20) score +2 dharma each.',
      modifier:'endgame_capture_bonus' },
    { name:'Revati',     deity:'Pushan',          quality:'journey',
      effect:'All pawn promotions score +6 dharma (Revati — the last nakshatra).',
      modifier:'promotion_bonus' },
  ];

  const YOGA_DATA = [
    // Each of 27 yogas, grouped by quality
    'Vishkambha','Priti','Ayushman','Saubhagya','Shobhana',
    'Atiganda','Sukarman','Dhriti','Shoola','Ganda',
    'Vriddhi','Dhruva','Vyaghata','Harshana','Vajra',
    'Siddhi','Vyatipata','Variyan','Parigha','Shiva',
    'Siddha','Sadhya','Shubha','Shukla','Brahma',
    'Indra','Vaidhriti'
  ];

  const YOGA_QUALITY = {
    auspicious:   ['Priti','Ayushman','Saubhagya','Shobhana','Sukarman','Dhriti','Harshana','Siddhi','Shiva','Siddha','Sadhya','Shubha','Shukla','Brahma','Indra'],
    inauspicious: ['Vishkambha','Atiganda','Shoola','Ganda','Vyaghata','Vajra','Vyatipata','Parigha','Vaidhriti'],
    neutral:      ['Vriddhi','Dhruva','Variyan']
  };

  const RITU_DATA = [
    { name:'Vasanta',  english:'Spring',      months:'Mar–Apr',
      effect:'Pawn advancement scores +1 dharma per 2 ranks advanced.',
      modifier:'pawn_advance_dharma',
      description:'Life stirs. Every Nara that advances carries the season\'s blessing.' },
    { name:'Grishma',  english:'Summer',      months:'May–Jun',
      effect:'All captures score +1 dharma (Grishma aggression).',
      modifier:'all_capture_bonus',
      description:'The sun burns. Strikes are decisive and costly. Attack without mercy.' },
    { name:'Varsha',   english:'Monsoon',     months:'Jul–Aug',
      effect:'Blocking moves (interposing between attacker and target) score +2.',
      modifier:'block_dharma',
      description:'The rains slow everything. Defence becomes wisdom. Shelter what is precious.' },
    { name:'Sharad',   english:'Autumn',      months:'Sep–Oct',
      effect:'Balanced play (captures + non-captures roughly equal) scores +3 at game end.',
      modifier:'balanced_play_bonus',
      description:'The harvest weighs both sword and shield. Neither aggression nor retreat — balance.' },
    { name:'Hemanta',  english:'Early Winter', months:'Nov–Dec',
      effect:'Late-game moves (after half the pieces are captured) score +1 each.',
      modifier:'endgame_bonus',
      description:'Winter\'s clarity strips the board bare. The endgame reveals truth.' },
    { name:'Shishira', english:'Winter',      months:'Jan–Feb',
      effect:'Opening moves (first 10 half-moves) score +1 dharma each.',
      modifier:'opening_bonus',
      description:'The still cold before spring. Preparation is everything. Build before you strike.' },
  ];

  const TITHI_DATA = {
    1:  { name:'Pratipada',  quality:'nava-arambha',
          effect:'First capture of each piece type scores +3 dharma (new beginning).', modifier:'first_capture_triple' },
    5:  { name:'Panchami',   quality:'danti-power',
          effect:'Danti (Elephant) captures score +4 dharma today.', modifier:'danti_bonus' },
    6:  { name:'Shashthi',   quality:'skanda-shakti',
          effect:'Ashwa (Horse) captures score +3 dharma.', modifier:'ashwa_capture_bonus' },
    8:  { name:'Ashtami',    quality:'durga-day',
          effect:'Defensive captures (taking an attacker) score +4 dharma.', modifier:'defensive_capture' },
    10: { name:'Dashami',    quality:'ratha-supremacy',
          effect:'Ratha moves on open files score +1 dharma each.', modifier:'open_file_dharma' },
    11: { name:'Ekadashi',   quality:'vratastha',
          effect:'Vratastha — maximum difficulty. No auto-forfeits. All dharma gains ×1.5.', modifier:'ekadashi_vrata' },
    12: { name:'Dwadashi',   quality:'vishnu-day',
          effect:'Alliance team coordination (both teammates capture in same round) scores +6.', modifier:'vishnu_alliance' },
    13: { name:'Trayodashi', quality:'kama-vigour',
          effect:'Three consecutive captures award +8 dharma burst.', modifier:'triple_capture_burst' },
    14: { name:'Chaturdashi',quality:'shiva-night',
          effect:'Sacrifice moves score +6 dharma.', modifier:'shiva_sacrifice' },
    15: { name:'Purnima',    quality:'chandra-jyoti',
          effect:'FULL MOON — all dharma gains doubled this game.', modifier:'purnima_double' },
    30: { name:'Amavasya',   quality:'tamas',
          effect:'NEW MOON — dharma gains halved but all pieces move with extra silence (Guptchar never revealed).', modifier:'amavasya_stealth' },
  };

  // ── Core computation ─────────────────────────────────────────────────────
  function computeToday(date) {
    date = date || new Date();
    const jd    = julianDay(date);
    const sunL  = sunLongitude(jd);
    const moonL = moonLongitude(jd);

    const vara      = getVara(date);
    const tithiNum  = getTithi(sunL, moonL);
    const naksIdx   = getNakshatra(moonL);
    const yogaIdx   = getYoga(sunL, moonL);
    const ritu      = getRitu(date);

    const varaData    = VARA_DATA[vara];
    const naksData    = NAKSHATRA_DATA[naksIdx];
    const yogaName    = YOGA_DATA[yogaIdx];
    const yogaQ       = Object.entries(YOGA_QUALITY).find(([, v]) => v.includes(yogaName))?.[0] || 'neutral';
    const rituData    = RITU_DATA[ritu];
    const tithiData   = TITHI_DATA[tithiNum] || TITHI_DATA[tithiNum > 15 ? tithiNum - 15 : tithiNum] || null;

    // Tithis 16-29 mirror 1-14 in Krishna paksha
    const tithiMirror = tithiNum > 15 ? TITHI_DATA[tithiNum - 15] : null;
    const resolvedTithi = TITHI_DATA[tithiNum] || tithiMirror || { name:'Tritiya', quality:'standard', effect:'Standard day — no special tithi modifier.', modifier:'none' };

    // Paksha (lunar fortnight)
    const paksha = tithiNum <= 15 ? 'shukla' : 'krishna';
    const pakshaLabel = paksha === 'shukla' ? 'Shukla Paksha (waxing moon)' : 'Krishna Paksha (waning moon)';

    // Yoga dharma modifier
    const yogaDharmaMultiplier = yogaQ === 'auspicious' ? 1.25 : yogaQ === 'inauspicious' ? 0.8 : 1.0;

    // Collect all active modifiers
    const modifiers = [
      { source:'vara',      id: varaData.modifier,    label: varaData.dharmaNote, gameplayLabel: varaData.gameplayNote },
      { source:'nakshatra', id: naksData.modifier,    label: naksData.effect,     gameplayLabel: naksData.effect },
      { source:'ritu',      id: rituData.modifier,    label: rituData.effect,     gameplayLabel: rituData.effect },
      { source:'tithi',     id: resolvedTithi.modifier, label: resolvedTithi.effect, gameplayLabel: resolvedTithi.effect },
    ];
    if (yogaQ !== 'neutral') {
      modifiers.push({ source:'yoga', id: yogaQ === 'auspicious' ? 'yoga_boost' : 'yoga_drain',
        label: `${yogaName} Yoga (${yogaQ}) — dharma gains ×${yogaDharmaMultiplier}`,
        gameplayLabel: `${yogaName} Yoga — dharma multiplier ${yogaDharmaMultiplier}×` });
    }

    return {
      date:   date.toLocaleDateString('en-IN', { weekday:'long', year:'numeric', month:'long', day:'numeric' }),
      vara: varaData, tithi: resolvedTithi, tithiNum,
      paksha: pakshaLabel,
      nakshatra: naksData, yoga: { name: yogaName, quality: yogaQ, multiplier: yogaDharmaMultiplier },
      ritu: rituData, modifiers,
      // Raw for display
      raw: { sunLon: sunL.toFixed(2), moonLon: moonL.toFixed(2), jd: jd.toFixed(2), naksIdx, yogaIdx, tithiNum }
    };
  }

  // ── Dharma modifier application ──────────────────────────────────────────
  // Called by dharma-engine.js to adjust a dharma event's value
  function applyDharmaModifier(today, eventType, baseValue) {
    const mods   = today.modifiers.map(m => m.id);
    let value    = baseValue;

    // Yoga multiplier first
    value *= today.yoga.multiplier;

    // Tithi Purnima — double everything
    if (mods.includes('purnima_double'))    value *= 2;
    if (mods.includes('amavasya_stealth'))  value *= 0.5;
    if (mods.includes('ekadashi_vrata'))    value *= 1.5;
    if (mods.includes('dharma_boost_25'))   value *= 1.25;

    // Event-specific modifiers
    if (eventType === 'ratha_capture'  && mods.includes('ratha_capture_bonus'))     value += 3;
    if (eventType === 'ratha_capture'  && mods.includes('ratha_capture_wealth'))    value += 5;
    if (eventType === 'ashwa_fork'     && (mods.includes('ashwa_fork_triple') || mods.includes('vishakha_fork_triple'))) value *= 3;
    if (eventType === 'ashwa_fork'     && mods.includes('ashwa_fork_double'))        value *= 2;
    if (eventType === 'ashwa_capture'  && mods.includes('ashwa_capture_bonus'))      value += 3;
    if (eventType === 'ashwa_fork'     && mods.includes('budha_cheshta'))            value *= 3;
    if (eventType === 'danti_capture'  && (mods.includes('danti_bonus') || mods.includes('danti_capture_double'))) value += 4;
    if (eventType === 'sacrifice'      && (mods.includes('sacrifice_dharma') || mods.includes('shani_tapas'))) value += 5;
    if (eventType === 'sacrifice'      && mods.includes('shiva_sacrifice'))           value += 6;
    if (eventType === 'pawn_promotion' && mods.includes('promotion_bonus'))           value += 6;
    if (eventType === 'centre_move'    && mods.includes('centre_dharma'))             value += 1;
    if (eventType === 'capture'        && mods.includes('all_capture_bonus'))         value += 1;
    if (eventType === 'capture'        && mods.includes('storm_capture'))             value += 2;
    if (eventType === 'opening_move'   && mods.includes('opening_bonus'))             value += 1;
    if (eventType === 'opening_move'   && mods.includes('opening_dharma'))            value += 1;
    if (eventType === 'free_choice'    && mods.includes('free_choice_dharma'))        value += 1;
    if (eventType === 'block'          && mods.includes('block_dharma'))              value += 2;
    if (eventType === 'raja_shield'    && mods.includes('raja_shield_bonus'))         value += 4;
    if (eventType === 'raja_move'      && mods.includes('raja_dharma_double'))        value *= 2;
    if (eventType === 'elimination'    && mods.includes('elimination_bonus'))         value += 10;
    if (eventType === 'endgame_capture'&& (mods.includes('endgame_capture_bonus') || mods.includes('endgame_bonus'))) value += 2;
    if (eventType === 'pawn_advance'   && mods.includes('pawn_advance_dharma'))       value += 1;
    if (eventType === 'formation'      && mods.includes('formation_dharma'))          value += 1;
    if (eventType === 'first_capture'  && (mods.includes('first_capture_bonus') || mods.includes('first_capture_triple'))) value += (mods.includes('first_capture_triple') ? 3 : 2);
    if (eventType === 'forfeit'        && mods.includes('forfeit_dharma'))            value += 1;

    return Math.max(0, Math.round(value));
  }

  // ── Gameplay modifiers ───────────────────────────────────────────────────
  // Returns object describing active gameplay changes (applied by ui.js/game.js)
  function getGameplayModifiers(today) {
    const mods = today.modifiers.map(m => m.id);
    return {
      rajaExtendedMove:   mods.includes('raja_extended_move'),    // Raja can move 2sq once
      doublePromotion:    mods.includes('double_promotion'),       // Promotion = 2 pawns
      spyStealth:         mods.includes('spy_stealth') || mods.includes('amavasya_stealth'), // Guptchar invisible
      ekadashiVrata:      mods.includes('ekadashi_vrata'),         // No auto-forfeits
      allianceDharmaShare:mods.includes('alliance_dharma_share'),  // Teammate captures = your dharma
      huntEscalation:     mods.includes('hunt_escalation'),        // Same-type captures escalate
      encircleBonus:      mods.includes('encircle_bonus'),         // Surround raja bonus
      balancedPlayBonus:  mods.includes('balanced_play_bonus'),    // Balanced score at end
    };
  }

  // ── Drona briefing ────────────────────────────────────────────────────────
  function getBriefing(today) {
    const vara   = today.vara;
    const naks   = today.nakshatra;
    const ritu   = today.ritu;
    const tithi  = today.tithi;
    const yoga   = today.yoga;

    // Build personalised briefing from today's astronomical state
    const lines = [
      vara.briefing,
      `Under ${naks.name} nakshatra, the ${naks.deity} watches. ${naks.effect}`,
      `It is ${ritu.name} — ${ritu.description}`,
    ];

    if (yoga.quality === 'auspicious') {
      lines.push(`${yoga.name} Yoga blesses the day. Dharma flows freely — +25% to all gains.`);
    } else if (yoga.quality === 'inauspicious') {
      lines.push(`${yoga.name} Yoga clouds the sky. Dharma is scarce — 20% reduction on all gains.`);
    }

    if (tithi.modifier !== 'none') {
      lines.push(tithi.effect);
    }

    return lines.join(' ');
  }

  // ── Patch the live game state ────────────────────────────────────────────
  // Called once when game.html loads — attaches today's modifiers to game object
  function applyToGame(game) {
    if (!game) return;
    game.navagrahaToday = computeToday();
    game.navagrahaGameplay = getGameplayModifiers(game.navagrahaToday);
    // Track per-game state for modifier tracking
    game.navagrahaState = {
      rajaExtendedUsed:    false,
      firstCaptures:       new Set(),
      captureSequence:     0,
      lastCaptureType:     null,
      huntCounts:          {},
      totalCaptures:       0,
      totalNonCaptures:    0,
    };
  }

  // ── Public API ────────────────────────────────────────────────────────────
  G.ChaturangaNavagraha = {
    getToday:             () => computeToday(new Date()),
    getForDate:           (d) => computeToday(new Date(d)),
    applyToGame,
    applyDharmaModifier,
    getGameplayModifiers,
    getBriefing:          (today) => getBriefing(today || computeToday(new Date())),

    // Data tables (for display)
    VARA_DATA, NAKSHATRA_DATA, YOGA_DATA, RITU_DATA, TITHI_DATA,

    // Utilities for ui.js integration
    isDharmaDoubled: (today) => today.modifiers.some(m => m.id === 'purnima_double'),
    isEkadashi:      (today) => today.modifiers.some(m => m.id === 'ekadashi_vrata'),
    getYogaColor:    (today) => today.yoga.quality === 'auspicious' ? '#4ade80' : today.yoga.quality === 'inauspicious' ? '#f87171' : '#c9a84c',
  };

})(window);
