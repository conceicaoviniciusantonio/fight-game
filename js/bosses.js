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
ENEMY_TYPES.pilar = {hp:180, w:40, h:96, speed:0, dmg:30, ai:'pylon', anchored:true, score:200, look:{kind:'pylon', glow:'#7ff0ff'}};
ENEMY_NAMES.pilar = 'Pilar de cristal';
TRICKS.pilar = {
  ai(e,tg){
    e.vx=0; e.cd=(e.cd??rand(60,140))-1;
    if (e.cd<=0){ const sy=e.y-e.h+10, a=Math.atan2((tg.y-40)-sy,tg.x-e.x);
      addEnemyProj({type:'eorb',x:e.x,y:sy,vx:Math.cos(a)*4.5,vy:Math.sin(a)*4.5,life:160,dmg:e.dmg,col:'#7ff0ff'}); SFX.zap(); e.cd=rand(260,320); }
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
  if (!e.shielded || e.hp<=0 || !ENEMY_TYPES[e.type].boss) return;
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

// ---------- Lorde Sombrio (Castelo Sombrio) ----------
// At 60% two shadow copies of him join the fight (one hit each breaks them less easily than it looks);
// at 30% the torches go out, he summons fresh shadows and teleports more often.
ENEMY_TYPES.sombra = {hp:160, w:56, h:96, speed:2.0, dmg:30, ai:'melee', reach:70, windup:30, score:150,
  look:{...ENEMY_TYPES.darklord.look, s:1.65, cape:'#2a0f22', eye:'#ff9ad0', ghost:true, noOutline:true}};
ENEMY_NAMES.sombra = 'Sombra do Lorde';
TRICKS.sombra = { onKill(e){ burst(e.x,e.y-e.h/2,'#4a3f5c',24,6,0); return false; } };
function shadowCopies(e,n){
  for (let k=0;k<n;k++){ const x=clamp(e.x+(k%2?-1:1)*(200+k*90),lockL+60,lockR-60), s=spawnEnemy('sombra',x,GROUND-2); s.vy=0;
    burst(x,GROUND-50,'#4a3f5c',20,6,0); ring(x,GROUND-50,'#ff2a6a',6,20,5,10); }
  SFX.blink();
}
Object.assign(ENEMY_TYPES.darklord, {
  phases:[0.6,0.3],
  movesByPhase:[['charge','wave','teleport','slam'], ['charge','wave','teleport','slam'], ['teleport','wave','teleport','charge','slam']],
  onPhase(e,n){
    if (n===2){ shadowCopies(e,2); bigText(e.x,e.y-e.h-30,'Qual é o verdadeiro?','#ff9ad0'); }
    if (n===3){ shadowCopies(e,1); bigText(e.x,e.y-e.h-30,'AS TOCHAS SE APAGARAM!','#ff9ad0'); }
  },
});

// ---------- Bonecão Desgovernado (Carnaval) ----------
// Grabs whoever gets close and throws them across the arena; at half life the parade starts:
// floats drive through the arena from alternating sides — ride on top of them or get run over.
NEAR_MOVES.push('grab');
addWind('grabWind');
BOSS_STATES.grabWind = (e,tg,dx) => {
  e.vx*=0.8; e.t++; if (e.t<20) e.face=dx>0?1:-1;
  if (e.t===34){
    e.vx=e.face*6; SFX.strike();
    for (const p of alivePlayers()) if ((p.x-e.x)*e.face>-20 && Math.abs(p.x-e.x)<e.w/2+90 && p.y>e.y-e.h)
      { hurtPlayer(p,{dmg:Math.round(e.dmg*0.8),dir:e.face,fromX:e.x,kb:15,up:-13,srcId:e.id}); bigText(p.x,p.y-p.h-20,'ARREMESSADO!','#ffd23f'); }
  }
  if (e.t>=56){ e.state='recover'; e.t=0; }
};
function spawnParadeFloat(fromLeft){
  const w=220, f={x:fromLeft?lockL-w:lockR, y:GROUND-86, w, float:true, vx:fromLeft?4.2:-4.2, endL:lockL-w-60, endR:lockR+60};
  f.x0=f.x; platforms.push(f);
  bigText(fromLeft?lockL+120:lockR-120,GROUND-200,fromLeft?'CARRO ALEGÓRICO ▶':'◀ CARRO ALEGÓRICO','#ffd23f'); SFX.go();
  if (Net.mode==='coop' && Net.host) netSend({type:'fx',k:'float',left:fromLeft,L:lockL,R:lockR});
}
FX_HANDLERS.float = m => { const w=220, f={x:m.left?m.L-w:m.R, y:GROUND-86, w, float:true, vx:m.left?4.2:-4.2, endL:m.L-w-60, endR:m.R+60}; f.x0=f.x; platforms.push(f); SFX.go(); };
Object.assign(ENEMY_TYPES.bonecaoRei, {
  phases:[0.5],
  movesByPhase:[['spin','slam','grab','leap'], ['spin','rain','grab','leap']],
  onPhase(e){ e.floatT=60; e.floatSide=true; bigText(e.x,e.y-e.h-30,'O DESFILE COMEÇOU!','#ffd23f'); },
  bossTick(e){
    if ((e.phase||1)<2 || e.hp<=0) return;
    if (--e.floatT<=0){ spawnParadeFloat(e.floatSide); e.floatSide=!e.floatSide; e.floatT=430; }
    // floats run over whoever is on the ground in their way
    for (const f of platforms) if (f.vx) for (const p of alivePlayers())
      if (p.y>f.y+20 && p.x>f.x-10 && p.x<f.x+f.w+10) hurtPlayer(p,{dmg:Math.round(e.dmg*0.6),dir:Math.sign(f.vx),fromX:f.x+f.w/2-Math.sign(f.vx)*200,kb:10,up:-9});
  },
});

// ---------- Coelho Colossal (Páscoa) ----------
// At 60% and 25% it hides in one of three giant eggs, which shuffle around: break the right egg to knock it
// out (stunned, extra damage); a wrong egg explodes and lets bunnies out.
ENEMY_TYPES.ovoGigante = {hp:60, w:70, h:96, speed:0, dmg:40, ai:'pylon', anchored:true, score:0, look:{kind:'bigEgg'}};
ENEMY_NAMES.ovoGigante = 'Ovo gigante';
const EGG_SWAPS = 6, EGG_SWAP_T = 32;
TRICKS.ovoGigante = {
  ai(e){ e.vx=0; return true; },
  onKill(e){
    const b=enemies.find(o=>o.type==='coelhoRei' && o.hp>0);
    if (e.real && b){
      for (const o of enemies) if (o.type==='ovoGigante' && o!==e && o.hp>0){ o.hp=0; o.state='dying'; o.t=0; burst(o.x,o.y-40,'#ffe5ec',14,5); }
      b.hidden=false; b.x=e.x; b.y=GROUND; b.state='recover'; b.t=-70; b.vx=0; b.flash=10;
      damageEnemy(b,Math.round(b.maxHp*0.03),1,0,0,true,null);
      bigText(e.x,GROUND-200,'ACHOU!','#ffd23f'); ring(e.x,GROUND-50,'#ffd23f',8,24,6,14); SFX.parry();
    } else {
      ring(e.x,GROUND-50,'#ff9d4d',9,20,9,10); burst(e.x,GROUND-50,'#ffd6a5',24,8,0.12); SFX.blast(); addShake(8);
      for (const p of alivePlayers()) if (Math.abs(p.x-e.x)<120 && p.y>GROUND-150) hurtPlayer(p,{dmg:e.dmg,dir:p.x>=e.x?1:-1,fromX:e.x});
      for (let k=0;k<2;k++) spawnChild('coelho',e.x+(k?20:-20),GROUND-40);
      bigText(e.x,GROUND-200,'ERROU!','#ff8a8a');
    }
    return false;
  },
};
EXTRA_DRAW.bigEgg = (e,T,c,F,sx) => {
  const wob=e.shielded ? Math.sin(e.anim*0.5)*0.08 : Math.sin(e.anim*0.08)*0.03;
  ctx.save(); ctx.translate(sx,e.y-46); ctx.rotate(wob);
  if (e.state==='dying'){ ctx.globalAlpha=Math.max(0,1-e.t/20); ctx.scale(1+e.t/20,1+e.t/20); }
  ctx.fillStyle=F('#fff3d6'); ctx.beginPath(); ctx.ellipse(0,0,34,46,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle=F('#ffafcc'); ctx.fillRect(-33,-6,66,12);
  ctx.fillStyle=F('#bde0fe'); for (let k=-24;k<=24;k+=16) circle(k,-24,5);
  ctx.fillStyle=F('#cdeac0'); for (let k=-24;k<=24;k+=16) circle(k+8,22,5);
  ctx.fillStyle='#ffd23f'; tri(-10,-50,0,-40,10,-50); tri(-10,-30,0,-40,10,-30);
  ctx.restore();
};
addWind('eggHideWind');
BOSS_STATES.eggHideWind = (e) => {
  e.vx*=0.8; e.t++;
  if (e.t===1){ e.vy=-14; SFX.jump(); }
  if (e.t===30){
    const L=lockL, slots=[L+240,L+480,L+720], real=(Math.random()*3)|0;
    e.eggs=slots.map((x,i)=>{ const o=spawnEnemy('ovoGigante',x,GROUND-2); o.vy=0; o.real=i===real; o.shielded=true; return o.id; });
    e.hidden=true; e.state='eggShow'; e.t=0; ring(slots[real],GROUND-50,'#ffd23f',6,20,5,12); dust(slots[real],GROUND,16); SFX.thud();
    bigText(L+480,GROUND-230,'Siga o ovo certo!','#ffd23f');
  }
};
const bossEggs = e => (e.eggs||[]).map(id=>enemies.find(o=>o.id===id)).filter(o=>o && o.hp>0);
BOSS_STATES.eggShow = (e) => { // the egg the bunny jumped into blinks, then the shuffle starts
  e.t++; const eggs=bossEggs(e), r=eggs.find(o=>o.real);
  if (r && e.t%10<5) r.flash=3;
  if (e.t>=60){ e.state='eggShuffle'; e.t=0; e.swaps=0; }
};
BOSS_STATES.eggShuffle = (e) => {
  const eggs=bossEggs(e);
  if (eggs.length<3){ e.state='eggWait'; e.t=0; return; }
  if (e.t===0){ const a=(Math.random()*3)|0, b=(a+1+((Math.random()*2)|0))%3; e.swapA=eggs[a].id; e.swapB=eggs[b].id; e.fromA=eggs[a].x; e.fromB=eggs[b].x; SFX.roll(); }
  e.t++;
  const A=enemies.find(o=>o.id===e.swapA), B=enemies.find(o=>o.id===e.swapB), k=Math.min(1,e.t/EGG_SWAP_T), s=k*k*(3-2*k);
  const speed=e.phase>=3 ? 0.75 : 1; // faster shuffle the second time
  if (A && B){ A.x=e.fromA+(e.fromB-e.fromA)*s; B.x=e.fromB+(e.fromA-e.fromB)*s; A.y=B.y=GROUND-Math.sin(Math.PI*k)*30; }
  if (e.t>=EGG_SWAP_T*speed){ if (A&&B){ A.x=e.fromB; B.x=e.fromA; A.y=B.y=GROUND; } e.t=0; if (++e.swaps>=EGG_SWAPS+(e.phase>=3?2:0)){ e.state='eggWait'; e.t=0; for (const o of eggs) o.shielded=false; } }
};
BOSS_STATES.eggWait = (e) => {
  e.t++; const eggs=bossEggs(e), r=eggs.find(o=>o.real);
  if (r){ e.x=r.x; e.y=GROUND; }
  if (!e.hidden) return;
  if (!r || e.t>600){ // took too long: it bursts out of its egg by itself
    for (const o of eggs){ o.hp=0; o.state='dying'; o.t=0; burst(o.x,o.y-40,'#ffe5ec',14,5); }
    e.hidden=false; e.state='recover'; e.t=0; SFX.roar(); addShake(10);
  }
};
Object.assign(ENEMY_TYPES.coelhoRei, {
  phases:[0.6,0.25],
  onPhase(e){ e.state='eggHideWind'; e.t=0; e.vx=0; },
});

// ---------- Boitatá (Festa Junina) ----------
// The fire serpent leaves burning trails where it charges; from 60% it sets the stalls (platforms) of the
// arena on fire one at a time, and from 30% it dives underground and erupts three times in a row.
addWind('multiBurrowWind');
FAR_MOVES.push('multiBurrow'); NEAR_MOVES.push('multiBurrow');
BOSS_STATES.multiBurrowWind = (e) => { e.vx*=0.8; e.t++; if (e.t>=20){ e.state='multiBurrow'; e.t=0; e.hidden=true; e.erupts=3; dust(e.x,e.y,16); SFX.thud(); } };
BOSS_STATES.multiBurrow = (e,tg) => {
  e.t++; e.vx=0;
  if (e.t===16){ const [l,r]=bounds(); e.x=clamp(tg.x,l+e.w/2,r-e.w/2); e.crack=true; }
  if (e.t>=50){
    e.crack=false; addShake(12); SFX.slam(); dust(e.x,e.y,20); burst(e.x,GROUND-40,'#ff9d4d',26,8,0.1);
    for (const p of alivePlayers()) if (Math.abs(p.x-e.x)<e.w/2+50 && p.y>e.y-130) hurtPlayer(p,{dmg:e.dmg,dir:p.x>e.x?1:-1,fromX:e.x,srcId:e.id});
    addHazard({type:'fire',patch:true,x:e.x-40,w:80,ttl:200,dmg:16});
    if (--e.erupts>0) e.t=0;
    else { e.hidden=false; e.state='recover'; e.t=0; }
  }
};
Object.assign(ENEMY_TYPES.boitata, {
  phases:[0.6,0.3],
  movesByPhase:[['wave','burrow','bombs','charge'], ['wave','burrow','bombs','charge'], ['wave','multiBurrow','bombs','charge']],
  onPhase(e,n){
    if (n===2){ e.stallT=30; bigText(e.x,e.y-e.h-30,'AS BARRACAS ESTÃO PEGANDO FOGO!','#ffb347'); }
    if (n===3) bigText(e.x,e.y-e.h-30,'Cuidado com o chão!','#ffb347');
  },
  bossTick(e){
    if (e.hp<=0) return;
    if (e.state==='charge' && e.t%12===0) addHazard({type:'fire',patch:true,x:e.x-23,w:46,ttl:150,dmg:14});
    if ((e.phase||1)>=2 && --e.stallT<=0){
      const stalls=platforms.filter(p=>!p.gone && p.x+p.w>lockL && p.x<lockR);
      const p=pick(stalls); if (p) addHazard({type:'fire',patch:true,x:p.x+6,w:p.w-12,y:p.y,ttl:260,dmg:16});
      e.stallT=320;
    }
  },
});

// ---------- Mula-sem-cabeça (Noite do Saci) ----------
// From 55% it gallops from wall to wall three times, leaving fire on the ground (the platforms are safe);
// from 25% it gallops faster and the flames on its neck spit fireballs.
addWind('gallopWind');
BOSS_STATES.gallopWind = (e,tg,dx) => {
  e.vx*=0.8; e.t++; e.face=dx>0?1:-1;
  if (e.t%5===0) dust(e.x-e.face*40,e.y,3);
  if (e.t>=34){ e.state='gallop'; e.t=0; e.passes=3; e.hitIds=new Set(); SFX.roar(); }
};
BOSS_STATES.gallop = (e) => {
  const fast=(e.phase||1)>=3, [l,r]=bounds();
  e.t++; e.vx=e.face*(fast?14:12);
  if (e.t%10===0) addHazard({type:'fire',patch:true,x:e.x-25,w:50,ttl:fast?170:130,dmg:13});
  if (e.t%3===0) dust(e.x-e.face*40,e.y,2);
  for (const p of alivePlayers())
    if (!e.hitIds.has(p.id) && Math.abs(p.x-e.x)<e.w/2+p.w/2 && p.y>e.y-e.h && p.y-p.h<e.y){ e.hitIds.add(p.id); hurtPlayer(p,{dmg:Math.round(e.dmg*0.8),dir:e.face,fromX:e.x-e.face*20,srcId:e.id}); }
  if ((e.face<0 && e.x<=l+e.w/2+4) || (e.face>0 && e.x>=r-e.w/2-4)){
    addShake(6); SFX.thud();
    if (--e.passes>0){ e.face*=-1; e.hitIds=new Set(); e.t=0; if (fast) tgFire(e); }
    else { e.state='recover'; e.t=0; e.vx=0; }
  }
};
// the flames on its neck spit a fireball at the nearest hero
function tgFire(e){
  const tg=nearestPlayer(e.x,e.y); if (!tg) return false;
  throwBomb(e,tg,'fire',0,60); return true;
}
Object.assign(ENEMY_TYPES.mula, {
  phases:[0.55,0.25],
  movesByPhase:[['charge','leap','wave','slam'], ['gallop','leap','wave','gallop','slam'], ['gallop','wave','gallop','leap']],
  onPhase(e,n){ bigText(e.x,e.y-e.h-30,n===2?'Suba nas plataformas!':'A MULA ENFURECEU!','#ffb347'); },
});
FAR_MOVES.push('gallop'); NEAR_MOVES.push('gallop');
