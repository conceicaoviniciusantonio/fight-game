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
// Extra projectile painters (magic, bosses)
function glowOrb(r,core,edge){
  const g=ctx.createRadialGradient(0,0,1,0,0,r); g.addColorStop(0,'#ffffff'); g.addColorStop(0.35,core); g.addColorStop(1,edge);
  ctx.fillStyle=g; circle(0,0,r);
}
const PROJ_DRAW = {
  bolt: pr => glowOrb(13,'#c79bff','rgba(140,90,255,0)'),
  orb:  pr => { glowOrb(24,'#b388ff','rgba(120,70,255,0)'); ctx.strokeStyle='rgba(255,255,255,0.7)'; ctx.lineWidth=2; ctx.beginPath(); ctx.arc(0,0,12,clock*0.3,clock*0.3+4); ctx.stroke(); },
  fireball: pr => { glowOrb(26,'#ffb347','rgba(255,80,20,0)'); ctx.fillStyle='rgba(255,240,180,0.9)'; circle(0,0,8); },
  meteor: pr => {
    ctx.rotate(Math.atan2(pr.vy,pr.vx));
    const g=ctx.createLinearGradient(-110,0,0,0); g.addColorStop(0,'rgba(255,120,40,0)'); g.addColorStop(1,'rgba(255,190,90,0.9)');
    ctx.fillStyle=g; ctx.beginPath(); ctx.moveTo(-110,-20); ctx.lineTo(0,-34); ctx.lineTo(0,34); ctx.lineTo(-110,20); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#6d4c41'; circle(0,0,32); ctx.fillStyle='#8d6e63'; circle(-8,-8,14); ctx.fillStyle='#ffcc80'; circle(10,6,8);
  },
  eorb: pr => { glowOrb(15,pr.col||'#7ff0ff','rgba(80,40,160,0)'); },
  boulder: pr => {
    ctx.rotate(pr.x*0.05); ctx.fillStyle='#6b6f7c'; circle(0,0,pr.r); ctx.fillStyle='#8a8f9c'; circle(-6,-6,pr.r*0.5);
    ctx.fillStyle='#7ff0ff'; tri(4,2,10,-8,12,4);
  },
  glob: pr => { ctx.fillStyle='#6fbf3a'; circle(0,0,pr.r*0.8); ctx.fillStyle='#a6f06a'; circle(-4,-4,pr.r*0.35); },
  spike: pr => {
    if (pr.life>22){
      const a=0.35+0.3*Math.sin(clock*0.6);
      ctx.fillStyle=`rgba(127,240,255,${a})`; ctx.beginPath(); ctx.ellipse(0,0,34,7,0,0,Math.PI*2); ctx.fill();
    } else {
      const k=Math.min(1,(22-pr.life)/5), h=90*k;
      ctx.fillStyle='#7ff0ff'; tri(-26,0,-16,-h*0.7,-6,0); tri(-10,0,0,-h,10,0); tri(6,0,16,-h*0.75,26,0);
      ctx.fillStyle='rgba(255,255,255,0.7)'; tri(-3,0,0,-h*0.9,3,0);
    }
  },
  swave: pr => {
    const f=(frame>>1)%2;
    ctx.fillStyle='rgba(138,60,255,0.35)'; ctx.beginPath(); ctx.ellipse(0,-30,30,40,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle='#4a1f7a'; tri(-16,0,-4,-56-f*8,8,0);
    ctx.fillStyle='#ff5cf0'; tri(-6,0,4,-36-(1-f)*10,14,0);
  },
  pshock: pr => {
    const f=(frame>>1)%2;
    ctx.fillStyle='#ffd36b'; tri(-14,0,-4,-34-f*6,6,0);
    ctx.fillStyle='#fff3c4'; tri(-4,0,4,-22-(1-f)*8,12,0);
  },
};
// Little particle trails for some projectiles
const PROJ_TRAIL = {
  bolt: pr => parts.push({x:pr.x,y:pr.y,vx:0,vy:0,life:10,max:10,color:'#c79bff',size:3,grav:0}),
  orb: pr => parts.push({x:pr.x,y:pr.y+rand(-8,8),vx:0,vy:0,life:12,max:12,color:'#d4b8ff',size:4,grav:0}),
  fireball: pr => parts.push({x:pr.x,y:pr.y+rand(-8,8),vx:-pr.vx*0.1,vy:-0.5,life:16,max:16,color:pick(['#ff9d4d','#ffd36b','#ff6b3d']),size:5,grav:0}),
  meteor: pr => parts.push({x:pr.x-pr.vx*2,y:pr.y-pr.vy*2,vx:rand(-1,1),vy:rand(-1,1),life:20,max:20,color:pick(['#ff9d4d','#ffd36b','#6d4c41']),size:7,grav:0}),
  pshock: pr => dust(pr.x,pr.y,1),
  eorb: pr => parts.push({x:pr.x,y:pr.y,vx:0,vy:0,life:12,max:12,color:pr.col||'#7ff0ff',size:3,grav:0}),
  glob: pr => parts.push({x:pr.x,y:pr.y,vx:0,vy:0.5,life:10,max:10,color:'#8bdc4a',size:3,grav:0}),
};

function drawParts(){
  for (const q of parts){
    const a=q.life/q.max;
    if (q.ghost){ drawHero({hero:q.hero,x:q.x,y:q.y,face:q.face,state:'dash',anim:q.anim,onGround:true,vx:0,inv:0,t:0},a*0.35,true); continue; }
    ctx.globalAlpha=a;
    if (q.beam){
      const x=q.x-cam.x, x2=x+q.face*q.len, hh=10+26*a;
      const g=ctx.createLinearGradient(0,q.y-hh,0,q.y+hh);
      g.addColorStop(0,'rgba(255,226,138,0)'); g.addColorStop(0.5,'rgba(255,248,220,1)'); g.addColorStop(1,'rgba(255,226,138,0)');
      ctx.fillStyle=g; ctx.fillRect(Math.min(x,x2),q.y-hh,q.len,hh*2);
      ctx.fillStyle='#ffffff'; ctx.fillRect(Math.min(x,x2),q.y-3*a,q.len,6*a);
      ctx.globalAlpha=1; continue;
    }
    if (q.slash){
      ctx.strokeStyle='#e8fbff'; ctx.lineWidth=10*a; ctx.lineCap='round';
      ctx.beginPath(); ctx.moveTo(q.x1-cam.x,q.y+20); ctx.lineTo(q.x2-cam.x,q.y-20); ctx.stroke();
      ctx.globalAlpha=1; continue;
    }
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
  for (const p of players) drawEmote(p);
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
  if (p.guardHp<100){ ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.fillRect(x+78,y+66,240,4); ctx.fillStyle=p.guardHp<30?'#ff8a8a':'#8fe6ff'; ctx.fillRect(x+78,y+66,240*p.guardHp/100,4); }
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
// Ultimate "cut-in": a slanted band with the hero and the skill name
const CUTIN_T = 55;
function drawCutin(){
  if (!cutin) return;
  const k=cutin.t/CUTIN_T, slide=Math.min(1,(CUTIN_T-cutin.t)/8), out=Math.min(1,cutin.t/10), a=Math.min(slide,out);
  ctx.save(); ctx.globalAlpha=a;
  ctx.fillStyle='rgba(10,12,30,0.78)';
  ctx.beginPath(); ctx.moveTo(0,190); ctx.lineTo(W,150); ctx.lineTo(W,280); ctx.lineTo(0,320); ctx.closePath(); ctx.fill();
  ctx.strokeStyle='#ffd23f'; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(0,190); ctx.lineTo(W,150); ctx.moveTo(0,320); ctx.lineTo(W,280); ctx.stroke();
  const hx=-120+slide*300+(1-k)*40;
  drawHeroAt(cutin.hero,hx,330,2.6,{anim:clock,state:'free'});
  txt(cutin.name,W/2+120-(1-slide)*200,235,40,'#ffffff');
  ctx.restore();
}
function muteBadge(){ txt(A.muted?'♪ OFF (M)':'♪ ON (M)',W-20,H-18,12,A.muted?'#ff8a8a':'#cfe3ff','right'); }
