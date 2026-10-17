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
  ],
});
