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
  gorgo: {hp:1800,w:84, h:130, speed:1.7,  dmg:55, ai:'boss', boss:true, score:3000, name:'Gorgo, o Rei Orc',
    moves:['slam','charge','leap'], summon:['goblin','goblin','archer'],
    look:{s:2.4, skin:'#6b8f62',body:'#4a4a58',cloth:'#7b1f1f',eye:'#ff2a2a',weapon:'axe',tusk:true,helmet:true}},

  // ----- Caverna de Cristal -----
  bat:   {hp:45,  w:34, h:30,  speed:2.2,  dmg:18, ai:'flyer', fly:true, score:110, look:{kind:'bat', body:'#4a3b6b', wing:'#6d5a9c', eye:'#ff4fd8'}},
  kobold:{hp:85,  w:30, h:54,  speed:1.9,  dmg:24, ai:'melee', reach:46, windup:22, score:110,
    look:{s:1.05,skin:'#7c8fb0',body:'#4b5a78',cloth:'#2f3a52',eye:'#9ff8ff',weapon:'pick'}},
  shaman:{hp:70,  w:28, h:56,  speed:1.4,  dmg:20, ai:'archer', shot:'eorb', score:140,
    look:{s:1,   skin:'#8aa0c8',body:'#2e4a7a',cloth:'#1d2f52',eye:'#7ff0ff',weapon:'staff',hood:'#21436e',orb:'#7ff0ff'}},
  golem: {hp:2300,w:96, h:140, speed:1.3,  dmg:58, ai:'boss', boss:true, score:3500, name:'Golem de Cristal',
    moves:['slam','leap','rocks','spikes'], summon:['kobold','kobold','shaman'],
    look:{s:2.6, skin:'#8a8f9c',body:'#6b7080',cloth:'#4d5260',eye:'#7ff0ff',weapon:'fist',crystal:'#7ff0ff'}},

  // ----- Deserto Escaldante -----
  scorpion:{hp:80, w:48, h:34,  speed:2.3,  dmg:24, ai:'melee', reach:50, windup:20, score:120, look:{kind:'scorpion', s:1, body:'#c58b3c', dark:'#8a5a22', eye:'#2a1a0a'}},
  mummy: {hp:190, w:34, h:58,  speed:0.95, dmg:36, ai:'melee', reach:46, windup:30, score:220,
    look:{s:1.1, skin:'#d9cfb0',body:'#cfc4a2',cloth:'#a89b78',eye:'#66ff66',weapon:'fist',wrap:true}},
  nomad: {hp:65,  w:28, h:56,  speed:1.6,  dmg:20, ai:'archer', score:130,
    look:{s:1,   skin:'#c8956b',body:'#b5803e',cloth:'#7a4f22',eye:'#2a1a0a',weapon:'bow',hood:'#d9b26a'}},
  scorpking:{hp:2600,w:120,h:90, speed:1.9,  dmg:56, ai:'boss', boss:true, score:4000, name:'Rei Escorpião',
    moves:['charge','leap','spit','slam'], summon:['scorpion','scorpion','nomad'],
    look:{kind:'scorpion', s:3.2, body:'#b8862f', dark:'#6e4a14', eye:'#ff3030', crown:true}},

  // ----- Castelo Sombrio -----
  skeleton:{hp:80, w:30, h:58,  speed:1.9,  dmg:26, ai:'melee', reach:52, windup:22, score:130,
    look:{s:1.05,skin:'#e8e4d8',body:'#cfc9b8',cloth:'#3a3440',eye:'#ff4040',weapon:'sword',skull:true}},
  darkmage:{hp:75, w:28, h:58,  speed:1.4,  dmg:24, ai:'archer', shot:'eorb', score:160,
    look:{s:1,   skin:'#b9a8c9',body:'#2a1d3d',cloth:'#160f22',eye:'#ff5cf0',weapon:'staff',hood:'#2a1d3d',orb:'#ff5cf0'}},
  blackknight:{hp:240,w:46,h:82, speed:1.15, dmg:44, ai:'melee', reach:66, windup:32, score:300,
    look:{s:1.5, skin:'#3a3f4d',body:'#2b2f3a',cloth:'#5b0f1f',eye:'#ff3030',weapon:'sword',helmet:true,closed:true}},
  darklord:{hp:3000,w:80, h:132, speed:2.0, dmg:60, ai:'boss', boss:true, score:5000, name:'Lorde Sombrio',
    moves:['charge','wave','teleport','slam'], summon:['skeleton','skeleton','darkmage'],
    look:{s:2.3, skin:'#4a3f5c',body:'#1f1a2b',cloth:'#6a0f2a',eye:'#ff2a6a',weapon:'greatsword',helmet:true,closed:true,cape:'#4a0f22'}},
};
const WIND = ['windup','slamWind','leapWind','chargeWind','rocksWind','spikesWind','spitWind','waveWind','teleportWind','slashWind'];
const NEAR_MOVES = ['slam','spikes','teleport','leap'], FAR_MOVES = ['charge','leap','rocks','spit','wave','teleport','spikes'];
let boss = null;

function spawnEnemy(type,x,y=-40-rand(0,120),id){
  const T=ENEMY_TYPES[type];
  const e={isEnemy:true,type,x,y,vx:0,vy:0,w:T.w,h:T.h,hp:T.hp,maxHp:T.hp,speed:T.speed*rand(0.85,1.15),dmg:T.dmg,
    face:-1,state:'walk',t:0,cd:rand(50,110),flash:0,id:id||('e'+nextId++),anim:rand(0,100),onGround:false,dead:false};
  if (players.length>1 && !id){ e.hp=e.maxHp=Math.round(T.hp*(T.boss?1.6:1.5)); } // tougher in co-op
  if (T.boss){ e.cd=120; e.dispHp=e.hp; boss=e; }
  enemies.push(e);
  return e;
}

// Authoritative damage (single player or co-op host)
function damageEnemy(e,dmg,dir,kb,up,crit,src){
  if (e.hp<=0) return;
  e.hp-=dmg; e.flash=6;
  addText(e.x,e.y-e.h-8,crit?dmg+'!':dmg,crit?'#ffd23f':'#ffffff',crit);
  burst(e.x-dir*e.w*0.2,e.y-e.h*0.55,crit?'#ffd23f':'#fff3c4',crit?14:8,6);
  SFX.hit(crit);
  if (ENEMY_TYPES[e.type].boss){
    if (e.state==='walk'||e.state==='recover') e.vx=dir*1.2;
  } else {
    e.state='hurt'; e.t=up?28:16; e.vx=dir*kb;
    if (up) e.vy=up; else if (!e.onGround) e.vy=Math.min(e.vy,-3);
  }
  if (e.hp<=0) killEnemy(e,dir);
}
function killEnemy(e,dir){
  const T=ENEMY_TYPES[e.type];
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
    if (Math.random()<0.22) dropItem(e.x,e.y-20,Math.random()<0.6?'hp':'mp');
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
    if (p.x+p.w/2>x1 && p.x-p.w/2<x2 && p.y>y1 && p.y-p.h<y2) hurtPlayer(p,{dmg,dir:dir??(p.x>e.x?1:-1),fromX:e.x,srcId:e.id});
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
      if (ENEMY_TYPES[e.type].shot==='eorb'){ addEnemyProj({type:'eorb',x:e.x+e.face*22,y:sy-6,vx:e.face*4.5,vy:vy*0.5,life:170,dmg:e.dmg,home:true,col:ENEMY_TYPES[e.type].look.orb}); SFX.zap(); }
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
  for (const d of [-1,1]) addEnemyProj({type:'shock',x:e.x+d*70,y:e.y,vx:d*7.5,vy:0,life:75,dmg:30});
}
function bossAI(e,tg,dx,adx){
  const T=ENEMY_TYPES[e.type], enr=e.hp<e.maxHp*0.5, spd=enr?1.3:1;
  if (e.wasAir && e.onGround && e.state!=='leap'){ addShake(12); SFX.thud(); dust(e.x,e.y,16); }
  e.wasAir=!e.onGround;
  if (e.state==='walk'){
    if (!e.summon1 && e.hp<e.maxHp*0.6){ e.summon1=true; e.state='roar'; e.t=0; }
    else if (!e.summon2 && e.hp<e.maxHp*0.3){ e.summon2=true; e.state='roar'; e.t=0; }
  }
  switch (e.state){
    case 'walk': {
      e.face=dx>0?1:-1;
      e.vx = adx>110 ? e.face*e.speed*spd : e.vx*0.8;
      if (e.cd<=0 && e.onGround){
        const near=adx<200, pool=T.moves.filter(m=>(near?NEAR_MOVES:FAR_MOVES).includes(m));
        e.state=pick(pool.length?pool:T.moves)+'Wind'; e.t=0;
      }
      break;
    }
    case 'slamWind':
      e.vx*=0.8; e.t++; if (e.t>=(enr?32:44)) doSlam(e);
      break;
    case 'chargeWind':
      e.vx*=0.8; e.t++; if (e.t<20) e.face=dx>0?1:-1;
      if (e.t%6===0) dust(e.x-e.face*30,e.y,2);
      if (e.t>=40){ e.state='charge'; e.t=0; e.hitIds=new Set(); SFX.roar(); }
      break;
    case 'charge': {
      e.t++; e.vx=e.face*(enr?12:10);
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
      if (e.t>=24){ e.state='leap'; e.t=0; e.vy=-15; e.vx=clamp(dx/50,-9,9); SFX.jump(); }
      break;
    case 'leap':
      e.t++; if (e.onGround && e.t>5) doSlam(e);
      break;
    case 'recover':
      e.vx*=0.85; e.t++; if (e.t>=(enr?35:55)){ e.state='walk'; e.cd=rand(40,90)/spd; }
      break;
    case 'rocksWind':
      e.vx*=0.8; e.t++; e.face=dx>0?1:-1;
      if (e.t>=(enr?24:32)){
        for (let k=0;k<(enr?4:3);k++){
          const tgx=tg.x+rand(-90,90), flight=44+k*6;
          addEnemyProj({type:'boulder',x:e.x+e.face*40,y:e.y-e.h*0.8,vx:(tgx-e.x)/flight,vy:-12+k*0.5,grav:0.5,life:160,dmg:32,r:22});
        }
        SFX.thud(); e.state='recover'; e.t=10;
      }
      break;
    case 'spikesWind':
      e.vx*=0.8; e.t++;
      if (e.t===12) for (const p of alivePlayers()) addEnemyProj({type:'spike',x:p.x,y:surfaceBelow(p.x,p.y),vx:0,vy:0,life:64,dmg:36});
      if (e.t>=24){ e.state='recover'; e.t=0; SFX.freeze(); }
      break;
    case 'spitWind':
      e.vx*=0.8; e.t++; e.face=dx>0?1:-1;
      if (e.t>=(enr?20:28)){
        for (let k=-1;k<=1;k++) addEnemyProj({type:'glob',x:e.x+e.face*50,y:e.y-e.h*0.7,vx:clamp(dx/40,-9,9)+k*1.6,vy:-9-Math.abs(k),grav:0.45,life:150,dmg:24,r:16});
        SFX.blast(); e.state='recover'; e.t=15;
      }
      break;
    case 'waveWind':
      e.vx*=0.8; e.t++; e.face=dx>0?1:-1;
      if (e.t>=(enr?22:30)){
        addEnemyProj({type:'swave',x:e.x+e.face*60,y:e.y,vx:e.face*9.5,vy:0,life:95,dmg:38});
        if (enr) addEnemyProj({type:'swave',x:e.x-e.face*60,y:e.y,vx:-e.face*9.5,vy:0,life:95,dmg:38});
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
      if (e.t>=(enr?12:18)){
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
  }
}
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
    if (T.ai==='archer') archerAI(e,tg,dx,adx);
    else if (T.ai==='boss') bossAI(e,tg,dx,adx);
    else if (T.ai==='flyer') flyerAI(e,tg,dx,adx);
    else meleeAI(e,tg,dx,adx);
  }
  if (T.fly){ if (e.state==='hurt') e.vy*=0.9; e.x+=e.vx; e.y=clamp(e.y+e.vy,60,GROUND-6); e.onGround=false; }
  else physics(e,!!T.boss);
  const [l,r]=bounds(); e.x=clamp(e.x,l+e.w/2,r-e.w/2);
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
      if (!e.hitIds.has(p.id) && Math.abs(p.x-e.x)<28 && e.y>p.y-p.h && e.y-e.h<p.y){ e.hitIds.add(p.id); hurtPlayer(p,{dmg:e.dmg,dir:Math.sign(e.vx)||1,fromX:e.x,srcId:e.id}); }
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
      if (!ENEMY_TYPES[a.type].boss) a.x-=push;
      if (!ENEMY_TYPES[b.type].boss) b.x+=push;
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
function drawScorpion(e,T,c,F,sx){
  const boss=!!T.boss, s=c.s;
  if (e.state!=='dying') shadow(sx,boss?GROUND:surfaceBelow(e.x,e.y),e.w*0.55);
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
function drawMonster(e){
  const T=ENEMY_TYPES[e.type], c=T.look, fl=e.flash>0, F=col=>fl?'#ffffff':col, sx=e.x-cam.x;
  if (sx<-200||sx>W+200) return;
  if (c.kind==='bat') return drawBat(e,T,c,F,sx);
  if (c.kind==='scorpion') return drawScorpion(e,T,c,F,sx);
  if (e.state!=='dying'){ const s=T.boss?GROUND:surfaceBelow(e.x,e.y), d=clamp((s-e.y)/250,0,0.7); shadow(sx,s,e.w*0.6*(1-d)); }
  ctx.save(); ctx.translate(sx,e.y);
  if (T.boss && e.hp>0 && e.hp<e.maxHp*0.5){
    const gl=ctx.createRadialGradient(0,-65,10,0,-65,110), a=0.25+Math.sin(e.anim*0.15)*0.1;
    gl.addColorStop(0,`rgba(255,60,40,${a})`); gl.addColorStop(1,'rgba(255,60,40,0)'); ctx.fillStyle=gl; circle(0,-65,110);
  }
  ctx.scale(e.face*c.s,c.s);
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
  ctx.fillStyle=F(c.skin); circle(3,-43,12);
  if (ears){ tri(10,-48,22,-55,12,-40); }
  if (c.wrap){ ctx.strokeStyle=F('#a89b78'); ctx.lineWidth=2; for (let k=0;k<3;k++){ ctx.beginPath(); ctx.moveTo(-9,-50+k*6); ctx.lineTo(15,-47+k*6); ctx.stroke(); } }
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
    else if (c.weapon==='axe'){ ctx.fillStyle=F('#b0bec5'); ctx.beginPath(); ctx.ellipse(36,0,8,15,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle=F('#5d4037'); ctx.fillRect(6,-1.8,36,3.6); ctx.fillStyle=F('#eceff1'); ctx.fillRect(41,-12,2,24); }
    else if (c.weapon==='pick'){ ctx.fillStyle=F('#6d4c41'); ctx.fillRect(8,-1.5,22,3); ctx.fillStyle=F('#b0bec5'); ctx.beginPath(); ctx.moveTo(26,-10); ctx.quadraticCurveTo(34,0,26,10); ctx.lineTo(30,0); ctx.closePath(); ctx.fill(); }
    else if (c.weapon==='staff'){ ctx.fillStyle=F('#5d4037'); ctx.fillRect(-6,-1.5,40,3); const g=ctx.createRadialGradient(36,0,1,36,0,9); g.addColorStop(0,'#fff'); g.addColorStop(1,c.orb||'#7ff0ff'); ctx.fillStyle=g; circle(36,0,5); }
    else if (c.weapon==='sword'){ ctx.fillStyle=F('#5d4037'); ctx.fillRect(8,-2,6,4); ctx.fillStyle=F('#d7dbe0'); ctx.beginPath(); ctx.moveTo(14,-3); ctx.lineTo(36,-2); ctx.lineTo(40,0); ctx.lineTo(36,2); ctx.lineTo(14,3); ctx.closePath(); ctx.fill(); }
    else if (c.weapon==='greatsword'){ ctx.fillStyle=F('#3a2a3f'); ctx.fillRect(6,-2.5,8,5); ctx.fillStyle=F('#ff5cf0'); ctx.fillRect(13,-6,3,12);
      ctx.fillStyle=F('#2b2236'); ctx.beginPath(); ctx.moveTo(16,-4); ctx.lineTo(50,-3); ctx.lineTo(56,0); ctx.lineTo(50,3); ctx.lineTo(16,4); ctx.closePath(); ctx.fill();
      ctx.strokeStyle=fl?'#fff':'rgba(255,92,240,0.8)'; ctx.lineWidth=1.2; ctx.beginPath(); ctx.moveTo(18,0); ctx.lineTo(50,0); ctx.stroke(); }
    else if (c.weapon==='fist'){ ctx.fillStyle=F(c.skin); circle(13,0,4.5); }
    ctx.restore();
  }
  ctx.restore();
  if (e.hp>0 && WIND.includes(st) && (e.anim>>2)%2) txt('!',sx,e.y-e.h-18,22,'#ff4040');
  if (!T.boss && e.hp>0 && e.hp<e.maxHp){
    ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(sx-20,e.y-e.h-10,40,5);
    ctx.fillStyle='#ff4d5e'; ctx.fillRect(sx-20,e.y-e.h-10,40*e.hp/e.maxHp,5);
  }
}
