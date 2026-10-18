'use strict';
// ===================== Continent 1: Reino de Vallen =====================
// Stage fields: platforms (low steps ~90px up, high steps ~82px above a low step), zones (each locks the
// camera until its waves are cleared; the last one holds the boss), theme (see themes.js), music and
// the arena used in PvP. `map` places the stage on the continent map.
registerContinent({
  id:'vallen', name:'Reino de Vallen', sub:'Continente 1',
  map:{x:250,y:250}, colors:{land:'#7fb069', shore:'#e9d8a6', dark:'#4f7a3a'},
  stages:[
    // Short first stage: one small pit to learn jumping, an ambush, crumbling ledges over a wide pit
    { id:'forest', map:{x:150,y:322,icon:'tree'}, arenaName:'Ruínas do Bosque',
      name:'Bosque de Vallen', theme:'forest', worldW:3480, music:'stage', bossMusic:'boss',
      platforms:[
        // low steps ~90px up (one jump); high steps ~82px above a low step beside them
        {x:420,y:372,w:200},{x:560,y:290,w:160},
        {x:1300,y:372,w:180},{x:1450,y:290,w:170},{x:1760,y:372,w:180},
        {x:2215,y:378,w:80,crumble:true},{x:2325,y:378,w:80,crumble:true},
        {x:2660,y:372,w:170},{x:3230,y:372,w:170},
      ],
      pits:[{x:1080,w:90},{x:2200,w:220}],
      lifeItems:[1535],
      zones:[
        {at:330, left:100, waves:[
          [['goblin',560],['goblin',760],['goblin',920]],
          [['goblin',250],['archer',950],['goblin',640],['archer',690]]]},
        {at:1420, left:1220, type:'ambush', waves:[
          [['goblin','L'],['goblin','R'],['archer',1530]],
          [['goblin','L'],['archer','R'],['goblin','R'],['goblin',1800]],
          [['orc',1900,{mini:true,name:'Grak, o Capataz'}],['goblin','L'],['archer',1530]]]},
        {at:2630, left:2520, boss:true, waves:[[['gorgo',3240]]]},
      ],
      arena:{left:2520, extra:[{x:2950,y:296,w:110}]},
    },
    // Long and vertical: stalactites, stairs up to the third tier, a lift across a pit and a dark chamber to survive in
    { id:'cave', map:{x:375,y:215,icon:'crystal'}, arenaName:'Caverna de Cristal',
      name:'Caverna de Cristal', theme:'cave', worldW:5200, music:'cave', bossMusic:'boss',
      platforms:[
        {x:460,y:372,w:190},{x:620,y:296,w:150},
        {x:1650,y:372,w:170},{x:1810,y:290,w:150},{x:1970,y:208,w:150},{x:2150,y:372,w:180},
        {x:2400,y:372,w:120},{x:2540,y:300,w:110,move:{axis:'y',range:70,speed:0.025}},
        {x:2770,y:380,w:120,move:{range:130,speed:0.018}},
        {x:3500,y:372,w:170},{x:3700,y:290,w:160},{x:3950,y:372,w:170},
        {x:4380,y:372,w:170},{x:4950,y:372,w:170},
      ],
      pits:[{x:2680,w:300}],
      hazards:[
        {type:'stalactite',x:1120,period:150},{type:'stalactite',x:1260,period:150,offset:50},{type:'stalactite',x:1400,period:150,offset:100},
        {type:'stalactite',x:3080,period:170},{type:'stalactite',x:3220,period:170,offset:85},
      ],
      lifeItems:[2045],
      zones:[
        {at:330, left:100, waves:[
          [['bat',600],['kobold',800],['kobold',950]],
          [['shaman',900],['bat',300],['kobold',500],['bat',700]]]},
        {at:1700, left:1500, waves:[
          [['kobold',1750],['shaman',2040],['bat',1600],['bat',2100]],
          [['kobold',1550],['kobold',2300],['shaman',1880],['bat',1900],['orc',2200]]]},
        {at:3480, left:3300, type:'survive', secs:25, spawn:['bat','kobold','kobold','shaman','bat'], every:80, max:5, waves:[[['kobold',3700],['bat',3900]]]},
        {at:4350, left:4240, boss:true, waves:[[['golem',4960]]]},
      ],
      arena:{left:4240, extra:[{x:4670,y:296,w:110}]},
    },
    { id:'desert', map:{x:600,y:318,icon:'pyramid'}, arenaName:'Deserto',
      name:'Deserto Escaldante', theme:'desert', worldW:4000, music:'desert', bossMusic:'boss',
      platforms:[
        // low steps ~90px up (one jump); high steps ~82px above a low step beside them
        {x:500,y:376,w:240},{x:700,y:300,w:150},{x:900,y:376,w:160},
        {x:1400,y:376,w:220},{x:1600,y:298,w:170},{x:1860,y:376,w:200},{x:2040,y:300,w:120},
        {x:2420,y:376,w:240},{x:2620,y:298,w:160},{x:2880,y:376,w:170},
        {x:3230,y:376,w:160},{x:3700,y:376,w:160},
      ],
      zones:[
        {at:330, left:100, waves:[
          [['scorpion',600],['scorpion',850],['nomad',950]],
          [['mummy',800],['scorpion',300],['nomad',650]]]},
        {at:1260, left:1150, waves:[
          [['scorpion',1500],['nomad',1900],['mummy',1700],['scorpion',1300]],
          [['mummy',1450],['mummy',1950],['nomad',1650],['scorpion',1800]]]},
        {at:2260, left:2150, waves:[
          [['mummy',2500],['nomad',2950],['scorpion',2350],['scorpion',2750]],
          [['mummy',2300],['mummy',2900],['nomad',2550],['nomad',2850],['scorpion',2650]]]},
        {at:3150, left:3040, boss:true, waves:[[['scorpking',3760]]]},
      ],
      arena:{left:3040, extra:[{x:3470,y:298,w:110}]},
    },
    { id:'castle', map:{x:820,y:190,icon:'castle'}, arenaName:'Castelo Sombrio',
      name:'Castelo Sombrio', theme:'castle', worldW:4000, music:'castle', bossMusic:'boss',
      platforms:[
        // low steps ~90px up (one jump); high steps ~82px above a low step beside them
        {x:440,y:370,w:200},{x:600,y:288,w:170},{x:860,y:370,w:180},
        {x:1360,y:370,w:200},{x:1520,y:288,w:190},{x:1800,y:370,w:200},{x:1990,y:296,w:130},
        {x:2380,y:370,w:200},{x:2560,y:288,w:200},{x:2860,y:370,w:180},
        {x:3200,y:370,w:180},{x:3720,y:370,w:180},
      ],
      zones:[
        {at:330, left:100, waves:[
          [['skeleton',600],['skeleton',800],['darkmage',950]],
          [['bat',500],['skeleton',300],['skeleton',700],['darkmage',650]]]},
        {at:1260, left:1150, waves:[
          [['skeleton',1500],['darkmage',1900],['blackknight',1700],['bat',1300]],
          [['blackknight',1450],['skeleton',1950],['darkmage',1650],['skeleton',1800]]]},
        {at:2260, left:2150, waves:[
          [['blackknight',2500],['darkmage',2950],['skeleton',2350],['bat',2750]],
          [['blackknight',2300],['blackknight',2900],['darkmage',2550],['darkmage',2850],['skeleton',2650]]]},
        {at:3150, left:3040, boss:true, waves:[[['darklord',3760]]]},
      ],
      arena:{left:3040, extra:[{x:3470,y:290,w:110}]},
    },
  ],
});
