var GlyElements = {
  nodes: [
    { data: {id: 0,planet: "Sun",type: "star",image: 'assets/2pg.svg',url: 'https://en.wikipedia.org/wiki/Sun', diameter:"116px", color: "#FF8000" }, position :{ x : 0, y : 0}}, 
	{data: {id: 1,planet: "Mercury",type: "planet",image: 'assets/2pg.svg',url: 'https://en.wikipedia.org/wiki/Glucose_6-phosphate', diameter: "68px", color: "#29088a"}, position :{ x : -358, y : 82}}, 
	{data: {id: 2,planet: "Venus",image: 'assets/2pg.svg',type: "planet",url: 'https://en.wikipedia.org/wiki/Venus', diameter: "76px", color: "#df7401"}, position :{ x : -450, y : 55}}, 
	{data: {id: 3,planet: "Earth",image: 'assets/2pg.svg',type: "planet",url: 'https://en.wikipedia.org/wiki/Earth', diameter: "77px", color: "#0101df"}, position :{ x : 989, y : 149}},
    {data: {id: 4,planet: "Moon",image: 'assets/2pg.svg',type: "moon",url: 'https://en.wikipedia.org/wiki/Moon',diameter: "63px", color: "#d8d8d8" }, position :{ x : 991, y : 147}}, 
	{data: {id: 5,planet: "Mars",image: 'assets/2pg.svg',type: "planet",url: 'https://en.wikipedia.org/wiki/Mars', diameter: "70px", color:"#ff0000" }, position :{ x : -1491, y : 739}}, 
	{data: {id: 6,planet: "Jupiter",image: 'assets/2pg.svg',type: "planet",url: 'https://en.wikipedia.org/wiki/Jupiter', diameter: "96px", color: "#f5d0a9" }, position :{ x : -464, y : -287}}, 
	{data: {id: 7,planet: "Io",image: 'assets/2pg.svg',type: "moon",url: 'https://en.wikipedia.org/wiki/Io_(moon)', diameter: "71px", color: "#f7fe2e"}, position :{ x : 100, y : 300}}, 
	{data: {id: 8,planet: "Europa",image: 'assets/2pg.svg',type: "moon",url: 'https://en.wikipedia.org/wiki/Europa_(moon)', diameter: "68px", color: "#e6e6e6" }, position :{ x : 100, y : 400}}, 
	{data: {id: 9,planet: "Ganymede",image: 'assets/2pg.svg',type: "moon",url:'https://en.wikipedia.org/wiki/Ganymede_(moon)', diameter: "68px", color: "#bef781"}, position :{ x : 200, y : 300}}, 
	{data: {id: 10,planet: 'Callisto',image: 'assets/2pg.svg',type: "moon",url: 'https://en.wikipedia.org/wiki/Callisto_(moon)', diameter: "67px", color: "#04d486"}, position :{ x : 300, y : 200}},
	{data: {id: 11,planet: 'Saturn',image: 'assets/2pg.svg',type: "planet",url: 'https://en.wikipedia.org/wiki/Saturn', diameter: "95px",color: "#886a08"}, position :{ x : -395, y : -1072}},
	{data: {id: 12,planet: 'Titan',image: 'assets/2pg.svg',type: "moon",url: 'https://en.wikipedia.org/wiki/Titan_(moon)', diameter: "68px", color: "#facc2e"}, position :{ x : 200, y : 400}},
	{data: {id: 13,planet: 'Rhea',image: 'assets/2pg.svg',type: "moon",url: 'https://en.wikipedia.org/wiki/Rhea_(moon)', diameter : "58px", color: "#01dfa5"},position :{ x : 400, y : 300}},
	{data: {id: 14,planet: 'Iapetus',image: 'assets/2pg.svg',type: "moon",url: 'https://en.wikipedia.org/wiki/Iapetus_(moon)', diameter: "59px", color: "#bdbdbd"}, position :{ x : 300, y : 400}},
	{data: {id: 15,planet: 'Dione',image: 'assets/2pg.svg',type: "moon",url: 'https://en.wikipedia.org/wiki/Dione_(moon)', diameter: "54px", color: "#d8d8d8"},position :{ x : 400, y : 400}},
	{data: {id: 16,planet: 'Tethys',image: 'assets/2pg.svg',type: "moon",url: 'https://en.wikipedia.org/wiki/Tethys_(moon)', diameter: "54px", color: "#d8d8d8"},position :{ x : 500, y : 500}},
	{data: {id: 17,planet: 'Enceladus',image: 'assets/2pg.svg',type: "moon",url: 'https://en.wikipedia.org/wiki/Enceladus', diameter: "48px", color: "#e0f2f7"}, position :{ x : 100, y : 500}},
	{data: {id: 18,planet: 'Mimas',image: 'assets/2pg.svg',type: "moon",url: 'https://en.wikipedia.org/wiki/Mimas_(moon)', diameter: "46px", color: "#585858"}, position :{ x : 500, y : 100}},
	{data: {id: 19,planet: 'Uranus',image: 'assets/2pg.svg',type: "planet",url: 'https://en.wikipedia.org/wiki/Uranus', diameter: "88px", color: "#81bef7"}, position :{ x : 1788, y : 876}},
	{data: {id: 20,planet: 'Titania',image: 'assets/2pg.svg',type: "moon",url: 'https://en.wikipedia.org/wiki/Titania_(moon)', diameter: "58px", color: "#585858"}, position :{ x : 300, y : 500}},
	{data: {id: 21,planet: 'Oberon',image: 'assets/2pg.svg',type: "moon",url: 'https://en.wikipedia.org/wiki/Oberon_(moon)', diameter: "57px", color: "#151515"}, position :{ x : 400, y : 500}},
	{data: {id: 22,planet: 'Ariel',image: 'assets/2pg.svg',type: "moon",url: 'https://en.wikipedia.org/wiki/Ariel_(moon)', diameter: "54px", color: "#8181f7"}, position :{ x : 500, y : 200}},
	{data: {id: 23,planet: 'Umbriel',image: 'assets/2pg.svg',type: "moon",url: 'https://en.wikipedia.org/wiki/Umbriel_(moon)', diameter: "55px", color: "#1c1c1c"}, position :{ x : 500, y : 300}},
	{data: {id: 24,planet: 'Miranda',image: 'assets/2pg.svg',type: "moon",url: 'https://en.wikipedia.org/wiki/Miranda_(moon)', diameter : "46px", color: "#6e6e6e"}, position :{ x : 500, y : 400}},
	{data: {id: 25,planet: 'Neptune',image: 'assets/2pg.svg',type: "planet",url: 'https://en.wikipedia.org/wiki/Neptune', diameter : "88px", color: "#08088a"}, position :{ x : 2862, y : -873}},
	{data: {id: 26,planet: 'Triton',image: 'assets/2pg.svg',type: "moon",url: 'https://en.wikipedia.org/wiki/Triton_(moon)', diameter: "62px", color : "#cef6f5"}, position :{ x : 600, y : 100}},
	{data: {id: 27,planet: 'Pluto',image:'assets/2pg.svg',type: "planet",url: 'https://en.wikipedia.org/wiki/Pluto', diameter : "61px", color: "#f5d0a9"}, position :{ x : 1061, y : -3161}},
	{data: {id: 28,planet: 'Eris',image: 'assets/2pg.svg',type: "dwarf planet",url: 'https://en.wikipedia.org/wiki/Eris_(dwarf_planet)', diameter: "61px", color: "#d8d8d8"}, position :{ x : 200, y : 600}},
	{data: {id: 29,planet: 'Makemake',image: 'assets/2pg.svg',type: "dwarf planet",url: 'https://en.wikipedia.org/wiki/Makemake', diameter: "63px", color: "#f5dca9"}, position :{ x : 300, y : 600}},
	{data: {id: 30,planet: 'Charon',image: 'assets/2pg.svg',type: "moon",url: 'https://en.wikipedia.org/wiki/Charon_(moon)', diameter: "56px", color: "#2e2e2e"}, position :{ x : 400, y : 600}}
  ],
  
edges: [
    {data: {id: 102,path: 'From Mercury to Venus',source: 1,target: 2,color: "#424242"}}, 
	{data: {id: 201,path: 'From Venus to Mercury',source: 2,target: 1,color: "#424242"}}, 
	{data: {id: 203,path: 'From Venus to Earth',source: 2,target: 3,color: "#424242"}}, 
	{data: {id: 302,path: 'From Earth to Venus',source: 3,target: 2,color: "#424242"}},
	{data: {id: 304,path: "From Earth to Moon",source: 3,target: 4,color: "#424242"}}, 
	{data: {id: 403,path: "From Moon to Earth",source: 4,target: 3,color: "#424242"}}, 
	{data: {id: 305,path: "From Earth to Mars",source: 3,target: 5,color: "#424242"}}, 
	{data: {id: 503,path: "From Mars to Earth",source: 5,target: 3,color: "#424242"}}, 
	{data: {id: 506,path: 'From Mars to Jupiter',source: 5,target: 6,color: "#424242"}},
	{data: {id: 605,path: 'From Jupiter to Mars',source: 6,target: 5,color: "#424242"}},
    {data: {id: 607,path: 'From Jupiter to Io',source: 6,target: 7,color: "#424242"}}, 
	{data: {id: 706,path: 'From Io to Jupiter',source: 7,target: 6,color: "#424242"}}, 
	{data: {id: 608,path: 'From Jupiter to Europa',source: 6,target: 8,color: "#424242"}}, 
	{data: {id: 806,path: 'From Europa to Jupiter',source: 8,target: 6,color: "#424242"}},
	{data: {id: 609,path: 'From Jupiter to Ganymede',source: 6,target: 9,color: "#424242"}},
	{data: {id: 906,path: 'From Ganymede to Jupiter',source: 9,target: 6,color: "#424242"}}, 	
	{data: {id: 6010,path: 'From Jupiter to Callisto',source: 6,target: 10,color: "#424242"}}, 
	{data: {id: 1006,path: 'From Callisto to Jupiter',source: 10,target: 6,color: "#424242"}},
	{data: {id: 6011,path: 'From Jupiter to Saturn',source: 6,target: 11 ,color: "#424242"}},
	{data: {id: 1106,path: 'From Saturn to Jupiter',source: 11,target: 6 ,color: "#424242"}},
	{data: {id: 11012,path: 'From Saturn to Titan',source: 11,target: 12,color: "#424242"}},
	{data: {id: 12011,path: 'From Titan to Saturn',source: 12,target: 11,color: "#424242"}},
	{data: {id: 11013,path: 'From Saturn to Rhea',source: 11,target: 13,color: "#424242"}},
	{data: {id: 13011,path: 'From Rhea to Saturn',source: 13,target: 11,color: "#424242"}},
	{data: {id: 11014,path: 'From Saturn to Iapetus',source: 11,target: 14,color: "#424242"}},
	{data: {id: 14011,path: 'From Iapetus to Saturn',source: 14,target: 11,color: "#424242"}},
	{data: {id: 11015,path: 'From Saturn to Dione',source: 11,target: 15,color: "#424242"}},
	{data: {id: 15011,path: 'From Dione to Saturn',source: 15,target: 11,color: "#424242"}},
	{data: {id: 11016,path: 'From Saturn to Tethys',source: 11,target: 16,color: "#424242"}},
	{data: {id: 16011,path: 'From Tethys to Saturn',source: 16,target: 11,color: "#424242"}},
	{data: {id: 11017,path: 'From Saturn to Enceladus',source: 11,target: 17,color: "#424242"}},
	{data: {id: 17011,path: 'From Enceladus to Saturn',source: 17,target: 11,color: "#424242"}},
	{data: {id: 11018,path: 'From Saturn to Mimas',source: 11,target: 18,color: "#424242"}},
	{data: {id: 18011,path: 'From Mimas to Saturn',source: 18,target: 11,color: "#424242"}},
	{data: {id: 11019,path: 'From Saturn to Uranus',source: 11,target: 19,color: "#424242"}},
	{data: {id: 19011,path: 'From Uranus to Saturn',source: 19,target: 11,color: "#424242"}},
	{data: {id: 19020,path: 'From Uranus to Titania',source: 19,target: 20,color: "#424242"}},
	{data: {id: 20019,path: 'From Titania to Uranus',source: 20,target: 19,color: "#424242"}},
	{data: {id: 19021,path: 'From Uranus to Oberon',source: 19,target: 21,color: "#424242"}},
	{data: {id: 21019,path: 'From Uranus to Oberon',source: 21,target: 19,color: "#424242"}},
	{data: {id: 19022,path: 'From Uranus to Ariel',source: 19,target: 22,color: "#424242"}},
	{data: {id: 22019,path: 'From Ariel to Uranus',source: 22,target: 19,color: "#424242"}},
	{data: {id: 19023,path: 'From Uranus to Umbriel',source: 19,target: 23,color: "#424242"}},
	{data: {id: 23019,path: 'From Umbriel to Uranus',source: 23,target: 19,color: "#424242"}},
	{data: {id: 19024,path: 'From Uranus to Miranda',source: 19,target: 24,color: "#424242"}},
	{data: {id: 24019,path: 'From Miranda to Uranus',source: 24,target: 19,color: "#424242"}},
	{data: {id: 19025,path: 'From Uranus to Neptune',source: 19,target: 25,color: "#424242"}},
	{data: {id: 25019,path: 'From Neptune to Uranus',source: 25,target: 19,color: "#424242"}},
	{data: {id: 25026,path: 'From Neptune to Triton',source: 25,target: 26,color: "#424242"}},
	{data: {id: 26025,path: 'From Triton to Neptune',source: 26,target: 27,color: "#424242"}},
	{data: {id: 25027,path: 'From Neptune to Pluto',source: 25,target: 27,color: "#424242"}},
	{data: {id: 27025,path: 'From Pluto to Neptune',source: 27,target: 25,color: "#424242"}},
	{data: {id: 27028,path: 'From Pluto to Eris',source: 27,target: 28,color: "#424242"}},
	{data: {id: 28027,path: 'From Eris to Pluto',source: 28,target: 27,color: "#424242"}},
	{data: {id: 27029,path: 'From Pluto to Makemake',source: 27,target: 29,color: "#424242"}},
	{data: {id: 29027,path: 'From Makemake to Pluto',source: 29,target: 27,color: "#424242"}},
	{data: {id: 27030,path: 'From Pluto to Charon',source: 27,target: 30,color: "#424242"}},
	{data: {id: 30027,path: 'From Charon to Pluto',source: 30,target: 27,color: "#424242"}}	
  ]
};