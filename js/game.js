'use strict';
// ===================== Game flow: modes, story, main loop =====================
let mode='title', paused=false, clock=0;
let zi=0, wave=0, waveDelay=0, goTimer=0, winTimer=0, loseTimer=0, endTimer=0, result=null;

function goTitle(){
  mode='title'; menuSel=0; paused=false; setDuck(false);
  Net.mode=null; players=[]; me=null; boss=null;
  loadStage('forest'); resetWorld(); playMusic('stage');
}
// Can attacks land right now? (story: until the boss falls; pvp: only while a round is on)
function canFight(){
  if (mode==='pvp') return pvp.phase==='fight';
  return mode==='play' && winTimer===0;
}
function onPlayerDown(p){
  if (mode==='pvp' && p===me) netSend({type:'dead'});
}

// ----- story -----
function startStory(stageId='forest'){
  loadStage(stageId); resetWorld();
  boss=null; zi=0; wave=0; waveDelay=0; goTimer=0; winTimer=0; loseTimer=0; result=null;
  players=[me=makePlayer(selHero,{id:'p0'})];
  mode='play'; paused=false;
  banner={txt:stage.name,sub:stage.sub,t:150,max:150};
  playMusic(stage.music); SFX.select();
}
function onBossDefeated(e){
  winTimer=1; hitstop=40; flashScreen=0.9; addShake(20);
  SFX.boom(); playMusic('victory');
  banner={txt:'VITÓRIA!',sub:ENEMY_TYPES[e.type].name.split(',')[0]+' foi derrotado',t:150,max:150};
  for (const o of enemies) if (o!==e && o.hp>0) killEnemy(o,o.x>e.x?1:-1);
}
function updateZones(){
  const zones=stage.zones;
  if (!locked){
    const lead=Math.max(...alivePlayers().map(p=>p.x), -1);
    if (zi<zones.length && lead>zones[zi].at){
      const z=zones[zi]; locked=true; lockL=z.left; lockR=z.left+W; wave=0; waveDelay=0; goTimer=0;
      for (const [t,x] of z.waves[0]) spawnEnemy(t,x);
      if (z.boss){ banner={txt:boss?ENEMY_TYPES[boss.type].name:'Chefe',sub:'— CHEFE —',t:170,max:170,boss:true}; SFX.roar(); playMusic(stage.bossMusic); }
    }
    return;
  }
  if (enemies.some(e=>e.hp>0)){ waveDelay=0; return; }
  if (++waveDelay<45) return;
  waveDelay=0; wave++;
  const z=zones[zi];
  if (wave<z.waves.length){ for (const [t,x] of z.waves[wave]) spawnEnemy(t,x); }
  else {
    locked=false; zi++;
    if (!z.boss){ goTimer=200; SFX.go(); dropItem(clamp(me.x+120,lockL+60,lockR-60),-30,'hp',0); }
  }
}

function projNear(pr,e){
  return pr.type==='parrow'
    ? Math.abs(e.x-pr.x)<e.w/2+(pr.big?14:8) && pr.y>e.y-e.h-(pr.big?10:0) && pr.y<e.y+4
    : Math.abs(e.x-pr.x)<e.w/2+(pr.r||30) && pr.y>e.y-e.h-20 && pr.y<e.y+10;
}
// Extra enemy-projectile collision tests registered by other modules
const ENEMY_PROJ_HIT = {
  arrow:(pr,p)=>Math.abs(p.x-pr.x)<p.w/2+6 && pr.y>p.y-p.h && pr.y<p.y,
  shock:(pr,p)=>Math.abs(p.x-pr.x)<26 && p.y>pr.y-40,
};
function updateProjs(){
  for (const pr of projs){
    pr.x+=pr.vx; pr.y+=pr.vy; pr.life--;
    if (pr.grav) pr.vy+=pr.grav;
    if (pr.type==='parrow' && pr.y>=GROUND){ pr.life=0; dust(pr.x,GROUND,2); continue; }
    if (pr.owner==='p'){
      if (frame%2===0){
        if (pr.type==='parrow' && pr.big) parts.push({x:pr.x,y:pr.y,vx:0,vy:0,life:10,max:10,color:'#c8ffb0',size:3,grav:0});
        else if (pr.type==='wave') parts.push({x:pr.x-pr.vx,y:pr.y+rand(-20,20),vx:-pr.vx*0.1,vy:0,life:14,max:14,color:'#9fe3ff',size:3,grav:0});
      }
      if (!pr.local || pr.deco) continue;
      const owner=players.find(p=>p.id===pr.pl) || me;
      for (const t of targetsOf(owner)){
        if (pr.hit.has(t.id) || !projNear(pr,t)) continue;
        if (strike(owner,t,pr.dmg,Math.sign(pr.vx)||owner.face,pr.kb??6,pr.up??-6,pr.pid)){
          pr.hit.add(t.id);
          if (!pr.pierce){ pr.life=0; break; }
        }
      }
    } else {
      if (pr.type==='shock' && frame%3===0) dust(pr.x,pr.y,1);
      if (!pr.local) continue;
      const test=ENEMY_PROJ_HIT[pr.type];
      for (const p of alivePlayers()){
        if (p.inv>0 || !test || !test(pr,p)) continue;
        hurtPlayer(p,{dmg:pr.dmg,dir:Math.sign(pr.vx)||1,fromX:pr.x-pr.vx*5});
        if (pr.type==='arrow' || pr.once){ pr.life=0; break; }
      }
    }
    if (pr.x<-200 || pr.x>worldW+200 || pr.y>H+100) pr.life=0;
  }
  projs=projs.filter(p=>p.life>0);
}
function applyPickup(p,type){
  if (!p.local){ netSend({type:'pickup',id:p.id,it:type}); return; }
  if (type==='hp'){ const h=Math.min(90,p.maxHp-p.hp); p.hp+=h; addText(p.x,p.y-90,'+'+h+' HP','#7dff8a'); }
  else if (type==='mp'){ p.mp=Math.min(MAXMP,p.mp+70); addText(p.x,p.y-90,'+MP','#7fd7ff'); }
  SFX.pickup();
}
function updateItems(){
  for (const it of items){
    it.t++; physics(it);
    if (it.t<=20) continue;
    for (const p of alivePlayers()){
      if (Math.abs(p.x-it.x)<30 && Math.abs((p.y-36)-(it.y-12))<55){
        it.t=99999; applyPickup(p,it.type);
        burst(it.x,it.y-12,it.type==='hp'?'#ff8a9a':'#8fd8ff',10,3);
        break;
      }
    }
  }
  items=items.filter(it=>it.t<720);
}
function followCamera(){
  const [l,r]=bounds();
  const target=clamp(me.x-W/2,l,r-W);
  cam.x+=(target-cam.x)*0.12;
}

function tickPlay(){
  const P=Input.pressed;
  if (paused){ tickPause(); return; }
  if (P.pause){ setPaused(true); consumeInput(); return; }
  if (hitstop>0){ hitstop--; return; } // presses stay buffered
  frame++;
  for (const p of players) if (p.local) updatePlayer(p); else updatePuppet(p);
  for (const e of enemies) updateEnemy(e);
  separate();
  enemies=enemies.filter(e=>!e.dead);
  updateProjs(); updateItems(); updateZones(); updateFx();
  if (comboTimer>0 && --comboTimer===0) combo=0;
  if (goTimer>0) goTimer--;
  if (boss) boss.dispHp+=(Math.max(0,boss.hp)-boss.dispHp)*0.05;
  followCamera();
  if (players.length && !alivePlayers().length && ++loseTimer>110){ mode='over'; endTimer=0; playMusic('gameover'); }
  if (winTimer>0 && ++winTimer>170){
    const secs=frame/60, hpB=Math.round(me.hp*4), timeB=Math.max(0,Math.round((300-secs)*15));
    const total=score+hpB+timeB;
    result={secs,hpB,timeB,total,rank: total>=15000?'S':total>=11000?'A':total>=7500?'B':'C'};
    mode='win'; endTimer=0;
  }
  consumeInput();
}
function tickEnd(){
  endTimer++; updateFx();
  const P=Input.pressed;
  if (endTimer>40 && P.confirm) startStory(stage ? STAGE_IDS.find(k=>STAGES[k]===stage) : 'forest');
  else if (endTimer>40 && P.back) goTitle();
  consumeInput();
}

function tick(){
  clock++;
  pollInput();
  if (Input.pressed.mute){ toggleMute(); delete Input.pressed.mute; }
  switch (mode){
    case 'title': tickTitle(); break;
    case 'heroSelect': tickHeroSelect(); break;
    case 'options': tickOptions(); break;
    case 'keys': tickKeys(); break;
    case 'lobby': if (Input.pressed.back) leaveOnline(); consumeInput(); break;
    case 'play': tickPlay(); break;
    case 'over': case 'win': tickEnd(); break;
    case 'pvp': tickPvp(); break;
    case 'pvpEnd': tickPvpEnd(); break;
  }
}

// ----- drawing -----
function hintLine(){
  const Hh=HEROES[me.hero], sk=Hh.skills.map((s,i)=>`${bindLabel('skill'+(i+1))} ${s.name} (${s.mp/100} MP)`).join('   ');
  if (Input.device==='gamepad') return 'Analógico mover · A pular · X atacar · Y / B especiais · ↓ descer';
  return `${bindLabel('left')} ${bindLabel('right')} mover   ${bindLabel('right')}${bindLabel('right')} dash   ${bindLabel('jump')} pular   ${bindLabel('down')} descer   ${bindLabel('attack')} atacar   ${sk}`;
}
function drawStoryHUD(){
  heroPanel(me,14,12);
  txt(`PONTOS ${score}`,W-20,26,20,'#ffffff','right');
  const s=Math.floor(frame/60); txt(`${Math.floor(s/60)}:${String(s%60).padStart(2,'0')}`,W-20,50,16,'#cfe3ff','right');
  drawCombo(W-90,130);
  if (locked && stage.zones[zi] && stage.zones[zi].boss) drawBossBar();
  if (goTimer>0 && (goTimer>>4)%2===0) txt('GO ▶',W-90,H/2,44,'#ffd23f');
  if (frame<720 && mode==='play' && Input.device!=='touch'){
    ctx.globalAlpha=frame>600?(720-frame)/120:1;
    const line=hintLine(); ctx.font=`bold 13px ${FONT}`; const w=Math.min(W-20,ctx.measureText(line).width+30);
    panel(W/2-w/2,H-40,w,28,8,'rgba(0,0,0,0.5)');
    txt(line,W/2,H-26,13,'#ffffff','center',false);
    ctx.globalAlpha=1;
  }
  muteBadge(); drawBanner();
}
function drawEndOverlay(){
  if (mode==='over'){
    ctx.fillStyle=`rgba(30,0,0,${Math.min(0.7,endTimer/60)})`; ctx.fillRect(0,0,W,H);
    txt('GAME OVER',W/2,H/2-30,72,'#ff4d5e');
    if (endTimer>40){ txt('ENTER tentar de novo',W/2,H/2+40,22,'#ffffff'); txt('ESC voltar ao menu',W/2,H/2+72,16,'#cfe3ff'); }
  } else if (mode==='win' && result){
    ctx.fillStyle=`rgba(0,10,30,${Math.min(0.75,endTimer/60)})`; ctx.fillRect(0,0,W,H);
    txt('FASE CONCLUÍDA!',W/2,90,56,'#ffd23f');
    const rows=[['Pontos',score],['Bônus de vida',result.hpB],['Bônus de tempo',result.timeB],['Combo máximo',maxCombo+' hits'],
      ['Tempo',`${Math.floor(result.secs/60)}:${String(Math.floor(result.secs%60)).padStart(2,'0')}`],['TOTAL',result.total]];
    rows.forEach(([k,v],i)=>{ if (endTimer>20+i*12){ txt(k,W/2-40,160+i*36,22,i===5?'#ffd23f':'#cfe3ff','right'); txt(String(v),W/2+20,160+i*36,22,'#ffffff','left'); } });
    if (endTimer>110){
      const rc={S:'#ffd23f',A:'#ff7b3d',B:'#7fd7ff',C:'#cccccc'}[result.rank];
      const pop=Math.max(1,3-(endTimer-110)*0.15);
      txt('RANK',W/2+250,190,22,'#ffffff'); txt(result.rank,W/2+250,260,110*pop,rc);
    }
    if (endTimer>140) txt('ENTER jogar de novo   ·   ESC menu',W/2,H-50,22,'#ffffff');
  }
}
function draw(){
  const inGame = ['play','over','win','pvp','pvpEnd'].includes(mode) || ((mode==='options'||mode==='keys') && optionsFrom==='pause');
  ctx.save();
  if (shake>0) ctx.translate(rand(-shake,shake),rand(-shake,shake)*0.6);
  if (inGame) drawWorld();
  else { cam.x=(Math.sin(clock*0.002)*0.5+0.5)*(worldW-W); drawBG(); drawPlatforms(); }
  ctx.restore();
  if (flashScreen>0){ ctx.fillStyle=`rgba(255,255,255,${flashScreen})`; ctx.fillRect(0,0,W,H); }
  if (mode==='pvp' || mode==='pvpEnd'){
    nameTag(remotePlayer(),'RIVAL','#ff6b6b'); nameTag(me,'VOCÊ','#ffd23f');
    drawPvpHUD(); if (mode==='pvpEnd') drawPvpOverlay();
  } else if (inGame){ drawStoryHUD(); drawEndOverlay(); if (paused && mode==='play') drawPause(); }
  switch (mode){
    case 'title': drawTitle(); break;
    case 'heroSelect': drawHeroSelect(); break;
    case 'options': drawOptions(); break;
    case 'keys': drawKeys(); break;
    case 'lobby': ctx.fillStyle='rgba(8,10,30,0.6)'; ctx.fillRect(0,0,W,H); txt('CRÔNICAS DE VALLEN',W/2,50,38,'#ffd23f'); break;
  }
}

// ----- loop -----
let last=performance.now(), acc=0;
function loop(now){
  acc+=Math.min(100,now-last); last=now;
  while (acc>=1000/60){ tick(); acc-=1000/60; }
  draw();
  requestAnimationFrame(loop);
}
goTitle();
requestAnimationFrame(loop);
