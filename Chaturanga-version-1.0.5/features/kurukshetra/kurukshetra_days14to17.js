/**
 * Chaturanga v1.0.5 — Kurukshetra Campaign
 * Days 14–17 Scenario Data
 * ═══════════════════════════════════════════════════════════════════
 *
 * HOW TO INTEGRATE:
 * In kurukshetra.html, paste these scenario objects inside SCENARIOS = { ... }
 * AFTER day13: { ... } and BEFORE day18: { ... }
 *
 * Also update ALL_DAYS — replace the 4 locked entries for days 14–17
 * with the updated entries at the bottom of this file.
 * ═══════════════════════════════════════════════════════════════════
 */

// ── PASTE INSIDE SCENARIOS = { ... } AFTER day13 ────────────────────────────

day14: {
  id:'day14', day:14,
  title:"Arjuna's Fury",
  commander:'Arjuna, son of Indra, the greatest archer',
  difficulty:'Hard', elo:850,
  badge:'',
  unlocked:false,
  sub:'Capture Jayadratha before sunset — 10 moves or Arjuna dies',
  cutscene:[
    {type:'narrator', text:'Day 14. The day after Abhimanyu\'s death inside the Chakravyuha. Arjuna has sworn the most terrible oath in the Mahabharata: he will kill Jayadratha — the man who sealed the Chakravyuha\'s outer ring — before sunset. If he fails, he will walk into fire.'},
    {type:'narrator', text:'Jayadratha is buried deep in the Kaurava formation, surrounded by the greatest warriors of the age. Drona himself has built a formation specifically to protect him until sunset.'},
    {type:'drona', text:'Student. This is not a game today. This is Arjuna\'s oath. His son died yesterday. He has ten moves before the sun sets. Krishna is his charioteer. The entire Kaurava army stands between him and Jayadratha.'},
    {type:'narrator', text:'You have 10 moves. Jayadratha is the enemy Raja. Capture him — or Arjuna walks into fire.'}
  ],
  winCondition:"Capture Jayadratha's Raja (♚) within 10 moves. After move 10, Arjuna's oath demands forfeit.",
  winType:'capture-king',
  movesLimit:10,
  boardState:{
    // Arjuna — powerful strike force, open position
    'e1':'0:king','a1':'0:rook','h1':'0:rook',
    'b1':'0:horse','g1':'0:horse',
    'c1':'0:elephant','f1':'0:elephant',
    'a2':'0:pawn','b2':'0:pawn','c2':'0:pawn',
    'f2':'0:pawn','g2':'0:pawn','h2':'0:pawn',
    'd3':'0:pawn','e3':'0:pawn',
    // Jayadratha — deeply buried, protected by elite guard
    'e7':'1:king',
    'c8':'1:rook','g8':'1:rook',
    'b8':'1:horse','h8':'1:horse',
    'd8':'1:elephant','f8':'1:elephant',
    'c7':'1:pawn','d7':'1:pawn','e8':'1:pawn','f7':'1:pawn','g7':'1:pawn',
    'b7':'1:pawn','h7':'1:pawn'
  },
  humanPlayer:0,
  botPlayer:1, botAggression:'strategic',
  liveCommentary:{
    'game-start':['Arjuna\'s oath burns. Ten moves remain before sunset. Jayadratha hides behind seven layers of protection. Every move must open a path — there is no time for caution.'],
    'rook-moved':['The Ratha tears open a file toward Jayadratha\'s position. Is the path clear?','Arjuna\'s chariot charges. How many pieces still stand between you and the oath?'],
    'horse-moved':['The Ashwa leaps the outer guard. Closer — but Drona\'s formation still holds the inner ring.'],
    'capture':['A guard piece falls! The path to Jayadratha opens slightly. Move immediately — do not consolidate.','One protector eliminated. Count the pieces between you and the Raja. How many remain?'],
    'lose-piece':['A piece is lost. Arjuna does not stop — the oath demands the Raja. Press forward regardless.'],
    'raja-threatened':['The enemy counter-attacks your Raja! Even now, protect Arjuna — a dead archer cannot fulfil his oath.'],
    'win':["JAYADRATHA FALLS. The oath is fulfilled before sunset. Abhimanyu is avenged. Arjuna's arrow finds its mark through seven layers of protection — as Krishna promised it would."],
    'lose':["The sun sets. Arjuna's oath is unfulfilled. This is the Mahabharata's darkest near-miss. Study each move — Jayadratha was reachable. Find the faster path."]
  },
  result:{
    win:{
      icon:'🌅', tier:"Arjuna's Oath Fulfilled", tierClass:'tier-victory',
      outcome:'Jayadratha Falls at Sunset',
      desc:"Ten moves or fewer — Jayadratha's Raja captured. The oath that shook both armies is fulfilled. Abhimanyu is avenged.",
      dronaQuote:"This is the move that Krishna promised Arjuna: that the oath would be fulfilled. You played as Krishna believed Arjuna would play — with absolute commitment and no wasted moves.",
      dronaVerse:'— Drona Parva, Mahabharata'
    },
    lose:{
      icon:'🌄', tier:'Sunset — Oath Broken', tierClass:'tier-fallen',
      outcome:'The Sun Has Set',
      desc:'Ten moves elapsed without capturing the Raja. In the Mahabharata, this was the moment Krishna used a divine stratagem to hide the sun — but on the Ashtāpada, there is no divine intervention.',
      dronaQuote:'Arjuna needed ten precise moves. You used some of them on the wrong pieces. Return and trace the fastest path to the Raja — it exists within ten moves.',
      dronaVerse:'— Drona Parva, Mahabharata'
    }
  }
},

day15: {
  id:'day15', day:15,
  title:"Drona's Death",
  commander:'Ashvatthama — Drona\'s son, fighting for the Kauravas',
  difficulty:'Very Hard', elo:900,
  badge:'',
  unlocked:false,
  sub:'Play the enemy side for the first time — you are the Kauravas',
  cutscene:[
    {type:'narrator', text:'Day 15. The Pandavas have spread a lie across the battlefield: "Ashvatthama is dead." Yudhishthira, who has never spoken a lie in his life, whispers it so quietly that Drona cannot hear clearly. But he hears enough.'},
    {type:'narrator', text:'Dronacharya, believing his son is dead, lowers his weapons. In that moment of grief, he is cut down.'},
    {type:'drona', text:'Student. Today you do not play as the Pandavas. You play as the Kauravas. You play as my side. This is the hardest lesson I teach — to understand the opponent so completely that you can play as them. Only then do you truly know the Ashtāpada.'},
    {type:'narrator', text:'You command the Kaurava forces. Capture the Pandava Raja. The Pandavas play at ELO-900 strength. This is the highest difficulty outside of Day 18.'}
  ],
  winCondition:'You play as the Kauravas (♟ bottom). Capture the Pandava Raja (♚ top) against ELO-900 resistance.',
  winType:'capture-king',
  humanPlayer:1,
  boardState:{
    // Pandavas (player 0 = bot) — strong centre
    'e8':'0:king','a8':'0:rook','h8':'0:rook',
    'b8':'0:horse','g8':'0:horse',
    'c8':'0:elephant','f8':'0:elephant',
    'a7':'0:pawn','b7':'0:pawn','c7':'0:pawn','d7':'0:pawn',
    'e7':'0:pawn','f7':'0:pawn','g7':'0:pawn','h7':'0:pawn',
    // Kauravas (player 1 = human) — full army
    'e1':'1:king','a1':'1:rook','h1':'1:rook',
    'b1':'1:horse','g1':'1:horse',
    'c1':'1:elephant','f1':'1:elephant',
    'a2':'1:pawn','b2':'1:pawn','c2':'1:pawn','d2':'1:pawn',
    'e2':'1:pawn','f2':'1:pawn','g2':'1:pawn','h2':'1:pawn'
  },
  botPlayer:0, botAggression:'strategic',
  liveCommentary:{
    'game-start':['You command the Kauravas. The Pandava bot plays at full strength. To defeat the Pandavas, you must think as Drona himself taught — formation, patience, and the single decisive strike.'],
    'rook-moved':['The Kaurava Ratha advances. Open files belong to whoever controls them — establish dominance.'],
    'horse-moved':['Kaurava cavalry to the flank. The Pandavas will answer — anticipate the response.'],
    'capture':['A Pandava piece falls to the Kauravas! The Mahabharata runs both directions on the Ashtāpada.','The Kaurava assault finds its mark. Can you reach the Pandava Raja before they reach yours?'],
    'lose-piece':['The Pandava bot is relentless at ELO-900. Every piece lost must be answered with two enemy pieces threatened.'],
    'raja-threatened':['The Pandava bot targets your Kaurava Raja! Even playing the enemy side, the Raja must be protected.'],
    'win':['THE PANDAVA RAJA FALLS. You played as the Kauravas and defeated the Pandavas. This is the deepest knowledge on the Ashtāpada — to understand both sides equally.'],
    'lose':['The Kauravas are defeated again. The Pandava bot at ELO-900 is as close to Arjuna as the Ashtāpada can generate. Return and study how the bot attacked — that is how you should have attacked.']
  },
  result:{
    win:{
      icon:'⚖️', tier:'Both Sides Known', tierClass:'tier-victory',
      outcome:'Pandavas Defeated — Playing as Kauravas',
      desc:"You commanded the Kaurava forces to victory against ELO-900 resistance. Drona's deepest lesson — know the enemy as well as yourself — is mastered.",
      dronaQuote:"The student who can play both sides of the Ashtāpada with equal skill has understood everything I teach. You played as my enemy today and won. I do not know whether to grieve or celebrate.",
      dronaVerse:'— Drona Parva, Mahabharata'
    },
    lose:{
      icon:'🏳', tier:'Fallen', tierClass:'tier-fallen',
      outcome:'Kauravas Defeated',
      desc:"The Pandava bot at ELO-900 outplayed the Kaurava position. The lesson is not lost — study how the bot's pieces coordinated from the other side.",
      dronaQuote:'You now know what it feels like to face the Pandavas from the other side. Take that knowledge back to your own side. Return.',
      dronaVerse:'— Drona Parva, Mahabharata'
    }
  }
},

day16: {
  id:'day16', day:16,
  title:'Karna Commands',
  commander:'Karna, son of Surya the Sun God',
  difficulty:'Very Hard', elo:900,
  badge:'',
  unlocked:false,
  sub:"The Kaurava's greatest warrior commands — defeat him to break their spirit",
  cutscene:[
    {type:'narrator', text:'Day 16. After Drona falls, Karna takes command. Karna — born to Kunti before her marriage, raised as a charioteer\'s son, denied entry to the Brahmin academies, given armour at birth by the Sun God himself.'},
    {type:'narrator', text:'Karna is, by many accounts, equal to Arjuna in skill. He fights under a curse that will cause his chariot wheel to sink at the critical moment. But that moment has not come yet.'},
    {type:'drona', text:'Student. Karna is the tragedy of the Mahabharata. He fights on the wrong side for reasons of loyalty, not dharma. On the Ashtāpada, we do not judge — we calculate. And Karna calculates at ELO-900.'},
    {type:'narrator', text:'Defeat Karna\'s forces in open battle. He commands the Kaurava army on Day 16. No special rules — pure strength against strength.'}
  ],
  winCondition:"Capture Karna's Raja (♚) in open battle. ELO-900 strength — Karna fights without constraint.",
  winType:'capture-king',
  boardState:{
    // Pandava — aggressive open setup
    'e1':'0:king','a1':'0:rook','h1':'0:rook',
    'b1':'0:horse','g1':'0:horse',
    'c1':'0:elephant','f1':'0:elephant',
    'a2':'0:pawn','b2':'0:pawn','c2':'0:pawn','d2':'0:pawn',
    'e2':'0:pawn','f2':'0:pawn','g2':'0:pawn','h2':'0:pawn',
    // Karna's forces — asymmetric aggressive formation
    'e8':'1:king',
    'a8':'1:rook','h8':'1:rook',
    'c8':'1:horse','f8':'1:horse',
    'b8':'1:elephant','g8':'1:elephant',
    'b7':'1:pawn','c7':'1:pawn','d7':'1:pawn',
    'e6':'1:pawn','f7':'1:pawn','g7':'1:pawn','h7':'1:pawn',
    'd8':'1:pawn'
  },
  humanPlayer:0,
  botPlayer:1, botAggression:'strategic',
  liveCommentary:{
    'game-start':["Karna commands. He fights without a chariot wheel curse today — full strength, full skill. This is the battle Arjuna feared most on Day 17. Defeat him today."],
    'rook-moved':['The Ratha opens the file. Karna will mirror the aggression — be ready.'],
    'horse-moved':['Cavalry to the flank. Karna\'s Ashwas are positioned to answer every cavalry move — anticipate the counter.'],
    'capture':["A Kaurava piece falls! Karna's forces absorb the loss and press harder — he does not yield.","Material captured. But Karna calculates deeper than material — watch for the positional counter-strike."],
    'lose-piece':["Karna's precision strikes. He fights like a combination of Bhishma and Drona — power and calculation together."],
    'raja-threatened':["Karna has found your Raja! This is how he broke the Pandava left flank. Protect the king immediately."],
    'win':["KARNA'S FORCES DEFEATED. The Sun God's son falls on Day 16. This is the preparation Arjuna needed for the fateful encounter on Day 17."],
    'lose':["Karna wins today. He is, on pure ability, equal to Arjuna. Study his piece coordination — he never moves a piece without it serving two purposes simultaneously. Return."]
  },
  result:{
    win:{
      icon:'☀️', tier:"Karna Defeated", tierClass:'tier-victory',
      outcome:"The Sun God's Son Falls",
      desc:"Karna's forces defeated in open battle. Without his chariot curse, without his armour stripped, on pure skill — the Pandava position prevailed.",
      dronaQuote:"Karna without his divine armour, without his curse, in pure open battle — you defeated him. Arjuna would struggle to say this. You have surpassed Day 16.",
      dronaVerse:'— Karna Parva, Mahabharata'
    },
    lose:{
      icon:'🏳', tier:'Fallen', tierClass:'tier-fallen',
      outcome:"Karna Commands the Ashtāpada",
      desc:"Karna's positional mastery overwhelmed the Pandava position. Study how his pieces created threats on two wings simultaneously — that is his method.",
      dronaQuote:"Karna fights on two fronts at once. Every piece he moves threatens something on the opposite side of the board. Find that dual-threat pattern and you will find the counter.",
      dronaVerse:'— Karna Parva, Mahabharata'
    }
  }
},

day17: {
  id:'day17', day:17,
  title:"Karna's Wheel Sinks",
  commander:'Arjuna, son of Indra',
  difficulty:'Very Hard', elo:950,
  badge:'',
  unlocked:false,
  sub:'Exploit the single moment of vulnerability — the wheel sinks on move 7',
  cutscene:[
    {type:'narrator', text:'Day 17. The battle between Arjuna and Karna has been raging for hours, equal blow for equal blow. Then it happens — Karna\'s chariot wheel sinks into the earth. His charioteer cannot free it.'},
    {type:'narrator', text:'Karna steps down from his chariot to lift the wheel with his bare hands. In that moment, his concentration breaks. His weapons are grounded. He calls out to Arjuna: "Wait — the laws of war forbid striking a man on the ground."'},
    {type:'drona', text:'Student. Krishna reminds Arjuna: "Did the laws of war prevent them from killing Abhimanyu? Did they prevent them from breaking every rule at Draupadi\'s humiliation?" Arjuna draws his bow.'},
    {type:'narrator', text:'The scenario: Karna\'s bot strength drops to passive on move 7 for exactly 3 moves — the wheel is stuck. That is your window. Outside of those 3 moves, he fights at ELO-950.'}
  ],
  winCondition:"Capture Karna's Raja (♚) within 16 moves. His bot weakens to passive on moves 7–9 — the wheel is stuck. Use the window.",
  winType:'capture-king',
  specialRule:'karna-wheel',
  karnaWindowStart:7,
  karnaWindowEnd:9,
  boardState:{
    // Arjuna — strong position after 16 days of war, some pieces traded
    'e1':'0:king','a1':'0:rook','h1':'0:rook',
    'g1':'0:horse','c1':'0:elephant','f1':'0:elephant',
    'b2':'0:pawn','c2':'0:pawn','d2':'0:pawn',
    'e3':'0:pawn','f2':'0:pawn','g2':'0:pawn',
    // Karna — slightly weaker after day 16 fighting
    'e8':'1:king','a8':'1:rook',
    'f8':'1:horse','b8':'1:elephant',
    'b7':'1:pawn','c7':'1:pawn','d6':'1:pawn',
    'f7':'1:pawn','g7':'1:pawn','h7':'1:pawn',
    'e7':'1:pawn'
  },
  humanPlayer:0,
  botPlayer:1, botAggression:'strategic',
  liveCommentary:{
    'game-start':["Day 17. Karna fights at full strength. Six moves before the wheel sinks — position yourself. When it happens, you will have three moves to strike."],
    'rook-moved':['The Ratha positions for the decisive strike. Two more moves before the wheel sinks — every square matters.'],
    'horse-moved':['The Ashwa moves toward the window. When the wheel sinks, the Ashwa must already be in fork range.'],
    'capture':["A piece falls. Karna absorbs it — he is at full strength until move 7. Build the attack, don't celebrate yet."],
    'lose-piece':["Karna strikes. He is at ELO-950 right now — respect every threat until the wheel sinks."],
    'raja-threatened':["Karna targets your Raja! Protect it — you cannot use the window if your Raja falls first."],
    'win':["KARNA FALLS. The wheel that sank into the earth at Kurukshetra has sunk on the Ashtāpada too. Arjuna's arrow found its mark in the window of three moves. The eighteenth day is now inevitable."],
    'lose':["Karna survived the window. Either you did not use moves 7–9 to strike, or your attack was not positioned before the wheel sank. Return and prepare the decisive blow before move 7."]
  },
  result:{
    win:{
      icon:'⚡', tier:"The Window Used", tierClass:'tier-victory',
      outcome:"Karna Falls — The Wheel Decided It",
      desc:"Karna's Raja captured within the window of the sinking wheel. Three moves, positioned perfectly before the wheel sank — the Pandava victory that made Day 18 possible.",
      dronaQuote:"The wheel sinks and the warrior must choose: wait for fair terms, or remember Abhimanyu. Arjuna remembered. You played as he did. The window was used.",
      dronaVerse:'— Karna Parva, Mahabharata'
    },
    lose:{
      icon:'🏳', tier:'Window Missed', tierClass:'tier-fallen',
      outcome:"Karna Survived the Wheel",
      desc:"The three-move window on moves 7–9 passed without a decisive strike. Karna recovered and the position could not be recovered.",
      dronaQuote:"The window was three moves. You needed your pieces positioned before it opened — not during it. Before. Return and count backwards from move 7.",
      dronaVerse:'— Karna Parva, Mahabharata'
    }
  }
},

// ── END OF DAYS 14–17 ────────────────────────────────────────────────────────


// ── UPDATED ALL_DAYS ENTRIES for days 14–17 ──────────────────────────────────
// Replace the 4 locked day entries in ALL_DAYS with these:
/*
  {day:14, title:"Arjuna's Fury",          sub:'Capture Jayadratha before sunset',       unlocked:false, scenId:'day14'},
  {day:15, title:"Drona's Death",           sub:'Play the enemy side for the first time', unlocked:false, scenId:'day15'},
  {day:16, title:'Karna Commands',          sub:"The Kaurava's strongest warrior",        unlocked:false, scenId:'day16'},
  {day:17, title:"Karna's Wheel Sinks",     sub:'Exploit the moment of vulnerability',    unlocked:false, scenId:'day17'},
*/


// ── WIN CONDITION + SPECIAL RULE ADDITIONS ────────────────────────────────────
// Add inside executeMove() after existing winType checks:
/*

// moves-limit for capture-king (Day 14 — sunset rule)
if (G.scenario.winType === 'capture-king' && G.scenario.movesLimit) {
  const humanMoves = G.moveHistory ? G.moveHistory.filter(m => m.playerId === G.scenario.humanPlayer).length : G.turnCount;
  if (humanMoves >= G.scenario.movesLimit) { endGame('lose'); return; }
}

*/

// Add inside doBotTurn() at the top, to handle Karna's wheel and Day 10 passive window:
/*

// Day 17 — Karna's wheel: passive during window turns
let effectiveAggression = G.scenario.botAggression;
if (G.scenario.specialRule === 'karna-wheel') {
  const humanMoves = G.turnCount; // approximate half-turn count
  if (humanMoves >= G.scenario.karnaWindowStart && humanMoves <= G.scenario.karnaWindowEnd) {
    effectiveAggression = 'passive';
    addCommentary("Karna's chariot wheel is stuck in the earth — three moves of vulnerability!", 'warning');
  }
}
// Day 10 — bot passive for first 5 human turns
if (G.scenario.specialRule === 'bot-passive-first-5' && G.turnCount < 10) {
  effectiveAggression = 'passive';
}
const move = botGetMove(G.board, sc.botPlayer, forcedPiece, effectiveAggression);

*/


// ── PLAYER COLOUR OVERRIDE FOR DAY 15 ────────────────────────────────────────
// Day 15 has humanPlayer:1 (Kauravas at the bottom, player index 1).
// In beginBattle(), the board rendering uses PCOLOR[piece.owner].
// PCOLOR is currently ['#e74c3c','#60a5fa'] — red=0, blue=1.
// Day 15 will render correctly: human plays blue (bottom), bot plays red (top).
// No code change needed — the humanPlayer:1 field handles it automatically
// since onSquareClick checks piece.owner === G.scenario.humanPlayer.
