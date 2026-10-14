'use strict';
// ===================== Online connection (PeerJS / WebRTC) =====================
// Rules shared by every online mode:
//  - each browser simulates its own fighter and streams snapshots of it;
//  - whoever detects a hit sends it, and the victim's browser applies it (see hurtPlayer);
//  - mode-specific messages are handled by NET_HANDLERS registered in pvp.js / coop.js.
const Net = { mode:null, host:false, peer:null, conn:null, lastRecv:0, sendT:0 };
const PEER_PREFIX = 'cronicas-vallen-v2-';
const NET_HANDLERS = {};
const $ = id => document.getElementById(id);

function online(){ return !!(Net.conn && Net.conn.open); }
function netSend(m){ if (online()){ try { Net.conn.send(m); } catch (e) {} } }

// ----- lobby UI -----
function lobbyStatus(msg,err){ const el=$('lobbyStatus'); el.textContent=msg; el.className=err?'err':''; }
function openLobby(netMode){
  Net.mode=netMode; mode='lobby'; SFX.select();
  $('lobbyTitle').textContent = netMode==='pvp' ? 'PvP Online' : 'Co-op Online';
  $('lobbySub').textContent = netMode==='pvp' ? 'Lute contra um amigo em outro navegador' : 'Jogue a história com um amigo em outro navegador';
  $('lobby').hidden=false; $('hostInfo').hidden=true; $('btnHost').hidden=false; $('joinRow').hidden=false; $('orSep').hidden=false;
  $('joinCode').value=''; lobbyStatus('');
  $('pvpOpts').hidden = netMode!=='pvp';
  if (typeof Peer==='undefined') lobbyStatus('Não foi possível carregar a parte online (precisa de internet).',true);
}
function closeLobby(){ $('lobby').hidden=true; if (document.activeElement) document.activeElement.blur(); }
function leaveOnline(){
  netSend({type:'bye'});
  const c=Net.conn, pe=Net.peer; Net.conn=null; Net.peer=null; Net.mode=null;
  if (c) try { c.close(); } catch (e) {}
  if (pe) try { pe.destroy(); } catch (e) {}
  closeLobby(); goTitle();
}
function randCode(){ const A='ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; let c=''; for (let i=0;i<4;i++) c+=A[Math.random()*A.length|0]; return c; }
function peerId(code){ return PEER_PREFIX+Net.mode+'-'+code; }
function hostRoom(){
  if (typeof Peer==='undefined') return;
  if (Net.peer) Net.peer.destroy();
  const code=randCode(); Net.host=true;
  $('btnHost').hidden=true; $('joinRow').hidden=true; $('orSep').hidden=true;
  lobbyStatus('Criando sala…');
  const peer=Net.peer=new Peer(peerId(code));
  peer.on('open',()=>{ $('hostInfo').hidden=false; $('roomCode').textContent=code; lobbyStatus('Aguardando o outro jogador…'); });
  peer.on('connection',c=>{ if (Net.conn){ c.on('open',()=>c.close()); return; } setupConn(c); });
  peer.on('error',e=>{ if (e.type==='unavailable-id') hostRoom(); else lobbyStatus('Erro de conexão: '+e.type,true); });
}
function joinRoom(){
  if (typeof Peer==='undefined') return;
  const code=$('joinCode').value.trim().toUpperCase();
  if (code.length!==4){ lobbyStatus('Digite o código de 4 letras.',true); return; }
  if (Net.peer) Net.peer.destroy();
  Net.host=false; lobbyStatus('Conectando…');
  const peer=Net.peer=new Peer();
  $('pvpOpts').hidden=true;
  peer.on('open',()=>setupConn(peer.connect(peerId(code),{reliable:true})));
  peer.on('error',e=>{ Net.conn=null; lobbyStatus(e.type==='peer-unavailable'?'Sala não encontrada. Confira o código e o modo de jogo.':'Erro de conexão: '+e.type,true); });
}
function setupConn(c){
  Net.conn=c;
  c.on('open',()=>{ Net.lastRecv=performance.now(); lobbyStatus('Conectado! Preparando…'); netSend({type:'hello',hero:selHero}); });
  c.on('data',onNet);
  c.on('close',onDisconnect);
  c.on('error',onDisconnect);
}
function onDisconnect(){
  if (!Net.conn) return;
  Net.conn=null;
  if (mode==='lobby') lobbyStatus('A conexão caiu. Tente de novo.',true);
  else if (Net.mode==='pvp') pvpDisconnect();
  else if (Net.mode==='coop') coopDisconnect();
}
$('btnHost').onclick=hostRoom;
$('btnJoin').onclick=joinRoom;
$('joinCode').addEventListener('keydown',e=>{ if (e.key==='Enter') joinRoom(); if (e.key==='Escape') leaveOnline(); });
$('btnBack').onclick=leaveOnline;
addEventListener('pagehide',()=>netSend({type:'bye'}));
// WebRTC can take long to report a closed peer: also give up after 10 s of silence
function checkTimeout(){ if (Net.conn && performance.now()-Net.lastRecv>10000) onDisconnect(); }
setInterval(()=>{ if (Net.conn) netSend({type:'ping'}); },1000); // keeps working while the other tab is in background

// ----- messages -----
function remotePlayer(){ return players.find(p=>!p.local); }
function onNet(m){
  Net.lastRecv=performance.now();
  switch (m.type){
    case 'ping': return;
    case 'bye': onDisconnect(); return;
    case 's': { const r=remotePlayer(); if (r) applySnap(r,m); return; }
    case 'proj': projs.push({...m.o,owner:'p',local:false}); return;
    case 'eproj': projs.push({...m.o,local:false}); return;
    case 'sfx': if (SFX[m.n] && mode!=='lobby') SFX[m.n](m.a); return;
    case 'emote': showEmote(remotePlayer(),m.i,false); return;
    case 'hello': if (Net.mode==='pvp') pvpHello(m); else coopHello(m); return;
    case 'hurt': if (me && m.id===me.id){ applyHurt(me,m.h); if (m.h.pvp) projs=projs.filter(q=>!(q.owner==='p' && !q.local && q.pid===m.h.pid && q.type==='parrow' && !q.big)); } return;
    case 'fx':
      if (m.k==='giga'){ ring(m.x,m.y,'#fff2b0',15,24,14); ring(m.x,m.y,'#ff8a3d',9,30,8); burst(m.x,m.y,'#ffd36b',40,10,0.1); flashScreen=0.6; addShake(14); }
      else if (FX_HANDLERS[m.k]) FX_HANDLERS[m.k](m);
      return;
  }
  if (NET_HANDLERS[m.type]) NET_HANDLERS[m.type](m);
}
const FX_HANDLERS = {
  cutin: m => { cutin={hero:m.hero,name:m.name,t:70}; },
  beam: m => { parts.push({beam:true,x:m.x,y:m.y,face:m.face,len:m.len,life:36,max:36}); },
  slashline: m => { parts.push({slash:true,x1:m.x1,x2:m.x2,y:m.y,life:18,max:18}); },
};
NET_HANDLERS.stagger = () => { if (me) stagger(me); };
NET_HANDLERS.stun = m => { const e=enemies.find(o=>o.id===m.id); if (e) stunEnemy(e); };

function sendSnap(p){
  netSend({type:'s',x:Math.round(p.x*10)/10,y:Math.round(p.y*10)/10,vx:p.vx,vy:p.vy,f:p.face,st:p.state,t:p.t,sk:p.sk,
    ak:p.atk?p.atk.name:null,an:p.anim,og:p.onGround,inv:p.inv,hp:p.hp,mhp:p.maxHp,mp:Math.round(p.mp),h:p.hero,g:Math.round(p.guardHp)});
}
function applySnap(r,m){
  Object.assign(r,{tx:m.x,ty:m.y,vx:m.vx,vy:m.vy,face:m.f,state:m.st,t:m.t,sk:m.sk,anim:m.an,onGround:m.og,inv:m.inv,
    hp:m.hp,maxHp:m.mhp,mp:m.mp,hero:m.h,guardHp:m.g});
  r.atk = m.ak ? HEROES[m.h].atk[m.ak] : null;
  if (r.state==='attack' && !r.atk) r.state='free';
}
