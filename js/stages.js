'use strict';
// ===================== Continents and stages =====================
// The campaign is a list of continents, each with its own stages. Every continent lives in its own file
// under js/stages/ and calls registerContinent(). Stages unlock in campaign order (see progress.js).
const CONTINENTS = [], STAGES = {}, STAGE_IDS = [];

// Regular enemies get tougher the further the stage is in the campaign (bosses have their own `tune`)
const autoDiff = i => ({ hp:+(1+0.2*i).toFixed(2), dmg:+(1+0.15*i).toFixed(2) });

function registerContinent(c){
  c.index=CONTINENTS.length; c.stageIds=[];
  c.stages.forEach((s,k)=>{
    s.continent=c.id; s.order=STAGE_IDS.length;
    s.sub=s.sub || `${c.name} · Fase ${k+1}`;
    s.diff=s.diff || autoDiff(s.order);
    STAGES[s.id]=s; STAGE_IDS.push(s.id); c.stageIds.push(s.id);
  });
  CONTINENTS.push(c);
}
const continentOf = stageId => CONTINENTS.find(c=>c.id===STAGES[stageId].continent);

function drawBG(){ THEMES[stage ? stage.theme : 'forest'].draw(cam.x); }
function drawPlatforms(){
  const c=THEMES[stage ? stage.theme : 'forest'].platform;
  for (const p of platforms){ const x=p.x-cam.x; if (x+p.w<-20||x>W+20) continue;
    ctx.fillStyle=c.post; ctx.fillRect(x+16,p.y+14,8,GROUND-p.y-14); ctx.fillRect(x+p.w-24,p.y+14,8,GROUND-p.y-14);
    ctx.fillStyle=c.body; ctx.beginPath(); ctx.roundRect(x,p.y,p.w,18,5); ctx.fill();
    ctx.fillStyle=c.line; for (let k=x+14;k<x+p.w-6;k+=28) ctx.fillRect(k,p.y+6,2,10);
    ctx.fillStyle=c.top; ctx.beginPath(); ctx.roundRect(x-3,p.y-3,p.w+6,8,4); ctx.fill();
    ctx.fillStyle=c.vine; for (let k=x+10;k<x+p.w;k+=37) ctx.fillRect(k,p.y+4,3,10+((k*7)%9));
  }
}
function loadStage(id){
  stage=STAGES[id]; worldW=stage.worldW; platforms=stage.platforms;
}
