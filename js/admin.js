'use strict';
// ===================== Admin / test mode =====================
// Open the game with ?admin in the address (e.g. index.html?admin) to test freely:
// every stage is unlocked (without touching the saved progress) and these keys work during a stage:
//   B  jump to the boss        K  defeat every enemy on screen   I  invincible on/off
//   N  fill MP                  L  +1 level                       O  +5000 gold
const ADMIN = new URLSearchParams(location.search).has('admin');
let adminGod = false;

if (ADMIN){
  stageUnlocked = () => true; // only in memory: the saved progress stays as it was

  addEventListener('keydown', e => {
    if (mode!=='play' || !me || paused || e.target.tagName==='INPUT') return;
    const host = Net.mode!=='coop' || Net.host;   // the co-op guest doesn't own the world
    switch (e.code){
      case 'KeyB': {
        if (!host) return;
        const bz=stage.zones.length-1;
        for (const o of enemies) o.dead=true;
        enemies=[]; locked=false; zi=bz; me.x=stage.zones[bz].at+20; me.y=GROUND; me.vy=0;
        bigText(me.x,me.y-120,'ADMIN: chefe','#ff8a8a'); break;
      }
      case 'KeyK': if (host) for (const o of enemies) if (o.hp>0) killEnemy(o,1); break;
      case 'KeyI': adminGod=!adminGod; bigText(me.x,me.y-120,adminGod?'Invencível':'Normal','#9fe3a8'); break;
      case 'KeyN': me.mp=MAXMP; break;
      case 'KeyL': gainXp(me,xpNeed(me.lvl)); break;
      case 'KeyO': addGold(me,5000); saveProgress(); break;
    }
  });
}
// Called every game tick (see tickPlay)
function adminTick(){ if (ADMIN && adminGod && me){ me.inv=Math.max(me.inv,2); if (me.hp<me.maxHp) me.hp=me.maxHp; } }
function drawAdminBadge(){
  if (!ADMIN) return;
  const line = mode==='play' ? `ADMIN · B chefe · K matar · I invencível${adminGod?' (ON)':''} · N MP · L nível · O ouro` : 'ADMIN · todas as fases liberadas';
  ctx.font=`bold 12px ${FONT}`; const w=ctx.measureText(line).width+20;
  panel(W/2-w/2,4,w,20,8,'rgba(150,20,40,0.8)'); txt(line,W/2,14,12,'#ffffff','center',false);
}
