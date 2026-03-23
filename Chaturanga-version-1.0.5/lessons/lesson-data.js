globalThis.ChaturangaLessonData = [
// ────────────────────────────────── BASICS ──────────────────────────────────
{
  id:'L001', title:'The Patient Foot Soldier', category:'basics', difficulty:'newbie',
  culturalSource:'Panchatantra — The Tortoise and the Geese',
  moralLesson:'Patience prevents hasty falls. Move with purpose.',
  completionReward:'Patience Badge — Tortoise of Panchatantra',
  boardState:{
    'a2':{owner:0,type:'pawn'}, 'b2':{owner:0,type:'pawn'}, 'd2':{owner:0,type:'pawn'},
    'e2':{owner:0,type:'pawn'}, 'f2':{owner:0,type:'pawn'},
    'e1':{owner:0,type:'king'},
    'e8':{owner:1,type:'king'}, 'c7':{owner:1,type:'pawn'}, 'f7':{owner:1,type:'pawn'}
  },
  steps:[
    { step:1, narration:'Your Nara (Pawn) is like a foot soldier in Chandragupta\'s army. It moves one square straight forward — never backward, never sideways. Patience is its greatest weapon.',
      instruction:'Move the pawn from a2 to a3.',
      expectedDice:6, expectedMove:{from:'a2',to:'a3'}, highlight:['a2','a3'],
      arrows:[{from:'a2',to:'a3',color:'gold'}], allowAnyMove:false,
      successMessage:'One steady step forward, warrior!', wrongMessage:'The pawn can only move straight ahead. Try again.' },
    { step:2, narration:'Good. Now see how the other pawns also advance in formation — like Chandragupta\'s infantry, each soldier protecting the next.',
      instruction:'Advance another pawn — move from d2 to d3.',
      expectedDice:6, expectedMove:{from:'d2',to:'d3'}, highlight:['d2','d3'],
      arrows:[{from:'d2',to:'d3',color:'gold'}], allowAnyMove:false,
      successMessage:'The pawn wall advances! Formation is the key to battlefield control.', wrongMessage:'Move the pawn at d2 one step forward to d3.' },
    { step:3, narration:'One final lesson: a pawn captures by moving one square diagonally forward — different from its normal one-square-straight march. This is how it removes obstacles in its path.',
      instruction:'Advance the pawn from f2 to f3.',
      expectedDice:6, expectedMove:{from:'f2',to:'f3'}, highlight:['f2','f3'],
      arrows:[{from:'f2',to:'f3',color:'gold'}], allowAnyMove:false,
      successMessage:'The Nara marches on! Patience and persistence — the way of the true foot soldier.', wrongMessage:'Move the pawn at f2 forward to f3.' }
  ]
},
{
  id:'L002', title:'The Ashtāpada — Know Your Board', category:'basics', difficulty:'newbie',
  culturalSource:'Arthashastra — Kautilya on Battlefield Geometry',
  moralLesson:'Know your terrain before your enemy knows it.',
  completionReward:'Scout Badge — Eyes of Kautilya',
  boardState:{
    'a1':{owner:0,type:'rook'}, 'e1':{owner:0,type:'king'},
    'e8':{owner:1,type:'king'}
  },
  steps:[
    { step:1, narration:'The board is called the Ashtāpada — "eight squares". Files run a through h (left to right). Ranks run 1 through 8 (bottom to top). The Ratha (Rook) slides any number of squares in a straight line — it is the fastest piece.',
      instruction:'Move the Ratha from a1 all the way to a8 — traverse the entire file.',
      expectedDice:1, expectedMove:{from:'a1',to:'a8'}, highlight:['a1','a2','a3','a4','a5','a6','a7','a8'],
      arrows:[{from:'a1',to:'a8',color:'gold'}], allowAnyMove:false,
      successMessage:'The Ratha dominates the entire a-file! Notice how it crossed 7 squares in one move.', wrongMessage:'The Ratha slides along a straight line. Move it from a1 all the way to a8.' },
    { step:2, narration:'Excellent! Now see the ranks — horizontal rows. The Ratha can also slide sideways along an entire rank in one sweep. This is why Rathas love open files and ranks.',
      instruction:'Slide the Ratha from a8 across the entire 8th rank to h8.',
      expectedDice:1, expectedMove:{from:'a8',to:'h8'}, highlight:['a8','b8','c8','d8','e8','f8','g8','h8'],
      arrows:[{from:'a8',to:'h8',color:'gold'}], allowAnyMove:false,
      successMessage:'Masterful! The Ratha swept the entire rank. You now know the full geography of the Ashtāpada.', wrongMessage:'Slide the Ratha along rank 8 from a8 to h8.' }
  ]
},
{
  id:'L003', title:'The Pāśaka Dice — Fate Decides', category:'basics', difficulty:'newbie',
  culturalSource:'Mahabharata — The Dice Game of Yudhishthira',
  moralLesson:'Fate offers the opportunity; skill decides the outcome.',
  completionReward:'Fate Badge — Yudhishthira\'s Insight',
  boardState:{
    'a1':{owner:0,type:'rook'}, 'b1':{owner:0,type:'horse'}, 'c1':{owner:0,type:'elephant'},
    'd1':{owner:0,type:'king'},
    'a2':{owner:0,type:'pawn'}, 'b2':{owner:0,type:'pawn'}, 'c2':{owner:0,type:'pawn'},
    'd2':{owner:0,type:'pawn'}, 'e2':{owner:0,type:'pawn'},
    'h8':{owner:1,type:'king'}, 'h7':{owner:1,type:'rook'}, 'g8':{owner:1,type:'horse'}
  },
  steps:[
    { step:1, narration:'The dice (Pāśaka) determine WHICH piece you must move each turn. Face 1 = Ratha (Rook). Face 2 or 5 = any piece. Face 3 = Ashwa (Horse). Face 4 = Danti (Elephant). Face 6 = Nara (Pawn) or Raja (King). Yudhishthira himself played by these sacred rules.',
      instruction:'Make any legal move — the dice determine your piece, your skill determines your destiny.',
      expectedDice:null, expectedMove:null, highlight:[], arrows:[], allowAnyMove:true,
      successMessage:'You understand the dice law of Chaturanga! Fate rolls the dice; the wise warrior plays the hand with brilliance.', wrongMessage:'Any legal move for the forced piece is valid.' }
  ]
},
// ────────────────────────────────── OPENING ─────────────────────────────────
{
  id:'L004', title:'Command the Centre', category:'opening', difficulty:'beginner',
  culturalSource:'Arthashastra Book X — Military Array',
  moralLesson:'He who controls the centre controls the war.',
  completionReward:'Strategist Badge — Eye of Kautilya',
  boardState:{
    'a2':{owner:0,type:'pawn'}, 'b2':{owner:0,type:'pawn'}, 'c2':{owner:0,type:'pawn'},
    'd2':{owner:0,type:'pawn'}, 'e2':{owner:0,type:'pawn'}, 'f2':{owner:0,type:'pawn'},
    'g2':{owner:0,type:'pawn'}, 'h2':{owner:0,type:'pawn'},
    'e1':{owner:0,type:'king'},
    'e8':{owner:1,type:'king'}, 'd7':{owner:1,type:'pawn'}, 'e7':{owner:1,type:'pawn'}
  },
  steps:[
    { step:1, narration:'The four central squares — d4, d5, e4, e5 — are the most contested real estate on the Ashtāpada. Kautilya wrote: "Place your strongest forces where they command the widest ground." Advance toward the centre first.',
      instruction:'Advance the d-pawn — move from d2 to d3 toward the centre.',
      expectedDice:6, expectedMove:{from:'d2',to:'d3'}, highlight:['d2','d3','d4','d5','e4','e5'],
      arrows:[{from:'d2',to:'d3',color:'gold'}], allowAnyMove:false,
      successMessage:'Your foot soldiers claim the heartland!', wrongMessage:'Move the pawn at d2 forward to d3.' },
    { step:2, narration:'Now reinforce the centre with your second pawn. Two pawns pointing at the centre together create a wall the enemy must break — Kautilya\'s double-infantry principle.',
      instruction:'Advance the e-pawn — move from e2 to e3.',
      expectedDice:6, expectedMove:{from:'e2',to:'e3'}, highlight:['e2','e3','d4','d5','e4','e5'],
      arrows:[{from:'e2',to:'e3',color:'gold'}], allowAnyMove:false,
      successMessage:'A strong centre pawn duo! The enemy will struggle to contest your control.', wrongMessage:'Move the pawn at e2 forward to e3.' }
  ]
},
{
  id:'L005', title:'Deploy Your Cavalry', category:'opening', difficulty:'beginner',
  culturalSource:'Ramayana — Rama\'s Vanara Sena Formation',
  moralLesson:'A well-deployed army wins before the first clash.',
  completionReward:'Commander Badge — Rama\'s Vanara Sena',
  boardState:{
    'b1':{owner:0,type:'horse'}, 'g1':{owner:0,type:'horse'},
    'a2':{owner:0,type:'pawn'}, 'b2':{owner:0,type:'pawn'}, 'c2':{owner:0,type:'pawn'},
    'd2':{owner:0,type:'pawn'}, 'e2':{owner:0,type:'pawn'}, 'f2':{owner:0,type:'pawn'},
    'e1':{owner:0,type:'king'}, 'a1':{owner:0,type:'rook'},
    'e8':{owner:1,type:'king'}
  },
  steps:[
    { step:1, narration:'The Ashwa (Horse) leaps in a precise L-shape: two squares in one direction, then one square to the side. It is the only piece that jumps over others. Like Hanuman leaping the ocean, it ignores all obstacles. Deploy it early!',
      instruction:'Leap the left horse from b1 to c3 — toward the battle\'s centre.',
      expectedDice:3, expectedMove:{from:'b1',to:'c3'}, highlight:['b1','c3'],
      arrows:[{from:'b1',to:'c3',color:'gold'}], allowAnyMove:false,
      successMessage:'The cavalry charges forward! From c3, this horse menaces the entire centre.', wrongMessage:'The Ashwa moves in an L-shape: 2 squares + 1 square at a right angle. Move b1 to c3.' },
    { step:2, narration:'Both horses should be deployed before the middle battle begins. Rama\'s Vanara Sena was powerful because every unit was in position before the assault on Lanka. Mirror that discipline.',
      instruction:'Leap the right horse from g1 to f3.',
      expectedDice:3, expectedMove:{from:'g1',to:'f3'}, highlight:['g1','f3'],
      arrows:[{from:'g1',to:'f3',color:'gold'}], allowAnyMove:false,
      successMessage:'Both Ashwas deployed! Your cavalry now straddles the centre — a formation worthy of Rama\'s general.', wrongMessage:'Move the horse at g1 to f3 (2 up, 1 left).' }
  ]
},
{
  id:'L006', title:'The Ratha\'s Open File', category:'opening', difficulty:'beginner',
  culturalSource:'Chanakya Niti — Open the path before your ally',
  moralLesson:'Clear the road for your strongest warrior.',
  completionReward:'Pathfinder Badge — Chanakya\'s Road',
  boardState:{
    'a1':{owner:0,type:'rook'}, 'e1':{owner:0,type:'king'},
    'b2':{owner:0,type:'pawn'}, 'c2':{owner:0,type:'pawn'}, 'd2':{owner:0,type:'pawn'},
    'e8':{owner:1,type:'king'}, 'a7':{owner:1,type:'pawn'}, 'b7':{owner:1,type:'pawn'}
  },
  steps:[
    { step:1, narration:'The a-file is open — no pawns block it. An open file for the Ratha is like a clear highway for Chanakya\'s fastest messenger. Seize it immediately and establish dominance.',
      instruction:'Drive the Ratha from a1 deep into the open file — advance to a4.',
      expectedDice:1, expectedMove:{from:'a1',to:'a4'}, highlight:['a1','a4'],
      arrows:[{from:'a1',to:'a4',color:'gold'}], allowAnyMove:false,
      successMessage:'The Ratha seizes the open file! From a4 it controls the entire column.', wrongMessage:'Slide the Ratha along the a-file from a1 to a4.' },
    { step:2, narration:'Now press the advantage. With no pawns to stop you, drive the Ratha all the way into enemy territory. Chanakya\'s principle: once the road is open, march without hesitation.',
      instruction:'Advance the Ratha further — from a4 all the way to a7 to capture the enemy pawn.',
      expectedDice:1, expectedMove:{from:'a4',to:'a7'}, highlight:['a4','a7'],
      arrows:[{from:'a4',to:'a7',color:'gold'}], allowAnyMove:false,
      successMessage:'The enemy pawn is captured! The Ratha\'s aggression on the open file has won material.', wrongMessage:'Slide the Ratha from a4 up to a7 to take the enemy pawn.' }
  ]
},
// ────────────────────────────────── TACTICS ─────────────────────────────────
{
  id:'L007', title:'The Ratha Pin', category:'tactics', difficulty:'intermediate',
  culturalSource:'Chanakya Niti — Immobilise the enemy general',
  moralLesson:'A pinned piece cannot protect its king.',
  completionReward:'Tactician Badge — Chanakya\'s Pin',
  boardState:{
    'a8':{owner:0,type:'rook'}, 'e1':{owner:0,type:'king'},
    'e8':{owner:1,type:'horse'}, 'h8':{owner:1,type:'king'}
  },
  steps:[
    { step:1, narration:'A pin: your Ratha sits on rank 8. The enemy Horse at e8 stands between your Ratha and the enemy Raja at h8. The horse dare not move — if it does, your Ratha slides to h8 and captures the King. The pinned piece is as good as paralysed.',
      instruction:'Capture the pinned Horse — slide the Ratha from a8 to e8.',
      expectedDice:1, expectedMove:{from:'a8',to:'e8'}, highlight:['a8','e8','h8'],
      arrows:[{from:'a8',to:'e8',color:'gold'}], allowAnyMove:false,
      successMessage:'The pinned Ashwa is captured! It could not escape without exposing its Raja.', wrongMessage:'Slide the Ratha along rank 8 from a8 to e8.' },
    { step:2, narration:'The Horse is gone. The Raja stands alone on the rank, fully exposed. This is the pin\'s true reward — not just winning a piece, but the decisive blow that follows.',
      instruction:'Finish the combination — capture the enemy Raja at h8.',
      expectedDice:1, expectedMove:{from:'e8',to:'h8'}, highlight:['e8','h8'],
      arrows:[{from:'e8',to:'h8',color:'gold'}], allowAnyMove:false,
      successMessage:'Victory! The pin created an unstoppable sequence. Immobilise, then strike — Chanakya\'s eternal lesson.', wrongMessage:'Slide the Ratha from e8 to h8 to capture the enemy King.' }
  ]
},
{
  id:'L008', title:'The Ashwa Fork', category:'tactics', difficulty:'intermediate',
  culturalSource:'Panchatantra — The Jackal Who Divided the Lions',
  moralLesson:'Attack two enemies at once and one must fall.',
  completionReward:'Fork Badge — The Jackal\'s Trick',
  boardState:{
    'd3':{owner:0,type:'horse'}, 'e1':{owner:0,type:'king'},
    'c6':{owner:1,type:'rook'}, 'g6':{owner:1,type:'rook'},
    'e8':{owner:1,type:'king'}
  },
  steps:[
    { step:1, narration:'From d3, your Ashwa can leap to e5 — a square that simultaneously attacks the enemy Rathas at both c6 and g6. Like the Jackal who set the two Lions against each other, you force an impossible choice: they can only save one Ratha.',
      instruction:'Jump the Ashwa from d3 to e5 — fork both enemy Rathas.',
      expectedDice:3, expectedMove:{from:'d3',to:'e5'}, highlight:['d3','e5','c6','g6'],
      arrows:[{from:'d3',to:'e5',color:'gold'}], allowAnyMove:false,
      successMessage:'The fork lands! Both enemy Rathas are threatened — they can only save one.', wrongMessage:'Move the Horse from d3 to e5 (1 right, 2 up). From there it attacks c6 and g6.' },
    { step:2, narration:'The enemy saved one Ratha and moved it away. The other remains. Now harvest the reward of your fork — the whole point of the Jackal\'s trick is the capture that follows.',
      instruction:'Capture the enemy Ratha at c6.',
      expectedDice:3, expectedMove:{from:'e5',to:'c6'}, highlight:['e5','c6'],
      arrows:[{from:'e5',to:'c6',color:'gold'}], allowAnyMove:false,
      successMessage:'The Ratha is taken! Fork, force, and collect — the three steps of Ashwa mastery.', wrongMessage:'Jump the Horse from e5 to c6 to claim your prize.' }
  ]
},
{
  id:'L009', title:'Danti Leap Attack', category:'tactics', difficulty:'intermediate',
  culturalSource:'Ramayana — Hanuman\'s Leap to Lanka',
  moralLesson:'The greatest warriors leap over all obstacles.',
  completionReward:'Leap Badge — Hanuman\'s Bound',
  boardState:{
    'c1':{owner:0,type:'elephant'}, 'e1':{owner:0,type:'king'},
    'c5':{owner:1,type:'horse'}, 'g5':{owner:1,type:'horse'},
    'e8':{owner:1,type:'king'}
  },
  steps:[
    { step:1, narration:'The Danti (Elephant) leaps exactly 2 diagonal squares, jumping over any intervening piece — like Hanuman leaping across the ocean. From c1, a leap to e3 suddenly threatens the enemy Ashwas at both c5 and g5 simultaneously!',
      instruction:'Leap the Danti from c1 to e3 to threaten both enemy horses.',
      expectedDice:4, expectedMove:{from:'c1',to:'e3'}, highlight:['c1','e3','c5','g5'],
      arrows:[{from:'c1',to:'e3',color:'gold'}], allowAnyMove:false,
      successMessage:'The Danti lands at e3! Both enemy Ashwas tremble — only one can be saved.', wrongMessage:'The Danti leaps exactly 2 diagonal squares. Move from c1 to e3.' },
    { step:2, narration:'One horse fled. The other remains within the Danti\'s reach. Hanuman did not leap merely to show off — he leaped to act. Now act.',
      instruction:'Capture the remaining enemy Ashwa at c5.',
      expectedDice:4, expectedMove:{from:'e3',to:'c5'}, highlight:['e3','c5'],
      arrows:[{from:'e3',to:'c5',color:'gold'}], allowAnyMove:false,
      successMessage:'The Ashwa is captured! Leap, threaten, capture — the Danti\'s three sacred steps.', wrongMessage:'Leap the Danti from e3 to c5 (2 diagonal squares left-up).' }
  ]
},
// ────────────────────────────────── ENDGAME ─────────────────────────────────
{
  id:'L010', title:'King Activation', category:'endgame', difficulty:'intermediate',
  culturalSource:'Bhagavad Gita 2.47 — Act, do not be idle',
  moralLesson:'In the endgame, the Raja must lead from the front.',
  completionReward:'Leadership Badge — Arjuna\'s Resolve',
  boardState:{
    'd1':{owner:0,type:'king'}, 'a4':{owner:0,type:'rook'},
    'h8':{owner:1,type:'king'}
  },
  steps:[
    { step:1, narration:'In the endgame, with few pieces remaining, the Raja transforms from a liability into a powerful fighter. Krishna\'s words rang clear: "Rise up, O Arjuna." Your Raja must leave the edge and march to the centre.',
      instruction:'Begin the Raja\'s march — move from d1 to d2.',
      expectedDice:6, expectedMove:{from:'d1',to:'d2'}, highlight:['d1','d2','d3','d4'],
      arrows:[{from:'d1',to:'d2',color:'gold'}], allowAnyMove:false,
      successMessage:'The Raja stirs! Like Arjuna hearing the Gita, action begins.', wrongMessage:'Move the Raja one step forward from d1 to d2.' },
    { step:2, narration:'Do not stop at the first step. Krishna\'s instruction was total commitment. The Raja must reach the centre where it controls eight squares and supports every piece it stands beside.',
      instruction:'Continue the march — advance the Raja from d2 to d3.',
      expectedDice:6, expectedMove:{from:'d2',to:'d3'}, highlight:['d2','d3','d4','d5'],
      arrows:[{from:'d2',to:'d3',color:'gold'}], allowAnyMove:false,
      successMessage:'The Raja leads! From d3, it controls the battlefield. The endgame belongs to the active king.', wrongMessage:'Move the Raja from d2 to d3.' }
  ]
},
{
  id:'L011', title:'Ratha Endgame Technique', category:'endgame', difficulty:'intermediate',
  culturalSource:'Arthashastra — The Final Siege',
  moralLesson:'Methodical pressure wins the final battle.',
  completionReward:'Siege Master Badge — Kautilya\'s Siege',
  boardState:{
    'a4':{owner:0,type:'rook'}, 'd1':{owner:0,type:'king'},
    'h7':{owner:1,type:'king'}
  },
  steps:[
    { step:1, narration:'The Ratha-and-Raja endgame: the technique is systematic, not impulsive. First step — cut the enemy Raja off from the lower half of the board. Move your Ratha to h4 to create a barrier the enemy king cannot cross.',
      instruction:'Slide the Ratha to h4 — cut off the enemy Raja from ranks 1–4.',
      expectedDice:1, expectedMove:{from:'a4',to:'h4'}, highlight:['a4','h4'],
      arrows:[{from:'a4',to:'h4',color:'gold'}], allowAnyMove:false,
      successMessage:'The barrier is set! The enemy Raja is confined to ranks 5–8. The net tightens.', wrongMessage:'Slide the Ratha along rank 4 from a4 to h4.' },
    { step:2, narration:'The Ratha holds the barrier. Now your Raja must advance to help tighten the net. Kautilya\'s siege principle: the battering ram creates the breach; the infantry must follow through.',
      instruction:'Advance your Raja from d1 to d2 — begin the march toward the enemy.',
      expectedDice:6, expectedMove:{from:'d1',to:'d2'}, highlight:['d1','d2'],
      arrows:[{from:'d1',to:'d2',color:'gold'}], allowAnyMove:false,
      successMessage:'Raja and Ratha work in concert! The methodical squeeze is underway. Kautilya smiles.', wrongMessage:'Move the Raja from d1 to d2.' }
  ]
},
{
  id:'L012', title:'Pawn Promotion', category:'endgame', difficulty:'intermediate',
  culturalSource:'Panchatantra — The Crow Who Rose to Lead',
  moralLesson:'The humble foot soldier, with patience, becomes a king.',
  completionReward:'Promotion Badge — The Crow\'s Wisdom',
  boardState:{
    'a7':{owner:0,type:'pawn'}, 'e4':{owner:0,type:'king'},
    'h1':{owner:1,type:'king'}
  },
  steps:[
    { step:1, narration:'A Nara (Pawn) that reaches the final rank earns the right to promote — it transforms into the most powerful piece available. In Chaturanga this is the Ratha. The Panchatantra crow was born a simple bird, but rose to lead the forest.',
      instruction:'Advance the Nara from a7 to a8 — reach the final rank and promote!',
      expectedDice:6, expectedMove:{from:'a7',to:'a8'}, highlight:['a7','a8'],
      arrows:[{from:'a7',to:'a8',color:'gold'}], allowAnyMove:false,
      successMessage:'The Nara promotes! A humble foot soldier is reborn as the mightiest piece. The Crow\'s Wisdom fulfilled.', wrongMessage:'Move the pawn from a7 one step forward to a8.' },
    { step:2, narration:'With a new Ratha on the board, the endgame becomes decisive. But even a promoted Ratha needs its Raja as a partner — the king must advance to complete the victory.',
      instruction:'Advance the Raja from e4 to e5 — bring the king into the final act.',
      expectedDice:6, expectedMove:{from:'e4',to:'e5'}, highlight:['e4','e5'],
      arrows:[{from:'e4',to:'e5',color:'gold'}], allowAnyMove:false,
      successMessage:'King and new Ratha unite! The endgame is yours. Patience made this possible.', wrongMessage:'Move the Raja from e4 forward to e5.' }
  ]
},
// ────────────────────────────────── ALLIANCE ────────────────────────────────
{
  id:'L013', title:'Coordinate with Your Teammate', category:'alliance', difficulty:'intermediate',
  culturalSource:'Mahabharata — Pandava Brothers\' Unity at Kurukshetra',
  moralLesson:'Five brothers as one fist beat a hundred alone.',
  completionReward:'Unity Badge — Pandava Brotherhood',
  boardState:{
    'a1':{owner:0,type:'rook'}, 'e1':{owner:0,type:'king'},
    'd3':{owner:2,type:'rook'}, 'e8':{owner:2,type:'king'},
    'h8':{owner:1,type:'king'}, 'h5':{owner:1,type:'rook'},
    'd6':{owner:3,type:'king'}
  },
  steps:[
    { step:1, narration:'In team mode Red+Green fight together. Your Green ally\'s Ratha already commands d3. If you place your Ratha at d1, your team controls the entire d-file from d1 to d8 — no enemy piece can use it.',
      instruction:'Move your Ratha to d1 — align with your ally on the d-file.',
      expectedDice:1, expectedMove:{from:'a1',to:'d1'}, highlight:['a1','d1','d3'],
      arrows:[{from:'a1',to:'d1',color:'gold'}], allowAnyMove:false,
      successMessage:'Together, your team controls the entire d-file! Five brothers as one fist.', wrongMessage:'Slide the Ratha from a1 to d1 to align with your green ally.' },
    { step:2, narration:'Now exploit the control. With the d-file secured, your Ratha can penetrate deep — all the way to d8. The ally\'s presence at d3 means the enemy cannot intercept you.',
      instruction:'Drive your Ratha from d1 to d8 — penetrate into enemy territory.',
      expectedDice:1, expectedMove:{from:'d1',to:'d8'}, highlight:['d1','d8'],
      arrows:[{from:'d1',to:'d8',color:'gold'}], allowAnyMove:false,
      successMessage:'Deep penetration! The enemy has no answer. This is the power of alliance on the Ashtāpada.', wrongMessage:'Slide the Ratha from d1 all the way to d8.' }
  ]
},
{
  id:'L014', title:'Raja Respawn Timing', category:'alliance', difficulty:'intermediate',
  culturalSource:'Ramayana — The Return of Rama',
  moralLesson:'The king\'s return to battle must be timely and brave.',
  completionReward:'Return Badge — Rama\'s Return',
  boardState:{
    'e1':{owner:0,type:'king'}, 'a1':{owner:0,type:'rook'},
    'd4':{owner:2,type:'king'}, 'd6':{owner:2,type:'rook'},
    'h8':{owner:1,type:'king'}, 'e8':{owner:3,type:'king'}
  },
  steps:[
    { step:1, narration:'In team mode, when your ally captures an enemy Raja, your own Raja — if previously lost — may respawn on any empty square of your choice! Like Rama\'s triumphant return to Ayodhya after defeating Ravana, the timing of this return determines the war\'s outcome.',
      instruction:'Understand the respawn rule — make any legal move to complete this lesson.',
      expectedDice:null, expectedMove:null, highlight:[], arrows:[], allowAnyMove:true,
      successMessage:'The Raja\'s return principle is understood! In a real game, choose your respawn square wisely — near your ally, away from danger.', wrongMessage:'Make any legal move to acknowledge this rule.' }
  ]
},
{
  id:'L015', title:'The Noble Sacrifice', category:'alliance', difficulty:'advanced',
  culturalSource:'Bhagavad Gita 3.25 — Act for the welfare of the team',
  moralLesson:'A sacrifice that saves your teammate wins the war.',
  completionReward:'Sacrifice Badge — The Nishkama Warrior',
  boardState:{
    'a4':{owner:0,type:'rook'}, 'e1':{owner:0,type:'king'},
    'd6':{owner:2,type:'king'},
    'd8':{owner:1,type:'rook'}, 'h8':{owner:1,type:'king'}
  },
  steps:[
    { step:1, narration:'The enemy Ratha at d8 threatens your Green ally\'s Raja at d6. Your Ratha at a4 can slide to d4, interposing between the threat and your ally. You will likely lose your Ratha — but the alliance survives. Nishkama Karma: act without attachment to personal gain.',
      instruction:'Sacrifice your Ratha — interpose at d4 to shield your ally\'s Raja.',
      expectedDice:1, expectedMove:{from:'a4',to:'d4'}, highlight:['a4','d4','d6','d8'],
      arrows:[{from:'a4',to:'d4',color:'red'}], allowAnyMove:false,
      successMessage:'The sacrifice is made! Your Ratha stands between your ally and destruction. Nishkama Karma in action.', wrongMessage:'Move the Ratha from a4 to d4 to block the attack on your ally\'s King.' },
    { step:2, narration:'The sacrifice bought time. Though the enemy may take your Ratha, your alliance rallies. Now activate your Raja — bring it toward the action to support the counterattack that follows.',
      instruction:'Centralize your Raja — move from e1 to d1 to prepare the counterattack.',
      expectedDice:6, expectedMove:{from:'e1',to:'d1'}, highlight:['e1','d1'],
      arrows:[{from:'e1',to:'d1',color:'gold'}], allowAnyMove:false,
      successMessage:'The Raja joins the fight! Sacrifice without follow-through is waste. Sacrifice with purpose wins wars.', wrongMessage:'Move the Raja from e1 to d1.' }
  ]
},
// ────────────────────────────────── ADVANCED ────────────────────────────────
{
  id:'L016', title:'Asymmetric Positions', category:'advanced', difficulty:'advanced',
  culturalSource:'Arthashastra Book XIV — Exploit the imbalance',
  moralLesson:'Turn the asymmetry in your favour; do not seek equality.',
  completionReward:'Strategist Badge — Kautilya\'s Imbalance',
  boardState:{
    'a1':{owner:0,type:'rook'}, 'h1':{owner:0,type:'rook'}, 'e1':{owner:0,type:'king'},
    'h8':{owner:1,type:'king'}, 'e8':{owner:1,type:'elephant'}, 'f8':{owner:1,type:'horse'}
  },
  steps:[
    { step:1, narration:'You have two Rathas; the enemy has only minor pieces (Danti and Ashwa). This asymmetry is decisive. Minor pieces cannot challenge Rathas directly — they can only run. Kautilya\'s principle: exploit imbalance immediately, before the enemy reorganises.',
      instruction:'Advance your first Ratha deep into enemy territory — from a1 to a6.',
      expectedDice:1, expectedMove:{from:'a1',to:'a6'}, highlight:['a1','a6'],
      arrows:[{from:'a1',to:'a6',color:'gold'}], allowAnyMove:false,
      successMessage:'The Ratha penetrates! From a6 it threatens the entire 6th rank. The minor pieces cannot respond symmetrically.', wrongMessage:'Slide the Ratha from a1 to a6 along the open file.' },
    { step:2, narration:'One Ratha creates a threat; two Rathas create a disaster the enemy cannot contain. While the enemy scrambles to answer the first invasion, the second Ratha strikes from the other side.',
      instruction:'Double your Rathas — advance the second from h1 to h6.',
      expectedDice:1, expectedMove:{from:'h1',to:'h6'}, highlight:['h1','h6'],
      arrows:[{from:'h1',to:'h6',color:'gold'}], allowAnyMove:false,
      successMessage:'Two Rathas on the 6th rank! The enemy\'s minor pieces are overwhelmed. Asymmetry exploited perfectly.', wrongMessage:'Slide the second Ratha from h1 to h6.' }
  ]
},
{
  id:'L017', title:'The Dice Zugzwang', category:'advanced', difficulty:'advanced',
  culturalSource:'Bhagavad Gita 2.47 — Sometimes action harms, inaction helps',
  moralLesson:'Force the enemy into a position where any dice roll hurts them.',
  completionReward:'Mastery Badge — The Gita\'s Paradox',
  boardState:{
    'h1':{owner:0,type:'rook'}, 'a8':{owner:0,type:'rook'}, 'e1':{owner:0,type:'king'},
    'e5':{owner:1,type:'king'}
  },
  steps:[
    { step:1, narration:'Zugzwang: a position where any move the opponent makes worsens their situation. In Chaturanga, with the dice, you can engineer this — cut off every escape rank and file so each dice roll forces the enemy Raja into a worse square.',
      instruction:'Cut off the enemy Raja\'s escape — move the first Ratha from h1 to h7.',
      expectedDice:1, expectedMove:{from:'h1',to:'h7'}, highlight:['h1','h7'],
      arrows:[{from:'h1',to:'h7',color:'gold'}], allowAnyMove:false,
      successMessage:'The enemy Raja is cut off from ranks 8! One wall of the trap is built.', wrongMessage:'Slide the Ratha from h1 to h7 to cut off the top ranks.' },
    { step:2, narration:'Now close the second barrier. With Rathas on rank 7 and rank 5, the enemy Raja is squeezed into a narrow zone. Whatever dice the enemy rolls — Ratha (1), Horse (3), Elephant (4) — every piece they move makes the position worse.',
      instruction:'Tighten the net — move the second Ratha from a8 to a5.',
      expectedDice:1, expectedMove:{from:'a8',to:'a5'}, highlight:['a8','a5'],
      arrows:[{from:'a8',to:'a5',color:'gold'}], allowAnyMove:false,
      successMessage:'Zugzwang achieved! The enemy is in a prison of their own dice. Every roll hurts. The Gita\'s paradox made real.', wrongMessage:'Move the Ratha from a8 to a5 to close the second barrier.' }
  ]
},
{
  id:'L018', title:'Multi-Piece Combination', category:'advanced', difficulty:'advanced',
  culturalSource:'Mahabharata — The Chakravyuha Formation',
  moralLesson:'The Chakravyuha: pieces working in sequence, each enabling the next.',
  completionReward:'Grandmaster Badge — The Chakravyuha',
  boardState:{
    'c3':{owner:0,type:'horse'}, 'a1':{owner:0,type:'rook'}, 'e1':{owner:0,type:'king'},
    'e6':{owner:1,type:'king'}, 'f6':{owner:1,type:'rook'}, 'g4':{owner:1,type:'horse'}
  },
  steps:[
    { step:1, narration:'The Chakravyuha is a combination where each piece enables the next in sequence. Your Ashwa at c3 leaps to e4 — simultaneously threatening the enemy Ratha at f6 and creating a pivot for your Ratha to follow.',
      instruction:'Begin the combination — jump the Ashwa from c3 to e4.',
      expectedDice:3, expectedMove:{from:'c3',to:'e4'}, highlight:['c3','e4','f6'],
      arrows:[{from:'c3',to:'e4',color:'gold'}], allowAnyMove:false,
      successMessage:'Step 1 complete! The Ashwa at e4 threatens f6 and opens the e-file for what comes next.', wrongMessage:'Jump the Ashwa from c3 to e4 (1 right, 2 up).' },
    { step:2, narration:'The Ashwa creates the threat; the Ratha delivers the pressure. Slide your Ratha to e1 — it now aims directly at the enemy Raja on the e-file. The Ashwa at e4 shields it from being blocked.',
      instruction:'Advance the Ratha to e1 — threaten the enemy Raja along the e-file.',
      expectedDice:1, expectedMove:{from:'a1',to:'e1'}, highlight:['a1','e1','e6'],
      arrows:[{from:'a1',to:'e1',color:'gold'}], allowAnyMove:false,
      successMessage:'The Ratha aligns with the enemy Raja! The enemy faces two simultaneous threats. The Chakravyuha tightens.', wrongMessage:'Slide the Ratha from a1 to e1 along rank 1.' },
    { step:3, narration:'Two threats cannot both be answered. The Ratha threatens the King on the e-file; the Ashwa threatens the Ratha at f6. Now complete the Chakravyuha — capture the undefended Ratha with your Ashwa.',
      instruction:'Complete the combination — capture the enemy Ratha at f6 with the Ashwa.',
      expectedDice:3, expectedMove:{from:'e4',to:'f6'}, highlight:['e4','f6'],
      arrows:[{from:'e4',to:'f6',color:'gold'}], allowAnyMove:false,
      successMessage:'The Chakravyuha is complete! A three-piece combination executed flawlessly. Drona himself would approve.', wrongMessage:'Jump the Ashwa from e4 to f6 to capture the enemy Ratha.' }
  ]
}
];
