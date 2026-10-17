'use strict';
// ===================== Continent 2: Terra Brasilis =====================
// A year of Brazilian celebrations, in calendar order. Same stage fields as vallen.js; `move` makes a
// platform slide back and forth (range in px, speed in radians per frame) and `float` draws it as a
// parade float. Moving platforms stay out of the boss arena so the PvP arena is static.
registerContinent({
  id:'brasilis', name:'Terra Brasilis', sub:'Continente 2',
  map:{x:640,y:250}, colors:{land:'#3fa34d', shore:'#f2d16b', dark:'#1f7a3a'},
  stages:[
    { id:'carnaval', map:{x:130,y:330,icon:'mask'}, arenaName:'Sambódromo',
      name:'Carnaval', theme:'carnaval', worldW:4000, music:'carnaval', bossMusic:'boss',
      platforms:[
        {x:380,y:372,w:180},{x:520,y:290,w:150},{x:760,y:372,w:200,float:true,move:{range:100,speed:0.015}},
        {x:1330,y:372,w:180},{x:1480,y:290,w:170},{x:1730,y:372,w:220,float:true,move:{range:120,speed:0.012}},{x:2000,y:372,w:130},
        {x:2400,y:372,w:180},{x:2560,y:290,w:170},{x:2800,y:372,w:200,float:true,move:{range:90,speed:0.014}},
        {x:3180,y:372,w:170},{x:3750,y:372,w:170},
      ],
      zones:[
        {at:330, left:100, waves:[
          [['foliao',560],['foliao',760],['pierrot',950]],
          [['foliao',300],['pierrot',880],['foliao',620],['foliao',700]]]},
        {at:1260, left:1150, waves:[
          [['foliao',1500],['pierrot',1850],['foliao',1300],['bonecao',1700]],
          [['bonecao',1450],['foliao',1950],['pierrot',1650],['pierrot',2050]]]},
        {at:2260, left:2150, waves:[
          [['bonecao',2550],['pierrot',2950],['foliao',2400],['foliao',2700]],
          [['bonecao',2300],['bonecao',2900],['pierrot',2560],['pierrot',2880],['foliao',2650]]]},
        {at:3150, left:3040, boss:true, waves:[[['bonecaoRei',3760]]]},
      ],
      arena:{left:3040, extra:[{x:3470,y:296,w:110}]},
    },
    { id:'pascoa', map:{x:300,y:220,icon:'egg'}, arenaName:'Fábrica de Chocolate',
      name:'Páscoa', theme:'pascoa', worldW:4000, music:'pascoa', bossMusic:'boss',
      eggs:[480,620,1050,1560,1990,2470,2640,2950],
      platforms:[
        {x:440,y:372,w:180},{x:600,y:290,w:160},{x:850,y:372,w:200},
        {x:1360,y:372,w:200},{x:1530,y:290,w:180},{x:1790,y:372,w:180},{x:1960,y:296,w:130},
        {x:2420,y:372,w:200},{x:2600,y:290,w:170},{x:2880,y:372,w:180},
        {x:3200,y:372,w:170},{x:3720,y:372,w:170},
      ],
      zones:[
        {at:330, left:100, waves:[
          [['coelho',560],['coelho',760],['ovo',950]],
          [['galinha',880],['coelho',300],['coelho',620],['ovo',700]]]},
        {at:1260, left:1150, waves:[
          [['coelho',1500],['galinha',1850],['ovo',1300],['coelho',1700]],
          [['ovo',1450],['ovo',1950],['galinha',1650],['coelho',1800],['coelho',1350]]]},
        {at:2260, left:2150, waves:[
          [['ovo',2550],['galinha',2950],['coelho',2400],['coelho',2700]],
          [['ovo',2300],['ovo',2900],['galinha',2560],['galinha',2880],['coelho',2650],['coelho',2450]]]},
        {at:3150, left:3040, boss:true, waves:[[['coelhoRei',3760]]]},
      ],
      arena:{left:3040, extra:[{x:3470,y:296,w:110}]},
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
  ],
});
