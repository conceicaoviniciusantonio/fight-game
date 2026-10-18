'use strict';
// ===================== Enemy tricks =====================
// Each regular enemy gets one thing of its own on top of its basic AI, so every stage plays differently.
// Hooks (all run on the browser that owns the world):
//   ai(e,tg,dx,adx)  → return true to replace the basic AI this tick (special states)
//   tick(e,tg)       → runs after the AI
//   onHit(e,p)       → one of its melee hits reached a hero
//   onKill(e,dir)    → return true to cancel the death (e.g. skeletons fall apart and reassemble)
// `hitFx` on a type adds effects to its hits (status, knockback, stolen MP or gold — see hurtExtras).

// Little extra foes some tricks create
Object.assign(ENEMY_TYPES, {
  pintinho:{hp:30, w:20, h:24, speed:2.5, dmg:14, ai:'melee', reach:28, windup:16, score:30, look:{kind:'chicken', s:0.55, body:'#ffd23f', comb:'#ff9f1c'}},
  corvo:{hp:35, w:30, h:26, speed:2.6, dmg:18, ai:'flyer', fly:true, score:50, look:{kind:'bat', body:'#1b1b2e', wing:'#2b2d42', eye:'#ffd23f'}},
});
const hitFxOf = e => ENEMY_TYPES[e.type].hitFx || {};
Object.assign(ENEMY_TYPES.scorpion,   {hitFx:{status:{poison:180}}});
Object.assign(ENEMY_TYPES.mummy,      {hitFx:{status:{grab:100}}});
Object.assign(ENEMY_TYPES.saci,       {hitFx:{stealMp:80}});
Object.assign(ENEMY_TYPES.fogofatuo,  {hitFx:{status:{slow:120}}});
Object.assign(ENEMY_TYPES.bonecao,    {hitFx:{kb:12, up:-9}});
Object.assign(ENEMY_TYPES.rena,       {hitFx:{kb:11}});
Object.assign(ENEMY_TYPES.duende,     {hitFx:{stealGold:30}});
Object.assign(ENEMY_TYPES.pierrot,    {shotFx:{status:{blind:150}}});
Object.assign(ENEMY_TYPES.galinha,    {hatch:'pintinho'});

const foesAlive = () => enemies.filter(e=>e.hp>0).length;
function spawnChild(type,x,y){
  if (foesAlive()>=12) return null;
  const [l,r]=bounds(), c=spawnEnemy(type,clamp(x,l+20,r-20),y);
  c.vy=-5; c.vx=rand(-2,2);
  return c;
}
const shieldGuard = { tick(e){ e.guarding = e.hp>0 && !(e.guardBroken>0) && (e.state==='walk'||e.state==='windup'); if (e.guardBroken>0) e.guardBroken--; } };

const TRICKS = {
  // raise a shield toward the hero: hit them from behind, or break the guard with 3 hits
  orc: shieldGuard,
  blackknight: shieldGuard,

  // falls apart into a pile of bones and stands up again unless the pile is smashed
  skeleton: {
    onKill(e){
      if (e.reassembled) return false;
      e.reassembled=true; e.hp=1; e.state='bones'; e.t=0; e.vx=0; e.flash=0;
      burst(e.x,e.y-20,'#e8e4d8',14,5); SFX.thud();
      return true;
    },
    ai(e){
      if (e.state!=='bones') return false;
      e.vx*=0.8; e.t++;
      if (e.t>=200){ e.hp=Math.round(e.maxHp*0.5); e.state='walk'; e.cd=40; bigText(e.x,e.y-e.h-10,'Remontou!','#e8e4d8'); burst(e.x,e.y-30,'#e8e4d8',10,4); SFX.charge(); }
      return true;
    },
  },

  // heals hurt friends instead of attacking now and then
  shaman: {
    ai(e,tg){
      e.healCd=(e.healCd??120)-1;
      if (e.state==='walk' && e.healCd<=0){
        const friend=enemies.find(o=>o!==e && o.hp>0 && !ENEMY_TYPES[o.type].boss && o.hp<o.maxHp*0.7 && Math.abs(o.x-e.x)<520);
        if (friend){ e.state='heal'; e.t=0; e.healTo=friend.id; }
      }
      if (e.state!=='heal') return false;
      e.vx*=0.7; e.t++;
      if (e.t===30){
        const f=enemies.find(o=>o.id===e.healTo);
        if (f && f.hp>0){ const n=Math.round(f.maxHp*0.3); f.hp=Math.min(f.maxHp,f.hp+n); addText(f.x,f.y-f.h-10,'+'+n,'#7dff8a'); ring(f.x,f.y-f.h/2,'#7dff8a',4,20,4,10); SFX.pickup(); }
      }
      if (e.t>=50){ e.state='walk'; e.healCd=rand(200,280); }
      return true;
    },
  },

  // raises a skeleton from the floor
  darkmage: {
    ai(e){
      e.sumCd=(e.sumCd??200)-1;
      if (e.state==='walk' && e.sumCd<=0 && !enemies.some(o=>o.raisedBy===e.id && o.hp>0)){ e.state='summon'; e.t=0; }
      if (e.state!=='summon') return false;
      e.vx*=0.6; e.t++;
      if (e.t%4===0) parts.push({x:e.x+e.face*60+rand(-20,20),y:GROUND,vx:0,vy:-rand(1,3),life:24,max:24,color:'#ff5cf0',size:3,grav:0});
      if (e.t===40){ const s=spawnChild('skeleton',e.x+e.face*60,GROUND-2); if (s){ s.raisedBy=e.id; s.vy=0; ring(s.x,GROUND-30,'#ff5cf0',5,20,5,10); SFX.zap(); } }
      if (e.t>=60){ e.state='walk'; e.sumCd=rand(520,640); }
      return true;
    },
  },

  // digs underground and pops up under the hero
  kobold: {
    ai(e,tg,dx,adx){
      e.digCd=(e.digCd??rand(60,200))-1;
      if (e.state==='walk' && e.digCd<=0 && adx>170 && e.onGround){ e.state='dig'; e.t=0; e.hidden=true; dust(e.x,e.y,12); SFX.thud(); }
      if (e.state==='dig'){
        e.t++; e.face=dx>0?1:-1; e.vx=e.face*e.speed*2.2;
        if (e.t%4===0) dust(e.x,GROUND,2);
        if (adx<16 || e.t>150){
          e.state='strike'; e.t=0; e.hidden=false; e.vx=0; e.vy=-9; e.digCd=rand(300,420);
          dust(e.x,GROUND,14); SFX.slam(); addShake(4);
          for (const p of alivePlayers()) if (Math.abs(p.x-e.x)<44 && p.y>GROUND-60) hurtPlayer(p,{dmg:e.dmg,dir:p.x>=e.x?1:-1,fromX:e.x,up:-9,srcId:e.id});
        }
        return true;
      }
      return false;
    },
  },

  // steals gold and runs away laughing; beat it to get the gold back (with interest)
  duende: {
    onHit(e){ e.loot=(e.loot||0)+30; e.state='flee'; e.t=0; bigText(e.x,e.y-e.h-12,'Hehe!','#7bd389'); },
    ai(e,tg,dx){
      if (e.state!=='flee') return false;
      e.t++; e.face=dx>0?-1:1; e.vx=e.face*e.speed*1.5;
      if (e.t%6===0) parts.push({x:e.x,y:e.y-30,vx:0,vy:-1,life:16,max:16,color:'#ffd23f',size:3,grav:0});
      if (e.t>160){ e.state='walk'; e.cd=60; }
      return true;
    },
    onKill(e){ if (e.loot){ const n=Math.ceil(e.loot*1.5/15); for (let k=0;k<n;k++) dropItem(e.x,e.y-20,'gold',-rand(5,8),15,rand(-3,3)); } return false; },
  },

  // the wolf-man howls when hurt: faster and stronger, and its pack gets faster too
  lobisomem: {
    ai(e){
      if (!e.howled && e.state==='walk' && e.hp<e.maxHp*0.5){ e.howled=true; e.state='howl'; e.t=0; }
      if (e.state!=='howl') return false;
      e.vx*=0.6; e.t++;
      if (e.t===20){
        bigText(e.x,e.y-e.h-14,'AUUUU!','#ffd23f'); SFX.roar(); ring(e.x,e.y-e.h*0.7,'#ffd23f',8,24,5,12); addShake(5);
        e.speed*=1.4; e.dmg=Math.round(e.dmg*1.25); e.enraged=true;
        for (const o of enemies) if (o!==e && o.hp>0 && Math.abs(o.x-e.x)<500) o.speed*=1.2;
      }
      if (e.t>=60){ e.state='walk'; e.cd=30; }
      return true;
    },
  },

  // olé! hops back out of the way of an attack now and then
  foliao: {
    tick(e){
      if (e.dodgeT>0) e.dodgeT--;
      e.dodgeCd=(e.dodgeCd??60)-1;
      if (e.dodgeCd>0 || e.hp<=0 || (e.state!=='walk' && e.state!=='windup')) return;
      const p=alivePlayers().find(p=>(p.state==='attack'||p.state==='dash') && p.t<=4 && Math.abs(p.x-e.x)<100 && (e.x-p.x)*p.face>0 && Math.abs(p.y-e.y)<50);
      if (!p || Math.random()<0.4){ if (p) e.dodgeCd=30; return; }
      const d=e.x>=p.x?1:-1;
      e.state='walk'; e.dodgeT=20; e.vx=d*6; e.vy=-6; e.dodgeCd=rand(150,240);
      bigText(e.x,e.y-e.h-12,'Olé!','#ffd23f'); SFX.roll();
    },
  },

  // three shots in a row
  soldadinho: {
    tick(e,tg){
      if (e.state==='strike' && (e.t===6||e.t===12) && tg){
        const sy=e.y-34; addEnemyProj({type:'cork',x:e.x+e.face*26,y:sy,vx:e.face*9,vy:clamp((tg.y-40-sy)/40,-1.5,1.5),life:110,dmg:e.dmg}); SFX.shoot();
      }
    },
  },

  // every third shot is a fan of arrows falling in an arc
  nomad: {
    tick(e,tg){
      if (e.state!=='strike' || e.t!==1 || !tg) return;
      e.shots=(e.shots||0)+1;
      if (e.shots%3) return;
      const flight=Math.max(30,Math.abs(tg.x-e.x)/7);
      for (const k of [-1,1]) addEnemyProj({type:'arrow',x:e.x+e.face*18,y:e.y-34,vx:(tg.x+k*70-e.x)/flight,vy:-6,grav:0.2,life:160,dmg:e.dmg});
      SFX.shoot();
    },
  },

  // eggs break into two chicks; scarecrows burst into crows
  ovo: { onKill(e){ for (let k=0;k<2;k++) spawnChild('pintinho',e.x+(k?14:-14),e.y-20); return false; } },
  espantalho: { onKill(e){ for (let k=0;k<2;k++){ const c=spawnChild('corvo',e.x,e.y-e.h); if (c){ c.y=e.y-e.h; c.vy=-3; } } SFX.blink(); return false; } },
};
// Hook dispatchers called from enemies.js
function trickAI(e,tg,dx,adx){ const tr=TRICKS[e.type]; return !!(tr && tr.ai && tr.ai(e,tg,dx,adx)); }
function trickTick(e,tg){ const tr=TRICKS[e.type]; if (tr && tr.tick) tr.tick(e,tg); }
function trickOnHit(e,p){ const tr=TRICKS[e.type]; if (tr && tr.onHit) tr.onHit(e,p); }
function trickOnKill(e,dir){ const tr=TRICKS[e.type]; return !!(tr && tr.onKill && tr.onKill(e,dir)); }

// ----- drawing helpers for trick states -----
function drawBonePile(e,sx){
  const y=e.y, shake=e.t>160 ? Math.sin(clock*1.5)*2 : 0;
  ctx.save(); ctx.translate(sx+shake,y);
  ctx.fillStyle='#e8e4d8';
  for (const [bx,a] of [[-14,0.3],[8,-0.5],[-2,1.2],[14,0.2]]){ ctx.save(); ctx.translate(bx,-4); ctx.rotate(a); ctx.fillRect(-10,-2,20,4); circle(-10,0,3); circle(10,0,3); ctx.restore(); }
  circle(0,-12,8); ctx.fillStyle='#3a3440'; circle(-3,-13,2); circle(3,-13,2);
  ctx.restore();
  if (e.t>160 && (clock>>2)%2) txt('!',sx,y-34,18,'#ff4040');
}
function drawDigMound(e,sx){
  ctx.fillStyle='#6b5a44'; ctx.beginPath(); ctx.ellipse(sx,GROUND,22,8+Math.sin(e.t*0.5)*2,0,Math.PI,0); ctx.fill();
  ctx.fillStyle='#8a7658'; circle(sx-8,GROUND-6,3); circle(sx+6,GROUND-8,2.5);
}
function drawFoeShield(e,sx){
  const x=sx+e.face*e.w*0.55, y=e.y-e.h*0.6, h=e.h*0.5;
  ctx.fillStyle='rgba(0,0,0,0.35)'; ctx.beginPath(); ctx.roundRect(x-6,y-h/2+2,14,h,5); ctx.fill();
  ctx.fillStyle=e.type==='blackknight'?'#5b0f1f':'#7a5230'; ctx.beginPath(); ctx.roundRect(x-7,y-h/2,14,h,5); ctx.fill();
  ctx.fillStyle='#c9ced6'; ctx.fillRect(x-7,y-2,14,4); circle(x,y,3.5);
}
