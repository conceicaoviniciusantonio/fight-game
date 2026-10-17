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
  for (const p of platforms){ const x=p.x-cam.x; if (x+p.w<-60||x>W+60) continue;
    if (p.float){ drawFloat(p,x); continue; }
    ctx.fillStyle=c.post; ctx.fillRect(x+16,p.y+14,8,GROUND-p.y-14); ctx.fillRect(x+p.w-24,p.y+14,8,GROUND-p.y-14);
    ctx.fillStyle=c.body; ctx.beginPath(); ctx.roundRect(x,p.y,p.w,18,5); ctx.fill();
    ctx.fillStyle=c.line; for (let k=x+14;k<x+p.w-6;k+=28) ctx.fillRect(k,p.y+6,2,10);
    ctx.fillStyle=c.top; ctx.beginPath(); ctx.roundRect(x-3,p.y-3,p.w+6,8,4); ctx.fill();
    ctx.fillStyle=c.vine; for (let k=x+10;k<x+p.w;k+=37) ctx.fillRect(k,p.y+4,3,10+((k*7)%9));
  }
}
// A carnival parade float: a decorated cart whose deck is the platform
const FLOAT_COLORS = [['#e84a8a','#ffd23f','#3ec1d3'],['#7b2cbf','#ff9f1c','#2ec4b6'],['#06d6a0','#ef476f','#ffd166']];
function drawFloat(p,x){
  const pal=FLOAT_COLORS[(p.x0|0)%3], y=p.y, h=GROUND-y-16;
  // feathers rising behind the deck
  for (let k=0;k<5;k++){ const fx=x+12+k*(p.w-24)/4, sw=Math.sin(clock*0.08+k)*4;
    ctx.fillStyle=pal[k%3]; ctx.beginPath(); ctx.ellipse(fx+sw,y-26,6,24,sw*0.05,0,Math.PI*2); ctx.fill(); }
  ctx.fillStyle=pal[0]; ctx.beginPath(); ctx.roundRect(x,y,p.w,h,8); ctx.fill();
  ctx.fillStyle=pal[1]; for (let k=x+6;k<x+p.w-6;k+=22) ctx.fillRect(k,y+6,10,h-12);
  ctx.fillStyle='rgba(255,255,255,0.85)'; for (let k=x+10;k<x+p.w;k+=26) circle(k,y+4,3);
  // a big carnival mask on the front
  const mx=x+p.w/2, my=y+h/2+2;
  ctx.fillStyle=pal[2]; ctx.beginPath(); ctx.ellipse(mx,my,30,14,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#1b1b2e'; ctx.beginPath(); ctx.ellipse(mx-12,my,7,5,0,0,Math.PI*2); ctx.ellipse(mx+12,my,7,5,0,0,Math.PI*2); ctx.fill();
  ctx.fillStyle='#ffd23f'; ctx.fillRect(x-4,y-4,p.w+8,7);
  ctx.fillStyle='#2b2b3a'; for (const wx of [x+22,x+p.w-22]){ circle(wx,GROUND-10,11); ctx.fillStyle='#9aa0ad'; circle(wx,GROUND-10,4); ctx.fillStyle='#2b2b3a'; }
}
function loadStage(id){
  stage=STAGES[id]; worldW=stage.worldW;
  // copies, so moving platforms never change the stage data
  platforms=stage.platforms.map(p=>({...p,x0:p.x}));
  hazards=(stage.hazards||[]).map((h,i)=>({...h,i,state:'idle',t:0}));
}
