'use strict';
// ===================== Story progress (saved in this browser) =====================
const PROGRESS_KEY = 'vallen.progress.v1';
const Progress = { cleared:[] };
function loadProgress(){
  try { const s=JSON.parse(localStorage.getItem(PROGRESS_KEY)||'null'); if (s) Object.assign(Progress,s); } catch (e) {}
}
function saveProgress(){ try { localStorage.setItem(PROGRESS_KEY, JSON.stringify(Progress)); } catch (e) {} }
loadProgress();

// A stage opens once the one before it has been cleared
function stageUnlocked(id){
  const i=STAGE_IDS.indexOf(id);
  return i<=0 || Progress.cleared.includes(STAGE_IDS[i-1]);
}
function markCleared(id){
  if (!Progress.cleared.includes(id)){ Progress.cleared.push(id); saveProgress(); return true; }
  return false;
}
