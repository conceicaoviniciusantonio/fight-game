'use strict';
// ===================== Stages and their scenery =====================
// A stage is data: size, platforms, combat zones (each locks the camera until its waves are cleared)
// and a theme that paints the background. The last zone holds the boss.
const STAGES = {
  forest: {
    name:'Bosque de Vallen', sub:'Fase 1', theme:'forest', worldW:4000, music:'stage', bossMusic:'boss',
    platforms:[
      {x:600,y:360,w:180},{x:880,y:285,w:160},
      {x:1450,y:350,w:220},{x:1750,y:270,w:200},{x:2040,y:350,w:150},
      {x:2480,y:340,w:240},{x:2840,y:262,w:170},
      {x:3240,y:330,w:170},{x:3700,y:330,w:170},
    ],
    zones:[
      {at:330, left:100, waves:[
        [['goblin',560],['goblin',760],['goblin',920]],
        [['goblin',250],['archer',950],['goblin',640],['archer',690]]]},
      {at:1260, left:1150, waves:[
        [['goblin',1500],['archer',1800],['archer',1250],['goblin',1650]],
        [['orc',1700],['goblin',1350],['goblin',1950],['archer',2080]]]},
      {at:2260, left:2150, waves:[
        [['orc',2550],['archer',2900],['goblin',2400],['goblin',2700]],
        [['orc',2300],['orc',2950],['archer',2560],['archer',2880],['goblin',2650]]]},
      {at:3150, left:3040, boss:true, waves:[[['gorgo',3760]]]},
    ],
    arena:{left:3040, extra:[{x:3470,y:235,w:100}]},
  },
  cave: {
    name:'Caverna de Cristal', sub:'Fase 2', theme:'cave', worldW:4000, music:'cave', bossMusic:'boss',
    platforms:[
      {x:520,y:350,w:200},{x:820,y:270,w:150},
      {x:1380,y:330,w:180},{x:1650,y:250,w:220},{x:1980,y:340,w:160},
      {x:2420,y:300,w:200},{x:2760,y:360,w:180},
      {x:3220,y:320,w:170},{x:3720,y:320,w:170},
    ],
    zones:[
      {at:330, left:100, waves:[
        [['bat',600],['kobold',800],['kobold',950]],
        [['shaman',900],['bat',300],['kobold',500],['bat',700]]]},
      {at:1260, left:1150, waves:[
        [['kobold',1500],['shaman',1900],['bat',1300],['bat',1700]],
        [['kobold',1400],['kobold',1950],['shaman',1600],['bat',1800],['orc',1700]]]},
      {at:2260, left:2150, waves:[
        [['orc',2600],['shaman',2950],['bat',2400],['bat',2800]],
        [['kobold',2300],['kobold',2900],['shaman',2500],['bat',2700],['bat',2400]]]},
      {at:3150, left:3040, boss:true, waves:[[['golem',3760]]]},
    ],
    arena:{left:3040, extra:[{x:3470,y:235,w:100}]},
  },
  desert: {
    name:'Deserto Escaldante', sub:'Fase 3', theme:'desert', worldW:4000, music:'desert', bossMusic:'boss',
    platforms:[
      {x:640,y:340,w:220},{x:960,y:270,w:140},
      {x:1420,y:350,w:200},{x:1720,y:280,w:180},{x:2010,y:350,w:160},
      {x:2460,y:330,w:220},{x:2820,y:270,w:160},
      {x:3250,y:330,w:160},{x:3690,y:330,w:160},
    ],
    zones:[
      {at:330, left:100, waves:[
        [['scorpion',600],['scorpion',850],['nomad',950]],
        [['mummy',800],['scorpion',300],['nomad',650]]]},
      {at:1260, left:1150, waves:[
        [['scorpion',1500],['nomad',1900],['mummy',1700],['scorpion',1300]],
        [['mummy',1450],['mummy',1950],['nomad',1650],['scorpion',1800]]]},
      {at:2260, left:2150, waves:[
        [['mummy',2500],['nomad',2950],['scorpion',2350],['scorpion',2750]],
        [['mummy',2300],['mummy',2900],['nomad',2550],['nomad',2850],['scorpion',2650]]]},
      {at:3150, left:3040, boss:true, waves:[[['scorpking',3760]]]},
    ],
    arena:{left:3040, extra:[{x:3470,y:240,w:100}]},
  },
  castle: {
    name:'Castelo Sombrio', sub:'Fase 4', theme:'castle', worldW:4000, music:'castle', bossMusic:'boss',
    platforms:[
      {x:560,y:340,w:200},{x:880,y:270,w:160},
      {x:1400,y:340,w:200},{x:1700,y:260,w:200},{x:2000,y:340,w:160},
      {x:2440,y:320,w:200},{x:2800,y:250,w:180},
      {x:3230,y:320,w:180},{x:3700,y:320,w:180},
    ],
    zones:[
      {at:330, left:100, waves:[
        [['skeleton',600],['skeleton',800],['darkmage',950]],
        [['bat',500],['skeleton',300],['skeleton',700],['darkmage',650]]]},
      {at:1260, left:1150, waves:[
        [['skeleton',1500],['darkmage',1900],['blackknight',1700],['bat',1300]],
        [['blackknight',1450],['skeleton',1950],['darkmage',1650],['skeleton',1800]]]},
      {at:2260, left:2150, waves:[
        [['blackknight',2500],['darkmage',2950],['skeleton',2350],['bat',2750]],
        [['blackknight',2300],['blackknight',2900],['darkmage',2550],['darkmage',2850],['skeleton',2650]]]},
      {at:3150, left:3040, boss:true, waves:[[['darklord',3760]]]},
    ],
    arena:{left:3040, extra:[{x:3470,y:230,w:100}]},
  },
};
const STAGE_IDS = Object.keys(STAGES);

// ----- themes -----
const SR = mulberry(7);
const SCENERY = {
  mountains: [...Array(22)].map((_,i)=>({x:i*140+SR()*60,h:110+SR()*130,w:170+SR()*120})),
  clouds:    [...Array(14)].map((_,i)=>({x:i*190+SR()*90,y:40+SR()*120,s:0.6+SR()*0.8})),
  farTrees:  [...Array(64)].map((_,i)=>({x:i*42+SR()*30,h:60+SR()*60})),
  nearTrees: [...Array(48)].map((_,i)=>({x:i*105+SR()*60,h:120+SR()*90,r:30+SR()*18})),
  tufts:     [...Array(260)].map(()=>({x:SR()*4000,s:0.6+SR()*0.8})),
  pebbles:   [...Array(160)].map(()=>({x:SR()*4000,y:GROUND+18+SR()*60,r:2+SR()*4})),
  ruins:     [{x:3080,h:200},{x:3300,h:120,broken:true},{x:3620,h:160,broken:true},{x:3960,h:210}],
};

const THEMES = {
  forest: {
    platform:{post:'#5d4632', body:'#8d7458', line:'#6f5a44', top:'#6cc24f', vine:'#3f8a30'},
    draw(cx){
      const S=SCENERY, t=clamp(cx/(worldW-W),0,1);
      const g=ctx.createLinearGradient(0,0,0,GROUND);
      g.addColorStop(0,mix('#5bb8f5','#2b1d4e',t)); g.addColorStop(1,mix('#d4f0ff','#f08a5d',t));
      ctx.fillStyle=g; ctx.fillRect(-30,-30,W+60,GROUND+40);
      ctx.fillStyle=mix('#fff6c8','#ffb36b',t); circle(W*0.76-cx*0.02,90+t*200,42);
      ctx.globalAlpha=0.75; ctx.fillStyle=mix('#ffffff','#f6c1c9',t);
      for (const c of S.clouds){
        const x=((c.x-cx*0.08+clock*0.15)%2700+2700)%2700-200; if (x>W+100) continue;
        circle(x,c.y,22*c.s); circle(x+24*c.s,c.y-10*c.s,26*c.s); circle(x+52*c.s,c.y,20*c.s);
      }
      ctx.globalAlpha=1;
      const mb=GROUND-50;
      ctx.fillStyle=mix('#86aecb','#5a3f6e',t);
      for (const m of S.mountains){ const x=m.x-cx*0.15; if (x+m.w<-20||x-m.w>W+20) continue; tri(x-m.w,mb,x,mb-m.h,x+m.w,mb); }
      ctx.fillRect(-30,mb,W+60,60);
      ctx.fillStyle=mix('#3d7a5a','#2d2f48',t);
      for (const f of S.farTrees){ const x=f.x-cx*0.35; if (x<-40||x>W+40) continue;
        const b=GROUND-14; for (let k=0;k<3;k++) tri(x-18+k*3,b-k*f.h*0.28,x,b-f.h-k*f.h*0.1,x+18-k*3,b-k*f.h*0.28); }
      ctx.fillRect(-30,GROUND-16,W+60,20);
      for (const n of S.nearTrees){ const x=n.x-cx*0.6; if (x<-80||x>W+80) continue;
        ctx.fillStyle=mix('#5a3b28','#3a2a2a',t); ctx.fillRect(x-7,GROUND-n.h,14,n.h);
        ctx.fillStyle=mix('#2f8f46','#27443a',t);
        circle(x,GROUND-n.h,n.r); circle(x-n.r*0.7,GROUND-n.h+12,n.r*0.75); circle(x+n.r*0.7,GROUND-n.h+10,n.r*0.8);
        ctx.fillStyle=mix('#3fae58','#30523f',t); circle(x-6,GROUND-n.h-8,n.r*0.55);
      }
      for (const r of S.ruins){ const x=r.x-cx; if (x<-60||x>W+60) continue;
        ctx.fillStyle='#8a8494'; ctx.fillRect(x-22,GROUND-r.h,44,r.h);
        ctx.fillStyle='#a59fae'; ctx.fillRect(x-30,GROUND-r.h-(r.broken?0:16),60,r.broken?10:16);
        ctx.fillStyle='rgba(0,0,0,0.15)'; for (let y=GROUND-r.h+20;y<GROUND;y+=34) ctx.fillRect(x-22,y,44,3);
        if (r.broken){ ctx.fillStyle=mix('#5bb8f5','#2b1d4e',t); tri(x-22,GROUND-r.h-1,x+8,GROUND-r.h+22,x+23,GROUND-r.h-1); }
        ctx.fillStyle='#3f8f45'; circle(x-18,GROUND-r.h*0.4,6); circle(x+20,GROUND-r.h*0.7,5);
      }
      ctx.fillStyle='#7a5434'; ctx.fillRect(-30,GROUND,W+60,H-GROUND+30);
      ctx.fillStyle='#634329'; for (const p of S.pebbles){ const x=p.x-cx; if (x>-10&&x<W+10) circle(x,p.y,p.r); }
      ctx.fillStyle='#4f9e3c'; ctx.fillRect(-30,GROUND-2,W+60,14);
      ctx.fillStyle='#6cc24f'; ctx.fillRect(-30,GROUND-4,W+60,6);
      ctx.fillStyle='#3f8a30';
      for (const f of S.tufts){ const x=f.x-cx; if (x<-10||x>W+10) continue; tri(x-5*f.s,GROUND-2,x,GROUND-14*f.s,x+5*f.s,GROUND-2); }
    },
  },
  cave: {
    platform:{post:'#2b2440', body:'#4a3d6b', line:'#3a3058', top:'#6a5a9a', vine:'#7ff0ff'},
    draw(cx){
      const S=SCENERY;
      const g=ctx.createLinearGradient(0,0,0,GROUND); g.addColorStop(0,'#0c0818'); g.addColorStop(1,'#2a1f45');
      ctx.fillStyle=g; ctx.fillRect(-30,-30,W+60,GROUND+40);
      // far rock mounds and hanging rock
      ctx.fillStyle='#1b1430';
      for (const m of S.mountains){ const x=m.x-cx*0.15; if (x+m.w<-20||x-m.w>W+20) continue; tri(x-m.w,GROUND-30,x,GROUND-30-m.h*0.8,x+m.w,GROUND-30); tri(x-m.w*0.6,-10,x+20,m.h*0.5,x+m.w*0.7,-10); }
      ctx.fillRect(-30,GROUND-34,W+60,40);
      // glowing crystal clusters (far)
      for (const f of S.farTrees){ const x=f.x-cx*0.35; if (x<-40||x>W+40) continue;
        const col=f.h>90?'#ff7bd8':'#7ff0ff', b=GROUND-20;
        ctx.globalAlpha=0.18; ctx.fillStyle=col; circle(x,b-f.h*0.4,f.h*0.5); ctx.globalAlpha=0.75;
        tri(x-8,b,x-2,b-f.h*0.7,x+4,b); tri(x+2,b,x+9,b-f.h*0.45,x+14,b); ctx.globalAlpha=1; }
      // stalactites
      ctx.fillStyle='#241b3d';
      for (const n of S.nearTrees){ const x=n.x-cx*0.6; if (x<-60||x>W+60) continue; tri(x-n.r*0.6,-10,x,n.h*0.6,x+n.r*0.6,-10); tri(x+n.r*0.5,-10,x+n.r*0.8,n.h*0.3,x+n.r*1.1,-10); }
      // big crystal pillars in the boss arena
      for (const r of S.ruins){ const x=r.x-cx; if (x<-80||x>W+80) continue;
        const gl=ctx.createLinearGradient(x-24,0,x+24,0); gl.addColorStop(0,'#3a6f9a'); gl.addColorStop(0.5,'#9ff8ff'); gl.addColorStop(1,'#3a6f9a');
        ctx.fillStyle=gl; ctx.beginPath(); ctx.moveTo(x-22,GROUND); ctx.lineTo(x-14,GROUND-r.h); ctx.lineTo(x,GROUND-r.h-28); ctx.lineTo(x+14,GROUND-r.h); ctx.lineTo(x+22,GROUND); ctx.closePath(); ctx.fill(); }
      // floating motes
      ctx.fillStyle='rgba(159,248,255,0.6)';
      for (let i=0;i<24;i++){ const x=((i*137-cx*0.5+clock*0.3)%(W+40)+W+40)%(W+40)-20, y=80+((i*71+clock*0.4)%300); circle(x,y,1.5+(i%3)*0.5); }
      ctx.fillStyle='#2b2440'; ctx.fillRect(-30,GROUND,W+60,H-GROUND+30);
      ctx.fillStyle='#211b33'; for (const p of S.pebbles){ const x=p.x-cx; if (x>-10&&x<W+10) circle(x,p.y,p.r); }
      ctx.fillStyle='#4a3d6b'; ctx.fillRect(-30,GROUND-4,W+60,10);
      for (const f of S.tufts){ const x=f.x-cx; if (x<-10||x>W+10) continue; ctx.fillStyle=f.s>1?'#ff7bd8':'#7ff0ff'; tri(x-3*f.s,GROUND-2,x,GROUND-10*f.s,x+3*f.s,GROUND-2); }
    },
  },
  desert: {
    platform:{post:'#a0703a', body:'#c99554', line:'#a87a40', top:'#f0c47a', vine:'#8a5a2a'},
    draw(cx){
      const S=SCENERY, t=clamp(cx/(worldW-W),0,1);
      const g=ctx.createLinearGradient(0,0,0,GROUND);
      g.addColorStop(0,mix('#f7a53c','#8c2f39',t)); g.addColorStop(1,mix('#ffe6a3','#ffb26b',t));
      ctx.fillStyle=g; ctx.fillRect(-30,-30,W+60,GROUND+40);
      const sy=110+t*160;
      ctx.fillStyle='rgba(255,240,190,0.35)'; circle(W*0.7-cx*0.02,sy,90);
      ctx.fillStyle=mix('#fff5d0','#ffcf80',t); circle(W*0.7-cx*0.02,sy,56);
      // far dunes
      ctx.fillStyle=mix('#e8b46a','#b06a4a',t); ctx.beginPath(); ctx.moveTo(-30,GROUND);
      for (let x=-30;x<=W+30;x+=20) ctx.lineTo(x,GROUND-90-Math.sin((x+cx*0.15)*0.006)*40-Math.sin((x+cx*0.15)*0.017)*12);
      ctx.lineTo(W+30,GROUND); ctx.closePath(); ctx.fill();
      // pyramids
      ctx.fillStyle=mix('#d9a35a','#9a5a3e',t);
      for (const px of [500,1400,2300,3100]){ const x=px-cx*0.25; if (x<-200||x>W+200) continue; tri(x-130,GROUND-60,x,GROUND-230,x+130,GROUND-60); ctx.fillStyle=mix('#c48d48','#7f4632',t); tri(x,GROUND-230,x+130,GROUND-60,x+20,GROUND-60); ctx.fillStyle=mix('#d9a35a','#9a5a3e',t); }
      // near dunes
      ctx.fillStyle=mix('#dca15a','#a65e3d',t); ctx.beginPath(); ctx.moveTo(-30,GROUND);
      for (let x=-30;x<=W+30;x+=20) ctx.lineTo(x,GROUND-34-Math.sin((x+cx*0.45)*0.01)*18);
      ctx.lineTo(W+30,GROUND); ctx.closePath(); ctx.fill();
      // cacti
      for (const n of S.nearTrees){ if (n.r<38) continue; const x=n.x-cx*0.6; if (x<-40||x>W+40) continue;
        const h=n.h*0.6; ctx.fillStyle='#4f8a3a'; ctx.beginPath(); ctx.roundRect(x-7,GROUND-h,14,h,7); ctx.fill();
        ctx.beginPath(); ctx.roundRect(x-22,GROUND-h*0.7,8,h*0.35,4); ctx.fill(); ctx.fillRect(x-22,GROUND-h*0.42,16,7);
        ctx.beginPath(); ctx.roundRect(x+14,GROUND-h*0.85,8,h*0.3,4); ctx.fill(); ctx.fillRect(x+6,GROUND-h*0.6,16,7); }
      // sandstone columns in the boss arena
      for (const r of S.ruins){ const x=r.x-cx; if (x<-60||x>W+60) continue;
        ctx.fillStyle='#c99a5e'; ctx.fillRect(x-20,GROUND-r.h,40,r.h); ctx.fillStyle='#e0b878'; ctx.fillRect(x-28,GROUND-r.h-(r.broken?0:14),56,r.broken?8:14);
        ctx.fillStyle='rgba(0,0,0,0.12)'; for (let y=GROUND-r.h+18;y<GROUND;y+=30) ctx.fillRect(x-20,y,40,3); }
      ctx.fillStyle='#e3b36b'; ctx.fillRect(-30,GROUND,W+60,H-GROUND+30);
      ctx.strokeStyle='#cf9c55'; ctx.lineWidth=2;
      for (let i=0;i<14;i++){ const x=((i*173-cx)%(W+200)+W+200)%(W+200)-100, y=GROUND+16+(i%5)*12; ctx.beginPath(); ctx.moveTo(x,y); ctx.quadraticCurveTo(x+30,y-5,x+60,y); ctx.stroke(); }
      ctx.fillStyle='#f0c47a'; ctx.fillRect(-30,GROUND-4,W+60,8);
      ctx.fillStyle='#b98a50'; for (const p of S.pebbles){ const x=p.x-cx; if (x>-10&&x<W+10 && p.r>4) circle(x,p.y,p.r*0.7); }
    },
  },
  castle: {
    platform:{post:'#2b2636', body:'#4a4458', line:'#3a3448', top:'#6a6380', vine:'#7a1f2f'},
    draw(cx){
      const S=SCENERY;
      const g=ctx.createLinearGradient(0,0,0,GROUND); g.addColorStop(0,'#07061a'); g.addColorStop(1,'#2b1d3d');
      ctx.fillStyle=g; ctx.fillRect(-30,-30,W+60,GROUND+40);
      ctx.fillStyle='rgba(255,255,255,0.8)';
      for (let i=0;i<40;i++){ const x=((i*211-cx*0.03)%W+W)%W, y=(i*97)%200+10; ctx.globalAlpha=0.4+0.4*Math.sin(clock*0.05+i); circle(x,y,1.2); }
      ctx.globalAlpha=1;
      ctx.fillStyle='rgba(220,210,255,0.25)'; circle(W*0.18-cx*0.02,100,60); ctx.fillStyle='#e9e4ff'; circle(W*0.18-cx*0.02,100,40);
      // far towers
      ctx.fillStyle='#141026';
      for (const m of S.mountains){ const x=m.x-cx*0.15; if (x+60<-20||x-60>W+20) continue; const h=m.h+60;
        ctx.fillRect(x-24,GROUND-h,48,h); tri(x-30,GROUND-h,x,GROUND-h-50,x+30,GROUND-h);
        ctx.fillStyle='#ffcf6b'; ctx.fillRect(x-4,GROUND-h+30,8,12); ctx.fillStyle='#141026'; }
      // inner wall with arched windows, banners and torches
      const wy=150;
      ctx.fillStyle='#2a2438'; ctx.fillRect(-30,wy,W+60,GROUND-wy);
      ctx.fillStyle='rgba(0,0,0,0.18)';
      for (let y=wy+20;y<GROUND;y+=28) ctx.fillRect(-30,y,W+60,2);
      const off=((-cx*0.6)%240+240)%240;
      for (let x=off-240;x<W+240;x+=240){
        ctx.fillStyle='#120e1f'; ctx.beginPath(); ctx.moveTo(x-28,GROUND-120); ctx.lineTo(x-28,wy+60); ctx.arc(x,wy+60,28,Math.PI,0); ctx.lineTo(x+28,GROUND-120); ctx.closePath(); ctx.fill();
        ctx.fillStyle='rgba(150,130,255,0.18)'; ctx.fillRect(x-22,wy+60,44,GROUND-120-wy-60);
        ctx.fillStyle='#7a1f2f'; ctx.fillRect(x+100,wy+10,30,90); tri(x+100,wy+100,x+115,wy+120,x+130,wy+100);
        ctx.fillStyle='#ffd34d'; circle(x+115,wy+40,6);
        const fl=Math.sin(clock*0.3+x)*2;
        ctx.fillStyle='rgba(255,160,60,0.18)'; circle(x-80,wy+150,30+fl);
        ctx.fillStyle='#5d4037'; ctx.fillRect(x-83,wy+150,6,18);
        ctx.fillStyle='#ff8a3d'; ctx.beginPath(); ctx.ellipse(x-80,wy+142,6,11+fl,0,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#ffe08a'; ctx.beginPath(); ctx.ellipse(x-80,wy+145,3,6,0,0,Math.PI*2); ctx.fill();
      }
      for (const r of S.ruins){ const x=r.x-cx; if (x<-60||x>W+60) continue;
        ctx.fillStyle='#3a3448'; ctx.fillRect(x-22,GROUND-r.h-40,44,r.h+40); ctx.fillStyle='#4a4458'; ctx.fillRect(x-30,GROUND-r.h-56,60,16); }
      ctx.fillStyle='#3a3448'; ctx.fillRect(-30,GROUND,W+60,H-GROUND+30);
      ctx.strokeStyle='rgba(0,0,0,0.3)'; ctx.lineWidth=2;
      const toff=((-cx)%64+64)%64;
      for (let x=toff-64;x<W+64;x+=64){ ctx.beginPath(); ctx.moveTo(x,GROUND); ctx.lineTo(x,H); ctx.stroke(); }
      ctx.fillStyle='#5a536e'; ctx.fillRect(-30,GROUND-4,W+60,8);
      if (cx>2600){ ctx.fillStyle='#6a0f2a'; ctx.fillRect(3040-cx,GROUND+6,W,22); ctx.fillStyle='#ffd34d'; ctx.fillRect(3040-cx,GROUND+6,W,2); ctx.fillRect(3040-cx,GROUND+26,W,2); }
    },
  },
};

function drawBG(){ THEMES[stage ? stage.theme : 'forest'].draw(cam.x); }
function drawPlatforms(){
  const c=THEMES[stage ? stage.theme : 'forest'].platform;
  for (const p of platforms){ const x=p.x-cam.x; if (x+p.w<-20||x>W+20) continue;
    ctx.fillStyle=c.post; ctx.fillRect(x+16,p.y+14,8,GROUND-p.y-14); ctx.fillRect(x+p.w-24,p.y+14,8,GROUND-p.y-14);
    ctx.fillStyle=c.body; ctx.beginPath(); ctx.roundRect(x,p.y,p.w,18,5); ctx.fill();
    ctx.fillStyle=c.line; for (let k=x+14;k<x+p.w-6;k+=28) ctx.fillRect(k,p.y+6,2,10);
    ctx.fillStyle=c.top; ctx.beginPath(); ctx.roundRect(x-3,p.y-3,p.w+6,8,4); ctx.fill();
    ctx.fillStyle=c.vine; for (let k=x+10;k<x+p.w;k+=37) ctx.fillRect(k,p.y+4,3,10+((k*7)%9));
  }
}
function loadStage(id){
  stage=STAGES[id]; worldW=stage.worldW; platforms=stage.platforms;
}
