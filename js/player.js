'use strict';
// ===================== Player fighters =====================
// Local players are simulated here from an input source (`p.inp`, usually Input).
// Remote players are puppets moved by network snapshots (see net.js).
function makePlayer(hero,opts={}){
  const Hh=HEROES[hero];
  const p={
    isPlayer:true, id:opts.id||'p0', local:opts.local!==false, inp:opts.inp||Input, name:opts.name||Hh.name,
    hero, x:opts.x??150, y:GROUND, vx:0, vy:0, w:30, h:72, face:opts.face||1,
    hp:Hh.hp, maxHp:Hh.hp, mp:100, atkMul:1, defMul:1,
    state:'free', t:0, sk:0, atk:null, queued:false, hitIds:new Set(),
    jumps:0, airAtk:0, inv:0, anim:0, dropThrough:0, onGround:true,
    lastTap:{dir:0,t:-99}, localInv:0, tx:0, ty:GROUND, guardHp:100, rollCd:0, rollDir:1,
    base:!!opts.base || opts.local===false, def:0, lvl:1, tier:0, aim:0,
  };
  applyStats(p); p.hp=p.maxHp;
  return p;
}

// ----- emotes (keys 1-4) -----
const EMOTES = ['GG!','Valeu!','Cuidado!','Haha!'];
function checkEmotes(){ for (let i=0;i<4;i++) if (Input.pressed['emote'+(i+1)]) showEmote(me,i,true); }
function showEmote(p,i,send){
  if (!p) return;
  if (send){ if (p.emoteCd>0) return; p.emoteCd=40; netSend({type:'emote',i}); }
  p.emote={i,t:120}; SFX.move();
}
function drawEmote(p){
  if (!p || !p.emote || p.emote.t<=0) return;
  p.emote.t--;
  const s=EMOTES[p.emote.i], x=p.x-cam.x, y=p.y-p.h-58, a=Math.min(1,p.emote.t/15);
  ctx.globalAlpha=a; ctx.font=`bold 16px ${FONT}`; const w=ctx.measureText(s).width+20;
  ctx.fillStyle='#ffffff'; ctx.beginPath(); ctx.roundRect(x-w/2,y-15,w,30,10); ctx.fill(); tri(x-6,y+14,x+6,y+14,x,y+22);
  txt(s,x,y,16,'#1b1b2e','center',false); ctx.globalAlpha=1;
}

// Plays a sound and, when online, asks the other browser to play it too
function psfx(n,arg){ SFX[n](arg); netSend({type:'sfx',n,a:arg}); }

function addPlayerProj(p,o){
  o.owner='p'; o.pl=p.id; o.local=true; o.pid=++pidSeq; o.hit=new Set();
  projs.push(o);
  netSend({type:'proj',o:{type:o.type,x:o.x,y:o.y,vx:o.vx,vy:o.vy,life:o.life,big:o.big,deco:o.deco,pid:o.pid,pl:p.id}});
  return o;
}
function fireArrow(p,x,y,vx,vy,s){
  return addPlayerProj(p,{type:'parrow',x,y,vx,vy,life:s.life||60,dmg:s.dmg,pierce:!!s.pierce,big:!!s.big,kb:s.kb||2,up:s.up||0,deco:!!s.deco});
}
// Shot angle: the attack's own angle plus the archer's aim (negative = up)
function aimedAngle(p,s){ return clamp((s.ang||0)+(p.aim||0),-1.2,1.25); }
const AIM_UP=-1.1, AIM_DOWN=0.9, AIM_DOWN_GROUND=0.22, AIM_SPEED=0.05;
function shoot(p,s){
  const n=s.count||1, magic=s.type && s.type!=='parrow';
  for (let i=0;i<n;i++){
    const a=aimedAngle(p,s)+i*0.18, vx=Math.cos(a)*s.spd*p.face, vy=Math.sin(a)*s.spd;
    if (magic) addPlayerProj(p,{type:s.type,x:p.x+p.face*30,y:p.y-46,vx,vy,life:s.life||45,dmg:s.dmg,pierce:!!s.pierce,big:!!s.big,kb:s.kb||2,up:s.up||0,r:s.r||12});
    else fireArrow(p,p.x+p.face*Math.cos(a)*24,p.y-46+Math.sin(a)*24,vx,vy,s);
  }
  if (magic){ psfx('zap'); if (s.big) burst(p.x+p.face*34,p.y-46,'#d4b8ff',8,3,0); }
  else { psfx('bow'); if (s.big){ psfx('shoot'); burst(p.x+p.face*30,p.y-46,'#c8ffb0',6,3,0); } }
}
// Short-range arcane explosion in front of the caster
function magicBlast(p,b){
  const cx=p.x+p.face*b.dx, cy=p.y-40;
  const m={type:'fx',k:'blast',x:cx,y:cy,r:b.r}; FX_HANDLERS.blast(m); netSend(m);
  psfx('blast');
  areaHit(p,cx,cy,b.r,b.r,b.dmg,b.kb,b.up);
}
// Projectiles with `explode` burst in an area when they hit or run out
function explodeProj(owner,pr){
  const x=pr.x, y=Math.min(pr.y,GROUND-10), ex=pr.explode;
  const m={type:'fx',k:'boom',x,y,r:ex.r,big:!!ex.big,pid:pr.pid}; FX_HANDLERS.boom(m); netSend(m);
  psfx('boom');
  if (owner) areaHit(owner,x,y-20,ex.r,ex.r*0.8,ex.dmg,ex.kb,ex.up);
}
function gatherSparks(p,color,until){
  if (p.t<until && p.t%2===0){
    const a=Math.random()*Math.PI*2, r=130;
    parts.push({x:p.x+Math.cos(a)*r,y:p.y-45+Math.sin(a)*r,vx:-Math.cos(a)*r/14,vy:-Math.sin(a)*r/14,life:14,max:14,color,size:4,grav:0});
  }
}

// ----- hitting things -----
// Everything p's attacks can damage in the current mode
function targetsOf(p){
  const t=enemies.filter(e=>e.hp>0);
  if (Net.mode==='pvp') for (const o of players) if (o!==p && isAlive(o)) t.push(o);
  return t;
}
function strike(p,t,dmg,dir,kb,up,pid){
  return t.isPlayer ? strikePlayer(p,t,dmg,dir,kb,up,pid) : strikeEnemy(p,t,dmg,dir,kb,up);
}
function rollDamage(p,base){
  let dmg=Math.round(base*p.atkMul*rand(0.9,1.1));
  const crit=Math.random()<0.12; if (crit) dmg=Math.round(dmg*1.6);
  return {dmg,crit};
}
function hitFeedback(p,crit,mpGain=4){
  combo++; comboTimer=110; maxCombo=Math.max(maxCombo,combo);
  p.mp=Math.min(MAXMP,p.mp+mpGain);
  hitstop=Math.max(hitstop,crit?6:3); addShake(crit?7:3);
}
function strikeEnemy(p,e,base,dir,kb,up){
  const {dmg,crit}=rollDamage(p,base);
  if (p.local){ hitFeedback(p,crit); score+=Math.round(dmg*(1+Math.min(combo,50)/25)); }
  if (isGuest()){
    // the host owns enemies: show the hit right away and report it
    e.flash=6; spark(e.x-dir*e.w*0.3,e.y-e.h*0.55,crit?'#ffe066':'#fff7d6'); addText(e.x,e.y-e.h-8,crit?dmg+'!':dmg,crit?'#ffd23f':'#ffffff',crit);
    burst(e.x-dir*e.w*0.2,e.y-e.h*0.55,crit?'#ffd23f':'#fff3c4',crit?14:8,6); SFX.hit(crit);
    netSend({type:'ehit',id:e.id,dmg,dir,kb,up,crit});
    return true;
  }
  damageEnemy(e,dmg,dir,kb,up,crit,p);
  return true;
}
function strikePlayer(p,t,base,dir,kb,up,pid){
  if (t.inv>0 || t.localInv>0 || !isAlive(t) || !canFight()) return false;
  let {dmg,crit}=rollDamage(p,base*PVP_DMG);
  t.localInv = up ? 45 : 6;
  if (guardsAgainst(t,p.x)){ addText(t.x,t.y-t.h-8,'DEFESA','#8fe6ff',false); SFX.block(); }
  else {
    addText(t.x,t.y-t.h-8,crit?dmg+'!':dmg,crit?'#ffd23f':'#ffffff',crit);
    burst(t.x-dir*8,t.y-40,crit?'#ffd23f':'#fff3c4',crit?14:8,6);
    hitFeedback(p,crit,4); SFX.hit(crit);
  }
  hurtPlayer(t,{dmg,dir,kb,up,crit,pvp:true,fromX:p.x,pid,srcId:p.id});
  return true;
}
function playerHitbox(p,a){
  if (a.plunge) return {x1:p.x-38,x2:p.x+38,y1:p.y-34,y2:p.y+46};
  if (a.both) return {x1:p.x-a.range,x2:p.x+a.range,y1:p.y-98,y2:p.y+10};
  return {x1:p.face>0?p.x-12:p.x-a.range, x2:p.face>0?p.x+a.range:p.x+12, y1:p.y-98, y2:p.y+(a.air?34:10)};
}
// Hits every target overlapping a world-space rectangle (multi-hit friendly: no per-target memory)
function rectHit(p,x1,x2,y1,y2,dmg,kb,up){
  const b={x1,x2,y1,y2};
  for (const t of targetsOf(p)) if (boxHits(b,t)) strike(p,t,dmg,p.face,kb,up);
}
// Hits every target whose body is inside an ellipse-ish box around (cx,cy)
function areaHit(p,cx,cy,rx,ry,dmg,kb,up){
  for (const t of targetsOf(p)) if (Math.abs(t.x-cx)<rx && Math.abs((t.y-t.h/2)-cy)<ry) strike(p,t,dmg,t.x>=cx?1:-1,kb,up);
}

// ----- being hit -----
// Damage is always applied by the browser that owns the victim
function hurtPlayer(p,h){
  if (!p.local){ netSend({type:'hurt',id:p.id,h}); return; }
  applyHurt(p,h);
}
const PERFECT_GUARD = 9; // frames after raising the guard that count as a perfect block
function guardsAgainst(p,fromX){ return p.state==='guard' && fromX!=null && (fromX-p.x)*p.face>=-4; }
function applyHurt(p,h){
  if (p.inv>0 || !isAlive(p) || !canFight()) return;
  if (!h.pvp && p.def) h={...h, dmg:Math.max(1,Math.round(h.dmg*(1-p.def)))};
  if (guardsAgainst(p,h.fromX)){ blockHit(p,h); return; }
  p.hp-=h.dmg; p.mp=Math.min(MAXMP,p.mp+h.dmg*0.2); spark(p.x,p.y-44,'#ffb0b0');
  addText(p.x,p.y-p.h-10,h.crit?h.dmg+'!':h.dmg,h.crit?'#ffd23f':'#ff5a5a',h.crit);
  burst(p.x,p.y-40,'#ff6b6b',10,5);
  addShake(h.pvp?(h.crit?8:5):8); hitstop=Math.max(hitstop,h.pvp?3:4);
  if (h.pvp){ SFX.hit(h.crit); combo=0; comboTimer=0; }
  SFX.hurt();
  if (p.hp<=0){ p.hp=0; p.state='dead'; p.t=0; p.vy=-8; p.vx=h.dir*4; onPlayerDown(p); return; }
  if (h.pvp){
    p.inv = h.up ? 45 : 6;
    p.state='hurt'; p.t=h.up?30:16; p.vx=h.dir*(h.kb||3)*0.8; p.vy = h.up ? h.up : (p.onGround ? -2 : Math.min(p.vy,-3));
  } else {
    p.inv=60; p.state='hurt'; p.t=22; p.vx=h.dir*5; p.vy=-5;
  }
}

function blockHit(p,h){
  const sx=p.x+p.face*26, sy=p.y-46;
  if (p.t<=PERFECT_GUARD){
    p.mp=Math.min(MAXMP,p.mp+30); p.inv=Math.max(p.inv,20);
    bigText(p.x,p.y-p.h-14,'DEFESA PERFEITA!','#ffffff'); ring(sx,sy,'#ffffff',6,16,5,8); burst(sx,sy,'#e8fbff',14,6,0);
    SFX.parry(); hitstop=Math.max(hitstop,8); flashScreen=Math.max(flashScreen,0.25);
    if (h.srcId) stunAttacker(h.srcId);
    return;
  }
  const chip=Math.max(1,Math.round(h.dmg*0.15));
  p.hp-=chip; p.guardHp-=h.dmg*(h.pvp?0.9:0.7); p.vx=h.dir*3;
  addText(p.x,p.y-p.h-10,chip,'#9fb4c9',false); burst(sx,sy,'#8fe6ff',8,4,0); SFX.block(); addShake(3);
  if (p.hp<=0){ p.hp=0; p.state='dead'; p.t=0; p.vy=-8; p.vx=h.dir*4; onPlayerDown(p); return; }
  if (p.guardHp<=0){
    p.guardHp=0; p.state='hurt'; p.t=50; p.vx=h.dir*4; p.vy=-3;
    bigText(p.x,p.y-p.h-14,'DEFESA QUEBRADA!','#ff8a8a'); SFX.guardBreak();
  }
}
// A perfect block staggers whoever attacked (enemy or rival player)
function stunAttacker(id){
  const e=enemies.find(o=>o.id===id);
  if (e){ if (Net.mode==='coop' && !Net.host) netSend({type:'stun',id}); else stunEnemy(e); return; }
  if (Net.mode==='pvp') netSend({type:'stagger'});
}
function stagger(p){
  if (!isAlive(p)) return;
  p.state='hurt'; p.t=40; p.vx=-p.face*3;
  bigText(p.x,p.y-p.h-14,'ATORDOADO!','#ffd23f'); SFX.guardBreak();
}

// ----- actions -----
function startAttack(p,a){
  const I=p.inp.held;
  if (I.left && !I.right) p.face=-1; else if (I.right && !I.left) p.face=1;
  p.state='attack'; p.atk=a; p.t=0; p.queued=false; p.hitIds=new Set();
  if (a.air){ p.airAtk++; p.vy=Math.min(p.vy,-2); }
}
function startDash(p,dir){
  p.face=dir;
  if (HEROES[p.hero].blink){
    // the mage teleports instead of dashing
    const [l,r]=bounds(), x0=p.x;
    p.x=clamp(p.x+dir*170,l+16,r-16); p.state='dash'; p.t=8; p.vx=0; p.inv=Math.max(p.inv,14);
    burst(x0,p.y-40,'#d4b8ff',12,4,0); burst(p.x,p.y-40,'#ffffff',12,4,0); ring(p.x,p.y-40,'#c79bff',5,14,4,6);
    psfx('blink'); return;
  }
  p.state='dash'; p.t=14; p.inv=Math.max(p.inv,8);
  psfx('dash'); dust(p.x,p.y,5);
}
function startRoll(p){
  const I=p.inp.held;
  p.rollDir = I.left && !I.right ? -1 : I.right && !I.left ? 1 : p.face;
  p.face=p.rollDir; p.state='roll'; p.t=0; p.inv=Math.max(p.inv,16);
  psfx('roll'); dust(p.x,p.y,5);
}
const FLIP_T = 18; // frames of the double-jump somersault
function noMp(p){ addText(p.x,p.y-95,'Sem MP','#9fb4c9',false); SFX.noMp(); }
function trySkills(p){
  const skills=HEROES[p.hero].skills, P=p.inp.pressed;
  const idx = P.skill1 ? 0 : P.skill2 ? 1 : P.skill3 ? 2 : -1;
  if (idx<0 || !skills[idx]) return false;
  const s=skills[idx];
  if (p.mp<s.mp){ noMp(p); return false; }
  p.mp-=s.mp; p.state='skill'; p.sk=idx; p.t=0; p.hitIds=new Set(); p.inv=Math.max(p.inv,s.inv||0);
  p.diving=false; p.landT=0;
  if (s.ult){ const m={type:'fx',k:'cutin',hero:p.hero,name:s.cry}; FX_HANDLERS.cutin(m); netSend(m); psfx('ult'); }
  else if (s.cry){ flashScreen=Math.max(flashScreen,0.3); bigText(p.x,p.y-110,s.cry,'#ffcf5a'); psfx('gigaCharge'); }
  else { psfx('charge'); burst(p.x,p.y-45,s.color,14,4,0); }
  return true;
}

function updatePlayer(p){
  const Hh=HEROES[p.hero], I=p.inp.held, P=p.inp.pressed;
  p.anim++;
  if (p.inv>0) p.inv--;
  if (p.dropThrough>0) p.dropThrough--;
  p.mp=Math.min(MAXMP,p.mp+0.1);
  if (p.rollCd>0) p.rollCd--;
  if (p.flip>0) p.flip--;
  if (p.state!=='guard') p.guardHp=Math.min(100,p.guardHp+0.5);
  if (p.emoteCd>0) p.emoteCd--;
  if (p.state==='dead'){ p.t++; p.vx*=0.92; physics(p); tryRevive(p); return; }
  // archer aim: holding ↑/↓ while shooting raises/lowers the bow little by little
  if (Hh.aim){
    if (p.state==='attack' || (p.state==='skill' && p.sk===0)){
      if (I.up && !I.down) p.aim=Math.max(AIM_UP,p.aim-AIM_SPEED);
      else if (I.down && !I.up) p.aim=Math.min(AIM_DOWN,p.aim+AIM_SPEED);
      if (p.onGround) p.aim=Math.min(p.aim,AIM_DOWN_GROUND); // on the ground, low shots would just hit the floor
    } else if (p.state!=='skill') p.aim*=0.85;
  }

  for (const [act,dir] of [['left',-1],['right',1]]){
    if (P[act]){
      if (p.lastTap.dir===dir && frame-p.lastTap.t<15 && p.state==='free' && p.onGround){ startDash(p,dir); p.lastTap.t=-99; }
      else p.lastTap={dir,t:frame};
    }
  }
  let doPhysics=true;
  switch (p.state){
    case 'free': {
      const mv=(I.right?1:0)-(I.left?1:0);
      if (mv){ p.vx=mv*Hh.speed; p.face=mv; } else p.vx*=0.6;
      if (p.onGround){ p.jumps=0; p.airAtk=0; }
      if (P.down && p.onGround && p.y<GROUND-1){ p.dropThrough=12; }
      else if (P.jump){
        if (p.onGround){ p.vy=Hh.jump; p.jumps=1; psfx('jump'); dust(p.x,p.y,4); }
        else if (p.jumps<2){ p.vy=-10.5; p.jumps=2; p.flip=FLIP_T; psfx('djump'); ring(p.x,p.y,'#ffffff',2.5,14,3,6); burst(p.x,p.y-10,'#ffffff',6,2,0); }
      }
      if (P.attack){ if (p.onGround) startAttack(p,Hh.atk.c1); else if (p.airAtk<2) startAttack(p,Hh.atk.air); }
      else if (P.dodge && p.onGround && p.rollCd<=0) startRoll(p);
      else if (I.guard && p.onGround){ p.state='guard'; p.t=0; p.vx=0; }
      trySkills(p);
      break;
    }
    case 'guard':
      p.t++; p.vx*=0.5;
      if (P.left) p.face=-1; else if (P.right) p.face=1;
      if (P.dodge && p.rollCd<=0) startRoll(p);
      else if (!I.guard || !p.onGround) p.state='free';
      break;
    case 'roll':
      p.t++; p.vx=p.rollDir*Math.max(2,8.5-p.t*0.3);
      if (p.t%3===0) dust(p.x,p.y,1);
      if (p.t>=22){ p.state='free'; p.rollCd=18; }
      break;
    case 'attack': {
      const a=p.atk; p.t++;
      if (a.plunge){ p.vy=Math.max(p.vy,12); p.vx*=0.9; }
      else if (a.air) p.vx*=0.95;
      else p.vx = p.t<=a.act[0]+1 ? p.face*a.lunge : p.vx*0.75;
      if (P.attack) p.queued=true;
      if (p.t===a.act[0]){ if (a.shot) shoot(p,a.shot); else if (a.blast) magicBlast(p,a.blast); else psfx('swing',a.heavy); }
      if (a.plunge && p.onGround && p.t>2){
        rectHit(p,p.x-85,p.x+85,p.y-50,p.y+10,22,5,-6);
        dust(p.x-30,p.y,8); dust(p.x+30,p.y,8); ring(p.x,p.y-6,'#ffe0a0',6,14,5,10); psfx('thud'); addShake(5);
        p.state='free'; break;
      }
      if (!a.shot && !a.blast && p.t>=a.act[0] && p.t<=a.act[1]){
        const b=playerHitbox(p,a);
        for (const t of targetsOf(p)){
          if (!p.hitIds.has(t.id) && boxHits(b,t) && strike(p,t,a.dmg,p.face,a.kb,a.up)) p.hitIds.add(t.id);
        }
        for (const pr of projs) if (pr.owner==='e' && (pr.type==='arrow'||pr.type==='eorb') && pr.x>b.x1 && pr.x<b.x2 && pr.y>b.y1 && pr.y<b.y2){
          pr.life=0; burst(pr.x,pr.y,'#ffe08a',6,4); psfx('deflect'); }
      }
      if (P.dodge && p.onGround && p.t>a.act[1] && p.rollCd<=0) startRoll(p);
      else if (a.next && p.queued && p.t>a.act[1]) startAttack(p,Hh.atk[a.next]);
      else if (p.t>=a.dur || (a.air && p.onGround && p.t>3)) p.state='free';
      else trySkills(p);
      break;
    }
    case 'dash': {
      p.t--; p.vx=Hh.blink ? 0 : p.face*(5+p.t*0.45);
      if (p.t%2===0) parts.push({ghost:true,hero:p.hero,x:p.x,y:p.y,face:p.face,anim:p.anim,life:12,max:12});
      if (P.attack) startAttack(p,Hh.atk.dash);
      else if (P.jump){ p.state='free'; p.vy=Hh.jump; p.jumps=1; }
      else if (p.t<=0) p.state='free';
      break;
    }
    case 'hurt':
      p.t--; p.vx*=0.9; if (p.t<=0) p.state='free';
      break;
    case 'skill': {
      const s=Hh.skills[p.sk];
      p.t++;
      if (s.freeze){ doPhysics=false; p.vx=0; p.vy=0; if (p.t<22) p.y-=2.2; }
      else if (s.hover){ doPhysics=false; p.vx=0; p.vy=0; }
      else if (!s.free){ p.vx*=0.8; if (!p.onGround) p.vy*=0.6; }
      if (s.update(p)) p.state='free';
      break;
    }
  }
  if (doPhysics) physics(p);
  const [l,r]=bounds(); p.x=clamp(p.x,l+16,r-16);
}

// Remote players: ease toward the last snapshot position
function updatePuppet(p){
  if (Math.abs(p.tx-p.x)>200 || Math.abs(p.ty-p.y)>200){ p.x=p.tx; p.y=p.ty; }
  p.x+=(p.tx-p.x)*0.5; p.y+=(p.ty-p.y)*0.5;
  if (p.localInv>0) p.localInv--;
}
