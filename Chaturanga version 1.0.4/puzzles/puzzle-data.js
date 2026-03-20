globalThis.ChaturangaPuzzleData = [
// ── Win-in-2 (4) ──────────────────────────────────────────────────────────
{
  id:'P001', title:"Ratha's Last Stand", type:'win-in-2', rating:350,
  forcedDice:[1,1],
  boardState:{ 'a1':'0:rook','h1':'1:king','d4':'1:rook','e5':'0:king' },
  turnIndex:0,
  solution:[{from:'a1',to:'h1'},{from:'a1',to:'a8'}],
  hint:['Move the Ratha along rank 1','The Ratha controls the file'],
  moralLesson:"Like Arjuna's precise arrow, one decisive move decides the battle. — Mahabharata"
},
{
  id:'P002', title:'Mounted Assault', type:'win-in-2', rating:420,
  forcedDice:[3,6],
  boardState:{ 'e4':'0:horse','g5':'1:king','f7':'1:rook','b2':'0:king' },
  turnIndex:0,
  solution:[{from:'e4',to:'f6'},{from:'b2',to:'c3'}],
  hint:['The Ashwa threatens from f6','Advance the Raja to support'],
  moralLesson:"The warrior who controls the centre controls the war. — Chanakya Niti"
},
{
  id:'P003', title:'Double Threat', type:'win-in-2', rating:500,
  forcedDice:[1,4],
  boardState:{ 'a8':'0:rook','c6':'0:elephant','h8':'1:king','h4':'1:rook','e1':'0:king' },
  turnIndex:0,
  solution:[{from:'a8',to:'h8'},{from:'c6',to:'e4'}],
  hint:['Capture the enemy Raja','The Danti forks from e4'],
  moralLesson:"Strike at two opponents with one action. — Chanakya Niti, Arthashastra"
},
{
  id:'P004', title:'The Closing Net', type:'win-in-2', rating:600,
  forcedDice:[1,3],
  boardState:{ 'd1':'0:rook','d8':'1:king','f5':'0:horse','h5':'1:horse','a1':'0:king' },
  turnIndex:0,
  solution:[{from:'d1',to:'d8'},{from:'f5',to:'h6'}],
  hint:['The Ratha checks the Raja','Knight to h6 delivers the final threat'],
  moralLesson:"Patience in the hunt leads to the decisive moment. — Panchatantra"
},
// ── Save-the-Raja (4) ─────────────────────────────────────────────────────
{
  id:'P005', title:'Raja in Peril', type:'save-the-raja', rating:200,
  forcedDice:[6],
  boardState:{ 'd4':'0:king','d7':'1:rook','g4':'1:rook','a1':'0:rook','c1':'0:elephant' },
  turnIndex:0,
  solution:[{from:'d4',to:'c4'}],
  hint:['Move the Raja away from the rook file'],
  moralLesson:"A wise king retreats when surrounded, to fight another day. — Ramayana"
},
{
  id:'P006', title:'Escape from the Elephant', type:'save-the-raja', rating:280,
  forcedDice:[6],
  boardState:{ 'f4':'0:king','d2':'1:elephant','h4':'1:elephant','c4':'0:rook','a8':'0:horse' },
  turnIndex:0,
  solution:[{from:'f4',to:'f5'}],
  hint:['The king must side-step both elephant threats'],
  moralLesson:"Know when to move and when to stand. — Bhagavad Gita 2.47"
},
{
  id:'P007', title:'The Cornered Raja', type:'save-the-raja', rating:380,
  forcedDice:[6,1],
  boardState:{ 'a1':'0:king','c2':'1:horse','b3':'1:rook','d1':'1:elephant','a4':'0:rook' },
  turnIndex:0,
  solution:[{from:'a4',to:'b4'},{from:'a1',to:'a2'}],
  hint:['Block with the Ratha first','Then the Raja escapes'],
  moralLesson:"Use your allies as shields. — Mahabharata, Kurukshetra"
},
{
  id:'P008', title:'Guardian of the Throne', type:'save-the-raja', rating:480,
  forcedDice:[1,3],
  boardState:{ 'e1':'0:king','h1':'1:rook','e5':'1:horse','b4':'0:rook','c3':'0:horse' },
  turnIndex:0,
  solution:[{from:'b4',to:'h4'},{from:'c3',to:'e4'}],
  hint:['Interpose the Ratha on the first rank','Knight covers e5 threats'],
  moralLesson:"Unity of forces determines the outcome. — Chanakya Niti"
},
// ── Ratha Hunt (4) ────────────────────────────────────────────────────────
{
  id:'P009', title:'Hunt the Ratha', type:'ratha-hunt', rating:180,
  forcedDice:[1],
  boardState:{ 'a1':'0:rook','e1':'1:rook','e5':'1:king','a5':'0:king' },
  turnIndex:0,
  solution:[{from:'a1',to:'e1'}],
  hint:['Take the exposed Ratha'],
  moralLesson:"Strike the enemy's strength, not just their weakness. — Arthashastra"
},
{
  id:'P010', title:'The Fleeing Ratha', type:'ratha-hunt', rating:300,
  forcedDice:[1,3],
  boardState:{ 'a3':'0:rook','e3':'1:rook','g4':'0:horse','h8':'1:king','e1':'0:king' },
  turnIndex:0,
  solution:[{from:'a3',to:'e3'},{from:'g4',to:'f2'}],
  hint:['Take the rook first','Then the horse controls the centre'],
  moralLesson:"Do not let the enemy regroup. — Chanakya Niti"
},
{
  id:'P011', title:'Ratha Sacrifice Trap', type:'ratha-hunt', rating:450,
  forcedDice:[1,4],
  boardState:{ 'f6':'0:rook','f1':'1:rook','c3':'0:elephant','h6':'1:king','a8':'0:king' },
  turnIndex:0,
  solution:[{from:'f6',to:'f1'},{from:'c3',to:'e5'}],
  hint:['Capture the rook on f1','Danti creates a fork from e5'],
  moralLesson:"A sacrifice that gains more is wisdom. — Bhagavad Gita"
},
{
  id:'P012', title:'Open File Domination', type:'ratha-hunt', rating:550,
  forcedDice:[1,1],
  boardState:{ 'a1':'0:rook','a5':'0:rook','a7':'1:rook','b7':'1:king','e1':'0:king' },
  turnIndex:0,
  solution:[{from:'a1',to:'a7'},{from:'a5',to:'a7'}],
  hint:['Capture on a7','Double rooks take control'],
  moralLesson:"Dominate the path, dominate the battle. — Arthashastra IV"
},
// ── Danti Fork (3) ───────────────────────────────────────────────────────
{
  id:'P013', title:"The Elephant's Leap", type:'danti-fork', rating:250,
  forcedDice:[4],
  boardState:{ 'c1':'0:elephant','a3':'1:rook','e3':'1:horse','d5':'0:king','h5':'1:king' },
  turnIndex:0,
  solution:[{from:'c1',to:'e3'}],
  hint:['The Danti forks from e3'],
  moralLesson:"One move, two threats. — Panchatantra"
},
{
  id:'P014', title:'Diagonal Devastation', type:'danti-fork', rating:400,
  forcedDice:[4,1],
  boardState:{ 'b2':'0:elephant','d4':'1:king','f4':'1:rook','a1':'0:rook','g7':'0:king' },
  turnIndex:0,
  solution:[{from:'b2',to:'d4'},{from:'a1',to:'f1'}],
  hint:['Danti hits the enemy king','Then the Ratha enters the attack'],
  moralLesson:"Land the first blow where it hurts most. — Chanakya Niti"
},
{
  id:'P015', title:'Twin Threats', type:'danti-fork', rating:550,
  forcedDice:[4,6],
  boardState:{ 'e4':'0:elephant','c6':'1:rook','g6':'1:horse','c2':'0:king','h1':'1:king' },
  turnIndex:0,
  solution:[{from:'e4',to:'g6'},{from:'c2',to:'d3'}],
  hint:['Capture the horse with the Danti','Raja advances to support'],
  moralLesson:"Destroy the enemy's mobility first. — Arthashastra"
},
// ── Stalemate Trap (3) ────────────────────────────────────────────────────
{
  id:'P016', title:'The Frozen King', type:'stalemate-trap', rating:350,
  forcedDice:[6,1],
  boardState:{ 'h8':'1:king','g7':'0:rook','f6':'0:king','g8':'0:pawn' },
  turnIndex:0,
  solution:[{from:'g7',to:'g6'},{from:'f6',to:'g6'}],
  hint:['Rook cuts off escape squares','King closes the trap'],
  moralLesson:"Surround before you strike. — Kautilya's Arthashastra"
},
{
  id:'P017', title:'Zugzwang on the Ashtāpada', type:'stalemate-trap', rating:480,
  forcedDice:[1,6],
  boardState:{ 'a8':'1:king','a6':'0:rook','b7':'0:pawn','c8':'0:king','b8':'0:pawn' },
  turnIndex:0,
  solution:[{from:'a6',to:'b6'},{from:'c8',to:'b8'}],
  hint:['Rook blocks on b6','The pawn completes the cage'],
  moralLesson:"Sometimes making no move is worse than any move. — Bhagavad Gita"
},
{
  id:'P018', title:'The Corner Trap', type:'stalemate-trap', rating:600,
  forcedDice:[1,3],
  boardState:{ 'a8':'1:king','c7':'0:rook','b6':'0:king','d8':'1:rook','h1':'1:horse' },
  turnIndex:0,
  solution:[{from:'c7',to:'a7'},{from:'b6',to:'c6'}],
  hint:['Block the a-file','King moves to tighten the net'],
  moralLesson:"Complete encirclement ends the war. — Ramayana, Lanka Siege"
},
// ── Alliance Combo (2) ────────────────────────────────────────────────────
{
  id:'P019', title:'Brothers in Arms', type:'alliance-combo', rating:430,
  forcedDice:[1,3],
  boardState:{ 'a1':'0:rook','e5':'2:horse','h5':'1:king','h8':'1:rook','d1':'0:king','e8':'2:king' },
  turnIndex:0,
  solution:[{from:'a1',to:'h1'},{from:'e5',to:'g6'}],
  hint:['Ally Ratha controls the h-file','Ally horse applies pressure from g6'],
  moralLesson:"United we stand — the Pandava brothers of Mahabharata were strongest together."
},
{
  id:'P020', title:'The Vanara Formation', type:'alliance-combo', rating:580,
  forcedDice:[4,1],
  boardState:{ 'b2':'0:elephant','d4':'2:elephant','f6':'1:king','a1':'0:king','h8':'2:king','h1':'1:rook','c5':'1:horse' },
  turnIndex:0,
  solution:[{from:'b2',to:'d4'},{from:'d4',to:'f6'}],
  hint:['Coordinate the two Dantis','Final leap captures the enemy Raja'],
  moralLesson:"Rama's Vanara Sena prevailed through coordination. — Ramayana, Yuddha Kanda"
},
// ── Nara March (4) ─────────────────────────────────────────────────────────
{
  id:'P021', title:'The Advancing Foot Soldier', type:'nara-march', rating:120,
  forcedDice:[6],
  boardState:{ 'c2':'0:pawn','c8':'1:king','a1':'0:king','h1':'1:rook' },
  turnIndex:0,
  solution:[{from:'c2',to:'c3'}],
  hint:['Advance the Nara forward one step'],
  moralLesson:"Every great war begins with a single step. — Arthashastra I"
},
{
  id:'P022', title:'Promotion March', type:'nara-march', rating:220,
  forcedDice:[6,6],
  boardState:{ 'd7':'0:pawn','e1':'0:king','h8':'1:king','c7':'1:pawn','a8':'1:rook' },
  turnIndex:0,
  solution:[{from:'d7',to:'d8'},{from:'e1',to:'d1'}],
  hint:['The Nara promotes on d8','Raja steps aside to make room'],
  moralLesson:"Growth through perseverance brings new power. — Bhagavad Gita 6.35"
},
{
  id:'P023', title:'March to Glory', type:'nara-march', rating:310,
  forcedDice:[6,1],
  boardState:{ 'b6':'0:pawn','b7':'0:pawn','h7':'1:king','b8':'1:rook','a1':'0:king' },
  turnIndex:0,
  solution:[{from:'b7',to:'b8'},{from:'a1',to:'b1'}],
  hint:['Promote the pawn immediately on b8','Rook supports from b1'],
  moralLesson:"The humble Nara, when promoted, equals the Raja himself. — Chaturanga Lore"
},
{
  id:'P024', title:'The Unstoppable Nara', type:'nara-march', rating:430,
  forcedDice:[6,4],
  boardState:{ 'e6':'0:pawn','g6':'1:horse','e8':'1:king','d5':'0:king','c3':'0:elephant' },
  turnIndex:0,
  solution:[{from:'e6',to:'e7'},{from:'c3',to:'e5'}],
  hint:['Nara advances to e7 — nearly promoted','Danti forks from e5'],
  moralLesson:"Threaten on two fronts and force a mistake. — Chanakya Niti"
},
// ── Ashwa Fork (4) ─────────────────────────────────────────────────────────
{
  id:'P025', title:"The Horse's Gambit", type:'ashwa-fork', rating:160,
  forcedDice:[3],
  boardState:{ 'e4':'0:horse','d6':'1:rook','f6':'1:king','b1':'0:king' },
  turnIndex:0,
  solution:[{from:'e4',to:'f6'}],
  hint:['The Ashwa simultaneously threatens the Ratha and checks the Raja'],
  moralLesson:"Strike two targets with one leap. — Panchatantra, Book III"
},
{
  id:'P026', title:"Knight's Web", type:'ashwa-fork', rating:280,
  forcedDice:[3,6],
  boardState:{ 'c3':'0:horse','a4':'1:rook','e4':'1:king','g1':'0:king','h6':'1:horse' },
  turnIndex:0,
  solution:[{from:'c3',to:'e4'},{from:'g1',to:'f2'}],
  hint:['Horse captures the enemy Raja','Raja advances to close the net'],
  moralLesson:"Speed and precision win more battles than brute strength. — Arthashastra"
},
{
  id:'P027', title:'The Dual Strike', type:'ashwa-fork', rating:370,
  forcedDice:[3,1],
  boardState:{ 'b1':'0:horse','d2':'1:rook','a3':'1:king','c5':'0:king','h8':'1:elephant' },
  turnIndex:0,
  solution:[{from:'b1',to:'c3'},{from:'c5',to:'d4'}],
  hint:['Horse leaps to c3 — forking Ratha and Raja squares','Raja advances to support'],
  moralLesson:"Victory belongs to those who control two diagonals at once. — Kautilya"
},
{
  id:'P028', title:"Ashwa's Final Leap", type:'ashwa-fork', rating:490,
  forcedDice:[3,4],
  boardState:{ 'g5':'0:horse','h7':'1:king','f7':'1:rook','e3':'0:king','b3':'0:elephant' },
  turnIndex:0,
  solution:[{from:'g5',to:'h7'},{from:'b3',to:'d5'}],
  hint:['Horse checks the Raja on h7','Danti threatens from d5'],
  moralLesson:"Relentless pressure marks the brilliant general. — Mahabharata, Drona Parva"
},
// ── King-Hunt (4) ──────────────────────────────────────────────────────────
{
  id:'P029', title:"The Raja's Doom", type:'king-hunt', rating:140,
  forcedDice:[1],
  boardState:{ 'a1':'0:rook','e1':'1:king','h1':'1:rook','d1':'0:king','f5':'1:horse' },
  turnIndex:0,
  solution:[{from:'a1',to:'e1'}],
  hint:['The Ratha delivers the decisive blow on e1'],
  moralLesson:"An exposed king is a defeated king. — Arthashastra VII"
},
{
  id:'P030', title:'Cornering the Raja', type:'king-hunt', rating:260,
  forcedDice:[3,1],
  boardState:{ 'h2':'0:horse','g4':'1:king','a4':'0:king','d5':'0:rook','f6':'1:pawn' },
  turnIndex:0,
  solution:[{from:'h2',to:'f3'},{from:'d5',to:'g5'}],
  hint:['Horse moves to f3 cutting escape squares','Ratha seals the cage on g5'],
  moralLesson:"Encircle before you capture. — Kautilya, Arthashastra X"
},
{
  id:'P031', title:'The Trap Closes', type:'king-hunt', rating:390,
  forcedDice:[4,1],
  boardState:{ 'c3':'0:elephant','e5':'1:king','e2':'0:rook','a1':'0:king','h8':'1:horse' },
  turnIndex:0,
  solution:[{from:'c3',to:'e5'},{from:'e2',to:'e5'}],
  hint:['Danti strikes the enemy Raja','Ratha recaptures — the king is gone'],
  moralLesson:"Sacrifice that captures the king is the greatest. — Mahabharata"
},
{
  id:'P032', title:'The Final Chase', type:'king-hunt', rating:520,
  forcedDice:[3,6],
  boardState:{ 'e4':'0:horse','g5':'1:king','f7':'0:rook','a1':'0:king','h3':'1:elephant','c6':'1:pawn' },
  turnIndex:0,
  solution:[{from:'e4',to:'f6'},{from:'f7',to:'f5'}],
  hint:['Horse to f6 — forks king options','Ratha seals escape on f5'],
  moralLesson:"Chase without mercy; hesitation gives the enemy time. — Drona"
},
// ── Material-Gain (4) ──────────────────────────────────────────────────────
{
  id:'P033', title:'The Free Ratha', type:'material-gain', rating:130,
  forcedDice:[1],
  boardState:{ 'a1':'0:rook','h1':'1:rook','d4':'0:king','h5':'1:king' },
  turnIndex:0,
  solution:[{from:'a1',to:'h1'}],
  hint:['The enemy Ratha is undefended — capture it'],
  moralLesson:"Never ignore a free prize on the battlefield. — Panchatantra I"
},
{
  id:'P034', title:'Win the Exchange', type:'material-gain', rating:240,
  forcedDice:[4,3],
  boardState:{ 'b2':'0:elephant','d4':'1:horse','d8':'1:king','a1':'0:rook','c1':'0:king' },
  turnIndex:0,
  solution:[{from:'b2',to:'d4'},{from:'a1',to:'d1'}],
  hint:['Danti captures the Ashwa','Ratha centralises with tempo'],
  moralLesson:"Trade wisely when you gain position. — Arthashastra"
},
{
  id:'P035', title:'Skewer and Win', type:'material-gain', rating:360,
  forcedDice:[1,1],
  boardState:{ 'c4':'0:rook','c8':'1:king','c6':'1:rook','a1':'0:king' },
  turnIndex:0,
  solution:[{from:'c4',to:'c8'},{from:'c8',to:'c6'}],
  hint:['Rook attacks the king on c8','After the king flees win the Ratha on c6'],
  moralLesson:"Pierce through the leader to wound the army behind. — Arthashastra IX"
},
{
  id:'P036', title:'The Winning Capture', type:'material-gain', rating:470,
  forcedDice:[4,3],
  boardState:{ 'e3':'0:elephant','f5':'1:rook','g7':'0:horse','h8':'1:king','b1':'0:king','d6':'1:horse' },
  turnIndex:0,
  solution:[{from:'e3',to:'g5'},{from:'g7',to:'f5'}],
  hint:['Danti threatens from g5','Horse captures the Ratha on f5'],
  moralLesson:"Coordinate forces to seize material advantage. — Chanakya Niti"
},
// ── Win-in-1 (4) ───────────────────────────────────────────────────────────
{
  id:'P037', title:'One Move Wonder', type:'win-in-1', rating:100,
  forcedDice:[1],
  boardState:{ 'h1':'0:rook','h8':'1:king','a8':'1:rook','e1':'0:king' },
  turnIndex:0,
  solution:[{from:'h1',to:'h8'}],
  hint:['One decisive move ends the game'],
  moralLesson:"The simplest path is often the most powerful. — Bhagavad Gita 3.19"
},
{
  id:'P038', title:'Decisive Blow', type:'win-in-1', rating:150,
  forcedDice:[3],
  boardState:{ 'e2':'0:horse','f4':'1:king','d6':'0:king','h8':'1:elephant','c4':'1:pawn' },
  turnIndex:0,
  solution:[{from:'e2',to:'f4'}],
  hint:['The Ashwa captures the Raja directly'],
  moralLesson:"Hesitation is the enemy's greatest weapon. — Dronacharya"
},
{
  id:'P039', title:"The Raja's Final Square", type:'win-in-1', rating:200,
  forcedDice:[6],
  boardState:{ 'g7':'0:king','g8':'1:king','f8':'0:pawn','f7':'0:rook','h6':'1:rook' },
  turnIndex:0,
  solution:[{from:'g7',to:'g8'}],
  hint:['The Raja captures the enemy king directly'],
  moralLesson:"Boldness in the final moment separates victors from the defeated. — Mahabharata"
},
{
  id:'P040', title:'The Last Stand', type:'win-in-1', rating:300,
  forcedDice:[1],
  boardState:{ 'd1':'0:rook','d8':'1:king','e4':'0:king','h4':'1:rook','g7':'1:horse' },
  turnIndex:0,
  solution:[{from:'d1',to:'d8'}],
  hint:['The Ratha delivers the winning strike on d8'],
  moralLesson:"The war ends where the Raja falls. — Ancient Chaturanga Tradition"
}
];
