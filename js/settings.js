'use strict';
// ===================== Settings (saved in this browser) =====================
// Remappable actions shown in the options screen, in display order.
const ACTIONS = [
  ['left','Esquerda'], ['right','Direita'], ['up','Cima'], ['down','Baixo / descer'],
  ['jump','Pular'], ['attack','Atacar'], ['skill1','Especial 1'], ['skill2','Especial 2'],
  ['pause','Pausar'],
];
const DEFAULT_BINDS = {
  left:'ArrowLeft', right:'ArrowRight', up:'ArrowUp', down:'ArrowDown',
  jump:'ArrowUp', attack:'KeyZ', skill1:'KeyX', skill2:'KeyC', pause:'KeyP',
};
// Extra keys that always work besides the remappable one
const EXTRA_BINDS = { jump:['Space'], pause:['Escape'] };

const SETTINGS_KEY = 'vallen.settings.v1';
const Settings = { music:7, sfx:8, shake:true, touch:'auto', binds:{...DEFAULT_BINDS} };

function loadSettings(){
  try {
    const s = JSON.parse(localStorage.getItem(SETTINGS_KEY) || 'null');
    if (s){ Object.assign(Settings, s); Settings.binds = {...DEFAULT_BINDS, ...(s.binds||{})}; }
  } catch (e) {}
}
function saveSettings(){ try { localStorage.setItem(SETTINGS_KEY, JSON.stringify(Settings)); } catch (e) {} }
loadSettings();

const KEY_NAMES = { ArrowLeft:'←', ArrowRight:'→', ArrowUp:'↑', ArrowDown:'↓', Space:'Espaço', Escape:'Esc', Enter:'Enter',
  ShiftLeft:'Shift', ShiftRight:'Shift dir.', ControlLeft:'Ctrl', ControlRight:'Ctrl dir.', AltLeft:'Alt', AltRight:'Alt dir.',
  Backspace:'Backspace', Tab:'Tab', CapsLock:'Caps', Semicolon:';', Comma:',', Period:'.', Slash:'/', Quote:"'", BracketLeft:'[', BracketRight:']' };
function keyLabel(code){
  if (!code) return '—';
  if (KEY_NAMES[code]) return KEY_NAMES[code];
  if (code.startsWith('Key')) return code.slice(3);
  if (code.startsWith('Digit')) return code.slice(5);
  if (code.startsWith('Numpad')) return 'Num ' + code.slice(6);
  return code;
}
const bindLabel = act => keyLabel(Settings.binds[act]);
