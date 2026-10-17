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
    txt(Hh.title+(selMode==='pvp'?'':' · Nv '+heroProg(id).lvl),cx,y+244,14,'#ffffff','center',false);
    STAT_NAMES.forEach(([k,label],j)=>{
      const sy=y+268+j*18;
      txt(label,x+16,sy,12,'#cfe3ff','left',false);
      for (let q=0;q<5;q++){ ctx.fillStyle=q<Hh.stats[k]?'#ffd23f':'rgba(255,255,255,0.15)'; ctx.fillRect(x+cw-16-(5-q)*16,sy-5,12,10); }
    });
    txt(Hh.desc,cx,y+ch-12,11,'#cfe3ff','center',false);
  });
  txt(confirmHint('confirmar'),W/2,H-26,15,'#ffffff');
}

// ----- world map (continents) and continent map (stages) -----
// Flow: hero select → world map → continent map → stage. The shop sits on the continent map.
let worldSel=0, mapCont=0, mapSel=0, mapLastStage=0;
const ENEMY_NAMES = { goblin:'Goblin', archer:'Goblin arqueiro', orc:'Orc', bat:'Morcego', kobold:'Kobold', shaman:'Xamã',
  scorpion:'Escorpião', mummy:'Múmia', nomad:'Nômade', skeleton:'Esqueleto', darkmage:'Mago sombrio', blackknight:'Cavaleiro negro',
  foliao:'Folião', pierrot:'Pierrô', bonecao:'Bonecão', coelho:'Coelho', ovo:'Ovo rolante', galinha:'Galinha', espantalho:'Espantalho', fogueteiro:'Espantalho fogueteiro', buscape:'Busca-pé',
  saci:'Saci', fogofatuo:'Fogo-fátuo', lobisomem:'Lobisomem', duende:'Duende', soldadinho:'Soldadinho', rena:'Rena' };
// Spots for islands still to come: drawn under fog unless a registered continent already sits there
const COMING_SOON = [{x:570,y:190},{x:790,y:320},{x:420,y:390},{x:860,y:120}];
const freeSlots = () => COMING_SOON.filter(s=>CONTINENTS.every(C=>Math.hypot(C.map.x-s.x,C.map.y-s.y)>230)).slice(0,2);

const nextStageId = () => STAGE_IDS.find(id=>stageUnlocked(id) && !Progress.cleared.includes(id)) || STAGE_IDS.filter(stageUnlocked).pop();
function openMap(){ mode='world'; worldSel=continentOf(nextStageId()).index; }
function openContinent(ci,stageId){
  mode='map'; mapCont=ci;
  const C=CONTINENTS[ci], open=C.stageIds.filter(stageUnlocked);
  const want=stageId && C.stageIds.includes(stageId) ? stageId : (open.find(id=>!Progress.cleared.includes(id)) || open[open.length-1] || C.stageIds[0]);
  mapSel=mapLastStage=C.stageIds.indexOf(want);
}
// After a win: stay on the continent if it has more stages, otherwise show the world map
function openMapAfter(stageId){
  const next=STAGE_IDS[STAGE_IDS.indexOf(stageId)+1];
  if (next && continentOf(next)===continentOf(stageId)) openContinent(continentOf(stageId).index,next);
  else { mode='world'; worldSel=continentOf(next||stageId).index; }
}

function tickWorldMap(){
  const P=Input.pressed;
  worldSel=menuNav(CONTINENTS.length,worldSel,true);
  if (P.confirm || P.attack){
    if (continentUnlocked(CONTINENTS[worldSel])){ SFX.select(); openContinent(worldSel); }
    else SFX.noMp();
  } else if (P.back){ SFX.move(); if (Net.mode==='coop') leaveOnline(); else mode='heroSelect'; }
  consumeInput();
}
// A smooth irregular island outline (same seed = same shape every frame)
function islandShape(cx,cy,seed,scale=1){
  const R=mulberry(seed), n=16, pts=[];
  for (let i=0;i<n;i++){ const a=i/n*Math.PI*2, r=(1+0.22*Math.sin(a*3+seed)+R()*0.16)*scale; pts.push([cx+Math.cos(a)*120*r,cy+Math.sin(a)*72*r]); }
  ctx.beginPath();
  const mid=(p,q)=>[(p[0]+q[0])/2,(p[1]+q[1])/2];
  let m=mid(pts[n-1],pts[0]); ctx.moveTo(m[0],m[1]);
  for (let i=0;i<n;i++){ const q=mid(pts[i],pts[(i+1)%n]); ctx.quadraticCurveTo(pts[i][0],pts[i][1],q[0],q[1]); }
  ctx.closePath();
}
function drawWorldMap(){
  const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'#2a6f97'); g.addColorStop(1,'#1b4965');
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='rgba(255,255,255,0.12)'; ctx.lineWidth=2;
  for (let i=0;i<26;i++){ const x=(i*157+clock*0.3)%(W+80)-40, y=40+(i*89)%(H-80); ctx.beginPath(); ctx.arc(x,y,10,Math.PI*1.1,Math.PI*1.9); ctx.stroke(); }
  txt('MAPA-MÚNDI',W/2,46,32,'#ffffff');
  txt(Net.mode==='coop'?'Co-op: você escolhe o continente da dupla':'Escolha um continente',W/2,78,15,'#cfe3ff','center',false);
  // islands still to come
  freeSlots().forEach((s,i)=>{
    ctx.fillStyle='rgba(200,215,230,0.18)'; islandShape(s.x,s.y,40+i,0.7); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.13)'; for (let k=0;k<4;k++) circle(s.x-54+k*36,s.y-14+Math.sin(clock*0.02+k)*6,24);
    txt('Em breve',s.x,s.y+8,15,'rgba(255,255,255,0.75)','center',false);
  });
  CONTINENTS.forEach((C,i)=>{
    const {x,y}=C.map, open=continentUnlocked(C), sel=i===worldSel, cl=C.colors||{};
    const done=C.stageIds.filter(id=>Progress.cleared.includes(id)).length;
    ctx.fillStyle=open?(cl.shore||'#e9d8a6'):'#9aa5b1'; islandShape(x,y,11+i*7,1.08); ctx.fill();
    ctx.fillStyle=open?(cl.land||'#7fb069'):'#6b7480'; islandShape(x,y,11+i*7,0.95); ctx.fill();
    if (open){ ctx.fillStyle=cl.dark||'#4f7a3a'; for (let k=0;k<6;k++) circle(x-70+k*28,y-22+(k%2)*30,10); }
    if (sel){ ctx.strokeStyle=`rgba(255,210,63,${0.5+0.4*Math.sin(clock*0.12)})`; ctx.lineWidth=5; islandShape(x,y,11+i*7,1.16); ctx.stroke(); }
    if (!open){ ctx.fillStyle='#3e4651'; ctx.fillRect(x-14,y-4,28,22); ctx.strokeStyle='#3e4651'; ctx.lineWidth=5; ctx.beginPath(); ctx.arc(x,y-8,10,Math.PI,0); ctx.stroke(); }
    if (sel && open) drawHeroAt(selHero,x,y+10,0.9,{anim:clock,tier:heroProg(selHero).weapon});
    txt(C.name,x,y+98,20,'#ffffff');
    txt(`${done}/${C.stageIds.length} fases`,x,y+120,14,done===C.stageIds.length?'#9fe3a8':'#cfe3ff','center',false);
  });
  const C=CONTINENTS[worldSel], last=STAGES[C.stageIds[C.stageIds.length-1]];
  const bossType=last.zones[last.zones.length-1].waves[0][0][0];
  panel(W/2-300,H-96,600,70,14,'rgba(10,30,50,0.85)');
  txt(`${C.sub} · ${C.name}`,W/2,H-76,19,'#ffd23f','center',false);
  txt(continentUnlocked(C)?`Chefe final: ${ENEMY_TYPES[bossType].name}`:'Termine o continente anterior para liberar',W/2,H-50,14,'#e6f0ff','center',false);
  txt(confirmHint('entrar'),W/2,H-12,13,'#cfe3ff','center',false);
}

function tickMap(){
  const P=Input.pressed, C=CONTINENTS[mapCont], ids=C.stageIds, shopSelected=mapSel===ids.length;
  if (!shopSelected){ mapSel=menuNav(ids.length,mapSel,true); mapLastStage=mapSel; }
  if (P.down && !shopSelected){ mapSel=ids.length; SFX.move(); }
  else if (P.up && shopSelected){ mapSel=mapLastStage; SFX.move(); }
  const id=ids[mapSel];
  if ((P.confirm || P.attack) && shopSelected){ SFX.select(); openShop(); }
  else if (P.confirm || P.attack){
    if (!stageUnlocked(id)) SFX.noMp();
    else if (Net.mode==='coop') coopStart(id);
    else startStory(id);
  } else if (P.back){ SFX.move(); mode='world'; worldSel=mapCont; }
  consumeInput();
}
function drawMapIcon(kind,x,y){
  if (kind==='tree'){ ctx.fillStyle='#6b4a2a'; ctx.fillRect(x-3,y,6,14); ctx.fillStyle='#3f8f45'; circle(x,y-2,12); circle(x-9,y+4,8); circle(x+9,y+4,8); }
  else if (kind==='crystal'){ ctx.fillStyle='#4fc3d9'; tri(x-12,y+12,x-6,y-14,x,y+12); ctx.fillStyle='#9ff8ff'; tri(x-4,y+12,x+3,y-20,x+10,y+12); ctx.fillStyle='#ff7bd8'; tri(x+6,y+12,x+12,y-4,x+16,y+12); }
  else if (kind==='pyramid'){ ctx.fillStyle='#e0b060'; tri(x-18,y+12,x,y-16,x+18,y+12); ctx.fillStyle='#b8873e'; tri(x,y-16,x+18,y+12,x+2,y+12); }
  else if (kind==='mask'){ ctx.fillStyle='#e84a8a'; ctx.beginPath(); ctx.ellipse(x,y,18,10,0,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#1b1b2e'; circle(x-7,y,3.5); circle(x+7,y,3.5);
    ctx.fillStyle='#ffd23f'; ctx.beginPath(); ctx.ellipse(x-8,y-14,3,9,-0.4,0,Math.PI*2); ctx.ellipse(x+8,y-14,3,9,0.4,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#3ec1d3'; ctx.beginPath(); ctx.ellipse(x,y-16,3,10,0,0,Math.PI*2); ctx.fill(); }
  else if (kind==='egg'){ ctx.fillStyle='#ffd6e0'; ctx.beginPath(); ctx.ellipse(x,y,13,17,0,0,Math.PI*2); ctx.fill();
    ctx.strokeStyle='#7bd389'; ctx.lineWidth=3; ctx.beginPath(); ctx.moveTo(x-13,y-2); for (let k=-13;k<=13;k+=6.5) ctx.lineTo(x+k,y-2+((k+13)/6.5%2?4:-4)); ctx.stroke();
    ctx.fillStyle='#bde0fe'; ctx.fillRect(x-11,y+6,22,4); }
  else if (kind==='bonfire'){ ctx.fillStyle='#5d3a1a'; ctx.save(); ctx.translate(x,y+10); ctx.rotate(0.4); ctx.fillRect(-14,-3,28,6); ctx.rotate(-0.8); ctx.fillRect(-14,-3,28,6); ctx.restore();
    ctx.fillStyle='#ff5a1f'; ctx.beginPath(); ctx.ellipse(x,y-2,10,16,0,0,Math.PI*2); ctx.fill(); ctx.fillStyle='#ffd36b'; ctx.beginPath(); ctx.ellipse(x,y+2,5,9,0,0,Math.PI*2); ctx.fill(); }
  else if (kind==='saci'){ ctx.fillStyle='#d62828'; ctx.beginPath(); ctx.moveTo(x-12,y+8); ctx.quadraticCurveTo(x+2,y-12,x-10,y-22); ctx.quadraticCurveTo(x+12,y-6,x+14,y+8); ctx.closePath(); ctx.fill();
    ctx.fillStyle='#8fbf6a'; for (let k=0;k<6;k++){ const a=k*1.1; ctx.fillRect(x+Math.cos(a)*(6+k*2)-2,y+12-k*2,4,2.5); } }
  else if (kind==='gift'){ ctx.fillStyle='#e63946'; ctx.fillRect(x-14,y-10,28,24); ctx.fillStyle='#ffd23f'; ctx.fillRect(x-3,y-10,6,24); ctx.fillRect(x-14,y-1,28,6);
    ctx.beginPath(); ctx.ellipse(x-6,y-14,7,4,0.5,0,Math.PI*2); ctx.ellipse(x+6,y-14,7,4,-0.5,0,Math.PI*2); ctx.fill(); }
  else if (kind==='castle'){ ctx.fillStyle='#4a4458'; ctx.fillRect(x-14,y-6,28,18); ctx.fillRect(x-16,y-14,8,26); ctx.fillRect(x+8,y-14,8,26);
    tri(x-17,y-14,x-12,y-24,x-7,y-14); tri(x+7,y-14,x+12,y-24,x+17,y-14); ctx.fillStyle='#ffcf6b'; ctx.fillRect(x-3,y+2,6,10); }
}
function drawMap(){
  const C=CONTINENTS[mapCont], ids=C.stageIds;
  const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'#efe0b4'); g.addColorStop(1,'#d9c18a');
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  ctx.strokeStyle='#9a7a46'; ctx.lineWidth=6; ctx.strokeRect(14,14,W-28,H-28);
  ctx.strokeStyle='rgba(154,122,70,0.4)'; ctx.lineWidth=2; ctx.strokeRect(24,24,W-48,H-48);
  ctx.globalAlpha=0.18; ctx.fillStyle='#7a5a2a';
  for (let i=0;i<9;i++){ circle(80+i*110,110+(i%3)*150,30+(i%4)*8); }
  ctx.globalAlpha=1;
  txt(C.name.toUpperCase(),W/2,52,32,'#5a3d1a','center',false);
  txt(Net.mode==='coop'?'Co-op: você escolhe a fase da dupla':`${C.sub} · escolha a próxima aventura`,W/2,82,15,'#7a5a2a','center',false);
  txt('ESC mapa-múndi',44,52,13,'#7a5a2a','left',false);
  ctx.setLineDash([10,9]); ctx.lineWidth=4;
  for (let i=1;i<ids.length;i++){
    const a=STAGES[ids[i-1]].map, b=STAGES[ids[i]].map;
    ctx.strokeStyle=stageUnlocked(ids[i])?'#8a5a2a':'rgba(138,90,42,0.35)';
    ctx.beginPath(); ctx.moveTo(a.x,a.y); ctx.quadraticCurveTo((a.x+b.x)/2,Math.min(a.y,b.y)-50,b.x,b.y); ctx.stroke();
  }
  ctx.setLineDash([]);
  const shopSel=mapSel===ids.length;
  ids.forEach((id,i)=>{
    const n=STAGES[id].map, open=stageUnlocked(id), done=Progress.cleared.includes(id), sel=i===mapSel;
    if (sel){ ctx.strokeStyle=`rgba(255,180,40,${0.5+0.4*Math.sin(clock*0.12)})`; ctx.lineWidth=5; ctx.beginPath(); ctx.arc(n.x,n.y,44,0,Math.PI*2); ctx.stroke(); }
    ctx.fillStyle=done?'#ffd23f':open?'#fff6dc':'#b9ad98'; circle(n.x,n.y,34);
    ctx.strokeStyle='#5a3d1a'; ctx.lineWidth=3; ctx.beginPath(); ctx.arc(n.x,n.y,34,0,Math.PI*2); ctx.stroke();
    if (open) drawMapIcon(n.icon,n.x,n.y);
    else { ctx.fillStyle='#6b6152'; ctx.fillRect(n.x-10,n.y-2,20,16); ctx.strokeStyle='#6b6152'; ctx.lineWidth=4; ctx.beginPath(); ctx.arc(n.x,n.y-4,7,Math.PI,0); ctx.stroke(); }
    txt(STAGES[id].name,n.x,n.y+52,14,'#5a3d1a','center',false);
    if (done) txt('✓',n.x+26,n.y-26,18,'#2e7d32','center',false);
    if (sel || (shopSel && i===mapLastStage)) drawHeroAt(selHero,n.x,n.y-38,0.7,{anim:clock,tier:heroProg(selHero).weapon});
  });
  // shop button and purse
  panel(W-168,H-176,130,40,20,shopSel?'#ffd23f':'rgba(90,61,26,0.85)');
  coinIcon(W-140,H-156,9); txt('LOJA',W-92,H-156,18,shopSel?'#1b1b2e':'#fff6dc','center',false);
  txt('↓ loja',W-103,H-126,12,'#7a5a2a','center',false);
  coinIcon(W-150,52,10); txt(String(Progress.gold),W-130,52,20,'#5a3d1a','left',false);
  const id=ids[shopSel?mapLastStage:mapSel], S=STAGES[id], open=stageUnlocked(id);
  const bossType=S.zones[S.zones.length-1].waves[0][0][0];
  const foes=[...new Set(S.zones.filter(z=>!z.boss).flatMap(z=>z.waves.flat().map(w=>w[0])))].map(t=>ENEMY_NAMES[t]||t);
  panel(W/2-300,H-126,600,92,14,'rgba(90,61,26,0.88)');
  txt(`Fase ${ids.indexOf(id)+1} · ${S.name}`,W/2,H-106,20,'#ffd23f','center',false);
  if (open){
    txt('Chefe: '+ENEMY_TYPES[bossType].name,W/2,H-80,15,'#fff6dc','center',false);
    txt('Inimigos: '+foes.join(', '),W/2,H-58,13,'#e9d8a6','center',false);
  } else txt('Vença a fase anterior para liberar',W/2,H-72,16,'#e9d8a6','center',false);
  txt(confirmHint('jogar'),W/2,H-14,13,'#5a3d1a','center',false);
}

// ----- blacksmith shop -----
let shopSel=0, shopMsg=null;
function openShop(){ mode='shop'; shopSel=0; shopMsg=null; }
function tickShop(){
  const P=Input.pressed;
  shopSel=menuNav(3,shopSel);
  if (P.left || P.right){ const i=HERO_IDS.indexOf(selHero); selHero=HERO_IDS[(i+(P.left?-1:1)+HERO_IDS.length)%HERO_IDS.length]; SFX.move(); }
  if (P.confirm || P.attack){
    if (shopSel===2){ SFX.move(); mode='map'; }
    else {
      const r=buyGear(selHero,shopSel===0?'weapon':'armor');
      if (r==='ok'){ SFX.levelUp(); shopMsg={s:'Comprado!',c:'#9fe3a8',t:90}; }
      else if (r==='poor'){ SFX.noMp(); shopMsg={s:'Ouro insuficiente',c:'#ff8a8a',t:90}; }
      else if (r==='locked'){ SFX.noMp(); shopMsg={s:'Chegue ao próximo continente para liberar',c:'#ffd23f',t:90}; }
      else { SFX.noMp(); shopMsg={s:'Já é o melhor equipamento',c:'#cfe3ff',t:90}; }
    }
  } else if (P.back){ SFX.move(); mode='map'; }
  if (shopMsg && --shopMsg.t<=0) shopMsg=null;
  consumeInput();
}
function drawShop(){
  const g=ctx.createLinearGradient(0,0,0,H); g.addColorStop(0,'#3a2616'); g.addColorStop(1,'#1e130b');
  ctx.fillStyle=g; ctx.fillRect(0,0,W,H);
  ctx.fillStyle='rgba(255,160,60,0.10)'; circle(140,420,220);
  txt('FERREIRO DE VALLEN',W/2,44,32,'#ffd23f');
  coinIcon(W-150,44,11); txt(String(Progress.gold),W-130,44,22,'#ffd23f','left');
  const Hh=HEROES[selHero], gp=heroProg(selHero), st=heroStats(selHero);
  // hero card
  panel(30,80,300,390,16,'rgba(0,0,0,0.35)');
  ctx.fillStyle='rgba(0,0,0,0.3)'; ctx.beginPath(); ctx.ellipse(180,300,40,8,0,0,Math.PI*2); ctx.fill();
  drawHeroAt(selHero,180,298,2,{anim:clock,tier:gp.weapon});
  txt('◀  '+Hh.name+'  ▶',180,330,22,'#ffd23f');
  txt(Hh.title+' · Nível '+gp.lvl,180,354,14,'#ffffff','center',false);
  const f=gp.lvl>=MAX_LEVEL?1:gp.xp/xpNeed(gp.lvl);
  ctx.fillStyle='rgba(255,255,255,0.15)'; ctx.fillRect(70,368,220,6); ctx.fillStyle='#ffd23f'; ctx.fillRect(70,368,220*f,6);
  txt(gp.lvl>=MAX_LEVEL?'nível máximo':`${gp.xp} / ${xpNeed(gp.lvl)} XP`,180,384,11,'#e9d8a6','center',false);
  [['Vida',String(st.maxHp)],['Ataque',Math.round(st.atkMul*100)+'%'],['Defesa',Math.round(st.def*100)+'%']].forEach(([k,v],i)=>{
    txt(k,70,412+i*20,14,'#cfe3ff','left',false); txt(v,290,412+i*20,14,'#ffffff','right',false);
  });
  // gear rows
  const rows=[
    {label:'ARMA', cur:WEAPON_NAMES[selHero][gp.weapon], tiers:WEAPON_TIERS, lvl:gp.weapon, names:WEAPON_NAMES[selHero], bonus:t=>`+${Math.round(t.atk*100)}% ataque`},
    {label:'ARMADURA', cur:ARMOR_NAMES[gp.armor], tiers:ARMOR_TIERS, lvl:gp.armor, names:ARMOR_NAMES, bonus:t=>`+${Math.round(t.hp*100)}% vida · ${Math.round(t.def*100)}% defesa`},
  ];
  rows.forEach((r,i)=>{
    const y=96+i*130, sel=shopSel===i, next=r.tiers[r.lvl+1];
    panel(360,y,570,112,14,sel?'rgba(255,210,63,0.16)':'rgba(0,0,0,0.35)');
    if (sel){ ctx.strokeStyle='#ffd23f'; ctx.lineWidth=2; ctx.beginPath(); ctx.roundRect(360,y,570,112,14); ctx.stroke(); }
    txt(r.label,384,y+22,14,'#e9d8a6','left',false);
    txt(r.cur,384,y+50,22,'#ffffff','left',false);
    txt(r.lvl>0?r.bonus(r.tiers[r.lvl]):'equipamento inicial',384,y+78,13,'#cfe3ff','left',false);
    for (let k=1;k<r.tiers.length;k++){ ctx.fillStyle=k<=r.lvl?'#ffd23f':'rgba(255,255,255,0.18)'; ctx.fillRect(384+(k-1)*22,y+92,16,6); }
    if (next){
      txt('PRÓXIMO: '+r.names[r.lvl+1],906,y+38,15,'#ffd23f','right',false);
      txt(r.bonus(next),906,y+60,13,'#cfe3ff','right',false);
      if (next.cont && !continentUnlocked(CONTINENTS[next.cont])) txt('🔒 libera em '+CONTINENTS[next.cont].name,906,y+86,13,'#ffd23f','right',false);
      else { coinIcon(840,y+86,8); txt(String(next.cost),906,y+86,16,Progress.gold>=next.cost?'#ffd23f':'#ff8a8a','right',false); }
    } else txt('MÁXIMO',906,y+56,18,'#9fe3a8','right',false);
  });
  const backSel=shopSel===2;
  panel(560,372,170,44,22,backSel?'#ffd23f':'rgba(0,0,0,0.4)');
  txt('VOLTAR',645,394,18,backSel?'#1b1b2e':'#e6ebf5','center',false);
  if (shopMsg) txt(shopMsg.s,645,440,18,shopMsg.c);
  txt('Ganhe ouro derrotando inimigos e vencendo fases · ← → trocar herói',W/2,H-24,13,'#e9d8a6','center',false);
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
    {label:'Apagar progresso', val:()=>resetArm?'Confirme: aperte de novo':'Níveis, ouro e fases', go:()=>{
      if (!resetArm){ resetArm=true; return; }
      resetArm=false; resetProgress(); bigTextMenu='Progresso apagado'; }},
    {label:'Voltar', go:closeOptions},
  ];
}
let resetArm=false, bigTextMenu=null;
function openOptions(from){ optionsFrom=from; mode='options'; optSel=0; resetArm=false; bigTextMenu=null; }
function closeOptions(){ saveSettings(); mode = optionsFrom==='pause' ? 'play' : 'title'; }
function tickOptions(){
  const items=optionItems(), P=Input.pressed;
  optSel=menuNav(items.length,optSel);
  const it=items[optSel], d = P.left?-1 : P.right?1 : 0;
  if (it.vol && d){ Settings[it.vol]=clamp(Settings[it.vol]+d,0,10); applyVolumes(); if (it.vol==='sfx') SFX.hit(false); }
  else if (it.adj && (d || P.confirm || P.attack)){ it.adj(d||1); SFX.move(); }
  else if (it.go && (P.confirm || P.attack)){ SFX.select(); it.go(); }
  if (P.up || P.down) resetArm=false;
  if (P.back){ SFX.move(); closeOptions(); }
  consumeInput();
}
function drawOptions(){
  ctx.fillStyle='rgba(8,10,30,0.78)'; ctx.fillRect(0,0,W,H);
  txt('OPÇÕES',W/2,60,38,'#ffd23f');
  optionItems().forEach((it,i)=>{
    const y=118+i*54, sel=i===optSel;
    panel(W/2-260,y-22,520,44,12,sel?'rgba(255,210,63,0.18)':'rgba(0,0,0,0.45)');
    if (sel){ ctx.strokeStyle='#ffd23f'; ctx.lineWidth=2; ctx.stroke(); }
    txt(it.label,W/2-236,y,18,sel?'#ffd23f':'#e6ebf5','left',false);
    if (it.vol){
      for (let q=0;q<10;q++){ ctx.fillStyle=q<Settings[it.vol]?'#ffd23f':'rgba(255,255,255,0.15)'; ctx.fillRect(W/2+20+q*20,y-8,14,16); }
      if (sel) txt('◀ ▶',W/2+236,y,14,'#ffd23f','right',false);
    } else if (it.val){ txt((sel?'◀ ':'')+it.val()+(sel?' ▶':''),W/2+236,y,17,'#ffffff','right',false); }
    else if (it.go && sel) txt('▶',W/2+236,y,17,'#ffd23f','right',false);
  });
  if (bigTextMenu) txt(bigTextMenu,W/2,H-58,18,'#9fe3a8');
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
