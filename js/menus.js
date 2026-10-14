'use strict';
// ===================== Menus: title, hero select, options, key binding, pause =====================
let selMode='story', selHero='knight', menuSel=0, optSel=0, keySel=0, keyWaiting=false, optionsFrom='title', pauseSel=0;

const TITLE_ITEMS = [
  {id:'story', label:'HISTÓRIA',   hint:'Atravesse as terras de Vallen e derrote seus chefes'},
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
  txt('uma aventura de espada, flecha, magia e lança',W/2,130,18,'#ffffff');
  // the heroes take turns in pairs on both sides of the menu
  const ids=HERO_IDS, k=Math.floor(clock/360), fade=Math.min(1,(clock%360)/30,(360-clock%360)/30);
  drawHeroAt(ids[(k*2)%ids.length],170,430,2.1,{anim:clock,alpha:fade});
  drawHeroAt(ids[(k*2+1)%ids.length],W-170,430,2.1,{anim:clock+40,face:-1,alpha:fade});
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
    if (selMode==='story') openMap();
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

// ----- stage map -----
let mapSel=0;
const MAP_NODES = { forest:{x:150,y:322,icon:'tree'}, cave:{x:375,y:215,icon:'crystal'}, desert:{x:600,y:318,icon:'pyramid'}, castle:{x:820,y:190,icon:'castle'} };
const ENEMY_NAMES = { goblin:'Goblin', archer:'Goblin arqueiro', orc:'Orc', bat:'Morcego', kobold:'Kobold', shaman:'Xamã',
  scorpion:'Escorpião', mummy:'Múmia', nomad:'Nômade', skeleton:'Esqueleto', darkmage:'Mago sombrio', blackknight:'Cavaleiro negro' };
function openMap(){
  mode='map';
  const open=STAGE_IDS.filter(stageUnlocked), next=open.find(id=>!Progress.cleared.includes(id));
  mapSel=STAGE_IDS.indexOf(next||open[open.length-1]);
}
function tickMap(){
  const P=Input.pressed;
  mapSel=menuNav(STAGE_IDS.length,mapSel,true);
  const id=STAGE_IDS[mapSel];
  if (P.confirm || P.attack){
    if (!stageUnlocked(id)) SFX.noMp();
    else if (Net.mode==='coop') coopStart(id);
    else startStory(id);
  } else if (P.back){ SFX.move(); if (Net.mode==='coop') leaveOnline(); else mode='heroSelect'; }
  consumeInput();
}
function drawMapIcon(kind,x,y){
  if (kind==='tree'){ ctx.fillStyle='#6b4a2a'; ctx.fillRect(x-3,y,6,14); ctx.fillStyle='#3f8f45'; circle(x,y-2,12); circle(x-9,y+4,8); circle(x+9,y+4,8); }
  else if (kind==='crystal'){ ctx.fillStyle='#4fc3d9'; tri(x-12,y+12,x-6,y-14,x,y+12); ctx.fillStyle='#9ff8ff'; tri(x-4,y+12,x+3,y-20,x+10,y+12); ctx.fillStyle='#ff7bd8'; tri(x+6,y+12,x+12,y-4,x+16,y+12); }
  else if (kind==='pyramid'){ ctx.fillStyle='#e0b060'; tri(x-18,y+12,x,y-16,x+18,y+12); ctx.fillStyle='#b8873e'; tri(x,y-16,x+18,y+12,x+2,y+12); }
  else if (kind==='castle'){ ctx.fillStyle='#4a4458'; ctx.fillRect(x-14,y-6,28,18); ctx.fillRect(x-16,y-14,8,26); ctx.fillRect(x+8,y-14,8,26);
    tri(x-17,y-14,x-12,y-24,x-7,y-14); tri(x+7,y-14,x+12,y-24,x+17,y-14); ctx.fillStyle='#ffcf6b'; ctx.fillRect(x-3,y+2,6,10); }
}
function drawMap(){
  const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'#efe0b4'); g.addColorStop(1,'#d9c18a');
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='#9a7a46'; ctx.lineWidth=6; ctx.strokeRect(14,14,W-28,H-28);
  ctx.strokeStyle='rgba(154,122,70,0.4)'; ctx.lineWidth=2; ctx.strokeRect(24,24,W-48,H-48);
  ctx.globalAlpha=0.18; ctx.fillStyle='#7a5a2a';
  for (let i=0;i<9;i++){ circle(80+i*110,110+(i%3)*150,30+(i%4)*8); }
  ctx.globalAlpha=1;
  txt('MAPA DE VALLEN',W/2,52,32,'#5a3d1a','center',false);
  txt(Net.mode==='coop'?'Co-op: você escolhe a fase da dupla':'Escolha a próxima aventura',W/2,82,15,'#7a5a2a','center',false);
  // path between stages
  ctx.setLineDash([10,9]); ctx.lineWidth=4;
  for (let i=1;i<STAGE_IDS.length;i++){
    const a=MAP_NODES[STAGE_IDS[i-1]], b=MAP_NODES[STAGE_IDS[i]];
    ctx.strokeStyle=stageUnlocked(STAGE_IDS[i])?'#8a5a2a':'rgba(138,90,42,0.35)';
    ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.quadraticCurveTo((a.x+b.x)/2,Math.min(a.y,b.y)-50,b.x,b.y); ctx.stroke();
  }
  ctx.setLineDash([]);
  STAGE_IDS.forEach((id,i)=>{
    const n=MAP_NODES[id], open=stageUnlocked(id), done=Progress.cleared.includes(id), sel=i===mapSel;
    if (sel){ ctx.strokeStyle=`rgba(255,180,40,${0.5+0.4*Math.sin(clock*0.12)})`; ctx.lineWidth=5; ctx.beginPath(); ctx.arc(n.x,n.y,44,0,Math.PI*2); ctx.stroke(); }
    ctx.fillStyle=done?'#ffd23f':open?'#fff6dc':'#b9ad98'; circle(n.x,n.y,34);
    ctx.strokeStyle='#5a3d1a'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(n.x,n.y,34,0,Math.PI*2); ctx.stroke();
    if (open) drawMapIcon(n.icon,n.x,n.y);
    else { ctx.fillStyle='#6b6152'; ctx.fillRect(n.x-10,n.y-2,20,16); ctx.strokeStyle='#6b6152'; ctx.lineWidth=4; ctx.beginPath(); ctx.arc(n.x,n.y-4,7,Math.PI,0); ctx.stroke(); }
    txt(STAGES[id].name,n.x,n.y+52,14,'#5a3d1a','center',false);
    if (done) txt('✓',n.x+26,n.y-26,18,'#2e7d32','center',false);
    if (sel) drawHeroAt(selHero,n.x,n.y-38,0.7,{anim:clock});
  });
  const id=STAGE_IDS[mapSel], S=STAGES[id], open=stageUnlocked(id);
  const bossType=S.zones[S.zones.length-1].waves[0][0][0];
  const foes=[...new Set(S.zones.filter(z=>!z.boss).flatMap(z=>z.waves.flat().map(w=>w[0])))].map(t=>ENEMY_NAMES[t]||t);
  panel(W/2-300,H-126,600,92,14,'rgba(90,61,26,0.88)');
  txt(`${S.sub} · ${S.name}`,W/2,H-106,20,'#ffd23f','center',false);
  if (open){
    txt('Chefe: '+ENEMY_TYPES[bossType].name,W/2,H-80,15,'#fff6dc','center',false);
    txt('Inimigos: '+foes.join(', '),W/2,H-58,13,'#e9d8a6','center',false);
  } else txt('Vença a fase anterior para liberar',W/2,H-72,16,'#e9d8a6','center',false);
  txt(confirmHint('jogar'),W/2,H-14,13,'#5a3d1a','center',false);
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
