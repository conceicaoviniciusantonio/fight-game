'use strict';
// ===================== PvP: best of 3 rounds in the boss arena =====================
// The host runs the round flow (timer, K.O., score) and tells the guest.
const PVP_DMG = 0.8;
const pvp = { round:1, wins:[0,0], timer:0, phase:'wait', phaseT:0, rivalKo:false, disc:false,
  wantRematch:false, rivalRematch:false, matchWinner:0, bestOf:3, time:99 };
const winsNeeded = () => Math.ceil(pvp.bestOf/2);
const myIdx = () => Net.host ? 0 : 1;

function pvpHello(m){
  const rival=makePlayer(m.hero,{id:Net.host?'guest':'host',local:false});
  players=[me=makePlayer(selHero,{id:Net.host?'host':'guest'}), rival];
  if (Net.host) startMatch();
}
NET_HANDLERS.dead = () => { pvp.rivalKo=true; };
NET_HANDLERS.ko = m => onRoundEnd(m);
NET_HANDLERS.round = m => onRound(m);
NET_HANDLERS.match = m => onMatchEnd(m);
NET_HANDLERS.rematch = () => { pvp.rivalRematch=true; if (Net.host && pvp.wantRematch) startMatch(); };
function pvpDisconnect(){
  if (mode==='pvp'||mode==='pvpEnd'){ pvp.disc=true; mode='pvpEnd'; endTimer=0; playMusic(null); }
}

function startMatch(){
  const m={type:'round',n:1,wins:[0,0],bestOf:+$('optRounds').value,time:+$('optTime').value};
  netSend(m); onRound(m);
}
function onRound(m){
  closeLobby();
  pvp.round=m.n; pvp.wins=m.wins.slice(); pvp.disc=false;
  if (m.bestOf) pvp.bestOf=m.bestOf;
  if (m.time!=null) pvp.time=m.time; pvp.wantRematch=false; pvp.rivalRematch=false;
  loadStage('forest'); resetWorld();
  const ar=stage.arena; platforms=[...stage.platforms, ...ar.extra];
  locked=true; lockL=ar.left; lockR=ar.left+W; cam.x=ar.left;
  mode='pvp'; playMusic('boss');
  const left=Net.host, rival=remotePlayer();
  Object.assign(me,{x:left?lockL+170:lockR-170,y:GROUND,vx:0,vy:0,face:left?1:-1,hp:me.maxHp,mp:100,state:'free',t:0,inv:0});
  if (rival){ Object.assign(rival,{x:left?lockR-170:lockL+170,y:GROUND,hp:rival.maxHp,state:'free',localInv:0,inv:0,face:left?-1:1}); rival.tx=rival.x; rival.ty=rival.y; }
  pvp.phase='intro'; pvp.phaseT=0; pvp.timer=pvp.time?pvp.time*60:Infinity; pvp.rivalKo=false;
  banner={txt:'ROUND '+m.n,sub:`${pvp.wins[0]}  ×  ${pvp.wins[1]}`,t:90,max:90};
  SFX.select();
}
function onRoundEnd(m){
  pvp.wins=m.wins.slice(); pvp.phase='ko'; pvp.phaseT=0;
  banner={txt:m.to?'TEMPO!':'K.O.!',sub:m.w===myIdx()?'Você venceu o round!':'O rival venceu o round',t:150,max:150};
  flashScreen=0.5; addShake(12); hitstop=20; SFX.boom();
}
function onMatchEnd(m){
  mode='pvpEnd'; endTimer=0; pvp.matchWinner=m.w; pvp.wantRematch=false; pvp.rivalRematch=false;
  playMusic(m.w===myIdx()?'victory':'gameover');
}

function tickPvp(){
  pvp.phaseT++;
  if (++Net.sendT%2===0) sendSnap(me);
  checkTimeout();
  const rival=remotePlayer();
  if (hitstop>0){ hitstop--; if (rival) updatePuppet(rival); return; }
  frame++;
  if (pvp.phase==='intro'){
    me.vx*=0.6; physics(me);
    if (pvp.phaseT===92){ banner={txt:'LUTE!',sub:'',t:50,max:50}; SFX.go(); }
    if (pvp.phaseT>=100) pvp.phase='fight';
  } else updatePlayer(me);
  if (rival) updatePuppet(rival);
  checkEmotes();
  updateProjs(); updateFx();
  if (comboTimer>0 && --comboTimer===0) combo=0;
  if (pvp.phase==='fight' && pvp.timer>0) pvp.timer--;
  if (Net.host && rival){
    if (pvp.phase==='fight'){
      const myDead=me.hp<=0, rDead=pvp.rivalKo||rival.hp<=0;
      if (myDead || rDead || pvp.timer<=0){
        const w = myDead!==rDead ? (myDead?1:0) : (me.hp/me.maxHp>=rival.hp/rival.maxHp ? 0 : 1);
        pvp.wins[w]++;
        const m={type:'ko',w,wins:pvp.wins.slice(),to:!myDead&&!rDead}; netSend(m); onRoundEnd(m);
      }
    } else if (pvp.phase==='ko' && pvp.phaseT>=180){
      pvp.phase='wait';
      const need=winsNeeded();
      const m = pvp.wins[0]>=need||pvp.wins[1]>=need ? {type:'match',w:pvp.wins[0]>=need?0:1} : {type:'round',n:pvp.round+1,wins:pvp.wins.slice()};
      netSend(m); if (m.type==='match') onMatchEnd(m); else onRound(m);
    }
  }
  consumeInput();
}
function tickPvpEnd(){
  endTimer++; updateFx();
  const rival=remotePlayer(); if (rival) updatePuppet(rival);
  if (++Net.sendT%2===0) sendSnap(me);
  checkTimeout();
  const P=Input.pressed;
  if (pvp.disc){ if (endTimer>30 && (P.confirm||P.back)) leaveOnline(); }
  else if (endTimer>60 && P.confirm && !pvp.wantRematch){ pvp.wantRematch=true; SFX.select(); netSend({type:'rematch'}); if (Net.host && pvp.rivalRematch) startMatch(); }
  else if (P.back) leaveOnline();
  consumeInput();
}

function drawPvpHUD(){
  const ents=[]; ents[myIdx()]=me; ents[1-myIdx()]=remotePlayer();
  ents.forEach((p,i)=>{
    if (!p) return;
    const right=i===1, x0=right?W-344:14, mine=i===myIdx();
    panel(x0,12,330,70,14);
    if (mine){ ctx.strokeStyle='#ffd23f'; ctx.lineWidth=2; ctx.beginPath(); ctx.roundRect(x0,12,330,70,14); ctx.stroke(); }
    txt(`P${i+1} · ${HEROES[p.hero].name}${mine?'  (VOCÊ)':''}`,right?x0+320:x0+10,24,13,mine?'#ffd34d':'#ff9a8a',right?'right':'left');
    bar(x0+10,34,310,16,Math.max(0,p.hp)/p.maxHp,'#ff6b7a','#b3122a');
    txt(`${Math.ceil(Math.max(0,p.hp))} / ${p.maxHp}`,x0+165,42,12,'#ffffff');
    mpBars(x0+10,60,98,9,p.mp);
    for (let k=0;k<winsNeeded();k++){
      const cx=right?x0+320-k*20:x0+10+k*20;
      ctx.fillStyle=pvp.wins[i]>k?'#ffd23f':'rgba(0,0,0,0.5)'; circle(cx,96,7);
      ctx.strokeStyle='#ffd23f'; ctx.lineWidth=1.5; ctx.beginPath(); ctx.arc(cx,96,7,0,Math.PI*2); ctx.stroke();
    }
  });
  txt(`ROUND ${pvp.round}`,W/2,22,13,'#cfe3ff');
  const secs=Math.ceil(pvp.timer/60);
  txt(pvp.time?String(secs):'∞',W/2,52,40,secs<=10&&pvp.phase==='fight'?'#ff6b6b':'#ffffff');
  drawCombo(W/2,130);
  muteBadge(); drawCutin(); drawBanner();
}
function drawPvpOverlay(){
  ctx.fillStyle=`rgba(0,8,25,${Math.min(0.75,endTimer/50)})`; ctx.fillRect(0,0,W,H);
  if (pvp.disc){
    txt('O outro jogador saiu da partida',W/2,H/2-20,34,'#ff9a8a');
    if (endTimer>30) txt('ENTER voltar ao menu',W/2,H/2+30,20,'#ffffff');
    return;
  }
  const won=pvp.matchWinner===myIdx();
  txt(won?'VOCÊ VENCEU!':'VOCÊ PERDEU',W/2,H/2-60,64,won?'#ffd23f':'#ff6b6b');
  txt(`${pvp.wins[0]}  ×  ${pvp.wins[1]}`,W/2,H/2+5,36,'#ffffff');
  if (endTimer>60){
    if (pvp.wantRematch) txt('Aguardando o rival aceitar a revanche…',W/2,H/2+70,20,'#cfe3ff');
    else {
      if (pvp.rivalRematch) txt('O rival quer revanche!',W/2,H/2+55,20,'#9fe3a8');
      txt('ENTER revanche   ·   ESC sair',W/2,H/2+90,22,'#ffffff');
    }
  }
}
