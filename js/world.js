'use strict';
// ===================== World state, physics and effects =====================
let players = [], me = null;            // every fighter on screen; `me` is the one this browser controls
let enemies = [], projs = [], parts = [], texts = [], items = [];
let platforms = [], stage = null, worldW = 4000;
let cam = { x:0 }, locked = false, lockL = 0, lockR = 4000;
let frame = 0, hitstop = 0, shake = 0, flashScreen = 0, banner = null, cutin = null;
let combo = 0, comboTimer = 0, maxCombo = 0, score = 0;
let nextId = 1, pidSeq = 0;
let platClock = 0; // drives moving platforms; the co-op guest follows the host's value
let hazards = [];  // stage traps (bonfires, booby-trapped presents…), copied from the stage on load
let pits = [];     // holes in the ground ({x,w}); falling in costs some life (see mechanics.js)

const bounds = () => locked ? [lockL, lockR] : [0, worldW];

function resetWorld(){
  enemies=[]; projs=[]; parts=[]; texts=[]; items=[];
  frame=0; platClock=0; hitstop=0; shake=0; flashScreen=0; banner=null; cutin=null;
  combo=0; comboTimer=0; maxCombo=0; score=0;
  locked=false; lockL=0; lockR=worldW; cam.x=0;
}

function physics(e, ignorePlat){
  const prevY = e.y;
  e.vy = Math.min(e.vy + G, 15);
  e.x += e.vx; e.y += e.vy;
  e.onGround = false; e.plat = null;
  // the ground holds everyone except over a pit (bosses never fall: e.noPits)
  if (e.y >= GROUND && prevY <= GROUND+0.01 && (e.noPits || !pits.length || !inPit(e.x))){ e.y = GROUND; e.vy = 0; e.onGround = true; return; }
  if (e.vy >= 0 && !ignorePlat && !(e.dropThrough > 0)){
    for (const p of platforms){
      if (p.gone) continue;
      if (e.x > p.x-4 && e.x < p.x+p.w+4 && prevY <= p.y+0.01 && e.y >= p.y){
        e.y=p.y; e.vy=0; e.onGround=true; e.plat=p;
        if (p.crumble && !p.shakeT) p.shakeT=1;
        if (p.bounce){ e.vy=-p.bounce; e.onGround=false; e.plat=null; e.jumps=1; if (e.local && e.inp) SFX.jump(); }
        break;
      }
    }
  }
}
// Moving platforms (parade floats, lifts) slide back and forth (move.axis 'x' or 'y') and carry whoever stands on them.
// Crumbling ones (`crumble`) shake when stepped on, fall and come back a few seconds later.
const CRUMBLE_SHAKE = 40, CRUMBLE_BACK = 240;
function updatePlatforms(){
  platClock++;
  let moved=false;
  for (const p of platforms){
    if (p.crumble && p.shakeT){
      p.shakeT++;
      if (p.shakeT===CRUMBLE_SHAKE){ p.gone=true; for (let k=0;k<p.w;k+=16) parts.push({x:p.x+k,y:p.y,vx:rand(-1,1),vy:rand(0,2),life:30,max:30,color:'#8a6a48',size:rand(3,6),grav:0.3}); }
      if (p.shakeT>=CRUMBLE_SHAKE+CRUMBLE_BACK){ p.gone=false; p.shakeT=0; }
    }
    p.dx=0; p.dy=0;
    if (p.vx){ p.x+=p.vx; p.dx=p.vx; moved=true; continue; } // driving across once (e.g. a parade float in a boss fight)
    if (!p.move) continue;
    const off=Math.sin(platClock*p.move.speed+(p.move.phase||0))*p.move.range;
    if (p.move.axis==='y'){ const ny=p.y0+off; p.dy=ny-p.y; p.y=ny; }
    else { const nx=p.x0+off; p.dx=nx-p.x; p.x=nx; }
    moved=true;
  }
  if (!moved) return;
  platforms=platforms.filter(p=>!p.vx || (p.x<p.endR && p.x+p.w>p.endL));
  const riders=[...players.filter(p=>p.local), ...enemies.filter(e=>!e.puppet), ...items];
  for (const e of riders) if (e.plat && e.onGround){ e.x+=e.plat.dx; e.y+=e.plat.dy; }
}
function surfaceBelow(x,y){ let s=GROUND; for (const p of platforms) if (!p.gone && x>p.x && x<p.x+p.w && p.y>=y-1 && p.y<s) s=p.y; return s; }

// ----- effects -----
function addShake(v){ if (Settings.shake) shake=Math.max(shake,v); }
function burst(x,y,color,n=10,spd=5,grav=0.15){
  for (let i=0;i<n;i++){ const a=Math.random()*Math.PI*2, s=rand(1,spd);
    parts.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s-1,life:rand(16,30)|0,max:30,color,size:rand(2,5),grav}); }
}
function dust(x,y,n=6){ for (let i=0;i<n;i++) parts.push({x:x+rand(-10,10),y,vx:rand(-2,2),vy:rand(-2,-0.3),life:22,max:22,color:'#d8c3a0',size:rand(3,6),grav:0.02}); }
function ring(x,y,color,vr=10,life=24,lw=8,r=10){ parts.push({ring:true,x,y,r,vr,life,max:life,color,lw}); }
function addText(x,y,s,color,big){ texts.push({x:x+rand(-8,8),y,s:String(s),color,big,life:50,vy:-2.2}); }
function bigText(x,y,s,color){ texts.push({x,y,s,color,big:true,life:70,vy:-0.6}); }
function updateFx(){
  for (const q of parts){ q.x+=q.vx||0; q.y+=q.vy||0; if (q.grav) q.vy+=q.grav; if (q.ring) q.r+=q.vr; q.life--; }
  parts=parts.filter(q=>q.life>0);
  for (const t of texts){ t.y+=t.vy; t.vy*=0.93; t.life--; }
  texts=texts.filter(t=>t.life>0);
  shake*=0.86; if (shake<0.4) shake=0;
  flashScreen=Math.max(0,flashScreen-0.04);
  if (banner && --banner.t<=0) banner=null;
  if (cutin && --cutin.t<=0) cutin=null;
}

// ----- helpers over fighters -----
const isAlive = p => p && p.hp>0 && p.state!=='dead';
function alivePlayers(){ return players.filter(isAlive); }
function nearestPlayer(x,y){
  let best=null, bd=1e9;
  for (const p of alivePlayers()){ const d=Math.abs(p.x-x)+Math.abs(p.y-y)*0.5; if (d<bd){ bd=d; best=p; } }
  return best;
}
function boxHits(b,e){ return b.x2>e.x-e.w/2 && b.x1<e.x+e.w/2 && b.y2>e.y-e.h && b.y1<e.y; }
