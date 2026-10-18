'use strict';
// ===================== Heroes: stats, attacks, skills and look =====================
// Attack frames: `act` is the active window [from,to]; melee attacks have a hitbox `range`,
// ranged ones a `shot`. `next` chains the combo when Attack is pressed again.
const HEROES = {
  knight: {
    name:'KAIRA', title:'Cavaleira', desc:'Espada pesada, combos corpo a corpo',
    hp:500, speed:4.3, jump:-12, weapon:'sword', ghost:['#ff6a6a','#ff8a8a'], aura:'rgba(255,210,100,0.55)',
    stats:{vida:4, ataque:4, velocidade:3, alcance:2},
    look:{cape:'long', pony:13},
    col:{cape:'#1f4fa8',pants:'#2e3350',boots:'#4a3326',body:'#c9d3e0',chest:'#2f6fd6',belt:'#6b4a2a',hair:'#2b2f4a',band:'#ffd34d',eye:'#2a2a3a'},
    atk:{
      c1:  {dur:20,act:[5,10], dmg:20,range:82, kb:2.5,up:0,  lunge:2.5,next:'c2',arc:[-2.2,0.9]},
      c2:  {dur:20,act:[5,10], dmg:24,range:84, kb:2.5,up:0,  lunge:2.5,next:'c3',arc:[1.2,-1.7]},
      c3:  {dur:30,act:[9,15], dmg:40,range:102,kb:8,  up:-8, lunge:4.5,arc:[-2.7,1.4],heavy:true},
      air: {dur:20,act:[4,11], dmg:24,range:86, kb:3,  up:-3, lunge:0,  air:true,next:'air2',arc:[-2.0,1.6]},
      air2:{dur:22,act:[4,12], dmg:28,range:88, kb:5,  up:-4, lunge:0,  air:true,arc:[1.6,-1.8]},
      dash:{dur:26,act:[3,14], dmg:34,range:96, kb:9,  up:-5, lunge:7,  thrust:true,arc:[-0.1,-0.1]},
    },
    skills:[
      { name:'Onda de Espada', mp:100, inv:30, color:'#7fd7ff',
        update(p){
          if (p.t===12){
            addPlayerProj(p,{type:'wave',x:p.x+p.face*36,y:p.y-42,vx:p.face*12,vy:0,life:60,dmg:55,kb:6,up:-6,pierce:true});
            addShake(5); psfx('wave');
          }
          return p.t>=26;
        },
        angle:p => p.t<12 ? -2.4 : 0.3 },
      { name:'Giga Slash', mp:200, inv:75, freeze:true, cry:'GIGA SLASH!', color:'#ffcf5a',
        update(p){
          gatherSparks(p,'#ffcf5a',34);
          if (p.t===36){
            const cx=p.x, cy=p.y-40;
            ring(cx,cy,'#fff2b0',15,24,14); ring(cx,cy,'#ff8a3d',9,30,8);
            burst(cx,cy,'#ffd36b',40,10,0.1);
            flashScreen=0.7; addShake(18); psfx('boom');
            areaHit(p,cx,cy,310,230,130,9,-11);
            netSend({type:'fx',k:'giga',x:cx,y:cy});
          }
          return p.t>=54;
        },
        angle:p => p.t<36 ? -Math.PI/2-0.1 : 1.3 },
      { name:'Corte Relâmpago', mp:300, inv:90, hover:true, ult:true, cry:'CORTE RELÂMPAGO!', color:'#9fe3ff',
        update(p){
          if (p.t<18){ gatherSparks(p,'#9fe3ff',18); p.vx=0; return false; }
          if (p.t===18){ p.ultX0=p.x; psfx('dash'); }
          if (p.t<40){
            const [l,r]=bounds(); p.x=clamp(p.x+p.face*24,l+16,r-16);
            if (p.t%2===0) parts.push({ghost:true,hero:p.hero,x:p.x,y:p.y,face:p.face,anim:p.anim,life:14,max:14});
            if (p.t%4===2){ rectHit(p,p.x-70,p.x+70,p.y-110,p.y+10,26,1,-2); psfx('swing',false); }
          } else if (p.t===48){
            const x1=Math.min(p.ultX0,p.x)-40, x2=Math.max(p.ultX0,p.x)+40;
            for (let x=x1;x<x2;x+=60) burst(x,p.y-50,'#bff0ff',5,6,0.1);
            ring(p.x,p.y-45,'#e8fbff',14,22,10); flashScreen=0.6; addShake(16); psfx('boom');
            rectHit(p,x1,x2,p.y-130,p.y+10,120,6,-10);
            netSend({type:'fx',k:'slashline',x1,x2,y:p.y-50});
          }
          return p.t>=66;
        },
        angle:p => p.t<18 ? -2.6 : p.t<40 ? 0.05 : p.t<48 ? -2.5 : 1.25 },
    ],
  },
  archer: {
    name:'SYLVIE', title:'Arqueira', desc:'Ataca de longe; mira com ↑ e ↓',
    hp:420, speed:4.7, jump:-12.8, weapon:'bow', aim:true, ghost:['#6aff8a','#9affb0'], aura:'rgba(170,255,140,0.55)',
    stats:{vida:3, ataque:3, velocidade:4, alcance:5},
    look:{cape:'short', pony:16, quiver:true, skirt:'#00897b', ear:true, leaf:'#ba68c8'},
    col:{cape:'#00796b',pants:'#4e3b5c',boots:'#3e2f45',body:'#26a69a',chest:'#b2dfdb',belt:'#8d5a2b',hair:'#e6ebf2',band:'#ba68c8',eye:'#5e35b1'},
    atk:{
      c1:  {dur:15,act:[5,5], lunge:0,  next:'c2', shot:{dmg:17,spd:15}},
      c2:  {dur:15,act:[5,5], lunge:0,  next:'c3', shot:{dmg:19,spd:15}},
      c3:  {dur:26,act:[9,9], lunge:-2, heavy:true, shot:{dmg:36,spd:17,pierce:true,big:true,kb:7,up:-7}},
      air: {dur:16,act:[4,4], air:true, next:'air2', shot:{dmg:18,spd:14,ang:0.55}},
      air2:{dur:18,act:[4,4], air:true, shot:{dmg:18,spd:14,ang:0.45,count:2}},
      dash:{dur:24,act:[7,7], lunge:-3, heavy:true, shot:{dmg:32,spd:18,pierce:true,big:true,kb:8,up:-5}},
    },
    skills:[
      { name:'Leque de Flechas', mp:100, inv:30, color:'#b6ff9e',
        update(p){
          if (p.t===12){
            for (const d of [-0.32,-0.16,0,0.16,0.32]){
              const a=d+(p.aim||0);
              fireArrow(p,p.x+p.face*22,p.y-46,Math.cos(a)*16*p.face,Math.sin(a)*16,{dmg:30,pierce:true,big:true,kb:5,up:-5});
            }
            addShake(4); psfx('wave'); psfx('bow');
          }
          return p.t>=26;
        },
        angle:p => p.aim||0, pull:p => p.t<12 ? p.t : 0 },
      { name:'Chuva de Flechas', mp:200, inv:75, freeze:true, cry:'CHUVA DE FLECHAS!', color:'#b6ff9e',
        update(p){
          gatherSparks(p,'#b6ff9e',34);
          if (p.t===28){
            flashScreen=0.35; psfx('wave');
            for (let k=0;k<8;k++) fireArrow(p,p.x,p.y-60,p.face*rand(1,4),-18,{dmg:0,deco:true,life:14});
          }
          if (p.t>=36 && p.t<76 && p.t%2===0){
            for (let k=0;k<2;k++){ const tx=p.x+p.face*rand(30,470); fireArrow(p,tx-p.face*50,-20-rand(0,90),p.face*3,17,{dmg:26}); }
            if (p.t%6===0) psfx('shoot');
            if (p.t===50) addShake(6);
          }
          return p.t>=80;
        },
        angle:() => -1.35, pull:p => p.t<28 ? 12 : 0 },
      { name:'Flecha Estelar', mp:300, inv:90, hover:true, ult:true, cry:'FLECHA ESTELAR!', color:'#ffe28a',
        update(p){
          if (p.t<30){ gatherSparks(p,'#ffe28a',30); return false; }
          const len=1000, x1=p.face>0?p.x:p.x-len, x2=p.face>0?p.x+len:p.x;
          if (p.t===30){
            const b={type:'fx',k:'beam',x:p.x+p.face*30,y:p.y-46,face:p.face,len};
            FX_HANDLERS.beam(b); netSend(b);
            psfx('wave'); psfx('boom'); flashScreen=0.4; addShake(10);
          }
          if (p.t<62 && p.t%4===2) rectHit(p,x1,x2,p.y-84,p.y-8,24,2,-1);
          return p.t>=74;
        },
        angle:() => 0, pull:p => p.t<30 ? Math.min(14,p.t/2) : 0 },
    ],
  },
  mage: {
    name:'MIRELA', title:'Maga', desc:'Magias de área e teleporte curto',
    hp:380, speed:4.2, jump:-12.4, weapon:'staff', blink:true, ghost:['#b98cff','#d4b8ff'], aura:'rgba(200,150,255,0.55)',
    stats:{vida:2, ataque:5, velocidade:3, alcance:4},
    look:{cape:'short', pony:15, robe:'#5e35b1', hat:'#3f2a8f', orb:'#c79bff'},
    col:{cape:'#4527a0',pants:'#3b2d5c',boots:'#2e2340',body:'#7e57c2',chest:'#ffd34d',belt:'#ffd34d',hair:'#ff8a65',band:'#ffd34d',eye:'#4a148c'},
    atk:{
      c1:  {dur:16,act:[5,5], lunge:0, next:'c2', shot:{type:'bolt',dmg:16,spd:11,life:42,r:12}},
      c2:  {dur:16,act:[5,5], lunge:0, next:'c3', shot:{type:'bolt',dmg:18,spd:11,life:42,r:12}},
      c3:  {dur:28,act:[10,10], lunge:0, heavy:true, ang:-0.15, blast:{dx:95,r:72,dmg:40,kb:6,up:-9}},
      air: {dur:16,act:[4,4], air:true, next:'air2', shot:{type:'bolt',dmg:18,spd:11,life:40,r:12,ang:0.6}},
      air2:{dur:18,act:[4,4], air:true, shot:{type:'bolt',dmg:18,spd:11,life:40,r:12,ang:0.45,count:2}},
      dash:{dur:22,act:[6,6], lunge:0, heavy:true, shot:{type:'orb',dmg:34,spd:13,life:50,r:20,pierce:true,big:true,kb:7,up:-6}},
    },
    skills:[
      { name:'Bola de Fogo', mp:100, inv:30, color:'#ff9d4d',
        update(p){
          if (p.t===12){
            addPlayerProj(p,{type:'fireball',x:p.x+p.face*30,y:p.y-46,vx:p.face*9,vy:0,life:70,dmg:30,kb:4,up:-4,r:22,explode:{r:100,dmg:50,kb:7,up:-8}});
            psfx('wave');
          }
          return p.t>=26;
        },
        angle:p => p.t<12 ? -2.2 : 0 },
      { name:'Nevasca', mp:200, inv:60, hover:true, cry:'NEVASCA!', color:'#bfe9ff',
        update(p){
          if (p.t<16){ gatherSparks(p,'#bfe9ff',16); return false; }
          if (p.t===16){ const m={type:'fx',k:'blizzard',x:p.x,y:p.y}; FX_HANDLERS.blizzard(m); netSend(m); psfx('freeze'); }
          if (p.t<60 && p.t%6===0) areaHit(p,p.x,p.y-40,300,150,16,1,0);
          if (p.t===60){
            for (const t of targetsOf(p)) if (Math.abs(t.x-p.x)<300 && Math.abs(t.y-p.y)<170) stunAttacker(t.id);
            psfx('freeze');
          }
          return p.t>=70;
        },
        angle:() => -1.45 },
      { name:'Meteoro', mp:300, inv:90, hover:true, ult:true, cry:'METEORO!', color:'#ff9d4d',
        update(p){
          if (p.t<24){ gatherSparks(p,'#ff9d4d',24); return false; }
          if (p.t===24){
            const tx=p.x+p.face*260;
            addPlayerProj(p,{type:'meteor',x:tx-p.face*420,y:-120,vx:p.face*11,vy:15,life:90,dmg:0,pierce:true,r:40,explode:{r:240,dmg:210,kb:10,up:-13,big:true}});
          }
          return p.t>=70;
        },
        angle:() => -1.5 },
    ],
  },
  lancer: {
    name:'DARIO', title:'Lanceiro', desc:'Alcance longo, investidas e mergulhos',
    hp:540, speed:4.0, jump:-11.6, weapon:'spear', ghost:['#ffb74d','#ffd08a'], aura:'rgba(255,200,110,0.55)',
    stats:{vida:5, ataque:4, velocidade:2, alcance:3},
    look:{cape:'long', short:true, pad:'#cfd8dc'},
    col:{cape:'#8e1b1b',pants:'#3e2f2a',boots:'#2b201c',body:'#b0bec5',chest:'#c62828',belt:'#5d4037',hair:'#3e2723',band:'#c62828',eye:'#2a2a3a'},
    atk:{
      c1:  {dur:20,act:[6,10], dmg:20,range:122,kb:3,up:0, lunge:2,  next:'c2',thrust:true},
      c2:  {dur:20,act:[6,10], dmg:23,range:128,kb:3,up:0, lunge:2.5,next:'c3',thrust:true},
      c3:  {dur:32,act:[8,18], dmg:38,range:112,kb:7,up:-8,lunge:1,  both:true,heavy:true,arc:[-3.0,3.3]},
      air: {dur:70,act:[3,70], dmg:26,range:50, kb:4,up:-4,air:true,plunge:true},
      dash:{dur:26,act:[3,14], dmg:34,range:130,kb:9,up:-5,lunge:9,  thrust:true},
    },
    skills:[
      { name:'Investida', mp:100, inv:30, free:true, color:'#ffb74d',
        update(p){
          if (p.t<6){ p.vx=0; return false; }
          if (p.t===6){ psfx('dash'); p.hitIds=new Set(); }
          if (p.t<24){
            p.vx=p.face*17;
            if (p.t%2===0) parts.push({ghost:true,hero:p.hero,x:p.x,y:p.y,face:p.face,anim:p.anim,life:12,max:12});
            const x1=Math.min(p.x-30,p.x+p.face*120), x2=Math.max(p.x+30,p.x+p.face*120);
            for (const t of targetsOf(p)) if (!p.hitIds.has(t.id) && boxHits({x1,x2,y1:p.y-90,y2:p.y+10},t) && strike(p,t,34,p.face,8,-4)) p.hitIds.add(t.id);
          } else p.vx*=0.7;
          return p.t>=34;
        },
        angle:() => 0, reach:p => p.t>=6 && p.t<24 ? 20 : 0 },
      { name:'Redemoinho', mp:200, inv:60, free:true, spin:true, cry:'REDEMOINHO!', color:'#ffb74d',
        update(p){
          p.vx*=0.85;
          if (p.t>=10 && p.t<58 && p.t%5===0){
            for (const t of targetsOf(p)) if (Math.abs(t.x-p.x)<135 && Math.abs((t.y-t.h/2)-(p.y-40))<110) strike(p,t,18,t.x<p.x?1:-1,2,-1);
            psfx('swing',false);
          }
          if (p.t===60){
            for (const t of targetsOf(p)) if (Math.abs(t.x-p.x)<145 && Math.abs((t.y-t.h/2)-(p.y-40))<120) strike(p,t,50,t.x>=p.x?1:-1,8,-10);
            ring(p.x,p.y-45,'#ffd08a',10,20,8); psfx('boom'); addShake(8);
          }
          return p.t>=70;
        },
        angle:p => p.t>=10 && p.t<60 ? p.t*0.9 : -0.3 },
      { name:'Lança Celestial', mp:300, inv:110, free:true, ult:true, cry:'LANÇA CELESTIAL!', color:'#ffe08a',
        update(p){
          if (p.t<18){ gatherSparks(p,'#ffe08a',18); p.vx=0; if (p.vy>0) p.vy=0; return false; }
          if (p.t===18){ p.vy=-17; p.vx=p.face*3; psfx('djump'); }
          if (p.t>30 && !p.diving && !p.landT){ p.diving=true; p.vy=18; p.vx=p.face*6; }
          if (p.diving && p.onGround){
            p.diving=false; p.landT=p.t; p.vx=0;
            rectHit(p,p.x-170,p.x+170,p.y-150,p.y+10,150,9,-12);
            for (const d of [-1,1]) addPlayerProj(p,{type:'pshock',x:p.x+d*60,y:p.y,vx:d*9,vy:0,life:55,dmg:55,kb:6,up:-8,pierce:true,r:24});
            ring(p.x,p.y-20,'#ffe08a',14,26,12); burst(p.x,p.y-20,'#ffd36b',30,9,0.15); dust(p.x-60,p.y,10); dust(p.x+60,p.y,10);
            flashScreen=0.6; addShake(18); psfx('boom');
          }
          return (p.landT && p.t>=p.landT+22) || p.t>160;
        },
        angle:p => p.diving ? 1.45 : -1.5 },
    ],
  },
};
for (const h of Object.values(HEROES)) for (const k in h.atk) h.atk[k].name=k;
const HERO_IDS = Object.keys(HEROES);

// ----- drawing -----
function weaponAngle(p){
  const Hh=HEROES[p.hero], bow=Hh.weapon==='bow';
  switch (p.state){
    case 'attack': {
      const a=p.atk;
      if (a.shot) return aimedAngle(p,a.shot);
      if (a.blast) return a.ang || 0;
      if (a.plunge) return 1.35;
      if (a.thrust) return Hh.weapon==='spear' ? 0 : -0.08;
      if (p.t<a.act[0]) return a.arc[0];
      const k=clamp((p.t-a.act[0])/(a.act[1]-a.act[0]),0,1); return a.arc[0]+(a.arc[1]-a.arc[0])*k;
    }
    case 'skill': { const s=Hh.skills[p.sk]; return s && s.angle ? s.angle(p) : 0; }
    case 'dash': return bow ? -0.1 : -0.15;
    case 'guard': return bow ? -1.2 : -1.45;
    case 'roll': return bow ? 0.6 : 0.9;
    case 'hurt': return bow ? 0.9 : -2.1;
    case 'dead': return bow ? 0.9 : 0.8;
    default:
      if (bow) return p.onGround ? (Math.abs(p.vx)>0.5?0.35:0.15+Math.sin(p.anim*0.06)*0.05) : -0.25;
      if (Hh.weapon==='staff') return p.onGround ? -1.1+Math.sin(p.anim*0.06)*0.06 : -1.3;
      if (Hh.weapon==='spear') return p.onGround ? (Math.abs(p.vx)>0.5?-0.15:-0.35+Math.sin(p.anim*0.06)*0.04) : -0.5;
      return p.onGround ? (Math.abs(p.vx)>0.5?-0.45:-0.9+Math.sin(p.anim*0.06)*0.06) : -1.25;
  }
}

function drawHero(p,alpha=1,ghost=false,noShadow=false){
  const Hh=HEROES[p.hero], C=Hh.col, L=Hh.look, sx=p.x-cam.x;
  const [gc,gc2]=Hh.ghost;
  if (!ghost && !noShadow){ const s=surfaceBelow(p.x,p.y), d=clamp((s-p.y)/220,0,0.7); shadow(sx,s,20*(1-d)); }
  ctx.save(); ctx.translate(sx,p.y); ctx.scale(p.face,1);
  const big = p.state==='skill' && Hh.skills[p.sk] && Hh.skills[p.sk].freeze;
  ctx.globalAlpha = alpha * (!ghost && p.inv>0 && p.state!=='skill' && (p.inv>>2)%2 ? 0.45 : 1);
  if (ghost) ctx.globalCompositeOperation='lighter';
  if (p.state==='dead') ctx.rotate(-Math.PI/2*Math.min(1,p.t/15));
  // squash on landing, stretch while falling/jumping
  if (!ghost && !noShadow){
    if (p.onGround && p._air) p._land=8;
    p._air=!p.onGround && p.state!=='dead';
    if (p._land>0) p._land--;
  }
  let kx=1, ky=1;
  if (!p.onGround && p.state!=='skill' && p.state!=='dead'){ const s=clamp(Math.abs(p.vy)*0.011,0,0.12); ky=1+s; kx=1-s*0.6; }
  if (p._land>0){ const s=p._land/8*0.15; ky=1-s; kx=1+s*0.8; }
  ctx.scale(kx,ky);
  // double jump: a quick forward somersault around the body's center
  if (p.flip>0 && p.state==='free' && !p.onGround){ ctx.translate(0,-36); ctx.rotate((1-p.flip/FLIP_T)*Math.PI*2); ctx.translate(0,36); }
  if (p.state==='roll'){ ctx.translate(0,-30); ctx.rotate(Math.min(1,p.t/20)*Math.PI*2); ctx.translate(0,30); }
  if (big){ const gl=ctx.createRadialGradient(0,-45,5,0,-45,90); gl.addColorStop(0,Hh.aura); gl.addColorStop(1,'rgba(255,150,50,0)'); ctx.fillStyle=gl; circle(0,-45,90); }
  if (p.state==='skill' && !big && p.t<12){ ctx.strokeStyle=Hh.skills[p.sk].color; ctx.globalAlpha*=0.6; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(0,-45,40-p.t*2,0,Math.PI*2); ctx.stroke(); ctx.globalAlpha/=0.6; }
  const run = p.state==='free' && p.onGround && Math.abs(p.vx)>0.5, sprint = run && Math.abs(p.vx)>Hh.speed*1.2;
  if (sprint) ctx.rotate(0.14); // leaning forward while running
  const ph = run ? Math.sin(p.anim*(sprint?0.55:0.35)) : 0, air=!p.onGround && p.state!=='dead';
  const sway = Math.sin(p.anim*0.15)*3 + (run?Math.abs(p.vx)*1.5:0);
  // cape
  ctx.fillStyle=ghost?gc:C.cape;
  ctx.beginPath(); ctx.moveTo(-6,-56);
  if (L.cape==='short'){ ctx.quadraticCurveTo(-14-sway,-46,-20-sway*1.2,-34+Math.sin(p.anim*0.2)*3); ctx.lineTo(-4,-40); }
  else { ctx.quadraticCurveTo(-16-sway,-34,-22-sway*1.4,-14+Math.sin(p.anim*0.2)*3); ctx.lineTo(-2,-22); }
  ctx.closePath(); ctx.fill();
  if (L.quiver && !ghost){ ctx.save(); ctx.translate(-10,-52); ctx.rotate(-0.5);
    ctx.fillStyle='#8d5a2b'; ctx.fillRect(-4,-4,9,24); ctx.fillStyle=L.leaf; tri(-3,-4,0,-12,2,-4); tri(1,-4,4,-11,5,-4); ctx.restore(); }
  // legs (or a long robe)
  const legA = air ? -6 : -7+ph*-7, legB = air ? 6 : 2+ph*7;
  if (L.robe){
    ctx.fillStyle=ghost?gc:C.boots; ctx.fillRect(legA-1,-8,10,8); ctx.fillRect(legB-1,-8,11,8);
    ctx.fillStyle=ghost?gc:L.robe; ctx.beginPath(); ctx.moveTo(-12,-34); ctx.lineTo(13,-34); ctx.lineTo(17+ph*3,-6); ctx.lineTo(-17+ph*3,-6); ctx.closePath(); ctx.fill();
    if (!ghost){ ctx.fillStyle=C.chest; ctx.fillRect(-16+ph*3,-9,33,3); }
  } else {
    ctx.fillStyle=ghost?gc:C.pants;
    ctx.fillRect(legA,-31,8,air?20:24); ctx.fillRect(legB,-31,8,air?16:24);
    ctx.fillStyle=ghost?gc:C.boots;
    ctx.fillRect(legA-1,air?-13:-8,10,8); ctx.fillRect(legB-1,air?-17:-8,11,8);
  }
  // body
  ctx.fillStyle=ghost?gc2:C.body; ctx.beginPath(); ctx.roundRect(-11,-60,23,32,6); ctx.fill();
  if (!ghost){
    ctx.fillStyle=C.chest; ctx.fillRect(-11,-50,23,L.skirt?5:9);
    ctx.fillStyle=C.belt; ctx.fillRect(-11,-32,23,5);
    ctx.fillStyle=C.band; ctx.fillRect(-1,-32,5,5);
    if (L.skirt){ ctx.strokeStyle=C.belt; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(-10,-60); ctx.lineTo(10,-33); ctx.stroke();
      ctx.fillStyle=L.skirt; ctx.beginPath(); ctx.moveTo(-12,-32); ctx.lineTo(13,-32); ctx.lineTo(15,-22); ctx.lineTo(-14,-22); ctx.closePath(); ctx.fill(); }
    else if (!L.robe){ ctx.fillStyle=L.pad||'#e7edf5'; ctx.beginPath(); ctx.roundRect(-14,-62,12,10,4); ctx.fill(); }
    if (L.pad){ ctx.fillStyle=L.pad; circle(-6,-58,7); ctx.fillStyle='rgba(0,0,0,0.15)'; circle(-6,-56,4); }
  }
  // head
  if (!ghost && !L.short){
    ctx.save(); ctx.translate(-12,L.pony>14?-80:-76); ctx.rotate((L.pony>14?0.9:0.5)+Math.sin(p.anim*0.15)*0.15+(run?0.3:0)+(air?-0.4:0));
    ctx.fillStyle=C.hair; ctx.beginPath(); ctx.ellipse(-8,0,L.pony,L.pony>14?5:6,0,0,Math.PI*2); ctx.fill(); ctx.restore();
  }
  ctx.fillStyle=ghost?gc2:'#ffd9b8'; circle(2,-73,13);
  if (!ghost){
    if (L.ear){ ctx.fillStyle='#ffd9b8'; tri(-6,-76,-17,-86,-4,-69); }
    ctx.fillStyle=C.hair; ctx.beginPath(); ctx.arc(1,-76,14,Math.PI*0.92,Math.PI*2.08); ctx.fill();
    tri(4,-84,15,-77,8,-70); tri(-3,-84,6,-76,-2,-70);
    if (L.short){ tri(-12,-80,-6,-94,0,-86); tri(-4,-86,3,-96,8,-86); tri(4,-86,12,-93,14,-80); }
    ctx.fillStyle=C.band; ctx.fillRect(-10,-86,22,3);
    if (L.hat){
      ctx.fillStyle=L.hat; ctx.beginPath(); ctx.ellipse(1,-86,20,5,0,0,Math.PI*2); ctx.fill();
      ctx.beginPath(); ctx.moveTo(-11,-87); ctx.quadraticCurveTo(-4,-104,-14,-118+Math.sin(p.anim*0.1)*2); ctx.lineTo(13,-87); ctx.closePath(); ctx.fill();
      ctx.fillStyle=C.band; ctx.fillRect(-11,-90,24,3);
    }
    if (L.leaf){ ctx.fillStyle=L.leaf; tri(-10,-86,-16,-92,-6,-87); }
    ctx.fillStyle=C.eye; ctx.fillRect(8,-74,3,(p.anim%180<5)?1:5);
    if (p.state==='hurt'||p.state==='dead'){ ctx.fillStyle='#ffd9b8'; ctx.fillRect(7,-75,5,6); ctx.strokeStyle='#2a2a3a'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.moveTo(7,-74); ctx.lineTo(11,-71); ctx.moveTo(11,-74); ctx.lineTo(7,-71); ctx.stroke(); }
  }
  if (Hh.weapon==='bow') drawBow(p,ghost,gc2);
  else if (Hh.weapon==='staff') drawStaff(p,ghost,gc2);
  else if (Hh.weapon==='spear') drawSpear(p,ghost,gc2);
  else drawSword(p,ghost,gc2);
  if (p.state==='guard' && !ghost){
    const perfect=p.t<=PERFECT_GUARD, k=clamp((p.guardHp??100)/100,0.2,1);
    ctx.strokeStyle=perfect?'rgba(255,255,255,0.95)':`rgba(140,220,255,${0.35+0.4*k})`; ctx.lineWidth=perfect?5:3+3*k;
    ctx.beginPath(); ctx.arc(4,-42,34,-1.25,1.25); ctx.stroke();
    ctx.fillStyle=`rgba(140,220,255,${0.08+0.1*k})`; ctx.beginPath(); ctx.arc(4,-42,34,-1.25,1.25); ctx.closePath(); ctx.fill();
  }
  ctx.restore();
}

function drawBow(p,ghost,gc2){
  const ang=weaponAngle(p), a=p.atk, Hh=HEROES[p.hero];
  let pull=0;
  if (p.state==='attack' && a && p.t<a.act[0]) pull=10*p.t/a.act[0];
  else if (p.state==='skill' && Hh.skills[p.sk].pull) pull=Hh.skills[p.sk].pull(p);
  ctx.save(); ctx.translate(2,-47); ctx.rotate(ang);
  ctx.fillStyle=ghost?gc2:'#ffd9b8'; ctx.fillRect(0,-3,16,6);
  if (!ghost){
    const bx=16, r=22, e=1.2, ey=r*Math.sin(e);
    ctx.strokeStyle=['#8d5a2b','#a0a8b4','#5fc9d9','#e0b028','#5fbf6a','#e84a8a'][p.tier||0]; ctx.lineWidth=3.5; ctx.beginPath(); ctx.arc(bx-r*0.55,0,r,-e,e); ctx.stroke();
    ctx.fillStyle='#ffd34d'; ctx.fillRect(bx-r*0.55+r-2,-3,4,6);
    const sx0=bx-r*0.55+r*Math.cos(e);
    ctx.strokeStyle='#f0f0f0'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(sx0,-ey); ctx.lineTo(sx0-pull,0); ctx.lineTo(sx0,ey); ctx.stroke();
    if (pull>0){ ctx.strokeStyle='#e8d5a8'; ctx.lineWidth=2; ctx.beginPath(); ctx.moveTo(sx0-pull,0); ctx.lineTo(sx0-pull+30,0); ctx.stroke();
      ctx.fillStyle='#f5f5f5'; tri(sx0-pull+30,-3,sx0-pull+36,0,sx0-pull+30,3); }
    // aim guide while the bow is raised or lowered
    if ((p.state==='attack' || p.state==='skill') && Math.abs(p.aim||0)>0.08){
      ctx.strokeStyle='rgba(255,255,255,0.45)'; ctx.lineWidth=2; ctx.setLineDash([6,8]);
      ctx.beginPath(); ctx.moveTo(44,0); ctx.lineTo(130,0); ctx.stroke(); ctx.setLineDash([]);
    }
  }
  ctx.restore();
}

function drawStaff(p,ghost,gc2){
  const Hh=HEROES[p.hero], ang=weaponAngle(p);
  const casting=(p.state==='attack' && p.t<=p.atk.act[0]+4) || p.state==='skill';
  ctx.save(); ctx.translate(2,-47); ctx.rotate(ang);
  ctx.fillStyle=ghost?gc2:'#ffd9b8'; ctx.fillRect(0,-3,14,6);
  if (!ghost){
    ctx.strokeStyle='#6d4c41'; ctx.lineWidth=4; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(-22,0); ctx.lineTo(50,0); ctx.stroke();
    ctx.strokeStyle=WEAPON_TIERS[p.tier||0].tint||'#ffd34d'; ctx.lineWidth=p.tier>1?3:2; ctx.beginPath(); ctx.arc(55,0,8,0,Math.PI*2); ctx.stroke();
    const r=casting?18:11, g=ctx.createRadialGradient(55,0,1,55,0,r);
    g.addColorStop(0,'#ffffff'); g.addColorStop(0.4,Hh.look.orb); g.addColorStop(1,'rgba(160,110,255,0)');
    ctx.fillStyle=g; circle(55,0,r);
  }
  ctx.restore();
  if (p.state==='attack' && p.atk.blast && !ghost && p.t>=p.atk.act[0] && p.t<p.atk.act[0]+6){
    ctx.strokeStyle=`rgba(210,170,255,${1-(p.t-p.atk.act[0])/6})`; ctx.lineWidth=4; ctx.beginPath(); ctx.arc(p.atk.blast.dx,-40,(p.t-p.atk.act[0])*12+10,0,Math.PI*2); ctx.stroke();
  }
}
function drawSpear(p,ghost,gc2){
  const Hh=HEROES[p.hero], ang=weaponAngle(p);
  let reach=0;
  if (p.state==='attack' && p.atk.thrust) reach=clamp((p.t-p.atk.act[0]+3)/5,0,1)*24*(p.t>p.atk.act[1]+2?0.4:1);
  else if (p.state==='skill' && Hh.skills[p.sk].reach) reach=Hh.skills[p.sk].reach(p);
  ctx.save(); ctx.translate(2+reach,-47); ctx.rotate(ang);
  ctx.fillStyle=ghost?gc2:'#ffd9b8'; ctx.fillRect(0,-3,14,6);
  if (!ghost){
    ctx.strokeStyle='#8d6e63'; ctx.lineWidth=4; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(-34,0); ctx.lineTo(96,0); ctx.stroke();
    ctx.fillStyle=WEAPON_TIERS[p.tier||0].tint||'#cfd8dc'; ctx.beginPath(); ctx.moveTo(94,-6); ctx.lineTo(120,0); ctx.lineTo(94,6); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#ffd34d'; ctx.fillRect(90,-4,4,8);
    ctx.fillStyle=Hh.col.chest; tri(88,3,84,13,92,4);
  }
  ctx.restore();
  if (ghost) return;
  if (p.state==='attack') drawSwoosh(p,p.atk,-47);
  const s=p.state==='skill' && Hh.skills[p.sk];
  if (s && s.spin && p.t>=10 && p.t<60){
    ctx.strokeStyle='rgba(255,208,138,0.55)'; ctx.lineWidth=14; ctx.beginPath(); ctx.arc(2,-47,108,0,Math.PI*2); ctx.stroke();
    ctx.strokeStyle='rgba(255,255,255,0.8)'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(2,-47,112,p.t*0.9,p.t*0.9+2.2); ctx.stroke();
  }
}
function drawSword(p,ghost,gc2){
  const ang=weaponAngle(p);
  let reach=0; if (p.state==='attack' && p.atk.thrust) reach = clamp((p.t-p.atk.act[0]+3)/5,0,1)*16;
  ctx.save(); ctx.translate(2+reach,-47); ctx.rotate(ang);
  ctx.fillStyle=ghost?gc2:'#c9d3e0'; ctx.fillRect(0,-3,14,7);
  if (!ghost){
    ctx.fillStyle='#d4a017'; ctx.fillRect(12,-8,5,16); ctx.fillStyle='#6b3d1f'; ctx.fillRect(6,-2,7,4);
    const tint=WEAPON_TIERS[p.tier||0].tint;
    const bg=ctx.createLinearGradient(17,0,78,0); bg.addColorStop(0,'#ffffff'); bg.addColorStop(1,tint||'#9fb8d4');
    ctx.fillStyle=p.state==='skill'&&p.sk===1?'#ffe9a8':bg;
    ctx.beginPath(); ctx.moveTo(17,-4); ctx.lineTo(70,-3); ctx.lineTo(80,0); ctx.lineTo(70,3); ctx.lineTo(17,4); ctx.closePath(); ctx.fill();
    ctx.strokeStyle='rgba(80,100,130,0.6)'; ctx.lineWidth=1; ctx.beginPath(); ctx.moveTo(19,0); ctx.lineTo(70,0); ctx.stroke();
  }
  ctx.restore();
  if (p.state==='attack' && !ghost) drawSwoosh(p,p.atk,-47);
}

// Slash trail for melee attacks (in the hero's local, face-flipped space)
function drawSwoosh(p,a,cy){
  if (!(p.t>=a.act[0] && p.t<=a.act[1]+4)) return;
  if (a.plunge){
    ctx.strokeStyle='rgba(255,230,170,0.7)'; ctx.lineWidth=8; ctx.lineCap='round';
    ctx.beginPath(); ctx.moveTo(20,-70); ctx.lineTo(34,20); ctx.stroke(); return;
  }
  if (!a.arc && !a.thrust) return;
  const fade=1-Math.max(0,p.t-a.act[1])/5;
  ctx.lineCap='round';
  if (a.thrust){
    ctx.strokeStyle=`rgba(255,240,200,${0.8*fade})`; ctx.lineWidth=8;
    ctx.beginPath(); ctx.moveTo(-10,cy); ctx.lineTo(a.range+10,cy); ctx.stroke();
    return;
  }
  const k=clamp((p.t-a.act[0])/(a.act[1]-a.act[0]),0,1), cur=a.arc[0]+(a.arc[1]-a.arc[0])*k, ccw=a.arc[1]<a.arc[0];
  ctx.strokeStyle=a.heavy?`rgba(255,170,70,${0.55*fade})`:`rgba(150,210,255,${0.45*fade})`; ctx.lineWidth=a.heavy?22:15;
  ctx.beginPath(); ctx.arc(2,cy,a.range*0.78,a.arc[0],cur,ccw); ctx.stroke();
  ctx.strokeStyle=`rgba(255,255,255,${0.9*fade})`; ctx.lineWidth=a.heavy?7:4;
  ctx.beginPath(); ctx.arc(2,cy,a.range*0.82,a.arc[0],cur,ccw); ctx.stroke();
}

// A standing hero for menus and portraits (screen coordinates)
function drawHeroAt(hero,x,y,scale=1,opts={}){
  ctx.save(); ctx.translate(x,y); ctx.scale(scale,scale);
  const fake={hero,x:cam.x,y:0,face:opts.face||1,state:opts.state||'free',atk:opts.atk||null,t:opts.t||0,sk:0,tier:opts.tier||0,
    anim:opts.anim||0,onGround:true,vx:0,inv:0};
  drawHero(fake,opts.alpha??1,false,true);
  ctx.restore();
}
