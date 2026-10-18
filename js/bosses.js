'use strict';
// ===================== Boss mechanics =====================
// What makes each boss fight its own: extra moves (BOSS_STATES), projectiles, phases and arena changes.
// The basic moves (slam, charge, leap, …) live in enemies.js; phases are run by bossPhaseCheck (mechanics.js).
const addWind = (...names) => { for (const n of names) if (!WIND.includes(n)) WIND.push(n); };

// Crack the boss arena open: pits appear (also on the co-op guest's screen)
function openArenaPits(list){
  for (const p of list){ pits.push(p); for (let k=0;k<p.w;k+=12) parts.push({x:p.x+k,y:GROUND,vx:rand(-1,1),vy:-rand(2,6),life:40,max:40,color:'#6b5a44',size:rand(3,7),grav:0.3}); }
  addShake(16); SFX.slam();
  if (Net.mode==='coop' && Net.host) netSend({type:'fx',k:'pits',p:list});
}
FX_HANDLERS.pits = m => { for (const p of m.p) pits.push(p); addShake(16); SFX.slam(); };

// ---------- Gorgo, o Rei Orc (Bosque de Vallen) ----------
// Throws his axe like a boomerang (jump over it or guard; he is open while it flies) and, when hurt,
// smashes the arena floor so both ends become pits.
Object.assign(ENEMY_TYPES.gorgo, {
  phases:[0.5],
  movesByPhase:[['slam','charge','axe'], ['slam','charge','leap','axe']],
  onPhase(e){ const L=lockL; openArenaPits([{x:L+20,w:110},{x:L+W-130,w:110}]); bigText(e.x,e.y-e.h-30,'O CHÃO RACHOU!','#ffb347'); },
});
addWind('axeWind');
FAR_MOVES.push('axe');
BOSS_STATES.axeWind = (e,tg,dx) => {
  e.vx*=0.8; e.t++; if (e.t<24) e.face=dx>0?1:-1;
  if (e.t>=44){
    const v=11, a=0.15;
    addEnemyProj({type:'axe',x:e.x+e.face*50,y:GROUND-58,vx:e.face*v,ax:-e.face*a,vy:0,life:Math.round(2*v/a),dmg:Math.round(e.dmg*0.8),r:26});
    SFX.dash(); e.state='axeWait'; e.t=0;
  }
};
BOSS_STATES.axeWait = (e) => { // empty-handed until the axe comes back: hit him now
  e.vx*=0.8; e.t++;
  if (e.t>=Math.round(2*11/0.15)){ e.state='recover'; e.t=0; SFX.thud(); }
};
ENEMY_PROJ_HIT.axe = (pr,p) => nearBody(pr,p,pr.r);
PROJ_DRAW.axe = pr => {
  ctx.rotate(clock*0.45*(pr.vx>=0?1:-1));
  ctx.fillStyle='#5d4037'; ctx.fillRect(-4,-30,8,60);
  ctx.fillStyle='#c9ced6'; ctx.beginPath(); ctx.moveTo(4,-28); ctx.quadraticCurveTo(30,-18,26,6); ctx.lineTo(4,-6); ctx.closePath(); ctx.fill();
  ctx.beginPath(); ctx.moveTo(-4,28); ctx.quadraticCurveTo(-30,18,-26,-6); ctx.lineTo(-4,6); ctx.closePath(); ctx.fill();
};

// ---------- Golem de Cristal (Caverna de Cristal) ----------
// At 65% and 30% life it grows crystal pylons around the arena and a crystal shell: the shell blocks
// every hit until all pylons are broken, and the pylons fire crystal shards meanwhile.
ENEMY_TYPES.pilar = {hp:220, w:40, h:96, speed:0, dmg:30, ai:'pylon', anchored:true, score:200, look:{kind:'pylon', glow:'#7ff0ff'}};
ENEMY_NAMES.pilar = 'Pilar de cristal';
TRICKS.pilar = {
  ai(e,tg){
    e.vx=0; e.cd=(e.cd??rand(60,140))-1;
    if (e.cd<=0){ const sy=e.y-e.h+10, a=Math.atan2((tg.y-40)-sy,tg.x-e.x);
      addEnemyProj({type:'eorb',x:e.x,y:sy,vx:Math.cos(a)*4.5,vy:Math.sin(a)*4.5,life:160,dmg:e.dmg,col:'#7ff0ff'}); SFX.zap(); e.cd=rand(200,260); }
    return true;
  },
};
EXTRA_DRAW.pylon = (e,T,c,F,sx) => {
  const pulse=0.6+0.4*Math.sin(e.anim*0.12);
  ctx.save(); ctx.translate(sx,e.y);
  if (e.state==='dying'){ ctx.globalAlpha=Math.max(0,1-e.t/30); ctx.scale(1+e.t/30,1-e.t/45); }
  // stone pedestal with a glowing rune ring, so pylons stand out from the cave's crystals
  ctx.fillStyle='#3a3f4d'; ctx.fillRect(-24,-14,48,14); ctx.fillStyle='#4d5260'; ctx.fillRect(-28,-18,56,6);
  ctx.strokeStyle=`rgba(255,123,216,${pulse})`; ctx.lineWidth=2; ctx.beginPath(); ctx.ellipse(0,-50,24,8,0,0,Math.PI*2); ctx.stroke();
  ctx.fillStyle=F('#5fc8d8'); ctx.beginPath(); ctx.moveTo(-16,-6); ctx.lineTo(-10,-70); ctx.lineTo(0,-96); ctx.lineTo(10,-70); ctx.lineTo(16,-6); ctx.closePath(); ctx.fill();
  ctx.fillStyle=F('#bff8ff'); ctx.beginPath(); ctx.moveTo(-4,-10); ctx.lineTo(-2,-70); ctx.lineTo(0,-90); ctx.lineTo(4,-60); ctx.lineTo(3,-10); ctx.closePath(); ctx.fill();
  ctx.globalAlpha*=pulse; ctx.fillStyle='rgba(127,240,255,0.5)'; circle(0,-86,10); ctx.globalAlpha=1;
  ctx.restore();
  if (e.hp>0){ ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(sx-22,e.y-e.h-14,44,6); ctx.fillStyle='#7ff0ff'; ctx.fillRect(sx-22,e.y-e.h-14,44*e.hp/e.maxHp,6); }
  // a thin beam links each pylon to the golem it shields
  if (boss && boss.shielded && e.hp>0){ ctx.strokeStyle=`rgba(127,240,255,${0.25+0.25*pulse})`; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(sx,e.y-86); ctx.lineTo(boss.x-cam.x,boss.y-boss.h*0.6); ctx.stroke(); }
};
Object.assign(ENEMY_TYPES.golem, {
  phases:[0.65,0.3],
  movesByPhase:[['slam','leap','rocks'], ['slam','leap','rocks','spikes'], ['slam','leap','rocks','spikes']],
  onPhase(e,n){
    const L=lockL, spots = n===2 ? [L+130,L+830] : [L+130,L+480,L+830];
    for (const x of spots){ const p=spawnEnemy('pilar',x,GROUND-200); p.vy=0; ring(x,GROUND-50,'#7ff0ff',6,22,5,12); }
    e.shielded=true; bigText(e.x,e.y-e.h-30,'Quebre os pilares!','#7ff0ff');
  },
  bossTick(e){
    if (e.shielded && !enemies.some(o=>o.type==='pilar' && o.hp>0)){
      e.shielded=false; e.state='recover'; e.t=-60; e.vx=0; // stunned for a moment when the shell breaks
      burst(e.x,e.y-e.h/2,'#7ff0ff',40,9); ring(e.x,e.y-e.h/2,'#bff8ff',10,26,8,20); SFX.guardBreak(); addShake(10);
      bigText(e.x,e.y-e.h-30,'ESCUDO QUEBRADO!','#ffffff');
    }
  },
});
// the crystal shell around a shielded boss
function drawBossShell(e){
  if (!e.shielded || e.hp<=0) return;
  const sx=e.x-cam.x, a=0.25+0.12*Math.sin(clock*0.15);
  ctx.fillStyle=`rgba(127,240,255,${a})`; ctx.strokeStyle='rgba(191,248,255,0.8)'; ctx.lineWidth=3;
  ctx.beginPath(); ctx.ellipse(sx,e.y-e.h*0.5,e.w*0.85,e.h*0.62,0,0,Math.PI*2); ctx.fill(); ctx.stroke();
}

// ---------- Rei Escorpião (Deserto Escaldante) ----------
// Its spit leaves poison pools; at 60% a sandstorm blows across the arena (changing direction) over a patch
// of quicksand; at 30% it starts burrowing under the sand.
Object.assign(ENEMY_TYPES.scorpking, {
  spitPool:true,
  phases:[0.6,0.3],
  movesByPhase:[['charge','leap','spit','slam'], ['charge','leap','spit','slam'], ['charge','spit','slam','burrow']],
  onPhase(e,n){
    const L=lockL;
    if (n===2){ addHazard({type:'wind',x:L,w:W,force:1.3,period:360}); addHazard({type:'slow',kind:'sand',x:L+400,w:170}); bigText(e.x,e.y-e.h-30,'TEMPESTADE DE AREIA!','#ffd9a0'); }
    if (n===3) bigText(e.x,e.y-e.h-30,'Ele vai se enterrar!','#ffd9a0');
  },
});
