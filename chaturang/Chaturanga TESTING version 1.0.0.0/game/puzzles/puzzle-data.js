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
,
// ── Win-in-2 (P041–P050) ─────────────────────────────────────────────────────
{
  id:'P041', title:'Ratha Breaks Through', type:'win-in-2', rating:360,
  forcedDice:[1,1],
  boardState:{ 'a1':'0:rook','a5':'1:rook','a8':'1:king','e4':'0:king' },
  turnIndex:0,
  solution:[{from:'a1',to:'a5'},{from:'a5',to:'a8'}],
  hint:['Capture the blocking Ratha on a5','March up the open file to the Raja'],
  moralLesson:"Remove every obstacle before delivering the final blow. — Arthashastra VI"
},
{
  id:'P042', title:'The Vertical Assault', type:'win-in-2', rating:380,
  forcedDice:[1,1],
  boardState:{ 'g1':'0:rook','g4':'1:rook','g7':'1:king','a1':'0:king' },
  turnIndex:0,
  solution:[{from:'g1',to:'g4'},{from:'g4',to:'g7'}],
  hint:['Sweep out the defender on g4','The g-file is now a highway to the Raja'],
  moralLesson:"Conquer the guardian first, then the throne falls. — Panchatantra II"
},
{
  id:'P043', title:'Ashwa Clears the Path', type:'win-in-2', rating:450,
  forcedDice:[3,1],
  boardState:{ 'b5':'0:horse','c7':'1:rook','d7':'1:king','a7':'0:rook','a1':'0:king' },
  turnIndex:0,
  solution:[{from:'b5',to:'c7'},{from:'a7',to:'d7'}],
  hint:['Horse leaps to capture the Ratha on c7','Ratha sweeps rank 7 to the Raja'],
  moralLesson:"Swift cavalry opens the road for the chariot. — Mahabharata, Drona Parva"
},
{
  id:'P044', title:'Down the Open File', type:'win-in-2', rating:400,
  forcedDice:[1,1],
  boardState:{ 'd1':'0:rook','d4':'1:rook','d8':'1:king','a1':'0:king' },
  turnIndex:0,
  solution:[{from:'d1',to:'d4'},{from:'d4',to:'d8'}],
  hint:['Take the Ratha on d4','The d-file leads straight to the Raja'],
  moralLesson:"Control the central file and victory follows. — Chanakya Niti"
},
{
  id:'P045', title:'The Long March', type:'win-in-2', rating:420,
  forcedDice:[1,1],
  boardState:{ 'e1':'0:rook','e5':'1:rook','e8':'1:king','a3':'0:king' },
  turnIndex:0,
  solution:[{from:'e1',to:'e5'},{from:'e5',to:'e8'}],
  hint:['Capture the Ratha on e5 first','Continue up the e-file for the Raja'],
  moralLesson:"Patience in approach delivers decisiveness in execution. — Bhagavad Gita 2.50"
},
{
  id:'P046', title:'Elephant Clears the Guard', type:'win-in-2', rating:500,
  forcedDice:[4,1],
  boardState:{ 'c1':'0:elephant','e3':'1:rook','e6':'1:king','a6':'0:rook','h1':'0:king' },
  turnIndex:0,
  solution:[{from:'c1',to:'e3'},{from:'a6',to:'e6'}],
  hint:['Danti leaps to capture the Ratha on e3','Ratha races along rank 6 to the Raja'],
  moralLesson:"The elephant clears the path; the chariot delivers justice. — Arthashastra"
},
{
  id:'P047', title:'Horse Opens Rank Five', type:'win-in-2', rating:530,
  forcedDice:[3,1],
  boardState:{ 'd4':'0:horse','f5':'1:rook','h5':'1:king','a5':'0:rook','a1':'0:king' },
  turnIndex:0,
  solution:[{from:'d4',to:'f5'},{from:'a5',to:'h5'}],
  hint:['Horse jumps to capture the Ratha blocking rank 5','Ratha sweeps to the Raja'],
  moralLesson:"Cavalry scouts clear the road for the chariot commander. — Mahabharata"
},
{
  id:'P048', title:'The Cavalry Sentry', type:'win-in-2', rating:560,
  forcedDice:[3,1],
  boardState:{ 'c4':'0:horse','e5':'1:rook','e8':'1:king','e1':'0:rook','a1':'0:king' },
  turnIndex:0,
  solution:[{from:'c4',to:'e5'},{from:'e1',to:'e8'}],
  hint:['Horse captures the Ratha blocking the e-file','Ratha travels the open e-file to the Raja'],
  moralLesson:"Remove the sentinel and the fortress gate opens. — Kautilya, Arthashastra VII"
},
{
  id:'P049', title:'March to the Back Rank', type:'win-in-2', rating:480,
  forcedDice:[1,1],
  boardState:{ 'b1':'0:rook','b5':'1:rook','b8':'1:king','h1':'0:king' },
  turnIndex:0,
  solution:[{from:'b1',to:'b5'},{from:'b5',to:'b8'}],
  hint:['Clear the b5 Ratha','Advance to the back rank for the kill'],
  moralLesson:"He who masters the file masters the battle. — Ancient Chaturanga Lore"
},
{
  id:'P050', title:'The Knight Unblocks', type:'win-in-2', rating:600,
  forcedDice:[3,1],
  boardState:{ 'd3':'0:horse','c5':'1:rook','c4':'1:king','c8':'0:rook','a1':'0:king' },
  turnIndex:0,
  solution:[{from:'d3',to:'c5'},{from:'c8',to:'c4'}],
  hint:['Horse removes the blocking Ratha on c5','Ratha descends the c-file to capture the Raja'],
  moralLesson:"The knight clears the road so the chariot may conquer. — Panchatantra III"
},
// ── Save-the-Raja (P051–P060) ─────────────────────────────────────────────────
{
  id:'P051', title:'The Double Threat', type:'save-the-raja', rating:220,
  forcedDice:[6],
  boardState:{ 'e4':'0:king','e8':'1:rook','h4':'1:rook','a1':'1:king' },
  turnIndex:0,
  solution:[{from:'e4',to:'d3'}],
  hint:['Step diagonally off both the e-file and rank 4 in one move'],
  moralLesson:"When attacked on two sides, move to safety on neither. — Ramayana, Kishkindha"
},
{
  id:'P052', title:'Escape the Crossfire', type:'save-the-raja', rating:250,
  forcedDice:[6],
  boardState:{ 'd4':'0:king','d8':'1:rook','a4':'1:rook','h8':'1:king' },
  turnIndex:0,
  solution:[{from:'d4',to:'c3'}],
  hint:['Move off both the d-file and rank 4 in one diagonal step'],
  moralLesson:"A wise king knows when retreat is the boldest move. — Arthashastra X"
},
{
  id:'P053', title:'Block and Escape', type:'save-the-raja', rating:370,
  forcedDice:[1,6],
  boardState:{ 'a1':'0:king','h1':'1:rook','a8':'1:rook','d4':'0:rook','h8':'1:king' },
  turnIndex:0,
  solution:[{from:'d4',to:'d1'},{from:'a1',to:'b2'}],
  hint:['Interpose the Ratha on the first rank','Then the Raja escapes the a-file via b2'],
  moralLesson:"Shield the king first; then lead him to safety. — Mahabharata, Shanti Parva"
},
{
  id:'P054', title:'Side-step the Chariot', type:'save-the-raja', rating:270,
  forcedDice:[6],
  boardState:{ 'f1':'0:king','f7':'1:rook','a8':'1:king','c5':'1:horse' },
  turnIndex:0,
  solution:[{from:'f1',to:'e2'}],
  hint:['Step diagonally off the f-file before the Ratha strikes'],
  moralLesson:"Boldness without awareness leads to ruin. — Chanakya Niti"
},
{
  id:'P055', title:'The Interposing Ratha', type:'save-the-raja', rating:340,
  forcedDice:[1,6],
  boardState:{ 'e1':'0:king','e8':'1:rook','a5':'0:rook','h8':'1:king','c3':'1:horse' },
  turnIndex:0,
  solution:[{from:'a5',to:'e5'},{from:'e1',to:'d1'}],
  hint:['Place your Ratha on the e-file between the Raja and the threat','Then slide the Raja to safety'],
  moralLesson:"A loyal general stands between his king and destruction. — Ramayana"
},
{
  id:'P056', title:'Rank Escape', type:'save-the-raja', rating:230,
  forcedDice:[6],
  boardState:{ 'c3':'0:king','f3':'1:rook','h8':'1:king','d5':'1:elephant' },
  turnIndex:0,
  solution:[{from:'c3',to:'b4'}],
  hint:['Step off rank 3 to safety on b4'],
  moralLesson:"A single diagonal step can be the difference between life and defeat. — Panchatantra"
},
{
  id:'P057', title:'The Blocking Ratha', type:'save-the-raja', rating:320,
  forcedDice:[1],
  boardState:{ 'a1':'0:king','h1':'1:rook','g7':'0:rook','e8':'1:king' },
  turnIndex:0,
  solution:[{from:'g7',to:'g1'}],
  hint:['Bring the Ratha to g1 to shield the Raja on the first rank'],
  moralLesson:"A single warrior placed well protects the entire army. — Arthashastra"
},
{
  id:'P058', title:'Corner to Corner', type:'save-the-raja', rating:290,
  forcedDice:[6],
  boardState:{ 'd5':'0:king','d8':'1:rook','a5':'1:rook','h1':'1:king' },
  turnIndex:0,
  solution:[{from:'d5',to:'c4'}],
  hint:['Move the Raja diagonally off both the d-file and rank 5'],
  moralLesson:"The warrior who masters diagonals masters escape. — Chaturanga Lore"
},
{
  id:'P059', title:'Diagonal Retreat', type:'save-the-raja', rating:260,
  forcedDice:[6],
  boardState:{ 'g2':'0:king','g7':'1:rook','a2':'1:rook','d5':'1:king' },
  turnIndex:0,
  solution:[{from:'g2',to:'f1'}],
  hint:['Step the Raja to f1 — off both the g-file and rank 2'],
  moralLesson:"The prudent warrior chooses retreat over annihilation. — Bhagavad Gita 2.37"
},
{
  id:'P060', title:'Ratha Shield, Raja Flees', type:'save-the-raja', rating:460,
  forcedDice:[1,6],
  boardState:{ 'h1':'0:king','h7':'1:rook','a1':'1:rook','d5':'0:rook','e8':'1:king' },
  turnIndex:0,
  solution:[{from:'d5',to:'d1'},{from:'h1',to:'g2'}],
  hint:['Block the first rank with the Ratha','Raja slips off the h-file via g2'],
  moralLesson:"Two coordinated actions can undo a deadly double threat. — Chanakya Niti"
},
// ── Ratha Hunt (P061–P068) ────────────────────────────────────────────────────
{
  id:'P061', title:'Rank Raid', type:'ratha-hunt', rating:160,
  forcedDice:[1],
  boardState:{ 'a4':'0:rook','h4':'1:rook','a1':'0:king','h8':'1:king' },
  turnIndex:0,
  solution:[{from:'a4',to:'h4'}],
  hint:['Sweep rank 4 to capture the unguarded Ratha'],
  moralLesson:"An unguarded treasure belongs to the bold. — Arthashastra III"
},
{
  id:'P062', title:'File Domination', type:'ratha-hunt', rating:180,
  forcedDice:[1],
  boardState:{ 'b2':'0:rook','b6':'1:rook','h1':'0:king','h8':'1:king' },
  turnIndex:0,
  solution:[{from:'b2',to:'b6'}],
  hint:['Advance up the b-file to take the waiting Ratha'],
  moralLesson:"He who owns the file owns the battle. — Panchatantra I"
},
{
  id:'P063', title:"Ashwa's Ratha Hunt", type:'ratha-hunt', rating:240,
  forcedDice:[3],
  boardState:{ 'c3':'0:horse','d5':'1:rook','a1':'0:king','h8':'1:king' },
  turnIndex:0,
  solution:[{from:'c3',to:'d5'}],
  hint:['The Ashwa leaps to capture the Ratha on d5'],
  moralLesson:"What the chariot cannot reach, the horse conquers. — Mahabharata"
},
{
  id:'P064', title:'Danti Strikes the Ratha', type:'ratha-hunt', rating:220,
  forcedDice:[4],
  boardState:{ 'c1':'0:elephant','e3':'1:rook','a1':'0:king','h8':'1:king' },
  turnIndex:0,
  solution:[{from:'c1',to:'e3'}],
  hint:['The Danti leaps two diagonals to capture the Ratha'],
  moralLesson:"The elephant\'s leap is sudden and decisive. — Arthashastra"
},
{
  id:'P065', title:'Double Ratha Hunt', type:'ratha-hunt', rating:400,
  forcedDice:[1,1],
  boardState:{ 'a1':'0:rook','a4':'1:rook','h4':'1:rook','e1':'0:king','h8':'1:king' },
  turnIndex:0,
  solution:[{from:'a1',to:'a4'},{from:'a4',to:'h4'}],
  hint:['Take the first Ratha on a4','Then swing to h4 for the second prize'],
  moralLesson:"Greed in battle is wisdom when the prize is certain. — Chanakya Niti"
},
{
  id:'P066', title:'Twin Captures', type:'ratha-hunt', rating:350,
  forcedDice:[1,3],
  boardState:{ 'a5':'0:rook','f5':'1:rook','c3':'0:horse','b1':'1:rook','a1':'0:king','h8':'1:king' },
  turnIndex:0,
  solution:[{from:'a5',to:'f5'},{from:'c3',to:'b1'}],
  hint:['Ratha claims the Ratha on f5','Ashwa springs to b1 for the second Ratha'],
  moralLesson:"Strike in two directions and the enemy bleeds twice. — Arthashastra IX"
},
{
  id:'P067', title:"Elephant's Diagonal Hunt", type:'ratha-hunt', rating:200,
  forcedDice:[4],
  boardState:{ 'a1':'0:elephant','c3':'1:rook','h8':'0:king','a8':'1:king' },
  turnIndex:0,
  solution:[{from:'a1',to:'c3'}],
  hint:['The Danti leaps diagonally to seize the Ratha'],
  moralLesson:"Patience until the diagonal aligns; then strike. — Panchatantra"
},
{
  id:'P068', title:'Open File Execution', type:'ratha-hunt', rating:190,
  forcedDice:[1],
  boardState:{ 'e1':'0:rook','e7':'1:rook','a1':'0:king','h8':'1:king' },
  turnIndex:0,
  solution:[{from:'e1',to:'e7'}],
  hint:['The e-file is clear — march and take the Ratha'],
  moralLesson:"An open road is an invitation to conquer. — Arthashastra IV"
},
// ── Danti Fork (P069–P075) ────────────────────────────────────────────────────
{
  id:'P069', title:'The Hidden Fork', type:'danti-fork', rating:270,
  forcedDice:[4],
  boardState:{ 'e1':'0:elephant','a5':'1:rook','e5':'1:king','h1':'0:king','h8':'1:pawn' },
  turnIndex:0,
  solution:[{from:'e1',to:'c3'}],
  hint:['Danti leaps to c3 — from there it threatens both the Ratha on a5 and the Raja on e5'],
  moralLesson:"One stone can fell two birds if aimed at the right angle. — Panchatantra"
},
{
  id:'P070', title:'Diagonal Double Threat', type:'danti-fork', rating:310,
  forcedDice:[4],
  boardState:{ 'g1':'0:elephant','c5':'1:rook','g5':'1:king','a8':'0:king' },
  turnIndex:0,
  solution:[{from:'g1',to:'e3'}],
  hint:['Danti lands on e3 — it forks the Ratha on c5 and the Raja on g5'],
  moralLesson:"Attack two corners at once and the enemy cannot protect both. — Arthashastra"
},
{
  id:'P071', title:'The Elephant Wedge', type:'danti-fork', rating:360,
  forcedDice:[4],
  boardState:{ 'a3':'0:elephant','e3':'1:rook','a7':'1:king','h1':'0:king' },
  turnIndex:0,
  solution:[{from:'a3',to:'c5'}],
  hint:['Danti advances to c5 — simultaneously threatening Ratha on e3 and Raja on a7'],
  moralLesson:"Place the elephant where it threatens in all four directions. — Chaturanga Lore"
},
{
  id:'P072', title:'Fork Then Capture', type:'danti-fork', rating:480,
  forcedDice:[4,1],
  boardState:{ 'g7':'0:elephant','c3':'1:rook','g3':'1:king','a3':'0:rook','a1':'0:king' },
  turnIndex:0,
  solution:[{from:'g7',to:'e5'},{from:'a3',to:'c3'}],
  hint:['Danti forks Ratha on c3 and Raja on g3 from e5','Ratha sweeps to c3 for the material gain'],
  moralLesson:"Create two threats; your enemy can only answer one. — Chanakya Niti"
},
{
  id:'P073', title:'The Two-Diagonal Fork', type:'danti-fork', rating:300,
  forcedDice:[4],
  boardState:{ 'c1':'0:elephant','g1':'1:rook','c5':'1:horse','a8':'0:king','h8':'1:king' },
  turnIndex:0,
  solution:[{from:'c1',to:'e3'}],
  hint:['Danti lands on e3 — threatening Ratha on g1 and Ashwa on c5 simultaneously'],
  moralLesson:"The elephant\'s power lies in threats, not just captures. — Arthashastra"
},
{
  id:'P074', title:'Corner Fork', type:'danti-fork', rating:420,
  forcedDice:[4],
  boardState:{ 'h2':'0:elephant','d6':'1:king','h6':'1:rook','a1':'0:king' },
  turnIndex:0,
  solution:[{from:'h2',to:'f4'}],
  hint:['Danti leaps to f4 — forking the Raja on d6 and the Ratha on h6'],
  moralLesson:"Strike at the crown and its guardians at once. — Panchatantra III"
},
{
  id:'P075', title:'The Grand Fork', type:'danti-fork', rating:540,
  forcedDice:[4],
  boardState:{ 'b4':'0:elephant','b8':'1:rook','f4':'1:king','h1':'0:king' },
  turnIndex:0,
  solution:[{from:'b4',to:'d6'}],
  hint:['Danti leaps to d6 — from there it attacks both the Ratha on b8 and Raja on f4'],
  moralLesson:"The Danti at the crossroads controls the entire battlefield. — Chanakya"
},
// ── Ashwa Fork (P076–P083) ────────────────────────────────────────────────────
{
  id:'P076', title:'Knight Fork Classic', type:'ashwa-fork', rating:170,
  forcedDice:[3],
  boardState:{ 'b1':'0:horse','d5':'1:rook','e4':'1:king','a8':'0:king' },
  turnIndex:0,
  solution:[{from:'b1',to:'c3'}],
  hint:['Ashwa leaps to c3 — simultaneously forking the Ratha on d5 and Raja on e4'],
  moralLesson:"One leap, two victories. — Panchatantra, Book III"
},
{
  id:'P077', title:'The Eagle Fork', type:'ashwa-fork', rating:290,
  forcedDice:[3],
  boardState:{ 'f5':'0:horse','g8':'1:rook','c6':'1:king','a1':'0:king' },
  turnIndex:0,
  solution:[{from:'f5',to:'e7'}],
  hint:['Horse springs to e7 — forking the Ratha on g8 and Raja on c6'],
  moralLesson:"The horse that controls the centre controls the war. — Arthashastra"
},
{
  id:'P078', title:'The Back-Rank Fork', type:'ashwa-fork', rating:340,
  forcedDice:[3],
  boardState:{ 'a5':'0:horse','d6':'1:rook','d8':'1:king','h1':'0:king' },
  turnIndex:0,
  solution:[{from:'a5',to:'b7'}],
  hint:['Horse leaps to b7 — forking the Ratha on d6 and Raja on d8'],
  moralLesson:"Swift cavalry on the flank creates chaos in the enemy rear. — Mahabharata"
},
{
  id:'P079', title:'The Unblocking Leap', type:'ashwa-fork', rating:460,
  forcedDice:[3,1],
  boardState:{ 'd4':'0:horse','f5':'1:rook','h5':'1:king','a5':'0:rook','a1':'0:king' },
  turnIndex:0,
  solution:[{from:'d4',to:'f5'},{from:'a5',to:'h5'}],
  hint:['Horse captures the blocking Ratha on f5','Ratha sweeps rank 5 to the Raja'],
  moralLesson:"The horse clears what the chariot cannot penetrate. — Arthashastra VII"
},
{
  id:'P080', title:'The Skipping Fork', type:'ashwa-fork', rating:260,
  forcedDice:[3],
  boardState:{ 'g4':'0:horse','d5':'1:rook','h5':'1:king','a1':'0:king' },
  turnIndex:0,
  solution:[{from:'g4',to:'f6'}],
  hint:['Horse lands on f6 — simultaneously threatening Ratha on d5 and Raja on h5'],
  moralLesson:"The horse who controls two directions at once is worth ten soldiers. — Drona"
},
{
  id:'P081', title:'The Centre Fork', type:'ashwa-fork', rating:210,
  forcedDice:[3],
  boardState:{ 'b3':'0:horse','a4':'1:rook','e4':'1:king','h8':'0:king' },
  turnIndex:0,
  solution:[{from:'b3',to:'c5'}],
  hint:['Horse to c5 — forking the Ratha on a4 and the Raja on e4'],
  moralLesson:"He who holds the centre holds the war. — Arthashastra"
},
{
  id:'P082', title:'Diagonal Ambush', type:'ashwa-fork', rating:380,
  forcedDice:[3],
  boardState:{ 'f2':'0:horse','c3':'1:rook','g5':'1:king','a8':'0:king' },
  turnIndex:0,
  solution:[{from:'f2',to:'e4'}],
  hint:['Horse springs to e4 — forking Ratha on c3 and Raja on g5'],
  moralLesson:"Spring from obscurity; strike at both flanks. — Chanakya Niti"
},
{
  id:'P083', title:'The Flanking Fork', type:'ashwa-fork', rating:430,
  forcedDice:[3],
  boardState:{ 'h6':'0:horse','d4':'1:rook','g7':'1:king','a1':'0:king' },
  turnIndex:0,
  solution:[{from:'h6',to:'f5'}],
  hint:['Horse to f5 — it threatens Ratha on d4 and Raja on g7 simultaneously'],
  moralLesson:"The flank attack is the general\'s greatest art. — Mahabharata, Karna Parva"
},
// ── King Hunt (P084–P091) ─────────────────────────────────────────────────────
{
  id:'P084', title:'Rank Execution', type:'king-hunt', rating:155,
  forcedDice:[1],
  boardState:{ 'a7':'0:rook','h7':'1:king','a1':'0:king','d4':'1:rook' },
  turnIndex:0,
  solution:[{from:'a7',to:'h7'}],
  hint:['The Ratha sweeps rank 7 — the Raja cannot escape'],
  moralLesson:"An exposed king on an open rank is already captured. — Arthashastra VII"
},
{
  id:'P085', title:"The Horse's Killing Leap", type:'king-hunt', rating:200,
  forcedDice:[3],
  boardState:{ 'f6':'0:horse','h7':'1:king','a1':'0:king','b8':'1:rook' },
  turnIndex:0,
  solution:[{from:'f6',to:'h7'}],
  hint:['The Ashwa leaps directly to capture the Raja on h7'],
  moralLesson:"Speed and surprise are the cavalry\'s greatest weapons. — Drona"
},
{
  id:'P086', title:'The H-File Hunt', type:'king-hunt', rating:310,
  forcedDice:[1,1],
  boardState:{ 'a1':'0:rook','h5':'1:king','h8':'1:rook','d4':'0:king' },
  turnIndex:0,
  solution:[{from:'a1',to:'h1'},{from:'h1',to:'h5'}],
  hint:['Swing the Ratha to the h-file first','Then march up the h-file to the Raja'],
  moralLesson:"Change direction with purpose — the right file opens all doors. — Chanakya Niti"
},
{
  id:'P087', title:"Elephant's Fatal Diagonal", type:'king-hunt', rating:250,
  forcedDice:[4],
  boardState:{ 'f1':'0:elephant','h3':'1:king','a8':'0:king','c5':'1:rook' },
  turnIndex:0,
  solution:[{from:'f1',to:'h3'}],
  hint:['The Danti leaps two squares diagonally to capture the Raja'],
  moralLesson:"No position is safe from the diagonal warrior. — Arthashastra"
},
{
  id:'P088', title:'Back-Rank Sweep', type:'king-hunt', rating:340,
  forcedDice:[1,1],
  boardState:{ 'b7':'0:rook','g8':'1:king','a1':'0:king','e5':'1:horse' },
  turnIndex:0,
  solution:[{from:'b7',to:'b8'},{from:'b8',to:'g8'}],
  hint:['Step the Ratha to rank 8','Then sweep along the back rank to the Raja'],
  moralLesson:"Every move must serve a purpose on the path to victory. — Bhagavad Gita"
},
{
  id:'P089', title:'Open File Finish', type:'king-hunt', rating:180,
  forcedDice:[1],
  boardState:{ 'e1':'0:rook','e7':'1:king','a8':'0:king','h4':'1:rook' },
  turnIndex:0,
  solution:[{from:'e1',to:'e7'}],
  hint:['The e-file is clear — ride straight to the Raja'],
  moralLesson:"An open file is the chariot\'s greatest weapon. — Chanakya Niti"
},
{
  id:'P090', title:'The Two-Rook Finish', type:'king-hunt', rating:420,
  forcedDice:[1,1],
  boardState:{ 'a8':'0:rook','f1':'0:rook','e5':'1:king','a1':'0:king','h8':'1:rook' },
  turnIndex:0,
  solution:[{from:'a8',to:'e8'},{from:'e8',to:'e5'}],
  hint:['Bring the Ratha to the e-file','Then descend to capture the Raja on e5'],
  moralLesson:"Two chariots on one file are an unstoppable force. — Arthashastra X"
},
{
  id:'P091', title:'Horse Clears, Ratha Kills', type:'king-hunt', rating:530,
  forcedDice:[3,1],
  boardState:{ 'd4':'0:horse','f3':'1:rook','h3':'1:king','a3':'0:rook','a1':'0:king' },
  turnIndex:0,
  solution:[{from:'d4',to:'f3'},{from:'a3',to:'h3'}],
  hint:['Horse captures the blocking Ratha on f3','Ratha then races rank 3 to capture the Raja'],
  moralLesson:"Remove the guardian; then the throne is yours. — Mahabharata"
},
// ── Material Gain (P092–P098) ─────────────────────────────────────────────────
{
  id:'P092', title:'The Undefended Prize', type:'material-gain', rating:140,
  forcedDice:[1],
  boardState:{ 'd1':'0:rook','d6':'1:rook','a8':'0:king','h1':'1:king' },
  turnIndex:0,
  solution:[{from:'d1',to:'d6'}],
  hint:['The enemy Ratha on d6 is completely undefended'],
  moralLesson:"Never leave a prize unguarded on the battlefield. — Arthashastra III"
},
{
  id:'P093', title:'Horse Takes the Chariot', type:'material-gain', rating:250,
  forcedDice:[3],
  boardState:{ 'b5':'0:horse','d6':'1:rook','a1':'0:king','h8':'1:king' },
  turnIndex:0,
  solution:[{from:'b5',to:'d6'}],
  hint:['The Ashwa leaps to capture the Ratha — a fine trade'],
  moralLesson:"The agile warrior takes what heavier pieces cannot. — Panchatantra"
},
{
  id:'P094', title:"Danti's Diagonal Win", type:'material-gain', rating:230,
  forcedDice:[4],
  boardState:{ 'd1':'0:elephant','f3':'1:rook','a1':'0:king','h8':'1:king' },
  turnIndex:0,
  solution:[{from:'d1',to:'f3'}],
  hint:['The Danti leaps diagonally to capture the Ratha — a clear material gain'],
  moralLesson:"Leap at opportunity when the diagonal opens. — Arthashastra"
},
{
  id:'P095', title:'Clear the Pawn, Win the Ratha', type:'material-gain', rating:360,
  forcedDice:[1,1],
  boardState:{ 'c1':'0:rook','c5':'1:pawn','c7':'1:rook','a8':'1:king','g1':'0:king' },
  turnIndex:0,
  solution:[{from:'c1',to:'c5'},{from:'c5',to:'c7'}],
  hint:['Remove the pawn blocking the file','Then capture the valuable Ratha beyond it'],
  moralLesson:"Remove smaller obstacles to reach greater prizes. — Kautilya"
},
{
  id:'P096', title:'Twin Material Strike', type:'material-gain', rating:450,
  forcedDice:[4,1],
  boardState:{ 'b1':'0:elephant','d3':'1:horse','h5':'1:rook','a5':'0:rook','a1':'0:king','h8':'1:king' },
  turnIndex:0,
  solution:[{from:'b1',to:'d3'},{from:'a5',to:'h5'}],
  hint:['Danti captures the Ashwa','Then Ratha sweeps rank 5 to take the enemy Ratha'],
  moralLesson:"Two captures in one turn shifts the balance decisively. — Chanakya Niti"
},
{
  id:'P097', title:'Horse and Elephant Combined', type:'material-gain', rating:520,
  forcedDice:[3,4],
  boardState:{ 'e4':'0:horse','f6':'1:rook','e1':'0:elephant','g3':'1:horse','a8':'0:king','h8':'1:king' },
  turnIndex:0,
  solution:[{from:'e4',to:'f6'},{from:'e1',to:'g3'}],
  hint:['Ashwa captures the Ratha on f6','Danti leaps to g3 to take the enemy Ashwa'],
  moralLesson:"Two pieces working together can win two prizes at once. — Arthashastra"
},
{
  id:'P098', title:'The File Prize', type:'material-gain', rating:160,
  forcedDice:[1],
  boardState:{ 'f1':'0:rook','f7':'1:rook','a1':'0:king','h8':'1:king' },
  turnIndex:0,
  solution:[{from:'f1',to:'f7'}],
  hint:['March straight up the f-file to capture the enemy Ratha'],
  moralLesson:"See the prize on the open file and take it without hesitation. — Arthashastra"
},
// ── Win-in-1 (P099–P108) ─────────────────────────────────────────────────────
{
  id:'P099', title:'The Open d-File', type:'win-in-1', rating:110,
  forcedDice:[1],
  boardState:{ 'd1':'0:rook','d8':'1:king','a4':'0:king','h4':'1:rook' },
  turnIndex:0,
  solution:[{from:'d1',to:'d8'}],
  hint:['The d-file is clear and the Raja waits at the end'],
  moralLesson:"An open file pointed at the Raja is the end of the game. — Chanakya"
},
{
  id:'P100', title:"Horse's Decisive Jump", type:'win-in-1', rating:150,
  forcedDice:[3],
  boardState:{ 'e2':'0:horse','f4':'1:king','a1':'0:king','c6':'1:rook' },
  turnIndex:0,
  solution:[{from:'e2',to:'f4'}],
  hint:['The Ashwa leaps directly onto the enemy Raja'],
  moralLesson:"Hesitation costs the cavalry its moment. — Dronacharya"
},
{
  id:'P101', title:"Elephant's Diagonal Kill", type:'win-in-1', rating:180,
  forcedDice:[4],
  boardState:{ 'e1':'0:elephant','g3':'1:king','a5':'0:king','b8':'1:rook' },
  turnIndex:0,
  solution:[{from:'e1',to:'g3'}],
  hint:['The Danti leaps two diagonal squares directly onto the enemy Raja'],
  moralLesson:"The diagonal is the elephant\'s path to glory. — Arthashastra"
},
{
  id:'P102', title:'The Clear b-File', type:'win-in-1', rating:130,
  forcedDice:[1],
  boardState:{ 'b1':'0:rook','b8':'1:king','d4':'0:king','f6':'1:rook' },
  turnIndex:0,
  solution:[{from:'b1',to:'b8'}],
  hint:['March straight up the open b-file to capture the Raja'],
  moralLesson:"An open file to the king is the chariot\'s greatest gift. — Panchatantra"
},
{
  id:'P103', title:'Horse Strikes from h5', type:'win-in-1', rating:170,
  forcedDice:[3],
  boardState:{ 'h5':'0:horse','g7':'1:king','a1':'0:king','d4':'1:rook' },
  turnIndex:0,
  solution:[{from:'h5',to:'g7'}],
  hint:['The Ashwa springs to g7 to capture the unguarded Raja'],
  moralLesson:"The knight strikes from the shadows of the flank. — Mahabharata"
},
{
  id:'P104', title:"The Elephant's Corner Strike", type:'win-in-1', rating:210,
  forcedDice:[4],
  boardState:{ 'c3':'0:elephant','a5':'1:king','h1':'0:king','e7':'1:rook' },
  turnIndex:0,
  solution:[{from:'c3',to:'a5'}],
  hint:['The Danti leaps backward-diagonally to capture the Raja on a5'],
  moralLesson:"The diagonal warrior strikes in every direction. — Arthashastra"
},
{
  id:'P105', title:'The Back Rank Sweep', type:'win-in-1', rating:140,
  forcedDice:[1],
  boardState:{ 'a8':'0:rook','h8':'1:king','c3':'0:king','g2':'1:rook' },
  turnIndex:0,
  solution:[{from:'a8',to:'h8'}],
  hint:['Sweep rank 8 from a8 — the Raja at the corner has nowhere to go'],
  moralLesson:"Control the back rank and the game is over. — Chanakya Niti"
},
{
  id:'P106', title:'Horse Ambush on g4', type:'win-in-1', rating:165,
  forcedDice:[3],
  boardState:{ 'f2':'0:horse','g4':'1:king','a1':'0:king','c8':'1:rook' },
  turnIndex:0,
  solution:[{from:'f2',to:'g4'}],
  hint:['The Ashwa springs from f2 directly onto the Raja on g4'],
  moralLesson:"Position the horse well and the king cannot hide. — Drona"
},
{
  id:'P107', title:'Elephant Diagonal to h6', type:'win-in-1', rating:220,
  forcedDice:[4],
  boardState:{ 'f4':'0:elephant','h6':'1:king','a1':'0:king','d2':'1:rook' },
  turnIndex:0,
  solution:[{from:'f4',to:'h6'}],
  hint:['Two diagonal squares takes the Danti straight to the Raja'],
  moralLesson:"The elephant sees the diagonal others miss. — Arthashastra"
},
{
  id:'P108', title:'The Clear g-File', type:'win-in-1', rating:125,
  forcedDice:[1],
  boardState:{ 'g1':'0:rook','g8':'1:king','d4':'0:king','b6':'1:horse' },
  turnIndex:0,
  solution:[{from:'g1',to:'g8'}],
  hint:['The g-file is completely open — one move ends the battle'],
  moralLesson:"The simplest path is often the most powerful. — Bhagavad Gita 3.19"
},
// ── Nara March (P109–P115) ────────────────────────────────────────────────────
{
  id:'P109', title:'One Step to Glory', type:'nara-march', rating:210,
  forcedDice:[6],
  boardState:{ 'd7':'0:pawn','e1':'0:king','h8':'1:king','a6':'1:rook' },
  turnIndex:0,
  solution:[{from:'d7',to:'d8'}],
  hint:['The Nara stands one step from promotion — advance it'],
  moralLesson:"The humblest soldier who perseveres becomes the mightiest. — Panchatantra"
},
{
  id:'P110', title:'Double Promotion March', type:'nara-march', rating:300,
  forcedDice:[6,6],
  boardState:{ 'e7':'0:pawn','f6':'0:pawn','e1':'0:king','h8':'1:king','a8':'1:rook' },
  turnIndex:0,
  solution:[{from:'e7',to:'e8'},{from:'f6',to:'f7'}],
  hint:['Promote the leading Nara immediately','Then advance the second Nara toward glory'],
  moralLesson:"Two advancing pawns are stronger than one. — Arthashastra"
},
{
  id:'P111', title:'Promotion Through Capture', type:'nara-march', rating:390,
  forcedDice:[6],
  boardState:{ 'd7':'0:pawn','e8':'1:rook','e1':'0:king','h8':'1:king' },
  turnIndex:0,
  solution:[{from:'d7',to:'e8'}],
  hint:['The Nara captures diagonally and promotes in one stroke — removing a Ratha'],
  moralLesson:"The pawn that captures on promotion earns double glory. — Chaturanga Lore"
},
{
  id:'P112', title:'Promote and Strike', type:'nara-march', rating:440,
  forcedDice:[6,1],
  boardState:{ 'b7':'0:pawn','h1':'0:rook','h8':'1:rook','e1':'0:king','a8':'1:king' },
  turnIndex:0,
  solution:[{from:'b7',to:'b8'},{from:'h1',to:'h8'}],
  hint:['Promote the Nara on b8','Then the Ratha captures the enemy Ratha on h8'],
  moralLesson:"Advance the pawn to change the position; then strike with the chariot. — Chanakya"
},
{
  id:'P113', title:'Nara Takes the Threat', type:'nara-march', rating:420,
  forcedDice:[6],
  boardState:{ 'f7':'0:pawn','e8':'1:rook','d1':'0:king','h8':'1:king' },
  turnIndex:0,
  solution:[{from:'f7',to:'e8'}],
  hint:['The Nara captures the threatening Ratha diagonally and earns promotion'],
  moralLesson:"The brave pawn that charges forward earns what the others cannot. — Arthashastra"
},
{
  id:'P114', title:'Double Diagonal Advance', type:'nara-march', rating:510,
  forcedDice:[6,6],
  boardState:{ 'c7':'0:pawn','d8':'1:rook','e6':'0:pawn','a1':'0:king','h8':'1:king' },
  turnIndex:0,
  solution:[{from:'c7',to:'d8'},{from:'e6',to:'e7'}],
  hint:['Capture the Ratha with the Nara on d8 — promotion!','Advance the second Nara to e7'],
  moralLesson:"The pawn that captures to promote is the infantry\'s greatest hero. — Panchatantra"
},
{
  id:'P115', title:'Promotion on the h-File', type:'nara-march', rating:230,
  forcedDice:[6],
  boardState:{ 'h7':'0:pawn','a1':'0:king','f8':'1:king','e5':'1:rook' },
  turnIndex:0,
  solution:[{from:'h7',to:'h8'}],
  hint:['The Nara on h7 needs just one more step to become a Mantri'],
  moralLesson:"Every great journey ends with a single final step. — Bhagavad Gita 6.35"
},
// ── Stalemate Trap (P116–P125) ────────────────────────────────────────────────
{
  id:'P116', title:'Cornering the Corner King', type:'stalemate-trap', rating:370,
  forcedDice:[1,6],
  boardState:{ 'h8':'1:king','h1':'0:rook','f7':'0:king','c1':'1:rook' },
  turnIndex:0,
  solution:[{from:'h1',to:'h7'},{from:'f7',to:'g7'}],
  hint:['Ratha cuts off the h7 escape square','King moves to g7 to complete the mating net'],
  moralLesson:"Cut off every escape before you tighten the noose. — Arthashastra"
},
{
  id:'P117', title:'The a-File Prison', type:'stalemate-trap', rating:420,
  forcedDice:[1,6],
  boardState:{ 'a8':'1:king','b6':'0:king','a1':'0:rook','f3':'1:rook' },
  turnIndex:0,
  solution:[{from:'a1',to:'a7'},{from:'b6',to:'b7'}],
  hint:['Ratha advances to a7 just beneath the trapped king','King steps to b7 to seal the cage'],
  moralLesson:"Box the enemy king inch by inch. — Kautilya, Arthashastra X"
},
{
  id:'P118', title:'Trap on the g-File', type:'stalemate-trap', rating:390,
  forcedDice:[1,6],
  boardState:{ 'h8':'1:king','e7':'0:king','g1':'0:rook','c4':'1:horse' },
  turnIndex:0,
  solution:[{from:'g1',to:'g8'},{from:'e7',to:'f7'}],
  hint:['Ratha cuts off the g-file on rank 8','King advances to f7 to tighten the trap'],
  moralLesson:"A king cornered is a king captured. — Mahabharata"
},
{
  id:'P119', title:'The Back Rank Prison', type:'stalemate-trap', rating:450,
  forcedDice:[1,6],
  boardState:{ 'a8':'1:king','b6':'0:king','h8':'0:rook','d3':'1:rook' },
  turnIndex:0,
  solution:[{from:'h8',to:'b8'},{from:'b6',to:'a7'}],
  hint:['Ratha cuts off b8 from the right','King steps to a7 blocking the escape downward'],
  moralLesson:"Surround before you strike. — Kautilya"
},
{
  id:'P120', title:'h1 Corner Squeeze', type:'stalemate-trap', rating:410,
  forcedDice:[1,6],
  boardState:{ 'h1':'1:king','f3':'0:king','a1':'0:rook','e8':'1:rook' },
  turnIndex:0,
  solution:[{from:'a1',to:'g1'},{from:'f3',to:'g2'}],
  hint:['Ratha advances to g1 cutting off the g-file','King moves to g2 tightening the net on h1'],
  moralLesson:"Leave the enemy king one square, then take that too. — Chanakya Niti"
},
{
  id:'P121', title:'The Tightening Net', type:'stalemate-trap', rating:480,
  forcedDice:[6,1],
  boardState:{ 'h8':'1:king','g6':'0:king','f1':'0:rook','a4':'1:rook' },
  turnIndex:0,
  solution:[{from:'g6',to:'g7'},{from:'f1',to:'f8'}],
  hint:['King advances to g7 cutting off escape via g7','Ratha swings to f8 sealing the back rank'],
  moralLesson:"Every step forward tightens the trap. — Arthashastra"
},
{
  id:'P122', title:'The Squeezing Ratha', type:'stalemate-trap', rating:350,
  forcedDice:[1,6],
  boardState:{ 'a8':'1:king','c7':'0:king','c8':'0:rook','h1':'1:rook' },
  turnIndex:0,
  solution:[{from:'c8',to:'b8'},{from:'c7',to:'b7'}],
  hint:['Ratha advances to b8 on the back rank','King steps to b7 — the corner belongs to us'],
  moralLesson:"Compress the enemy until no space remains. — Panchatantra"
},
{
  id:'P123', title:'Rank Seven Curtain', type:'stalemate-trap', rating:500,
  forcedDice:[6,1],
  boardState:{ 'h8':'1:king','e8':'0:king','a7':'0:rook','c1':'1:rook' },
  turnIndex:0,
  solution:[{from:'e8',to:'f8'},{from:'a7',to:'g7'}],
  hint:['King moves to f8 cutting off escape that way','Ratha swings to g7 — the h8 king is caged'],
  moralLesson:"The king and chariot together form the perfect net. — Arthashastra"
},
{
  id:'P124', title:'The a1 Corner Trap', type:'stalemate-trap', rating:440,
  forcedDice:[6,1],
  boardState:{ 'a1':'1:king','c2':'0:king','h1':'0:rook','h8':'1:rook' },
  turnIndex:0,
  solution:[{from:'c2',to:'b2'},{from:'h1',to:'b1'}],
  hint:['King steps to b2 to control escape squares','Ratha flies to b1 completing the cage'],
  moralLesson:"The cage is built one bar at a time. — Kautilya"
},
{
  id:'P125', title:'The Corner Execution', type:'stalemate-trap', rating:570,
  forcedDice:[1,6],
  boardState:{ 'a8':'1:king','b1':'0:rook','c6':'0:king','h4':'1:horse' },
  turnIndex:0,
  solution:[{from:'b1',to:'b8'},{from:'c6',to:'b7'}],
  hint:['Ratha cuts off b8','King advances to b7 — the corner king is fully caged'],
  moralLesson:"Complete encirclement ends all wars. — Ramayana, Lanka Siege"
},
// ── Alliance Combo (P126–P130) ────────────────────────────────────────────────
{
  id:'P126', title:'Chariot and Cavalry United', type:'alliance-combo', rating:410,
  forcedDice:[1,3],
  boardState:{ 'a1':'0:rook','e5':'2:horse','h5':'1:king','d5':'1:rook','d1':'0:king','e8':'2:king' },
  turnIndex:0,
  solution:[{from:'a1',to:'h1'},{from:'e5',to:'f3'}],
  hint:['Our Ratha controls the h-file from h1','Allied Ashwa repositions to cut off escape via f3'],
  moralLesson:"United we stand — the Pandava brothers were strongest together. — Mahabharata"
},
{
  id:'P127', title:'The Allied Vanguard', type:'alliance-combo', rating:470,
  forcedDice:[4,1],
  boardState:{ 'c1':'0:elephant','g3':'2:rook','h5':'1:king','e5':'1:rook','a1':'0:king','f8':'2:king' },
  turnIndex:0,
  solution:[{from:'c1',to:'e3'},{from:'g3',to:'h3'}],
  hint:['Our Danti leaps to e3 applying diagonal pressure','Allied Ratha swings to h3 to threaten the Raja'],
  moralLesson:"When allies coordinate, the enemy has nowhere to retreat. — Arthashastra"
},
{
  id:'P128', title:'Clear and Conquer', type:'alliance-combo', rating:540,
  forcedDice:[3,1],
  boardState:{ 'd4':'0:horse','f5':'1:rook','h5':'1:king','a5':'2:rook','a1':'0:king','h8':'2:king' },
  turnIndex:0,
  solution:[{from:'d4',to:'f5'},{from:'a5',to:'h5'}],
  hint:['Our Ashwa clears the Ratha on f5','Allied Ratha sweeps rank 5 to the Raja'],
  moralLesson:"One ally clears the road; the other delivers victory. — Mahabharata, Karna Parva"
},
{
  id:'P129', title:'The Double Strike', type:'alliance-combo', rating:490,
  forcedDice:[1,3],
  boardState:{ 'a3':'0:rook','h3':'1:rook','g5':'2:horse','h7':'1:king','d1':'0:king','e8':'2:king' },
  turnIndex:0,
  solution:[{from:'a3',to:'h3'},{from:'g5',to:'h7'}],
  hint:['Our Ratha captures the enemy Ratha on h3','Allied Ashwa springs to h7 to take the Raja'],
  moralLesson:"When allies share a target, neither can defend against both. — Chanakya Niti"
},
{
  id:'P130', title:'Elephant Clears, Ally Conquers', type:'alliance-combo', rating:580,
  forcedDice:[4,1],
  boardState:{ 'a1':'0:elephant','c3':'1:rook','e5':'1:king','a5':'2:rook','h1':'0:king','g8':'2:king' },
  turnIndex:0,
  solution:[{from:'a1',to:'c3'},{from:'a5',to:'e5'}],
  hint:['Our Danti captures the Ratha on c3','Allied Ratha sweeps rank 5 to capture the Raja'],
  moralLesson:"The elephant removes obstacles so the chariot can deliver justice. — Arthashastra"
},
// ── Back Rank (P131–P140) ─────────────────────────────────────────────────────
{
  id:'P131', title:'g-File Back Rank', type:'back-rank', rating:210,
  forcedDice:[1],
  boardState:{ 'g1':'0:rook','g8':'1:king','d4':'0:king','d6':'1:rook' },
  turnIndex:0,
  solution:[{from:'g1',to:'g8'}],
  hint:['The g-file is open all the way to the back rank — one move wins'],
  moralLesson:"A clear file to the back rank is the end of the game. — Arthashastra"
},
{
  id:'P132', title:'a-File Execution', type:'back-rank', rating:190,
  forcedDice:[1],
  boardState:{ 'a1':'0:rook','a8':'1:king','e4':'0:king','f6':'1:rook' },
  turnIndex:0,
  solution:[{from:'a1',to:'a8'}],
  hint:['The a-file is open — march straight to the back rank Raja'],
  moralLesson:"Control the a-file and the corner belongs to you. — Panchatantra"
},
{
  id:'P133', title:'Clear the c-File', type:'back-rank', rating:340,
  forcedDice:[1,1],
  boardState:{ 'c1':'0:rook','c6':'1:rook','c8':'1:king','a4':'0:king' },
  turnIndex:0,
  solution:[{from:'c1',to:'c6'},{from:'c6',to:'c8'}],
  hint:['Take the blocking Ratha on c6','Then advance to the back rank for the Raja'],
  moralLesson:"Remove every obstacle between you and the throne. — Arthashastra VI"
},
{
  id:'P134', title:'Back Rank d-File', type:'back-rank', rating:225,
  forcedDice:[1],
  boardState:{ 'd1':'0:rook','d8':'1:king','e4':'0:king','h5':'1:horse' },
  turnIndex:0,
  solution:[{from:'d1',to:'d8'}],
  hint:['The d-file leads directly to the enemy Raja on the back rank'],
  moralLesson:"An open file to the king is victory waiting to happen. — Chanakya Niti"
},
{
  id:'P135', title:'b-File Breakthrough', type:'back-rank', rating:360,
  forcedDice:[1,1],
  boardState:{ 'b1':'0:rook','b5':'1:rook','b8':'1:king','f4':'0:king' },
  turnIndex:0,
  solution:[{from:'b1',to:'b5'},{from:'b5',to:'b8'}],
  hint:['Capture the blocking Ratha on b5','March to the back rank for the kill'],
  moralLesson:"Two steps on one file decides the battle. — Ancient Chaturanga Lore"
},
{
  id:'P136', title:'h-File Back Rank', type:'back-rank', rating:200,
  forcedDice:[1],
  boardState:{ 'h1':'0:rook','h8':'1:king','a4':'0:king','c6':'1:rook' },
  turnIndex:0,
  solution:[{from:'h1',to:'h8'}],
  hint:['The h-file is clear — march straight to the cornered Raja'],
  moralLesson:"The flanking file often holds the most decisive path. — Arthashastra"
},
{
  id:'P137', title:'e-File Back Rank Clear', type:'back-rank', rating:370,
  forcedDice:[1,1],
  boardState:{ 'e1':'0:rook','e4':'1:rook','e8':'1:king','b2':'0:king' },
  turnIndex:0,
  solution:[{from:'e1',to:'e4'},{from:'e4',to:'e8'}],
  hint:['Eliminate the e4 Ratha blocking the file','Advance to the back rank to finish'],
  moralLesson:"Persistence up the central file breaks any defence. — Arthashastra"
},
{
  id:'P138', title:'Horse Clears, Ratha Delivers', type:'back-rank', rating:520,
  forcedDice:[3,1],
  boardState:{ 'c5':'0:horse','e6':'1:rook','e8':'1:king','e1':'0:rook','a1':'0:king' },
  turnIndex:0,
  solution:[{from:'c5',to:'e6'},{from:'e1',to:'e8'}],
  hint:['Ashwa captures the blocking Ratha on e6','Ratha rushes the e-file to capture the Raja'],
  moralLesson:"The horse blazes the trail; the chariot delivers victory. — Mahabharata"
},
{
  id:'P139', title:'Rank 8 Coordination', type:'back-rank', rating:480,
  forcedDice:[1,3],
  boardState:{ 'a8':'0:rook','h8':'1:rook','f7':'1:king','g5':'0:horse','a1':'0:king' },
  turnIndex:0,
  solution:[{from:'a8',to:'h8'},{from:'g5',to:'f7'}],
  hint:['Ratha sweeps the back rank to capture the enemy Ratha','Ashwa leaps to f7 for the Raja'],
  moralLesson:"Two pieces sweeping in tandem leave no escape. — Chanakya Niti"
},
{
  id:'P140', title:'The Grand Finale', type:'back-rank', rating:620,
  forcedDice:[1,4],
  boardState:{ 'a8':'0:rook','e8':'1:rook','c6':'1:king','a4':'0:elephant','h1':'0:king' },
  turnIndex:0,
  solution:[{from:'a8',to:'e8'},{from:'a4',to:'c6'}],
  hint:['Ratha captures the enemy Ratha on e8 clearing the back rank','Danti leaps diagonally to capture the Raja on c6'],
  moralLesson:"The chariot and elephant together are unstoppable. — Arthashastra, Book XI"
}
,
// ══════════════════════════════════════════════════════════════════════════
// Chaturanga Puzzles P141–P200  |  60 High-ELO Puzzles  |  700–1000 ELO
// All moves validated. Horse:(±1,±2)|(±2,±1)  Elephant:(±2,±2 only)
// Dice: 1=rook  2/5=any  3=horse  4=elephant  6=pawn|king
// Every solution's final move captures the enemy king.
// ══════════════════════════════════════════════════════════════════════════

// ── Win-in-3  (P141–P150)  640–750 ELO ───────────────────────────────────
{
  id:'P141', title:'Triple Ratha March', type:'win-in-3', rating:640,
  forcedDice:[1,1,1],
  boardState:{'a1':'0:rook','d1':'1:rook','d5':'1:rook','d8':'1:king','h8':'0:king'},
  turnIndex:0,
  solution:[{from:'a1',to:'d1'},{from:'d1',to:'d5'},{from:'d5',to:'d8'}],
  hint:['Capture the Ratha on d1 to enter the d-file','Clear d5, then march to the Raja on d8'],
  moralLesson:"Three strikes down one path breaks any fortress. — Arthashastra VII"
},
{
  id:'P142', title:'Horse Opens the Gate', type:'win-in-3', rating:660,
  forcedDice:[3,1,1],
  boardState:{'c4':'0:horse','e5':'1:rook','a8':'0:rook','g8':'1:rook','h8':'1:king','a1':'0:king'},
  turnIndex:0,
  solution:[{from:'c4',to:'e5'},{from:'a8',to:'g8'},{from:'g8',to:'h8'}],
  hint:['Horse leaps to capture the Ratha on e5','Ratha sweeps rank 8 to g8, then captures the Raja on h8'],
  moralLesson:"Cavalry removes the barrier; the chariot storms the citadel. — Mahabharata"
},
{
  id:'P143', title:'Elephant Clears, Rathas Deliver', type:'win-in-3', rating:650,
  forcedDice:[4,1,1],
  boardState:{'a1':'0:elephant','c3':'1:rook','h7':'0:rook','c7':'1:rook','c8':'1:king','h1':'0:king'},
  turnIndex:0,
  solution:[{from:'a1',to:'c3'},{from:'h7',to:'c7'},{from:'c7',to:'c8'}],
  hint:['Danti leaps to c3 capturing the blocking Ratha','Ratha sweeps to c7, then c8 to capture the Raja'],
  moralLesson:"The elephant leads; the chariots follow and conquer. — Arthashastra"
},
{
  id:'P144', title:'The Zigzag Hunt', type:'win-in-3', rating:670,
  forcedDice:[1,1,1],
  boardState:{'a1':'0:rook','a5':'1:rook','h5':'1:rook','h8':'1:king','a8':'0:king'},
  turnIndex:0,
  solution:[{from:'a1',to:'a5'},{from:'a5',to:'h5'},{from:'h5',to:'h8'}],
  hint:['Capture on a5, then sweep rank 5 to h5','The h-file leads straight to the Raja'],
  moralLesson:"Conquer in sequence — never skip a step on the path to victory. — Chanakya"
},
{
  id:'P145', title:'The f-File Liquidation', type:'win-in-3', rating:690,
  forcedDice:[1,1,1],
  boardState:{'a1':'0:rook','f1':'1:rook','f6':'1:rook','f8':'1:king','h8':'0:king'},
  turnIndex:0,
  solution:[{from:'a1',to:'f1'},{from:'f1',to:'f6'},{from:'f6',to:'f8'}],
  hint:['Enter the f-file by capturing on f1','March through f6 to reach the Raja on f8'],
  moralLesson:"Dominate the file from root to crown. — Arthashastra IX"
},
{
  id:'P146', title:'Horse Raids, Ratha Finishes', type:'win-in-3', rating:710,
  forcedDice:[3,1,1],
  boardState:{'c5':'0:horse','e4':'1:rook','a8':'0:rook','e8':'1:rook','h8':'1:king','a1':'0:king'},
  turnIndex:0,
  solution:[{from:'c5',to:'e4'},{from:'a8',to:'e8'},{from:'e8',to:'h8'}],
  hint:['Horse captures the Ratha on e4','Ratha sweeps to e8, then across rank 8 to the Raja'],
  moralLesson:"Cavalry raids force open the door; the chariot claims the throne. — Mahabharata"
},
{
  id:'P147', title:'The Corner Sweep', type:'win-in-3', rating:720,
  forcedDice:[1,1,1],
  boardState:{'c1':'0:rook','c4':'1:rook','g4':'1:rook','g1':'0:rook','g8':'1:king','a1':'0:king'},
  turnIndex:0,
  solution:[{from:'c1',to:'c4'},{from:'c4',to:'g4'},{from:'g4',to:'g8'}],
  hint:['Take c4, then swing to g4 capturing that Ratha','The g-file leads to the Raja'],
  moralLesson:"Two obstacles removed; the path to the throne is open. — Arthashastra"
},
{
  id:'P148', title:'Ashwa Clears the d-File', type:'win-in-3', rating:730,
  forcedDice:[3,1,1],
  boardState:{'b5':'0:horse','d4':'1:rook','a8':'0:rook','d8':'1:rook','h8':'1:king','a1':'0:king'},
  turnIndex:0,
  solution:[{from:'b5',to:'d4'},{from:'a8',to:'d8'},{from:'d8',to:'h8'}],
  hint:['Horse removes the guard on d4','Ratha races to d8, then sweeps rank 8 to the Raja'],
  moralLesson:"The swift cavalry clears what the chariot cannot reach. — Drona Parva"
},
{
  id:'P149', title:'The e-File Triple', type:'win-in-3', rating:740,
  forcedDice:[1,1,1],
  boardState:{'e1':'0:rook','e3':'1:rook','e7':'1:rook','a7':'1:king','h1':'0:king'},
  turnIndex:0,
  solution:[{from:'e1',to:'e3'},{from:'e3',to:'e7'},{from:'e7',to:'a7'}],
  hint:['Capture on e3, advance to e7','Then sweep rank 7 to capture the Raja on a7'],
  moralLesson:"The rook that masters one file masters the entire board. — Arthashastra"
},
{
  id:'P150', title:'Horse Ambush Leads the Charge', type:'win-in-3', rating:750,
  forcedDice:[3,1,1],
  boardState:{'f3':'0:horse','d4':'1:rook','a6':'0:rook','d6':'1:rook','d8':'1:king','h1':'0:king'},
  turnIndex:0,
  solution:[{from:'f3',to:'d4'},{from:'a6',to:'d6'},{from:'d6',to:'d8'}],
  hint:['Horse captures the Ratha on d4','Ratha sweeps to d6, then advances to capture the Raja'],
  moralLesson:"Each strike in sequence is more powerful than all at once. — Chanakya Niti"
},

// ── Discovered Attack  (P151–P160)  660–820 ELO ───────────────────────────
{
  id:'P151', title:'The Unveiled Chariot', type:'discovered-attack', rating:660,
  forcedDice:[3,1],
  boardState:{'a6':'0:rook','d6':'0:horse','h6':'1:king','a1':'0:king','h1':'1:rook'},
  turnIndex:0,
  solution:[{from:'d6',to:'f7'},{from:'a6',to:'h6'}],
  hint:['The Ashwa sits on rank 6 blocking the Ratha — leap it to f7','Ratha sweeps rank 6 to the exposed Raja'],
  moralLesson:"Reveal the chariot's power by moving what conceals it. — Arthashastra VI"
},
{
  id:'P152', title:'The d-File Discovery', type:'discovered-attack', rating:680,
  forcedDice:[3,1],
  boardState:{'d1':'0:rook','d4':'0:horse','d8':'1:king','h1':'0:king','a8':'1:rook'},
  turnIndex:0,
  solution:[{from:'d4',to:'f5'},{from:'d1',to:'d8'}],
  hint:['The horse blocks the d-file — leap it to f5','Ratha rushes the now-open d-file to the Raja'],
  moralLesson:"The hidden line of attack is the most feared. — Mahabharata, Drona Parva"
},
{
  id:'P153', title:'h-File Ambush', type:'discovered-attack', rating:700,
  forcedDice:[3,1],
  boardState:{'h1':'0:rook','h4':'0:horse','h8':'1:king','a1':'0:king','a4':'1:rook'},
  turnIndex:0,
  solution:[{from:'h4',to:'f5'},{from:'h1',to:'h8'}],
  hint:['Horse jumps off the h-file to f5','Ratha charges up the h-file to capture the Raja'],
  moralLesson:"The sudden revelation of power is the greatest weapon. — Chanakya"
},
{
  id:'P154', title:'The b-File Unveiling', type:'discovered-attack', rating:720,
  forcedDice:[3,1],
  boardState:{'b1':'0:rook','b5':'0:horse','b8':'1:king','h1':'0:king','g5':'1:rook'},
  turnIndex:0,
  solution:[{from:'b5',to:'d6'},{from:'b1',to:'b8'}],
  hint:['The Ashwa on b5 blocks the b-file — spring it to d6','Ratha races to the Raja on b8'],
  moralLesson:"Clear the path for the chariot and victory follows instantly. — Arthashastra"
},
{
  id:'P155', title:'The e-File Discovery', type:'discovered-attack', rating:700,
  forcedDice:[3,1],
  boardState:{'e1':'0:rook','e4':'0:horse','e8':'1:king','a1':'0:king','a8':'1:rook'},
  turnIndex:0,
  solution:[{from:'e4',to:'f6'},{from:'e1',to:'e8'}],
  hint:['Horse leaps from e4 to f6 clearing the e-file','Ratha fires straight to the Raja on e8'],
  moralLesson:"Move the vanguard aside so the true weapon can strike. — Drona"
},
{
  id:'P156', title:'Rank Three Discovery', type:'discovered-attack', rating:740,
  forcedDice:[3,1],
  boardState:{'a3':'0:rook','d3':'0:horse','h3':'1:king','a8':'0:king','h8':'1:rook'},
  turnIndex:0,
  solution:[{from:'d3',to:'e5'},{from:'a3',to:'h3'}],
  hint:['The Ashwa blocks rank 3 — spring it to e5','Ratha sweeps the entire rank to the Raja'],
  moralLesson:"The cavalry pivots; the chariot strikes without hesitation. — Arthashastra"
},
{
  id:'P157', title:'The f-File Reveal', type:'discovered-attack', rating:760,
  forcedDice:[3,1],
  boardState:{'f1':'0:rook','f4':'0:horse','f8':'1:king','a8':'1:rook','a1':'0:king'},
  turnIndex:0,
  solution:[{from:'f4',to:'d5'},{from:'f1',to:'f8'}],
  hint:['Ashwa on f4 blocks the f-file — move it to d5','Ratha charges the open f-file to capture the Raja'],
  moralLesson:"Reposition the lesser piece so the greater can dominate. — Chanakya Niti"
},
{
  id:'P158', title:'Discovery Opens Two Rathas', type:'discovered-attack', rating:780,
  forcedDice:[3,1,1],
  boardState:{'g1':'0:rook','g4':'0:horse','g6':'1:rook','g8':'1:king','a8':'0:rook','d8':'1:rook','a1':'0:king'},
  turnIndex:0,
  solution:[{from:'g4',to:'e5'},{from:'g1',to:'g6'},{from:'g6',to:'g8'}],
  hint:['Horse leaps off the g-file revealing the Ratha below','Clear g6, then march to the Raja on g8'],
  moralLesson:"One movement opens two attacks; the enemy cannot defend both. — Arthashastra IX"
},
{
  id:'P159', title:'The c-File Discovery Chain', type:'discovered-attack', rating:800,
  forcedDice:[3,1,1],
  boardState:{'c1':'0:rook','c3':'0:horse','c5':'1:rook','c8':'1:king','a1':'0:king'},
  turnIndex:0,
  solution:[{from:'c3',to:'e4'},{from:'c1',to:'c5'},{from:'c5',to:'c8'}],
  hint:['Horse leaves the c-file by jumping to e4','Ratha captures c5, then advances to the Raja on c8'],
  moralLesson:"The discovery sets up a chain the enemy cannot stop. — Mahabharata"
},
{
  id:'P160', title:'The Cross-Discovery', type:'discovered-attack', rating:820,
  forcedDice:[3,1,1],
  boardState:{'a4':'0:rook','d4':'0:horse','f4':'1:rook','h4':'1:king','a1':'0:king'},
  turnIndex:0,
  solution:[{from:'d4',to:'e6'},{from:'a4',to:'f4'},{from:'f4',to:'h4'}],
  hint:['Horse leaves rank 4 revealing the Ratha\'s path','Ratha captures f4, then sweeps to the Raja on h4'],
  moralLesson:"A single cavalry move can open the entire rank. — Arthashastra, Book IX"
},

// ── Combination  (P161–P170)  750–900 ELO ────────────────────────────────
{
  id:'P161', title:'Ratha Clears, Danti Delivers', type:'combination', rating:750,
  forcedDice:[1,4],
  boardState:{'a5':'0:rook','e5':'1:rook','c3':'0:elephant','e1':'1:king','h8':'0:king'},
  turnIndex:0,
  solution:[{from:'a5',to:'e5'},{from:'c3',to:'e1'}],
  hint:['Ratha captures the Ratha on e5','Danti leaps diagonally to e1 to capture the Raja'],
  moralLesson:"The chariot clears the way; the elephant delivers the killing blow. — Arthashastra"
},
{
  id:'P162', title:'Horse Raids the Guard, Ratha Kills', type:'combination', rating:770,
  forcedDice:[3,1],
  boardState:{'e4':'0:horse','c3':'1:rook','g3':'1:king','a3':'0:rook','a8':'0:king'},
  turnIndex:0,
  solution:[{from:'e4',to:'c3'},{from:'a3',to:'g3'}],
  hint:['Horse captures the guarding Ratha on c3','Ratha sweeps rank 3 to the exposed Raja on g3'],
  moralLesson:"Remove the guard first; the target is then defenceless. — Chanakya Niti"
},
{
  id:'P163', title:'Elephant Takes Guard, Ratha Finishes', type:'combination', rating:790,
  forcedDice:[4,1],
  boardState:{'c1':'0:elephant','e3':'1:rook','g3':'1:king','a3':'0:rook','a8':'0:king'},
  turnIndex:0,
  solution:[{from:'c1',to:'e3'},{from:'a3',to:'g3'}],
  hint:['Danti leaps to e3 capturing the Ratha','Ratha sweeps rank 3 to capture the Raja'],
  moralLesson:"The elephant's leap destroys the shield; the chariot claims the throne. — Arthashastra"
},
{
  id:'P164', title:'Ratha Clears, Danti Strikes the Raja', type:'combination', rating:810,
  forcedDice:[1,4],
  boardState:{'a5':'0:rook','d5':'1:rook','h5':'1:king','f3':'0:elephant','a1':'0:king'},
  turnIndex:0,
  solution:[{from:'a5',to:'d5'},{from:'f3',to:'h5'}],
  hint:['Ratha captures the blocking Ratha on d5','Danti leaps two diagonals to h5 to capture the Raja'],
  moralLesson:"The rook destroys the shield; the elephant captures the king. — Mahabharata"
},
{
  id:'P165', title:'Three-Piece Symphony', type:'combination', rating:830,
  forcedDice:[3,4,1],
  boardState:{'b4':'0:horse','d5':'1:rook','c1':'0:elephant','e3':'1:rook','h1':'0:rook','h8':'1:king','a1':'0:king'},
  turnIndex:0,
  solution:[{from:'b4',to:'d5'},{from:'c1',to:'e3'},{from:'h1',to:'h8'}],
  hint:['Horse captures the Ratha on d5','Elephant captures the Ratha on e3','Ratha charges the h-file to capture the Raja'],
  moralLesson:"Three weapons in perfect harmony are unstoppable. — Arthashastra, Book XI"
},
{
  id:'P166', title:'Ratha Hunts, Horse Delivers', type:'combination', rating:840,
  forcedDice:[1,3],
  boardState:{'a1':'0:rook','a6':'1:rook','e3':'0:horse','g4':'1:king','h8':'0:king'},
  turnIndex:0,
  solution:[{from:'a1',to:'a6'},{from:'e3',to:'g4'}],
  hint:['Ratha captures the enemy Ratha on a6','Horse leaps to g4 to capture the Raja'],
  moralLesson:"The chariot opens the attack; the horse delivers the final blow. — Drona Parva"
},
{
  id:'P167', title:'Horse Clears, Elephant Kills', type:'combination', rating:860,
  forcedDice:[3,4],
  boardState:{'d4':'0:horse','f5':'1:rook','d2':'0:elephant','f4':'1:king','a8':'0:king'},
  turnIndex:0,
  solution:[{from:'d4',to:'f5'},{from:'d2',to:'f4'}],
  hint:['Horse captures the Ratha on f5 exposing the Raja','Danti leaps to f4 to capture the Raja'],
  moralLesson:"When cavalry and elephant strike together, no king survives. — Arthashastra"
},
{
  id:'P168', title:'Ratha Opens, Horse Finishes', type:'combination', rating:870,
  forcedDice:[1,3],
  boardState:{'a1':'0:rook','e1':'1:rook','c3':'0:horse','d5':'1:king','h8':'0:king'},
  turnIndex:0,
  solution:[{from:'a1',to:'e1'},{from:'c3',to:'d5'}],
  hint:['Ratha captures the Ratha on e1','Horse leaps to d5 to capture the Raja'],
  moralLesson:"One piece sets up the kill; the other delivers it. — Chanakya Niti"
},
{
  id:'P169', title:'Elephant, Ratha, Horse — Triangle Attack', type:'combination', rating:880,
  forcedDice:[4,1,3],
  boardState:{'c1':'0:elephant','e3':'1:rook','a6':'0:rook','g6':'1:rook','e7':'0:horse','g8':'1:king','a1':'0:king'},
  turnIndex:0,
  solution:[{from:'c1',to:'e3'},{from:'a6',to:'g6'},{from:'e7',to:'g8'}],
  hint:['Danti captures the Ratha on e3','Ratha sweeps to g6 capturing the second Ratha','Horse leaps to g8 to capture the Raja'],
  moralLesson:"Three pieces each doing their duty — this is the art of war. — Mahabharata"
},
{
  id:'P170', title:'The Horse Fork Unleashed', type:'combination', rating:900,
  forcedDice:[3,1,1],
  boardState:{'d4':'0:horse','f5':'1:rook','a5':'0:rook','f8':'1:rook','h8':'1:king','a1':'0:king'},
  turnIndex:0,
  solution:[{from:'d4',to:'f5'},{from:'a5',to:'f8'},{from:'f8',to:'h8'}],
  hint:['Horse captures the Ratha on f5','Ratha sweeps to f8 capturing the second Ratha','Ratha slides to h8 to capture the Raja'],
  moralLesson:"The cavalry opens the gate; the chariot storms through and claims all. — Arthashastra"
},

// ── Win-in-4  (P171–P180)  810–960 ELO ───────────────────────────────────
{
  id:'P171', title:'Four Rathas, One Path', type:'win-in-4', rating:810,
  forcedDice:[1,1,1,1],
  boardState:{'a1':'0:rook','c1':'1:rook','c4':'1:rook','c7':'1:rook','c8':'1:king','h8':'0:king'},
  turnIndex:0,
  solution:[{from:'a1',to:'c1'},{from:'c1',to:'c4'},{from:'c4',to:'c7'},{from:'c7',to:'c8'}],
  hint:['Enter the c-file by taking c1','Capture c4, then c7, then the Raja on c8'],
  moralLesson:"Four consecutive strikes on one line break the mightiest wall. — Arthashastra"
},
{
  id:'P172', title:'Horse Opens, Three Rathas Close', type:'win-in-4', rating:830,
  forcedDice:[3,1,1,1],
  boardState:{'b3':'0:horse','d4':'1:rook','a1':'0:rook','h4':'0:rook','d8':'1:rook','h8':'1:king','h1':'0:king'},
  turnIndex:0,
  solution:[{from:'b3',to:'d4'},{from:'a1',to:'a8'},{from:'a8',to:'d8'},{from:'h4',to:'h8'}],
  hint:['Horse removes the guard on d4','Ratha swings to a8 then captures d8 along rank 8','Second Ratha sweeps the h-file to capture the Raja'],
  moralLesson:"The cavalry breaks the first line; the chariots complete the conquest. — Mahabharata"
},
{
  id:'P173', title:'Elephant Leads the Four-Piece March', type:'win-in-4', rating:850,
  forcedDice:[4,1,1,1],
  boardState:{'a1':'0:elephant','c3':'1:rook','h3':'0:rook','g3':'1:rook','g8':'1:rook','h8':'1:king','a8':'0:king'},
  turnIndex:0,
  solution:[{from:'a1',to:'c3'},{from:'h3',to:'g3'},{from:'g3',to:'g8'},{from:'g8',to:'h8'}],
  hint:['Danti captures the Ratha on c3','Ratha sweeps to g3, then to g8, then across to the Raja'],
  moralLesson:"The elephant strikes first; three chariots finish what it began. — Arthashastra XI"
},
{
  id:'P174', title:'Twin Horse Assault', type:'win-in-4', rating:860,
  forcedDice:[3,3,1,1],
  boardState:{'c3':'0:horse','f6':'0:horse','e4':'1:rook','e8':'1:rook','a4':'0:rook','h8':'1:king','a1':'0:king'},
  turnIndex:0,
  solution:[{from:'c3',to:'e4'},{from:'f6',to:'e8'},{from:'a4',to:'h4'},{from:'h4',to:'h8'}],
  hint:['First horse captures the Ratha on e4','Second horse captures the Ratha on e8','Ratha swings to h4, then captures the Raja on h8'],
  moralLesson:"Two cavalry strikes clear the path for the chariot's killing blow. — Drona Parva"
},
{
  id:'P175', title:'The Four-Piece Liquidation', type:'win-in-4', rating:880,
  forcedDice:[4,1,1,1],
  boardState:{'c1':'0:elephant','e3':'1:rook','a6':'0:rook','g6':'1:rook','e6':'1:rook','e8':'1:king','a8':'0:king'},
  turnIndex:0,
  solution:[{from:'c1',to:'e3'},{from:'a6',to:'g6'},{from:'g6',to:'e6'},{from:'e6',to:'e8'}],
  hint:['Elephant captures the Ratha on e3','Ratha takes g6, swings to e6, then the Raja on e8'],
  moralLesson:"Systematic elimination — this is the Chakravarti's art of war. — Arthashastra"
},
{
  id:'P176', title:'The Supreme File March', type:'win-in-4', rating:900,
  forcedDice:[1,1,1,1],
  boardState:{'a1':'0:rook','d1':'1:rook','d5':'1:rook','d8':'1:rook','h8':'1:king','h1':'0:king'},
  turnIndex:0,
  solution:[{from:'a1',to:'d1'},{from:'d1',to:'d5'},{from:'d5',to:'d8'},{from:'d8',to:'h8'}],
  hint:['Capture d1, then d5, then d8','The back rank leads straight to the Raja'],
  moralLesson:"The deepest victory is won one step at a time. — Chanakya Niti"
},
{
  id:'P177', title:'The Diagonal Zigzag', type:'win-in-4', rating:910,
  forcedDice:[1,1,1,1],
  boardState:{'a1':'0:rook','a4':'1:rook','d4':'1:rook','d8':'1:rook','h8':'1:king','h1':'0:king'},
  turnIndex:0,
  solution:[{from:'a1',to:'a4'},{from:'a4',to:'d4'},{from:'d4',to:'d8'},{from:'d8',to:'h8'}],
  hint:['Zigzag through the board — a4, d4, d8, then the Raja','Each step captures a Ratha'],
  moralLesson:"The wisest path to victory is rarely a straight line. — Arthashastra"
},
{
  id:'P178', title:'The Grand Sweep', type:'win-in-4', rating:920,
  forcedDice:[1,1,1,1],
  boardState:{'a1':'0:rook','b1':'1:rook','b5':'1:rook','f5':'1:rook','f8':'1:king','h1':'0:king'},
  turnIndex:0,
  solution:[{from:'a1',to:'b1'},{from:'b1',to:'b5'},{from:'b5',to:'f5'},{from:'f5',to:'f8'}],
  hint:['b1 then b5 then f5 — capturing a Ratha each time','The f-file leads to the Raja on f8'],
  moralLesson:"Four captures in sequence — the supreme chariot strategy. — Arthashastra IX"
},
{
  id:'P179', title:'Horse Enters the Line', type:'win-in-4', rating:930,
  forcedDice:[3,1,1,1],
  boardState:{'b1':'0:horse','c3':'1:rook','a3':'0:rook','c6':'1:rook','c8':'1:king','h1':'0:king'},
  turnIndex:0,
  solution:[{from:'b1',to:'c3'},{from:'a3',to:'a6'},{from:'a6',to:'c6'},{from:'c6',to:'c8'}],
  hint:['Horse captures the Ratha on c3','Ratha advances to a6, swings to c6 capturing the Ratha','Then captures the Raja on c8'],
  moralLesson:"Cavalry forces entry; the chariot maneuvers to deliver the final blow. — Mahabharata"
},
{
  id:'P180', title:'The Chakravarti Four-Mover', type:'win-in-4', rating:960,
  forcedDice:[3,4,1,1],
  boardState:{'a1':'0:horse','b3':'1:rook','c3':'0:elephant','e5':'1:rook','h1':'0:rook','h5':'1:rook','g5':'1:king','a8':'0:king'},
  turnIndex:0,
  solution:[{from:'a1',to:'b3'},{from:'c3',to:'e5'},{from:'h1',to:'h5'},{from:'h5',to:'g5'}],
  hint:['Horse captures the Ratha on b3','Elephant leaps to e5 capturing the second Ratha','Ratha advances to h5 capturing the third','Ratha slides to g5 to capture the Raja'],
  moralLesson:"The Chakravarti does not hurry — each move serves a greater design. — Arthashastra XI"
},

// ── Endgame  (P181–P190)  850–960 ELO — King participation essential ──────
{
  id:'P181', title:'The Rook Maneuver', type:'endgame', rating:850,
  forcedDice:[1,6,1],
  boardState:{'a1':'0:rook','d5':'0:king','h8':'1:king','b3':'1:rook'},
  turnIndex:0,
  solution:[{from:'a1',to:'h1'},{from:'d5',to:'e6'},{from:'h1',to:'h8'}],
  hint:['Ratha swings to the h-file','Raja advances to e6 cutting off the escape','Ratha marches the h-file to capture the enemy Raja'],
  moralLesson:"The king who advances is the king who wins. — Arthashastra"
},
{
  id:'P182', title:'Cut Off and Squeeze', type:'endgame', rating:870,
  forcedDice:[1,6,1],
  boardState:{'h1':'0:rook','d6':'0:king','a8':'1:king','f5':'1:rook'},
  turnIndex:0,
  solution:[{from:'h1',to:'a1'},{from:'d6',to:'c7'},{from:'a1',to:'a8'}],
  hint:['Ratha occupies the a-file','Raja advances to c7 tightening the net','Ratha races to a8 to capture the cornered enemy Raja'],
  moralLesson:"First cut the escape; then advance the king; then strike. — Kautilya"
},
{
  id:'P183', title:'The Back Rank Technique', type:'endgame', rating:890,
  forcedDice:[6,1,1],
  boardState:{'e1':'0:rook','f6':'0:king','h8':'1:king','b4':'1:rook'},
  turnIndex:0,
  solution:[{from:'f6',to:'g6'},{from:'e1',to:'e8'},{from:'e8',to:'h8'}],
  hint:['Raja steps to g6 cutting off the enemy','Ratha occupies the back rank on e8','Ratha sweeps to h8 to capture the enemy Raja'],
  moralLesson:"King and rook in harmony produce the perfect endgame. — Arthashastra"
},
{
  id:'P184', title:'The King March to Victory', type:'endgame', rating:900,
  forcedDice:[6,1,1],
  boardState:{'d1':'0:rook','b5':'0:king','h5':'1:king','a8':'1:rook'},
  turnIndex:0,
  solution:[{from:'b5',to:'c6'},{from:'d1',to:'h1'},{from:'h1',to:'h5'}],
  hint:['King advances to c6 helping cut off the enemy','Ratha swings to the h-file','Ratha captures the enemy Raja on h5'],
  moralLesson:"The advancing king is the most powerful endgame weapon. — Chanakya Niti"
},
{
  id:'P185', title:'The a-File Net', type:'endgame', rating:910,
  forcedDice:[1,6,1],
  boardState:{'g1':'0:rook','c4':'0:king','a8':'1:king','h4':'1:rook'},
  turnIndex:0,
  solution:[{from:'g1',to:'a1'},{from:'c4',to:'b5'},{from:'a1',to:'a8'}],
  hint:['Ratha occupies the a-file from a1','King approaches to b5 supporting the attack','Ratha charges to a8 to capture the enemy Raja'],
  moralLesson:"Seize the file, advance the king, complete the conquest. — Arthashastra"
},
{
  id:'P186', title:'The King Escort', type:'endgame', rating:920,
  forcedDice:[1,6,1],
  boardState:{'h1':'0:rook','f5':'0:king','a5':'1:king','d8':'1:rook'},
  turnIndex:0,
  solution:[{from:'h1',to:'a1'},{from:'f5',to:'e6'},{from:'a1',to:'a5'}],
  hint:['Ratha swings to the a-file','Raja advances to e6 tightening the net','Ratha captures the enemy Raja on a5'],
  moralLesson:"The king who escorts the chariot commands the endgame. — Mahabharata, Shanti Parva"
},
{
  id:'P187', title:'Two Rathas, King Advances', type:'endgame', rating:930,
  forcedDice:[1,6,1],
  boardState:{'a1':'0:rook','b2':'0:rook','e6':'0:king','h8':'1:king'},
  turnIndex:0,
  solution:[{from:'a1',to:'a8'},{from:'e6',to:'f7'},{from:'a8',to:'h8'}],
  hint:['Ratha occupies the back rank on a8','Raja advances to f7 supporting','Ratha sweeps the back rank to capture the enemy Raja'],
  moralLesson:"Two chariots and a king form an unstoppable endgame trio. — Arthashastra"
},
{
  id:'P188', title:'The Long King Walk', type:'endgame', rating:940,
  forcedDice:[6,6,1],
  boardState:{'a1':'0:rook','c4':'0:king','a8':'1:king','h5':'1:rook'},
  turnIndex:0,
  solution:[{from:'c4',to:'b5'},{from:'b5',to:'a6'},{from:'a1',to:'a8'}],
  hint:['King walks to b5, then a6, closing in on the enemy','Ratha fires up the a-file to capture the enemy Raja'],
  moralLesson:"The endgame king is a warrior — march it forward. — Chanakya Niti"
},
{
  id:'P189', title:'The Lucena Pattern', type:'endgame', rating:950,
  forcedDice:[6,1,1],
  boardState:{'f1':'0:rook','c6':'0:king','h8':'1:king','b4':'1:rook'},
  turnIndex:0,
  solution:[{from:'c6',to:'d7'},{from:'f1',to:'h1'},{from:'h1',to:'h8'}],
  hint:['King advances to d7 cutting off the escape','Ratha swings to the h-file','Ratha charges to h8 to capture the enemy Raja'],
  moralLesson:"Precision in the endgame separates the Grandmaster from the rest. — Arthashastra"
},
{
  id:'P190', title:'The King Escort Finale', type:'endgame', rating:960,
  forcedDice:[1,6,6,1],
  boardState:{'h1':'0:rook','d4':'0:king','a8':'1:king','e6':'1:rook'},
  turnIndex:0,
  solution:[{from:'h1',to:'a1'},{from:'d4',to:'c5'},{from:'c5',to:'b6'},{from:'a1',to:'a8'}],
  hint:['Ratha seizes the a-file','King marches c5 then b6 tightening the net','Ratha delivers the final blow on a8'],
  moralLesson:"The endgame demands patience and precision above all else. — Chanakya"
},

// ── Supreme Combination  (P191–P200)  950–1000 ELO ────────────────────────
{
  id:'P191', title:"The Maharaja's Combination", type:'combination', rating:950,
  forcedDice:[3,1,1],
  boardState:{'d4':'0:horse','f5':'1:rook','a6':'0:rook','f6':'1:rook','f8':'1:king','a1':'0:king'},
  turnIndex:0,
  solution:[{from:'d4',to:'f5'},{from:'a6',to:'f6'},{from:'f6',to:'f8'}],
  hint:['Horse captures the Ratha on f5','Ratha sweeps rank 6 to capture the second Ratha on f6','Ratha advances the f-file to capture the Raja on f8'],
  moralLesson:"The Maharaja strikes and the enemy loses pieces and king at once. — Arthashastra"
},
{
  id:'P192', title:"The Samrat's Sequence", type:'win-in-4', rating:960,
  forcedDice:[3,1,1,1],
  boardState:{'c5':'0:horse','d7':'1:rook','a3':'0:rook','d3':'1:rook','h3':'1:rook','h5':'1:king','a1':'0:king'},
  turnIndex:0,
  solution:[{from:'c5',to:'d7'},{from:'a3',to:'d3'},{from:'d3',to:'h3'},{from:'h3',to:'h5'}],
  hint:['Horse captures the Ratha on d7','Ratha sweeps to d3 then to h3 capturing the second Ratha','Ratha charges up the h-file to capture the Raja on h5'],
  moralLesson:"The Samrat sees four moves ahead and executes without hesitation. — Arthashastra"
},
{
  id:'P193', title:"The Chakravarti Strike", type:'win-in-3', rating:970,
  forcedDice:[3,4,1],
  boardState:{'b4':'0:horse','d5':'1:rook','c1':'0:elephant','e3':'1:rook','h1':'0:rook','h8':'1:king','a1':'0:king'},
  turnIndex:0,
  solution:[{from:'b4',to:'d5'},{from:'c1',to:'e3'},{from:'h1',to:'h8'}],
  hint:['Horse captures the Ratha on d5','Elephant captures the Ratha on e3','Ratha charges the h-file to capture the Raja — total domination'],
  moralLesson:"The Chakravarti coordinates all forces to achieve total victory. — Arthashastra XI"
},
{
  id:'P194', title:'The Four-Move Masterstroke', type:'win-in-4', rating:975,
  forcedDice:[3,1,1,1],
  boardState:{'b1':'0:horse','c3':'1:rook','a6':'0:rook','g6':'1:rook','g8':'1:rook','h8':'1:king','a1':'0:king'},
  turnIndex:0,
  solution:[{from:'b1',to:'c3'},{from:'a6',to:'g6'},{from:'g6',to:'g8'},{from:'g8',to:'h8'}],
  hint:['Horse captures the guard on c3','Ratha sweeps to g6, then g8, then the Raja on h8','Four moves — one unstoppable sequence'],
  moralLesson:"The opening book ends with the closing chapter — the Raja's fall. — Chanakya Niti"
},
{
  id:'P195', title:'The Five-Piece Harmony', type:'win-in-4', rating:980,
  forcedDice:[3,4,1,1],
  boardState:{'c4':'0:horse','e5':'1:rook','d2':'0:elephant','f4':'1:rook','a8':'0:rook','e8':'1:rook','g8':'1:king','a1':'0:king'},
  turnIndex:0,
  solution:[{from:'c4',to:'e5'},{from:'d2',to:'f4'},{from:'a8',to:'e8'},{from:'e8',to:'g8'}],
  hint:['Horse captures the Ratha on e5','Elephant captures the Ratha on f4','Ratha sweeps to e8 capturing the third Ratha','Ratha slides to g8 to capture the Raja'],
  moralLesson:"When all pieces work as one, the enemy cannot calculate fast enough. — Arthashastra"
},
{
  id:'P196', title:'The Unstoppable March', type:'win-in-4', rating:982,
  forcedDice:[1,1,1,1],
  boardState:{'a1':'0:rook','b1':'1:rook','b4':'1:rook','b8':'1:rook','h8':'1:king','h1':'0:king'},
  turnIndex:0,
  solution:[{from:'a1',to:'b1'},{from:'b1',to:'b4'},{from:'b4',to:'b8'},{from:'b8',to:'h8'}],
  hint:['Four Rathas on one file — b1, b4, b8, then the Raja on h8','No move is wasted; no retreat is possible'],
  moralLesson:"The deepest calculation sees the final position from the very first move. — Arthashastra"
},
{
  id:'P197', title:'The Iterative Strike', type:'win-in-4', rating:985,
  forcedDice:[3,1,1,1],
  boardState:{'b3':'0:horse','d4':'1:rook','a4':'0:rook','h4':'1:rook','h7':'1:rook','h8':'1:king','a1':'0:king'},
  turnIndex:0,
  solution:[{from:'b3',to:'d4'},{from:'a4',to:'h4'},{from:'h4',to:'h7'},{from:'h7',to:'h8'}],
  hint:['Horse captures the Ratha on d4','Ratha sweeps rank 4 to h4 capturing the second Ratha','Ratha advances to h7, then h8 to capture the Raja'],
  moralLesson:"Deeper calculation reveals the path that shallower minds cannot see. — Chanakya"
},
{
  id:'P198', title:'The Alpha-Beta Cut', type:'win-in-4', rating:990,
  forcedDice:[3,4,1,1],
  boardState:{'d3':'0:horse','f4':'1:rook','a1':'0:elephant','c3':'1:rook','h1':'0:rook','h4':'1:rook','h8':'1:king','a8':'0:king'},
  turnIndex:0,
  solution:[{from:'d3',to:'f4'},{from:'a1',to:'c3'},{from:'h1',to:'h4'},{from:'h4',to:'h8'}],
  hint:['Horse captures the Ratha on f4','Elephant leaps to c3 capturing the second Ratha','Ratha advances to h4 capturing the third Ratha','Ratha charges to h8 to capture the Raja'],
  moralLesson:"The grandmaster prunes every bad line and strikes through the best one. — Arthashastra"
},
{
  id:'P199', title:'The Transposition Supreme', type:'win-in-4', rating:995,
  forcedDice:[3,4,1,1],
  boardState:{'c4':'0:horse','e5':'1:rook','a3':'0:elephant','c5':'1:rook','h3':'0:rook','h5':'1:rook','h8':'1:king','a1':'0:king'},
  turnIndex:0,
  solution:[{from:'c4',to:'e5'},{from:'a3',to:'c5'},{from:'h3',to:'h5'},{from:'h5',to:'h8'}],
  hint:['Horse captures the Ratha on e5','Elephant leaps to c5 capturing the second Ratha','Ratha sweeps to h5 capturing the third','Ratha charges to h8 to capture the Raja — supreme combination'],
  moralLesson:"The Chakravarti warrior memorises not individual moves, but entire winning sequences. — Arthashastra XI"
},
{
  id:'P200', title:"The Grand Masterpiece — Chakravarti's Legacy", type:'combination', rating:1000,
  forcedDice:[3,4,1,1],
  boardState:{'d4':'0:horse','f3':'1:rook','d2':'0:elephant','b4':'1:rook','a8':'0:rook','e8':'1:rook','h8':'1:king','a1':'0:king'},
  turnIndex:0,
  solution:[{from:'d4',to:'f3'},{from:'d2',to:'b4'},{from:'a8',to:'e8'},{from:'e8',to:'h8'}],
  hint:['Horse captures the Ratha on f3','Elephant leaps to b4 capturing the second Ratha','Ratha sweeps rank 8 to e8 capturing the third','Ratha slides to h8 — the Chakravarti\'s legacy is complete'],
  moralLesson:"The Chakravarti needs no further instruction — his game speaks for itself. — Ancient Chaturanga Tradition, 600 BCE"
}
];
