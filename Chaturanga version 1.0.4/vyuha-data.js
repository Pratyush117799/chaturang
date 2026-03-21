/**
 * Chaturanga v1.0.5 — Vyuha Formation Data
 * Boards: 12×12 / 14×14 / 16×16 / 18×18
 * Source: Vyuhas — The Strategic Formations, Mahabharata Research
 */
(function(G){'use strict';

function mirror(pieces,size){return pieces.map(p=>({...p,rank:size-1-p.rank}));}
function bothSides(p0,size){return[p0.map(p=>({...p,player:0})),mirror(p0,size).map(p=>({...p,player:1}))];}

/* ══ 12×12 ══════════════════════════════════════════════════════════ */
function shakata12(){const S=12,p0=[];
  p0.push({type:'rook',file:0,rank:2,role:'left-wheel'},{type:'rook',file:5,rank:2,role:'centre-ratha'},{type:'rook',file:11,rank:2,role:'right-wheel'});
  [1,3,5,7,9].forEach((f,i)=>p0.push({type:i%2===0?'horse':'elephant',file:f,rank:1,role:'second-rank'}));
  p0.push({type:'elephant',file:11,rank:1,role:'second-rank'});
  for(let f=0;f<S;f++)p0.push({type:'pawn',file:f,rank:0,role:'nara-wall'});
  p0.push({type:'horse',file:2,rank:3,role:'inner-cavalry'},{type:'elephant',file:4,rank:3,role:'inner-elephant'},{type:'elephant',file:7,rank:3,role:'inner-elephant'});
  p0.push({type:'king',file:5,rank:4,role:'raja-protected'});
  return bothSides(p0,S);}

function vajra12(){const S=12,p0=[],cx=5,cy=3;
  p0.push({type:'rook',file:cx,rank:cy-2,role:'vajra-tip'});
  p0.push({type:'horse',file:cx-2,rank:cy,role:'left-arm'},{type:'king',file:cx,rank:cy,role:'raja-centre'},{type:'horse',file:cx+2,rank:cy,role:'right-arm'});
  p0.push({type:'rook',file:cx-1,rank:cy+2,role:'rear-left'},{type:'rook',file:cx+1,rank:cy+2,role:'rear-right'});
  p0.push({type:'elephant',file:cx-3,rank:cy-1,role:'left-flank'},{type:'elephant',file:cx+3,rank:cy-1,role:'right-flank'},{type:'elephant',file:cx,rank:cy+3,role:'rear-guard'});
  [[cx-1,cy-1],[cx+1,cy-1],[cx-2,cy-2],[cx+2,cy-2],[cx-1,cy+1],[cx+1,cy+1],[cx-3,cy+1],[cx+3,cy+1],[cx-2,cy+2],[cx+2,cy+2],[cx-1,cy+3],[cx+1,cy+3]].forEach(([f,r])=>{if(f>=0&&f<S&&r>=0&&r<S)p0.push({type:'pawn',file:f,rank:r,role:'nara-ring'});});
  return bothSides(p0,S);}

function mandala12(){const S=12,p0=[],cx=5,cy=5;
  p0.push({type:'king',file:cx,rank:cy,role:'galaxy-centre'});
  [{df:0,dr:2,t:'rook'},{df:2,dr:1,t:'rook'},{df:2,dr:-1,t:'horse'},{df:0,dr:-2,t:'rook'},{df:-2,dr:-1,t:'horse'},{df:-2,dr:1,t:'elephant'}].forEach(s=>p0.push({type:s.t,file:cx+s.df,rank:cy+s.dr,role:'spoke-maharathi'}));
  [{df:0,dr:3},{df:3,dr:0},{df:0,dr:-3},{df:-3,dr:0}].forEach(s=>p0.push({type:'elephant',file:cx+s.df,rank:cy+s.dr,role:'outer-danti'}));
  for(let f=0;f<S;f++)for(let r=0;r<S;r++){const d=Math.sqrt((f-cx)**2+(r-cy)**2);if((Math.abs(d-1.5)<0.6||Math.abs(d-4)<0.6)&&!p0.some(p=>p.file===f&&p.rank===r))p0.push({type:'pawn',file:f,rank:r,role:'nara-ring'});}
  return bothSides(p0,S);}

/* ══ 14×14 ══════════════════════════════════════════════════════════ */
function garuda14(){const S=14,p0=[],mid=6;
  p0.push({type:'rook',file:mid,rank:0,role:'beak-tip'},{type:'rook',file:mid-1,rank:1,role:'beak-l'},{type:'rook',file:mid+1,rank:1,role:'beak-r'});
  p0.push({type:'horse',file:mid-2,rank:2,role:'eye-l'},{type:'horse',file:mid+2,rank:2,role:'eye-r'});
  p0.push({type:'elephant',file:mid-3,rank:3,role:'head-l'},{type:'elephant',file:mid+3,rank:3,role:'head-r'});
  for(let f=mid-2;f<=mid+2;f++)p0.push({type:'pawn',file:f,rank:3,role:'neck'});
  [[1,4],[2,5],[3,6],[0,5],[0,6]].forEach(([f,r])=>{p0.push({type:'pawn',file:f,rank:r,role:'left-wing'});p0.push({type:'pawn',file:S-1-f,rank:r,role:'right-wing'});});
  p0.push({type:'horse',file:0,rank:4,role:'wing-l'},{type:'horse',file:S-1,rank:4,role:'wing-r'});
  p0.push({type:'elephant',file:1,rank:5,role:'wing-danti-l'},{type:'elephant',file:S-2,rank:5,role:'wing-danti-r'});
  p0.push({type:'rook',file:mid-1,rank:7,role:'tail-l'},{type:'king',file:mid,rank:8,role:'raja-tail'},{type:'rook',file:mid+1,rank:7,role:'tail-r'});
  for(let f=mid-1;f<=mid+1;f++)for(let r=4;r<=6;r++)if(!p0.some(p=>p.file===f&&p.rank===r))p0.push({type:'pawn',file:f,rank:r,role:'body'});
  return bothSides(p0,S);}

function krauncha14(){const S=14,p0=[],mid=6;
  for(let r=0;r<4;r++)p0.push({type:r<2?'rook':'horse',file:mid,rank:r,role:'beak-neck'});
  p0.push({type:'elephant',file:mid-1,rank:2,role:'eye-l'},{type:'elephant',file:mid+1,rank:2,role:'eye-r'});
  for(let i=1;i<=5;i++){p0.push({type:'pawn',file:mid-i,rank:i+2,role:'left-wing'});p0.push({type:'pawn',file:mid+i,rank:i+2,role:'right-wing'});}
  p0.push({type:'horse',file:mid-3,rank:4,role:'ashwa-l'},{type:'horse',file:mid+3,rank:4,role:'ashwa-r'});
  p0.push({type:'elephant',file:mid-5,rank:6,role:'tip-l'},{type:'elephant',file:mid+5,rank:6,role:'tip-r'});
  p0.push({type:'rook',file:mid-4,rank:5,role:'ratha-l'},{type:'rook',file:mid+4,rank:5,role:'ratha-r'});
  p0.push({type:'king',file:mid,rank:7,role:'raja-body'});
  for(let f=mid-1;f<=mid+1;f++)p0.push({type:'pawn',file:f,rank:6,role:'guard'});
  return bothSides(p0,S);}

function makara14(){const S=14,p0=[];
  for(let f=0;f<S;f++)p0.push({type:'pawn',file:f,rank:0,role:'jaw-nara'});
  [0,2,5,8,11,13].forEach(f=>p0.push({type:'elephant',file:f,rank:1,role:'jaw-danti'}));
  p0.push({type:'rook',file:0,rank:2,role:'jaw-l'},{type:'rook',file:S-1,rank:2,role:'jaw-r'});
  [[2,3],[4,3],[8,3],[10,3]].forEach(([f,r])=>p0.push({type:'horse',file:f,rank:r,role:'body-ashwa'}));
  for(let f=3;f<=10;f++)p0.push({type:'pawn',file:f,rank:3,role:'body-nara'});
  for(let f=4;f<=9;f++)p0.push({type:'pawn',file:f,rank:4,role:'neck-nara'});
  p0.push({type:'elephant',file:4,rank:5,role:'neck-l'},{type:'elephant',file:9,rank:5,role:'neck-r'});
  for(let f=5;f<=8;f++)p0.push({type:'pawn',file:f,rank:5,role:'tail-nara'});
  p0.push({type:'rook',file:6,rank:6,role:'tail-ratha'},{type:'rook',file:7,rank:6,role:'tail-ratha'},{type:'king',file:6,rank:7,role:'raja-tail'});
  return bothSides(p0,S);}

function ardhachandra14(){const S=14,p0=[],cx=6;
  p0.push({type:'rook',file:0,rank:3,role:'tip-l'},{type:'horse',file:1,rank:2,role:'ashwa-l'},{type:'elephant',file:0,rank:4,role:'danti-l'});
  p0.push({type:'rook',file:S-1,rank:3,role:'tip-r'},{type:'horse',file:S-2,rank:2,role:'ashwa-r'},{type:'elephant',file:S-1,rank:4,role:'danti-r'});
  [[1,1],[2,0],[3,0],[4,0],[5,1],[6,2],[7,1],[8,0],[9,0],[10,0],[11,1],[12,1]].forEach(([f,r])=>p0.push({type:'pawn',file:f,rank:r,role:'arc'}));
  p0.push({type:'horse',file:cx-1,rank:2,role:'centre-l'},{type:'horse',file:cx+1,rank:2,role:'centre-r'});
  p0.push({type:'elephant',file:cx-2,rank:4,role:'rear-l'},{type:'elephant',file:cx+2,rank:4,role:'rear-r'});
  p0.push({type:'rook',file:cx-1,rank:5,role:'ratha-l'},{type:'rook',file:cx+1,rank:5,role:'ratha-r'});
  for(let f=cx-1;f<=cx+1;f++)p0.push({type:'pawn',file:f,rank:3,role:'guard'});
  p0.push({type:'king',file:cx,rank:6,role:'raja-safe'});
  return bothSides(p0,S);}

/* ══ 16×16 ══════════════════════════════════════════════════════════ */
function chakra3_16(){const S=16,p0=[],cx=7,cy=5;
  [[5.5,'pawn','elephant'],[3.2,'rook','horse'],[1.5,'rook','rook']].forEach(([rad,t1,t2])=>{
    for(let f=0;f<S;f++)for(let r=0;r<S;r++){const d=Math.sqrt((f-cx)**2+(r-cy)**2);if(Math.abs(d-rad)<0.78&&!p0.some(p=>p.file===f&&p.rank===r))p0.push({type:(f+r)%2===0?t1:t2,file:f,rank:r,role:`ring-r${rad}`});}
  });
  if(!p0.some(p=>p.file===cx&&p.rank===cy))p0.push({type:'king',file:cx,rank:cy,role:'centre'});
  return bothSides(p0,S);}

function trishula16(){const S=16,p0=[],mid=7;
  [mid-4,mid,mid+4].forEach((f,i)=>{
    p0.push({type:'rook',file:f,rank:0,role:`tip${i}`});
    for(let r=1;r<=4;r++)p0.push({type:r===2?'horse':'pawn',file:f,rank:r,role:`shaft${i}`});
    if(f-1>=0)p0.push({type:'elephant',file:f-1,rank:3,role:'flank-l'});
    if(f+1<S)p0.push({type:'elephant',file:f+1,rank:3,role:'flank-r'});
  });
  for(let f=mid-5;f<=mid+5;f++)if(!p0.some(p=>p.file===f&&p.rank===5))p0.push({type:'pawn',file:f,rank:5,role:'bar'});
  p0.push({type:'rook',file:mid-1,rank:6,role:'shaft-l'},{type:'rook',file:mid+1,rank:6,role:'shaft-r'});
  p0.push({type:'horse',file:mid-2,rank:7,role:'ashwa-l'},{type:'horse',file:mid+2,rank:7,role:'ashwa-r'});
  for(let f=mid-1;f<=mid+1;f++)p0.push({type:'pawn',file:f,rank:7,role:'guard'});
  p0.push({type:'king',file:mid,rank:8,role:'raja'});
  return bothSides(p0,S);}

function kurma16(){const S=16,p0=[],cx=7,cy=5;
  for(let f=0;f<S;f++)for(let r=0;r<S;r++){const d=Math.sqrt((f-cx)**2+(r-cy)**2);
    if(Math.abs(d-5)<0.85&&!p0.some(p=>p.file===f&&p.rank===r))p0.push({type:(f+r)%3===0?'elephant':'pawn',file:f,rank:r,role:'outer-shell'});
    if(Math.abs(d-3)<0.8&&!p0.some(p=>p.file===f&&p.rank===r))p0.push({type:'horse',file:f,rank:r,role:'inner-shell'});}
  [[cx,cy+5],[cx,cy-5],[cx-5,cy],[cx+5,cy]].forEach(([f,r])=>{if(f>=0&&f<S&&r>=0&&r<S&&!p0.some(p=>p.file===f&&p.rank===r))p0.push({type:'rook',file:f,rank:r,role:'limb'});});
  p0.push({type:'rook',file:cx-2,rank:cy,role:'inner-l'},{type:'rook',file:cx+2,rank:cy,role:'inner-r'});
  if(!p0.some(p=>p.file===cx&&p.rank===cy))p0.push({type:'king',file:cx,rank:cy,role:'centre'});
  return bothSides(p0,S);}

function suchi16(){const S=16,p0=[],mid=7;
  p0.push({type:'rook',file:mid,rank:0,role:'needle-point'});
  p0.push({type:'horse',file:mid-1,rank:1,role:'needle-l'},{type:'horse',file:mid+1,rank:1,role:'needle-r'});
  for(let r=2;r<S;r++){const half=Math.min(Math.floor(r*0.7),6);
    for(let f=mid-half;f<=mid+half;f++){if(!p0.some(p=>p.file===f&&p.rank===r)){let t='pawn';if(f===mid-half||f===mid+half)t=r%3===0?'elephant':'rook';else if(r===3&&Math.abs(f-mid)===2)t='horse';p0.push({type:t,file:f,rank:r,role:r<4?'shaft':'base'});}}}
  const rajaf=mid,rajar=S-2;if(!p0.some(p=>p.file===rajaf&&p.rank===rajar))p0.push({type:'king',file:rajaf,rank:rajar,role:'raja'});
  return bothSides(p0,S);}

function sarvatobhadra16(){const S=16,p0=[],cx=7,cy=6;
  p0.push({type:'king',file:cx,rank:cy,role:'centre'});
  [{df:0,dr:4,t:'rook'},{df:3,dr:2,t:'rook'},{df:3,dr:-2,t:'rook'},{df:0,dr:-4,t:'rook'},{df:-3,dr:-2,t:'horse'},{df:-3,dr:2,t:'horse'}].forEach(s=>{
    for(let i=1;i<3;i++){const f=cx+Math.round(s.df*i/3),r=cy+Math.round(s.dr*i/3);if(f>=0&&f<S&&r>=0&&r<S&&!p0.some(p=>p.file===f&&p.rank===r))p0.push({type:'pawn',file:f,rank:r,role:'spoke'});}
    const mf=cx+Math.round(s.df*0.6),mr=cy+Math.round(s.dr*0.6);if(mf>=0&&mf<S&&mr>=0&&mr<S&&!p0.some(p=>p.file===mf&&p.rank===mr))p0.push({type:'elephant',file:mf,rank:mr,role:'mid-spoke'});
    if(cx+s.df>=0&&cx+s.df<S&&cy+s.dr>=0&&cy+s.dr<S)p0.push({type:s.t,file:cx+s.df,rank:cy+s.dr,role:'tip'});
  });
  [[cx-1,cy-1],[cx+1,cy-1],[cx-1,cy+1],[cx+1,cy+1],[cx-2,cy],[cx+2,cy],[cx,cy-2],[cx,cy+2]].forEach(([f,r])=>{if(!p0.some(p=>p.file===f&&p.rank===r))p0.push({type:'pawn',file:f,rank:r,role:'guard'});});
  return bothSides(p0,S);}

/* ══ 18×18 ══════════════════════════════════════════════════════════ */
function chakra7_18(){const S=18,p0=[],cx=8,cy=7;
  const radii=[6.8,5.6,4.5,3.5,2.5,1.6,0.7];
  const types=[(f,r)=>'pawn',(f,r)=>(f+r)%2===0?'elephant':'pawn',(f,r)=>(f+r)%2===0?'horse':'pawn',(f,r)=>'rook',(f,r)=>'elephant',(f,r)=>'rook',(f,r)=>'horse'];
  radii.forEach((rad,ri)=>{for(let f=0;f<S;f++)for(let r=0;r<S;r++){const d=Math.sqrt((f-cx)**2+(r-cy)**2);if(Math.abs(d-rad)<0.78&&!p0.some(p=>p.file===f&&p.rank===r))p0.push({type:types[ri](f,r),file:f,rank:r,role:`ring${ri+1}`});}});
  if(!p0.some(p=>p.file===cx&&p.rank===cy))p0.push({type:'king',file:cx,rank:cy,role:'inner-sanctum'});
  return bothSides(p0,S);}

function padma18(){const S=18,p0=[],cx=8,cy=7;
  for(let f=0;f<S;f++)for(let r=0;r<S;r++){const dx=f-cx,dy=r-cy,d=Math.sqrt(dx*dx+dy*dy),ang=Math.atan2(dy,dx),pet=Math.sin(ang*5)*S*0.07;
    const oO=Math.abs(d-(S*0.38+pet))<0.9,oI=Math.abs(d-(S*0.22+pet*0.7))<0.85;
    if((oO||oI)&&!p0.some(p=>p.file===f&&p.rank===r))p0.push({type:oI?(f+r)%2===0?'rook':'horse':(f+r)%3===0?'elephant':'pawn',file:f,rank:r,role:oO?'outer':'inner'});}
  if(!p0.some(p=>p.file===cx&&p.rank===cy))p0.push({type:'king',file:cx,rank:cy,role:'heart'});
  return bothSides(p0,S);}

function oormi18(){const S=18,p0=[],mid=Math.floor(S/2);
  for(let f=0;f<S;f++){[[2+Math.round(Math.sin(f/S*Math.PI*4)*2),'rook'],[5+Math.round(Math.sin(f/S*Math.PI*4+Math.PI)*2),'horse'],[8+Math.round(Math.sin(f/S*Math.PI*3)*1.5),'pawn']].forEach(([r,t])=>{if(r>=0&&r<S&&!p0.some(p=>p.file===f&&p.rank===r))p0.push({type:t,file:f,rank:r,role:'wave'});if(r+1<S&&!p0.some(p=>p.file===f&&p.rank===r+1))p0.push({type:'pawn',file:f,rank:r+1,role:'crest'});});}
  if(!p0.some(p=>p.file===mid&&p.rank===S-2))p0.push({type:'king',file:mid,rank:S-2,role:'raja'});
  return bothSides(p0,S);}

function danda18(){const S=18,p0=[],mid=8,hR=4;
  [{df:0,dr:0,t:'king'},{df:0,dr:-3,t:'rook'},{df:3,dr:-1,t:'rook'},{df:3,dr:2,t:'horse'},{df:0,dr:3,t:'horse'},{df:-3,dr:2,t:'elephant'},{df:-3,dr:-1,t:'elephant'}].forEach(s=>{const f=mid+s.df,r=hR+s.dr;if(f>=0&&f<S&&r>=0&&r<S)p0.push({type:s.t,file:f,rank:r,role:'head'});});
  for(let f=0;f<S;f++)for(let r=0;r<S;r++){const d=Math.sqrt((f-mid)**2+(r-hR)**2);if(Math.abs(d-4)<0.8&&!p0.some(p=>p.file===f&&p.rank===r))p0.push({type:'pawn',file:f,rank:r,role:'head-ring'});}
  for(let r=hR+5;r<S-1;r++){const w=Math.max(0,3-Math.floor((r-hR-5)*0.4));for(let f=mid-w;f<=mid+w;f++)if(!p0.some(p=>p.file===f&&p.rank===r))p0.push({type:r%4===0?'rook':r%3===0?'horse':'pawn',file:f,rank:r,role:'danda'});}
  return bothSides(p0,S);}

function asura18(){const S=18,p0=[],mid=8;
  for(let f=0;f<S;f++)p0.push({type:'pawn',file:f,rank:0,role:'front'});
  [0,2,4,6,8,10,12,14,16].forEach(f=>p0.push({type:'elephant',file:f,rank:1,role:'danti-wall'}));
  [1,3,5,8,10,13,15].forEach(f=>p0.push({type:'rook',file:f,rank:1,role:'ratha-wall'}));
  [0,3,6,9,12,15].forEach(f=>p0.push({type:'horse',file:f,rank:2,role:'ashwa'}));
  for(let f=0;f<S;f++)if(!p0.some(p=>p.file===f&&p.rank===2))p0.push({type:'pawn',file:f,rank:2,role:'second'});
  for(let f=1;f<S-1;f++)p0.push({type:'pawn',file:f,rank:3,role:'third'});
  p0.push({type:'rook',file:mid-2,rank:5,role:'rear-l'},{type:'rook',file:mid+2,rank:5,role:'rear-r'});
  p0.push({type:'elephant',file:mid-3,rank:5,role:'rear-danti-l'},{type:'elephant',file:mid+3,rank:5,role:'rear-danti-r'});
  p0.push({type:'horse',file:mid-1,rank:6,role:'rear-ashwa-l'},{type:'horse',file:mid+1,rank:6,role:'rear-ashwa-r'});
  p0.push({type:'king',file:mid,rank:7,role:'raja'});
  return bothSides(p0,S);}

/* ══ 12×12 ADDITIONS ════════════════════════════════════════════════ */
function sringataka12(){const S=12,p0=[];
  // Left horn — rook tip, horse flanks, elephant base
  p0.push({type:'rook',file:1,rank:0,role:'l-tip'});
  p0.push({type:'horse',file:0,rank:1,role:'l-outer'},{type:'horse',file:2,rank:1,role:'l-inner'});
  p0.push({type:'elephant',file:0,rank:2,role:'l-base-out'},{type:'elephant',file:1,rank:2,role:'l-base-mid'});
  // Right horn
  p0.push({type:'rook',file:10,rank:0,role:'r-tip'});
  p0.push({type:'horse',file:11,rank:1,role:'r-outer'},{type:'horse',file:9,rank:1,role:'r-inner'});
  p0.push({type:'elephant',file:11,rank:2,role:'r-base-out'},{type:'elephant',file:10,rank:2,role:'r-base-mid'});
  // Connecting pawn wall between horns
  for(let f=2;f<=9;f++)p0.push({type:'pawn',file:f,rank:0,role:'base-wall'});
  for(let f=3;f<=8;f++)p0.push({type:'pawn',file:f,rank:1,role:'second-wall'});
  for(let f=4;f<=7;f++)p0.push({type:'pawn',file:f,rank:2,role:'neck'});
  // Fortified centre body
  p0.push({type:'rook',file:5,rank:3,role:'centre-l'},{type:'rook',file:6,rank:3,role:'centre-r'});
  p0.push({type:'horse',file:4,rank:4,role:'guard-l'},{type:'horse',file:7,rank:4,role:'guard-r'});
  p0.push({type:'king',file:5,rank:5,role:'raja'});
  return bothSides(p0,S);}

function mala12(){const S=12,p0=[],cx=5,cy=4;
  // Commander at centre
  p0.push({type:'king',file:cx,rank:cy,role:'raja-centre'});
  // Inner ring of Maharathis (radius 2)
  [{df:0,dr:2,t:'rook'},{df:2,dr:1,t:'horse'},{df:2,dr:-1,t:'elephant'},{df:0,dr:-2,t:'rook'},{df:-2,dr:-1,t:'horse'},{df:-2,dr:1,t:'elephant'}]
    .forEach(s=>p0.push({type:s.t,file:cx+s.df,rank:cy+s.dr,role:'inner-ring'}));
  // Pawn connectors linking inner ring — the chain links of the garland
  [{df:1,dr:1},{df:1,dr:-1},{df:-1,dr:1},{df:-1,dr:-1},{df:0,dr:1},{df:0,dr:-1},{df:1,dr:0},{df:-1,dr:0}]
    .forEach(s=>{const f=cx+s.df,r=cy+s.dr;if(!p0.some(p=>p.file===f&&p.rank===r))p0.push({type:'pawn',file:f,rank:r,role:'chain-link'});});
  // Outer garland ring (radius ~4)
  for(let f=0;f<S;f++)for(let r=0;r<S;r++){const d=Math.sqrt((f-cx)**2+(r-cy)**2);
    if(Math.abs(d-4)<0.88&&!p0.some(p=>p.file===f&&p.rank===r))
      p0.push({type:(f+r)%4===0?'rook':(f+r)%3===0?'horse':'pawn',file:f,rank:r,role:'garland'});}
  return bothSides(p0,S);}

/* ══ 14×14 ADDITIONS ════════════════════════════════════════════════ */
function shyen14(){const S=14,p0=[],mid=6;
  // Compact hawk head + beak — steeper than Garuda
  p0.push({type:'rook',file:mid,rank:0,role:'beak-point'});
  p0.push({type:'horse',file:mid-1,rank:1,role:'head-l'},{type:'horse',file:mid+1,rank:1,role:'head-r'});
  p0.push({type:'rook',file:mid-1,rank:2,role:'chest-l'},{type:'elephant',file:mid,rank:2,role:'throat'},{type:'rook',file:mid+1,rank:2,role:'chest-r'});
  // Steep swept wings (angle sharper than Garuda's gentle V)
  for(let i=1;i<=5;i++){p0.push({type:'pawn',file:mid-i,rank:i+1,role:'l-wing'});p0.push({type:'pawn',file:mid+i,rank:i+1,role:'r-wing'});}
  p0.push({type:'horse',file:mid-3,rank:4,role:'wing-ashwa-l'},{type:'horse',file:mid+3,rank:4,role:'wing-ashwa-r'});
  // Hooked talons at wing tips
  p0.push({type:'elephant',file:0,rank:6,role:'talon-l'},{type:'rook',file:1,rank:7,role:'claw-l'});
  p0.push({type:'elephant',file:S-1,rank:6,role:'talon-r'},{type:'rook',file:S-2,rank:7,role:'claw-r'});
  // Body and tail
  for(let r=3;r<=5;r++)for(let f=mid-1;f<=mid+1;f++)if(!p0.some(p=>p.file===f&&p.rank===r))p0.push({type:'pawn',file:f,rank:r,role:'body'});
  if(!p0.some(p=>p.file===mid&&p.rank===6))p0.push({type:'king',file:mid,rank:6,role:'raja-tail'});
  return bothSides(p0,S);}

function gomutrika14(){const S=14,p0=[];
  // Gomutrika = "cow's urine path" = army traces a zigzag V-shape from above.
  // Two interleaved V-bands attack from diagonal angles simultaneously.
  for(let f=0;f<S;f++){
    const r0=Math.round(Math.abs(f-6.5)*0.55);  // front V — lowest at mid, rising to edges
    if(!p0.some(p=>p.file===f&&p.rank===r0)){
      const t=(f===0||f===13)?'rook':(f===3||f===10)?'elephant':(f===6||f===7)?'horse':'pawn';
      p0.push({type:t,file:f,rank:r0,role:'front-v'});}
    const r1=r0+3;
    if(r1<S&&!p0.some(p=>p.file===f&&p.rank===r1))
      p0.push({type:f%3===0?'horse':'pawn',file:f,rank:r1,role:'mid-v'});
    const r2=r0+6;
    if(r2<10&&!p0.some(p=>p.file===f&&p.rank===r2))
      p0.push({type:'pawn',file:f,rank:r2,role:'rear-v'});}
  // Anchoring Rathas at the outer zigzag peaks
  [[0,0],[13,0]].forEach(([f,r])=>{if(!p0.some(p=>p.file===f&&p.rank===r))p0.push({type:'rook',file:f,rank:r,role:'peak'});});
  if(!p0.some(p=>p.file===6&&p.rank===9))p0.push({type:'king',file:6,rank:9,role:'raja'});
  return bothSides(p0,S);}

/* ══ 16×16 ADDITIONS ════════════════════════════════════════════════ */
function nakshatra16(){const S=16,p0=[],cx=7,cy=7;
  // 8 star-cluster nodes orbiting the centre like a constellation wheel
  const stars=[{f:7,r:2},{f:11,r:3},{f:13,r:7},{f:11,r:11},{f:7,r:13},{f:3,r:11},{f:2,r:7},{f:3,r:3}];
  stars.forEach(({f,r},i)=>{
    p0.push({type:'rook',file:f,rank:r,role:`star${i}`});
    [[0,1],[1,0],[0,-1],[-1,0]].forEach(([df,dr])=>{const nf=f+df,nr=r+dr;
      if(nf>=0&&nf<S&&nr>=0&&nr<S&&!p0.some(p=>p.file===nf&&p.rank===nr))p0.push({type:'pawn',file:nf,rank:nr,role:`cluster${i}`});});
    // Elephant linkers connecting stars to centre
    if(i%2===0){const mf=cx+Math.round((f-cx)*0.5),mr=cy+Math.round((r-cy)*0.5);
      if(mf>=0&&mf<S&&mr>=0&&mr<S&&!p0.some(p=>p.file===mf&&p.rank===mr))p0.push({type:'elephant',file:mf,rank:mr,role:'radial-link'});}
    // Horse connectors between adjacent stars
    const ns=stars[(i+1)%8];const bf=Math.round((f+ns.f)/2),br=Math.round((r+ns.r)/2);
    if(bf>=0&&bf<S&&br>=0&&br<S&&!p0.some(p=>p.file===bf&&p.rank===br))p0.push({type:'horse',file:bf,rank:br,role:'star-bridge'});});
  p0.push({type:'king',file:cx,rank:cy,role:'raja-centre'});
  return bothSides(p0,S);}

function vyaghra16(){const S=16,p0=[],mid=7;
  // Tiger head — wide powerful jaw
  p0.push({type:'rook',file:mid-1,rank:0,role:'fang-l'},{type:'rook',file:mid+1,rank:0,role:'fang-r'});
  p0.push({type:'elephant',file:mid-2,rank:1,role:'jaw-l'},{type:'horse',file:mid,rank:1,role:'snout'},{type:'elephant',file:mid+2,rank:1,role:'jaw-r'});
  for(let f=mid-3;f<=mid+3;f++)if(!p0.some(p=>p.file===f&&p.rank===2))p0.push({type:'pawn',file:f,rank:2,role:'brow'});
  // Neck
  p0.push({type:'horse',file:mid-2,rank:3,role:'neck-l'},{type:'horse',file:mid+2,rank:3,role:'neck-r'});
  for(let f=mid-1;f<=mid+1;f++)p0.push({type:'pawn',file:f,rank:3,role:'neck-mid'});
  // Body — wide, muscular
  for(let r=4;r<=6;r++){const w=r-1;
    for(let f=mid-w;f<=mid+w;f++)if(!p0.some(p=>p.file===f&&p.rank===r))
      p0.push({type:(r===5&&Math.abs(f-mid)===w)?'rook':'pawn',file:f,rank:r,role:'body'});}
  // Powerful haunches
  p0.push({type:'rook',file:mid-4,rank:7,role:'haunch-l'},{type:'rook',file:mid+4,rank:7,role:'haunch-r'});
  p0.push({type:'elephant',file:mid-3,rank:8,role:'rear-l'},{type:'elephant',file:mid+3,rank:8,role:'rear-r'});
  for(let f=mid-2;f<=mid+2;f++)if(!p0.some(p=>p.file===f&&p.rank===8))p0.push({type:'pawn',file:f,rank:8,role:'rear-body'});
  if(!p0.some(p=>p.file===mid&&p.rank===9))p0.push({type:'king',file:mid,rank:9,role:'raja-spine'});
  return bothSides(p0,S);}

/* ══ 18×18 ADDITIONS ════════════════════════════════════════════════ */
function deva18(){const S=18,p0=[],mid=8;
  // Six light-ray columns — fast targeted strike vs Asura's brute wall
  [2,4,6,10,12,14].forEach((f,i)=>{
    p0.push({type:'rook',file:f,rank:0,role:'ray-tip'});
    p0.push({type:'horse',file:f,rank:1,role:'ray-horse'});
    for(let r=2;r<=5;r++)if(!p0.some(p=>p.file===f&&p.rank===r))p0.push({type:'pawn',file:f,rank:r,role:'ray-body'});
    if(i%2===0&&!p0.some(p=>p.file===f&&p.rank===6))p0.push({type:'elephant',file:f,rank:6,role:'ray-base'});});
  // Bridge connecting all rays at ranks 7–8
  for(let f=2;f<=14;f+=2)if(!p0.some(p=>p.file===f&&p.rank===7))p0.push({type:'elephant',file:f,rank:7,role:'bridge'});
  for(let f=3;f<=13;f+=2)p0.push({type:'pawn',file:f,rank:7,role:'bridge-pawn'});
  // Raja guarded at centre
  for(let f=mid-2;f<=mid+2;f++)if(!p0.some(p=>p.file===f&&p.rank===8))p0.push({type:'pawn',file:f,rank:8,role:'guard'});
  if(!p0.some(p=>p.file===mid&&p.rank===9))p0.push({type:'king',file:mid,rank:9,role:'raja'});
  return bothSides(p0,S);}

function chakrashakata18(){const S=18,p0=[],mid=8;
  // FRONT — Suchimukha needle
  p0.push({type:'rook',file:mid,rank:0,role:'needle-tip'});
  p0.push({type:'horse',file:mid-1,rank:1,role:'needle-l'},{type:'horse',file:mid+1,rank:1,role:'needle-r'});
  for(let r=2;r<=5;r++){for(let f=mid-r;f<=mid+r;f++)if(!p0.some(p=>p.file===f&&p.rank===r))
    p0.push({type:(f===mid-r||f===mid+r)?'rook':'pawn',file:f,rank:r,role:'needle-body'});}
  // FLANKS — two Chakra mini-wheels at sides
  [mid-6,mid+6].forEach((cx,si)=>{const cy=5;
    for(let f=0;f<S;f++)for(let r=0;r<S;r++){const d=Math.sqrt((f-cx)**2+(r-cy)**2);
      if(Math.abs(d-3)<0.72&&!p0.some(p=>p.file===f&&p.rank===r)&&f>=0&&f<S&&r>=0&&r<S)
        p0.push({type:(f+r)%2===0?'elephant':'pawn',file:f,rank:r,role:`flank-wheel-${si}`});}});
  // REAR — Shakata box protecting Raja
  for(let f=mid-5;f<=mid+5;f++){
    if(!p0.some(p=>p.file===f&&p.rank===11))p0.push({type:(f===mid-5||f===mid+5)?'rook':'pawn',file:f,rank:11,role:'cart-front'});
    if(!p0.some(p=>p.file===f&&p.rank===14))p0.push({type:(f===mid-5||f===mid+5)?'rook':'pawn',file:f,rank:14,role:'cart-rear'});}
  for(let r=12;r<=13;r++){if(!p0.some(p=>p.file===mid-5&&p.rank===r))p0.push({type:'elephant',file:mid-5,rank:r,role:'cart-l'});
    if(!p0.some(p=>p.file===mid+5&&p.rank===r))p0.push({type:'elephant',file:mid+5,rank:r,role:'cart-r'});}
  p0.push({type:'horse',file:mid-2,rank:12,role:'inner-guard-l'},{type:'horse',file:mid+2,rank:12,role:'inner-guard-r'});
  if(!p0.some(p=>p.file===mid&&p.rank===13))p0.push({type:'king',file:mid,rank:13,role:'raja-protected'});
  return bothSides(p0,S);}

function shringhataka18(){const S=18,p0=[],cx=8,cy=8;
  p0.push({type:'king',file:cx,rank:cy,role:'centre'});
  // Four arms radiating in cardinal directions
  [{df:0,dr:-1},{df:0,dr:1},{df:-1,dr:0},{df:1,dr:0}].forEach(({df,dr})=>{
    for(let i=1;i<=7;i++){const f=cx+df*i,r=cy+dr*i;
      if(f>=0&&f<S&&r>=0&&r<S&&!p0.some(p=>p.file===f&&p.rank===r)){
        const t=i===1?'rook':i===2?'horse':i===3?'elephant':i===7?'rook':'pawn';
        p0.push({type:t,file:f,rank:r,role:`arm-d${i}`});}}});
  // Diagonal guards protecting centre junction
  [[cx-1,cy-1],[cx+1,cy-1],[cx-1,cy+1],[cx+1,cy+1]].forEach(([f,r])=>{
    if(!p0.some(p=>p.file===f&&p.rank===r))p0.push({type:'elephant',file:f,rank:r,role:'corner-guard'});});
  return bothSides(p0,S);}

/* ══ EXPORT ═════════════════════════════════════════════════════════ */
G.ChaturangaVyuhaData={
  tiers:[
    {size:12,tierName:'Ashtavarga',label:'12×12 · Beginner',description:'First formations. Box, diamond and circle.',armyPerSide:{pawn:12,horse:3,elephant:3,rook:3,king:1},budget2p:45,budget4p:22},
    {size:14,tierName:'Chaturdasha',label:'14×14 · Intermediate',description:'Bird and beast formations. Wing tactics.',armyPerSide:{pawn:14,horse:4,elephant:4,rook:4,king:1},budget2p:57,budget4p:28},
    {size:16,tierName:'Shodasha',label:'16×16 · Advanced',description:'Multi-ring Chakra, needle and star.',armyPerSide:{pawn:16,horse:5,elephant:5,rook:5,king:1},budget2p:71,budget4p:35},
    {size:18,tierName:'Ashtadasha',label:'18×18 · Master',description:'The legendary 7-ring Chakravyuha.',armyPerSide:{pawn:18,horse:6,elephant:6,rook:6,king:1},budget2p:87,budget4p:43},
  ],
  formations:[
    {id:'shakata-12',size:12,name:'Shakata Vyuha',sanskrit:'शकट व्यूह',english:'Box / Cart Formation',shape:'rectangle',difficulty:1,day:11,commander:'Drona',side:'Kauravas',objective:'Defence — compact rectangular mass protects the Raja',description:'The army drawn up in narrow, compact rectangular order. Rear expanding in extended columns like an Indian cart. Rathas form the front wall, Raja buried at rear centre.',historicalNote:'Used by Drona on Day 11 of Kurukshetra. Arjuna countered with Krauncha Vyuha.',counter:'Vajra Vyuha — diamond tip punches through the flat front wall.',getPieces:shakata12},
    {id:'vajra-12',size:12,name:'Vajra Vyuha',sanskrit:'वज्र व्यूह',english:'Diamond / Thunderbolt Formation',shape:'diamond',difficulty:1,day:1,commander:'Bhima / Drishtadhyumna',side:'Pandavas',objective:'Balanced offence and defence — Raja at protected diamond centre',description:'Maharathis at the diamond centre, surrounded by infantry on all sides. The tip is a piercing weapon; the wide rear provides stability.',historicalNote:'Used by Pandavas on Day 1 and Day 7. One of the most commonly used formations.',counter:'Mandala Vyuha — circular galaxy absorbs the diamond point without exposing a flank.',getPieces:vajra12},
    {id:'mandala-12',size:12,name:'Mandala Vyuha',sanskrit:'मण्डल व्यूह',english:'Galaxy / Circle Formation',shape:'circle',difficulty:2,day:7,commander:'Bhishma',side:'Kauravas',objective:'Defensive — very hard to penetrate from any angle',description:'Commander at the centre, surrounded by several groups each led by a Maharathi at equal radial distance. No clear front or rear.',historicalNote:'Used by Bhishma on Day 7. Pandavas countered with Vajra Vyuha.',counter:'Vajra Vyuha — thunderbolt strikes between galaxy sectors.',getPieces:mandala12},
    {id:'garuda-14',size:14,name:'Garuda Vyuha',sanskrit:'गरुड व्यूह',english:'Eagle Formation',shape:'eagle',difficulty:2,day:2,commander:'Bhishma',side:'Kauravas',objective:'Offensive swoop — beak strikes forward while wings encircle',description:'Beak of Rathas at the front. Drona and Kritavarma at the eyes. Wings of cavalry sweep wide. King at the tail. Natural enemy of the Heron.',historicalNote:'Bhishma used it Days 2 and 3. Natural counter to Krauncha (Heron).',counter:'Krauncha Vyuha — heron beak targets the eagle spine.',getPieces:garuda14},
    {id:'krauncha-14',size:14,name:'Krauncha Vyuha',sanskrit:'क्रौञ्च व्यूह',english:'Heron Formation',shape:'heron',difficulty:2,day:2,commander:'Dhristadhyumna',side:'Pandavas',objective:'Offensive — long neck drives forward, wings spread wide to flank',description:'Long narrow neck of Rathas drives forward. Spreading wings of cavalry flank wide. Drupada at the head, Bhima and Dhristadhyumna form both wings.',historicalNote:'Used by Pandavas on Days 2, 11 and 18. Very offensive — intended to induce fear.',counter:'Garuda Vyuha — eagle swoop nullifies the heron posture.',getPieces:krauncha14},
    {id:'makara-14',size:14,name:'Makara Vyuha',sanskrit:'मकर व्यूह',english:'Crocodile Formation',shape:'crocodile',difficulty:2,day:5,commander:'Bhishma',side:'Kauravas',objective:'Crush between jaws then coil the tail to trap the enemy',description:'Wide jaw of Elephants at the front, body narrowing to a powerful tail. The wide mouth engages broadly while the tail coils around.',historicalNote:'Bhishma Day 5, Pandavas Day 6, Karna Day 16. Used repeatedly by both sides.',counter:'Shyen (Hawk) — fast strike before the jaws close.',getPieces:makara14},
    {id:'ardhachandra-14',size:14,name:'Ardha Chandra Vyuha',sanskrit:'अर्धचन्द्र व्यूह',english:'Half Crescent Formation',shape:'crescent',difficulty:3,day:3,commander:'Arjuna',side:'Pandavas',objective:'Pincer — tips close around enemy, Raja safe at rear centre',description:'Powerful generals at both tips of the crescent. Bhima at right, Abhimanyu at left. Tips act as pincers closing inward. Yudhisthira safely at centre.',historicalNote:'Arjuna used it Days 3, 12 and 16. One of the most balanced offensive formations.',counter:'Sringataka (Horned) — two horn tips meet the crescent points head-on.',getPieces:ardhachandra14},
    {id:'chakra3-16',size:16,name:'Chakravyuha (3 rings)',sanskrit:'चक्र व्यूह — त्रिस्तर',english:'3-tier Wheel Formation',shape:'disc-3ring',difficulty:4,day:13,commander:'Drona',side:'Kauravas',objective:'Surround and capture a key target — difficult to escape once inside',description:'Three concentric rings. Outer ring: infantry and elephants. Middle ring: horses and Rathas. Inner ring: elite Rathas guard the commander. Each ring rotates inward.',historicalNote:'Learning formation before the legendary 7-ring Chakra.',counter:'Only warriors who know all 3 entry angles can breach it.',getPieces:chakra3_16},
    {id:'trishula-16',size:16,name:'Trishula Vyuha',sanskrit:'त्रिशूल व्यूह',english:'Trident Formation',shape:'trident',difficulty:3,day:8,commander:'Arjuna',side:'Pandavas',objective:'Triple simultaneous penetration — three prongs pierce independently',description:'Three Ratha-tipped prongs united at a strong rear shaft. Each prong penetrates independently, the shaft links and reinforces all three.',historicalNote:'Arjuna used on Day 8 to counter Bhishma\'s Kurma Vyuha.',counter:'Kurma Vyuha — turtle shell absorbs each trident prong.',getPieces:trishula16},
    {id:'kurma-16',size:16,name:'Kurma Vyuha',sanskrit:'कूर्म व्यूह',english:'Tortoise Formation',shape:'turtle',difficulty:3,day:8,commander:'Bhishma',side:'Kauravas',objective:'Near impenetrable defensive shell — outlast the enemy',description:'Dome-shaped shell. Elephants form the hard outer shell. Horses inside. Rathas at the four limb positions as strike arms. Raja at absolute centre.',historicalNote:'Bhishma used on Day 8. Near impenetrable. Pandavas countered with Trishula.',counter:'Trishula Vyuha — trident prongs find the gaps at the limb positions.',getPieces:kurma16},
    {id:'suchi-16',size:16,name:'Suchimukha Vyuha',sanskrit:'सूचीमुख व्यूह',english:'Needle Formation',shape:'needle',difficulty:4,day:14,commander:'Drona',side:'Kauravas',objective:'Ultra-narrow needle tip of elites pierces any formation at one point',description:'Single point of elite warriors at the tip, widening to a massive base. Karna, Ashwatthama at the needle. Jayadratha at the very end.',historicalNote:'Third tier of Drona\'s triple Chakrashakata Vyuha on Day 14.',counter:'Spread your formation wide — dilute the needle tip before it penetrates.',getPieces:suchi16},
    {id:'sarvatobhadra-16',size:16,name:'Sarvatobhadra Vyuha',sanskrit:'सर्वतोभद्र व्यूह',english:'Safe-from-all-Sides Formation',shape:'star',difficulty:4,day:9,commander:'Bhishma',side:'Kauravas',objective:'Omnidirectional — no exposed flank in any direction',description:'Six Maharathis radiate outward from the commander like a six-pointed star. Every direction guarded. Bhishma at centre, Kripa and Kritavarma at the rays.',historicalNote:'Bhishma Day 9. Pandavas countered with Nakshatra Mandal.',counter:'Nakshatra Mandal — constellation surrounds and isolates each ray.',getPieces:sarvatobhadra16},
    {id:'chakra7-18',size:18,name:'Chakravyuha (7 rings)',sanskrit:'चक्र व्यूह — सप्तस्तर',english:'Full 7-tier Wheel Formation',shape:'disc-7ring',difficulty:5,day:13,commander:'Drona',side:'Kauravas',objective:'Absolute capture — once inside, no escape without knowing all 7 exit angles',description:'The legendary formation. Seven concentric rings of increasingly elite warriors. The formation constantly rotates. By ring 7 the target is surrounded on all sides. Only Arjuna, Krishna, Drona and Pradyumna knew the full entry AND exit sequence.',historicalNote:'Drona used Day 13 to capture Yudhisthira. Abhimanyu alone entered all 7 rings but did not know the exit — he was killed inside. The greatest heroic act of the war.',counter:'There is no counter. Only knowledge of the formation itself allows escape.',getPieces:chakra7_18},
    {id:'padma-18',size:18,name:'Padma Vyuha',sanskrit:'पद्म व्यूह',english:'Blooming Lotus Formation',shape:'lotus',difficulty:5,day:15,commander:'Drona',side:'Kauravas',objective:'Spiralling lotus petals trap the enemy — even harder than Chakra',description:'Like Chakravyuha but the rings spiral organically as a blooming lotus. The petals curve unpredictably making the breach angle impossible to predict.',historicalNote:'Drona used Day 15. Pandavas countered with Vajra Vyuha.',counter:'Requires simultaneous attacks on all petals — nearly impossible.',getPieces:padma18},
    {id:'oormi-18',size:18,name:'Oormi Vyuha',sanskrit:'ऊर्मि व्यूह',english:'Ocean Wave Formation',shape:'waves',difficulty:3,day:8,commander:'Bhishma',side:'Kauravas',objective:'Constant reformation — no position exposed for long as waves roll',description:'Army arranged in three rolling wave fronts on either side like the sea. Rathas ride the first crest. Horses and Elephants in the body. Infantry fills the troughs. Continuously reforming.',historicalNote:'Bhishma changed to this afternoon of Day 8. Arjuna chose Sringataka to counter.',counter:'Sringataka (Horned) — rides over the wave crests at their peaks.',getPieces:oormi18},
    {id:'danda-18',size:18,name:'Sarvatomukhi Danda Vyuha',sanskrit:'सर्वतोमुखी दण्ड व्यूह',english:'All-Facing Rod Formation',shape:'rod',difficulty:3,day:1,commander:'Bhishma',side:'Kauravas',objective:'Sustained assault — circular head faces all directions while the rod supplies continuously',description:'Six Maharathis in a circular head facing all directions. Long rear Danda keeps resourcing the head with fresh troops. The head engages while the rod provides an unbreakable supply line.',historicalNote:'Bhishma used this on the very first day of the Kurukshetra war.',counter:'Cut the Danda — isolate the head from its supply line.',getPieces:danda18},
    // ── 12×12 additions ──────────────────────────────────────────────
    {id:'sringataka-12',size:12,name:'Sringataka Vyuha',sanskrit:'श्रृंगाटक व्यूह',english:'Twin-Horn / Pincer Formation',shape:'twin-horn',difficulty:2,day:3,commander:'Arjuna',side:'Pandavas',objective:'Pincer — both horn tips close inward trapping the enemy centre',description:'Two forward-pointing horns separated by a pawn wall. Each horn is tipped by a Ratha, flanked by Ashwa, and based by Danti. When the enemy charges the centre wall, the horns curl inward from both sides like a bull snaring prey.',historicalNote:'Arjuna used it Days 3 and 12. Natural counter to the Crescent — the horns turn inward where the crescent tips face outward.',counter:'Ardha Chandra — tips of the crescent meet the horn bases before the pincer can close.',getPieces:sringataka12},
    {id:'mala-12',size:12,name:'Mala Vyuha',sanskrit:'माला व्यूह',english:'Garland / Chain Formation',shape:'garland-ring',difficulty:2,day:6,commander:'Bhishma',side:'Kauravas',objective:'Defensive ring — connected chain makes it impossible to isolate any segment',description:'Commander at the absolute centre. Maharathis placed at a regular inner ring. Pawns form the "chain links" connecting them. An outer garland of pieces wraps the entire army. No gap in the chain means no part can be cut off.',historicalNote:'Bhishma employed this on Day 6 to respond after heavy losses. The chain structure meant even under attack the formation held shape.',counter:'Vajra — diamond tip penetrates between ring segments before the chain can reform.',getPieces:mala12},
    // ── 14×14 additions ──────────────────────────────────────────────
    {id:'shyen-14',size:14,name:'Shyen Vyuha',sanskrit:'श्येन व्यूह',english:'Hawk / Falcon Formation',shape:'hawk',difficulty:3,day:4,commander:'Drona',side:'Kauravas',objective:'Fast predatory strike — hooked talons at both wing tips can grab flanks simultaneously',description:'More compact and aggressive than Garuda. The beak is a single elite Ratha. Wings sweep at a steeper angle. Hooked talons at the wing tips grab the enemy flanks while the beak drives down the centre. The hawk dives — it does not circle.',historicalNote:'Drona used on Day 4 as a faster variant of Garuda. Better suited for attacking than Garuda — less vulnerable to flank attacks due to steeper wing angle.',counter:'Garuda — eagle spreads wider to catch the diving hawk\'s flanks in its own wingspan.',getPieces:shyen14},
    {id:'gomutrika-14',size:14,name:'Gomutrika Vyuha',sanskrit:'गोमूत्रिका व्यूह',english:'Zigzag / Cow-Path Formation',shape:'zigzag',difficulty:3,day:7,commander:'Dhristadhyumna',side:'Pandavas',objective:'Multi-angle diagonal attack — the zigzag allows attack from two diagonal axes simultaneously',description:'Named after the winding path a cow traces while urinating. Troops are arranged in two interleaved V-bands. The front-V and mid-V cover different diagonal attack angles — each band reinforces the other. The formation is non-obvious to counter because there is no single clear front.',historicalNote:'Pandavas used it on Day 7 in the afternoon session. Bhishma struggled to identify which diagonal was the primary threat.',counter:'Mandala — circular formation has no "front" to face the zigzag and absorbs both diagonals equally.',getPieces:gomutrika14},
    // ── 16×16 additions ──────────────────────────────────────────────
    {id:'nakshatra-16',size:16,name:'Nakshatra Mandala',sanskrit:'नक्षत्र मण्डल व्यूह',english:'Constellation Wheel Formation',shape:'constellation',difficulty:4,day:9,commander:'Arjuna',side:'Pandavas',objective:'Counter-Sarvatobhadra — surround and isolate each ray of the star',description:'Eight star-cluster nodes arranged in a wheel pattern, each node a small independent force. Unlike Mandala\'s smooth ring, Nakshatra has concentrated nodes with gaps — making it hard to follow as a continuous front. Elephant linkers connect each node to the centre; Horse bridges link adjacent stars.',historicalNote:'Pandavas\' answer to Bhishma\'s Sarvatobhadra on Day 9. The eight clusters match the six Sarvatobhadra rays and overwhelm them.',counter:'Sarvatobhadra — fire through the gaps between constellation nodes before they can link up.',getPieces:nakshatra16},
    {id:'vyaghra-16',size:16,name:'Vyaghra Vyuha',sanskrit:'व्याघ्र व्यूह',english:'Tiger Formation',shape:'tiger',difficulty:4,day:11,commander:'Drona',side:'Kauravas',objective:'Powerful frontal crush — massive head + wide body absorbs punishment while fangs tear through',description:'Wide powerful jaw of Rathas at the front. Elephant flanks for the jaw. Horse snout at centre for agility. The body is deliberately wide — each flank extends outward as the ranks deepen, creating a muscular mass. Powerful haunch Rathas drive from the rear. The tiger does not dodge — it overwhelms.',historicalNote:'Drona used on Day 11 to counter Pandava aggression. The wide jaw was specifically designed to counter Arjuna\'s Trishula trident by absorbing all three prongs in its jaw.',counter:'Trishula — three prong tips target the jaw joints where the Rathas sit, forcing the jaw apart.',getPieces:vyaghra16},
    // ── 18×18 additions ──────────────────────────────────────────────
    {id:'deva-18',size:18,name:'Deva Vyuha',sanskrit:'देव व्यूह',english:'Divine Formation',shape:'light-rays',difficulty:3,day:10,commander:'Arjuna',side:'Pandavas',objective:'Six fast targeted strike columns isolate and destroy sections of the Asura wall',description:'Six light-ray columns rise from a unified bridge base, each a fast independent strike force topped by a Ratha. Where Asura uses a single impenetrable wall, Deva uses six piercing needles with empty lanes between them — allowing rapid manoeuvre, reforms, and targeted section attacks. The bridge anchors all six rays.',historicalNote:'Arjuna\'s answer to the Kauravas\' Asura Vyuha on Day 10. The strategy worked — targeted isolated Bhishma in one section, leading to his eventual fall.',counter:'Asura Vyuha — heavy wall fills the empty lanes, eliminating the mobility advantage of the rays.',getPieces:deva18},
    {id:'chakrashakata-18',size:18,name:'Chakrashakata Vyuha',sanskrit:'चक्रशकट व्यूह',english:'Wheel-Cart Combination',shape:'triple-combo',difficulty:5,day:14,commander:'Drona',side:'Kauravas',objective:'Triple simultaneous threat — needle pierces, wheels grind the flanks, Shakata box supplies and protects',description:'Drona\'s most brilliant tactical invention. Three formations operating simultaneously: the Suchimukha needle drives through the centre, two mini Chakra wheels on the flanks grind inward, and the Shakata box at the rear protects the Raja while continuously resupplying the forward needle. Countering any one sub-formation exposes you to the other two.',historicalNote:'Drona\'s signature formation on Day 14 designed specifically to capture Yudhisthira. Arjuna alone could have countered it — which is why Drona arranged for Arjuna to be lured away to the southern front simultaneously.',counter:'Requires three simultaneous counter-formations — practically impossible. Only Arjuna + Krishna could have done it.',getPieces:chakrashakata18},
    {id:'shringhataka-18',size:18,name:'Shringhataka Vyuha',sanskrit:'श्रृंगाटक व्यूह',english:'Four-Road / Crossroads Formation',shape:'crossroads',difficulty:4,day:5,commander:'Bhishma',side:'Kauravas',objective:'Omnidirectional — four equal arms face all four cardinal directions simultaneously',description:'The army forms a perfect plus-sign. Four equal arms radiate from a fortified centre in all four cardinal directions. Each arm has a Ratha tip, Horse and Elephant midway, Pawn shaft, and another Ratha at the outer end. Diagonal corners are guarded by Elephants. Every direction can engage independently.',historicalNote:'Bhishma used on Day 5 to counter a Pandava flanking manoeuvre. The crossroads shape meant no flank attack could go uncontested.',counter:'Garuda — the wide eagle wingspan stretches between two adjacent crossroads arms and pinches them together.',getPieces:shringhataka18},
    {id:'asura-18',size:18,name:'Asura Vyuha',sanskrit:'असुर व्यूह',english:'Demon Formation',shape:'wall',difficulty:2,day:10,commander:'Bhishma',side:'Kauravas',objective:'Overwhelming brute force — heaviest wall forward, pure power',description:'Massive formation with all heaviest pieces forward in an unbroken wall several ranks deep. No elegance — pure power. Elephants and Rathas form an impenetrable front.',historicalNote:'Kauravas Day 10. Pandavas countered with Deva Vyuha and targeted Bhishma. They succeeded.',counter:'Deva Vyuha — divine targeted strike forces isolate sections of the wall.',getPieces:asura18},
  ],
  getForSize(s){return this.formations.filter(f=>f.size===s);},
  getTier(s){return this.tiers.find(t=>t.size===s);},
};
})(typeof globalThis!=='undefined'?globalThis:window);
