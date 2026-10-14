'use strict';
// ===================== Input: keyboard + gamepad + touch → actions =====================
// Game code only reads Input.held[action] / Input.pressed[action].
// `pressed` accumulates until consumeInput(), so presses made during hitstop are buffered.
const Input = { held:{}, pressed:{}, prev:{}, capture:null, device:'keyboard' };
const FIXED_BINDS = { confirm:['Enter','NumpadEnter','Space'], back:['Escape','Backspace'], mute:['KeyM'],
  emote1:['Digit1'], emote2:['Digit2'], emote3:['Digit3'], emote4:['Digit4'] };
const MENU_ACTS = ['confirm','back','mute','emote1','emote2','emote3','emote4'];
const kb = { held:{}, hit:{} };
const touch = { held:{}, hit:{} };

function allActions(){ return [...ACTIONS.map(a=>a[0]), ...MENU_ACTS]; }
function bindsFor(act){
  const b=[];
  if (Settings.binds[act]) b.push(Settings.binds[act]);
  if (EXTRA_BINDS[act]) b.push(...EXTRA_BINDS[act]);
  if (FIXED_BINDS[act]) b.push(...FIXED_BINDS[act]);
  return b;
}

addEventListener('keydown', e => {
  if (e.target.tagName==='INPUT') return;
  if (Input.capture){ e.preventDefault(); const cb=Input.capture; Input.capture=null; cb(e.code); return; }
  if (['ArrowUp','ArrowDown','ArrowLeft','ArrowRight','Space','Tab'].includes(e.code)) e.preventDefault();
  if (!kb.held[e.code]) kb.hit[e.code]=true;
  kb.held[e.code]=true; Input.device='keyboard';
});
addEventListener('keyup', e => { kb.held[e.code]=false; });
addEventListener('blur', () => { for (const k in kb.held) kb.held[k]=false; touch.held={}; });

// ----- Gamepad (standard mapping: Xbox / PlayStation) -----
const PAD_BINDS = {
  jump:[0], attack:[2], skill1:[3], skill2:[1], skill3:[5], guard:[4], dodge:[6,7],
  pause:[9], confirm:[0,9], back:[1,8], left:[14], right:[15], up:[12], down:[13],
};
function activePad(){
  const pads = navigator.getGamepads ? navigator.getGamepads() : [];
  for (const p of pads) if (p && p.connected) return p;
  return null;
}
function padHeld(gp,act){
  if ((PAD_BINDS[act]||[]).some(i=>gp.buttons[i] && gp.buttons[i].pressed)) return true;
  const ax=gp.axes;
  if (act==='left') return ax[0]<-0.5;
  if (act==='right') return ax[0]>0.5;
  if (act==='up') return ax[1]<-0.6;
  if (act==='down') return ax[1]>0.6;
  return false;
}

function pollInput(){
  const gp=activePad();
  for (const a of allActions()){
    const binds=bindsFor(a);
    let h = binds.some(c=>kb.held[c]) || !!touch.held[a];
    let hit = binds.some(c=>kb.hit[c]) || !!touch.hit[a];
    if (gp && padHeld(gp,a)){ h=true; Input.device='gamepad'; }
    if (h && !Input.prev[a]) hit=true;
    Input.held[a]=h; Input.prev[a]=h;
    if (hit) Input.pressed[a]=true;
  }
  for (const k in kb.hit) delete kb.hit[k];
  for (const k in touch.hit) delete touch.hit[k];
}
function consumeInput(){ for (const k in Input.pressed) delete Input.pressed[k]; }

// ----- Touch controls (DOM overlay) -----
const touchEl = document.getElementById('touch');
const touchPointers = new Map(); // pointerId -> "act act"
function actsAt(x,y){
  const el=document.elementFromPoint(x,y);
  const b=el && el.closest ? el.closest('#touch [data-act]') : null;
  return b ? b.dataset.act : null;
}
function recomputeTouch(){
  const now={};
  for (const acts of touchPointers.values()) if (acts) for (const a of acts.split(' ')) now[a]=true;
  for (const a in now) if (!touch.held[a]) touch.hit[a]=true;
  touch.held=now;
  for (const b of touchEl.querySelectorAll('[data-act]')) b.classList.toggle('on', !!now[b.dataset.act.split(' ')[0]]);
}
touchEl.addEventListener('pointerdown', e => {
  e.preventDefault(); Input.device='touch';
  touchPointers.set(e.pointerId, actsAt(e.clientX,e.clientY)); recomputeTouch();
});
touchEl.addEventListener('pointermove', e => {
  if (!touchPointers.has(e.pointerId)) return;
  const acts=actsAt(e.clientX,e.clientY);
  if (acts!==touchPointers.get(e.pointerId)){ touchPointers.set(e.pointerId,acts); recomputeTouch(); }
});
for (const ev of ['pointerup','pointercancel','lostpointercapture'])
  touchEl.addEventListener(ev, e => { touchPointers.delete(e.pointerId); recomputeTouch(); });
touchEl.addEventListener('contextmenu', e => e.preventDefault());
// the 💬 button just opens/closes the row of emote buttons
const emoteBar=document.getElementById('emoteBar');
document.getElementById('emoteToggle').addEventListener('pointerdown', e => { e.stopPropagation(); e.preventDefault(); emoteBar.hidden=!emoteBar.hidden; });
emoteBar.addEventListener('pointerup', () => setTimeout(()=>{ emoteBar.hidden=true; },150));

const coarse = matchMedia('(pointer: coarse)');
let sawTouch = coarse.matches;
if (sawTouch) Input.device='touch';
addEventListener('touchstart', () => { sawTouch=true; updateTouchVisibility(); }, {passive:true});
function updateTouchVisibility(){
  const show = Settings.touch==='on' || (Settings.touch==='auto' && sawTouch);
  touchEl.hidden = !show;
  document.body.classList.toggle('touching', show);
}
updateTouchVisibility();
