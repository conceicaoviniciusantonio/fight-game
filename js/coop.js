'use strict';
// ===================== Co-op: the story mode for two browsers =====================
// The host owns the world (zones, enemies, items, boss) and streams it ~20x per second.
// The guest draws that world, simulates only its own hero, and reports its hits on enemies ('ehit').
// Damage to heroes still goes to the hero's own browser (see hurtPlayer).
const coop = { partnerHero:'archer', waiting:false };
const isGuest = () => Net.mode==='coop' && !Net.host;
const NO_INPUT = { held:{}, pressed:{} };
const REVIVE_TIME = 600; // frames a fallen hero waits before getting back up (if the partner is alive)

function coopHello(m){
  coop.partnerHero=m.hero;
  if (Net.host){ closeLobby(); openMap(); }
  else lobbyStatus('Conectado! O anfitrião está escolhendo a fase…');
}
function coopStart(stageId){
  const m={type:'coopStart',stage:stageId||currentStageId(),hostHero:selHero,guestHero:coop.partnerHero};
  netSend(m); onCoopStart(m);
}
function onCoopStart(m){
  closeLobby(); coop.waiting=false;
  startStory(m.stage);
  const host=Net.host, mine=host?m.hostHero:m.guestHero, other=host?m.guestHero:m.hostHero;
  me=makePlayer(mine,{id:host?'host':'guest',x:host?160:110});
  const partner=makePlayer(other,{id:host?'guest':'host',local:false,x:host?110:160});
  partner.tx=partner.x; partner.ty=partner.y;
  players=[me,partner];
}

// ----- host → guest world stream -----
function sendWorld(){
  netSend({type:'w',
    en:enemies.map(e=>[e.id,e.type,Math.round(e.x),Math.round(e.y),e.face,e.state,e.t,Math.round(e.hp),e.maxHp,e.anim|0,Math.round(e.vx*10)/10,e.flash]),
    it:items.map(i=>[i.id,i.type,Math.round(i.x),Math.round(i.y),i.t]),
    z:[locked?1:0,lockL,lockR,zi,goTimer], sc:score, b:boss?boss.id:null, pc:platClock});
}
function applyWorld(m){
  const seen=new Set();
  for (const a of m.en){
    const [id,type,x,y,face,state,t,hp,maxHp,anim,vx,flash]=a;
    seen.add(id);
    let e=enemies.find(o=>o.id===id);
    if (!e){ e=spawnEnemy(type,x,y,id); e.puppet=true; e.x=x; e.y=y; }
    Object.assign(e,{tx:x,ty:y,face,state,t,hp,maxHp,anim,vx});
    if (flash>e.flash) e.flash=flash;
  }
  enemies=enemies.filter(e=>seen.has(e.id));
  items=m.it.map(([id,type,x,y,t])=>({id,type,x,y,t,onGround:true}));
  if (m.z[4]>goTimer+30) SFX.go();
  locked=!!m.z[0]; lockL=m.z[1]; lockR=m.z[2]; zi=m.z[3]; goTimer=m.z[4];
  score=m.sc;
  if (Math.abs(m.pc-platClock)>3) platClock=m.pc; // keep moving platforms in step with the host
  if (m.b){
    const b=enemies.find(e=>e.id===m.b);
    if (b && boss!==b){
      b.dispHp=b.hp; boss=b;
      banner={txt:ENEMY_TYPES[b.type].name,sub:'— CHEFE —',t:170,max:170,boss:true}; SFX.roar(); playMusic(stage.bossMusic);
    }
  }
}
function updateEnemyPuppet(e){
  e.anim++; if (e.flash>0) e.flash--;
  e.x+=(e.tx-e.x)*0.4; e.y+=(e.ty-e.y)*0.4;
  e.onGround=Math.abs(e.y-surfaceBelow(e.x,e.y-2))<3;
}

// ----- messages -----
NET_HANDLERS.coopStart = m => onCoopStart(m);
NET_HANDLERS.w = m => { if (isGuest() && mode==='play') applyWorld(m); };
NET_HANDLERS.ehit = m => {
  const e=enemies.find(o=>o.id===m.id);
  if (e && Net.host){ damageEnemy(e,m.dmg,m.dir,m.kb,m.up,m.crit,null); score+=m.dmg; }
};
NET_HANDLERS.pickup = m => { if (me && m.id===me.id) applyPickup(me,m.it,m.val); };
NET_HANDLERS.xp = m => { if (Net.mode==='coop' && mode==='play') gainXp(me,m.xp); };
NET_HANDLERS.win = () => { if (isGuest()) celebrateBoss(boss); };
NET_HANDLERS.lose = () => { if (isGuest()){ mode='over'; endTimer=0; playMusic('gameover'); } };
function coopDisconnect(){
  if (Net.host && mode==='play'){
    // the guest left: keep playing alone
    players=[me]; Net.mode=null;
    banner={txt:'Seu parceiro saiu',sub:'Continue sozinho',t:150,max:150};
    return;
  }
  Net.mode=null; mode='netLost'; endTimer=0; playMusic(null);
}

// ----- revive -----
function tryRevive(p){
  const partner=players.find(o=>o!==p);
  if (Net.mode!=='coop' || !isAlive(partner) || winTimer) return;
  p.reviveT=(p.reviveT||0)+1;
  if (p.reviveT>=REVIVE_TIME){
    p.reviveT=0; p.hp=Math.round(p.maxHp*0.4); p.state='free'; p.t=0; p.inv=120; p.vx=0;
    bigText(p.x,p.y-p.h-14,'DE VOLTA!','#7dff8a'); ring(p.x,p.y-40,'#7dff8a',6,20,5,10); SFX.pickup();
  }
}

function drawPartnerPanel(p,x,y){
  panel(x,y,230,48,12);
  portrait(p,x+24,y+24,18);
  txt(HEROES[p.hero].name+' Nv '+(p.lvl||1)+' (parceiro)',x+48,y+11,11,'#9fe3a8','left');
  bar(x+48,y+20,170,10,Math.max(0,p.hp)/p.maxHp,'#ff6b7a','#b3122a');
  mpBars(x+48,y+36,52,6,p.mp,7);
  if (!isAlive(p)) txt('CAÍDO',x+133,y+25,12,'#ff8a8a');
}
