'use strict';
// ===================== Progress: stages, levels, gold and gear (saved in this browser) =====================
const PROGRESS_KEY = 'vallen.progress.v1';
const MAX_LEVEL = 20;
const Progress = { cleared:[], gold:0, heroes:{} };
function loadProgress(){
  try { const s=JSON.parse(localStorage.getItem(PROGRESS_KEY)||'null'); if (s) Object.assign(Progress,s); } catch (e) {}
  Progress.heroes=Progress.heroes||{}; Progress.gold=Progress.gold||0; Progress.cleared=Progress.cleared||[];
}
function saveProgress(){ try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(Progress)); } catch (e) {} }
function resetProgress(){ Progress.cleared=[]; Progress.gold=0; Progress.heroes={}; saveProgress(); }
loadProgress();

// ----- stages -----
// A stage opens once the one before it has been cleared
function stageUnlocked(id){
  const i=STAGE_IDS.indexOf(id);
  return i<=0 || Progress.cleared.includes(STAGE_IDS[i-1]);
}
function markCleared(id){
  if (!Progress.cleared.includes(id)){ Progress.cleared.push(id); saveProgress(); return true; }
  return false;
}

// ----- gear -----
// Tier 0 is what every hero starts with; each tier adds attack (weapon) or life and defense (armor).
const WEAPON_TIERS = [ {atk:0,cost:0,tint:null}, {atk:0.10,cost:300,tint:'#e3eaf2'}, {atk:0.22,cost:900,tint:'#9ff8ff'}, {atk:0.36,cost:2000,tint:'#ffd34d'} ];
const ARMOR_TIERS  = [ {hp:0,def:0,cost:0}, {hp:0.15,def:0.05,cost:300}, {hp:0.30,def:0.10,cost:900}, {hp:0.50,def:0.15,cost:2000} ];
const WEAPON_NAMES = {
  knight:['Espada de Ferro','Espada de Aço','Lâmina Rúnica','Lâmina Celeste'],
  archer:['Arco Curto','Arco Longo','Arco Élfico','Arco Estelar'],
  mage:  ['Cajado de Carvalho','Cajado Arcano','Cajado de Cristal','Cajado Astral'],
  lancer:['Lança de Ferro','Lança de Aço','Lança Dracônica','Lança do Sol'],
};
const ARMOR_NAMES = ['Roupa de Viagem','Armadura de Couro','Cota de Malha','Armadura Real'];

function heroProg(id){
  if (!Progress.heroes[id]) Progress.heroes[id]={lvl:1,xp:0,weapon:0,armor:0};
  return Progress.heroes[id];
}
const xpNeed = lvl => 100 + (lvl-1)*80;
// Final stats for a hero from its level and gear (PvP uses base stats instead)
function heroStats(id,base){
  const Hh=HEROES[id];
  if (base) return {maxHp:Hh.hp, atkMul:1, def:0, lvl:1, tier:0};
  const g=heroProg(id), w=WEAPON_TIERS[g.weapon], a=ARMOR_TIERS[g.armor];
  return {
    maxHp:Math.round(Hh.hp*(1+0.05*(g.lvl-1))*(1+a.hp)),
    atkMul:(1+0.04*(g.lvl-1))*(1+w.atk),
    def:a.def, lvl:g.lvl, tier:g.weapon,
  };
}
function applyStats(p){
  const s=heroStats(p.hero,p.base);
  const ratio=p.maxHp ? p.hp/p.maxHp : 1;
  p.maxHp=s.maxHp; p.hp=Math.round(s.maxHp*ratio); p.atkMul=s.atkMul; p.def=s.def; p.lvl=s.lvl; p.tier=s.tier;
}
function buyGear(id,slot){
  const g=heroProg(id), tiers=slot==='weapon'?WEAPON_TIERS:ARMOR_TIERS, next=tiers[g[slot]+1];
  if (!next) return 'max';
  if (Progress.gold<next.cost) return 'poor';
  Progress.gold-=next.cost; g[slot]++; saveProgress();
  return 'ok';
}

// ----- rewards (only the browser that owns the hero calls these) -----
const run = { xp:0, gold:0 }; // gained during the current stage, shown on the result screen
function gainXp(p,xp){
  if (!p || !p.local || p.base) return;
  const g=heroProg(p.hero);
  run.xp+=xp;
  if (g.lvl>=MAX_LEVEL) return;
  g.xp+=xp;
  while (g.lvl<MAX_LEVEL && g.xp>=xpNeed(g.lvl)){
    g.xp-=xpNeed(g.lvl); g.lvl++;
    applyStats(p); p.hp=Math.min(p.maxHp,p.hp+Math.round(p.maxHp*0.3));
    bigText(p.x,p.y-p.h-20,'NÍVEL '+g.lvl+'!','#ffd23f'); ring(p.x,p.y-40,'#ffd23f',7,24,6,12); burst(p.x,p.y-40,'#ffe08a',20,5,0);
    SFX.levelUp();
  }
  if (g.lvl>=MAX_LEVEL) g.xp=0;
  saveProgress();
}
function addGold(p,n){
  if (!p || !p.local) return;
  Progress.gold+=n; run.gold+=n;
  addText(p.x,p.y-p.h-18,'+'+n+' ouro','#ffd23f');
}
