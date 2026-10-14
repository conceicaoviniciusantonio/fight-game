'use strict';
// ===================== Canvas, constants and small helpers =====================
const cv = document.getElementById('game'), ctx = cv.getContext('2d');
const W = 960, H = 540, GROUND = 462, G = 0.6, MAXMP = 300;
const FONT = '"Trebuchet MS","Segoe UI",system-ui,sans-serif';

const rand = (a, b) => a + Math.random() * (b - a);
const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
const pick = arr => arr[Math.random() * arr.length | 0];

function mulberry(a){ return () => { a|=0; a=a+0x6D2B79F5|0; let t=Math.imul(a^a>>>15,1|a); t=t+Math.imul(t^t>>>7,61|t)^t; return ((t^t>>>14)>>>0)/4294967296; }; }
function mix(a,b,t){
  const pa=parseInt(a.slice(1),16), pb=parseInt(b.slice(1),16);
  const r=((pa>>16)&255)*(1-t)+((pb>>16)&255)*t, g=((pa>>8)&255)*(1-t)+((pb>>8)&255)*t, bl=(pa&255)*(1-t)+(pb&255)*t;
  return `rgb(${r|0},${g|0},${bl|0})`;
}

// ----- drawing primitives -----
function circle(x,y,r){ ctx.beginPath(); ctx.arc(x,y,r,0,Math.PI*2); ctx.fill(); }
function tri(a,b,c,d,e,f){ ctx.beginPath(); ctx.moveTo(a,b); ctx.lineTo(c,d); ctx.lineTo(e,f); ctx.closePath(); ctx.fill(); }
function shadow(x,s,rx){ ctx.fillStyle='rgba(0,0,0,0.25)'; ctx.beginPath(); ctx.ellipse(x,s,rx,rx*0.25,0,0,Math.PI*2); ctx.fill(); }
function panel(x,y,w,h,r=14,fill='rgba(12,14,34,0.72)'){ ctx.fillStyle=fill; ctx.beginPath(); ctx.roundRect(x,y,w,h,r); ctx.fill(); }
function txt(s,x,y,size,color,align='center',stroke=true){
  ctx.font=`bold ${size}px ${FONT}`; ctx.textAlign=align; ctx.textBaseline='middle';
  if (stroke){ ctx.lineWidth=Math.max(3,size/6); ctx.strokeStyle='rgba(0,0,0,0.85)'; ctx.lineJoin='round'; ctx.strokeText(s,x,y); }
  ctx.fillStyle=color; ctx.fillText(s,x,y);
}
function bar(x,y,w,h,f,c1,c2){
  ctx.fillStyle='rgba(0,0,0,0.6)'; ctx.beginPath(); ctx.roundRect(x-2,y-2,w+4,h+4,5); ctx.fill();
  if (f>0){
    const g=ctx.createLinearGradient(0,y,0,y+h); g.addColorStop(0,c1); g.addColorStop(1,c2);
    ctx.fillStyle=g; ctx.beginPath(); ctx.roundRect(x,y,Math.max(4,w*f),h,4); ctx.fill();
    ctx.fillStyle='rgba(255,255,255,0.25)'; ctx.fillRect(x+2,y+2,Math.max(0,w*f-4),h*0.3);
  }
}
function mpBars(x,y,segW,h,mp,gap=6){
  for (let i=0;i<3;i++){
    const f=clamp((mp-i*100)/100,0,1);
    bar(x+i*(segW+gap),y,segW,h,f,f>=1?'#8fe6ff':'#4e9ad6',f>=1?'#2f8fe0':'#24507e');
  }
}
