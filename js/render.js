'use strict';
// ===================== World rendering and in-game HUD =====================
function drawItems(){
  for (const it of items){
    if (it.t>600 && (it.t>>2)%2) continue;
    const x=it.x-cam.x, y=it.y-12+Math.sin(it.t*0.1)*3;
    shadow(x,surfaceBelow(it.x,it.y),9);
    if (it.type==='hp'){ ctx.fillStyle='#ff4d6d'; circle(x-5,y-3,6); circle(x+5,y-3,6); tri(x-11,y-1,x,y+11,x+11,y-1); ctx.fillStyle='rgba(255,255,255,0.7)'; circle(x-6,y-5,2); }
    else if (it.type==='mp'){ ctx.fillStyle='#4fb8ff'; ctx.beginPath(); ctx.moveTo(x,y-12); ctx.lineTo(x+8,y); ctx.lineTo(x,y+12); ctx.lineTo(x-8,y); ctx.closePath(); ctx.fill(); ctx.fillStyle='#c9ecff'; tri(x,y-12,x+3,y,x-3,y); }
  }
}
function drawProjs(){
  for (const pr of projs){
    const x=pr.x-cam.x;
    if (x<-60||x>W+60) continue;
    ctx.save(); ctx.translate(x,pr.y);
    if (pr.type==='wave'){
      ctx.scale(Math.sign(pr.vx)||1,1); ctx.globalAlpha=Math.min(1,pr.life/12); ctx.lineCap='round';
      ctx.strokeStyle='rgba(90,190,255,0.5)'; ctx.lineWidth=16; ctx.beginPath(); ctx.arc(-14,0,36,-1.15,1.15); ctx.stroke();
      ctx.strokeStyle='#bdefff'; ctx.lineWidth=7; ctx.beginPath(); ctx.arc(-12,0,36,-1.1,1.1); ctx.stroke();
      ctx.strokeStyle='#ffffff'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(-10,0,36,-1,1); ctx.stroke();
    } else if (pr.type==='arrow'){
      ctx.rotate(Math.atan2(pr.vy,pr.vx));
      ctx.strokeStyle='#c8a165'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(-18,0); ctx.lineTo(6,0); ctx.stroke();
      ctx.fillStyle='#d0d0d0'; tri(6,-3,12,0,6,3); ctx.fillStyle='#e05050'; tri(-18,0,-22,-4,-14,0); tri(-18,0,-22,4,-14,0);
    } else if (pr.type==='parrow'){
      ctx.rotate(Math.atan2(pr.vy,pr.vx)); const L=pr.big?30:22;
      if (pr.big){ ctx.strokeStyle='rgba(180,255,150,0.45)'; ctx.lineWidth=7; ctx.beginPath(); ctx.moveTo(-L-10,0); ctx.lineTo(8,0); ctx.stroke(); }
      ctx.strokeStyle='#e8d5a8'; ctx.lineWidth=2.2; ctx.beginPath(); ctx.moveTo(-L,0); ctx.lineTo(6,0); ctx.stroke();
      ctx.fillStyle='#f5f5f5'; tri(6,-3.5,13,0,6,3.5); ctx.fillStyle='#ba68c8'; tri(-L,0,-L-5,-4,-L+5,0); tri(-L,0,-L-5,4,-L+5,0);
    } else if (pr.type==='shock'){
      const f=(frame>>1)%2;
      ctx.fillStyle='#c9773a'; tri(-14,0,-4,-30-f*6,6,0);
      ctx.fillStyle='#ffb35a'; tri(-4,0,4,-20-(1-f)*8,12,0);
      ctx.fillStyle='rgba(255,220,150,0.8)'; tri(-8,0,-2,-14,4,0);
    } else if (PROJ_DRAW[pr.type]) PROJ_DRAW[pr.type](pr);
    ctx.restore();
  }
}
// Extra projectile painters registered by other modules (new heroes, bosses)
const PROJ_DRAW = {};

function drawParts(){
  for (const q of parts){
    const a=q.life/q.max;
    if (q.ghost){ drawHero({hero:q.hero,x:q.x,y:q.y,face:q.face,state:'dash',anim:q.anim,onGround:true,vx:0,inv:0,t:0},a*0.35,true); continue; }
    ctx.globalAlpha=a;
    if (q.ring){ ctx.strokeStyle=q.color; ctx.lineWidth=q.lw*a+1; ctx.beginPath(); ctx.arc(q.x-cam.x,q.y,q.r,0,Math.PI*2); ctx.stroke(); }
    else { ctx.fillStyle=q.color; circle(q.x-cam.x,q.y,q.size*(0.4+a*0.6)); }
  }
  ctx.globalAlpha=1;
}
function drawTexts(){
  for (const t of texts){
    ctx.globalAlpha=Math.min(1,t.life/15);
    const sz=t.big?30:20, pop=t.life>44?1+(t.life-44)*0.08:1;
    txt(t.s,t.x-cam.x,t.y,sz*pop,t.color);
  }
  ctx.globalAlpha=1;
}
function nameTag(p,label,color){ if (p) txt(label,p.x-cam.x,p.y-p.h-30,12,color); }

function drawWorld(){
  drawBG(); drawPlatforms(); drawItems();
  for (const e of enemies) drawMonster(e);
  drawParts();
  for (const p of players) if (p!==me) drawHero(p);
  if (me) drawHero(me);
  drawProjs(); drawTexts();
}

// ----- HUD -----
function portrait(p,x,y,r=28){
  ctx.save(); ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fillStyle='#2b2f55'; ctx.fill(); ctx.clip();
  const k=r/28; drawHeroAt(p.hero,x-3*k,y+99*k,1.3*k,{anim:frame});
  ctx.restore();
  ctx.strokeStyle='#ffd34d'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.stroke();
}
function heroPanel(p,x,y,opts={}){
  panel(x,y,330,78,14);
  if (opts.highlight){ ctx.strokeStyle='#ffd23f'; ctx.lineWidth=2; ctx.beginPath(); ctx.roundRect(x,y,330,78,14); ctx.stroke(); }
  portrait(p,x+38,y+39);
  txt(opts.label||HEROES[p.hero].name,x+78,y+12,13,'#ffd34d','left');
  bar(x+78,y+22,240,16,Math.max(0,p.hp)/p.maxHp,'#ff6b7a','#b3122a');
  txt(`${Math.ceil(Math.max(0,p.hp))} / ${p.maxHp}`,x+198,y+30,12,'#ffffff');
  mpBars(x+78,y+48,76,11,p.mp);
  txt('MP',x+321,y+54,11,'#8fe6ff','right');
}
function drawCombo(x,y){
  if (combo>1 && comboTimer>0){
    const pop=1+Math.max(0,comboTimer-100)*0.04;
    ctx.globalAlpha=Math.min(1,comboTimer/30);
    txt(`${combo}`,x,y,46*pop,combo>=20?'#ff7b3d':'#ffd23f');
    txt('HITS',x,y+35,18,'#ffffff');
    ctx.globalAlpha=1;
  }
}
function drawBossBar(){
  if (!boss || boss.hp<=0 && boss.state!=='dying') return;
  const bw=560, bx=(W-bw)/2, by=H-44;
  txt(ENEMY_TYPES[boss.type].name.toUpperCase(),W/2,by-14,14,'#ffb0a0');
  ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.beginPath(); ctx.roundRect(bx-3,by-3,bw+6,22,6); ctx.fill();
  ctx.fillStyle='#ffffff'; ctx.fillRect(bx,by,bw*clamp(boss.dispHp/boss.maxHp,0,1),16);
  bar(bx,by,bw,16,Math.max(0,boss.hp)/boss.maxHp,'#ff5a3d','#8a1010');
}
function drawBanner(){
  if (!banner) return;
  const k=banner.t/banner.max, a=Math.min(1,banner.t/25,(banner.max-banner.t)/15);
  ctx.globalAlpha=a;
  ctx.fillStyle=banner.boss?'rgba(80,0,0,0.55)':'rgba(0,0,0,0.45)'; ctx.fillRect(0,H/2-70,W,100);
  txt(banner.sub,W/2,H/2-45,18,banner.boss?'#ff9a8a':'#cfe3ff');
  txt(banner.txt,W/2+(1-k)*-30,H/2-12,44,banner.boss?'#ff5a3d':'#ffffff');
  ctx.globalAlpha=1;
}
function muteBadge(){ txt(A.muted?'♪ OFF (M)':'♪ ON (M)',W-20,H-18,12,A.muted?'#ff8a8a':'#cfe3ff','right'); }
