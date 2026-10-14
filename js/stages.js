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
