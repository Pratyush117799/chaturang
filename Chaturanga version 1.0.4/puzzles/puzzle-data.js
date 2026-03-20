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
  moralLesson:"Strike the enemy\'s strength, not just their weakness. — Arthashastra"
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
  id:'P013', title:'The Elephant\'s Leap', type:'danti-fork', rating:250,
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
  moralLesson:"Destroy the enemy\'s mobility first. — Arthashastra"
},
// ── Stalemate Trap (3) ────────────────────────────────────────────────────
{
  id:'P016', title:'The Frozen King', type:'stalemate-trap', rating:350,
  forcedDice:[6,1],
  boardState:{ 'h8':'1:king','g7':'0:rook','f6':'0:king','g8':'0:pawn' },
  turnIndex:0,
  solution:[{from:'g7',to:'g6'},{from:'f6',to:'g6'}],
  hint:['Rook cuts off escape squares','King closes the trap'],
  moralLesson:"Surround before you strike. — Kautilya\'s Arthashastra"
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
  moralLesson:"Rama\'s Vanara Sena prevailed through coordination. — Ramayana, Yuddha Kanda"
}
];
