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
        {at:1700, left:1480, type:'survive', secs:20, spawn:['foliao','foliao','pierrot','bonecao'], every:75, max:5, waves:[[['foliao',1800],['pierrot',2200]]]},
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
    { id:'junina', map:{x:480,y:320,icon:'bonfire'}, arenaName:'Arraial',
      name:'Festa Junina', theme:'junina', worldW:4000, music:'junina', bossMusic:'boss',
      // bonfires hurt on touch; fireworks fall every `rockets` frames
      hazards:[{type:'fire',x:690,w:56},{type:'fire',x:1640,w:56},{type:'fire',x:2700,w:56}],
      rockets:300,
      platforms:[
        {x:400,y:372,w:180},{x:560,y:290,w:160},{x:780,y:372,w:180},
        {x:1360,y:372,w:180},{x:1520,y:290,w:170},{x:1720,y:372,w:200},{x:1960,y:296,w:130},
        {x:2400,y:372,w:200},{x:2580,y:290,w:160},{x:2800,y:372,w:180},
        {x:3200,y:372,w:170},{x:3720,y:372,w:170},
      ],
      zones:[
        {at:330, left:100, waves:[
          [['espantalho',560],['buscape',800],['fogueteiro',950]],
          [['buscape',300],['fogueteiro',880],['espantalho',620],['buscape',720]]]},
        {at:1260, left:1150, waves:[
          [['espantalho',1500],['fogueteiro',1850],['buscape',1300],['buscape',1700]],
          [['espantalho',1450],['espantalho',1950],['fogueteiro',1650],['buscape',1800],['buscape',1350]]]},
        {at:2260, left:2150, waves:[
          [['espantalho',2550],['fogueteiro',2950],['buscape',2400],['buscape',2850]],
          [['espantalho',2300],['espantalho',2900],['fogueteiro',2560],['fogueteiro',2880],['buscape',2650],['buscape',2450]]]},
        {at:3150, left:3040, boss:true, waves:[[['boitata',3760]]]},
      ],
      arena:{left:3040, extra:[{x:3470,y:296,w:110}]},
    },
    { id:'saci', map:{x:650,y:200,icon:'saci'}, arenaName:'Clareira do Saci',
      name:'Noite do Saci', theme:'saci', worldW:4000, music:'saci', bossMusic:'boss',
      platforms:[
        {x:420,y:372,w:180},{x:580,y:290,w:160},{x:820,y:372,w:180},
        {x:1340,y:372,w:200},{x:1520,y:290,w:170},{x:1760,y:372,w:180},{x:1950,y:296,w:130},
        {x:2400,y:372,w:200},{x:2580,y:290,w:180},{x:2840,y:372,w:180},
        {x:3200,y:372,w:170},{x:3720,y:372,w:170},
      ],
      zones:[
        {at:330, left:100, waves:[
          [['saci',600],['fogofatuo',800],['saci',950]],
          [['lobisomem',880],['fogofatuo',300],['saci',620],['fogofatuo',720]]]},
        {at:1260, left:1150, waves:[
          [['saci',1500],['lobisomem',1850],['fogofatuo',1300],['fogofatuo',1700]],
          [['lobisomem',1450],['saci',1950],['saci',1650],['fogofatuo',1800],['fogofatuo',1350]]]},
        {at:2260, left:2150, waves:[
          [['lobisomem',2550],['saci',2950],['fogofatuo',2400],['saci',2700]],
          [['lobisomem',2300],['lobisomem',2900],['saci',2560],['saci',2880],['fogofatuo',2650],['fogofatuo',2450]]]},
        {at:3150, left:3040, boss:true, waves:[[['mula',3760]]]},
      ],
      arena:{left:3040, extra:[{x:3470,y:296,w:110}]},
    },
    { id:'natal', map:{x:830,y:300,icon:'gift'}, arenaName:'Praia de Natal',
      name:'Natal', theme:'natal', worldW:4000, music:'natal', bossMusic:'boss',
      // surprise presents: `good` ones burst into coins, the others light a fuse and explode
      hazards:[{type:'gift',x:300,good:true,col:'#2a9d8f'},{type:'gift',x:980,good:false},{type:'gift',x:1300,good:true,col:'#4d9de0'},
               {type:'gift',x:2050,good:false},{type:'gift',x:2350,good:true,col:'#ff4fd8'},{type:'gift',x:2980,good:false}],
      platforms:[
        {x:420,y:372,w:180},{x:580,y:290,w:160},{x:820,y:372,w:200},
        {x:1360,y:372,w:200},{x:1540,y:290,w:170},{x:1760,y:372,w:180},{x:1950,y:296,w:130},
        {x:2420,y:372,w:200},{x:2600,y:290,w:170},{x:2840,y:372,w:180},
        {x:3180,y:372,w:170},{x:3750,y:372,w:170},
      ],
      zones:[
        {at:330, left:100, waves:[
          [['duende',600],['duende',780],['soldadinho',950]],
          [['rena',880],['duende',300],['duende',620],['soldadinho',720]]]},
        {at:1260, left:1150, waves:[
          [['duende',1500],['soldadinho',1850],['rena',1300],['duende',1700]],
          [['rena',1450],['rena',1950],['soldadinho',1650],['duende',1800],['duende',1350]]]},
        {at:2260, left:2150, waves:[
          [['rena',2550],['soldadinho',2950],['duende',2400],['duende',2700]],
          [['rena',2300],['rena',2900],['soldadinho',2560],['soldadinho',2880],['duende',2650],['duende',2450]]]},
        {at:3150, left:3040, boss:true, waves:[[['ladrao',3760]]]},
      ],
      arena:{left:3040, extra:[{x:3470,y:296,w:110}]},
    },
  ],
});
