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
};
const WIND = ['windup','slamWind','leapWind','chargeWind'];
let boss = null;

function spawnEnemy(type,x,y=-40-rand(0,120),id){
  const T=ENEMY_TYPES[type];
  const e={isEnemy:true,type,x,y,vx:0,vy:0,w:T.w,h:T.h,hp:T.hp,maxHp:T.hp,speed:T.speed*rand(0.85,1.15),dmg:T.dmg,
    face:-1,state:'walk',t:0,cd:rand(50,110),flash:0,id:id||('e'+nextId++),anim:rand(0,100),onGround:false,dead:false};
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
  if (T.boss) onBossDefeated(e);
  else {
    SFX.die();
    if (Math.random()<0.22) dropItem(e.x,e.y-20,Math.random()<0.6?'hp':'mp');
  }
}
function stunEnemy(e){
  if (e.hp<=0) return;
  if (ENEMY_TYPES[e.type].boss){ e.state='recover'; e.t=-30; e.vx=0; }
  else { e.state='hurt'; e.t=45; e.vx=0; }
  e.flash=8; addText(e.x,e.y-e.h-24,'ATORDOADO!','#ffd23f',false);
}
function dropItem(x,y,type,vy=-6){ items.push({x,y,vx:0,vy,type,t:0,onGround:false,id:'i'+nextId++}); }

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
      addEnemyProj({type:'arrow',x:e.x+e.face*18,y:sy,vx:e.face*8,vy,life:120,dmg:e.dmg});
      SFX.shoot();
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
        const near=adx<200, m=T.moves, r=Math.random();
        let mv = near ? (r<0.7?'slam':'leap') : (r<0.55?'charge':'leap');
        if (!m.includes(mv)) mv=pick(m);
        e.state=mv+'Wind'; e.t=0;
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
    if (e.t<=0 && e.onGround){ e.state='walk'; e.cd=Math.max(e.cd,30); }
  } else {
    const dx=tg.x-e.x, adx=Math.abs(dx);
    if (T.ai==='archer') archerAI(e,tg,dx,adx);
    else if (T.ai==='boss') bossAI(e,tg,dx,adx);
    else meleeAI(e,tg,dx,adx);
  }
  physics(e,!!T.boss);
  const [l,r]=bounds(); e.x=clamp(e.x,l+e.w/2,r-e.w/2);
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
function drawMonster(e){
  const T=ENEMY_TYPES[e.type], c=T.look, fl=e.flash>0, F=col=>fl?'#ffffff':col, sx=e.x-cam.x;
  if (sx<-150||sx>W+150) return;
  if (e.state!=='dying'){ const s=T.boss?GROUND:surfaceBelow(e.x,e.y), d=clamp((s-e.y)/250,0,0.7); shadow(sx,s,e.w*0.6*(1-d)); }
  ctx.save(); ctx.translate(sx,e.y);
  if (T.boss && e.hp>0 && e.hp<e.maxHp*0.5){
    const gl=ctx.createRadialGradient(0,-65,10,0,-65,110), a=0.25+Math.sin(e.anim*0.15)*0.1;
    gl.addColorStop(0,`rgba(255,60,40,${a})`); gl.addColorStop(1,'rgba(255,60,40,0)'); ctx.fillStyle=gl; circle(0,-65,110);
  }
  ctx.scale(e.face*c.s,c.s);
  if (e.state==='dying'){ ctx.globalAlpha=Math.max(0,1-e.t/45)*(e.t%4<2?1:0.5); ctx.rotate(-Math.min(1,e.t/12)*1.2); }
  const st=e.state, moving=Math.abs(e.vx)>0.3 && e.onGround;
  const ph=moving?Math.sin(e.anim*0.3):0, bob=moving?Math.abs(ph)*1.5:0;
  let lean=0; if (st==='hurt') lean=-0.25; else if (st==='charge') lean=0.3; else if (st==='strike') lean=0.12; else if (WIND.includes(st)) lean=-0.1;
  ctx.rotate(lean);
  ctx.fillStyle=F('#3b2a1e'); ctx.fillRect(-8+ph*4,-14,6,14); ctx.fillRect(2-ph*4,-14,6,14);
  ctx.translate(0,-bob);
  if (!c.helmet && !c.hood){ ctx.fillStyle=F(c.skin); tri(-6,-46,-21,-55,-4,-38); }
  ctx.fillStyle=F(c.body); ctx.beginPath(); ctx.roundRect(-11,-34,22,22,6); ctx.fill();
  ctx.fillStyle=F(c.cloth); ctx.fillRect(-11,-17,22,6);
  ctx.fillStyle=F(c.skin); circle(3,-43,12);
  if (!c.helmet && !c.hood){ tri(10,-48,22,-55,12,-40); }
  if (c.hood){ ctx.fillStyle=F(c.hood); ctx.beginPath(); ctx.arc(2,-44,14,Math.PI*0.8,Math.PI*1.95); ctx.lineTo(-15,-32); ctx.closePath(); ctx.fill(); }
  if (c.helmet){
    ctx.fillStyle=F('#6e6e7a'); ctx.beginPath(); ctx.arc(3,-46,13.5,Math.PI,0); ctx.fill(); ctx.fillRect(-11,-47,28,4);
    ctx.fillStyle=F('#efe6cf'); tri(-7,-53,-17,-68,-1,-56); tri(12,-53,21,-68,7,-56);
  }
  ctx.fillStyle=(WIND.includes(st)||st==='charge')?'#ff2020':c.eye; circle(9,-44,2.4);
  ctx.strokeStyle=F('#1d1d1d'); ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(4,-49); ctx.lineTo(12,-46.5); ctx.stroke();
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
    ctx.restore();
  }
  ctx.restore();
  if (e.hp>0 && WIND.includes(st) && (e.anim>>2)%2) txt('!',sx,e.y-e.h-18,22,'#ff4040');
  if (!T.boss && e.hp>0 && e.hp<e.maxHp){
    ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(sx-20,e.y-e.h-10,40,5);
    ctx.fillStyle='#ff4d5e'; ctx.fillRect(sx-20,e.y-e.h-10,40*e.hp/e.maxHp,5);
  }
}
