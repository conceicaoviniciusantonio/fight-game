'use strict';
// ===================== Continent 2: Terra Brasilis =====================
// A year of Brazilian celebrations, in calendar order. Same stage fields as vallen.js; `move` makes a
// platform slide back and forth (range in px, speed in radians per frame) and `float` draws it as a
// parade float. Moving platforms stay out of the boss arena so the PvP arena is static.
registerContinent({
  id:'brasilis', name:'Terra Brasilis', sub:'Continente 2',
  map:{x:640,y:250}, colors:{land:'#3fa34d', shore:'#f2d16b', dark:'#1f7a3a'},
  stages:[
    // Parade floats carry the heroes over gaps in the avenue; a street "bloco" to survive and Rei Momo's ambush
    { id:'carnaval', map:{x:130,y:330,icon:'mask'}, arenaName:'Sambódromo',
      name:'Carnaval', theme:'carnaval', worldW:4800, music:'carnaval', bossMusic:'boss',
      platforms:[
        {x:380,y:372,w:180},{x:520,y:290,w:150},
        {x:1160,y:372,w:180,float:true,move:{range:110,speed:0.014}},
        {x:1560,y:372,w:180},{x:1740,y:290,w:160},{x:2050,y:372,w:160},
        {x:2540,y:372,w:180,float:true,move:{range:120,speed:0.012}},
        {x:2950,y:372,w:170},{x:3100,y:290,w:150},{x:3250,y:208,w:130},{x:3450,y:372,w:160},
        {x:3980,y:372,w:170},{x:4550,y:372,w:170},
      ],
      pits:[{x:1150,w:200},{x:2500,w:260}],
      lifeItems:[3315],
      zones:[
        {at:330, left:100, waves:[
          [['foliao',560],['foliao',760],['pierrot',950]],
          [['foliao',300],['pierrot',880],['foliao',620],['foliao',700]]]},
        {at:1700, left:1480, type:'survive', secs:20, spawn:['foliao','foliao','pierrot','bonecao'], every:75, max:5, label:'Bloco de rua', waves:[[['foliao',1800],['pierrot',2200]]]},
        {at:3000, left:2860, type:'ambush', waves:[
          [['foliao','L'],['foliao','R'],['pierrot',3160]],
          [['bonecao','L'],['pierrot','R'],['foliao',3500]],
          [['bonecao',3600,{mini:true,name:'Rei Momo'}],['pierrot',3160],['foliao','R']]]},
        {at:3950, left:3840, boss:true, waves:[[['bonecaoRei',4560]]]},
      ],
      arena:{left:3840, extra:[{x:4270,y:296,w:110}]},
    },
    // Chocolate rivers slow the heroes down; marshmallow trampolines launch them up to hidden eggs and over a pit
    { id:'pascoa', map:{x:300,y:220,icon:'egg'}, arenaName:'Fábrica de Chocolate',
      name:'Páscoa', theme:'pascoa', worldW:4200, music:'pascoa', bossMusic:'boss',
      eggs:[520,680,1320,1720,1880,2780,2940,3160],
      platforms:[
        {x:440,y:372,w:180},{x:600,y:290,w:160},
        {x:1190,y:420,w:70,bounce:17},{x:1260,y:208,w:140},
        {x:1650,y:372,w:180},{x:1810,y:290,w:160},{x:2050,y:372,w:160},
        {x:2250,y:430,w:70,bounce:16},
        {x:2700,y:372,w:180},{x:2860,y:290,w:170},{x:3100,y:372,w:170},
        {x:3380,y:372,w:170},{x:3950,y:372,w:170},
      ],
      pits:[{x:2350,w:200}],
      hazards:[{type:'slow',kind:'choco',x:1060,w:120},{type:'slow',kind:'choco',x:1420,w:110},{type:'slow',kind:'choco',x:2960,w:120}],
      lifeItems:[1300],
      zones:[
        {at:330, left:100, waves:[
          [['coelho',560],['coelho',760],['ovo',950]],
          [['galinha',880],['coelho',300],['coelho',620],['ovo',700]]]},
        {at:1640, left:1420, waves:[
          [['galinha',1880],['galinha',2150],['coelho',1500],['ovo',2000]],
          [['ovo',1550],['ovo',2250],['galinha',1880],['coelho',1800],['coelho',1650]]]},
        {at:2700, left:2600, type:'ambush', waves:[
          [['coelho','L'],['coelho','R'],['galinha',2940]],
          [['ovo','L'],['ovo','R'],['galinha',3150],['coelho',2800]],
          [['coelho',3300,{mini:true,name:'Coelhão Guloso'}],['galinha',2940],['coelho','L']]]},
        {at:3350, left:3240, boss:true, waves:[[['coelhoRei',3960]]]},
      ],
      arena:{left:3240, extra:[{x:3670,y:296,w:110}]},
    },
    // Bonfires, fireworks from the sky, the fishing pond, a "quadrilha" to survive and stalls that collapse
    { id:'junina', map:{x:480,y:320,icon:'bonfire'}, arenaName:'Arraial',
      name:'Festa Junina', theme:'junina', worldW:5000, music:'junina', bossMusic:'boss',
      // bonfires hurt on touch; fireworks fall every `rockets` frames
      hazards:[{type:'fire',x:690,w:56},{type:'fire',x:1420,w:56},{type:'fire',x:2300,w:56},{type:'fire',x:3500,w:56}],
      rockets:280,
      platforms:[
        {x:400,y:372,w:180},{x:560,y:290,w:160},
        {x:1200,y:372,w:150,crumble:true},
        {x:1700,y:372,w:180},{x:1880,y:290,w:160},{x:2150,y:372,w:160},
        {x:2580,y:378,w:90,crumble:true},{x:2700,y:378,w:90,crumble:true},
        {x:3050,y:372,w:180},{x:3230,y:290,w:160},{x:3390,y:208,w:140},{x:3650,y:372,w:170},
        {x:4180,y:372,w:170},{x:4750,y:372,w:170},
      ],
      pits:[{x:1150,w:150},{x:2560,w:260}],
      lifeItems:[3460],
      zones:[
        {at:330, left:100, waves:[
          [['espantalho',560],['buscape',800],['fogueteiro',950]],
          [['buscape',300],['fogueteiro',880],['espantalho',620],['buscape',720]]]},
        {at:1820, left:1600, type:'survive', secs:22, spawn:['buscape','espantalho','fogueteiro','buscape'], every:80, max:5, label:'Quadrilha', waves:[[['espantalho',1900],['buscape',2300]]]},
        {at:3100, left:2950, type:'ambush', waves:[
          [['buscape','L'],['buscape','R'],['fogueteiro',3290]],
          [['espantalho','L'],['espantalho','R'],['fogueteiro',3700]],
          [['espantalho',3700,{mini:true,name:'Zé do Milho'}],['fogueteiro',3290],['buscape','L']]]},
        {at:4150, left:4040, boss:true, waves:[[['boitata',4760]]]},
      ],
      arena:{left:4040, extra:[{x:4470,y:296,w:110}]},
    },
    // A dark swamp: mud that slows, holes full of water, the Saci's whirlwinds pushing the heroes around and logs that sink
    { id:'saci', map:{x:650,y:200,icon:'saci'}, arenaName:'Clareira do Saci',
      name:'Noite do Saci', theme:'saci', worldW:5600, music:'saci', bossMusic:'boss',
      platforms:[
        {x:420,y:372,w:180},{x:580,y:290,w:160},
        {x:1250,y:380,w:90,crumble:true},{x:1380,y:380,w:90,crumble:true},
        {x:1800,y:372,w:180},{x:1980,y:290,w:160},{x:2240,y:372,w:160},
        {x:2950,y:372,w:150},{x:3110,y:290,w:140},{x:3260,y:208,w:130},{x:3460,y:372,w:160},
        {x:3900,y:372,w:170},{x:4080,y:290,w:150},
        {x:4780,y:372,w:170},{x:5350,y:372,w:170},
      ],
      pits:[{x:1230,w:250},{x:2640,w:130}],
      hazards:[
        {type:'slow',kind:'mud',x:1050,w:150},{type:'wind',x:2450,w:420,force:1.6,period:300},
        {type:'slow',kind:'mud',x:2800,w:120},{type:'wind',x:3600,w:300,force:1.4,period:260,phase:1.5},
      ],
      lifeItems:[3320],
      zones:[
        {at:330, left:100, waves:[
          [['saci',600],['fogofatuo',800],['saci',950]],
          [['lobisomem',880],['fogofatuo',300],['saci',620],['fogofatuo',720]]]},
        {at:1850, left:1650, waves:[
          [['saci',1900],['lobisomem',2350],['fogofatuo',1750],['fogofatuo',2200]],
          [['lobisomem',1700],['saci',2450],['saci',2050],['fogofatuo',2300],['fogofatuo',1800]]]},
        {at:3000, left:2900, type:'ambush', waves:[
          [['saci','L'],['saci','R'],['fogofatuo',3200]],
          [['lobisomem','L'],['fogofatuo','R'],['saci',3500]],
          [['lobisomem',3700,{mini:true,name:'Lobisomem Alfa'}],['fogofatuo',3200],['saci','L']]]},
        {at:4050, left:3880, type:'survive', secs:24, spawn:['saci','fogofatuo','lobisomem','fogofatuo'], every:80, max:5, label:'Lua cheia', waves:[[['saci',4100],['fogofatuo',4500]]]},
        {at:4750, left:4640, boss:true, waves:[[['mula',5360]]]},
      ],
      arena:{left:4640, extra:[{x:5070,y:296,w:110}]},
    },
    // The longest stage: a summer Christmas on the beach — presents, sand, an inflatable trampoline,
    // a giant beach ball rolling after the heroes and four fights before the thief
    { id:'natal', map:{x:830,y:300,icon:'gift'}, arenaName:'Praia de Natal',
      name:'Natal', theme:'natal', worldW:6200, music:'natal', bossMusic:'boss',
      // surprise presents: `good` ones burst into coins, the others light a fuse and explode
      hazards:[{type:'gift',x:300,good:true,col:'#2a9d8f'},{type:'gift',x:980,good:false},{type:'gift',x:1500,good:true,col:'#4d9de0'},
               {type:'gift',x:2350,good:false},{type:'gift',x:2560,good:true,col:'#ff4fd8'},{type:'gift',x:4400,good:false},{type:'gift',x:4520,good:true,col:'#ffd23f'},
               {type:'slow',kind:'sand',x:1080,w:150},{type:'slow',kind:'sand',x:3000,w:130},{type:'spikes',x:3250,w:80,period:110,on:50}],
      platforms:[
        {x:420,y:372,w:180},{x:580,y:290,w:160},
        {x:1290,y:430,w:70,bounce:17},{x:1370,y:208,w:150},
        {x:1750,y:372,w:180},{x:1920,y:290,w:160},{x:2180,y:372,w:160},
        {x:3120,y:376,w:110},
        {x:3950,y:372,w:180},{x:4130,y:290,w:160},{x:4380,y:372,w:160},
        {x:4800,y:372,w:170},{x:4980,y:290,w:150},
        {x:5380,y:372,w:170},{x:5950,y:372,w:170},
      ],
      pits:[{x:3520,w:160}],
      lifeItems:[1440],
      zones:[
        {at:330, left:100, waves:[
          [['duende',600],['duende',780],['soldadinho',950]],
          [['rena',880],['duende',300],['duende',620],['soldadinho',720]]]},
        {at:1800, left:1600, waves:[
          [['duende',1900],['soldadinho',2400],['rena',1700],['duende',2200]],
          [['rena',1650],['rena',2450],['soldadinho',1990],['duende',2300],['duende',1800]]]},
        {at:2720, type:'chase', to:3500, style:'ball', label:'Uma bola de praia gigante vem rolando!'},
        {at:3980, left:3820, type:'ambush', waves:[
          [['duende','L'],['duende','R'],['soldadinho',4200]],
          [['rena','L'],['soldadinho','R'],['duende',4450]],
          [['duende',4500,{mini:true,name:'Duende Chefe'}],['soldadinho',4200],['rena','L']]]},
        {at:4860, left:4720, type:'survive', secs:24, spawn:['duende','rena','soldadinho','duende'], every:80, max:5, label:'Ceia de Natal', waves:[[['duende',5000],['rena',5300]]]},
        {at:5350, left:5240, boss:true, waves:[[['ladrao',5960]]]},
      ],
      arena:{left:5240, extra:[{x:5670,y:296,w:110}]},
    },
  ],
});
