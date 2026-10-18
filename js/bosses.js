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
