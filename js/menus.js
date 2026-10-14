'use strict';
// ===================== Menus: title, hero select, options, key binding, pause =====================
let selMode='story', selHero='knight', menuSel=0, optSel=0, keySel=0, keyWaiting=false, optionsFrom='title', pauseSel=0;

const TITLE_ITEMS = [
  {id:'story', label:'HISTÓRIA',   hint:'Atravesse o Bosque de Vallen e derrote o chefe'},
  {id:'coop',  label:'CO-OP ONLINE', hint:'Jogue a história com um amigo em outro navegador'},
  {id:'pvp',   label:'PVP ONLINE', hint:'Lute contra um amigo em outro navegador'},
  {id:'options', label:'OPÇÕES',   hint:'Som, tela e controles'},
];

function menuNav(n,sel,horizontal){
  const P=Input.pressed;
  const prev = horizontal ? P.left : P.up, next = horizontal ? P.right : P.down;
  if (prev){ SFX.move(); return (sel-1+n)%n; }
  if (next){ SFX.move(); return (sel+1)%n; }
  return sel;
}

// ----- title -----
function tickTitle(){
  menuSel=menuNav(TITLE_ITEMS.length,menuSel);
  if (Input.pressed.confirm || Input.pressed.attack){
    const it=TITLE_ITEMS[menuSel];
    SFX.select();
    if (it.id==='options') openOptions('title');
    else { selMode=it.id; mode='heroSelect'; }
  }
  consumeInput();
}
function drawTitle(){
  ctx.fillStyle='rgba(8,10,30,0.5)'; ctx.fillRect(0,0,W,H);
  txt('CRÔNICAS DE VALLEN',W/2,82+Math.sin(clock*0.05)*4,58,'#ffd23f');
  txt('uma aventura de espada e flecha',W/2,130,18,'#ffffff');
  const ids=HERO_IDS;
  drawHeroAt(ids[0],170,430,2.1,{anim:clock});
  drawHeroAt(ids[1%ids.length],W-170,430,2.1,{anim:clock+40,face:-1});
  TITLE_ITEMS.forEach((it,i)=>{
    const y=196+i*56, sel=i===menuSel;
    panel(W/2-150,y-24,300,48,24,sel?'#ffd23f':'rgba(0,0,0,0.5)');
    if (!sel){ ctx.strokeStyle='rgba(255,255,255,0.25)'; ctx.lineWidth=2; ctx.stroke(); }
    txt(it.label,W/2,y,22,sel?'#1b1b2e':'#e6ebf5','center',!sel);
  });
  txt(TITLE_ITEMS[menuSel].hint,W/2,196+TITLE_ITEMS.length*56-8,15,'#cfe3ff','center',false);
  txt(confirmHint('escolher'),W/2,H-28,15,'#ffffff');
}
function confirmHint(verb){
  if (Input.device==='gamepad') return `Direcional para navegar · A ${verb} · B voltar`;
  if (Input.device==='touch') return `Use as setas · ⚔ ${verb} · ✕ voltar`;
  return `↑ ↓ ← → navegar · ENTER ${verb} · ESC voltar`;
}

// ----- hero select -----
function tickHeroSelect(){
  const i=HERO_IDS.indexOf(selHero), P=Input.pressed;
  selHero=HERO_IDS[menuNav(HERO_IDS.length,i,true)];
  if (P.back){ SFX.move(); mode='title'; }
  else if (P.confirm || P.attack){
    if (selMode==='story') startStory();
    else openLobby(selMode);
  }
  consumeInput();
}
const STAT_NAMES = [['vida','Vida'],['ataque','Ataque'],['velocidade','Velocidade'],['alcance','Alcance']];
function drawHeroSelect(){
  ctx.fillStyle='rgba(8,10,30,0.62)'; ctx.fillRect(0,0,W,H);
  const modeName={story:'História',pvp:'PvP Online',coop:'Co-op Online'}[selMode];
  txt('ESCOLHA SEU PERSONAGEM',W/2,46,34,'#ffd23f');
  txt('Modo: '+modeName,W/2,80,16,'#cfe3ff','center',false);
  const n=HERO_IDS.length, gap=18, cw=Math.min(260,(W-60-(n-1)*gap)/n), x0=(W-(n*cw+(n-1)*gap))/2;
  HERO_IDS.forEach((id,i)=>{
    const Hh=HEROES[id], sel=id===selHero, x=x0+i*(cw+gap), y=104, ch=360, cx=x+cw/2;
    panel(x,y,cw,ch,14,sel?'rgba(255,210,63,0.16)':'rgba(0,0,0,0.5)');
    ctx.strokeStyle=sel?'#ffd23f':'rgba(255,255,255,0.18)'; ctx.lineWidth=sel?4:2; ctx.beginPath(); ctx.roundRect(x,y,cw,ch,14); ctx.stroke();
    const demo = sel && (clock%120)<40;
    ctx.fillStyle='rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(cx,y+196,34,7,0,0,Math.PI*2); ctx.fill();
    drawHeroAt(id,cx,y+194-(sel?Math.abs(Math.sin(clock*0.08))*6:0),1.5,
      {anim:clock,state:demo?'attack':'free',atk:demo?Hh.atk.c3:null,t:demo?Math.min(clock%120,Hh.atk.c3.act[1]+2):0,alpha:sel?1:0.6});
    txt(Hh.name,cx,y+222,24,sel?'#ffd23f':'#cfd6e6');
    txt(Hh.title,cx,y+244,14,'#ffffff','center',false);
    STAT_NAMES.forEach(([k,label],j)=>{
      const sy=y+268+j*18;
      txt(label,x+16,sy,12,'#cfe3ff','left',false);
      for (let q=0;q<5;q++){ ctx.fillStyle=q<Hh.stats[k]?'#ffd23f':'rgba(255,255,255,0.15)'; ctx.fillRect(x+cw-16-(5-q)*16,sy-5,12,10); }
    });
    txt(Hh.desc,cx,y+ch-12,11,'#cfe3ff','center',false);
  });
  txt(confirmHint('confirmar'),W/2,H-26,15,'#ffffff');
}

// ----- options -----
const TOUCH_MODES = ['auto','on','off'], TOUCH_NAMES = {auto:'Automático',on:'Sempre',off:'Nunca'};
function optionItems(){
  return [
    {label:'Música', vol:'music'},
    {label:'Efeitos sonoros', vol:'sfx'},
    {label:'Tremor de tela', val:()=>Settings.shake?'Ligado':'Desligado', adj:()=>{ Settings.shake=!Settings.shake; }},
    {label:'Controles na tela', val:()=>TOUCH_NAMES[Settings.touch], adj:d=>{ const i=TOUCH_MODES.indexOf(Settings.touch); Settings.touch=TOUCH_MODES[(i+d+3)%3]; updateTouchVisibility(); }},
    {label:'Configurar teclas', go:()=>{ mode='keys'; keySel=0; keyWaiting=false; }},
    {label:'Voltar', go:closeOptions},
  ];
}
function openOptions(from){ optionsFrom=from; mode='options'; optSel=0; }
function closeOptions(){ saveSettings(); mode = optionsFrom==='pause' ? 'play' : 'title'; }
function tickOptions(){
  const items=optionItems(), P=Input.pressed;
  optSel=menuNav(items.length,optSel);
  const it=items[optSel], d = P.left?-1 : P.right?1 : 0;
  if (it.vol && d){ Settings[it.vol]=clamp(Settings[it.vol]+d,0,10); applyVolumes(); if (it.vol==='sfx') SFX.hit(false); }
  else if (it.adj && (d || P.confirm || P.attack)){ it.adj(d||1); SFX.move(); }
  else if (it.go && (P.confirm || P.attack)){ SFX.select(); it.go(); }
  if (P.back){ SFX.move(); closeOptions(); }
  consumeInput();
}
function drawOptions(){
  ctx.fillStyle='rgba(8,10,30,0.78)'; ctx.fillRect(0,0,W,H);
  txt('OPÇÕES',W/2,60,38,'#ffd23f');
  optionItems().forEach((it,i)=>{
    const y=130+i*58, sel=i===optSel;
    panel(W/2-260,y-22,520,44,12,sel?'rgba(255,210,63,0.18)':'rgba(0,0,0,0.45)');
    if (sel){ ctx.strokeStyle='#ffd23f'; ctx.lineWidth=2; ctx.stroke(); }
    txt(it.label,W/2-236,y,18,sel?'#ffd23f':'#e6ebf5','left',false);
    if (it.vol){
      for (let q=0;q<10;q++){ ctx.fillStyle=q<Settings[it.vol]?'#ffd23f':'rgba(255,255,255,0.15)'; ctx.fillRect(W/2+20+q*20,y-8,14,16); }
      if (sel) txt('◀ ▶',W/2+236,y,14,'#ffd23f','right',false);
    } else if (it.val){ txt((sel?'◀ ':'')+it.val()+(sel?' ▶':''),W/2+236,y,17,'#ffffff','right',false); }
    else if (it.go && sel) txt('▶',W/2+236,y,17,'#ffd23f','right',false);
  });
  txt(confirmHint('alterar'),W/2,H-26,15,'#ffffff');
}

// ----- key binding -----
function keyItems(){ return [...ACTIONS.map(([id,label])=>({id,label})), {label:'Restaurar padrão',reset:true}, {label:'Voltar',back:true}]; }
function tickKeys(){
  const P=Input.pressed;
  if (keyWaiting){ consumeInput(); return; }
  const items=keyItems();
  keySel=menuNav(items.length,keySel);
  const it=items[keySel];
  if (P.confirm || P.attack){
    SFX.select();
    if (it.back){ saveSettings(); mode='options'; }
    else if (it.reset){ Settings.binds={...DEFAULT_BINDS}; saveSettings(); }
    else {
      keyWaiting=true;
      setTimeout(()=>{ Input.capture = code => {
        keyWaiting=false;
        if (code==='Escape') return;
        const old=Settings.binds[it.id];
        // a key used by another action is swapped; Up and Jump may share one (that's the default)
        const shareOk=(a,b)=>(a==='up'&&b==='jump')||(a==='jump'&&b==='up');
        for (const [a] of ACTIONS) if (a!==it.id && Settings.binds[a]===code && !shareOk(a,it.id)) Settings.binds[a]=old;
        Settings.binds[it.id]=code; saveSettings(); SFX.select();
      }; },0);
    }
  } else if (P.back){ saveSettings(); mode='options'; }
  consumeInput();
}
function drawKeys(){
  ctx.fillStyle='rgba(8,10,30,0.82)'; ctx.fillRect(0,0,W,H);
  txt('CONFIGURAR TECLAS',W/2,40,32,'#ffd23f');
  const items=keyItems();
  items.forEach((it,i)=>{
    const col=i<7?0:1, row=i<7?i:i-7, x=col?W/2+20:60, y=96+row*50, w=W/2-80, sel=i===keySel;
    panel(x,y-19,w,38,10,sel?'rgba(255,210,63,0.18)':'rgba(0,0,0,0.45)');
    if (sel){ ctx.strokeStyle='#ffd23f'; ctx.lineWidth=2; ctx.stroke(); }
    txt(it.label,x+16,y,16,sel?'#ffd23f':'#e6ebf5','left',false);
    if (it.id) txt(sel&&keyWaiting?'pressione…':bindLabel(it.id)+(EXTRA_BINDS[it.id]?' / '+EXTRA_BINDS[it.id].map(keyLabel).join(' / '):''),x+w-16,y,16,sel&&keyWaiting?'#9fe3a8':'#ffffff','right',false);
  });
  txt('Controle (Xbox/PlayStation): A pular · X atacar · Y, B e RB especiais · LB defesa · LT/RT esquiva · Start pausa',W/2,H-56,13,'#cfe3ff','center',false);
  txt(keyWaiting?'Pressione a nova tecla · ESC cancela':confirmHint('trocar'),W/2,H-26,15,'#ffffff');
}

// ----- pause -----
const PAUSE_ITEMS = ['Continuar','Opções','Sair para o menu'];
function setPaused(on){ paused=on; pauseSel=0; setDuck(on); }
function tickPause(){
  const P=Input.pressed;
  pauseSel=menuNav(PAUSE_ITEMS.length,pauseSel);
  if (P.back || P.pause) setPaused(false);
  else if (P.confirm || P.attack){
    SFX.select();
    if (pauseSel===0) setPaused(false);
    else if (pauseSel===1) openOptions('pause');
    else { setPaused(false); goTitle(); }
  }
  consumeInput();
}
function drawPause(){
  ctx.fillStyle='rgba(0,0,0,0.55)'; ctx.fillRect(0,0,W,H);
  txt('PAUSADO',W/2,150,52,'#ffffff');
  PAUSE_ITEMS.forEach((label,i)=>{
    const y=240+i*60, sel=i===pauseSel;
    panel(W/2-130,y-22,260,44,22,sel?'#ffd23f':'rgba(0,0,0,0.5)');
    txt(label,W/2,y,19,sel?'#1b1b2e':'#e6ebf5','center',!sel);
  });
}
