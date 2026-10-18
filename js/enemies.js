'use strict';
// ===================== Enemies =====================
// `ai` picks the behaviour; `look` is how drawMonster paints it.
const ENEMY_TYPES = {
  goblin:{hp:70,  w:30, h:54,  speed:1.8,  dmg:22, ai:'melee', reach:44, windup:24, score:100,
    look:{s:1,   skin:'#6cbf3f',body:'#4f8f2f',cloth:'#7a5230',eye:'#ffdd33',weapon:'dagger'}},
  archer:{hp:55,  w:28, h:56,  speed:1.5,  dmg:18, ai:'archer', score:120,
    look:{s:1,   skin:'#8bc34a',body:'#4a2f6e',cloth:'#5b3c88',eye:'#ff5544',weapon:'bow',hood:'#5b3c88'}},
  orc:   {hp:170, w:44, h:78,  speed:1.25, dmg:40, ai:'melee', reach:62, windup:34, score:250,
    look:{s:1.45,skin:'#4e8a3e',body:'#5d4037',cloth:'#3e2723',eye:'#ff3b30',weapon:'club',tusk:true}},
  // `tune` sets each boss's place on the difficulty ladder: windup/recovery length (higher = slower and
  // easier to read), pause between attacks, when it gets enraged, charge speed and how many summons
  gorgo: {hp:1300,w:84, h:130, speed:1.5,  dmg:40, ai:'boss', boss:true, score:3000, name:'Gorgo, o Rei Orc',
    moves:['slam','charge','leap'], summon:['goblin','goblin','archer'],
    tune:{wind:1.35, rec:1.35, cd:[85,140], enrage:0.35, rage:1.15, charge:8.5, summons:1},
    look:{s:2.4, skin:'#6b8f62',body:'#4a4a58',cloth:'#7b1f1f',eye:'#ff2a2a',weapon:'axe',tusk:true,helmet:true}},

  // ----- Caverna de Cristal -----
  bat:   {hp:45,  w:34, h:30,  speed:2.2,  dmg:18, ai:'flyer', fly:true, score:110, look:{kind:'bat', body:'#4a3b6b', wing:'#6d5a9c', eye:'#ff4fd8'}},
  kobold:{hp:85,  w:30, h:54,  speed:1.9,  dmg:24, ai:'melee', reach:46, windup:22, score:110,
    look:{s:1.05,skin:'#7c8fb0',body:'#4b5a78',cloth:'#2f3a52',eye:'#9ff8ff',weapon:'pick'}},
  shaman:{hp:70,  w:28, h:56,  speed:1.4,  dmg:20, ai:'archer', shot:'eorb', score:140,
    look:{s:1,   skin:'#8aa0c8',body:'#2e4a7a',cloth:'#1d2f52',eye:'#7ff0ff',weapon:'staff',hood:'#21436e',orb:'#7ff0ff'}},
  golem: {hp:2000,w:96, h:140, speed:1.3,  dmg:52, ai:'boss', boss:true, score:3500, name:'Golem de Cristal',
    moves:['slam','leap','rocks','spikes'], summon:['kobold','kobold','shaman'],
    tune:{wind:1.15, rec:1.15, cd:[65,115], enrage:0.45, rage:1.25, charge:9.5, summons:2},
    look:{s:2.6, skin:'#8a8f9c',body:'#6b7080',cloth:'#4d5260',eye:'#7ff0ff',weapon:'fist',crystal:'#7ff0ff'}},

  // ----- Deserto Escaldante -----
  scorpion:{hp:80, w:48, h:34,  speed:2.3,  dmg:24, ai:'melee', reach:50, windup:20, score:120, look:{kind:'scorpion', s:1, body:'#c58b3c', dark:'#8a5a22', eye:'#2a1a0a'}},
  mummy: {hp:190, w:34, h:58,  speed:0.95, dmg:36, ai:'melee', reach:46, windup:30, score:220,
    look:{s:1.1, skin:'#d9cfb0',body:'#cfc4a2',cloth:'#a89b78',eye:'#66ff66',weapon:'fist',wrap:true}},
  nomad: {hp:65,  w:28, h:56,  speed:1.6,  dmg:20, ai:'archer', score:130,
    look:{s:1,   skin:'#c8956b',body:'#b5803e',cloth:'#7a4f22',eye:'#2a1a0a',weapon:'bow',hood:'#d9b26a'}},
  scorpking:{hp:3500,w:120,h:90, speed:1.9,  dmg:62, ai:'boss', boss:true, score:4000, name:'Rei Escorpião',
    moves:['charge','leap','spit','slam'], summon:['scorpion','scorpion','nomad'],
    tune:{wind:1.0, rec:1.0, cd:[50,95], enrage:0.5, rage:1.3, charge:10.5, summons:2},
    look:{kind:'scorpion', s:3.2, body:'#b8862f', dark:'#6e4a14', eye:'#ff3030', crown:true}},

  // ----- Castelo Sombrio -----
  skeleton:{hp:80, w:30, h:58,  speed:1.9,  dmg:26, ai:'melee', reach:52, windup:22, score:130,
    look:{s:1.05,skin:'#e8e4d8',body:'#cfc9b8',cloth:'#3a3440',eye:'#ff4040',weapon:'sword',skull:true}},
  darkmage:{hp:75, w:28, h:58,  speed:1.4,  dmg:24, ai:'archer', shot:'eorb', score:160,
    look:{s:1,   skin:'#b9a8c9',body:'#2a1d3d',cloth:'#160f22',eye:'#ff5cf0',weapon:'staff',hood:'#2a1d3d',orb:'#ff5cf0'}},
  blackknight:{hp:240,w:46,h:82, speed:1.15, dmg:44, ai:'melee', reach:66, windup:32, score:300,
    look:{s:1.5, skin:'#3a3f4d',body:'#2b2f3a',cloth:'#5b0f1f',eye:'#ff3030',weapon:'sword',helmet:true,closed:true}},
  darklord:{hp:4700,w:80, h:132, speed:2.0, dmg:60, ai:'boss', boss:true, score:5000, name:'Lorde Sombrio',
    moves:['charge','wave','teleport','slam'], summon:['skeleton','skeleton','darkmage'],
    tune:{wind:0.85, rec:0.85, cd:[38,75], enrage:0.55, rage:1.4, charge:12, summons:2},
    look:{s:2.3, skin:'#4a3f5c',body:'#1f1a2b',cloth:'#6a0f2a',eye:'#ff2a6a',weapon:'greatsword',helmet:true,closed:true,cape:'#4a0f22'}},

  // ===== Terra Brasilis =====
  // ----- Carnaval -----
  foliao:{hp:95, w:30, h:56, speed:2.1, dmg:26, ai:'melee', reach:46, windup:20, score:140,
    look:{s:1.05,skin:'#d9a066',body:'#e84a8a',cloth:'#3ec1d3',eye:'#1b1b2e',weapon:'tambourine',mask:'#ffd23f',plume:['#ff4fd8','#3ec1d3','#ffd23f']}},
  pierrot:{hp:80, w:28, h:58, speed:1.5, dmg:24, ai:'archer', shot:'lob', bombStyle:'confetti', score:160,
    look:{s:1, skin:'#f5f0f0',body:'#f5f5f5',cloth:'#1b1b2e',eye:'#1b1b2e',weapon:'none',clown:true}},
  bonecao:{hp:260, w:44, h:84, speed:1.1, dmg:42, ai:'melee', reach:62, windup:30, score:320,
    look:{kind:'puppet', s:1.1, skin:'#f2c49b', body:'#ff9f1c', cloth:'#2ec4b6', hair:'#3a2a1a'}},
  // ----- Páscoa -----
  coelho:{hp:90, w:30, h:44, speed:2.6, dmg:26, ai:'hopper', score:150, look:{kind:'bunny', s:1, fur:'#f1f1f1', inner:'#ffb3c6', eye:'#1b1b2e'}},
  ovo:{hp:120, w:34, h:42, speed:1.2, dmg:32, ai:'roller', score:170, look:{kind:'egg', s:1, shell:'#ffe5ec', band:'#7bd389', band2:'#bde0fe'}},
  galinha:{hp:85, w:30, h:44, speed:1.6, dmg:26, ai:'archer', shot:'lob', bombStyle:'egg', score:160, look:{kind:'chicken', s:1, body:'#ffffff', comb:'#e63946'}},
  coelhoRei:{hp:7200, w:96, h:120, speed:2.0, dmg:192, ai:'boss', boss:true, score:6500, name:'Coelho Colossal',
    moves:['hop','bombs','charge','rain'], summon:['coelho','coelho','galinha'], bombStyle:'egg',
    tune:{wind:0.92, rec:0.92, cd:[38,76], enrage:0.5, rage:1.32, charge:11, summons:2},
    look:{kind:'bunny', s:2.7, fur:'#7b4a2e', inner:'#ffb3c6', eye:'#ff2a2a', bow:'#ffd23f'}},
  // ----- Festa Junina -----
  espantalho:{hp:200, w:34, h:62, speed:1.3, dmg:40, ai:'melee', reach:60, windup:26, score:260,
    look:{s:1.15,skin:'#d9b77a',body:'#b5452f',cloth:'#5b7bb5',eye:'#1b1b2e',weapon:'fork',straw:true,burlap:true}},
  fogueteiro:{hp:110, w:30, h:60, speed:1.5, dmg:30, ai:'archer', shot:'lob', bombStyle:'fire', score:200,
    look:{s:1.05,skin:'#d9b77a',body:'#3a7d44',cloth:'#c9a227',eye:'#1b1b2e',weapon:'none',straw:true,burlap:true}},
  buscape:{hp:60, w:24, h:34, speed:3.2, dmg:46, ai:'kamikaze', score:150, look:{kind:'rocket', s:1, body:'#e63946', band:'#ffd23f'}},
  boitata:{hp:6900, w:120, h:110, speed:2.1, dmg:120, ai:'boss', boss:true, score:7000, name:'Boitatá',
    moves:['wave','burrow','bombs','charge'], summon:['buscape','buscape','fogueteiro'], bombStyle:'fire', waveStyle:'fire', burrowWave:'fire',
    tune:{wind:0.9, rec:0.9, cd:[36,72], enrage:0.5, rage:1.35, charge:11.5, summons:2},
    look:{kind:'serpent', s:1, body:'#ff5a1f', glow:'#ffd36b', eye:'#ffffff', noOutline:true}},
  // ----- Noite do Saci -----
  saci:{hp:120, w:28, h:52, speed:2.6, dmg:34, ai:'trickster', score:240, look:{kind:'saci', s:1.05, skin:'#6b4423', cap:'#d62828', shorts:'#d62828'}},
  fogofatuo:{hp:70, w:30, h:30, speed:2.4, dmg:30, ai:'flyer', fly:true, score:180, look:{kind:'wisp', light:'120,190,255'}},
  lobisomem:{hp:300, w:44, h:80, speed:1.6, dmg:54, ai:'melee', reach:58, windup:24, score:360,
    look:{s:1.4, skin:'#5a5560', body:'#3d3a44', cloth:'#5a3a2a', eye:'#ffd23f', weapon:'claw', wolf:true}},
  mula:{hp:9600, w:130, h:100, speed:2.2, dmg:140, ai:'boss', boss:true, score:7500, name:'Mula-sem-cabeça',
    moves:['charge','leap','wave','slam'], summon:['saci','fogofatuo','lobisomem'], bombStyle:'fire', waveStyle:'fire',
    tune:{wind:0.88, rec:0.88, cd:[34,70], enrage:0.5, rage:1.38, charge:12.5, summons:2},
    look:{kind:'mule', s:1, body:'#9a7556', mane:'#3a2a1e', light:'255,120,40', noOutline:true}},
  // ----- Natal -----
  duende:{hp:110, w:26, h:46, speed:2.8, dmg:34, ai:'melee', reach:42, windup:16, score:200,
    look:{s:0.85,skin:'#f2c49b',body:'#2a9d8f',cloth:'#e63946',eye:'#1b1b2e',weapon:'cane',elf:true}},
  soldadinho:{hp:130, w:28, h:64, speed:1.4, dmg:32, ai:'archer', shot:'cork', score:230,
    look:{s:1.1,skin:'#f2c49b',body:'#c1121f',cloth:'#1d3557',eye:'#1b1b2e',weapon:'musket',shako:true}},
  rena:{hp:220, w:50, h:62, speed:1.6, dmg:52, ai:'roller', score:300, look:{kind:'reindeer', s:1, fur:'#8a5a3a', belly:'#d9b48a', nose:'#e63946'}},
  ladrao:{hp:12500, w:80, h:140, speed:2.3, dmg:205, ai:'boss', boss:true, score:9000, name:'Ladrão de Presentes',
    moves:['bombs','teleport','rain','charge'], summon:['duende','duende','soldadinho'], bombStyle:'gift',
    tune:{wind:0.82, rec:0.82, cd:[30,62], enrage:0.55, rage:1.42, charge:13, summons:2},
    look:{s:2.3, skin:'#e0b48a', body:'#2b2d42', cloth:'#c1121f', eye:'#ffd23f', weapon:'cane', mask:'#111111', beanie:'#c1121f', sack:'#8a6a4a'}},
  bonecaoRei:{hp:6300, w:100, h:175, speed:1.7, dmg:124, ai:'boss', boss:true, score:6000, name:'Bonecão Desgovernado',
    moves:['spin','rain','slam','leap'], summon:['foliao','foliao','pierrot'], bombStyle:'confetti',
    tune:{wind:0.95, rec:0.95, cd:[40,80], enrage:0.5, rage:1.3, charge:10, summons:2},
    look:{kind:'puppet', s:2.3, skin:'#f7c59f', body:'#7b2cbf', cloth:'#ffd23f', hair:'#1b1b2e', crown:true}},
};
const EXTRA_DRAW = {}; // drawings for foes added by other files (bosses.js), by look.kind
const WIND = ['windup','slamWind','leapWind','chargeWind','rocksWind','spikesWind','spitWind','waveWind','teleportWind','slashWind',
  'spinWind','rainWind','bombsWind','hopWind','burrowWind'];
const NEAR_MOVES = ['slam','spikes','teleport','leap','spin','rain','hop','burrow'], FAR_MOVES = ['charge','leap','rocks','spit','wave','teleport','spikes','spin','rain','bombs','hop','burrow'];
let boss = null;

function spawnEnemy(type,x,y=-40-rand(0,120),id){
  const T=ENEMY_TYPES[type];
  // never drop a new enemy into a pit
  for (const p of pits) if (x>p.x-30 && x<p.x+p.w+30) x = x-p.x < p.x+p.w-x ? p.x-40 : p.x+p.w+40;
  const e={isEnemy:true,type,x,y,vx:0,vy:0,w:T.w,h:T.h,hp:T.hp,maxHp:T.hp,speed:T.speed*rand(0.85,1.15),dmg:T.dmg,
    face:-1,state:'walk',t:0,cd:rand(50,110),flash:0,id:id||('e'+nextId++),anim:rand(0,100),onGround:false,dead:false};
  // regular enemies get tougher stage by stage (bosses are tuned one by one above)
  const D=(!T.boss && stage && stage.diff) || {hp:1,dmg:1};
  if (!id){ e.hp=e.maxHp=Math.round(T.hp*D.hp); e.dmg=Math.round(T.dmg*D.dmg); }
  if (players.length>1 && !id){ e.hp=e.maxHp=Math.round(e.hp*(T.boss?1.6:1.5)); } // tougher in co-op
  if (T.boss){ e.cd=120; e.dispHp=e.hp; e.noPits=true; boss=e; }
  enemies.push(e);
  return e;
}

// Authoritative damage (single player or co-op host)
function damageEnemy(e,dmg,dir,kb,up,crit,src){
  if (e.hp<=0) return;
  if (shieldBlocks(e,dir)) return;
  e.hp-=dmg; e.flash=6; spark(e.x-dir*e.w*0.3,e.y-e.h*0.55,crit?'#ffe066':'#fff7d6');
  addText(e.x,e.y-e.h-8,crit?dmg+'!':dmg,crit?'#ffd23f':'#ffffff',crit);
  burst(e.x-dir*e.w*0.2,e.y-e.h*0.55,crit?'#ffd23f':'#fff3c4',crit?14:8,6);
  SFX.hit(crit);
  if (ENEMY_TYPES[e.type].boss){
    if (e.state==='walk'||e.state==='recover') e.vx=dir*1.2;
  } else if (ENEMY_TYPES[e.type].anchored){ // crystals, totems…: never pushed around
  } else {
    e.state='hurt'; e.t=up?28:16; e.vx=dir*kb;
    if (up) e.vy=up; else if (!e.onGround) e.vy=Math.min(e.vy,-3);
  }
  if (e.hp<=0) killEnemy(e,dir);
}
function killEnemy(e,dir){
  const T=ENEMY_TYPES[e.type];
  if (trickOnKill(e,dir)) return;
  e.hp=0; e.state='dying'; e.t=0; e.vy=-6; e.vx=dir*4;
  score+=T.score;
  burst(e.x,e.y-e.h/2,'#ffffff',16,7);
  // rewards: everyone in the party gets the XP; gold drops as coins anyone can grab
  const xp=Math.round(T.score/5);
  if (Net.mode==='coop') netSend({type:'xp',xp});
  gainXp(me,xp);
  if (T.boss){
    for (let k=0;k<8;k++) dropItem(e.x+rand(-30,30),e.y-40,'gold',-rand(5,10),Math.round(T.score/40),rand(-5,5));
    onBossDefeated(e);
  } else {
    SFX.die();
    if (Math.random()<0.03) dropItem(e.x,e.y-20,'life');
    else if (Math.random()<0.22) dropItem(e.x,e.y-20,Math.random()<0.6?'hp':'mp');
    else if (Math.random()<0.55) dropItem(e.x,e.y-20,'gold',-6,Math.max(5,Math.round(T.score/10)),rand(-2,2));
  }
}
function stunEnemy(e){
  if (e.hp<=0) return;
  if (ENEMY_TYPES[e.type].boss){ e.state='recover'; e.t=-30; e.vx=0; }
  else { e.state='hurt'; e.t=45; e.vx=0; }
  e.flash=8; addText(e.x,e.y-e.h-24,'ATORDOADO!','#ffd23f',false);
}
function dropItem(x,y,type,vy=-6,val=0,vx=0){ items.push({x,y,vx,vy,type,val,t:0,onGround:false,id:'i'+nextId++}); }

// ----- AI -----
function enemyHitPlayers(e,x1,x2,y1,y2,dmg,dir){
  for (const p of alivePlayers())
    if (p.x+p.w/2>x1 && p.x-p.w/2<x2 && p.y>y1 && p.y-p.h<y2){ hurtPlayer(p,{dmg,dir:dir??(p.x>e.x?1:-1),fromX:e.x,srcId:e.id,...hitFxOf(e)}); trickOnHit(e,p); }
}
function meleeAI(e,tg,dx,adx){
  const T=ENEMY_TYPES[e.type], reach=T.reach;
  if (e.state==='walk'){
    e.face = dx>0?1:-1;
    const sameLevel = Math.abs(tg.y-e.y)<50;
    if (adx>reach-6 || !sameLevel){ e.vx = (!sameLevel && adx<30) ? 0 : e.face*e.speed; }
    else { e.vx*=0.6; if (e.cd<=0){ e.state='windup'; e.t=0; } }
  } else if (e.state==='windup'){
    e.vx*=0.6; e.t++;
    if (e.t>=T.windup){
      e.state='strike'; e.t=0; e.vx=e.face*(reach>50?3:2.5); SFX.strike();
      const x1=e.face>0?e.x:e.x-reach-22, x2=e.face>0?e.x+reach+22:e.x;
      enemyHitPlayers(e,x1,x2,e.y-e.h-10,e.y,e.dmg,e.face);
    }
  } else if (e.state==='strike'){
    e.vx*=0.8; e.t++; if (e.t>18){ e.state='walk'; e.cd=rand(50,110); }
  }
}
function archerAI(e,tg,dx,adx){
  if (e.state==='walk'){
    e.face = dx>0?1:-1;
    if (adx<220) e.vx=-e.face*e.speed; else if (adx>420) e.vx=e.face*e.speed; else e.vx*=0.7;
    if (e.cd<=0 && adx<650){ e.state='aim'; e.t=0; }
  } else if (e.state==='aim'){
    e.vx*=0.7; e.face=dx>0?1:-1; e.t++;
    if (e.t>=34){
      const sy=e.y-30, ty=tg.y-40;
      const vy=clamp((ty-sy)/Math.max(40,adx/8),-2.5,2.5);
      const ET=ENEMY_TYPES[e.type];
      if (ET.shot==='lob'){ const b=throwBomb(e,tg,ET.bombStyle,0); b.fx=ET.shotFx; b.hatch=ET.hatch; SFX.shoot(); }
      else if (ET.shot==='cork'){ addEnemyProj({type:'cork',x:e.x+e.face*26,y:sy-4,vx:e.face*9,vy:vy*0.6,life:110,dmg:e.dmg}); SFX.shoot(); }
      else if (ET.shot==='eorb'){ addEnemyProj({type:'eorb',x:e.x+e.face*22,y:sy-6,vx:e.face*4.5,vy:vy*0.5,life:170,dmg:e.dmg,home:true,col:ENEMY_TYPES[e.type].look.orb}); SFX.zap(); }
      else { addEnemyProj({type:'arrow',x:e.x+e.face*18,y:sy,vx:e.face*8,vy,life:120,dmg:e.dmg}); SFX.shoot(); }
      e.state='strike'; e.t=0;
    }
  } else if (e.state==='strike'){
    e.vx*=0.8; e.t++; if (e.t>14){ e.state='walk'; e.cd=rand(100,160); }
  }
}
function addEnemyProj(o){ o.owner='e'; o.local=true; o.pid=++pidSeq; projs.push(o); netSend({type:'eproj',o}); return o; }

function doSlam(e){
  e.state='recover'; e.t=0; e.vx=0; addShake(14);
  SFX.slam(); dust(e.x-50,e.y,10); dust(e.x+50,e.y,10);
  for (const p of alivePlayers()) if (Math.abs(p.x-e.x)<150 && p.y>e.y-110) hurtPlayer(p,{dmg:e.dmg,dir:p.x>e.x?1:-1,fromX:e.x,srcId:e.id});
  for (const d of [-1,1]) addEnemyProj({type:'shock',x:e.x+d*70,y:e.y,vx:d*7.5,vy:0,life:75,dmg:Math.round(e.dmg*0.55)});
}
function bossAI(e,tg,dx,adx){
  const T=ENEMY_TYPES[e.type], U=T.tune||{}, enr=e.hp<e.maxHp*(U.enrage??0.5), spd=enr?(U.rage||1.3):1;
  const wnd=n=>n*(U.wind||1), rec=n=>n*(U.rec||1), cdR=U.cd||[40,90];
  if (e.wasAir && e.onGround && e.state!=='leap'){ addShake(12); SFX.thud(); dust(e.x,e.y,16); }
  e.wasAir=!e.onGround;
  bossPhaseCheck(e,T);
  if (T.bossTick) T.bossTick(e,tg);
  if (e.state==='walk'){
    const many=(U.summons??2)>=2;
    if (!e.summon1 && e.hp<e.maxHp*(many?0.6:0.5)){ e.summon1=true; e.state='roar'; e.t=0; }
    else if (many && !e.summon2 && e.hp<e.maxHp*0.3){ e.summon2=true; e.state='roar'; e.t=0; }
  }
  switch (e.state){
    case 'walk': {
      e.face=dx>0?1:-1;
      e.vx = adx>110 ? e.face*e.speed*spd : e.vx*0.8;
      if (e.cd<=0 && e.onGround){
        const moves=bossMoves(e,T), near=adx<200, pool=moves.filter(m=>(near?NEAR_MOVES:FAR_MOVES).includes(m));
        e.state=pick(pool.length?pool:moves)+'Wind'; e.t=0;
      }
      break;
    }
    case 'slamWind':
      e.vx*=0.8; e.t++; if (e.t>=wnd(enr?32:44)) doSlam(e);
      break;
    case 'chargeWind':
      e.vx*=0.8; e.t++; if (e.t<20) e.face=dx>0?1:-1;
      if (e.t%6===0) dust(e.x-e.face*30,e.y,2);
      if (e.t>=wnd(40)){ e.state='charge'; e.t=0; e.hitIds=new Set(); SFX.roar(); }
      break;
    case 'charge': {
      e.t++; e.vx=e.face*(U.charge||10)*(enr?1.2:1);
      if (e.t%3===0) dust(e.x-e.face*30,e.y,2);
      for (const p of alivePlayers())
        if (!e.hitIds.has(p.id) && Math.abs(p.x-e.x)<e.w/2+p.w/2 && p.y>e.y-e.h && p.y-p.h<e.y){ e.hitIds.add(p.id); hurtPlayer(p,{dmg:e.dmg,dir:e.face,fromX:e.x,srcId:e.id}); }
      const [l,r]=bounds();
      if (e.t>70 || (e.face<0 && e.x<=l+e.w/2+4) || (e.face>0 && e.x>=r-e.w/2-4)){
        e.state='recover'; e.t=0; e.vx=-e.face*3; addShake(10); SFX.thud();
      }
      break;
    }
    case 'leapWind':
      e.vx*=0.8; e.t++;
      if (e.t>=wnd(24)){ e.state='leap'; e.t=0; e.vy=-15; e.vx=clamp(dx/50,-9,9); SFX.jump(); }
      break;
    case 'leap':
      e.t++; if (e.onGround && e.t>5) doSlam(e);
      break;
    case 'recover':
      e.vx*=0.85; e.t++; if (e.t>=rec(enr?35:55)){ e.state='walk'; e.cd=rand(cdR[0],cdR[1])/spd; }
      break;
    // spins toward the target, hitting everyone near it, then gets dizzy (a window to punish it)
    case 'spinWind':
      e.vx*=0.8; e.t++; if (e.t>=wnd(30)){ e.state='spin'; e.t=0; e.hitIds=new Set(); SFX.roar(); }
      break;
    case 'spin': {
      e.t++; e.vx=clamp((tg.x-e.x)*0.04,-5,5)*(enr?1.3:1);
      if (e.t%18===0) e.hitIds=new Set();
      for (const p of alivePlayers())
        if (!e.hitIds.has(p.id) && Math.abs(p.x-e.x)<e.w/2+42 && p.y>e.y-e.h && p.y-p.h<e.y){ e.hitIds.add(p.id); hurtPlayer(p,{dmg:Math.round(e.dmg*0.6),dir:p.x>e.x?1:-1,fromX:e.x,srcId:e.id}); }
      if (e.t%4===0) dust(e.x,e.y,2);
      if (e.t>=100){ e.state='recover'; e.t=-25; e.vx=0; }
      break;
    }
    // bombs fall from the sky across the arena (style comes from the boss: confetti, eggs, presents…)
    case 'rainWind':
      e.vx*=0.8; e.t++;
      if (e.t>=wnd(26)){
        const n=enr?10:7, [l,r]=bounds();
        for (let k=0;k<n;k++){ const x=k<alivePlayers().length ? alivePlayers()[k].x : l+60+Math.random()*(r-l-120);
          addEnemyProj({type:'bomb',style:T.bombStyle,x,y:-40-k*35,vx:0,vy:2,grav:0.32,life:220,dmg:Math.round(e.dmg*0.5),r:16,explode:50}); }
        SFX.go(); e.state='recover'; e.t=10;
      }
      break;
    // throws a volley of arcing bombs at the target
    case 'bombsWind':
      e.vx*=0.8; e.t++; e.face=dx>0?1:-1;
      if (e.t>=wnd(24)){ for (let k=0;k<(enr?4:3);k++) throwBomb(e,tg,T.bombStyle,k,70); SFX.blast(); e.state='recover'; e.t=12; }
      break;
    // three hops toward the target, each landing hits around it
    case 'hopWind':
      e.vx*=0.8; e.t++; if (e.t>=wnd(18)){ e.hops=3; bossHop(e,tg); }
      break;
    case 'hop':
      e.t++;
      if (e.onGround && e.t>5){
        addShake(7); SFX.thud(); dust(e.x-30,e.y,6); dust(e.x+30,e.y,6);
        for (const p of alivePlayers()) if (Math.abs(p.x-e.x)<e.w/2+60 && p.y>e.y-90) hurtPlayer(p,{dmg:Math.round(e.dmg*0.7),dir:p.x>e.x?1:-1,fromX:e.x,srcId:e.id});
        if (--e.hops>0){ e.state='hopPause'; e.t=0; } else { e.state='recover'; e.t=0; }
      }
      break;
    case 'hopPause':
      e.vx*=0.7; e.t++; if (e.t>=(enr?8:14)) bossHop(e,tg);
      break;
    // sinks into the ground and bursts out under the target (a glowing mark shows where)
    case 'burrowWind':
      e.vx*=0.8; e.t++; if (e.t>=wnd(20)){ e.state='burrow'; e.t=0; e.hidden=true; dust(e.x,e.y,16); SFX.thud(); }
      break;
    case 'burrow':
      e.t++; e.vx=0;
      if (e.t===24){ const [l,r]=bounds(); e.bx=clamp(tg.x,l+e.w/2,r-e.w/2); }
      if (e.t>=24) e.x=e.bx;
      if (e.t>=(enr?44:54)){
        e.hidden=false; e.state='recover'; e.t=0; addShake(12); SFX.slam(); dust(e.x,e.y,20);
        for (const p of alivePlayers()) if (Math.abs(p.x-e.x)<e.w/2+50 && p.y>e.y-130) hurtPlayer(p,{dmg:e.dmg,dir:p.x>e.x?1:-1,fromX:e.x,srcId:e.id});
        if (T.burrowWave) for (const d of [-1,1]) addEnemyProj({type:'swave',style:T.burrowWave,x:e.x+d*60,y:e.y,vx:d*8,vy:0,life:70,dmg:Math.round(e.dmg*0.55)});
      }
      break;
    case 'rocksWind':
      e.vx*=0.8; e.t++; e.face=dx>0?1:-1;
      if (e.t>=wnd(enr?24:32)){
        for (let k=0;k<(enr?4:3);k++){
          const tgx=tg.x+rand(-90,90), flight=44+k*6;
          addEnemyProj({type:'boulder',x:e.x+e.face*40,y:e.y-e.h*0.8,vx:(tgx-e.x)/flight,vy:-12+k*0.5,grav:0.5,life:160,dmg:Math.round(e.dmg*0.6),r:22});
        }
        SFX.thud(); e.state='recover'; e.t=10;
      }
      break;
    case 'spikesWind':
      e.vx*=0.8; e.t++;
      if (e.t===12) for (const p of alivePlayers()) addEnemyProj({type:'spike',x:p.x,y:surfaceBelow(p.x,p.y),vx:0,vy:0,life:64,dmg:Math.round(e.dmg*0.65)});
      if (e.t>=24){ e.state='recover'; e.t=0; SFX.freeze(); }
      break;
    case 'spitWind':
      e.vx*=0.8; e.t++; e.face=dx>0?1:-1;
      if (e.t>=wnd(enr?20:28)){
        for (let k=-1;k<=1;k++) addEnemyProj({type:'glob',x:e.x+e.face*50,y:e.y-e.h*0.7,vx:clamp(dx/40,-9,9)+k*1.6,vy:-9-Math.abs(k),grav:0.45,life:150,dmg:Math.round(e.dmg*0.45),r:16,pool:T.spitPool});
        SFX.blast(); e.state='recover'; e.t=15;
      }
      break;
    case 'waveWind':
      e.vx*=0.8; e.t++; e.face=dx>0?1:-1;
      if (e.t>=wnd(enr?22:30)){
        addEnemyProj({type:'swave',style:T.waveStyle,x:e.x+e.face*60,y:e.y,vx:e.face*9.5,vy:0,life:95,dmg:Math.round(e.dmg*0.62)});
        if (enr) addEnemyProj({type:'swave',style:T.waveStyle,x:e.x-e.face*60,y:e.y,vx:-e.face*9.5,vy:0,life:95,dmg:Math.round(e.dmg*0.62)});
        SFX.wave(); addShake(6); e.state='recover'; e.t=15;
      }
      break;
    case 'teleportWind':
      e.vx=0; e.t++;
      if (e.t===18){
        const [l,r]=bounds();
        burst(e.x,e.y-e.h/2,'#8a3cff',20,6,0);
        e.x=clamp(tg.x-tg.face*90,l+e.w/2,r-e.w/2); e.face=tg.x>e.x?1:-1;
        burst(e.x,e.y-e.h/2,'#ff5cf0',20,6,0); SFX.blink();
        e.state='slashWind'; e.t=0;
      }
      break;
    case 'slashWind':
      e.vx*=0.8; e.t++;
      if (e.t>=wnd(enr?12:18)){
        const x1=e.face>0?e.x:e.x-150, x2=e.face>0?e.x+150:e.x;
        enemyHitPlayers(e,x1,x2,e.y-e.h-10,e.y,e.dmg,e.face);
        ring(e.x+e.face*70,e.y-60,'#ff5cf0',10,14,8,20); SFX.swing(true);
        e.state='recover'; e.t=0;
      }
      break;
    case 'roar':
      e.vx*=0.8; e.t++;
      if (e.t===20){
        addShake(12); SFX.roar(); ring(e.x,e.y-80,'#ff6b6b',12,22,6,20);
        const s=T.summon;
        spawnEnemy(s[0],lockL+70); spawnEnemy(s[1],lockR-70);
        if (e.summon2) spawnEnemy(s[2],lockL+W/2);
      }
      if (e.t>=70){ e.state='walk'; e.cd=40; }
      break;
    default: // moves a stage file added for its own boss (mechanics.js)
      if (BOSS_STATES[e.state]) BOSS_STATES[e.state](e,tg,dx,adx,{enr,spd,wnd,rec});
  }
}
// An arcing bomb aimed at the target's position
function throwBomb(e,tg,style,k=0,explode=0){
  // time the arc so it comes down on the target (k>0 spreads extra bombs around it)
  const tx=tg.x+(k?rand(-80,80):0), y0=e.y-e.h*0.7, vy=-9.5-k*0.4, g=0.42;
  const flight=(-vy+Math.sqrt(vy*vy+2*g*Math.max(0,tg.y-24-y0)))/g;
  return addEnemyProj({type:'bomb',style:style||'confetti',x:e.x+e.face*24,y:y0,vx:clamp((tx-e.x-e.face*24)/flight,-9,9),vy,grav:g,life:200,
    dmg:Math.round(e.dmg*(explode?0.55:1)),r:explode?16:13,explode});
}
function bossHop(e,tg){ e.state='hop'; e.t=0; e.vy=-12; e.vx=clamp((tg.x-e.x)/40,-8,8); e.face=tg.x>e.x?1:-1; SFX.jump(); }
function updateEnemy(e){
  e.anim++; if (e.flash>0) e.flash--;
  if (e.state==='dying'){ e.t++; e.vx*=0.96; physics(e,true); if (e.t>45) e.dead=true; return; }
  if (e.cd>0) e.cd--;
  const T=ENEMY_TYPES[e.type], tg=nearestPlayer(e.x,e.y);
  if (!tg){ e.vx*=0.8; if (e.state!=='hurt') e.state='walk'; }
  else if (e.state==='hurt'){
    e.t--; e.vx*=e.onGround?0.85:0.98;
    if (e.t<=0 && (e.onGround || T.fly)){ e.state='walk'; e.cd=Math.max(e.cd,30); }
  } else {
    const dx=tg.x-e.x, adx=Math.abs(dx);
    if (trickAI(e,tg,dx,adx)) {}
    else if (T.ai==='archer') archerAI(e,tg,dx,adx);
    else if (T.ai==='boss') bossAI(e,tg,dx,adx);
    else if (T.ai==='flyer') flyerAI(e,tg,dx,adx);
    else if (T.ai==='hopper') hopperAI(e,tg,dx,adx);
    else if (T.ai==='roller') rollerAI(e,tg,dx,adx);
    else if (T.ai==='kamikaze') kamikazeAI(e,tg,dx,adx);
    else if (T.ai==='trickster') tricksterAI(e,tg,dx,adx);
    else meleeAI(e,tg,dx,adx);
    trickTick(e,tg);
  }
  // walkers stop at the edge of a pit (but can still be knocked in)
  if (!T.fly && !T.boss && pits.length && e.onGround && e.state!=='hurt' && e.vx && inPit(e.x+Math.sign(e.vx)*(e.w/2+8)+e.vx*4)) e.vx=0;
  if (T.fly){ if (e.state==='hurt') e.vy*=0.9; e.x+=e.vx; e.y=clamp(e.y+e.vy,60,GROUND-6); e.onGround=false; }
  else physics(e,!!T.boss);
  const [l,r]=bounds(); e.x=clamp(e.x,l+e.w/2,r-e.w/2);
}
// Bunnies close in with hops and hurt whoever they land on or bump mid-air
function hopperAI(e,tg,dx,adx){
  e.face=dx>0?1:-1;
  if (e.onGround){
    e.vx*=0.6;
    if (e.cd<=0){ e.vy=-8.5-Math.random()*2; e.vx=e.face*Math.min(e.speed*1.6,adx/18+1); e.cd=rand(18,40); e.hitIds=new Set(); e.state='jump'; }
    else e.state='walk';
  } else if (e.hitIds){
    for (const p of alivePlayers())
      if (!e.hitIds.has(p.id) && Math.abs(p.x-e.x)<e.w/2+p.w/2 && e.y>p.y-p.h && e.y-e.h<p.y){ e.hitIds.add(p.id); hurtPlayer(p,{dmg:e.dmg,dir:e.face,fromX:e.x,srcId:e.id,...hitFxOf(e)}); }
  }
}
// The Saci hops around on one leg, vanishes in a little whirlwind and reappears behind the target to kick
function tricksterAI(e,tg,dx,adx){
  if (e.state==='walk'){
    e.face=dx>0?1:-1;
    if (e.onGround){ e.vx=e.face*e.speed; if (e.anim%20<1) e.vy=-5; }
    if (e.cd<=0 && adx<380){ e.state='teleportWind'; e.t=0; }
  } else if (e.state==='teleportWind'){
    e.vx*=0.6; e.t++;
    if (e.t%2===0) parts.push({x:e.x+Math.cos(e.t*0.6)*18,y:e.y-20-e.t,vx:0,vy:-0.5,life:16,max:16,color:pick(['#8fbf6a','#c9a227','#6b8f3a']),size:3,grav:0});
    if (e.t>=20){
      const [l,r]=bounds();
      burst(e.x,e.y-26,'#8fbf6a',12,4,0);
      e.x=clamp(tg.x-tg.face*48,l+15,r-15); e.y=tg.y; e.vy=0; e.face=tg.x>e.x?1:-1;
      burst(e.x,e.y-26,'#c9a227',12,4,0); SFX.blink();
      e.state='windup'; e.t=6;
    }
  } else if (e.state==='windup'){
    e.vx*=0.6; e.t++;
    if (e.t>=18){ e.state='strike'; e.t=0; SFX.strike();
      const x1=e.face>0?e.x:e.x-62, x2=e.face>0?e.x+62:e.x; enemyHitPlayers(e,x1,x2,e.y-e.h-10,e.y,e.dmg,e.face); }
  } else if (e.state==='strike'){
    e.vx*=0.8; e.t++; if (e.t>16){ e.state='walk'; e.cd=rand(90,150); }
  } else e.state='walk';
}
// "Busca-pé" fireworks: dash at the target, fizz for a moment, then blow up (destroying themselves)
function kamikazeAI(e,tg,dx,adx){
  if (e.state==='walk'){
    e.face=dx>0?1:-1; e.vx=e.face*e.speed;
    if (adx<60 && Math.abs(tg.y-e.y)<50){ e.state='windup'; e.t=0; SFX.charge(); }
  } else if (e.state==='windup'){
    e.vx*=0.85; e.t++; if (e.t%3===0) parts.push({x:e.x,y:e.y-34,vx:rand(-1,1),vy:-rand(1,2),life:14,max:14,color:'#ffd36b',size:2,grav:0});
    if (e.t>=30){
      ring(e.x,e.y-20,'#ffb347',8,18,8,10); burst(e.x,e.y-20,'#ff9d4d',20,7,0.1); SFX.blast(); addShake(6);
      for (const p of alivePlayers()) if (Math.hypot(p.x-e.x,(p.y-30)-(e.y-20))<80) hurtPlayer(p,{dmg:e.dmg,dir:p.x>=e.x?1:-1,fromX:e.x,srcId:e.id});
      e.hp=0; e.state='dying'; e.t=40; e.vy=0;
    }
  } else e.state='walk';
}
// Rolling eggs wobble closer, then roll hard at the target
function rollerAI(e,tg,dx,adx){
  if (e.state==='walk'){
    e.face=dx>0?1:-1; e.vx=e.face*e.speed*0.6;
    if (e.cd<=0 && adx<420 && Math.abs(tg.y-e.y)<60){ e.state='windup'; e.t=0; }
  } else if (e.state==='windup'){
    e.vx*=0.7; e.t++; if (e.t>=22){ e.state='charge'; e.t=0; e.hitIds=new Set(); SFX.dash(); }
  } else if (e.state==='charge'){
    e.t++; e.vx=e.face*7.5;
    for (const p of alivePlayers())
      if (!e.hitIds.has(p.id) && Math.abs(p.x-e.x)<e.w/2+p.w/2 && p.y>e.y-e.h && p.y-p.h<e.y){ e.hitIds.add(p.id); hurtPlayer(p,{dmg:e.dmg,dir:e.face,fromX:e.x,srcId:e.id,...hitFxOf(e)}); }
    if (e.t%4===0) dust(e.x,e.y,1);
    if (e.t>55){ e.state='walk'; e.cd=rand(60,100); }
  } else e.state='walk';
}
// Bats hover above their target and swoop down at it
function flyerAI(e,tg,dx,adx){
  if (e.state==='walk'){
    const hx=tg.x-Math.sign(dx||1)*120, hy=tg.y-120+Math.sin(e.anim*0.08)*14;
    e.vx=clamp(e.vx+clamp((hx-e.x)*0.02,-0.4,0.4),-e.speed*1.6,e.speed*1.6)*0.94;
    e.vy=(e.vy+clamp((hy-e.y)*0.03,-0.5,0.5))*0.9;
    e.face=dx>0?1:-1;
    if (e.cd<=0 && adx<320){ e.state='windup'; e.t=0; }
  } else if (e.state==='windup'){
    e.vx*=0.8; e.vy=e.vy*0.8-0.2; e.t++;
    if (e.t>=18){
      const ang=Math.atan2((tg.y-36)-e.y,tg.x-e.x);
      e.state='swoop'; e.t=0; e.vx=Math.cos(ang)*8.5; e.vy=Math.sin(ang)*8.5; e.hitIds=new Set(); SFX.strike();
    }
  } else if (e.state==='swoop'){
    e.t++;
    for (const p of alivePlayers())
      if (!e.hitIds.has(p.id) && Math.abs(p.x-e.x)<28 && e.y>p.y-p.h && e.y-e.h<p.y){ e.hitIds.add(p.id); hurtPlayer(p,{dmg:e.dmg,dir:Math.sign(e.vx)||1,fromX:e.x,srcId:e.id,...hitFxOf(e)}); }
    if (e.t>40 || e.y>=GROUND-12){ e.state='walk'; e.cd=rand(70,120); e.vy=-4; }
  } else e.state='walk';
}
function separate(){
  for (let i=0;i<enemies.length;i++) for (let j=i+1;j<enemies.length;j++){
    const a=enemies[i], b=enemies[j];
    if (a.hp<=0 || b.hp<=0) continue;
    const d=b.x-a.x, min=(a.w+b.w)*0.4;
    if (Math.abs(d)<min && Math.abs(a.y-b.y)<30){
      const push=(min-Math.abs(d))*0.1*(d>=0?1:-1);
      const TA=ENEMY_TYPES[a.type], TB=ENEMY_TYPES[b.type];
      if (!TA.boss && !TA.anchored) a.x-=push;
      if (!TB.boss && !TB.anchored) b.x+=push;
    }
  }
}

// ----- drawing -----
function drawBat(e,T,c,F,sx){
  const y=e.y-15+Math.sin(e.anim*0.3)*2, flap=Math.sin(e.anim*(e.state==='swoop'?0.9:0.5));
  ctx.save(); ctx.translate(sx,y); ctx.scale(e.face,1);
  if (e.state==='dying'){ ctx.globalAlpha=Math.max(0,1-e.t/45); ctx.rotate(e.t*0.2); }
  ctx.fillStyle=F(c.wing);
  for (const s of [-1,1]){ ctx.beginPath(); ctx.moveTo(0,-2); ctx.quadraticCurveTo(s*14,-18*flap-6,s*26,-6*flap); ctx.quadraticCurveTo(s*16,2,s*6,6); ctx.closePath(); ctx.fill(); }
  ctx.fillStyle=F(c.body); circle(0,0,10); tri(-6,-8,-3,-16,0,-8); tri(2,-8,5,-16,7,-8);
  ctx.fillStyle=e.state==='windup'?'#ff2020':c.eye; circle(4,-2,2.2); circle(-1,-2,1.8);
  ctx.fillStyle=F('#ffffff'); tri(2,4,4,8,5,4);
  ctx.restore();
  if (e.hp>0 && e.state==='windup' && (e.anim>>2)%2) txt('!',sx,y-26,20,'#ff4040');
  if (e.hp>0 && e.hp<e.maxHp){ ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(sx-18,y-24,36,4); ctx.fillStyle='#ff4d5e'; ctx.fillRect(sx-18,y-24,36*e.hp/e.maxHp,4); }
}
function drawScorpion(e,T,c,F,sx,noShadow){
  const boss=!!T.boss, s=c.s;
  if (!noShadow && e.state!=='dying') shadow(sx,boss?GROUND:surfaceBelow(e.x,e.y),e.w*0.55);
  ctx.save(); ctx.translate(sx,e.y); ctx.scale(e.face*s,s);
  if (e.state==='dying'){ ctx.globalAlpha=Math.max(0,1-e.t/45); ctx.rotate(-Math.min(1,e.t/12)*0.6); }
  const st=e.state, moving=Math.abs(e.vx)>0.3, ph=moving?Math.sin(e.anim*0.5):0, wind=WIND.includes(st);
  ctx.strokeStyle=F(c.dark); ctx.lineWidth=2;
  for (let k=0;k<3;k++){ const lx=-8+k*7; ctx.beginPath(); ctx.moveTo(lx,-6); ctx.lineTo(lx-4+ph*(k%2?2:-2),0); ctx.stroke(); }
  ctx.fillStyle=F(c.body); ctx.beginPath(); ctx.ellipse(0,-9,15,7,0,0,Math.PI*2); ctx.fill();
  // tail: 4 segments curling over the back, raised further while winding up
  const curl=wind?1.4:st==='strike'?0.3:1;
  let tx=-14, ty=-10, a=-2.6;
  for (let k=0;k<4;k++){ a+=0.55*curl; tx+=Math.cos(a)*7; ty+=Math.sin(a)*7; ctx.fillStyle=F(k%2?c.body:c.dark); circle(tx,ty,4.5-k*0.4); }
  ctx.fillStyle=F('#3a1d0a'); tri(tx-3,ty,tx+6,ty+2,tx+2,ty+8);
  // claws
  const cl=st==='strike'?6:0;
  ctx.fillStyle=F(c.dark); circle(16+cl,-9,4); tri(18+cl,-13,26+cl,-11,19+cl,-8); tri(18+cl,-5,26+cl,-7,19+cl,-9);
  ctx.fillStyle=wind?'#ff2020':c.eye; circle(10,-12,1.6); circle(13,-12,1.6);
  if (c.crown){ ctx.fillStyle=F('#ffd34d'); ctx.fillRect(2,-20,12,3); tri(2,-20,4,-26,6,-20); tri(6,-20,8,-27,10,-20); tri(10,-20,12,-26,14,-20); }
  ctx.restore();
  if (e.hp>0 && wind && (e.anim>>2)%2) txt('!',sx,e.y-e.h-18,22,'#ff4040');
  if (!boss && e.hp>0 && e.hp<e.maxHp){ ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(sx-20,e.y-e.h-10,40,5); ctx.fillStyle='#ff4d5e'; ctx.fillRect(sx-20,e.y-e.h-10,40*e.hp/e.maxHp,5); }
}
// Carnival "bonecão": a giant puppet with a huge head and floppy cloth arms
function drawPuppet(e,T,c,F,sx,noShadow){
  const boss=!!T.boss, s=c.s, st=e.state;
  if (e.hidden) return;
  ctx.save(); ctx.translate(sx,e.y); ctx.scale(e.face*s,s);
  if (st==='dying'){ ctx.globalAlpha=Math.max(0,1-e.t/45); ctx.rotate(-Math.min(1,e.t/14)*1.2); }
  const moving=Math.abs(e.vx)>0.3 && e.onGround, ph=moving?Math.sin(e.anim*0.25):0, spin=st==='spin';
  ctx.rotate(spin?Math.sin(e.anim*0.5)*0.08:ph*0.06);
  ctx.fillStyle=F('#2b2b3a'); ctx.fillRect(-7+ph*3,-12,5,12); ctx.fillRect(2-ph*3,-12,5,12);
  ctx.fillStyle=F(c.body); ctx.beginPath(); ctx.moveTo(-15,-12); ctx.lineTo(15,-12); ctx.lineTo(10,-42); ctx.lineTo(-10,-42); ctx.closePath(); ctx.fill();
  ctx.fillStyle=F(c.cloth); for (let k=-12;k<12;k+=8) ctx.fillRect(k,-40,4,28);
  // arms: hang and swing; raised while winding up; whirl around while spinning
  const base=WIND.includes(st)?-2.4:st==='strike'?0.9:0.35;
  for (const side of [-1,1]){
    const a = spin ? e.anim*0.55+(side>0?Math.PI:0) : base+side*0.25+Math.sin(e.anim*0.15+side)*0.25;
    ctx.save(); ctx.translate(side*9,-38); ctx.rotate(a);
    ctx.fillStyle=F(c.cloth); ctx.beginPath(); ctx.roundRect(-3,0,7,26,3); ctx.fill();
    ctx.fillStyle=F(c.skin); circle(0.5,28,4); ctx.restore();
  }
  // big head
  ctx.fillStyle=F(c.skin); circle(0,-58,17);
  ctx.fillStyle=F(c.hair); ctx.beginPath(); ctx.arc(0,-62,17.5,Math.PI*1.05,Math.PI*1.95); ctx.fill();
  ctx.fillStyle='#ffffff'; circle(-6,-58,4.5); circle(6,-58,4.5);
  const look=WIND.includes(st)||spin?'#ff2020':'#1b1b2e'; ctx.fillStyle=look; circle(-5,-58,2.2); circle(7,-58,2.2);
  ctx.fillStyle=F('#ff8fa3'); circle(-11,-51,3); circle(11,-51,3);
  ctx.strokeStyle=F('#8a2b2b'); ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(0,-50,5,0.2,Math.PI-0.2); ctx.stroke();
  if (c.crown){ ctx.fillStyle=F('#ffd23f'); ctx.fillRect(-10,-78,20,4); tri(-10,-78,-7,-86,-4,-78); tri(-3,-78,0,-88,3,-78); tri(4,-78,7,-86,10,-78); }
  if (st==='recover' && e.t<0) for (let k=0;k<3;k++){ const a=e.anim*0.2+k*2.1; ctx.fillStyle='#ffd23f'; circle(Math.cos(a)*14,-82+Math.sin(a)*4,2.2); }
  ctx.restore();
  if (e.hp>0 && WIND.includes(st) && (e.anim>>2)%2) txt('!',sx,e.y-e.h-18,22,'#ff4040');
  if (!boss && e.hp>0 && e.hp<e.maxHp){ ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(sx-20,e.y-e.h-10,40,5); ctx.fillStyle='#ff4d5e'; ctx.fillRect(sx-20,e.y-e.h-10,40*e.hp/e.maxHp,5); }
}
function foeBars(e,T,sx){
  if (e.hp>0 && WIND.includes(e.state) && (e.anim>>2)%2) txt('!',sx,e.y-e.h-18,22,'#ff4040');
  if (!T.boss && e.hp>0 && e.hp<e.maxHp){ ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(sx-20,e.y-e.h-10,40,5); ctx.fillStyle='#ff4d5e'; ctx.fillRect(sx-20,e.y-e.h-10,40*e.hp/e.maxHp,5); }
}
function foeDying(e,rot=1.2){ if (e.state==='dying'){ ctx.globalAlpha=Math.max(0,1-e.t/45); ctx.rotate(-Math.min(1,e.t/14)*rot); } }
function drawBunny(e,T,c,F,sx){
  ctx.save(); ctx.translate(sx,e.y); ctx.scale(e.face*c.s,c.s); foeDying(e);
  const air=!e.onGround, wind=WIND.includes(e.state);
  if (air) ctx.rotate(-0.15);
  ctx.fillStyle=F(c.fur); ctx.beginPath(); ctx.ellipse(-2,-16,15,14,0,0,Math.PI*2); ctx.fill();
  circle(-16,-14,6);
  ctx.beginPath(); ctx.ellipse(-6,-2,7,4,0,0,Math.PI*2); ctx.ellipse(8,-2,7,4,0,0,Math.PI*2); ctx.fill();
  circle(9,-32,11);
  // ears (perk up when about to pounce)
  const ear=wind||air?-0.15:0.25+Math.sin(e.anim*0.1)*0.1;
  for (const k of [0,1]){ ctx.save(); ctx.translate(4+k*7,-40); ctx.rotate(ear+k*0.2); ctx.fillStyle=F(c.fur); ctx.beginPath(); ctx.ellipse(0,-12,4.5,13,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=F(c.inner); ctx.beginPath(); ctx.ellipse(0,-12,2,9,0,0,Math.PI*2); ctx.fill(); ctx.restore(); }
  ctx.fillStyle=c.eye; circle(13,-34,2.4); ctx.fillStyle=F(c.inner); circle(19,-30,2);
  ctx.fillStyle=F('#ffffff'); ctx.fillRect(16,-26,4,4);
  if (c.bow){ ctx.fillStyle=F(c.bow); tri(2,-21,-6,-26,-6,-16); tri(2,-21,10,-26,10,-16); circle(2,-21,2.5); }
  ctx.restore(); foeBars(e,T,sx);
}
function drawEggFoe(e,T,c,F,sx){
  ctx.save(); ctx.translate(sx,e.y-21); ctx.scale(e.face*c.s,c.s); foeDying(e);
  if (e.state==='charge') ctx.rotate(e.anim*0.35); else ctx.rotate(Math.sin(e.anim*0.15)*0.12);
  ctx.fillStyle=F(c.shell); ctx.beginPath(); ctx.ellipse(0,0,16,21,0,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle=F(c.band); ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(-16,-4); for (let k=-16;k<=16;k+=8) ctx.lineTo(k,-4+((k+16)/8%2?4:-4)); ctx.stroke();
  ctx.fillStyle=F(c.band2); ctx.fillRect(-14,7,28,4);
  const wind=WIND.includes(e.state)||e.state==='charge';
  ctx.fillStyle='#1b1b2e'; circle(5,-8,2.5); circle(11,-8,2.5);
  ctx.strokeStyle='#1b1b2e'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(1,-14+(wind?2:0)); ctx.lineTo(8,-12); ctx.moveTo(15,-14+(wind?2:0)); ctx.lineTo(8,-12); ctx.stroke();
  ctx.restore(); foeBars(e,T,sx);
}
function drawChicken(e,T,c,F,sx){
  ctx.save(); ctx.translate(sx,e.y); ctx.scale(e.face*c.s,c.s); foeDying(e);
  const moving=Math.abs(e.vx)>0.3, ph=moving?Math.sin(e.anim*0.4):0, flap=e.state==='aim'?Math.sin(e.anim*0.8):0;
  ctx.strokeStyle=F('#e0a020'); ctx.lineWidth=2.5; ctx.beginPath(); ctx.moveTo(-3,-12); ctx.lineTo(-4+ph*3,0); ctx.moveTo(4,-12); ctx.lineTo(5-ph*3,0); ctx.stroke();
  ctx.fillStyle=F(c.body); ctx.beginPath(); ctx.ellipse(0,-22,14,12,0,0,Math.PI*2); ctx.fill();
  tri(-12,-26,-22,-34,-14,-18);
  circle(10,-36,8);
  ctx.fillStyle=F(c.comb); circle(8,-45,3); circle(12,-46,3); circle(5,-44,2.5); ctx.beginPath(); ctx.ellipse(14,-30,2,3.5,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle=F('#ffb703'); tri(17,-38,24,-36,17,-33);
  ctx.fillStyle='#1b1b2e'; circle(12,-38,1.8);
  ctx.fillStyle=F('#e6e6e6'); ctx.save(); ctx.translate(-2,-24); ctx.rotate(-0.3-flap*0.6); ctx.beginPath(); ctx.ellipse(0,0,9,5,0,0,Math.PI*2); ctx.fill(); ctx.restore();
  ctx.restore(); foeBars(e,T,sx);
}
function drawSaci(e,T,c,F,sx){
  ctx.save(); ctx.translate(sx,e.y); ctx.scale(e.face*c.s,c.s); foeDying(e);
  if (e.state==='teleportWind') ctx.globalAlpha=Math.max(0.1,1-e.t/20);
  const hop=e.onGround?0:-0.1, kick=e.state==='strike';
  ctx.rotate(hop);
  ctx.fillStyle=F(c.skin); ctx.fillRect(-2,-16,6,16); ctx.fillRect(-3,-3,9,3);         // one leg
  if (kick){ ctx.save(); ctx.translate(2,-18); ctx.rotate(-1.2); ctx.fillRect(0,-3,18,6); ctx.restore(); }
  ctx.fillStyle=F(c.shorts); ctx.beginPath(); ctx.roundRect(-8,-24,16,10,3); ctx.fill();
  ctx.fillStyle=F(c.skin); ctx.beginPath(); ctx.roundRect(-8,-38,16,16,5); ctx.fill();
  circle(2,-46,10);
  ctx.fillStyle=F(c.cap); ctx.beginPath(); ctx.moveTo(-9,-50); ctx.quadraticCurveTo(2,-64,-10,-74); ctx.quadraticCurveTo(6,-62,12,-50); ctx.closePath(); ctx.fill();
  ctx.fillStyle='#ffffff'; circle(6,-47,2.6); ctx.fillStyle='#1b1b2e'; circle(7,-47,1.4);
  ctx.strokeStyle='#ffffff'; ctx.lineWidth=1.4; ctx.beginPath(); ctx.arc(5,-41,3,0.2,Math.PI-0.4); ctx.stroke();
  ctx.fillStyle=F('#8a5a2a'); ctx.fillRect(9,-41,8,2.5); ctx.fillRect(15,-45,3,5);      // pipe
  ctx.fillStyle='rgba(220,220,220,0.6)'; circle(17+Math.sin(clock*0.1)*2,-51-(clock%40)/4,3);
  ctx.restore(); foeBars(e,T,sx);
}
function drawWisp(e,T,c,F,sx){
  const y=e.y-15, fl=Math.sin(e.anim*0.4);
  ctx.save(); ctx.translate(sx,y);
  if (e.state==='dying') ctx.globalAlpha=Math.max(0,1-e.t/45);
  const g=ctx.createRadialGradient(0,0,2,0,0,30); g.addColorStop(0,'rgba(220,240,255,0.95)'); g.addColorStop(0.4,'rgba(120,190,255,0.7)'); g.addColorStop(1,'rgba(60,120,255,0)');
  ctx.fillStyle=g; circle(0,0,30);
  ctx.fillStyle=F('#9ad0ff'); ctx.beginPath(); ctx.moveTo(-10,4); ctx.quadraticCurveTo(-8,-14-fl*4,0,-26); ctx.quadraticCurveTo(8,-14+fl*4,10,4); ctx.quadraticCurveTo(0,12,-10,4); ctx.fill();
  ctx.fillStyle=e.state==='windup'?'#ff2020':'#1b2a5a'; circle(-3,-4,2); circle(4,-4,2);
  ctx.restore();
  if (e.hp>0 && e.state==='windup' && (e.anim>>2)%2) txt('!',sx,y-34,20,'#ff4040');
  if (e.hp>0 && e.hp<e.maxHp){ ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(sx-18,y-30,36,4); ctx.fillStyle='#ff4d5e'; ctx.fillRect(sx-18,y-30,36*e.hp/e.maxHp,4); }
}
// Mula-sem-cabeça: a galloping mule with a column of fire where the head should be
function drawMule(e,T,c,F,sx){
  ctx.save(); ctx.translate(sx,e.y); ctx.scale(e.face,1);
  if (e.state==='dying'){ ctx.globalAlpha=Math.max(0,1-e.t/45); ctx.rotate(-Math.min(1,e.t/14)*0.5); }
  const run=Math.abs(e.vx)>0.5, ph=run?e.anim*0.35:0, rage=WIND.includes(e.state)||e.state==='charge';
  const rear=e.state==='slamWind'?-0.25:e.state==='leap'?-0.15:0;
  ctx.rotate(rear);
  // legs
  ctx.strokeStyle=F(c.body); ctx.lineWidth=9; ctx.lineCap='round';
  for (const [lx,o] of [[-38,0],[-24,Math.PI],[26,Math.PI*0.5],[40,Math.PI*1.5]]){ const sw=run?Math.sin(ph+o)*0.45:0;
    ctx.beginPath(); ctx.moveTo(lx,-50); ctx.lineTo(lx+Math.sin(sw)*24,-6); ctx.stroke(); ctx.fillStyle=F('#1b1b1b'); circle(lx+Math.sin(sw)*24,-4,5); }
  // body, tail, saddle
  ctx.fillStyle=F(c.body); ctx.beginPath(); ctx.ellipse(0,-62,58,24,0,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle=F(c.mane); ctx.lineWidth=7; ctx.beginPath(); ctx.moveTo(-54,-68); ctx.quadraticCurveTo(-80,-60+Math.sin(clock*0.2)*6,-74,-30); ctx.stroke();
  ctx.fillStyle=F('#7a1f1f'); ctx.beginPath(); ctx.roundRect(-14,-88,30,12,4); ctx.fill();
  // neck ending in fire
  ctx.fillStyle=F(c.body); ctx.beginPath(); ctx.moveTo(34,-80); ctx.lineTo(62,-112); ctx.lineTo(78,-102); ctx.lineTo(54,-58); ctx.closePath(); ctx.fill();
  ctx.fillStyle=F(c.mane); ctx.beginPath(); ctx.moveTo(36,-84); ctx.lineTo(60,-114); ctx.lineTo(56,-96); ctx.closePath(); ctx.fill();
  for (let k=0;k<3;k++){ const fl=Math.sin(clock*0.4+k)*6, s=1-k*0.25;
    ctx.fillStyle=['#ff5a1f','#ffb347','#fff3c4'][k]; ctx.beginPath(); ctx.ellipse(72,-118-k*4,16*s,(30+fl)*s,0.5,0,Math.PI*2); ctx.fill(); }
  if (rage) for (let k=0;k<3;k++) parts.push({x:e.x+e.face*72+rand(-8,8),y:e.y-130,vx:rand(-1,1),vy:-rand(1,3),life:20,max:20,color:pick(['#ff5a1f','#ffd36b']),size:3,grav:0});
  ctx.restore();
  if (e.hp>0 && WIND.includes(e.state) && (e.anim>>2)%2) txt('!',sx,e.y-e.h-60,22,'#ff4040');
}
function drawReindeer(e,T,c,F,sx){
  ctx.save(); ctx.translate(sx,e.y); ctx.scale(e.face*c.s,c.s); foeDying(e,0.6);
  const run=Math.abs(e.vx)>0.5, ph=run?e.anim*0.4:0, chg=e.state==='charge', wind=e.state==='windup';
  ctx.rotate(chg?0.12:wind?-0.08:0);
  ctx.strokeStyle=F(c.fur); ctx.lineWidth=5; ctx.lineCap='round';
  for (const [lx,o] of [[-16,0],[-8,Math.PI],[10,Math.PI*0.5],[18,Math.PI*1.5]]){ const sw=run?Math.sin(ph+o)*0.5:0; ctx.beginPath(); ctx.moveTo(lx,-28); ctx.lineTo(lx+Math.sin(sw)*12,-2); ctx.stroke(); }
  ctx.fillStyle=F(c.fur); ctx.beginPath(); ctx.ellipse(0,-34,24,12,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle=F(c.belly); ctx.beginPath(); ctx.ellipse(2,-28,14,5,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle=F(c.fur); ctx.beginPath(); ctx.moveTo(14,-40); ctx.lineTo(24,-56); ctx.lineTo(32,-50); ctx.lineTo(24,-34); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.ellipse(30,-54,10,7,0.3,0,Math.PI*2); ctx.fill();
  ctx.strokeStyle=F('#d9b48a'); ctx.lineWidth=2.5;
  for (const s of [-1,1]){ ctx.beginPath(); ctx.moveTo(26+s*2,-60); ctx.lineTo(22+s*6,-74); ctx.moveTo(23+s*4,-68); ctx.lineTo(16+s*6,-72); ctx.stroke(); }
  ctx.fillStyle=F(c.nose); circle(39,-52,4); ctx.fillStyle='#1b1b2e'; circle(31,-57,1.8);
  ctx.fillStyle=F('#ffd23f'); circle(18,-44,3);
  ctx.restore(); foeBars(e,T,sx);
}
function drawRocketFoe(e,T,c,F,sx){
  ctx.save(); ctx.translate(sx,e.y); ctx.scale(e.face,1); foeDying(e,0.6);
  const wind=e.state==='windup', run=Math.abs(e.vx)>0.5;
  ctx.rotate(run?0.25:0);
  ctx.fillStyle=F(c.body); ctx.beginPath(); ctx.roundRect(-8,-30,16,26,4); ctx.fill();
  ctx.fillStyle=F(c.band); ctx.fillRect(-8,-22,16,4); ctx.fillRect(-8,-12,16,3);
  ctx.fillStyle=F('#ffd23f'); tri(-8,-30,0,-40,8,-30);
  ctx.strokeStyle='#5a3a1a'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(0,-4); ctx.lineTo(-6,4); ctx.stroke();
  ctx.fillStyle='#1b1b2e'; circle(3,-25,2); circle(-3,-25,2);
  if (wind||run){ ctx.fillStyle=(clock>>1)%2?'#fff3c4':'#ffb347'; circle(-6,4,4+(wind?Math.random()*3:0)); }
  ctx.restore();
  if (wind && (e.anim>>1)%2) txt('!',sx,e.y-e.h-14,20,'#ff4040');
  foeBars(e,T,sx);
}
// Boitatá: a fire serpent rearing up like a cobra, its glowing body winding along the ground behind it
function drawSerpent(e,T,c,F,sx){
  if (e.hidden) return;
  ctx.save();
  if (e.state==='dying') ctx.globalAlpha=Math.max(0,1-e.t/45);
  const f=e.face, rage=WIND.includes(e.state)||e.state==='charge', segs=16;
  const pts=[];
  for (let i=0;i<segs;i++){
    const rise=Math.max(0,4-i)/4;                  // the first segments lift into a neck
    const x=sx-f*(i*22-10*rise), wave=Math.sin(e.anim*0.18-i*0.7)*(6+i*0.4);
    const y=e.y-18-rise*rise*84+(1-rise)*wave;
    pts.push([x,y,28-i*1.1]);
  }
  for (let i=segs-1;i>=1;i--){
    const [x,y,r]=pts[i];
    const g=ctx.createRadialGradient(x,y,1,x,y,r*1.5); g.addColorStop(0,F('#fff3c4')); g.addColorStop(0.45,F(c.glow)); g.addColorStop(1,'rgba(255,90,31,0)');
    ctx.fillStyle=g; circle(x,y,r*1.5);
    ctx.fillStyle=F(c.body); circle(x,y,r*0.72);
    ctx.fillStyle=F('#ffd36b'); tri(x-5,y-r*0.6,x,y-r*0.6-10-Math.sin(clock*0.3+i)*4,x+5,y-r*0.6);
  }
  const [hx,hy]=pts[0];
  ctx.translate(hx,hy); ctx.scale(f,1);
  const g=ctx.createRadialGradient(0,0,4,0,0,70); g.addColorStop(0,'rgba(255,240,180,0.85)'); g.addColorStop(1,'rgba(255,90,31,0)'); ctx.fillStyle=g; circle(0,0,70);
  ctx.fillStyle=F(c.body); ctx.beginPath(); ctx.ellipse(8,0,40,26,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle=F('#ff8a3d'); ctx.beginPath(); ctx.ellipse(30,10,24,12,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle=rage?'#ffffff':'#fff3c4'; ctx.beginPath(); ctx.ellipse(20,-9,11,8,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle=rage?'#ff2020':'#ff8a3d'; circle(23,-9,5);
  if (rage){ ctx.fillStyle='#fff3c4'; tri(40,14,52,10,44,20); }
  ctx.fillStyle=F('#ffd36b'); for (let k=0;k<6;k++) tri(-26+k*10,-20,-21+k*10,-40-Math.sin(clock*0.3+k)*6,-16+k*10,-20);
  ctx.restore();
  if (e.hp>0 && WIND.includes(e.state) && (e.anim>>2)%2) txt('!',sx,e.y-e.h-70,22,'#ff4040');
}
function drawMonsterShadow(e){
  const T=ENEMY_TYPES[e.type], sx=e.x-cam.x;
  if (T.look.kind==='bat' || e.state==='dying' || e.hidden) return;
  const s=T.boss?GROUND:surfaceBelow(e.x,e.y), d=clamp((s-e.y)/250,0,0.7);
  shadow(sx,s,(T.look.kind==='scorpion'?e.w*0.55:e.w*0.6)*(1-d));
}
function drawMonster(e,noShadow){
  const T=ENEMY_TYPES[e.type], c=T.look, fl=e.flash>0, F=col=>fl?'#ffffff':col, sx=e.x-cam.x;
  if (sx<-200||sx>W+200) return;
  if (EXTRA_DRAW[c.kind]) return EXTRA_DRAW[c.kind](e,T,c,F,sx);
  if (c.kind==='bat') return drawBat(e,T,c,F,sx);
  if (c.kind==='scorpion') return drawScorpion(e,T,c,F,sx,noShadow);
  if (c.kind==='puppet') return drawPuppet(e,T,c,F,sx,noShadow);
  if (c.kind==='bunny') return drawBunny(e,T,c,F,sx);
  if (c.kind==='egg') return drawEggFoe(e,T,c,F,sx);
  if (c.kind==='chicken') return drawChicken(e,T,c,F,sx);
  if (c.kind==='rocket') return drawRocketFoe(e,T,c,F,sx);
  if (c.kind==='saci') return drawSaci(e,T,c,F,sx);
  if (c.kind==='wisp') return drawWisp(e,T,c,F,sx);
  if (c.kind==='mule') return drawMule(e,T,c,F,sx);
  if (c.kind==='reindeer') return drawReindeer(e,T,c,F,sx);
  if (c.kind==='serpent') return drawSerpent(e,T,c,F,sx);
  if (!noShadow && e.state!=='dying'){ const s=T.boss?GROUND:surfaceBelow(e.x,e.y), d=clamp((s-e.y)/250,0,0.7); shadow(sx,s,e.w*0.6*(1-d)); }
  ctx.save(); ctx.translate(sx,e.y);
  if (T.boss && e.hp>0 && e.hp<e.maxHp*((T.tune&&T.tune.enrage)??0.5)){
    const gl=ctx.createRadialGradient(0,-65,10,0,-65,110), a=0.25+Math.sin(e.anim*0.15)*0.1;
    gl.addColorStop(0,`rgba(255,60,40,${a})`); gl.addColorStop(1,'rgba(255,60,40,0)'); ctx.fillStyle=gl; circle(0,-65,110);
  }
  if (e.onGround && e._air) e._land=8;
  e._air=!e.onGround; if (e._land>0) e._land--;
  const sq=e._land>0 ? e._land/8*0.14 : 0;
  ctx.scale(e.face*c.s*(1+sq*0.8),c.s*(1-sq));
  if (e.state==='dying'){ ctx.globalAlpha=Math.max(0,1-e.t/45)*(e.t%4<2?1:0.5); ctx.rotate(-Math.min(1,e.t/12)*1.2); }
  if (e.state==='teleportWind') ctx.globalAlpha=Math.max(0.05,1-e.t/16);
  if (c.cape){ ctx.fillStyle=F(c.cape); ctx.beginPath(); ctx.moveTo(-8,-32); ctx.quadraticCurveTo(-18,-18,-20+Math.sin(e.anim*0.15)*2,-2); ctx.lineTo(2,-6); ctx.closePath(); ctx.fill(); }
  const st=e.state, moving=Math.abs(e.vx)>0.3 && e.onGround;
  const ph=moving?Math.sin(e.anim*0.3):0, bob=moving?Math.abs(ph)*1.5:0;
  let lean=0; if (st==='hurt') lean=-0.25; else if (st==='charge') lean=0.3; else if (st==='strike') lean=0.12; else if (WIND.includes(st)) lean=-0.1;
  ctx.rotate(lean);
  ctx.fillStyle=F('#3b2a1e'); ctx.fillRect(-8+ph*4,-14,6,14); ctx.fillRect(2-ph*4,-14,6,14);
  ctx.translate(0,-bob);
  const ears=!c.helmet && !c.hood && !c.skull && !c.wrap && !c.crystal;
  if (ears){ ctx.fillStyle=F(c.skin); tri(-6,-46,-21,-55,-4,-38); }
  ctx.fillStyle=F(c.body); ctx.beginPath(); ctx.roundRect(-11,-34,22,22,6); ctx.fill();
  ctx.fillStyle=F(c.cloth); ctx.fillRect(-11,-17,22,6);
  if (c.skull){ ctx.strokeStyle=F('#8a8478'); ctx.lineWidth=1.5; for (let k=0;k<3;k++){ ctx.beginPath(); ctx.moveTo(-8,-30+k*5); ctx.lineTo(8,-30+k*5); ctx.stroke(); } }
  if (c.wrap){ ctx.strokeStyle=F('#a89b78'); ctx.lineWidth=2; for (let k=0;k<4;k++){ ctx.beginPath(); ctx.moveTo(-11,-31+k*5); ctx.lineTo(11,-29+k*5); ctx.stroke(); } }
  if (c.burlap){ ctx.fillStyle=F('#e9c46a'); tri(-11,-14,-14,-4,-8,-12); tri(11,-14,14,-4,8,-12); ctx.fillStyle=F('#8a5a2a'); ctx.fillRect(-4,-30,7,6); }
  ctx.fillStyle=F(c.skin); circle(3,-43,12);
  if (ears){ tri(10,-48,22,-55,12,-40); }
  if (c.wrap){ ctx.strokeStyle=F('#a89b78'); ctx.lineWidth=2; for (let k=0;k<3;k++){ ctx.beginPath(); ctx.moveTo(-9,-50+k*6); ctx.lineTo(15,-47+k*6); ctx.stroke(); } }
  if (c.plume) c.plume.forEach((col,k)=>{ ctx.fillStyle=F(col); ctx.beginPath(); ctx.ellipse(-4+k*6,-62-k%2*3,3.5,11,(k-1)*0.35,0,Math.PI*2); ctx.fill(); });
  if (c.clown){ ctx.fillStyle=F('#1b1b2e'); tri(-8,-52,4,-76,14,-52); ctx.fillStyle=F('#ff4fd8'); circle(4,-77,3.5); ctx.fillStyle=F('#1b1b2e'); circle(-6,-30,2); circle(-6,-24,2); }
  if (c.crystal){ ctx.fillStyle=F(c.crystal); tri(-6,-52,-2,-68,2,-52); tri(2,-54,8,-72,12,-53); tri(-12,-34,-16,-50,-6,-36); ctx.fillStyle='rgba(255,255,255,0.6)'; tri(4,-56,8,-70,9,-56); }
  if (c.hood){ ctx.fillStyle=F(c.hood); ctx.beginPath(); ctx.arc(2,-44,14,Math.PI*0.8,Math.PI*1.95); ctx.lineTo(-15,-32); ctx.closePath(); ctx.fill(); }
  if (c.helmet){
    ctx.fillStyle=F(c.closed?c.body:'#6e6e7a'); ctx.beginPath(); ctx.arc(3,-46,13.5,Math.PI,0); ctx.fill(); ctx.fillRect(-11,-47,28,4);
    if (c.closed){ ctx.beginPath(); ctx.arc(3,-43,13,0,Math.PI); ctx.fill(); ctx.fillStyle='#000'; ctx.fillRect(2,-46,12,3); }
    ctx.fillStyle=F('#efe6cf'); tri(-7,-53,-17,-68,-1,-56); tri(12,-53,21,-68,7,-56);
  }
  const eyeC=(WIND.includes(st)||st==='charge')?'#ff2020':c.eye;
  if (c.skull){ ctx.fillStyle='#1d1d1d'; circle(9,-44,3.4); circle(1,-44,3); ctx.fillStyle=eyeC; circle(9,-44,1.6); ctx.fillStyle='#1d1d1d'; ctx.fillRect(2,-37,10,2); }
  else { ctx.fillStyle=eyeC; circle(9,-44,2.4); }
  if (c.wolf){ ctx.fillStyle=F(c.skin); tri(-6,-50,-2,-64,4,-52); tri(4,-52,10,-66,13,-51); ctx.beginPath(); ctx.ellipse(14,-40,9,5.5,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#1b1b2e'; circle(22,-41,2); ctx.fillStyle='#ffffff'; tri(14,-36,16,-32,18,-36); }
  if (c.burlap){ ctx.strokeStyle='#5a3a1a'; ctx.lineWidth=1.3; ctx.beginPath(); ctx.moveTo(3,-37); ctx.lineTo(13,-37); for (let k=4;k<13;k+=3){ ctx.moveTo(k,-39); ctx.lineTo(k,-35); } ctx.stroke(); }
  if (c.straw){ ctx.fillStyle=F('#e9c46a'); ctx.beginPath(); ctx.ellipse(3,-52,20,4.5,0,0,Math.PI*2); ctx.fill(); ctx.beginPath(); ctx.ellipse(3,-57,10,7,0,Math.PI,0); ctx.fill();
    ctx.fillStyle=F('#b5452f'); ctx.fillRect(-7,-55,20,3); }
  if (c.sack){ ctx.fillStyle=F(c.sack); ctx.beginPath(); ctx.ellipse(-16,-30,13,17,-0.2,0,Math.PI*2); ctx.fill(); ctx.fillStyle=F('#5a4430'); ctx.fillRect(-20,-48,8,5);
    ctx.fillStyle=F('#ffd23f'); ctx.fillRect(-24,-36,6,6); ctx.fillStyle=F('#2a9d8f'); ctx.fillRect(-14,-26,5,5); }
  if (c.beanie){ ctx.fillStyle=F(c.beanie); ctx.beginPath(); ctx.arc(3,-48,12.5,Math.PI,0); ctx.fill(); ctx.fillStyle=F('#ffffff'); ctx.fillRect(-10,-49,26,4); circle(3,-61,3.5); }
  if (c.elf){ ctx.fillStyle=F(c.skin); tri(-6,-46,-14,-54,-4,-40); ctx.fillStyle=F(c.body); ctx.beginPath(); ctx.moveTo(-9,-50); ctx.quadraticCurveTo(0,-74,-14,-80); ctx.lineTo(15,-50); ctx.closePath(); ctx.fill();
    ctx.fillStyle=F('#ffd23f'); circle(-14,-80,3); }
  if (c.shako){ ctx.fillStyle=F('#1b1b2e'); ctx.fillRect(-7,-72,20,20); ctx.fillStyle=F('#ffd23f'); ctx.fillRect(-7,-56,20,3); circle(3,-66,2.5); }
  if (c.mask){ ctx.fillStyle=F(c.mask); ctx.beginPath(); ctx.roundRect(-3,-48,20,7,3); ctx.fill(); ctx.fillStyle='#1b1b2e'; circle(9,-44.5,2.2); }
  if (c.clown){ ctx.fillStyle='#1b1b2e'; ctx.fillRect(8,-41,1.5,5); ctx.fillStyle='#e84a8a'; circle(12,-38,1.6); }
  if (!c.skull && !c.closed){ ctx.strokeStyle=F('#1d1d1d'); ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(4,-49); ctx.lineTo(12,-46.5); ctx.stroke(); }
  if (c.tusk){ ctx.fillStyle=F('#fff8e1'); tri(8,-35,10,-41,12,-35); }
  let ang=-0.4+ph*0.2;
  if (WIND.includes(st)) ang = st==='chargeWind' ? 0.3 : -2.4+Math.sin(e.anim*0.8)*0.08;
  else if (st==='strike') ang=0.9; else if (st==='recover') ang=1.1; else if (st==='hurt') ang=-1.4;
  else if (st==='charge') ang=0.3; else if (st==='roar') ang=-2.8; else if (st==='leap') ang=-2.6;
  if (c.weapon==='bow'){
    const pull = st==='aim' ? Math.min(1,e.t/25)*8 : 0;
    ctx.fillStyle=F(c.skin); ctx.fillRect(2,-30,10,5);
    ctx.strokeStyle=F('#8d5a2b'); ctx.lineWidth=2.5; ctx.beginPath(); ctx.arc(8,-28,15,-1.2,1.2); ctx.stroke();
    const ex=8+15*Math.cos(1.2), ey=15*Math.sin(1.2);
    ctx.strokeStyle='#e8e8e8'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(ex,-28-ey); ctx.lineTo(ex-pull,-28); ctx.lineTo(ex,-28+ey); ctx.stroke();
    if (st==='aim'){ ctx.strokeStyle='#c8a165'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(ex-pull,-28); ctx.lineTo(ex-pull+24,-28); ctx.stroke(); ctx.fillStyle='#ccc'; tri(ex-pull+24,-31,ex-pull+30,-28,ex-pull+24,-25); }
  } else {
    ctx.save(); ctx.translate(4,-28); ctx.rotate(ang);
    ctx.fillStyle=F(c.skin); ctx.fillRect(0,-2.5,11,5);
    if (c.weapon==='dagger'){ ctx.fillStyle=F('#5d4037'); ctx.fillRect(9,-2,5,4); ctx.fillStyle=F('#cfd8dc'); tri(14,-3,28,0,14,3); }
    else if (c.weapon==='club'){ ctx.fillStyle=F('#6d4c41'); ctx.beginPath(); ctx.moveTo(8,-2.5); ctx.lineTo(32,-5.5); ctx.lineTo(32,5.5); ctx.lineTo(8,2.5); ctx.closePath(); ctx.fill();
      ctx.fillStyle=F('#bdbdbd'); tri(22,-4.5,25,-9,28,-5); tri(22,4.5,25,9,28,5); }
    else if (c.weapon==='axe' && e.state!=='axeWait'){ ctx.fillStyle=F('#b0bec5'); ctx.beginPath(); ctx.ellipse(36,0,8,15,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle=F('#5d4037'); ctx.fillRect(6,-1.8,36,3.6); ctx.fillStyle=F('#eceff1'); ctx.fillRect(41,-12,2,24); }
    else if (c.weapon==='pick'){ ctx.fillStyle=F('#6d4c41'); ctx.fillRect(8,-1.5,22,3); ctx.fillStyle=F('#b0bec5'); ctx.beginPath(); ctx.moveTo(26,-10); ctx.quadraticCurveTo(34,0,26,10); ctx.lineTo(30,0); ctx.closePath(); ctx.fill(); }
    else if (c.weapon==='staff'){ ctx.fillStyle=F('#5d4037'); ctx.fillRect(-6,-1.5,40,3); const g=ctx.createRadialGradient(36,0,1,36,0,9); g.addColorStop(0,'#fff'); g.addColorStop(1,c.orb||'#7ff0ff'); ctx.fillStyle=g; circle(36,0,5); }
    else if (c.weapon==='sword'){ ctx.fillStyle=F('#5d4037'); ctx.fillRect(8,-2,6,4); ctx.fillStyle=F('#d7dbe0'); ctx.beginPath(); ctx.moveTo(14,-3); ctx.lineTo(36,-2); ctx.lineTo(40,0); ctx.lineTo(36,2); ctx.lineTo(14,3); ctx.closePath(); ctx.fill(); }
    else if (c.weapon==='greatsword'){ ctx.fillStyle=F('#3a2a3f'); ctx.fillRect(6,-2.5,8,5); ctx.fillStyle=F('#ff5cf0'); ctx.fillRect(13,-6,3,12);
      ctx.fillStyle=F('#2b2236'); ctx.beginPath(); ctx.moveTo(16,-4); ctx.lineTo(50,-3); ctx.lineTo(56,0); ctx.lineTo(50,3); ctx.lineTo(16,4); ctx.closePath(); ctx.fill();
      ctx.strokeStyle=fl?'#fff':'rgba(255,92,240,0.8)'; ctx.lineWidth=1.2; ctx.beginPath(); ctx.moveTo(18,0); ctx.lineTo(50,0); ctx.stroke(); }
    else if (c.weapon==='fist'){ ctx.fillStyle=F(c.skin); circle(13,0,4.5); }
    else if (c.weapon==='cane'){ ctx.strokeStyle=F('#ffffff'); ctx.lineWidth=4; ctx.lineCap='round'; ctx.beginPath(); ctx.moveTo(4,0); ctx.lineTo(30,0); ctx.arc(30,-6,6,Math.PI/2,-Math.PI/2,true); ctx.stroke();
      ctx.strokeStyle=F('#e63946'); ctx.lineWidth=4; ctx.setLineDash([3,4]); ctx.beginPath(); ctx.moveTo(4,0); ctx.lineTo(30,0); ctx.stroke(); ctx.setLineDash([]); }
    else if (c.weapon==='musket'){ ctx.fillStyle=F('#6d4c41'); ctx.fillRect(-6,-2,26,4); ctx.fillStyle=F('#9aa0ad'); ctx.fillRect(18,-1.5,18,3); }
    else if (c.weapon==='claw'){ ctx.fillStyle=F(c.skin); circle(13,0,5); ctx.fillStyle=F('#e9e4d8'); for (const o of [-4,0,4]) tri(15,o-1,23,o,15,o+1.5); }
    else if (c.weapon==='fork'){ ctx.fillStyle=F('#7a5230'); ctx.fillRect(-4,-1.5,40,3); ctx.fillStyle=F('#b0b8c0');
      ctx.fillRect(34,-7,3,14); for (const o of [-6,0,6]) ctx.fillRect(36,o-1,9,2); }
    else if (c.weapon==='tambourine'){ ctx.strokeStyle=F('#c9a227'); ctx.lineWidth=2.5; ctx.beginPath(); ctx.arc(18,0,8,0,Math.PI*2); ctx.stroke();
      ctx.fillStyle=F('#f5f0e6'); circle(18,0,6); ctx.fillStyle=F('#d9d9d9'); for (let k=0;k<4;k++){ const a=k*Math.PI/2; circle(18+Math.cos(a)*8,Math.sin(a)*8,1.8); } }
    ctx.restore();
  }
  ctx.restore();
  if (e.hp>0 && WIND.includes(st) && (e.anim>>2)%2) txt('!',sx,e.y-e.h-18,22,'#ff4040');
  if (!T.boss && e.hp>0 && e.hp<e.maxHp){
    ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(sx-20,e.y-e.h-10,40,5);
    ctx.fillStyle='#ff4d5e'; ctx.fillRect(sx-20,e.y-e.h-10,40*e.hp/e.maxHp,5);
  }
}
