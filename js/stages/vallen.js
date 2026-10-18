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
    // Quicksand, a mummy ambush and a giant boulder chasing the heroes down a corridor until it drops into a pit
    { id:'desert', map:{x:600,y:318,icon:'pyramid'}, arenaName:'Deserto',
      name:'Deserto Escaldante', theme:'desert', worldW:4600, music:'desert', bossMusic:'boss',
      platforms:[
        {x:500,y:376,w:240},{x:700,y:300,w:150},
        {x:1650,y:376,w:160},{x:1800,y:296,w:160},{x:2080,y:376,w:160},
        {x:2860,y:376,w:120},
        {x:3780,y:376,w:160},{x:4350,y:376,w:160},
      ],
      pits:[{x:1380,w:110},{x:3280,w:140}],
      hazards:[
        {type:'slow',kind:'sand',x:1130,w:160},
        {type:'slow',kind:'sand',x:2700,w:130},{type:'spikes',x:3000,w:80,period:110,on:50},{type:'slow',kind:'sand',x:3120,w:110},
      ],
      lifeItems:[1880],
      zones:[
        {at:330, left:100, waves:[
          [['scorpion',600],['scorpion',850],['nomad',950]],
          [['mummy',800],['scorpion',300],['nomad',650]]]},
        {at:1760, left:1560, type:'ambush', waves:[
          [['mummy','L'],['mummy','R'],['nomad',1880]],
          [['scorpion','L'],['scorpion','R'],['nomad',2150],['scorpion',1700]],
          [['mummy',2200,{mini:true,name:'Faraó Esquecido'}],['nomad',1880]]]},
        {at:2620, type:'chase', to:3260, label:'Uma pedra gigante rola atrás de você!'},
        {at:3750, left:3640, boss:true, waves:[[['scorpking',4360]]]},
      ],
      arena:{left:3640, extra:[{x:4070,y:298,w:110}]},
    },
    // The longest stage of the kingdom: blade pendulums, spiked floors, a bridge that falls apart and four fights before the throne
    { id:'castle', map:{x:820,y:190,icon:'castle'}, arenaName:'Castelo Sombrio',
      name:'Castelo Sombrio', theme:'castle', worldW:6000, music:'castle', bossMusic:'boss',
      platforms:[
        {x:440,y:370,w:200},{x:600,y:288,w:170},
        {x:1600,y:370,w:120},
        {x:1850,y:370,w:180},{x:2010,y:288,w:170},{x:2300,y:370,w:180},
        {x:2665,y:378,w:80,crumble:true},{x:2775,y:378,w:80,crumble:true},{x:2885,y:378,w:80,crumble:true},
        {x:3150,y:370,w:180},{x:3330,y:288,w:180},{x:3650,y:370,w:170},
        {x:4050,y:370,w:140},{x:4110,y:290,w:130},{x:4150,y:208,w:120},
        {x:4600,y:370,w:170},{x:4780,y:288,w:150},
        {x:5180,y:370,w:180},{x:5760,y:370,w:180},
      ],
      pits:[{x:2650,w:320}],
      hazards:[
        {type:'pendulum',x:1240,y:50,len:360,amp:0.85,speed:0.035},{type:'spikes',x:1360,w:100,period:120,on:55},
        {type:'pendulum',x:1500,y:50,len:360,amp:0.85,speed:0.035,phase:1.6},
        {type:'pendulum',x:3920,y:50,len:360,amp:0.9,speed:0.04},{type:'spikes',x:4250,w:100,period:110,on:50,offset:55},
        {type:'pendulum',x:4380,y:50,len:360,amp:0.9,speed:0.04,phase:2},
      ],
      lifeItems:[4210],
      zones:[
        {at:330, left:100, waves:[
          [['skeleton',600],['skeleton',800],['darkmage',950]],
          [['bat',500],['skeleton',300],['skeleton',700],['darkmage',650]]]},
        {at:1900, left:1750, waves:[
          [['skeleton',2050],['darkmage',2400],['blackknight',2200],['bat',1800]],
          [['blackknight',1850],['skeleton',2500],['darkmage',2090],['skeleton',2300]]]},
        {at:3200, left:3050, type:'ambush', waves:[
          [['skeleton','L'],['skeleton','R'],['darkmage',3410]],
          [['blackknight','L'],['skeleton','R'],['bat',3500],['bat',3300]],
          [['blackknight',3800,{mini:true,name:'Sir Vorn, o Caído'}],['darkmage',3410]]]},
        {at:4560, left:4450, type:'survive', secs:20, spawn:['skeleton','bat','skeleton','darkmage'], every:85, max:5, waves:[[['skeleton',4800],['bat',5000]]]},
        {at:5150, left:5040, boss:true, waves:[[['darklord',5760]]]},
      ],
      arena:{left:5040, extra:[{x:5470,y:290,w:110}]},
    },
  ],
});
