'use strict';
// ===================== Stage mechanics =====================
// Building blocks the stage files (js/stages/*.js) combine to make each stage different:
// pits, traps ("hazards"), status effects, encounter types and boss phases.
// Damage-dealing traps run on the browser that owns the world (single player / co-op host);
// effects that only push or slow a hero run on every browser for its own hero.

// ---------- pits ----------
const inPit = x => pits.some(p=>x>p.x && x<p.x+p.w);
function drawPits(){
  for (const p of pits){
    const x=p.x-cam.x; if (x+p.w<-20 || x>W+20) continue;
    const g=ctx.createLinearGradient(0,GROUND-8,0,H); g.addColorStop(0,'#1b140e'); g.addColorStop(1,'#000000');
    ctx.fillStyle=g; ctx.fillRect(x,GROUND-8,p.w,H-GROUND+14);
    ctx.fillStyle='rgba(0,0,0,0.55)'; ctx.fillRect(x-5,GROUND-8,6,H); ctx.fillRect(x+p.w-1,GROUND-8,6,H);
    ctx.fillStyle='#3a2e24'; tri(x-6,GROUND-8,x+6,GROUND-8,x-2,GROUND+18); tri(x+p.w-6,GROUND-8,x+p.w+6,GROUND-8,x+p.w+2,GROUND+18);
  }
}
// Anything that fell below the screen: heroes lose some life and come back to safe ground
function handleFalls(){
  if (!isGuest()) for (const e of enemies) if (e.y>H+60 && !e.dead){
    // rewards pop out at the edge of the pit
    const p=pits.find(q=>e.x>q.x-20 && e.x<q.x+q.w+20); if (p) e.x = e.x-p.x < p.w/2 ? p.x-30 : p.x+p.w+30;
    e.y=GROUND-10; if (e.hp>0) killEnemy(e,0); e.dead=true;
  }
  items=items.filter(it=>it.y<H+60);
}
function fellInPit(p){
  const dmg=Math.round(p.maxHp*0.15);
  if (p.safeX!=null) p.x=p.safeX;
  for (const q of pits) if (p.x>q.x-40 && p.x<q.x+q.w+40) p.x = p.x-q.x < q.w/2 ? q.x-60 : q.x+q.w+60;
  p.y=GROUND-260; p.vx=0; p.vy=0; p.status={};
  SFX.hurt();
  if (p.hp-dmg<=0){ p.hp=0; p.state='dead'; p.t=0; onPlayerDown(p); return; }
  p.hp-=dmg; p.inv=90; p.state='free';
  addText(p.x,GROUND-200,'-'+dmg,'#ff5a5a'); bigText(p.x,GROUND-230,'Caiu!','#ffd23f');
}

// ---------- hazards (traps) ----------
let hzSeq = 0;
const hzDmg = k => Math.round(k*(stage && stage.diff ? stage.diff.dmg : 1));
// Adds a trap during play (boss attacks, chases…); the co-op host shares it with the guest
function addHazard(spec,send=true){
  const h={...spec, i:'h'+(++hzSeq), state:'idle', t:0};
  hazards.push(h);
  if (send && Net.mode==='coop' && Net.host) netSend({type:'fx',k:'hz',h:spec,i:h.i});
  return h;
}
const remoteHazard = m => hazards.push({...m.h, i:m.i, state:'idle', t:0}); // co-op guest (see FX_HANDLERS.hz)
const spikesUp = h => ((platClock+(h.offset||0))%h.period) < h.on;
function pendulumPos(h){ const a=Math.sin(platClock*h.speed+(h.phase||0))*h.amp; return [h.x+Math.sin(a)*h.len, h.y+Math.cos(a)*h.len, a]; }
const windDir = h => Math.sin(platClock*Math.PI*2/h.period+(h.phase||0))>0 ? 1 : -1;
const onGroundIn = (p,h) => p.y>GROUND-40 && p.x>h.x && p.x<h.x+h.w;

// Damage from traps (world owner only)
function updateHazards(){
  for (const h of hazards){
    switch (h.type){
      case 'gift':
        // a surprise present: some burst into coins, the rest light a fuse and explode
        if (h.state==='idle' && alivePlayers().some(p=>Math.abs(p.x-h.x)<36 && p.y>GROUND-60)){
          if (h.good){ for (let k=0;k<4;k++) dropItem(h.x,GROUND-30,'gold',-rand(5,8),25,rand(-3,3)); setGift(h,'done',true); }
          else setGift(h,'fuse');
        } else if (h.state==='fuse' && ++h.t>=40){
          for (const p of alivePlayers()) if (Math.hypot(p.x-h.x,(p.y-30)-(GROUND-20))<95) hurtPlayer(p,{dmg:hzDmg(40),dir:p.x>=h.x?1:-1,fromX:h.x});
          setGift(h,'done',true);
        }
        break;
      case 'fire':
        for (const p of alivePlayers()) if (p.x>h.x-6 && p.x<h.x+h.w+6 && p.y>(h.y||GROUND)-46 && p.y<=(h.y||GROUND)+4)
          hurtPlayer(p,{dmg:hzDmg(h.dmg||16),dir:p.x<h.x+h.w/2?-1:1,fromX:h.x+h.w/2});
        break;
      case 'spikes':
        if (spikesUp(h)) for (const p of alivePlayers()) if (onGroundIn(p,h)) hurtPlayer(p,{dmg:hzDmg(22),dir:p.x<h.x+h.w/2?-1:1,fromX:h.x+h.w/2});
        break;
      case 'pendulum': {
        const [bx,by]=pendulumPos(h);
        for (const p of alivePlayers()) if (Math.abs(p.x-bx)<30 && by>p.y-p.h-14 && by<p.y+14) hurtPlayer(p,{dmg:hzDmg(28),dir:p.x>=bx?1:-1,fromX:bx});
        break;
      }
      case 'stalactite': {
        const ph=(platClock+(h.offset||0))%h.period;
        if (ph===0) addEnemyProj({type:'bomb',style:'rock',x:h.x,y:30,vx:0,vy:2,grav:0.45,life:200,dmg:hzDmg(26),r:15});
        break;
      }
      case 'roller': // the boulder of a chase sequence
        for (const p of alivePlayers()) if (Math.abs(p.x-h.x)<h.r+10 && p.y>GROUND-h.r*2) hurtPlayer(p,{dmg:hzDmg(45),dir:1,fromX:h.x-50,kb:12});
        break;
    }
  }
  // fireworks falling from the sky now and then, aimed near a hero
  const bossFight=locked && stage.zones[zi] && stage.zones[zi].boss;
  if (stage.rockets && frame%stage.rockets===0 && !winTimer && !bossFight){
    const p=pick(alivePlayers()); if (p) addEnemyProj({type:'bomb',style:'fire',x:p.x+rand(-140,140),y:-40,vx:rand(-1,1),vy:3,grav:0.3,life:200,dmg:hzDmg(24),r:14,explode:55});
  }
}
// Movement effects on this browser's own hero + timers every browser runs
function updateLocalHazards(){
  for (const h of hazards){
    if (h.ttl!=null) h.ttl--;
    if (h.type==='roller'){
      h.x+=h.speed; if (frame%3===0) dust(h.x-h.r*0.6,GROUND,2);
      // the boulder ends its run in the first pit it reaches (or a little past the end of the chase)
      if (inPit(h.x) || h.x>h.until+200){ h.ttl=0; dust(h.x,GROUND,24); addShake(10); SFX.slam(); }
    }
    for (const p of players){
      if (!p.local || !isAlive(p)) continue;
      if (h.type==='wind' && p.x>h.x && p.x<h.x+h.w && p.state!=='guard') p.x+=h.force*windDir(h);
      if (h.type==='slow' && onGroundIn(p,h)) p.slowZone=2;
      if (h.type==='poison' && onGroundIn(p,h)) applyStatus(p,'poison',150);
    }
  }
  hazards=hazards.filter(h=>h.ttl==null || h.ttl>0);
}
function setGift(h,state,send){
  h.state=state; h.t=0;
  if (state==='fuse') SFX.charge();
  if (state==='done'){
    if (h.good){ burst(h.x,GROUND-24,'#ffd23f',18,6); SFX.pickup(); }
    else { ring(h.x,GROUND-24,'#ffb347',9,20,9,10); burst(h.x,GROUND-24,'#e63946',26,8,0.12); SFX.blast(); addShake(8); }
  }
  if (send!==false) netSend({type:'fx',k:'gift',i:h.i,s:state});
}

const SLOW_COLORS = { sand:['#d9a35a','#c48d48'], choco:['#5a321e','#7b4a2e'], mud:['#4a3a28','#5d4a34'], snow:['#e8f1ff','#cfe0f5'] };
function drawHazards(){
  for (const h of hazards){
    const x=h.x-cam.x, w=h.w||60;
    if (x+w<-200 || x>W+200) continue;
    switch (h.type){
      case 'gift': {
        if (h.state==='done') break;
        const fuse=h.state==='fuse', sh=fuse?Math.sin(clock*1.5)*2:0, y=GROUND-14;
        ctx.save(); ctx.translate(x+sh,y);
        ctx.fillStyle=fuse && (clock>>2)%2 ? '#ffffff' : h.col||'#e63946'; ctx.fillRect(-16,-14,32,28);
        ctx.fillStyle='#ffd23f'; ctx.fillRect(-3,-14,6,28); ctx.fillRect(-16,-3,32,6);
        ctx.beginPath(); ctx.ellipse(-6,-18,7,4,0.5,0,Math.PI*2); ctx.ellipse(6,-18,7,4,-0.5,0,Math.PI*2); ctx.fill();
        if (fuse){ ctx.fillStyle=(clock>>1)%2?'#fff3c4':'#ff9d4d'; circle(10,-26,4+Math.random()*2); }
        ctx.restore(); break;
      }
      case 'fire': { // bonfire (or a smaller burning patch with `patch`)
        const gy=h.y||GROUND, big=!h.patch;
        if (big){ ctx.fillStyle='#5d3a1a'; for (let k=0;k<w;k+=18){ ctx.save(); ctx.translate(x+k+9,gy-6); ctx.rotate((k/18%2?0.4:-0.4)); ctx.fillRect(-14,-4,28,8); ctx.restore(); } }
        const fade=h.ttl!=null ? Math.min(1,h.ttl/30) : 1, s=big?1:0.6;
        ctx.globalAlpha=fade;
        for (let k=0;k<w;k+=14){ const fl=Math.sin(clock*0.3+k)*5, fx=x+k+7;
          ctx.fillStyle='#ff5a1f'; ctx.beginPath(); ctx.ellipse(fx,gy-26*s,9,(24+fl)*s,0,0,Math.PI*2); ctx.fill();
          ctx.fillStyle='#ffb347'; ctx.beginPath(); ctx.ellipse(fx,gy-20*s,6,(16+fl*0.6)*s,0,0,Math.PI*2); ctx.fill();
          ctx.fillStyle='#fff3c4'; ctx.beginPath(); ctx.ellipse(fx,gy-14*s,3,8*s,0,0,Math.PI*2); ctx.fill(); }
        ctx.globalAlpha=1;
        if (clock%4===0) parts.push({x:h.x+rand(0,w),y:gy-40*s,vx:rand(-0.4,0.4),vy:-rand(1,2.5),life:30,max:30,color:pick(['#ffb347','#ff5a1f','#ffd36b']),size:2,grav:0});
        break;
      }
      case 'spikes': {
        const ph=(platClock+(h.offset||0))%h.period, up=ph<h.on;
        const k=up ? Math.min(1,ph/6) : Math.max(0,1-(ph-h.on)/6), warn=!up && h.period-ph<30;
        ctx.fillStyle='#3a3540'; ctx.fillRect(x,GROUND-4,w,6);
        ctx.fillStyle=warn && (clock>>2)%2 ? '#ff6b6b' : '#c9ced6';
        for (let sx=x+4;sx<x+w-4;sx+=12) tri(sx,GROUND-2,sx+6,GROUND-2-30*k-(warn?3:0),sx+12,GROUND-2);
        break;
      }
      case 'pendulum': {
        const [bx,by,a]=pendulumPos(h), px=h.x-cam.x;
        ctx.strokeStyle='#6b6f7c'; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(px,h.y); ctx.lineTo(bx-cam.x,by); ctx.stroke();
        ctx.fillStyle='#4a4458'; circle(px,h.y,8);
        ctx.save(); ctx.translate(bx-cam.x,by); ctx.rotate(-a);
        ctx.fillStyle='#d7dbe0'; ctx.beginPath(); ctx.arc(0,0,30,0,Math.PI); ctx.closePath(); ctx.fill();
        ctx.fillStyle='#8a8f9c'; ctx.beginPath(); ctx.arc(0,0,14,0,Math.PI); ctx.closePath(); ctx.fill();
        ctx.restore(); break;
      }
      case 'stalactite': {
        const ph=(platClock+(h.offset||0))%h.period, warn=ph>h.period-50, sh=warn?Math.sin(clock*1.6)*3:0;
        ctx.fillStyle='#5a5070'; tri(x-18+sh,-4,x+sh,warn?60:52,x+18+sh,-4);
        if (warn && clock%3===0) parts.push({x:h.x+rand(-8,8),y:56,vx:0,vy:2,life:16,max:16,color:'#8a8494',size:2,grav:0.2});
        break;
      }
      case 'wind': {
        const d=windDir(h);
        ctx.strokeStyle='rgba(230,240,255,0.35)'; ctx.lineWidth=2;
        for (let k=0;k<14;k++){ const lx=x+(((k*97+clock*7*d)%w)+w)%w, ly=GROUND-30-((k*53)%300);
          ctx.beginPath(); ctx.moveTo(lx,ly); ctx.lineTo(lx-d*26,ly); ctx.stroke(); }
        break;
      }
      case 'slow': {
        const [c1,c2]=SLOW_COLORS[h.kind]||SLOW_COLORS.mud;
        ctx.fillStyle=c1; ctx.beginPath(); ctx.ellipse(x+w/2,GROUND+2,w/2+8,12,0,0,Math.PI*2); ctx.fill();
        ctx.strokeStyle=c2; ctx.lineWidth=2;
        for (let k=0;k<3;k++){ ctx.beginPath(); ctx.ellipse(x+w/2,GROUND+2,(w/2)*(0.3+k*0.25)*(1+0.05*Math.sin(clock*0.1+k)),4+k*2,0,0,Math.PI*2); ctx.stroke(); }
        break;
      }
      case 'poison': {
        const fade=h.ttl!=null ? Math.min(1,h.ttl/30) : 1;
        ctx.globalAlpha=fade; ctx.fillStyle='#6fbf3a'; ctx.beginPath(); ctx.ellipse(x+w/2,GROUND-1,w/2+6,7,0,0,Math.PI*2); ctx.fill();
        ctx.fillStyle='#a6f06a'; for (let k=0;k<4;k++) circle(x+((k*37+clock)%w),GROUND-4-((clock*0.6+k*9)%12),2.5); ctx.globalAlpha=1;
        break;
      }
      case 'roller': {
        ctx.save(); ctx.translate(x,GROUND-h.r); ctx.rotate(h.x/h.r);
        ctx.fillStyle='#6b6f7c'; circle(0,0,h.r); ctx.fillStyle='#8a8f9c'; circle(-h.r*0.3,-h.r*0.3,h.r*0.45);
        ctx.strokeStyle='#4a4e58'; ctx.lineWidth=4; ctx.beginPath(); ctx.moveTo(-h.r*0.7,0); ctx.lineTo(h.r*0.6,h.r*0.2); ctx.stroke();
        ctx.restore(); break;
      }
    }
  }
}

// ---------- status effects (applied by the browser that owns the hero) ----------
// poison: loses a little life over time · slow: moves and jumps less · blind: splotches cover the screen
// grab: held in place; mash buttons to break free
function applyStatus(p,type,t){
  p.status=p.status||{};
  if ((p.status[type]||0)<t) p.status[type]=t;
  if (type==='grab' && p.state!=='grabbed'){ p.state='grabbed'; p.t=0; p.vx=0; }
}
function updateStatus(p){
  const S=p.status||(p.status={});
  if (S.poison>0){
    S.poison--;
    if (S.poison%40===0 && p.hp>1){ const d=Math.max(1,Math.round(p.maxHp*0.025)); p.hp=Math.max(1,p.hp-d); addText(p.x,p.y-p.h-6,d,'#8bdc4a'); }
    if (clock%6===0) parts.push({x:p.x+rand(-10,10),y:p.y-p.h*0.7,vx:0,vy:-0.8,life:20,max:20,color:'#8bdc4a',size:2.5,grav:0});
  }
  if (S.slow>0) S.slow--;
  if (S.blind>0) S.blind--;
  if (p.slowZone>0) p.slowZone--;
  p.speedMul = (S.slow>0 || p.slowZone>0) ? 0.5 : 1;
}
// While grabbed: mash attack / jump / arrows to break free; the grip hurts a little over time
function updateGrabbed(p){
  const P=p.inp.pressed, S=p.status;
  p.vx=0; p.t++;
  if (P.attack||P.jump||P.left||P.right||P.dodge||P.guard) S.grab-=7;
  S.grab--;
  if (p.t%45===0){ const d=Math.max(1,Math.round(p.maxHp*0.03)); p.hp=Math.max(1,p.hp-d); addText(p.x,p.y-p.h-6,d,'#ff8a8a'); }
  if (S.grab<=0){ S.grab=0; p.state='free'; p.inv=40; bigText(p.x,p.y-p.h-14,'Escapou!','#9fe3a8'); SFX.roll(); }
}
const STATUS_BADGES = [['poison','V','#6fbf3a'],['slow','L','#c48d48'],['blind','C','#ff4fd8'],['grab','A','#e63946']];
function drawStatusBadges(p,x,y){
  let k=0;
  for (const [s,l,c] of STATUS_BADGES) if (p.status && p.status[s]>0){ ctx.fillStyle=c; circle(x+k*18,y,7); txt(l,x+k*18,y,10,'#ffffff','center',false); k++; }
}
function drawBlindOverlay(){
  const b=me && me.status && me.status.blind; if (!b) return;
  const a=Math.min(1,b/30)*0.7, cols=['#ff4fd8','#ffd23f','#3ec1d3','#7bd389'];
  ctx.globalAlpha=a;
  for (let i=0;i<9;i++){ const x=(i*157+40)%W, y=(i*89+60)%(H-80); ctx.fillStyle=cols[i%4]; circle(x,y,46+(i%3)*14); circle(x+30,y+20,26); }
  ctx.globalAlpha=1;
  if (me.status.grab>0) txt('Aperte as teclas para se soltar!',W/2,H/2+60,22,'#ffffff');
}

// ---------- encounters ----------
// Zone types: waves (default) · ambush (enemies walk in from both sides) · survive (hold out until the timer ends)
// chase (no lock: a giant boulder rolls after the heroes) · Wave entries: [type, x | 'L' | 'R', {mini, name}]
let surviveT = 0;
function zoneSpawn(entry){
  const [type,pos,opt]=entry;
  let x=pos, y;
  if (pos==='L'){ x=lockL+30; y=GROUND; } else if (pos==='R'){ x=lockR-30; y=GROUND; }
  const e=spawnEnemy(type,x,y);
  if (opt && opt.mini) makeMini(e,opt.name);
  return e;
}
// A mini-boss: a bigger, tougher version of a regular enemy
function makeMini(e,name){
  e.big=1.35; e.w=Math.round(e.w*1.35); e.h=Math.round(e.h*1.35);
  e.hp=e.maxHp=e.hp*4; e.dmg=Math.round(e.dmg*1.35); e.mini=name||'Mini-chefe';
  banner={txt:e.mini,sub:'— MINI-CHEFE —',t:120,max:120,boss:true}; SFX.roar();
}
function updateZones(){
  const zones=stage.zones;
  if (!locked){
    const lead=Math.max(...alivePlayers().map(p=>p.x), -1);
    if (zi<zones.length && lead>zones[zi].at){
      const z=zones[zi];
      if (z.type==='chase'){
        addHazard({type:'roller',x:z.at-480,r:70,speed:z.speed||3.6,until:z.to});
        banner={txt:'CORRA!',sub:z.label||'Uma pedra gigante vem rolando',t:120,max:120,boss:true}; SFX.roar(); addShake(8);
        zi++; return;
      }
      locked=true; lockL=z.left; lockR=z.left+W; wave=0; waveDelay=0; goTimer=0;
      if (z.type==='survive'){ surviveT=z.secs*60; banner={txt:z.label||'SOBREVIVA!',sub:`Aguente ${z.secs} segundos`,t:110,max:110}; }
      if (z.type==='ambush') banner={txt:'EMBOSCADA!',sub:'Eles vêm dos dois lados',t:100,max:100};
      for (const w of (z.waves && z.waves[0]) || []) zoneSpawn(w);
      if (z.boss){ banner={txt:boss?ENEMY_TYPES[boss.type].name:'Chefe',sub:'— CHEFE —',t:170,max:170,boss:true}; SFX.roar(); playMusic(stage.bossMusic); }
    }
    return;
  }
  const z=zones[zi];
  if (z.type==='survive'){
    surviveT--;
    if (surviveT%(z.every||90)===0 && enemies.filter(e=>e.hp>0).length<(z.max||6)) zoneSpawn([pick(z.spawn), Math.random()<0.5?'L':'R']);
    if (surviveT>0) return;
    for (const e of enemies) if (e.hp>0){ e.hp=0; e.state='dying'; e.t=0; burst(e.x,e.y-e.h/2,'#ffffff',8,4); }
    banner={txt:'Você sobreviveu!',sub:'',t:90,max:90};
    locked=false; zi++; goTimer=200; SFX.go(); dropItem(clamp(me.x+120,lockL+60,lockR-60),-30,'hp',0);
    return;
  }
  if (enemies.some(e=>e.hp>0)){ waveDelay=0; return; }
  if (++waveDelay<45) return;
  waveDelay=0; wave++;
  if (z.waves && wave<z.waves.length){ for (const w of z.waves[wave]) zoneSpawn(w); }
  else {
    locked=false; zi++;
    if (!z.boss){ goTimer=200; SFX.go(); dropItem(clamp(me.x+120,lockL+60,lockR-60),-30,'hp',0); }
  }
}
function drawEncounterHUD(){
  const z=stage && stage.zones[zi];
  if (locked && z && z.type==='survive') txt(`SOBREVIVA: ${Math.max(0,Math.ceil(surviveT/60))}s`,W/2,40,26,'#ffd23f');
  // a chasing boulder still off screen: show how close it is
  for (const h of hazards) if (h.type==='roller' && h.x+h.r<cam.x){
    const d=Math.round((cam.x-h.x)/10), a=0.6+0.4*Math.sin(clock*0.3);
    ctx.globalAlpha=a; txt('◀ PEDRA '+d+'m',70,GROUND-120,18,'#ff6b6b'); ctx.globalAlpha=1;
  }
  for (const e of enemies) if (e.mini && e.hp>0){
    const sx=e.x-cam.x, y=e.y-e.h-26;
    txt(e.mini,sx,y-10,12,'#ffb0a0');
    ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.fillRect(sx-40,y,80,6); ctx.fillStyle='#ff5a3d'; ctx.fillRect(sx-40,y,80*e.hp/e.maxHp,6);
  }
}

// ---------- boss phases and custom moves ----------
// A boss can list `phases` (life fractions, e.g. [0.66,0.33]); crossing one calls its `onPhase(e,n)`
// and switches to `movesByPhase[n-1]`. Stage files can add their own boss states to BOSS_STATES.
const BOSS_STATES = {};
function bossPhaseCheck(e,T){
  e.phase=e.phase||1;
  const th=T.phases; if (!th) return;
  if (e.phase<=th.length && e.hp>0 && e.hp<e.maxHp*th[e.phase-1]){
    e.phase++;
    banner={txt:'FASE '+e.phase,sub:T.name,t:110,max:110,boss:true}; SFX.roar(); addShake(10); flashScreen=Math.max(flashScreen,0.3);
    if (T.onPhase) T.onPhase(e,e.phase);
  }
}
const bossMoves = (e,T) => T.movesByPhase ? T.movesByPhase[Math.min(e.phase||1,T.movesByPhase.length)-1] : T.moves;
// Shields: `shielded` blocks every hit (break whatever powers it first); `guarding` only blocks hits from the front
function shieldBlocks(e,dir){
  if (e.dodgeT>0){ if (!e.blockT || frame-e.blockT>20){ e.blockT=frame; addText(e.x,e.y-e.h-8,'ESQUIVOU','#ffffff'); } return true; }
  const front = e.guarding && dir===-e.face;
  if (!e.shielded && !front) return false;
  // three blocked hits break a frontal guard for a while
  if (front && !isGuest() && (e.guardHits=(e.guardHits||0)+1)>=3){
    e.guardHits=0; e.guarding=false; e.guardBroken=150; e.state='hurt'; e.t=50; e.vx=dir*3;
    bigText(e.x,e.y-e.h-14,'DEFESA QUEBRADA!','#ff8a8a'); SFX.guardBreak(); burst(e.x,e.y-e.h*0.6,'#c9ced6',14,6);
    return true;
  }
  if (!e.blockT || frame-e.blockT>20){ e.blockT=frame; addText(e.x,e.y-e.h-8,e.shielded?'ESCUDO':'BLOQUEOU','#8fe6ff'); SFX.block(); }
  burst(e.x-dir*e.w*0.4,e.y-e.h*0.55,'#8fe6ff',6,4,0);
  return true;
}
