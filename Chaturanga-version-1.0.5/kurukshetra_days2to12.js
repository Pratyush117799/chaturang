/**
 * Chaturanga v1.0.5 — Kurukshetra Campaign
 * Days 2–12 Scenario Data
 * ═══════════════════════════════════════════════════════════════════
 *
 * HOW TO INTEGRATE:
 * In kurukshetra.html, find the SCENARIOS object (around line 408).
 * After the closing brace of day1: { ... }, and before day13: { ... },
 * paste ALL of the scenario objects below.
 *
 * Also update ALL_DAYS (around line 780) — replace the 15 locked entries
 * with the updated array at the bottom of this file.
 * ═══════════════════════════════════════════════════════════════════
 */

// ── PASTE INSIDE SCENARIOS = { ... } ────────────────────────────────────────

day2: {
  id:'day2', day:2,
  title:'Garuda vs Krauncha',
  commander:'Bhishma Pitamaha, Grandsire of the Kurus',
  difficulty:'Beginner', elo:200,
  badge:'',
  unlocked:false, // unlocked after Day 1 complete
  sub:'Formation duel — the eagle against the heron',
  cutscene:[
    {type:'narrator', text:'Day 2. Bhishma, the greatest warrior of his age, arranges the Kaurava forces in the Garuda Vyuha — the eagle formation, wings spread wide across the battlefield.'},
    {type:'narrator', text:'Yudhishthira answers with the Krauncha Vyuha — the heron formation, a slender spear aimed at the eagle\'s heart. Two ancient formations face each other at dawn.'},
    {type:'drona', text:'Student. A formation is not merely arrangement — it is intention made visible. The Garuda attacks along the flanks simultaneously. The Krauncha strikes through the centre. Watch how one formation breaks the other.'},
    {type:'narrator', text:'Your objective is precise: break the Garuda formation by capturing Bhishma\'s two flank Rathas before he can pin your centre.'}
  ],
  winCondition:'Capture both enemy Rathas (♜♜) to break the Garuda formation. The centre must hold.',
  winType:'capture-both-rooks',
  boardState:{
    // Krauncha (heron) — human: narrow column with Ratha tip
    'd1':'0:king','c1':'0:horse','e1':'0:horse',
    'd2':'0:rook','c2':'0:pawn','e2':'0:pawn',
    'd3':'0:elephant','d4':'0:pawn',
    // Garuda (eagle) — bot: wide wings
    'a8':'1:rook','h8':'1:rook',
    'b8':'1:horse','g8':'1:horse',
    'a7':'1:pawn','b7':'1:pawn','g7':'1:pawn','h7':'1:pawn',
    'c8':'1:elephant','f8':'1:elephant',
    'd8':'1:king','e8':'1:pawn'
  },
  humanPlayer:0,
  botPlayer:1, botAggression:'aggressive',
  liveCommentary:{
    'game-start':['Two formations face each other at Kurukshetra. Strike the wings of the Garuda before it closes around your centre.'],
    'rook-moved':['The Ratha thrusts through the Krauncha\'s beak. This is the formation\'s strength — use it.','File control. The Ratha\'s power is in the open file. Push forward.'],
    'horse-moved':['The cavalry leaps to the flank — disrupting the Garuda\'s wing coordination.'],
    'capture':['A Garuda wing piece falls! The formation weakens.','The eagle loses a feather. Press the advantage before it reforms.'],
    'lose-piece':['The Garuda\'s flank piece strikes your centre. Do not let the wings close behind you.'],
    'raja-threatened':['Your Raja is in the crossfire of the formation! Break out immediately.'],
    'win':['BOTH RATHAS CAPTURED. The Garuda Vyuha is broken. Bhishma\'s formation collapses — the heron\'s strike was true.'],
    'lose':['The Garuda\'s wings have closed. Your centre is crushed. Study how Bhishma deployed his flanks — that is the lesson of Day 2.']
  },
  result:{
    win:{
      icon:'🦅', tier:'Formation Victor', tierClass:'tier-victory',
      outcome:'Garuda Vyuha Broken',
      desc:'Both of Bhishma\'s flank Rathas are captured. The eagle formation collapses inward, and the heron\'s strike proves decisive.',
      dronaQuote:'You understood it. The formation is only as strong as its extremities. Break the wings and the body falls. Bhishma himself would acknowledge this attack.',
      dronaVerse:'— Bhishma Parva, Mahabharata'
    },
    lose:{
      icon:'🏳', tier:'Fallen', tierClass:'tier-fallen',
      outcome:'The Garuda Closed Its Wings',
      desc:'Bhishma\'s flanks closed around your centre. Study how the Garuda spreads — then find where it is thin.',
      dronaQuote:'A formation is a pattern. Every pattern has a weakness. You did not find Garuda\'s today. Return — it will reveal itself.',
      dronaVerse:'— Bhishma Parva, Mahabharata'
    }
  }
},

day3: {
  id:'day3', day:3,
  title:'The Left Flank Holds',
  commander:'Satyaki, the Vrishni warrior',
  difficulty:'Beginner', elo:250,
  badge:'',
  unlocked:false,
  sub:'Survive Bhishma\'s assault on the left flank',
  cutscene:[
    {type:'narrator', text:'Day 3. Bhishma pushes his assault to the Pandava left flank, seeking to roll it up before Arjuna can respond. Satyaki, the great Vrishni warrior, is assigned to hold.'},
    {type:'drona', text:'Holding ground is the hardest discipline on the Ashtāpada, student. It is not aggressive — it is absolute. You must not let a single enemy piece cross to your side of the board.'},
    {type:'narrator', text:'Bhishma himself leads a cavalry charge. Your Rathas must anchor. Your Ashwas must intercept. Twelve moves — hold the line.'}
  ],
  winCondition:'Survive 12 moves without losing your Ratha. Hold the left flank.',
  winType:'survival-rook',
  survivalTarget:12,
  survivalTiers:[
    {moves:12, tier:'Iron Flank', tierClass:'tier-victory', icon:'🛡',
     outcome:'The Left Flank Holds',
     desc:'Twelve moves, Ratha intact. Bhishma\'s assault is repelled. Satyaki\'s line never broke.',
     dronaQuote:'This is the art the Arthashastra calls Sthira — steadiness. You did not attack. You did not retreat. You held. That is often harder than winning.',
     dronaVerse:'— Kautilya, Arthashastra Book X'},
    {moves:8, tier:'Honourable Defence', tierClass:'tier-honorable', icon:'⚔',
     outcome:'Partial Hold',
     desc:'Eight moves held — Bhishma made ground, but the flank did not collapse entirely.',
     dronaQuote:'You bent but did not break. In battle that is sometimes enough. But twelve was the target — return and find the two moves you lost.',
     dronaVerse:'— Bhishma Parva, Mahabharata'},
    {moves:0, tier:'Fallen', tierClass:'tier-fallen', icon:'🏳',
     outcome:'The Flank Collapsed',
     desc:'Bhishma broke through. The Ratha fell too soon.',
     dronaQuote:'You forgot the first rule of defence: the piece that must not fall cannot be moved carelessly. Return to the position — it was defensible.',
     dronaVerse:'— Arthashastra, Book IX'}
  ],
  boardState:{
    // Human — left flank anchor
    'a1':'0:rook','b1':'0:horse','c1':'0:elephant',
    'a2':'0:pawn','b2':'0:pawn','c2':'0:pawn','d2':'0:pawn',
    'e1':'0:king',
    // Bot — right-side assault force
    'h8':'1:rook','g8':'1:horse','f8':'1:horse',
    'h7':'1:pawn','g7':'1:pawn','f7':'1:pawn','e7':'1:pawn',
    'h6':'1:elephant','d8':'1:king'
  },
  humanPlayer:0,
  botPlayer:1, botAggression:'aggressive',
  liveCommentary:{
    'game-start':['Bhishma\'s cavalry approaches the left flank. Protect your Ratha at all costs — it must still stand at move 12.'],
    'rook-moved':['The anchor moves — carefully. Do not expose it to the cavalry charge.'],
    'horse-moved':['The Ashwa intercepts. Good — cavalry meets cavalry.'],
    'capture':['An enemy piece falls on the flank. But do not relax — Bhishma has reserves.'],
    'lose-piece':['A piece is lost. The pressure increases. Focus on the Ratha\'s safety.'],
    'raja-threatened':['Your Raja is caught in the assault! This is a two-front threat — respond carefully.'],
    'win':['THE FLANK HOLDS. Twelve moves and your Ratha stands. Bhishma\'s assault is spent. Satyaki would be proud.'],
    'lose':['The Ratha has fallen. Bhishma broke through. Return and find the move where you lost the anchor.']
  }
},

day4: {
  id:'day4', day:4,
  title:"Abhimanyu's First Strike",
  commander:'Abhimanyu, son of Arjuna',
  difficulty:'Easy', elo:300,
  badge:'',
  unlocked:false,
  sub:'Ratha hunt — capture three enemy chariots',
  cutscene:[
    {type:'narrator', text:'Day 4. The young Abhimanyu, barely sixteen, is given his first independent command. Three Kaurava Rathas have broken through the right flank and threaten to encircle the Pandava position.'},
    {type:'drona', text:'Student — today you are Abhimanyu. Not the boy of Day 13 trapped inside the Chakravyuha. The Abhimanyu of Day 4 — young, furious, and attacking. He hunts Rathas the way his father hunts armies.'},
    {type:'narrator', text:'Three enemy Rathas must be captured to stop the encirclement. Abhimanyu has one request: make it quick.'}
  ],
  winCondition:"Capture all 3 enemy Rathas (♜♜♜) before they encircle your position.",
  winType:'capture-n-pieces',
  winPieceType:'rook',
  winPieceCount:3,
  boardState:{
    // Human — Abhimanyu's strike force
    'e4':'0:king','d4':'0:rook','f4':'0:rook',
    'c3':'0:horse','g3':'0:horse',
    'd3':'0:pawn','e3':'0:pawn','f3':'0:pawn',
    // Bot — three Rathas encircling
    'a6':'1:rook','h6':'1:rook','d6':'1:rook',
    'b8':'1:king','c7':'1:pawn','g7':'1:pawn',
    'b7':'1:horse','g6':'1:horse'
  },
  humanPlayer:0,
  botPlayer:1, botAggression:'aggressive',
  liveCommentary:{
    'game-start':['Three enemy Rathas threaten the flank. Hunt them down before they complete the encirclement, Abhimanyu.'],
    'rook-moved':['The Ratha charges forward. This is Abhimanyu\'s weapon — fast, direct, lethal.'],
    'horse-moved':['The Ashwa cuts across. Use it to drive the enemy Rathas into exposed positions.'],
    'capture':['A Ratha falls to Abhimanyu! The encirclement weakens.','One chariot destroyed. Two remain — keep the pressure on.'],
    'lose-piece':['The enemy strikes back. But Abhimanyu does not slow down.'],
    'raja-threatened':['Your Raja is caught between two Rathas! Break out — do not let the encirclement close.'],
    'win':['ALL THREE RATHAS CAPTURED. The encirclement is broken. Abhimanyu\'s assault is complete — the chronicles will record this day.'],
    'lose':['The encirclement closed. Abhimanyu was outmanoeuvred today. Study how the three Rathas coordinated — and plan your counter for next time.']
  },
  result:{
    win:{
      icon:'⚔', tier:'Ratha Hunter', tierClass:'tier-victory',
      outcome:"Abhimanyu's Ratha Hunt Complete",
      desc:'Three Kaurava chariots captured. The encirclement is broken and the Pandava right flank is secure.',
      dronaQuote:'Three Rathas. Most warriors would be satisfied to capture one in a battle. You hunted all three with the instinct of your father. Arjuna\'s blood runs true.',
      dronaVerse:'— Drona Parva, Mahabharata'
    },
    lose:{
      icon:'🏳', tier:'Fallen', tierClass:'tier-fallen',
      outcome:'The Encirclement Closed',
      desc:'The three Rathas coordinated to close the trap. Return and find the order in which to hunt them.',
      dronaQuote:'Three targets moving simultaneously — this requires sequencing, not instinct. Calculate the order before the first move. Return.',
      dronaVerse:'— Arthashastra, Book IX'
    }
  }
},

day5: {
  id:'day5', day:5,
  title:"Bhima's Fury",
  commander:'Bhima, son of Vayu',
  difficulty:'Easy', elo:350,
  badge:'',
  unlocked:false,
  sub:'Assault the Kaurava right flank with overwhelming force',
  cutscene:[
    {type:'narrator', text:'Day 5. Bhima, son of the Wind God, is assigned the Kaurava right flank. He is not a subtle man. He does not use formations. He uses fury.'},
    {type:'drona', text:'Bhima\'s method is the hammer, student. He moves forward. He captures everything in his path. He does not retreat. Today you play as the hammer.'},
    {type:'narrator', text:'Capture as many enemy pieces as possible in 15 moves. Material advantage is everything on this day. There is no time for subtlety.'}
  ],
  winCondition:'Capture 6 or more enemy pieces within 15 moves to win by material advantage.',
  winType:'material-threshold',
  materialTarget:6,
  movesLimit:15,
  boardState:{
    'a1':'0:rook','b1':'0:horse','c1':'0:elephant',
    'a2':'0:pawn','b2':'0:pawn','c2':'0:pawn','d2':'0:pawn','e2':'0:pawn',
    'd1':'0:king','e1':'0:rook',
    'a8':'1:rook','b8':'1:horse','c8':'1:elephant','d8':'1:king','e8':'1:rook',
    'a7':'1:pawn','b7':'1:pawn','c7':'1:pawn','d7':'1:pawn','e7':'1:pawn',
    'f7':'1:pawn','g7':'1:pawn','h7':'1:pawn',
    'f8':'1:elephant','g8':'1:horse','h8':'1:rook'
  },
  humanPlayer:0,
  botPlayer:1, botAggression:'passive',
  liveCommentary:{
    'game-start':['Bhima does not wait. He strikes immediately. Six pieces must fall to the hammer — move forward and do not stop.'],
    'capture':['BHIMA STRIKES! Another piece falls.','The hammer falls. This is how Bhima fights — relentless, unstoppable.'],
    'lose-piece':['A piece is lost. Bhima does not care. He takes two for every one lost.'],
    'raja-threatened':['Even Bhima protects his Raja. Secure the king and continue the assault.'],
    'win':['SIX PIECES CAPTURED. Bhima\'s fury has overwhelmed the Kaurava right flank. The material advantage is decisive.'],
    'lose':['Bhima\'s assault fell short. You needed six pieces — press forward harder from the first move.']
  },
  result:{
    win:{
      icon:'💥', tier:"Bhima's Fury", tierClass:'tier-victory',
      outcome:'Material Victory',
      desc:'Six or more Kaurava pieces captured in fifteen moves. The right flank is destroyed.',
      dronaQuote:'Bhima does not win with elegance. He wins with inevitability. You played like him today — forward, relentless, and correct.',
      dronaVerse:'— Bhima Parva, Mahabharata'
    },
    lose:{
      icon:'🏳', tier:'Fallen', tierClass:'tier-fallen',
      outcome:'Assault Stalled',
      desc:'The material target was not reached in time. Bhima\'s method requires commitment from move one.',
      dronaQuote:'You hesitated. Bhima never hesitates. Forward — every move must capture or threaten capture. Return.',
      dronaVerse:'— Kautilya, Arthashastra Book X'
    }
  }
},

day6: {
  id:'day6', day:6,
  title:'Drona Takes the Vanguard',
  commander:'Yudhishthira, son of Dharma',
  difficulty:'Medium', elo:450,
  badge:'',
  unlocked:false,
  sub:'Adapt to the formation change mid-battle',
  cutscene:[
    {type:'narrator', text:'Day 6. After Bhishma\'s assault, Dronacharya himself takes the Kaurava vanguard. He changes formation mid-battle — a tactic the Pandavas have not seen before.'},
    {type:'drona', text:'I must warn you, student — and also teach you. On this day I command the enemy. Observe what I do. I change from the Makara formation to the Suchi formation mid-battle. One is wide. One is a needle. Watch how your defence must adapt.'},
    {type:'narrator', text:'The objective is simple to say and hard to achieve: survive both formation phases and capture Drona\'s forward Ratha.'}
  ],
  winCondition:"Capture Drona's forward Ratha (♜) and survive both formation phases.",
  winType:'capture-piece',
  winPieceType:'rook',
  winPlayer:1,
  boardState:{
    // Human — flexible central position
    'e1':'0:king','d1':'0:rook','f1':'0:rook',
    'd2':'0:pawn','e2':'0:pawn','f2':'0:pawn',
    'c2':'0:horse','g2':'0:horse','c1':'0:elephant','g1':'0:elephant',
    // Drona's Makara (crocodile) spreading to Suchi (needle)
    'e8':'1:rook','d8':'1:king',
    'c8':'1:horse','g8':'1:horse',
    'b7':'1:pawn','c7':'1:pawn','d7':'1:pawn','e7':'1:pawn','f7':'1:pawn',
    'b8':'1:elephant','f8':'1:elephant'
  },
  humanPlayer:0,
  botPlayer:1, botAggression:'strategic',
  liveCommentary:{
    'game-start':['Dronacharya himself commands today. He will shift his formation mid-battle — watch for the change and adapt immediately.'],
    'rook-moved':['The Ratha advances toward Drona\'s position. The forward chariot is the target — but the formation protects it.'],
    'horse-moved':['The cavalry cuts through the formation gap. Well spotted.'],
    'capture':['A piece falls from Drona\'s formation! He will reform — do not let him.'],
    'lose-piece':['Drona takes a piece. This is his art — the formation creates the capture opportunity. Counter-adapt.'],
    'raja-threatened':['Drona\'s needle formation is pointing at your Raja! Break the line immediately.'],
    'win':['DRONA\'S RATHA CAPTURED. The formation change was anticipated and countered. Even the teacher is impressed today.'],
    'lose':['Drona\'s formation change broke your defence. Return and identify the moment the Suchi needle pointed at your position — that was when the response was needed.']
  },
  result:{
    win:{
      icon:'📜', tier:'Student Surpasses Master', tierClass:'tier-victory',
      outcome:"Drona's Formation Broken",
      desc:"The forward Ratha captured, both formation phases survived. Drona's mid-battle tactic was read and countered.",
      dronaQuote:'I teach so that my students can defeat me. Today you came close. The day a student fully surpasses his teacher is the teacher\'s greatest achievement.',
      dronaVerse:'— Adi Parva, Mahabharata'
    },
    lose:{
      icon:'🏳', tier:'Fallen', tierClass:'tier-fallen',
      outcome:'Formation Change Overwhelmed',
      desc:"Drona's Suchi needle pierced your defence. Study the exact move where the formation shifted.",
      dronaQuote:'Every formation announces itself one move before it strikes. You missed the announcement. Return and find it.',
      dronaVerse:'— Drona Parva, Mahabharata'
    }
  }
},

day7: {
  id:'day7', day:7,
  title:"Satyaki's Cavalry Surge",
  commander:'Satyaki, the Vrishni hero',
  difficulty:'Medium', elo:500,
  badge:'',
  unlocked:false,
  sub:'Alliance combo — Horse and Ratha coordinate to break the centre',
  cutscene:[
    {type:'narrator', text:'Day 7. Satyaki leads a combined cavalry and chariot surge directly through the Kaurava centre — a textbook combination attack that the military treatises call Dvandva Astra, the twin weapon.'},
    {type:'drona', text:'Student. Today the lesson is combination. One piece attacks. The enemy defends. The second piece captures what the defence created. A Horse forks — a Ratha takes the forked piece. This is not luck. This is calculation two moves ahead.'},
    {type:'narrator', text:'Execute three combination moves — fork with the Ashwa, capture with the Ratha — to win this day.'}
  ],
  winCondition:'Execute 2 Ashwa fork combinations (Horse threatens two pieces, Ratha captures one) to achieve material superiority.',
  winType:'combination-forks',
  forksRequired:2,
  boardState:{
    'e1':'0:king','c1':'0:rook','g1':'0:rook',
    'b1':'0:horse','f1':'0:horse',
    'c2':'0:pawn','d2':'0:pawn','e2':'0:pawn','f2':'0:pawn','g2':'0:pawn',
    'a8':'1:king','h8':'1:rook',
    'b8':'1:horse','g8':'1:horse',
    'a7':'1:pawn','b7':'1:pawn','c7':'1:pawn','d7':'1:pawn',
    'e7':'1:pawn','f7':'1:pawn','g7':'1:pawn','h7':'1:pawn',
    'c8':'1:elephant','f8':'1:elephant'
  },
  humanPlayer:0,
  botPlayer:1, botAggression:'passive',
  liveCommentary:{
    'game-start':['Satyaki\'s cavalry surges forward. Use the Ashwa to create forks — then follow with the Ratha. Two combinations will break the Kaurava centre.'],
    'horse-moved':['The Ashwa leaps! Check the squares it now threatens — is there a fork available?','Cavalry forward. Look for two enemy pieces in the knight\'s reach simultaneously.'],
    'rook-moved':['The Ratha follows the cavalry. Is it pointing at the piece the Ashwa forked?'],
    'capture':['A combination lands! The fork worked — the Ratha takes the exposed piece.','Combination executed. One down — look for the second fork opportunity.'],
    'lose-piece':['A piece is lost. Refocus — the combination requires the Ashwa to move first, not the Ratha.'],
    'raja-threatened':['Your Raja is caught in the counter-attack! Secure it before the next combination.'],
    'win':['TWO COMBINATIONS EXECUTED. Satyaki\'s surge is complete — the Kaurava centre is broken by the twin weapon.'],
    'lose':['The combinations did not land. Return and place the Ashwa on the square that threatens two enemy pieces simultaneously — that is where the fork begins.']
  },
  result:{
    win:{
      icon:'♞', tier:'Dvandva Astra', tierClass:'tier-victory',
      outcome:'Twin Weapon Mastered',
      desc:'Two fork combinations executed. The Ashwa and Ratha acting in concert — the Kaurava centre could not defend both threats simultaneously.',
      dronaQuote:'The combination is the purest art on the Ashtāpada. You attacked two things at once and took one. Then you did it again. This is the Dvandva Astra.',
      dronaVerse:'— Arthashastra, Book IX'
    },
    lose:{
      icon:'🏳', tier:'Fallen', tierClass:'tier-fallen',
      outcome:'Combination Incomplete',
      desc:'The fork combinations did not materialise. The Ashwa must land on the correct square to threaten two pieces simultaneously.',
      dronaQuote:'The fork requires one thing: the enemy must not be able to save both pieces at once. Find that square. It exists in every position.',
      dronaVerse:'— Kautilya, Arthashastra Book IX'
    }
  }
},

day8: {
  id:'day8', day:8,
  title:'The Kurma Vyuha',
  commander:'Yudhishthira, son of Dharma',
  difficulty:'Medium', elo:550,
  badge:'',
  unlocked:false,
  sub:'Survive 15 moves inside the tortoise formation',
  cutscene:[
    {type:'narrator', text:'Day 8. Dronacharya deploys the Kurma Vyuha — the tortoise formation. Every piece locked into a defensive shell, covering every square around the Raja. It is nearly impenetrable.'},
    {type:'drona', text:'Student. The Kurma Vyuha is not meant to be broken by force. It is meant to make the attacker exhaust himself. Your task today is not to break it — your task is to survive inside the pressure it creates for fifteen moves.'},
    {type:'narrator', text:'Fifteen moves. Hold your Raja inside the formation\'s pressure. Do not let them capture it.'}
  ],
  winCondition:'Survive 15 moves without losing your Raja. The Kurma Vyuha tightens every turn.',
  winType:'survival',
  survivalTiers:[
    {moves:15, tier:'Tortoise Outlasted', tierClass:'tier-victory', icon:'🐢',
     outcome:'The Kurma Vyuha is exhausted',
     desc:'Fifteen moves survived. Yudhishthira held his formation under full Kurma Vyuha pressure. The tortoise ran out of time.',
     dronaQuote:'The Kurma Vyuha is designed to crush patience. You had more patience than the formation itself. Yudhishthira would approve — this is Dharmic steadiness.',
     dronaVerse:'— Bhishma Parva, Mahabharata'},
    {moves:10, tier:'Resilient', tierClass:'tier-honorable', icon:'🛡',
     outcome:'Partial Survival',
     desc:'Ten moves held against the Kurma Vyuha — more than most warriors manage. Study the last five moves.',
     dronaQuote:'Ten moves against the Kurma Vyuha is not failure — it is a foundation. Find the five moves you lost and understand each one.',
     dronaVerse:'— Arthashastra, Book X'},
    {moves:0, tier:'Crushed', tierClass:'tier-fallen', icon:'🏳',
     outcome:'The Formation Overwhelmed You',
     desc:'The tortoise closed too quickly. Return and identify where your pieces left their defensive positions.',
     dronaQuote:'The Kurma Vyuha teaches one thing: do not move pieces away from the Raja unless you can replace the cover immediately. You left gaps.',
     dronaVerse:'— Kautilya, Arthashastra Book IX'}
  ],
  boardState:{
    // Human — spread defensive position
    'e1':'0:king','d1':'0:rook','f1':'0:rook',
    'c1':'0:elephant','g1':'0:elephant',
    'd2':'0:pawn','e2':'0:pawn','f2':'0:pawn','c2':'0:pawn','g2':'0:pawn',
    'b1':'0:horse','h1':'0:horse',
    // Bot — Kurma Vyuha shell formation
    'e8':'1:king',
    'd8':'1:rook','f8':'1:rook',
    'c8':'1:elephant','g8':'1:elephant',
    'b8':'1:horse','h8':'1:horse',
    'd7':'1:pawn','e7':'1:pawn','f7':'1:pawn','c7':'1:pawn','g7':'1:pawn'
  },
  humanPlayer:0,
  botPlayer:1, botAggression:'strategic',
  liveCommentary:{
    'game-start':['The Kurma Vyuha surrounds you. Do not expose your Raja. Every piece must remain in its defensive position unless a capture is forced.'],
    'rook-moved':['The Ratha slides along the defensive line. Careful — keep it close to your Raja.'],
    'horse-moved':['The Ashwa leaps outward. Can it return to cover your Raja in one move if needed?'],
    'capture':['You take a piece from the tortoise\'s shell! A gap appears — move quickly before it closes.'],
    'lose-piece':['The Kurma Vyuha claims a piece. The shell tightens. Protect the Raja above all else.'],
    'raja-threatened':['THE TORTOISE CLOSES ON YOUR RAJA. This is the Kurma Vyuha\'s purpose — maximum pressure at the last moment. Escape now.'],
    'win':['FIFTEEN MOVES SURVIVED. The Kurma Vyuha has exhausted its pressure. You outlasted the tortoise.'],
    'lose':['The Raja fell to the Kurma Vyuha. Return and study which piece left its defensive post — that was where the shell entered.']
  }
},

day9: {
  id:'day9', day:9,
  title:"Bhishma's Final Charge",
  commander:'Arjuna, son of Indra',
  difficulty:'Hard', elo:650,
  badge:'',
  unlocked:false,
  sub:'First encounter with ELO-700 strength — hold against the Pitamaha',
  cutscene:[
    {type:'narrator', text:'Day 9. Bhishma\'s tenth day of command. The Grandsire of the Kurus rides his white chariot in one final, furious charge through the Pandava centre. This is the strongest the old warrior has fought.'},
    {type:'drona', text:'Student. This is the first time on the Ashtāpada you face a truly strong opponent. The ELO-700 bot calculates two moves ahead. You must begin to calculate three. There is no shortcut — only deeper sight.'},
    {type:'narrator', text:'Arjuna himself faces Bhishma in this duel. The objective: survive and capture Bhishma\'s Raja before he breaks your centre.'}
  ],
  winCondition:"Capture Bhishma's Raja (♚) before your centre collapses. ELO-700 strength.",
  winType:'capture-king',
  boardState:{
    'e1':'0:king','a1':'0:rook','h1':'0:rook',
    'b1':'0:horse','g1':'0:horse',
    'c1':'0:elephant','f1':'0:elephant',
    'a2':'0:pawn','b2':'0:pawn','c2':'0:pawn','d2':'0:pawn',
    'e2':'0:pawn','f2':'0:pawn','g2':'0:pawn','h2':'0:pawn',
    'e8':'1:king','a8':'1:rook','h8':'1:rook',
    'b8':'1:horse','g8':'1:horse',
    'c8':'1:elephant','f8':'1:elephant',
    'a7':'1:pawn','b7':'1:pawn','c7':'1:pawn','d7':'1:pawn',
    'e7':'1:pawn','f7':'1:pawn','g7':'1:pawn','h7':'1:pawn'
  },
  humanPlayer:0,
  botPlayer:1, botAggression:'strategic',
  liveCommentary:{
    'game-start':['Bhishma\'s final charge. He calculates ahead — you must do the same. Think two moves beyond every exchange.'],
    'rook-moved':['The Ratha opens a file. Control of files is Arjuna\'s method against Bhishma\'s aggression.'],
    'horse-moved':['The Ashwa strikes toward the centre. Bhishma will answer — be ready.'],
    'capture':['A piece falls to Arjuna! But Bhishma will exploit any overextension — consolidate before pressing.'],
    'lose-piece':['Bhishma took a piece. He calculated this exchange. Can you recover the material over the next two moves?'],
    'raja-threatened':['Bhishma\'s charge threatens your Raja! This is the final charge — the most dangerous moment. Respond precisely.'],
    'win':["BHISHMA'S RAJA CAPTURED. The Grandsire falls on Day 9. Arjuna\'s arrow was true — even against the strongest warrior of the age."],
    'lose':["Bhishma\'s charge broke through. He calculated deeper today. Study each exchange — identify the move where the calculation diverged."]
  },
  result:{
    win:{
      icon:'🏹', tier:"Arjuna's Precision", tierClass:'tier-victory',
      outcome:"Bhishma Defeated",
      desc:"Bhishma's Raja captured. The Grandsire of the Kurus falls on Day 9 of the war.",
      dronaQuote:"Bhishma at full strength is the hardest opponent outside of Day 18's Chakravarti. You calculated deeper than him today. This is the beginning of mastery.",
      dronaVerse:'— Bhishma Parva, Mahabharata'
    },
    lose:{
      icon:'🏳', tier:'Fallen', tierClass:'tier-fallen',
      outcome:"Bhishma's Charge Succeeded",
      desc:"The ELO-700 bot outplayed your position. Study the critical exchange — find where the calculation needed to go one move deeper.",
      dronaQuote:'Bhishma has fought a hundred wars. Every time he outplays you he is teaching you something. Find that lesson in the position.',
      dronaVerse:'— Bhishma Parva, Mahabharata'
    }
  }
},

day10: {
  id:'day10', day:10,
  title:'Bhishma Falls',
  commander:'Shikhandi, the reborn warrior',
  difficulty:'Hard', elo:700,
  badge:'',
  unlocked:false,
  sub:'The Pitamaha scenario — an undefeatable warrior made vulnerable',
  cutscene:[
    {type:'narrator', text:'Day 10. The Pandavas discover Bhishma\'s one vulnerability: the Grandsire took a vow never to raise weapons against a woman. Shikhandi, born female and reborn male, is positioned before him.'},
    {type:'narrator', text:'Bhishma lowers his bow. In that moment — one moment — the greatest warrior in the world is defenceless.'},
    {type:'drona', text:'Student. This day teaches the most important lesson of the Ashtāpada: every position has a moment of maximum vulnerability. Your task is not to be strong — it is to find the one moment when the enemy is not.'},
    {type:'narrator', text:'The scenario is asymmetric. Bhishma\'s pieces cannot move toward your Raja for 5 moves. Use those 5 moves to position for the final attack.'}
  ],
  winCondition:"Capture Bhishma's Raja (♚) within 15 moves. Use the first 5 moves to position — Bhishma cannot attack your Raja for 5 moves.",
  winType:'capture-king',
  specialRule:'bot-passive-first-5',
  boardState:{
    'e1':'0:king','a1':'0:rook','h1':'0:rook',
    'b1':'0:horse','g1':'0:horse',
    'c1':'0:elephant','f1':'0:elephant',
    'a2':'0:pawn','b2':'0:pawn','c2':'0:pawn','d2':'0:pawn',
    'e2':'0:pawn','f2':'0:pawn','g2':'0:pawn','h2':'0:pawn',
    'd8':'1:king','a8':'1:rook','h8':'1:rook',
    'b8':'1:horse','g8':'1:horse',
    'c8':'1:elephant','f8':'1:elephant',
    'a7':'1:pawn','b7':'1:pawn','c7':'1:pawn','d7':'1:pawn',
    'e7':'1:pawn','f7':'1:pawn','g7':'1:pawn','h7':'1:pawn'
  },
  humanPlayer:0,
  botPlayer:1, botAggression:'passive',
  liveCommentary:{
    'game-start':['Bhishma lowers his bow. Five moves of positioning time — use every one. When he raises it again, the attack must already be prepared.'],
    'rook-moved':['The Ratha moves into position. Three more free moves — place your pieces precisely.'],
    'horse-moved':['The Ashwa readies the fork. Two more free moves remain before Bhishma\'s aggression returns.'],
    'capture':['A piece falls! Even in the window of vulnerability, Bhishma\'s position must be dismantled carefully.'],
    'lose-piece':['Bhishma\'s pieces defend even when he cannot attack. Take only safe captures in the positioning phase.'],
    'raja-threatened':['The window has closed — Bhishma fights again. Your preparation must carry you now.'],
    'win':['BHISHMA FALLS. The Grandsire of the Kurus is defeated. Shikhandi\'s presence created the window — you used it with precision.'],
    'lose':['The window closed before the attack was ready. Return and use all five positioning moves to place your Rathas on the files that point at the enemy Raja.']
  },
  result:{
    win:{
      icon:'⚡', tier:"Shikhandi's Moment", tierClass:'tier-victory',
      outcome:'The Pitamaha Falls',
      desc:"Bhishma's Raja captured within the strategic window. The greatest warrior of the age is defeated through preparation, not brute force.",
      dronaQuote:'Bhishma was not defeated by Arjuna\'s arrows. He was defeated by one moment of preparation that was used perfectly. Today you understood that.',
      dronaVerse:'— Bhishma Parva, Mahabharata XVIII'
    },
    lose:{
      icon:'🏳', tier:'Fallen', tierClass:'tier-fallen',
      outcome:'The Window Was Wasted',
      desc:'Five moves of positioning were not used to their full potential. Return and plan the precise piece placements needed before the window closes.',
      dronaQuote:'The opportunity was there. You did not use it completely. In war, a wasted opportunity is worse than a lost battle — it demoralises the army.',
      dronaVerse:'— Kautilya, Arthashastra Book VIII'
    }
  }
},

day11: {
  id:'day11', day:11,
  title:'Drona Commands',
  commander:'Yudhishthira, son of Dharma',
  difficulty:'Hard', elo:750,
  badge:'',
  unlocked:false,
  sub:'Penetrate the Shakata formation — the cart that never breaks',
  cutscene:[
    {type:'narrator', text:'Day 11. Dronacharya assumes command of the Kaurava forces. He deploys the Shakata Vyuha — the cart formation. Wide, deep, with the Raja buried six pieces deep in the centre. No direct attack can reach it.'},
    {type:'drona', text:'The Shakata is my formation, student. I know every weakness. But I will not tell you — you must find them. The Shakata has exactly one penetration point. It moves. You must move faster.'},
    {type:'narrator', text:'Penetrate the Shakata formation and reach Drona\'s Raja. ELO-750 strength — the hardest puzzle so far.'}
  ],
  winCondition:"Penetrate the Shakata formation and capture Drona's Raja (♚). ELO-750 strength.",
  winType:'capture-king',
  boardState:{
    'e1':'0:king','a1':'0:rook','h1':'0:rook',
    'b1':'0:horse','g1':'0:horse',
    'c1':'0:elephant','f1':'0:elephant',
    'a2':'0:pawn','b2':'0:pawn','c2':'0:pawn','d2':'0:pawn',
    'e2':'0:pawn','f2':'0:pawn','g2':'0:pawn','h2':'0:pawn',
    // Shakata — buried Raja with deep protection
    'e7':'1:king',
    'c6':'1:rook','g6':'1:rook',
    'd6':'1:horse','f6':'1:horse',
    'c7':'1:elephant','g7':'1:elephant',
    'd7':'1:pawn','e6':'1:pawn','f7':'1:pawn',
    'b8':'1:pawn','h8':'1:pawn','d8':'1:pawn','f8':'1:pawn'
  },
  humanPlayer:0,
  botPlayer:1, botAggression:'strategic',
  liveCommentary:{
    'game-start':['The Shakata surrounds Drona\'s Raja with six layers. There is one weakness — a file, a diagonal, a rank. Find it.'],
    'rook-moved':['The Ratha scans the formation. Is there an open file pointing at the buried Raja?'],
    'horse-moved':['The Ashwa jumps over the outer shell. Can it reach the inner layer?'],
    'capture':['A Shakata piece falls! The formation shifts — where is the new weakness?','The outer layer is pierced. The inner layers are now exposed — press immediately.'],
    'lose-piece':['Drona\'s formation defends as it attacks. The Shakata punishes overextension.'],
    'raja-threatened':['Counter-attack from inside the Shakata! Drona targets your Raja while defending his own — respond.'],
    'win':["THE SHAKATA IS PENETRATED. Drona's Raja captured. Even the teacher's formation falls to a student who finds the one weakness it cannot close."],
    'lose':["The Shakata held. Return and look at each shell layer separately — the penetration point is in the transition between layers. Drona will wait."]
  },
  result:{
    win:{
      icon:'📜', tier:'Formation Broken', tierClass:'tier-victory',
      outcome:'Shakata Penetrated',
      desc:"Drona's deepest defensive formation is broken. The Pandavas have penetrated six layers of protection to reach the Raja.",
      dronaQuote:'You found it. The weakness I said exists in every Shakata — you found it in this one. I am more proud than I am defeated. This is what teaching is for.',
      dronaVerse:'— Drona Parva, Mahabharata'
    },
    lose:{
      icon:'🏳', tier:'Fallen', tierClass:'tier-fallen',
      outcome:'Shakata Holds',
      desc:"The cart formation did not yield. Study each shell layer — the weakness is between the second and third layers.",
      dronaQuote:'The Shakata is designed to show you where you are not thinking. It closes every path except one. Find the one path. It is always there.',
      dronaVerse:'— Kautilya, Arthashastra Book IX'
    }
  }
},

day12: {
  id:'day12', day:12,
  title:'The Lotus Closes',
  commander:'Arjuna, son of Indra',
  difficulty:'Hard', elo:800,
  badge:'',
  unlocked:false,
  sub:'Escape the Padma Vyuha before the petals seal',
  cutscene:[
    {type:'narrator', text:'Day 12. The Padma Vyuha — the Lotus formation. Six concentric rings of warriors that rotate and contract simultaneously. Unlike the Chakravyuha, the Lotus has no entry point — it captures by drawing warriors in.'},
    {type:'narrator', text:'Arjuna\'s chariot is inside the Padma Vyuha. The petals are closing. There are three moves before the innermost ring seals completely.'},
    {type:'drona', text:'Student. Escape is a form of victory the Arthashastra calls Apasarana — the strategic withdrawal. To escape with your forces intact is sometimes the only correct move. This lesson comes before Day 13 for a reason.'},
    {type:'narrator', text:'Escape the Padma Vyuha: move your Raja from the inner ring to the outer edge within 8 moves.'}
  ],
  winCondition:'Escape the Padma Vyuha — move your Raja from square e4 to any edge square (rank 1 or 8, or file a or h) within 8 moves.',
  winType:'escape-king',
  escapeTarget:'edge',
  movesLimit:8,
  boardState:{
    // Human — trapped in the centre
    'e4':'0:king','e5':'0:rook','d4':'0:horse',
    'f4':'0:elephant','e3':'0:pawn',
    // Bot — Padma petals closing inward
    'c6':'1:pawn','d6':'1:pawn','e6':'1:pawn','f6':'1:pawn','g6':'1:pawn',
    'c3':'1:pawn','d3':'1:pawn','f3':'1:pawn','g3':'1:pawn',
    'b5':'1:horse','h5':'1:horse',
    'b4':'1:elephant','h4':'1:elephant',
    'a8':'1:king','b7':'1:rook','h7':'1:rook',
    'd8':'1:rook','f8':'1:rook'
  },
  humanPlayer:0,
  botPlayer:1, botAggression:'strategic',
  liveCommentary:{
    'game-start':['The Padma Vyuha closes. Eight moves to reach the edge. Do not fight the formation — escape it. Every battle-move is a wasted escape-move.'],
    'rook-moved':['The Ratha clears a path. Is it opening an escape route or closing one?'],
    'horse-moved':['The Ashwa leaps outward — closer to the edge. Every outward jump matters.'],
    'capture':['A petal piece is captured — a gap in the ring! Move your Raja through it immediately.'],
    'lose-piece':['A piece is lost to the closing petals. Fewer escorts remain — move the Raja directly.'],
    'raja-threatened':['The Lotus is closing on your Raja! The ring is almost sealed — escape now, in this move.'],
    'win':['ESCAPED. The Raja reaches the edge. Arjuna breaks free of the Padma Vyuha — the strategic withdrawal is complete.'],
    'lose':['The Lotus sealed. The Raja did not reach the edge in time. Return and prioritise Raja movement over all captures — escape is the objective.']
  },
  result:{
    win:{
      icon:'🌸', tier:'Apasarana', tierClass:'tier-victory',
      outcome:'Padma Vyuha Escaped',
      desc:"Arjuna's Raja reaches the board edge within 8 moves. The Lotus formation could not seal in time.",
      dronaQuote:'Apasarana — strategic withdrawal. The Arthashastra teaches it as a form of victory equal to conquest. You understood today what takes most warriors years to accept: escaping with your forces intact is winning.',
      dronaVerse:'— Kautilya, Arthashastra Book X'
    },
    lose:{
      icon:'🏳', tier:'Sealed', tierClass:'tier-fallen',
      outcome:'The Lotus Sealed',
      desc:'The Raja did not reach the edge in 8 moves. The Padma Vyuha closed completely.',
      dronaQuote:'You fought when you should have moved. The Padma Vyuha is not a puzzle to be solved by combat. It is a race. The Raja must move every turn. Return.',
      dronaVerse:'— Drona Parva, Mahabharata'
    }
  }
},

// ── END OF DAYS 2–12 ─────────────────────────────────────────────────────────


// ── UPDATED ALL_DAYS ARRAY ────────────────────────────────────────────────────
// Replace your existing ALL_DAYS const in kurukshetra.html with this:
/*
const ALL_DAYS = [
  {day:1,  title:'The First Lesson',             sub:'Learn the Ratha\'s power',                      unlocked:true,  scenId:'day1'},
  {day:2,  title:'Garuda vs Krauncha',            sub:'Formation duel on Day 2',                       unlocked:false, scenId:'day2'},
  {day:3,  title:'The Left Flank Holds',          sub:'Survive Bhishma\'s assault',                    unlocked:false, scenId:'day3'},
  {day:4,  title:"Abhimanyu's First Strike",      sub:'Ratha hunt — capture three',                    unlocked:false, scenId:'day4'},
  {day:5,  title:"Bhima's Fury",                  sub:'Assault the Kaurava right',                     unlocked:false, scenId:'day5'},
  {day:6,  title:'Drona Takes the Vanguard',      sub:'Adapt to the formation change',                 unlocked:false, scenId:'day6'},
  {day:7,  title:"Satyaki's Cavalry Surge",       sub:'Alliance combo puzzle',                         unlocked:false, scenId:'day7'},
  {day:8,  title:'The Kurma Vyuha',               sub:'Survive the tortoise for 15 moves',             unlocked:false, scenId:'day8'},
  {day:9,  title:"Bhishma's Final Charge",        sub:'First encounter with ELO-800',                  unlocked:false, scenId:'day9'},
  {day:10, title:'Bhishma Falls',                 sub:'The Pitamaha scenario',                         unlocked:false, scenId:'day10'},
  {day:11, title:'Drona Commands',                sub:'Penetrate the Shakata formation',               unlocked:false, scenId:'day11'},
  {day:12, title:'The Lotus Closes',              sub:'Escape the Padma Vyuha',                        unlocked:false, scenId:'day12'},
  {day:13, title:'Abhimanyu in the Chakravyuha',  sub:'You enter alone. No exit exists.',              unlocked:true,  scenId:'day13'},
  {day:14, title:"Arjuna's Fury",                 sub:'Capture Jayadratha before sunset',              unlocked:false},
  {day:15, title:"Drona's Death",                 sub:'Play the enemy side for the first time',        unlocked:false},
  {day:16, title:'Karna Commands',                sub:"The Kaurava's strongest warrior",               unlocked:false},
  {day:17, title:"Karna's Wheel Sinks",           sub:'Exploit the moment of vulnerability',           unlocked:false},
  {day:18, title:'The Final Duel',                sub:'Bhima vs Duryodhana',                           unlocked:true,  scenId:'day18'},
];
*/


// ── WIN CONDITION HANDLER ADDITIONS ──────────────────────────────────────────
// Add these cases inside your executeMove / endGame logic.
// Search for the winType checks in executeMove() and add:

/*
// capture-both-rooks: track how many enemy rooks captured
if (G.scenario.winType === 'capture-both-rooks' && target?.type === 'rook' && target.owner !== G.scenario.humanPlayer) {
  G.rooksCaptured = (G.rooksCaptured || 0) + 1;
  if (G.rooksCaptured >= 2) { endGame('win'); return; }
}

// capture-n-pieces: track piece type captures
if (G.scenario.winType === 'capture-n-pieces' && target?.type === G.scenario.winPieceType && target.owner !== G.scenario.humanPlayer) {
  G.targetPiecesCaptured = (G.targetPiecesCaptured || 0) + 1;
  if (G.targetPiecesCaptured >= G.scenario.winPieceCount) { endGame('win'); return; }
}

// material-threshold: track total captures, check moves limit
if (G.scenario.winType === 'material-threshold') {
  if (G.captures >= G.scenario.materialTarget) { endGame('win'); return; }
  if (G.turnCount >= G.scenario.movesLimit * 2) { endGame('lose'); return; } // *2 because both players move
}

// escape-king: check if Raja reached edge after each human move
if (G.scenario.winType === 'escape-king' && playerId === G.scenario.humanPlayer) {
  const f = to.charCodeAt(0) - 97;
  const r = parseInt(to[1]);
  const piece = G.board.get(to);
  if (piece?.type === 'king' && (f === 0 || f === 7 || r === 1 || r === 8)) {
    endGame('win'); return;
  }
  if (G.turnCount >= G.scenario.movesLimit * 2) { endGame('lose'); return; }
}

// survival-rook: survival but lose condition is losing the rook
if (G.scenario.winType === 'survival-rook' && target?.type === 'rook' && target.owner === G.scenario.humanPlayer) {
  endGame('lose'); return;
}

// bot-passive-first-5 special rule for Day 10
if (G.scenario.specialRule === 'bot-passive-first-5' && G.turnCount < 10) {
  // Override bot aggression for first 5 human turns (10 half-moves)
  // In doBotTurn(), replace botAggression with 'passive' if G.turnCount < 10
}
*/
