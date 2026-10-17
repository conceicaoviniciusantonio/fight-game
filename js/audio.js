'use strict';
// ===================== Audio =====================
const A = { ctx:null, master:null, music:null, sfx:null, noise:null, muted:false, duck:false };
function initAudio(){
  if (A.ctx){ if (A.ctx.state==='suspended') A.ctx.resume(); return; }
  try {
    const c = A.ctx = new (window.AudioContext || window.webkitAudioContext)();
    A.master = c.createGain(); A.master.connect(c.destination);
    A.music = c.createGain(); A.music.connect(A.master);
    A.sfx = c.createGain(); A.sfx.connect(A.master);
    const buf = c.createBuffer(1, c.sampleRate, c.sampleRate), d = buf.getChannelData(0);
    for (let i=0;i<d.length;i++) d[i] = Math.random()*2-1;
    A.noise = buf;
    applyVolumes(true);
  } catch (e) { A.ctx = null; }
}
// Applies Settings volumes, mute and the pause "duck" to the mixer
function applyVolumes(instant){
  if (!A.ctx) return;
  const t=A.ctx.currentTime, k=instant?0.001:0.04;
  A.master.gain.setTargetAtTime(A.muted?0:0.8, t, k);
  A.music.gain.setTargetAtTime(Settings.music/10*0.6*(A.duck?0.3:1), t, k);
  A.sfx.gain.setTargetAtTime(Settings.sfx/10, t, k);
}
addEventListener('keydown', initAudio);
addEventListener('pointerdown', initAudio);
function toggleMute(){ A.muted=!A.muted; applyVolumes(); }
function setDuck(on){ A.duck=on; applyVolumes(); }

function tone(f, d=0.08, type='square', vol=0.05, slide=0, t0=0, dest){
  if (!A.ctx) return;
  const c=A.ctx, o=c.createOscillator(), g=c.createGain(), t=c.currentTime+t0;
  o.type=type; o.frequency.setValueAtTime(f,t);
  if (slide) o.frequency.exponentialRampToValueAtTime(Math.max(30,f*slide), t+d);
  g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(vol,t+0.004);
  g.gain.exponentialRampToValueAtTime(0.0001,t+d);
  o.connect(g).connect(dest||A.sfx); o.start(t); o.stop(t+d+0.02);
}
function noise(d=0.1, vol=0.1, ftype='lowpass', freq=2000, t0=0, freqEnd=0, dest){
  if (!A.ctx) return;
  const c=A.ctx, s=c.createBufferSource(), f=c.createBiquadFilter(), g=c.createGain(), t=c.currentTime+t0;
  s.buffer=A.noise; f.type=ftype; f.frequency.setValueAtTime(freq,t);
  if (freqEnd) f.frequency.exponentialRampToValueAtTime(freqEnd,t+d);
  g.gain.setValueAtTime(vol,t); g.gain.exponentialRampToValueAtTime(0.0001,t+d);
  s.connect(f).connect(g).connect(dest||A.sfx); s.start(t,Math.random()*0.5); s.stop(t+d+0.02);
}
const SFX = {
  swing:(heavy)=>{ noise(heavy?0.14:0.09,heavy?0.16:0.11,'bandpass',heavy?900:2600,0,heavy?300:6000); tone(heavy?260:640,0.07,'triangle',0.025,0.5); },
  hit:(crit)=>{ noise(0.09,0.28,'lowpass',3200,0,400); tone(crit?110:160,0.11,'square',0.07,0.4); if (crit){ tone(1400,0.12,'square',0.035,1.5); tone(2100,0.14,'triangle',0.03,1,0.03); } },
  hurt:()=>{ tone(320,0.22,'sawtooth',0.07,0.3); noise(0.12,0.18,'lowpass',1400); },
  jump:()=>tone(330,0.13,'square',0.03,2.2),
  djump:()=>{ tone(520,0.12,'square',0.03,2.2); tone(780,0.1,'triangle',0.02,1.5,0.04); },
  dash:()=>noise(0.2,0.14,'bandpass',600,0,3500),
  charge:()=>tone(220,0.25,'square',0.035,3),
  wave:()=>{ tone(900,0.35,'sawtooth',0.035,0.25); noise(0.3,0.12,'highpass',3000,0,600); },
  gigaCharge:()=>{ tone(150,0.65,'sawtooth',0.04,6); tone(300,0.65,'square',0.025,6); },
  boom:()=>{ noise(0.9,0.5,'lowpass',1800,0,60); tone(95,0.7,'sine',0.35,0.3); },
  slam:()=>{ noise(0.5,0.4,'lowpass',900,0,60); tone(70,0.45,'sine',0.35,0.4); },
  thud:()=>{ noise(0.25,0.3,'lowpass',500,0,60); tone(60,0.3,'sine',0.3,0.5); },
  shoot:()=>{ noise(0.1,0.08,'highpass',3500,0,1200); tone(700,0.06,'triangle',0.03,0.5); },
  bow:()=>{ tone(180,0.09,'triangle',0.06,0.6); noise(0.12,0.1,'bandpass',2500,0,700); },
  deflect:()=>{ tone(1800,0.08,'square',0.035,1.2); tone(2700,0.12,'triangle',0.03,1,0.02); },
  strike:()=>noise(0.07,0.1,'bandpass',1400,0,500),
  die:()=>{ tone(420,0.28,'square',0.035,0.3); noise(0.2,0.08,'lowpass',1500); },
  roar:()=>{ tone(85,1,'sawtooth',0.1,0.6); tone(128,1,'sawtooth',0.05,0.55); noise(0.9,0.22,'lowpass',700); },
  pickup:()=>{ tone(880,0.08,'square',0.035); tone(1320,0.14,'square',0.035,1,0.07); tone(1760,0.18,'triangle',0.03,1,0.14); },
  noMp:()=>tone(150,0.12,'square',0.04,0.8),
  select:()=>{ tone(660,0.07,'square',0.035); tone(990,0.12,'square',0.035,1,0.07); },
  move:()=>tone(520,0.05,'square',0.025),
  go:()=>{ tone(784,0.1,'square',0.03); tone(1046,0.18,'square',0.03,1,0.1); },
  roll:()=>{ noise(0.16,0.1,'bandpass',900,0,2400); tone(260,0.1,'triangle',0.025,1.6); },
  block:()=>{ tone(900,0.06,'square',0.04,0.7); noise(0.08,0.14,'highpass',2500,0,900); },
  parry:()=>{ tone(1320,0.1,'square',0.045); tone(1980,0.22,'triangle',0.04,1,0.05); tone(2640,0.25,'sine',0.03,1,0.1); },
  guardBreak:()=>{ tone(400,0.3,'sawtooth',0.06,0.3); noise(0.25,0.2,'lowpass',1600,0,200); },
  coin:()=>{ tone(1568,0.06,'square',0.03); tone(2093,0.12,'square',0.03,1,0.05); },
  levelUp:()=>{ [523,659,784,1046].forEach((f,i)=>tone(f,0.16,'square',0.04,1,i*0.08)); },
  zap:()=>{ tone(880,0.1,'sine',0.04,0.5); tone(1320,0.08,'triangle',0.02,0.6); },
  blink:()=>{ tone(500,0.12,'sine',0.04,3); noise(0.1,0.06,'highpass',4000); },
  blast:()=>{ noise(0.3,0.25,'bandpass',900,0,200); tone(160,0.3,'sawtooth',0.05,0.4); },
  freeze:()=>{ tone(1600,0.4,'sine',0.03,0.5); noise(0.5,0.08,'highpass',5000,0,2000); },
  ult:()=>{ tone(220,0.9,'sawtooth',0.05,4); tone(330,0.9,'square',0.03,4); noise(0.8,0.1,'highpass',2000,0,8000); },
};

// ---------- Music: tiny chiptune sequencer (1 token = 1 eighth note, '-' holds, '.' rests) ----------
const NOTE_IDX = {C:0,'C#':1,Db:1,D:2,'D#':3,Eb:3,E:4,F:5,'F#':6,Gb:6,G:7,'G#':8,Ab:8,A:9,'A#':10,Bb:10,B:11};
function freqOf(n){ const m=n.match(/^([A-G][#b]?)(\d)$/); return 440*Math.pow(2,(NOTE_IDX[m[1]]+(+m[2]+1)*12-69)/12); }
const sq = s => s.trim().split(/\s+/);
const SONGS = {
  stage:{ bpm:138, tracks:{
    lead:sq(`A4 - C5 - E5 - D5 C5   A4 - - - F4 - A4 -   G4 - C5 - E5 - G5 -   F5 - E5 D5 B4 - G4 -
             A4 - C5 - E5 - A5 -    G5 F5 E5 - C5 - A4 -  B4 - D5 - G5 - F5 E5  E5 - - - G#4 - B4 -`),
    harm:sq(`E4 . E4 . A4 . A4 .   C4 . C4 . F4 . F4 .   E4 . E4 . G4 . G4 .   D4 . D4 . G4 . G4 .
             E4 . E4 . A4 . A4 .   C4 . C4 . F4 . F4 .   D4 . D4 . G4 . G4 .   B3 . B3 . E4 . E4 .`),
    bass:sq(`A2 A3 A2 A3 A2 A3 A2 A3   F2 F3 F2 F3 F2 F3 F2 F3   C3 C4 C3 C4 C3 C4 C3 C4   G2 G3 G2 G3 G2 G3 G2 G3
             A2 A3 A2 A3 A2 A3 A2 A3   F2 F3 F2 F3 F2 F3 F2 F3   G2 G3 G2 G3 G2 G3 G2 G3   E2 E3 E2 E3 E2 E3 G#2 B2`),
    drum:sq(`k h s h k k s h `.repeat(7)+`k h s h s s s s`) }},
  boss:{ bpm:168, tracks:{
    lead:sq(`D5 - A4 - D5 E5 F5 -   D5 - Bb4 - F4 - Bb4 -   C5 - G4 - C5 D5 E5 -   C#5 - A4 - E5 - C#5 -
             F5 E5 D5 - A5 - F5 -   G5 F5 D5 - Bb4 - D5 -   E5 D5 C5 - G5 - E5 -   A5 - G5 - F5 - E5 C#5`),
    harm:sq(`A4 . F4 . A4 . F4 .   F4 . D4 . F4 . D4 .   G4 . E4 . G4 . E4 .   E4 . C#4 . E4 . C#4 . `.repeat(2)),
    bass:sq(`D2 D2 D3 D2 D2 D3 D2 C3   Bb1 Bb1 Bb2 Bb1 Bb1 Bb2 Bb1 A1   C2 C2 C3 C2 C2 C3 C2 D2   A1 A1 A2 A1 A1 A2 C#2 E2 `.repeat(2)),
    drum:sq(`k h s h k k s h   k h s h k h s s `.repeat(4)) }},
  cave:{ bpm:112, tracks:{
    lead:sq(`E5 - - - D5 - C5 -   B4 - - - A4 - - -   C5 - E5 - A5 - G5 -   F5 - - - E5 - - -
             E5 - - - D5 - C5 -   B4 - C5 - D5 - E5 -  F5 - E5 - D5 - C5 -   B4 - - - G#4 - - -`),
    harm:sq(`A3 C4 E4 C4 A3 C4 E4 C4   G3 B3 D4 B3 G3 B3 D4 B3   F3 A3 C4 A3 F3 A3 C4 A3   E3 G#3 B3 G#3 E3 G#3 B3 G#3 `.repeat(2)),
    bass:sq(`A2 - - - A2 - - -   G2 - - - G2 - - -   F2 - - - F2 - - -   E2 - - - E2 - - - `.repeat(2)),
    drum:sq(`k . h . s . h . `.repeat(8)) }},
  desert:{ bpm:128, tracks:{
    lead:sq(`D5 - Eb5 - F#5 - G5 -   A5 - G5 F#5 Eb5 - D5 -   C5 - D5 - Eb5 - F#5 -   D5 - - - . . . .
             G5 - F#5 - Eb5 - D5 -   Eb5 - D5 C5 Bb4 - A4 -   Bb4 - C5 - D5 - Eb5 -   D5 - - - . . A4 -`),
    harm:sq(`D4 . A4 . D4 . A4 . `.repeat(4)+`G4 . D4 . G4 . D4 .   Eb4 . Bb4 . Eb4 . Bb4 .   D4 . A4 . D4 . A4 .   D4 . A4 . D4 . A4 . `),
    bass:sq(`D2 D2 . D2 A1 . D2 . `.repeat(8)),
    drum:sq(`k . s k . k s . `.repeat(8)) }},
  castle:{ bpm:120, tracks:{
    lead:sq(`C5 - - - Eb5 - G5 -   F5 - Eb5 - D5 - - -   Eb5 - - - G5 - C6 -   B5 - - - G5 - - -
             Ab5 - G5 - F5 - Eb5 -   D5 - Eb5 - F5 - G5 -   Eb5 - D5 - C5 - B4 -   C5 - - - - - . .`),
    harm:sq(`G4 . Eb4 . G4 . Eb4 .   F4 . D4 . F4 . D4 .   G4 . Eb4 . G4 . Eb4 .   G4 . D4 . G4 . D4 .
             Ab4 . F4 . Ab4 . F4 .   G4 . D4 . G4 . D4 .   G4 . Eb4 . G4 . Eb4 .   G4 . Eb4 . C4 . . .`),
    bass:sq(`C2 C3 C2 C3 C2 C3 C2 C3   Bb1 Bb2 Bb1 Bb2 Bb1 Bb2 Bb1 Bb2   Ab1 Ab2 Ab1 Ab2 Ab1 Ab2 Ab1 Ab2   G1 G2 G1 G2 G1 G2 B1 D2
             F1 F2 F1 F2 F1 F2 F1 F2   G1 G2 G1 G2 G1 G2 G1 G2   Ab1 Ab2 Ab1 Ab2 G1 G2 G1 G2   C2 C3 C2 C3 C2 . . .`),
    drum:sq(`k h s h k h s h `.repeat(7)+`k k s s k s s s`) }},
  // samba batucada: bright major melody over a busy surdo/caixa/tamborim groove
  carnaval:{ bpm:136, tracks:{
    lead:sq(`G5 - E5 G5 - E5 C5 -   D5 E5 F5 - E5 D5 C5 -   G5 - E5 G5 - E5 C6 -   B5 A5 G5 - . . . .
             A5 - F5 A5 - F5 D5 -   E5 F5 G5 - F5 E5 D5 -   C5 E5 G5 C6 - B5 A5 G5   C6 - - - G5 - C5 -`),
    harm:sq(`E4 G4 E4 G4 E4 G4 E4 G4   F4 A4 F4 A4 F4 A4 F4 A4   E4 G4 E4 G4 E4 G4 E4 G4   D4 G4 D4 G4 D4 G4 D4 G4
             F4 A4 F4 A4 F4 A4 F4 A4   G4 B4 G4 B4 G4 B4 G4 B4   E4 G4 E4 G4 F4 A4 F4 A4   E4 G4 C5 G4 E4 . . .`),
    bass:sq(`C3 . C2 C3 . C2 C3 C2   F2 . F2 F3 . F2 F3 F2   C3 . C2 C3 . C2 C3 C2   G2 . G2 G3 . G2 G3 G2
             F2 . F2 F3 . F2 F3 F2   G2 . G2 G3 . G2 G3 G2   C3 . C2 C3 F2 . G2 G2   C3 . C2 C3 C2 . . .`),
    drum:sq(`k h s h k s s h `.repeat(7)+`s s s s k s k s`) }},
  // Páscoa: bouncy, playful major tune
  pascoa:{ bpm:148, tracks:{
    lead:sq(`F5 - A5 - C6 - A5 -   G5 - Bb5 - A5 - F5 -   E5 - G5 - C6 - Bb5 A5   G5 - - - C5 - - -
             F5 - A5 - C6 - D6 -   C6 - A5 - F5 - A5 -   G5 - E5 - C5 - E5 -   F5 - - - . . . .`),
    harm:sq(`A4 . C5 . A4 . C5 .   Bb4 . D5 . Bb4 . D5 .   G4 . C5 . G4 . C5 .   E4 . G4 . E4 . G4 .
             A4 . C5 . A4 . C5 .   F4 . A4 . F4 . A4 .   G4 . Bb4 . G4 . Bb4 .   A4 . C5 . A4 . . .`),
    bass:sq(`F2 . C3 . F2 . C3 .   Bb1 . F2 . Bb1 . F2 .   C2 . G2 . C2 . G2 .   C2 . G2 . C2 . E2 .
             F2 . C3 . F2 . C3 .   Bb1 . F2 . Bb1 . F2 .   C2 . G2 . C2 . G2 .   F2 . C3 . F2 . . .`),
    drum:sq(`k . h . s . h h `.repeat(7)+`k . s . s s s s`) }},
  // Festa Junina: baião/forró feel in G mixolydian
  junina:{ bpm:142, tracks:{
    lead:sq(`G5 - F5 - E5 - D5 -   E5 F5 G5 - A5 - G5 -   F5 - E5 - D5 - C5 -   D5 - - - G4 - - -
             B4 - D5 - G5 - F5 -   E5 - D5 - C5 - E5 -   D5 - F5 - E5 - C5 -   G5 - - - . . . .`),
    harm:sq(`B4 . D5 . B4 . D5 .   C5 . E5 . C5 . E5 .   A4 . C5 . A4 . C5 .   B4 . D5 . B4 . D5 .
             G4 . B4 . G4 . B4 .   C5 . E5 . C5 . E5 .   F4 . A4 . F4 . A4 .   B4 . D5 . G4 . . .`),
    bass:sq(`G2 . . G2 D2 . G2 .   C3 . . C3 G2 . C3 .   F2 . . F2 C3 . F2 .   G2 . . G2 D2 . G2 .
             G2 . . G2 D2 . G2 .   C3 . . C3 G2 . C3 .   F2 . . F2 D2 . F2 .   G2 . . G2 D2 . . .`),
    drum:sq(`k h h k s h h h `.repeat(7)+`k h k h s s s s`) }},
  // Noite do Saci: mysterious viola tune in E minor
  saci:{ bpm:104, tracks:{
    lead:sq(`E5 - - G5 - F#5 E5 -   B4 - - - D5 - C5 B4   A4 - C5 - E5 - D5 C5   B4 - - - . . . .
             E5 - G5 - B5 - A5 G5   F#5 - - - D5 - E5 F#5   G5 - F#5 - E5 - D#5 -   E5 - - - . . . .`),
    harm:sq(`G4 B4 E4 B4 G4 B4 E4 B4   G4 B4 D4 B4 G4 B4 D4 B4   E4 A4 C4 A4 E4 A4 C4 A4   F#4 B4 D#4 B4 F#4 B4 D#4 B4 `.repeat(2)),
    bass:sq(`E2 - - - B1 - - -   G2 - - - D2 - - -   A1 - - - C2 - - -   B1 - - - B1 - D#2 - `.repeat(2)),
    drum:sq(`k . . h . . s . `.repeat(8)) }},
  victory:{ bpm:150, once:true, tracks:{
    lead:sq(`C5 E5 G5 C6 - - G5 - C6 - - - . . . .`),
    harm:sq(`E4 G4 C5 E5 - - D5 - E5 - - - . . . .`),
    bass:sq(`C3 - - - - - G2 - C3 - - - . . . .`),
    drum:sq(`k . . . k . s . k . . . . . . .`) }},
  gameover:{ bpm:90, once:true, tracks:{
    lead:sq(`E4 - D4 - C4 - B3 - A3 - - - - - . .`),
    bass:sq(`A2 - - - F2 - - - E2 - - - A1 - - -`) }},
};
const VOICE = { lead:['square',0.045], harm:['triangle',0.05], bass:['triangle',0.13] };
const Music = { name:null, song:null, step:0, next:0 };
function playMusic(name){
  if (Music.name===name) return;
  Music.name=name; Music.song=name?SONGS[name]:null; Music.step=0; Music.next=0;
}
function drumHit(k,t){
  const c=A.ctx, dt=t-c.currentTime;
  if (k==='k'){ const o=c.createOscillator(), g=c.createGain(); o.frequency.setValueAtTime(150,t); o.frequency.exponentialRampToValueAtTime(40,t+0.12);
    g.gain.setValueAtTime(0.35,t); g.gain.exponentialRampToValueAtTime(0.0001,t+0.14); o.connect(g).connect(A.music); o.start(t); o.stop(t+0.15); }
  else if (k==='s'){ noise(0.13,0.16,'bandpass',1800,dt,0,A.music); tone(190,0.08,'triangle',0.08,0.6,dt,A.music); }
  else if (k==='h'){ noise(0.04,0.05,'highpass',7000,dt,0,A.music); }
}
function scheduleStep(song,i,t,dt){
  for (const [name,arr] of Object.entries(song.tracks)){
    const tok=arr[i % arr.length];
    if (!tok || tok==='.' || tok==='-') continue;
    if (name==='drum'){ drumHit(tok,t); continue; }
    let len=1; while (arr[(i+len)%arr.length]==='-' && len<16) len++;
    const [type,vol]=VOICE[name], dur=len*dt*0.92, c=A.ctx, o=c.createOscillator(), g=c.createGain();
    o.type=type; o.frequency.setValueAtTime(freqOf(tok),t);
    if (name==='lead' && len>2){ const lfo=c.createOscillator(), lg=c.createGain(); lfo.frequency.value=6; lg.gain.value=freqOf(tok)*0.012;
      lfo.connect(lg).connect(o.frequency); lfo.start(t+0.12); lfo.stop(t+dur); }
    g.gain.setValueAtTime(0.0001,t); g.gain.linearRampToValueAtTime(vol,t+0.008);
    g.gain.setValueAtTime(vol*0.75,t+Math.min(dur*0.5,0.12)); g.gain.exponentialRampToValueAtTime(0.0001,t+dur);
    o.connect(g).connect(A.music); o.start(t); o.stop(t+dur+0.02);
  }
}
setInterval(()=>{
  if (!A.ctx || !Music.song || A.ctx.state!=='running') return;
  const s=Music.song, dt=60/s.bpm/2, now=A.ctx.currentTime, len=Math.max(...Object.values(s.tracks).map(a=>a.length));
  if (Music.next<now-0.1) Music.next=now+0.06;
  while (Music.next<now+0.15){
    scheduleStep(s,Music.step,Music.next,dt);
    Music.next+=dt;
    if (++Music.step>=len){ if (s.once){ Music.song=null; break; } Music.step=0; }
  }
},25);
