'use strict';
// ===================== Stage themes: backgrounds, platforms, lights and ambience =====================
// Several stages can share a theme. Each theme has draw(cx), a platform palette and optional
// darkness(cx), lights(cx) and ambient(cx) (see render.js).
const SR = mulberry(7);
const SCENERY = {
  mountains: [...Array(22)].map((_,i)=>({x:i*140+SR()*60,h:110+SR()*130,w:170+SR()*120})),
  clouds:    [...Array(14)].map((_,i)=>({x:i*190+SR()*90,y:40+SR()*120,s:0.6+SR()*0.8})),
  farTrees:  [...Array(64)].map((_,i)=>({x:i*42+SR()*30,h:60+SR()*60})),
  nearTrees: [...Array(48)].map((_,i)=>({x:i*105+SR()*60,h:120+SR()*90,r:30+SR()*18})),
  tufts:     [...Array(460)].map(()=>({x:SR()*7000,s:0.6+SR()*0.8})),
  pebbles:   [...Array(280)].map(()=>({x:SR()*7000,y:GROUND+18+SR()*60,r:2+SR()*4})),
  ruins:     [{x:40,h:200},{x:260,h:120,broken:true},{x:580,h:160,broken:true},{x:920,h:210}], // around the boss arena (x from its left edge)
};

const THEMES = {
  forest: {
    platform:{post:'#5d4632', body:'#8d7458', line:'#6f5a44', top:'#6cc24f', vine:'#3f8a30'},
    darkness:cx => clamp((cx-arenaX()+740)/900,0,1)*0.3,   // the sun sets near the boss
    ambient(cx){ // falling leaves
      for (let i=0;i<16;i++){
        const x=((i*233-cx*0.9+clock*0.7)%(W+80)+W+80)%(W+80)-40, y=((i*131+clock*(0.8+(i%3)*0.3))%(H+40))-20;
        ctx.save(); ctx.translate(x+Math.sin(clock*0.03+i)*12,y); ctx.rotate(clock*0.04+i);
        ctx.fillStyle=i%3?'rgba(120,190,80,0.75)':'rgba(230,170,70,0.75)'; ctx.beginPath(); ctx.ellipse(0,0,5,2.5,0,0,Math.PI*2); ctx.fill(); ctx.restore();
      }
    },
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
      for (const r of S.ruins){ const x=arenaX()+r.x-cx; if (x<-60||x>W+60) continue;
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
    darkness:() => 0.55,
    lights(cx){
      const L=[];
      for (const r of SCENERY.ruins){ const x=arenaX()+r.x-cx; if (x>-200 && x<W+200) L.push({x,y:GROUND-r.h*0.6,r:170,c:'127,240,255'}); }
      SCENERY.farTrees.forEach((f,i)=>{ if (i%4) return; const x=f.x-cx*0.35; if (x>-100 && x<W+100) L.push({x,y:GROUND-40,r:90,c:f.h>90?'255,123,216':'127,240,255'}); });
      return L;
    },
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
      for (const r of S.ruins){ const x=arenaX()+r.x-cx; if (x<-80||x>W+80) continue;
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
    darkness:cx => clamp((cx-arenaX()+740)/900,0,1)*0.22,
    ambient(cx){ // sand blown by the wind
      ctx.strokeStyle='rgba(255,230,170,0.35)'; ctx.lineWidth=1.5;
      for (let i=0;i<22;i++){
        const x=((i*197-cx*1.1-clock*6)%(W+120)+W+120)%(W+120)-60, y=GROUND-10-((i*53)%300);
        ctx.beginPath(); ctx.moveTo(x,y); ctx.lineTo(x+18+(i%4)*6,y-1); ctx.stroke();
      }
    },
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
      for (const r of S.ruins){ const x=arenaX()+r.x-cx; if (x<-60||x>W+60) continue;
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
    // the Dark Lord's last phase puts the torches out (they flicker back for a moment now and then)
    darkness:() => darkLordLightsOut() ? 0.86 : 0.5,
    lights(cx){ // wall torches (same spacing as in draw)
      if (darkLordLightsOut() && clock%240>12) return [];
      const L=[], off=((-cx*0.6)%240+240)%240;
      for (let x=off-240;x<W+240;x+=240) L.push({x:x-80,y:292,r:150+Math.sin(clock*0.3+x)*6,c:'255,150,60'});
      return L;
    },
    ambient(cx){ // embers floating up
      for (let i=0;i<14;i++){
        const x=((i*271-cx*0.7)%(W+60)+W+60)%(W+60)-30+Math.sin(clock*0.02+i)*10, y=H-((i*97+clock*(0.6+(i%3)*0.25))%(H+40));
        ctx.fillStyle=`rgba(255,${140+(i%3)*30},60,${0.5+0.3*Math.sin(clock*0.1+i)})`; circle(x,y,1.6+(i%2));
      }
    },
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
      for (const r of S.ruins){ const x=arenaX()+r.x-cx; if (x<-60||x>W+60) continue;
        ctx.fillStyle='#3a3448'; ctx.fillRect(x-22,GROUND-r.h-40,44,r.h+40); ctx.fillStyle='#4a4458'; ctx.fillRect(x-30,GROUND-r.h-56,60,16); }
      ctx.fillStyle='#3a3448'; ctx.fillRect(-30,GROUND,W+60,H-GROUND+30);
      ctx.strokeStyle='rgba(0,0,0,0.3)'; ctx.lineWidth=2;
      const toff=((-cx)%64+64)%64;
      for (let x=toff-64;x<W+64;x+=64){ ctx.beginPath(); ctx.moveTo(x,GROUND); ctx.lineTo(x,H); ctx.stroke(); }
      ctx.fillStyle='#5a536e'; ctx.fillRect(-30,GROUND-4,W+60,8);
      if (cx>arenaX()-440){ ctx.fillStyle='#6a0f2a'; ctx.fillRect(arenaX()-cx,GROUND+6,W,22); ctx.fillStyle='#ffd34d'; ctx.fillRect(arenaX()-cx,GROUND+6,W,2); ctx.fillRect(arenaX()-cx,GROUND+26,W,2); }
    },
  },
};

// ===================== Terra Brasilis themes =====================
const BR = mulberry(21);
const BR_SCENERY = {
  houses: [...Array(40)].map((_,i)=>({x:i*118+BR()*20, w:96+BR()*28, h:130+BR()*90, c:(BR()*6)|0, roof:BR()>0.5})),
  skyline: [...Array(30)].map((_,i)=>({x:i*95+BR()*40, w:50+BR()*50, h:120+BR()*160})),
  poles: [...Array(24)].map((_,i)=>({x:i*240+BR()*60})),
};
const HOUSE_COLORS = ['#f4a259','#5b8e7d','#f4e285','#bc4b51','#8cb369','#4d9de0'];

THEMES.carnaval = {
  platform:{post:'#7a4a8c', body:'#c9a227', line:'#a6851d', top:'#e84a8a', vine:'#3ec1d3'},
  darkness:() => 0.3,
  lights(cx){ // lamps on the light strings
    const L=[];
    for (const p of BR_SCENERY.poles){ const x=p.x-cx*0.6; if (x>-160 && x<W+160) L.push({x,y:200,r:150,c:'255,200,120'}); }
    return L;
  },
  ambient(cx){ // confetti drifting down
    const cols=['#ff4fd8','#ffd23f','#3ec1d3','#7bd389','#ff9f1c'];
    for (let i=0;i<34;i++){
      const x=((i*173-cx*0.95+Math.sin(clock*0.02+i)*30)%(W+60)+W+60)%(W+60)-30, y=((i*97+clock*(0.7+(i%4)*0.25))%(H+30))-15;
      ctx.save(); ctx.translate(x,y); ctx.rotate(clock*0.05*(i%2?1:-1)+i); ctx.fillStyle=cols[i%5]; ctx.fillRect(-3,-1.5,6,3); ctx.restore();
    }
  },
  draw(cx){
    const S=BR_SCENERY;
    const g=ctx.createLinearGradient(0,0,0,GROUND); g.addColorStop(0,'#12062e'); g.addColorStop(0.6,'#4a1462'); g.addColorStop(1,'#a8326e');
    ctx.fillStyle=g; ctx.fillRect(-30,-30,W+60,GROUND+40);
    ctx.fillStyle='rgba(255,255,255,0.7)'; for (let i=0;i<30;i++) circle(((i*211-cx*0.03)%W+W)%W,(i*67)%170+10,1.1);
    // fireworks: a few bursts on a loop
    for (let k=0;k<3;k++){
      const T=(clock+k*70)%210, fx=((k*317+Math.floor((clock+k*70)/210)*191)%(W-200))+100, fy=70+k*35;
      if (T<60){ const r=T*1.6, a=1-T/60, cols=['#ffd23f','#ff4fd8','#3ec1d3'];
        for (let j=0;j<14;j++){ const an=j/14*Math.PI*2; ctx.globalAlpha=a; ctx.fillStyle=cols[(j+k)%3]; circle(fx+Math.cos(an)*r,fy+Math.sin(an)*r+T*0.3,2.2); } ctx.globalAlpha=1; }
    }
    // far skyline with lit windows
    ctx.fillStyle='#24103e';
    for (const b of S.skyline){ const x=b.x-cx*0.15; if (x+b.w<-20||x>W+20) continue; ctx.fillRect(x,GROUND-60-b.h,b.w,b.h+60);
      ctx.fillStyle='rgba(255,210,120,0.55)'; for (let wy=GROUND-50-b.h;wy<GROUND-70;wy+=22) for (let wx=x+8;wx<x+b.w-8;wx+=16) if (((wx*7+wy*3)|0)%5) ctx.fillRect(wx,wy,6,9); ctx.fillStyle='#24103e'; }
    // colorful colonial houses
    for (const hs of S.houses){ const x=hs.x-cx*0.45; if (x+hs.w<-20||x>W+20) continue; const top=GROUND-hs.h;
      ctx.fillStyle=HOUSE_COLORS[hs.c]; ctx.fillRect(x,top,hs.w-4,hs.h);
      ctx.fillStyle='#8a4b2a'; if (hs.roof){ ctx.beginPath(); ctx.moveTo(x-6,top); ctx.lineTo(x+hs.w/2,top-26); ctx.lineTo(x+hs.w+2,top); ctx.closePath(); ctx.fill(); } else ctx.fillRect(x-4,top-8,hs.w+4,10);
      ctx.fillStyle='#ffffff'; ctx.fillRect(x,top+4,hs.w-4,4);
      for (let wy=top+22;wy<GROUND-50;wy+=46) for (let wx=x+12;wx<x+hs.w-24;wx+=32){ ctx.fillStyle='#1d3557'; ctx.fillRect(wx,wy,16,26); ctx.fillStyle='rgba(255,220,140,0.6)'; ctx.fillRect(wx+2,wy+2,12,10); }
      ctx.fillStyle='#5a2e1a'; ctx.fillRect(x+hs.w/2-12,GROUND-44,22,44); }
    // light strings between poles
    for (const p of S.poles){ const x=p.x-cx*0.6; if (x<-260||x>W+20) continue;
      ctx.fillStyle='#3a2a4a'; ctx.fillRect(x-3,170,6,GROUND-170);
      const x2=x+240*0.6*1.6; ctx.strokeStyle='rgba(30,20,40,0.9)'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(x,176); ctx.quadraticCurveTo((x+x2)/2,230,x2,176); ctx.stroke();
      for (let k=1;k<10;k++){ const t=k/10, bx=x+(x2-x)*t, by=176+ (1-(2*t-1)**2)*27; ctx.fillStyle=['#ffd23f','#ff4fd8','#3ec1d3','#7bd389'][(k+Math.floor(clock/20))%4]; circle(bx,by+3,3.2); } }
    // sambódromo stands behind the boss arena
    const ax=arenaX()-cx;
    if (ax<W){ for (let k=0;k<6;k++){ ctx.fillStyle=k%2?'#5c5470':'#6d6582'; ctx.fillRect(ax,GROUND-60-k*34,1200,34); }
      for (let i=0;i<160;i++){ const px=ax+((i*53)%1180)+10, py=GROUND-72-((i*7)%6)*34+Math.sin(clock*0.15+i)*2; ctx.fillStyle=['#ffd23f','#ff4fd8','#3ec1d3','#ffffff','#7bd389'][i%5]; circle(px,py,4); } }
    // cobbled street
    ctx.fillStyle='#4a4458'; ctx.fillRect(-30,GROUND,W+60,H-GROUND+30);
    ctx.fillStyle='#5a5470'; const off=((-cx)%40+40)%40;
    for (let y=GROUND+8;y<H;y+=16) for (let x=off-40+(y%32?20:0);x<W+40;x+=40){ ctx.beginPath(); ctx.roundRect(x,y,34,11,4); ctx.fill(); }
    ctx.fillStyle='#e84a8a'; ctx.fillRect(-30,GROUND-4,W+60,6);
    const cols=['#ff4fd8','#ffd23f','#3ec1d3','#7bd389'];
    for (const f of SCENERY.tufts){ const x=f.x-cx; if (x<-10||x>W+10) continue; ctx.fillStyle=cols[(f.x|0)%4]; ctx.fillRect(x,GROUND+4+((f.x*7)|0)%20,4,2.5); }
  },
};

THEMES.pascoa = {
  platform:{post:'#6b3e26', body:'#7b4a2e', line:'#5a321e', top:'#a0673c', vine:'#ffd6e0'},
  ambient(cx){ // butterflies
    for (let i=0;i<8;i++){
      const x=((i*263-cx*0.8+clock*0.6)%(W+60)+W+60)%(W+60)-30+Math.sin(clock*0.03+i)*30, y=140+((i*71)%220)+Math.sin(clock*0.05+i*2)*20, f=Math.abs(Math.sin(clock*0.3+i));
      ctx.fillStyle=['#ffafcc','#bde0fe','#ffd166','#cdb4db'][i%4]; ctx.beginPath(); ctx.ellipse(x-4*f,y,5*f+1,4,0,0,Math.PI*2); ctx.ellipse(x+4*f,y,5*f+1,4,0,0,Math.PI*2); ctx.fill();
    }
  },
  draw(cx){
    const S=SCENERY, t=clamp(cx/(worldW-W),0,1);
    const g=ctx.createLinearGradient(0,0,0,GROUND); g.addColorStop(0,mix('#a2d2ff','#cdb4db',t)); g.addColorStop(1,mix('#fde2e4','#ffc8dd',t));
    ctx.fillStyle=g; ctx.fillRect(-30,-30,W+60,GROUND+40);
    ctx.fillStyle='rgba(255,255,255,0.85)';
    for (const c of S.clouds){ const x=((c.x-cx*0.08+clock*0.12)%2700+2700)%2700-200; if (x>W+100) continue; circle(x,c.y,22*c.s); circle(x+24*c.s,c.y-10*c.s,26*c.s); circle(x+52*c.s,c.y,20*c.s); }
    // pastel hills
    for (const [f,col,h,o] of [[0.15,'#b5e48c',110,0],[0.35,'#99d98c',70,900]]){
      ctx.fillStyle=col; ctx.beginPath(); ctx.moveTo(-30,GROUND);
      for (let x=-30;x<=W+30;x+=20) ctx.lineTo(x,GROUND-40-h*0.5-Math.sin((x+cx*f+o)*0.006)*h*0.5);
      ctx.lineTo(W+30,GROUND); ctx.closePath(); ctx.fill();
    }
    // giant decorated chocolate eggs
    const pal=['#7b4a2e','#ffafcc','#bde0fe','#ffd166'];
    for (const n of S.nearTrees){ if (n.r<36) continue; const x=n.x-cx*0.6; if (x<-60||x>W+60) continue; const h=n.h*0.55, k=(n.x|0)%4;
      ctx.fillStyle=pal[k]; ctx.beginPath(); ctx.ellipse(x,GROUND-h/2,h*0.36,h/2,0,0,Math.PI*2); ctx.fill();
      ctx.fillStyle=pal[(k+1)%4]; ctx.fillRect(x-h*0.34,GROUND-h*0.55,h*0.68,8); ctx.fillStyle=pal[(k+2)%4]; for (let d=-2;d<=2;d++) circle(x+d*h*0.12,GROUND-h*0.35,4); }
    // chocolate factory behind the boss arena
    const fx=arenaX()-cx;
    if (fx<W){ ctx.fillStyle='#6b3e26'; ctx.fillRect(fx+60,GROUND-260,820,260);
      ctx.fillStyle='#8b5a3c'; for (let k=0;k<5;k++) ctx.fillRect(fx+100+k*160,GROUND-330,50,80);
      ctx.fillStyle='rgba(255,255,255,0.6)'; for (let k=0;k<5;k++) circle(fx+125+k*160+Math.sin(clock*0.03+k)*6,GROUND-350-((clock*0.5+k*30)%60),12);
      ctx.fillStyle='#ffd6e0'; for (let k=0;k<7;k++){ ctx.beginPath(); ctx.roundRect(fx+110+k*110,GROUND-200,60,50,10); ctx.fill(); }
      ctx.fillStyle='#ffafcc'; ctx.fillRect(fx+60,GROUND-270,820,14); }
    ctx.fillStyle='#8ac926'; ctx.fillRect(-30,GROUND,W+60,H-GROUND+30);
    ctx.fillStyle='#76b51f'; for (const p of S.pebbles){ const x=p.x-cx; if (x>-10&&x<W+10) circle(x,p.y,p.r); }
    ctx.fillStyle='#b9e769'; ctx.fillRect(-30,GROUND-4,W+60,8);
    for (const f of S.tufts){ const x=f.x-cx; if (x<-10||x>W+10) continue; ctx.fillStyle=['#ffafcc','#ffffff','#ffd166','#cdb4db'][(f.x|0)%4]; circle(x,GROUND-5,3*f.s); ctx.fillStyle='#ffd166'; circle(x,GROUND-5,1.2*f.s); }
  },
};

THEMES.junina = {
  platform:{post:'#6b4a2a', body:'#a0703a', line:'#7a5230', top:'#c99554', vine:'#e9c46a'},
  darkness:() => 0.4,
  lights(cx){ const L=[]; for (const p of BR_SCENERY.poles){ const x=p.x-cx*0.6; if (x>-160 && x<W+160) L.push({x,y:180,r:130,c:'255,210,120'}); } return L; },
  ambient(cx){ // fireflies
    for (let i=0;i<18;i++){ const x=((i*197-cx*0.7)%(W+40)+W+40)%(W+40)-20+Math.sin(clock*0.02+i)*20, y=200+((i*61)%220)+Math.sin(clock*0.04+i)*15;
      ctx.fillStyle=`rgba(255,240,140,${0.4+0.4*Math.sin(clock*0.15+i*2)})`; circle(x,y,2); }
  },
  draw(cx){
    const S=BR_SCENERY;
    const g=ctx.createLinearGradient(0,0,0,GROUND); g.addColorStop(0,'#0b1d3a'); g.addColorStop(1,'#3b2a5a');
    ctx.fillStyle=g; ctx.fillRect(-30,-30,W+60,GROUND+40);
    ctx.fillStyle='rgba(255,255,255,0.8)'; for (let i=0;i<45;i++) circle(((i*211-cx*0.03)%W+W)%W,(i*67)%220+10,1.2);
    ctx.fillStyle='#fff6d5'; circle(W*0.8-cx*0.02,80,30);
    // far hills and a little church
    ctx.fillStyle='#1d2a44'; ctx.beginPath(); ctx.moveTo(-30,GROUND);
    for (let x=-30;x<=W+30;x+=20) ctx.lineTo(x,GROUND-90-Math.sin((x+cx*0.15)*0.007)*40); ctx.lineTo(W+30,GROUND); ctx.closePath(); ctx.fill();
    const chx=900-cx*0.15; ctx.fillStyle='#e9e4d8'; ctx.fillRect(chx,GROUND-210,70,110); tri(chx-6,GROUND-210,chx+35,GROUND-250,chx+76,GROUND-210); ctx.fillRect(chx+28,GROUND-290,14,44); ctx.fillStyle='#ffd36b'; ctx.fillRect(chx+26,GROUND-160,18,30);
    // festival stalls (barracas) with striped roofs
    for (const hs of S.houses){ const x=hs.x*1.1-cx*0.45; if (x+100<-20||x>W+20) continue; const top=GROUND-110;
      ctx.fillStyle='#8a5a2a'; ctx.fillRect(x+6,top,6,110); ctx.fillRect(x+84,top,6,110);
      for (let k=0;k<6;k++){ ctx.fillStyle=k%2?'#ffffff':['#e63946','#2a9d8f','#e9c46a','#f4a261'][hs.c%4]; ctx.beginPath(); ctx.moveTo(x+k*16,top); ctx.lineTo(x+k*16+16,top); ctx.lineTo(x+k*16+16,top+22); ctx.lineTo(x+k*16,top+22); ctx.closePath(); ctx.fill(); }
      ctx.fillStyle='#c99554'; ctx.fillRect(x,top+70,96,12); ctx.fillStyle='rgba(255,220,140,0.5)'; ctx.fillRect(x+10,top+30,76,38); }
    // strings of little flags (bandeirinhas)
    for (const p of S.poles){ const x=p.x-cx*0.6; if (x<-260||x>W+20) continue;
      ctx.fillStyle='#4a3a2a'; ctx.fillRect(x-3,150,6,GROUND-150);
      const x2=x+230; ctx.strokeStyle='rgba(40,30,20,0.8)'; ctx.lineWidth=1.2; ctx.beginPath(); ctx.moveTo(x,156); ctx.quadraticCurveTo(x+115,200,x2,156); ctx.stroke();
      for (let k=1;k<12;k++){ const t=k/12, bx=x+(x2-x)*t, by=156+(1-(2*t-1)**2)*22, sw=Math.sin(clock*0.08+k)*2;
        ctx.fillStyle=['#e63946','#ffd23f','#2a9d8f','#4d9de0','#ff4fd8','#7bd389'][k%6]; tri(bx-6,by,bx+6,by,bx+sw,by+14); } }
    // the big festival arch over the boss arena
    const ax=arenaX()+460-cx; if (ax>-300 && ax<W+300){ ctx.strokeStyle='#8a5a2a'; ctx.lineWidth=14; ctx.beginPath(); ctx.arc(ax,GROUND,260,Math.PI,0); ctx.stroke();
      for (let k=0;k<16;k++){ const a=Math.PI+k/15*Math.PI; ctx.fillStyle=['#e63946','#ffd23f','#2a9d8f','#4d9de0'][k%4]; tri(ax+Math.cos(a)*260-7,GROUND+Math.sin(a)*260,ax+Math.cos(a)*260+7,GROUND+Math.sin(a)*260,ax+Math.cos(a)*244,GROUND+Math.sin(a)*244+14); } }
    // packed earth with straw
    ctx.fillStyle='#7a5434'; ctx.fillRect(-30,GROUND,W+60,H-GROUND+30);
    ctx.fillStyle='#634329'; for (const p of SCENERY.pebbles){ const x=p.x-cx; if (x>-10&&x<W+10) circle(x,p.y,p.r); }
    ctx.fillStyle='#a07a4a'; ctx.fillRect(-30,GROUND-3,W+60,6);
    ctx.strokeStyle='#e9c46a'; ctx.lineWidth=1.5; for (const f of SCENERY.tufts){ const x=f.x-cx; if (x<-10||x>W+10) continue; ctx.beginPath(); ctx.moveTo(x,GROUND+2); ctx.lineTo(x+6*f.s,GROUND-6*f.s); ctx.stroke(); }
  },
};

THEMES.saci = {
  platform:{post:'#2e2418', body:'#4a3a28', line:'#3a2e20', top:'#3f6b3a', vine:'#2f5a2a'},
  darkness:() => 0.62,
  lights(cx){ // hanging oil lanterns
    const L=[]; for (const p of BR_SCENERY.poles){ const x=p.x-cx*0.6+40; if (x>-160 && x<W+160) L.push({x,y:250,r:140,c:'255,190,100'}); } return L;
  },
  ambient(cx){
    // drifting fog banks
    for (let i=0;i<6;i++){ const x=((i*311-cx*0.5+clock*0.25)%(W+400)+W+400)%(W+400)-200, y=GROUND-30-(i%3)*40;
      const g=ctx.createRadialGradient(x,y,10,x,y,160); g.addColorStop(0,'rgba(200,210,230,0.16)'); g.addColorStop(1,'rgba(200,210,230,0)'); ctx.fillStyle=g; ctx.fillRect(x-160,y-80,320,160); }
    // a little whirlwind of leaves (the Saci's sign)
    const wx=((700-cx*0.9+clock*0.8)%(W+300)+W+300)%(W+300)-150;
    for (let k=0;k<14;k++){ const a=clock*0.25+k*0.9, r=6+k*1.6; ctx.fillStyle=k%2?'#8fbf6a':'#c9a227'; ctx.fillRect(wx+Math.cos(a)*r,GROUND-8-k*7,4,2.5); }
  },
  draw(cx){
    const S=SCENERY;
    const g=ctx.createLinearGradient(0,0,0,GROUND); g.addColorStop(0,'#050914'); g.addColorStop(1,'#1c2b33');
    ctx.fillStyle=g; ctx.fillRect(-30,-30,W+60,GROUND+40);
    ctx.fillStyle='rgba(255,255,255,0.75)'; for (let i=0;i<50;i++) circle(((i*211-cx*0.03)%W+W)%W,(i*53)%200+8,1);
    ctx.fillStyle='rgba(240,240,220,0.25)'; circle(W*0.25-cx*0.02,90,56); ctx.fillStyle='#f2efe0'; circle(W*0.25-cx*0.02,90,36);
    // layered jungle silhouettes
    for (const [f,col,base,list] of [[0.15,'#0f1d1f',120,S.mountains],[0.35,'#13282a',60,S.farTrees]]){
      ctx.fillStyle=col;
      for (const t of list){ const x=t.x*(f===0.15?1:1.6)-cx*f; if (x<-140||x>W+140) continue; const h=(t.h||80)+base;
        circle(x,GROUND-h,46); circle(x-34,GROUND-h+26,36); circle(x+36,GROUND-h+22,38); ctx.fillRect(x-8,GROUND-h,16,h); }
      ctx.fillRect(-30,GROUND-base,W+60,base);
    }
    // near trees with hanging vines, and palm leaves
    for (const n of S.nearTrees){ const x=n.x-cx*0.6; if (x<-100||x>W+100) continue;
      ctx.fillStyle='#1a1410'; ctx.fillRect(x-9,GROUND-n.h-40,18,n.h+40);
      ctx.fillStyle='#1d3a26'; circle(x,GROUND-n.h-50,n.r+12); circle(x-n.r,GROUND-n.h-30,n.r*0.9); circle(x+n.r,GROUND-n.h-34,n.r*0.95);
      ctx.strokeStyle='#244a2c'; ctx.lineWidth=2; for (let k=-1;k<=1;k++){ ctx.beginPath(); ctx.moveTo(x+k*22,GROUND-n.h-30); ctx.quadraticCurveTo(x+k*24+6,GROUND-n.h+30,x+k*20,GROUND-n.h+60+((n.x|0)%30)); ctx.stroke(); } }
    // lantern posts
    for (const p of BR_SCENERY.poles){ const x=p.x-cx*0.6+40; if (x<-30||x>W+30) continue;
      ctx.fillStyle='#2e2418'; ctx.fillRect(x-3,236,6,GROUND-236); ctx.fillRect(x-3,236,20,4);
      ctx.fillStyle='#3a2a1a'; ctx.fillRect(x+10,240,12,16); ctx.fillStyle='#ffcf6b'; ctx.fillRect(x+12,243,8,10); }
    // old stone well and wooden cross-fence at the clearing (boss arena)
    const ax=arenaX()-cx;
    if (ax<W && ax>-1000){ ctx.fillStyle='#3a3a3a'; ctx.fillRect(ax+420,GROUND-60,110,60); ctx.fillStyle='#2a2a2a'; ctx.fillRect(ax+414,GROUND-66,122,10);
      ctx.fillStyle='#4a3a28'; for (let k=0;k<12;k++) ctx.fillRect(ax+40+k*80,GROUND-50,6,50); ctx.fillRect(ax+40,GROUND-40,900,5); }
    ctx.fillStyle='#1c1a14'; ctx.fillRect(-30,GROUND,W+60,H-GROUND+30);
    ctx.fillStyle='#2a2618'; for (const p of S.pebbles){ const x=p.x-cx; if (x>-10&&x<W+10) circle(x,p.y,p.r); }
    ctx.fillStyle='#24361f'; ctx.fillRect(-30,GROUND-3,W+60,6);
    ctx.fillStyle='#2f4a26'; for (const f of S.tufts){ const x=f.x-cx; if (x<-10||x>W+10) continue; tri(x-5*f.s,GROUND-2,x,GROUND-16*f.s,x+5*f.s,GROUND-2); }
  },
};

THEMES.natal = {
  platform:{post:'#6b4a2a', body:'#2a9d8f', line:'#1f7a70', top:'#e63946', vine:'#ffd23f'},
  darkness:cx => 0.15+clamp((cx-arenaX()+840)/1000,0,1)*0.25,   // sunset turning into a Christmas night
  lights(cx){
    const L=[]; for (const n of SCENERY.nearTrees){ const x=n.x-cx*0.6; if (x>-120 && x<W+120 && (n.x|0)%2) L.push({x,y:GROUND-n.h-20,r:110,c:'255,220,140'}); }
    const tx=arenaX()+480-cx; if (tx>-300 && tx<W+300) L.push({x:tx,y:GROUND-200,r:260,c:'255,230,150'});
    return L;
  },
  ambient(cx){ // sparkles in the warm evening air
    for (let i=0;i<20;i++){ const x=((i*173-cx*0.8)%(W+40)+W+40)%(W+40)-20, y=120+((i*83+clock*0.4)%280);
      ctx.fillStyle=`rgba(255,240,180,${0.3+0.3*Math.sin(clock*0.12+i)})`; circle(x,y,1.6); }
  },
  draw(cx){
    const S=SCENERY, t=clamp(cx/(worldW-W),0,1);
    const g=ctx.createLinearGradient(0,0,0,GROUND); g.addColorStop(0,mix('#ff9e7a','#2b2d6e',t)); g.addColorStop(0.7,mix('#ffd6a5','#b56576',t)); g.addColorStop(1,mix('#ffe8c2','#e56b6f',t));
    ctx.fillStyle=g; ctx.fillRect(-30,-30,W+60,GROUND+40);
    ctx.fillStyle=mix('#fff1c1','#ffd6a5',t); circle(W*0.7-cx*0.02,GROUND-150+t*120,50);
    // the sea
    const sy=GROUND-120;
    ctx.fillStyle=mix('#4fb3bf','#355c7d',t); ctx.fillRect(-30,sy,W+60,80);
    ctx.strokeStyle='rgba(255,255,255,0.5)'; ctx.lineWidth=2;
    for (let i=0;i<10;i++){ const x=((i*137-cx*0.2+clock*0.4)%(W+60)+W+60)%(W+60)-30, y=sy+10+(i%4)*16; ctx.beginPath(); ctx.arc(x,y,12,Math.PI*1.1,Math.PI*1.9); ctx.stroke(); }
    ctx.fillStyle='#f2d16b'; ctx.fillRect(-30,sy+70,W+60,60);
    // coconut palms wrapped in Christmas lights
    for (const n of S.nearTrees){ const x=n.x-cx*0.6; if (x<-100||x>W+100) continue; const top=GROUND-n.h-30;
      ctx.strokeStyle='#7a5434'; ctx.lineWidth=12; ctx.beginPath(); ctx.moveTo(x,GROUND); ctx.quadraticCurveTo(x+18,(GROUND+top)/2,x+8,top); ctx.stroke();
      ctx.fillStyle='#2d6a4f'; for (let k=0;k<6;k++){ const a=-Math.PI/2+(k-2.5)*0.55; ctx.save(); ctx.translate(x+8,top); ctx.rotate(a); ctx.beginPath(); ctx.ellipse(32,0,34,8,0.25,0,Math.PI*2); ctx.fill(); ctx.restore(); }
      ctx.fillStyle='#6b4a2a'; circle(x+4,top+8,6); circle(x+14,top+10,6);
      for (let k=0;k<7;k++){ const yy=GROUND-12-k*(n.h/7), xx=x+((yy-GROUND)/(top-GROUND))*14; ctx.fillStyle=['#e63946','#ffd23f','#2a9d8f','#ffffff'][(k+Math.floor(clock/18))%4]; circle(xx,yy,3); } }
    // the giant Christmas tree in the boss arena
    const tx=arenaX()+480-cx;
    if (tx>-300 && tx<W+300){
      ctx.fillStyle='#5a3a1a'; ctx.fillRect(tx-14,GROUND-40,28,40);
      for (let k=0;k<4;k++){ const w=200-k*44, y=GROUND-40-k*70; ctx.fillStyle=k%2?'#2d6a4f':'#1b4332'; tri(tx-w/2,y,tx,y-110,tx+w/2,y); }
      ctx.fillStyle='#ffd23f'; for (let k=0;k<5;k++){ const a=-Math.PI/2+k*Math.PI*2/5; circle(tx+Math.cos(a)*14,GROUND-370+Math.sin(a)*14,6); } circle(tx,GROUND-370,8);
      for (let k=0;k<24;k++){ const yy=GROUND-60-(k*13)%300, ww=(200-((GROUND-60-yy)/70)*44)*0.4; ctx.fillStyle=['#e63946','#ffd23f','#4d9de0','#ff4fd8'][(k+Math.floor(clock/15))%4]; circle(tx+Math.sin(k*2.3)*ww,yy,4); }
    }
    // sand
    ctx.fillStyle='#ecc979'; ctx.fillRect(-30,GROUND,W+60,H-GROUND+30);
    ctx.fillStyle='#d9b464'; for (const p of S.pebbles){ const x=p.x-cx; if (x>-10&&x<W+10) circle(x,p.y,p.r*0.8); }
    ctx.fillStyle='#f6dc94'; ctx.fillRect(-30,GROUND-3,W+60,6);
    for (const f of S.tufts){ const x=f.x-cx; if (x<-10||x>W+10 || (f.x|0)%5) continue; ctx.fillStyle='#ffffff'; circle(x,GROUND+10,3); ctx.fillStyle='#ffb3c6'; circle(x+2,GROUND+9,1.5); }
  },
};
