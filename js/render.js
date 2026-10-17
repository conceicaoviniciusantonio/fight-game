'use strict';
// ===================== World rendering and in-game HUD =====================
function drawItems(){
  for (const it of items){
    if (!it.keep && it.t>600 && (it.t>>2)%2) continue;
    const x=it.x-cam.x, y=it.y-12+Math.sin(it.t*0.1)*3;
    shadow(x,surfaceBelow(it.x,it.y),9);
    if (it.type==='hp'){ ctx.fillStyle='#ff4d6d'; circle(x-5,y-3,6); circle(x+5,y-3,6); tri(x-11,y-1,x,y+11,x+11,y-1); ctx.fillStyle='rgba(255,255,255,0.7)'; circle(x-6,y-5,2); }
    else if (it.type==='life'){ // extra life: a glowing heart with little wings
      ctx.fillStyle=`rgba(255,140,170,${0.25+0.15*Math.sin(clock*0.12)})`; circle(x,y,20);
      ctx.fillStyle='#ffffff'; ctx.beginPath(); ctx.ellipse(x-13,y-4,8,4,-0.5+Math.sin(clock*0.3)*0.3,0,Math.PI*2); ctx.ellipse(x+13,y-4,8,4,0.5-Math.sin(clock*0.3)*0.3,0,Math.PI*2); ctx.fill();
      heartIcon(x,y,10,'#ff4d6d','#ffffff'); txt('+1',x,y-1,10,'#ffffff','center',false); }
    else if (it.type==='egg'){ // pastel Easter egg with a soft glow so it can be spotted
      ctx.fillStyle=`rgba(255,220,240,${0.25+0.15*Math.sin(clock*0.1)})`; circle(x,y,18);
      ctx.fillStyle='#ffd6e0'; ctx.beginPath(); ctx.ellipse(x,y,9,12,0,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#7bd389'; ctx.lineWidth=2.5; ctx.beginPath(); ctx.moveTo(x-9,y-1); for (let k=-9;k<=9;k+=4.5) ctx.lineTo(x+k,y-1+((k+9)/4.5%2?3:-3)); ctx.stroke();
      ctx.fillStyle='#bde0fe'; ctx.fillRect(x-8,y+4,16,3); }
    else if (it.type==='gold'){ ctx.save(); ctx.translate(x,y); ctx.scale(Math.cos(it.t*0.12),1); coinIcon(0,0,9); ctx.restore(); }
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
  cork: pr => { ctx.rotate(Math.atan2(pr.vy,pr.vx)); ctx.fillStyle='#c8956b'; ctx.beginPath(); ctx.roundRect(-6,-3.5,12,7,3); ctx.fill(); ctx.fillStyle='#a0703a'; ctx.fillRect(2,-3.5,3,7); },
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
    const f=(frame>>1)%2, fire=pr.style==='fire';
    ctx.fillStyle=fire?'rgba(255,120,40,0.35)':'rgba(138,60,255,0.35)'; ctx.beginPath(); ctx.ellipse(0,-30,30,40,0,0,Math.PI*2); ctx.fill();
    ctx.fillStyle=fire?'#ff5a1f':'#4a1f7a'; tri(-16,0,-4,-56-f*8,8,0);
    ctx.fillStyle=fire?'#ffd36b':'#ff5cf0'; tri(-6,0,4,-36-(1-f)*10,14,0);
  },
  bomb: pr => {
    // shadow on the ground shows where it will land
    const gy=GROUND-pr.y; if (gy>10){ ctx.fillStyle=`rgba(0,0,0,${clamp(0.4-gy/900,0.08,0.35)})`; ctx.beginPath(); ctx.ellipse(0,gy,pr.r+6,4,0,0,Math.PI*2); ctx.fill(); }
    ctx.rotate(pr.x*0.03);
    const st=pr.style, r=pr.r;
    if (st==='egg'){ ctx.fillStyle='#fff3e6'; ctx.beginPath(); ctx.ellipse(0,0,r*0.8,r,0,0,Math.PI*2); ctx.fill();
      ctx.strokeStyle='#ff7aa2'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(-r*0.8,0); for (let k=-r*0.8;k<=r*0.8;k+=5) ctx.lineTo(k,(k/5)%2?3:-3); ctx.stroke(); }
    else if (st==='fire'){ glowOrb(r+8,'#ffb347','rgba(255,80,20,0)'); ctx.fillStyle='#fff3c4'; circle(0,0,r*0.4); }
    else if (st==='gift'){ ctx.fillStyle='#e63946'; ctx.fillRect(-r,-r,r*2,r*2); ctx.fillStyle='#ffd23f'; ctx.fillRect(-3,-r,6,r*2); ctx.fillRect(-r,-3,r*2,6);
      ctx.beginPath(); ctx.ellipse(-5,-r-3,5,3,0.5,0,Math.PI*2); ctx.ellipse(5,-r-3,5,3,-0.5,0,Math.PI*2); ctx.fill(); }
    else { const cols=BOMB_COLORS.confetti; ctx.fillStyle='#2b2b3a'; circle(0,0,r); for (let k=0;k<6;k++){ ctx.fillStyle=cols[k%4]; ctx.fillRect(Math.cos(k)*r*0.6-2,Math.sin(k*1.7)*r*0.6-2,4,4); }
      ctx.strokeStyle='#ffd23f'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(0,-r); ctx.quadraticCurveTo(6,-r-8,2,-r-12); ctx.stroke(); }
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
  bomb: pr => { if (pr.style==='fire' || pr.style==='confetti') parts.push({x:pr.x,y:pr.y,vx:rand(-0.5,0.5),vy:-0.3,life:12,max:12,color:pick(BOMB_COLORS[pr.style]),size:2.5,grav:0}); },
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
    if (q.spark){
      const k=1-a, sx=q.x-cam.x; ctx.strokeStyle=q.color; ctx.lineWidth=3*a+0.5; ctx.lineCap='round';
      for (let i=0;i<6;i++){ const an=q.ang+i*Math.PI/3, r1=6+k*10, r2=r1+10+k*16*(i%2?0.6:1);
        ctx.beginPath(); ctx.moveTo(sx+Math.cos(an)*r1,q.y+Math.sin(an)*r1); ctx.lineTo(sx+Math.cos(an)*r2,q.y+Math.sin(an)*r2); ctx.stroke(); }
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
// ----- outlines: draw a figure offscreen, then stamp a dark silhouette around it -----
const OUT_A=document.createElement('canvas'), OUT_B=document.createElement('canvas');
const outA=OUT_A.getContext('2d'), outB=OUT_B.getContext('2d');
// (sx,sy) is the figure's feet on screen; bw×bh is a box around it, feet at 80% of its height
function withOutline(sx,sy,bw,bh,draw,color='rgba(18,12,30,0.92)',th=1.6){
  const k=DPR, pw=Math.ceil(bw*k), ph=Math.ceil(bh*k), ox=bw/2, oy=bh*0.8;
  if (OUT_A.width<pw || OUT_A.height<ph){
    OUT_A.width=OUT_B.width=Math.max(OUT_A.width,pw); OUT_A.height=OUT_B.height=Math.max(OUT_A.height,ph);
  }
  outA.setTransform(1,0,0,1,0,0); outA.clearRect(0,0,pw,ph);
  outA.setTransform(k,0,0,k,(ox-sx)*k,(oy-sy)*k);
  const main=ctx; ctx=outA;
  try { draw(); } finally { ctx=main; }
  outB.setTransform(1,0,0,1,0,0); outB.clearRect(0,0,pw,ph);
  outB.globalCompositeOperation='source-over'; outB.drawImage(OUT_A,0,0,pw,ph,0,0,pw,ph);
  outB.globalCompositeOperation='source-in'; outB.fillStyle=color; outB.fillRect(0,0,pw,ph);
  outB.globalCompositeOperation='source-over';
  const dx=sx-ox, dy=sy-oy;
  for (const [ax,ay] of [[-th,0],[th,0],[0,-th],[0,th]]) ctx.drawImage(OUT_B,0,0,pw,ph,dx+ax,dy+ay,bw,bh);
  ctx.drawImage(OUT_A,0,0,pw,ph,dx,dy,bw,bh);
}
function drawHeroOutlined(p){
  const sx=p.x-cam.x;
  if (sx<-200 || sx>W+200) return;
  const s=surfaceBelow(p.x,p.y), d=clamp((s-p.y)/220,0,0.7); shadow(sx,s,20*(1-d));
  withOutline(sx,p.y,320,240,()=>drawHero(p,1,false,true));
}
function drawMonsterOutlined(e){
  const T=ENEMY_TYPES[e.type], s=T.look.s||1, sx=e.x-cam.x;
  if (sx<-260 || sx>W+260) return;
  if (e.hidden){ // burrowed boss: a glowing crack marks where it will come out
    if (e.state==='burrow' && e.t>=24){ const a=0.4+0.4*Math.sin(clock*0.5); ctx.fillStyle=`rgba(255,120,40,${a})`; ctx.beginPath(); ctx.ellipse(sx,GROUND-2,e.w*0.7,8,0,0,Math.PI*2); ctx.fill(); }
    return;
  }
  const bw=T.look.kind==='bat'?90:Math.max(170,130*s), bh=T.look.kind==='bat'?120:Math.max(150,108*s);
  drawMonsterShadow(e);
  if (T.look.noOutline){ drawMonster(e,true); return; } // big glowing figures look better without the box-limited outline
  withOutline(sx,e.y,bw,bh,()=>drawMonster(e,true));
}

// ----- lighting: darkness with holes punched by light sources, plus a soft additive glow -----
const LIGHT=document.createElement('canvas'), lightCtx=LIGHT.getContext('2d');
const PROJ_LIGHT = { fireball:['255,150,60',120], meteor:['255,140,50',220], orb:['190,140,255',90], bolt:['190,140,255',60],
  wave:['140,220,255',90], eorb:['127,240,255',60], pshock:['255,210,110',70], swave:['255,92,240',80], spike:['127,240,255',60] };
function sceneLights(){
  const L=[];
  for (const p of players) if (p.hp>0) L.push({x:p.x-cam.x,y:p.y-40,r:170});
  for (const pr of projs){ const l=PROJ_LIGHT[pr.type]; if (l) L.push({x:pr.x-cam.x,y:pr.y,r:l[1],c:l[0]}); }
  for (const q of parts) if (q.beam) L.push({x:q.x-cam.x+q.face*q.len/2,y:q.y,r:260,c:'255,240,180'});
  for (const h of hazards) if (h.type==='fire'){ const x=h.x+h.w/2-cam.x; if (x>-200 && x<W+200) L.push({x,y:GROUND-30,r:190+Math.sin(clock*0.3)*8,c:'255,140,50'}); }
  if (boss && boss.hp>0 && boss.hp<boss.maxHp*0.5) L.push({x:boss.x-cam.x,y:boss.y-60,r:150,c:'255,60,40'});
  for (const e of enemies){ const lt=ENEMY_TYPES[e.type].look.light; if (lt && e.hp>0 && !e.hidden) L.push({x:e.x-cam.x+(ENEMY_TYPES[e.type].boss?e.face*72:0),y:e.y-(ENEMY_TYPES[e.type].boss?110:16),r:ENEMY_TYPES[e.type].boss?190:110,c:lt}); }
  const th=THEMES[stage.theme];
  if (th.lights) L.push(...th.lights(cam.x));
  return L;
}
function drawLighting(){
  const th=THEMES[stage.theme], dark=th.darkness ? th.darkness(cam.x) : 0;
  const L=sceneLights();
  if (dark>0.01){
    const pw=Math.round(W*DPR), ph=Math.round(H*DPR);
    if (LIGHT.width!==pw || LIGHT.height!==ph){ LIGHT.width=pw; LIGHT.height=ph; }
    const c=lightCtx;
    c.setTransform(1,0,0,1,0,0); c.globalCompositeOperation='source-over'; c.clearRect(0,0,pw,ph);
    c.setTransform(DPR,0,0,DPR,0,0);
    c.fillStyle=`rgba(6,4,18,${dark})`; c.fillRect(0,0,W,H);
    c.globalCompositeOperation='destination-out';
    for (const l of L){
      const g=c.createRadialGradient(l.x,l.y,0,l.x,l.y,l.r); g.addColorStop(0,'rgba(0,0,0,1)'); g.addColorStop(1,'rgba(0,0,0,0)');
      c.fillStyle=g; c.beginPath(); c.arc(l.x,l.y,l.r,0,Math.PI*2); c.fill();
    }
    ctx.drawImage(LIGHT,0,0,W,H);
  }
  // colored glow on top (a cheap bloom)
  ctx.globalCompositeOperation='lighter';
  for (const l of L) if (l.c){
    const g=ctx.createRadialGradient(l.x,l.y,0,l.x,l.y,l.r*0.8); g.addColorStop(0,`rgba(${l.c},0.32)`); g.addColorStop(1,`rgba(${l.c},0)`);
    ctx.fillStyle=g; ctx.beginPath(); ctx.arc(l.x,l.y,l.r*0.8,0,Math.PI*2); ctx.fill();
  }
  ctx.globalCompositeOperation='source-over';
}
function drawVignette(){
  const g=ctx.createRadialGradient(W/2,H/2,H*0.45,W/2,H/2,H*1.05);
  g.addColorStop(0,'rgba(0,0,0,0)'); g.addColorStop(1,'rgba(0,0,0,0.38)');
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
}
// Short star-shaped flash where a hit lands
function spark(x,y,color='#fff7d6'){ parts.push({spark:true,x,y,vx:0,vy:0,life:9,max:9,color,ang:Math.random()*Math.PI}); }

function nameTag(p,label,color){ if (p) txt(label,p.x-cam.x,p.y-p.h-30,12,color); }

function drawHazards(){
  for (const h of hazards){
    const x=h.x-cam.x; if (x+h.w<-40 || x>W+40) continue;
    if (h.type==='gift'){
      if (h.state==='done') continue;
      const fuse=h.state==='fuse', sh=fuse?Math.sin(clock*1.5)*2:0, y=GROUND-14;
      ctx.save(); ctx.translate(x+sh,y);
      ctx.fillStyle=fuse && (clock>>2)%2 ? '#ffffff' : h.col||'#e63946'; ctx.fillRect(-16,-14,32,28);
      ctx.fillStyle='#ffd23f'; ctx.fillRect(-3,-14,6,28); ctx.fillRect(-16,-3,32,6);
      ctx.beginPath(); ctx.ellipse(-6,-18,7,4,0.5,0,Math.PI*2); ctx.ellipse(6,-18,7,4,-0.5,0,Math.PI*2); ctx.fill();
      if (fuse){ ctx.fillStyle=(clock>>1)%2?'#fff3c4':'#ff9d4d'; circle(10,-26,4+Math.random()*2); }
      ctx.restore();
      continue;
    }
    if (h.type==='fire'){ // bonfire: crossed logs and layered flames
      ctx.fillStyle='#5d3a1a'; for (let k=0;k<h.w;k+=18){ ctx.save(); ctx.translate(x+k+9,GROUND-6); ctx.rotate((k/18%2?0.4:-0.4)); ctx.fillRect(-14,-4,28,8); ctx.restore(); }
      for (let k=0;k<h.w;k+=14){ const fl=Math.sin(clock*0.3+k)*5, fx=x+k+7;
        ctx.fillStyle='#ff5a1f'; ctx.beginPath(); ctx.ellipse(fx,GROUND-26,9,24+fl,0,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#ffb347'; ctx.beginPath(); ctx.ellipse(fx,GROUND-20,6,16+fl*0.6,0,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#fff3c4'; ctx.beginPath(); ctx.ellipse(fx,GROUND-14,3,8,0,0,Math.PI*2); ctx.fill(); }
      if (clock%4===0) parts.push({x:h.x+rand(0,h.w),y:GROUND-40,vx:rand(-0.4,0.4),vy:-rand(1,2.5),life:30,max:30,color:pick(['#ffb347','#ff5a1f','#ffd36b']),size:2,grav:0});
    }
  }
}
function drawWorld(){
  drawBG(); drawPlatforms(); drawHazards(); drawItems();
  for (const e of enemies) drawMonsterOutlined(e);
  drawParts();
  for (const p of players) if (p!==me) drawHeroOutlined(p);
  if (me) drawHeroOutlined(me);
  drawProjs();
  const th=THEMES[stage.theme]; if (th.ambient) th.ambient(cam.x);
  drawLighting();
  drawTexts();
  for (const p of players) drawEmote(p);
}

// ----- HUD -----
function portrait(p,x,y,r=28){
  ctx.save(); ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fillStyle='#2b2f55'; ctx.fill(); ctx.clip();
  const k=r/28; drawHeroAt(p.hero,x-3*k,y+99*k,1.3*k,{anim:frame});
  ctx.restore();
  ctx.strokeStyle='#ffd34d'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.stroke();
}
function heartIcon(x,y,r,fill,stroke){
  ctx.fillStyle=fill; ctx.beginPath(); ctx.moveTo(x,y+r*0.9);
  ctx.bezierCurveTo(x-r*1.4,y-r*0.1,x-r*0.6,y-r*1.2,x,y-r*0.4); ctx.bezierCurveTo(x+r*0.6,y-r*1.2,x+r*1.4,y-r*0.1,x,y+r*0.9); ctx.fill();
  if (stroke){ ctx.strokeStyle=stroke; ctx.lineWidth=1.5; ctx.stroke(); }
}
function coinIcon(x,y,r=8){
  ctx.fillStyle='#b8860b'; circle(x,y,r); ctx.fillStyle='#ffd23f'; circle(x,y,r*0.78);
  ctx.fillStyle='#fff3b0'; ctx.fillRect(x-r*0.15,y-r*0.45,r*0.3,r*0.9);
}
function heroPanel(p,x,y,opts={}){
  panel(x,y,330,78,14);
  if (opts.highlight){ ctx.strokeStyle='#ffd23f'; ctx.lineWidth=2; ctx.beginPath(); ctx.roundRect(x,y,330,78,14); ctx.stroke(); }
  portrait(p,x+38,y+39);
  txt((opts.label||HEROES[p.hero].name)+(p.base?'':'  Nv '+p.lvl),x+78,y+12,13,'#ffd34d','left');
  if (!p.base) for (let k=0;k<Math.max(START_LIVES,p.lives);k++) heartIcon(x+250+k*15,y+12,6,k<p.lives?'#ff4d6d':'rgba(255,255,255,0.18)',k<p.lives?'#ffffff':null);
  if (!p.base && p.local){
    const g=heroProg(p.hero), f=p.lvl>=MAX_LEVEL?1:g.xp/xpNeed(p.lvl);
    ctx.fillStyle='rgba(0,0,0,0.5)'; ctx.fillRect(x+78,y+73,240,3); ctx.fillStyle='#ffd23f'; ctx.fillRect(x+78,y+73,240*f,3);
  }
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
