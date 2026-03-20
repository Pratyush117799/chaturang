globalThis.ChaturangaLessonData = [
// ────────────────────────────────── BASICS ──────────────────────────────────
{
  id:'L001', title:'The Patient Foot Soldier', category:'basics', difficulty:'newbie',
  culturalSource:'Panchatantra — The Tortoise and the Geese',
  moralLesson:'Patience prevents hasty falls. Move with purpose.',
  completionReward:'Patience Badge — Tortoise of Panchatantra',
  steps:[
    { step:1, narration:'Your Nara (Pawn) is like a foot soldier in Chandragupta\'s army. It moves one square forward at a time.', instruction:'Move the pawn from a2 to a3.',
      expectedDice:6, expectedMove:{from:'a2',to:'a3'}, highlight:['a2','a3'], arrows:[{from:'a2',to:'a3',color:'gold'}], allowAnyMove:false,
      successMessage:'One steady step forward, warrior!', wrongMessage:'The pawn can only move straight ahead. Try again.' }
  ]
},
{
  id:'L002', title:'The Ashtāpada — Know Your Board', category:'basics', difficulty:'newbie',
  culturalSource:'Arthashastra — Kautilya on Battlefield Geometry',
  moralLesson:'Know your terrain before your enemy knows it.',
  completionReward:'Scout Badge — Eyes of Kautilya',
  steps:[
    { step:1, narration:'The board is called the Ashtāpada — eight squares on each side. Files are letters a–h, ranks are numbers 1–8.', instruction:'Move the Ratha (Rook) from a1 to a8.',
      expectedDice:1, expectedMove:{from:'a1',to:'a8'}, highlight:['a1','a8'], arrows:[{from:'a1',to:'a8',color:'gold'}], allowAnyMove:false,
      successMessage:'The Ratha dominates the entire file!', wrongMessage:'The Ratha slides along a straight line. Try again.' }
  ]
},
{
  id:'L003', title:'The Pāśaka Dice — Fate Decides', category:'basics', difficulty:'newbie',
  culturalSource:'Mahabharata — The Dice Game of Yudhishthira',
  moralLesson:'Fate offers the opportunity; skill decides the outcome.',
  completionReward:'Fate Badge — Yudhishthira\'s Insight',
  steps:[
    { step:1, narration:'The dice (Pāśaka) determine WHICH piece you move! Face 1 = Ratha, 3 = Ashwa, 4 = Danti, 6 = Nara or Raja, 2 or 5 = any piece.', instruction:'Roll the dice and move the forced piece.',
      expectedDice:null, expectedMove:null, highlight:[], arrows:[], allowAnyMove:true,
      successMessage:'You understand the dice law of Chaturanga!', wrongMessage:'Any legal move for the forced piece is valid.' }
  ]
},
// ────────────────────────────────── OPENING ─────────────────────────────────
{
  id:'L004', title:'Command the Centre', category:'opening', difficulty:'beginner',
  culturalSource:'Arthashastra Book X — Military Array',
  moralLesson:'He who controls the centre controls the war.',
  completionReward:'Strategist Badge — Eye of Kautilya',
  steps:[
    { step:1, narration:'The four central squares (d4, d5, e4, e5) are the most valuable real estate on the Ashtāpada.', instruction:'Advance a pawn toward the centre.',
      expectedDice:6, expectedMove:{from:'d2',to:'d3'}, highlight:['d2','d3','d4','d5','e4','e5'], arrows:[{from:'d2',to:'d3',color:'gold'}], allowAnyMove:false,
      successMessage:'Your foot soldiers claim the heartland!', wrongMessage:'Move a pawn toward the centre squares.' }
  ]
},
{
  id:'L005', title:'Deploy Your Cavalry', category:'opening', difficulty:'beginner',
  culturalSource:'Ramayana — Rama\'s Vanara Sena Formation',
  moralLesson:'A well-deployed army wins before the first clash.',
  completionReward:'Commander Badge — Rama\'s Vanara Sena',
  steps:[
    { step:1, narration:'The Ashwa (Horse) leaps in an L-shape and can jump over pieces. Develop it early to control the centre!', instruction:'Move the horse from b1 to c3.',
      expectedDice:3, expectedMove:{from:'b1',to:'c3'}, highlight:['b1','c3'], arrows:[{from:'b1',to:'c3',color:'gold'}], allowAnyMove:false,
      successMessage:'The cavalry charges forward!', wrongMessage:'The Ashwa moves in an L-shape: 2+1 squares.' }
  ]
},
{
  id:'L006', title:'The Ratha\'s Open File', category:'opening', difficulty:'beginner',
  culturalSource:'Chanakya Niti — Open the path before your ally',
  moralLesson:'Clear the road for your strongest warrior.',
  completionReward:'Pathfinder Badge — Chanakya\'s Road',
  steps:[
    { step:1, narration:'The Ratha (Rook) is most powerful on open files and ranks — columns with no pawns blocking it.', instruction:'Move the rook from a1 to a4.',
      expectedDice:1, expectedMove:{from:'a1',to:'a4'}, highlight:['a1','a4'], arrows:[{from:'a1',to:'a4',color:'gold'}], allowAnyMove:false,
      successMessage:'The Ratha seizes the open file!', wrongMessage:'Move the Ratha along the a-file.' }
  ]
},
// ────────────────────────────────── TACTICS ─────────────────────────────────
{
  id:'L007', title:'The Ratha Pin', category:'tactics', difficulty:'intermediate',
  culturalSource:'Chanakya Niti — Immobilise the enemy general',
  moralLesson:'A pinned piece cannot protect its king.',
  completionReward:'Tactician Badge — Chanakya\'s Pin',
  steps:[
    { step:1, narration:'A pin occurs when a piece cannot move without exposing the Raja. The Ratha along a rank pins anything between it and the enemy king.', instruction:'Move the Ratha to d1 to pin the enemy piece.',
      expectedDice:1, expectedMove:{from:'a1',to:'d1'}, highlight:['a1','d1'], arrows:[{from:'a1',to:'d1',color:'gold'}], allowAnyMove:false,
      successMessage:'The enemy piece is pinned!', wrongMessage:'Slide the Ratha along rank 1.' }
  ]
},
{
  id:'L008', title:'The Ashwa Fork', category:'tactics', difficulty:'intermediate',
  culturalSource:'Panchatantra — The Jackal Who Divided the Lions',
  moralLesson:'Attack two enemies at once and one must fall.',
  completionReward:'Fork Badge — The Jackal\'s Trick',
  steps:[
    { step:1, narration:'A fork is when one piece attacks two pieces simultaneously. The Ashwa is the master of forks due to its L-shaped jump.', instruction:'Move the horse to e5 to fork two enemy pieces.',
      expectedDice:3, expectedMove:{from:'d3',to:'e5'}, highlight:['d3','e5'], arrows:[{from:'d3',to:'e5',color:'gold'}], allowAnyMove:false,
      successMessage:'The Ashwa forks! The enemy must sacrifice one piece.', wrongMessage:'Move the horse to the square that attacks both targets.' }
  ]
},
{
  id:'L009', title:'Danti Leap Attack', category:'tactics', difficulty:'intermediate',
  culturalSource:'Ramayana — Hanuman\'s Leap to Lanka',
  moralLesson:'The greatest warriors leap over all obstacles.',
  completionReward:'Leap Badge — Hanuman\'s Bound',
  steps:[
    { step:1, narration:'The Danti (Elephant) leaps exactly 2 diagonal squares, jumping over any pieces. This makes it a surprise weapon!', instruction:'Move the Danti from c1 to e3 to attack two pieces.',
      expectedDice:4, expectedMove:{from:'c1',to:'e3'}, highlight:['c1','e3'], arrows:[{from:'c1',to:'e3',color:'gold'}], allowAnyMove:false,
      successMessage:'The Elephant leaps! The enemy has two problems now.', wrongMessage:'The Danti leaps exactly 2 diagonals.' }
  ]
},
// ────────────────────────────────── ENDGAME ─────────────────────────────────
{
  id:'L010', title:'King Activation', category:'endgame', difficulty:'intermediate',
  culturalSource:'Bhagavad Gita 2.47 — Act, do not be idle',
  moralLesson:'In the endgame, the Raja must lead from the front.',
  completionReward:'Leadership Badge — Arjuna\'s Resolve',
  steps:[
    { step:1, narration:'In the endgame, the Raja becomes a fighting piece. Bring it to the centre where it can control squares.', instruction:'Move the Raja toward the centre.',
      expectedDice:6, expectedMove:{from:'d1',to:'d2'}, highlight:['d1','d2','d3','d4','d5','e4','e5'], arrows:[{from:'d1',to:'d2',color:'gold'}], allowAnyMove:false,
      successMessage:'The Raja advances! Leadership by example.', wrongMessage:'Move the Raja one step toward the centre.' }
  ]
},
{
  id:'L011', title:'Ratha Endgame Technique', category:'endgame', difficulty:'intermediate',
  culturalSource:'Arthashastra — The Final Siege',
  moralLesson:'Methodical pressure wins the final battle.',
  completionReward:'Siege Master Badge — Kautilya\'s Siege',
  steps:[
    { step:1, narration:'With a lone Ratha (Rook) and Raja, you can trap the enemy Raja in the corner systematically.', instruction:'Move the Ratha to h4 to cut off the enemy king.',
      expectedDice:1, expectedMove:{from:'a4',to:'h4'}, highlight:['a4','h4'], arrows:[{from:'a4',to:'h4',color:'gold'}], allowAnyMove:false,
      successMessage:'The enemy Raja is confined to two ranks!', wrongMessage:'Slide the Ratha to the h-file to cut off escape.' }
  ]
},
{
  id:'L012', title:'Pawn Promotion', category:'endgame', difficulty:'intermediate',
  culturalSource:'Panchatantra — The Crow Who Rose to Lead',
  moralLesson:'The humble foot soldier, with patience, becomes a king.',
  completionReward:'Promotion Badge — The Crow\'s Wisdom',
  steps:[
    { step:1, narration:'A Nara (Pawn) that reaches the far end of the board promotes! It transforms into whatever piece belongs on that square.', instruction:'Advance the pawn to the next promotion rank.',
      expectedDice:6, expectedMove:{from:'a7',to:'a8'}, highlight:['a7','a8'], arrows:[{from:'a7',to:'a8',color:'gold'}], allowAnyMove:false,
      successMessage:'The Nara promotes! A humble foot soldier rises.', wrongMessage:'Move the pawn one square forward.' }
  ]
},
// ────────────────────────────────── ALLIANCE ────────────────────────────────
{
  id:'L013', title:'Coordinate with Your Teammate', category:'alliance', difficulty:'intermediate',
  culturalSource:'Mahabharata — Pandava Brothers\' Unity at Kurukshetra',
  moralLesson:'Five brothers as one fist beat a hundred alone.',
  completionReward:'Unity Badge — Pandava Brotherhood',
  steps:[
    { step:1, narration:'In team mode (Red+Green vs Blue+Yellow), your teammate\'s pieces support yours. Coordinate attacks to overwhelm the enemy.', instruction:'Move your Ratha to support your teammate\'s attack.',
      expectedDice:1, expectedMove:{from:'a1',to:'d1'}, highlight:['a1','d1'], arrows:[{from:'a1',to:'d1',color:'gold'}], allowAnyMove:false,
      successMessage:'Together, your team controls the entire d-file!', wrongMessage:'Move the Ratha to align with your green ally.' }
  ]
},
{
  id:'L014', title:'Raja Respawn Timing', category:'alliance', difficulty:'intermediate',
  culturalSource:'Ramayana — The Return of Rama',
  moralLesson:'The king\'s return to battle must be timely and brave.',
  completionReward:'Return Badge — Rama\'s Return',
  steps:[
    { step:1, narration:'When your teammate captures an enemy Raja, your own Raja can respawn on any empty square! Timing this is crucial.', instruction:'Understand: after your ally captures a Raja, click an empty square to respawn YOUR Raja.',
      expectedDice:null, expectedMove:null, highlight:[], arrows:[], allowAnyMove:true,
      successMessage:'The Raja returns to the battlefield!', wrongMessage:'The respawn happens after a teammate capture.' }
  ]
},
{
  id:'L015', title:'The Noble Sacrifice', category:'alliance', difficulty:'advanced',
  culturalSource:'Bhagavad Gita 3.25 — Act for the welfare of the team',
  moralLesson:'A sacrifice that saves your teammate wins the war.',
  completionReward:'Sacrifice Badge — The Nishkama Warrior',
  steps:[
    { step:1, narration:'Sometimes sacrificing your own piece to save your teammate\'s Raja is the highest strategy.', instruction:'Sacrifice your piece to block the threat against your ally.',
      expectedDice:1, expectedMove:{from:'a4',to:'d4'}, highlight:['a4','d4'], arrows:[{from:'a4',to:'d4',color:'red'}], allowAnyMove:false,
      successMessage:'The sacrifice saves your ally! Nishkama Karma in action.', wrongMessage:'Interpose your piece on the attack line.' }
  ]
},
// ────────────────────────────────── ADVANCED ────────────────────────────────
{
  id:'L016', title:'Asymmetric Positions', category:'advanced', difficulty:'advanced',
  culturalSource:'Arthashastra Book XIV — Exploit the imbalance',
  moralLesson:'Turn the asymmetry in your favour; do not seek equality.',
  completionReward:'Strategist Badge — Kautilya\'s Imbalance',
  steps:[
    { step:1, narration:'When you have more Rathas than your enemy, use them on open files where the enemy cannot respond symmetrically.', instruction:'Advance the Ratha along the open file.',
      expectedDice:1, expectedMove:{from:'a1',to:'a6'}, highlight:['a1','a6'], arrows:[{from:'a1',to:'a6',color:'gold'}], allowAnyMove:false,
      successMessage:'The Ratha exploits the asymmetry!', wrongMessage:'Advance the Ratha deep into enemy territory.' }
  ]
},
{
  id:'L017', title:'The Dice Zugzwang', category:'advanced', difficulty:'advanced',
  culturalSource:'Bhagavad Gita 2.47 — Sometimes action harms, inaction helps',
  moralLesson:'Force the enemy into a position where any dice roll hurts them.',
  completionReward:'Mastery Badge — The Gita\'s Paradox',
  steps:[
    { step:1, narration:'Zugzwang: a state where any move the opponent makes worsens their position. In Chaturanga, control the board so every dice roll for the enemy is painful.', instruction:'Move the Ratha to restrict all of the enemy\'s options.',
      expectedDice:1, expectedMove:{from:'h1',to:'h7'}, highlight:['h1','h7'], arrows:[{from:'h1',to:'h7',color:'gold'}], allowAnyMove:false,
      successMessage:'The enemy is in zugzwang — every roll hurts!', wrongMessage:'Move the Ratha to cut off all escape ranks.' }
  ]
},
{
  id:'L018', title:'Multi-Piece Combination', category:'advanced', difficulty:'advanced',
  culturalSource:'Mahabharata — The Chakravyuha Formation',
  moralLesson:'The Chakravyuha: pieces working in sequence, each supporting the next.',
  completionReward:'Grandmaster Badge — The Chakravyuha',
  steps:[
    { step:1, narration:'The most powerful attacks use multiple pieces in sequence. Like the Chakravyuha at Kurukshetra, each piece enables the next.', instruction:'Move the horse to create the threat.',
      expectedDice:3, expectedMove:{from:'c3',to:'e4'}, highlight:['c3','e4'], arrows:[{from:'c3',to:'e4',color:'gold'}], allowAnyMove:false,
      successMessage:'Step 1 complete — the horse sets the stage!', wrongMessage:'Jump the Ashwa to e4.' },
    { step:2, narration:'Now the Ratha follows the Ashwa\'s threat to seal the position.', instruction:'Advance the Ratha to e1.',
      expectedDice:1, expectedMove:{from:'a1',to:'e1'}, highlight:['a1','e1'], arrows:[{from:'a1',to:'e1',color:'gold'}], allowAnyMove:false,
      successMessage:'The Chakravyuha is complete! A multi-piece masterpiece.', wrongMessage:'Slide the Ratha to e1 along rank 1.' }
  ]
}
];
