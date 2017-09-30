// based on https://en.wikipedia.org/wiki/Glycolysis

var GlyElements = {
  nodes: [
    {
      data: {
        id: 0,
		planet: "Sun",
        image: 'assets/glucose.svg',
        url: 'https://en.wikipedia.org/wiki/Sun'
      }
    }, {
      data: {
        id: 1,
		planet: "Mercury",
        image: 'assets/g6p.svg',
        url: 'https://en.wikipedia.org/wiki/Glucose_6-phosphate'
      }
    }, {
      data: {
        id: 2,
        planet: "Venus",
        image: 'assets/f6p.svg',
        url: 'https://en.wikipedia.org/wiki/Venus'
      }
    }, {
      data: {
        id: 3,
        planet: "Earth",
        image: 'assets/f16bp.svg',
        url: 'https://en.wikipedia.org/wiki/Earth'
      }
    },
    {
      data: {
        id: 4,
        planet: "Moon",
        image: 'assets/gadp.svg',
        url: 'https://en.wikipedia.org/wiki/Moon'
      }
    }, {
      data: {
        id: 5,
        planet: "Mars",
        image: 'assets/dhap.svg',
        url: 'https://en.wikipedia.org/wiki/Mars'
      }
    }, {
      data: {
        id: 6,
        planet: "Jupiter",
        image: 'assets/13bpg.svg',
        url: 'https://en.wikipedia.org/wiki/Jupiter'
      }
    }, {
      data: {
        id: 7,
        planet: "Io",
        image: 'assets/3pg.svg',
        url: 'https://en.wikipedia.org/wiki/Io_(moon)'
      }
    }, {
      data: {
        id: 8,
        planet: "Europa",
        image: 'assets/2pg.svg',
        url: 'https://en.wikipedia.org/wiki/Europa_(moon)'
      }
    }, {
      data: {
        id: 9,
        planet: "Ganymede",
        image: 'assets/pep.svg',
        url: 'https://en.wikipedia.org/wiki/Ganymede_(moon)'
      }
    }, {
      data: {
        id: 10,
        planet: 'Callisto',
        image: 'assets/pyruvate.svg',
        url: 'https://en.wikipedia.org/wiki/Callisto_(moon)'
      }
    },{
      data: {
        id: 11,
        planet: 'Saturn',
        image: 'assets/pyruvate.svg',
        url: 'https://en.wikipedia.org/wiki/Saturn'
      }
    },{
      data: {
        id: 12,
        planet: 'Titan',
        image: 'assets/pyruvate.svg',
        url: 'https://en.wikipedia.org/wiki/Titan_(moon)'
      }
    },{
      data: {
        id: 13,
        planet: 'Rhea',
        image: 'assets/pyruvate.svg',
        url: 'https://en.wikipedia.org/wiki/Rhea_(moon)'
      }
    },{
      data: {
        id: 14,
        planet: 'Iapetus',
        image: 'assets/pyruvate.svg',
        url: 'https://en.wikipedia.org/wiki/Iapetus_(moon)'
      }
    },{
      data: {
        id: 15,
        planet: 'Dione',
        image: 'assets/pyruvate.svg',
        url: 'https://en.wikipedia.org/wiki/Dione_(moon)'
      }
    },{
      data: {
        id: 16,
        planet: 'Tethys',
        image: 'assets/pyruvate.svg',
        url: 'https://en.wikipedia.org/wiki/Tethys_(moon)'
      }
    },{
      data: {
        id: 17,
        planet: 'Enceladus',
        image: 'assets/pyruvate.svg',
        url: 'https://en.wikipedia.org/wiki/Enceladus'
      }
    },{
      data: {
        id: 18,
        planet: 'Mimas',
        image: 'assets/pyruvate.svg',
        url: 'https://en.wikipedia.org/wiki/Mimas_(moon)'
      }
    },{
      data: {
        id: 19,
        planet: 'Uranus',
        image: 'assets/pyruvate.svg',
        url: 'https://en.wikipedia.org/wiki/Uranus'
      }
    },{
      data: {
        id: 20,
        planet: 'Titania',
        image: 'assets/pyruvate.svg',
        url: 'https://en.wikipedia.org/wiki/Titania_(moon)'
      }
    },{
      data: {
        id: 21,
        planet: 'Oberon',
        image: 'assets/pyruvate.svg',
        url: 'https://en.wikipedia.org/wiki/Oberon_(moon)'
      }
    },{
      data: {
        id: 22,
        planet: 'Ariel',
        image: 'assets/pyruvate.svg',
        url: 'https://en.wikipedia.org/wiki/Ariel_(moon)'
      }
    },{
      data: {
        id: 23,
        planet: 'Umbriel',
        image: 'assets/pyruvate.svg',
        url: 'https://en.wikipedia.org/wiki/Umbriel_(moon)'
      }
    },{
      data: {
        id: 24,
        planet: 'Miranda',
        image: 'assets/pyruvate.svg',
        url: 'https://en.wikipedia.org/wiki/Miranda_(moon)'
      }
    },{
      data: {
        id: 25,
        planet: 'Neptune',
        image: 'assets/pyruvate.svg',
        url: 'https://en.wikipedia.org/wiki/Neptune'
      }
    },{
      data: {
        id: 26,
        planet: 'Triton',
        image: 'assets/pyruvate.svg',
        url: 'https://en.wikipedia.org/wiki/Triton_(moon)'
      }
    },
	
	{
      data: {
        id: 27,
        planet: 'Pluto',
        image: 'assets/pyruvate.svg',
        url: 'https://en.wikipedia.org/wiki/Pluto'
      }
    },{
	  data: {
        id: 28,
        planet: 'Eris',
        image: 'assets/pyruvate.svg',
        url: 'https://en.wikipedia.org/wiki/Eris_(dwarf_planet)'
      }
	},
	{
	  data: {
        id: 29,
        planet: 'Makemake',
        image: 'assets/pyruvate.svg',
        url: 'https://en.wikipedia.org/wiki/Makemake'
      }
	},
	{
	  data: {
        id: 30,
        planet: 'Charon',
        image: 'assets/pyruvate.svg',
        url: 'https://en.wikipedia.org/wiki/Charon_(moon)'
      }
	}
  ],
  edges: [
    {
      data: {
        id: 123,
        path: 'From Mercury to Venus',
        source: 1,
        target: 2
      }
    }, {
      data: {
        id: 234,
        path: 'From Venus to Earth',
        source: 2,
        target: 3
      }
    }, {
      data: {
        id: 34,
        path: "From Earth to Moon",
        source: 3,
        target: 4
      }
    }, {
      data: {
        id: 35,
        path: "From Earth to Mars",
        source: 3,
        target: 5
      }
    }, {
      data: {
        id: 56,
        path: 'From Mars to Jupiter',
        source: 5,
        target: 6
      }
    },
    {
      data: {
        id: 67,
        path: 'From Jupiter to Io',
        source: 6,
        target: 7
      }
    }, {
      data: {
        id: 68,
        path: 'From Jupiter to Europa',
        source: 6,
        target: 8
      }
    }, {
      data: {
        id: 69,
        path: 'From Jupiter to Ganymede',
        source: 6,
        target: 9
      }
    }, {
      data: {
        id: 610,
        path: 'From Jupiter to Callisto',
        source: 6,
        target: 10
      }
    }, {
      data: {
        id: 611,
        path: 'From Jupiter to Saturn',
        source: 6,
        target: 11
      }
    }, {
      data: {
        id: 1112,
        path: 'From Saturn to Titan',
        source: 11,
        target: 12
      }
    },{
      data: {
        id: 1113,
        path: 'From Saturn to Rhea',
        source: 11,
        target: 13
      }
    },{
      data: {
        id: 1114,
        path: 'From Saturn to Iapetus',
        source: 11,
        target: 14
      }
    },{
      data: {
        id: 1115,
        path: 'From Saturn to Dione',
        source: 11,
        target: 15
      }
    },{
      data: {
        id: 1116,
        path: 'From Saturn to Tethys',
        source: 11,
        target: 16
      }
    },
	{
      data: {
        id: 1117,
        path: 'From Saturn to Enceladus',
        source: 11,
        target: 17
      }
    },
	{
      data: {
        id: 1118,
        path: 'From Saturn to Mimas',
        source: 11,
        target: 18
      }
    },
	{
      data: {
        id: 1119,
        path: 'From Saturn to Uranus',
        source: 11,
        target: 19
      }
    },{
	 data: {
        id: 1920,
        path: 'From Uranus to Titania',
        source: 19,
        target: 20
      }
    },{
	 data: {
        id: 1921,
        path: 'From Uranus to Oberon',
        source: 19,
        target: 21
      }
    },{
	 data: {
        id: 1922,
        path: 'From Uranus to Ariel',
        source: 19,
        target: 22
      }
    },
	{
	 data: {
        id: 1923,
        path: 'From Uranus to Umbriel',
        source: 19,
        target: 23
      }
    },{
	 data: {
        id: 1924,
        path: 'From Uranus to Miranda',
        source: 19,
        target: 24
      }
    },
	{
	  data: {
        id: 1925,
        path: 'From Uranus to Neptune',
        source: 19,
        target: 25
      }
	},{
	  data: {
        id: 2526,
        path: 'From Neptune to Triton',
        source: 25,
        target: 26
      }
	},{
	  data: {
        id: 2527,
        path: 'From Neptune to Pluto',
        source: 25,
        target: 27
      }
	},
	{
	  data: {
        id: 2728,
        path: 'From Pluto to Eris',
        source: 27,
        target: 28
      }
	},{
	  data: {
        id: 2728,
        path: 'From Pluto to Eris',
        source: 27,
        target: 28
      }
	},{
	  data: {
        id: 2729,
        path: 'From Pluto to Makemake',
        source: 27,
        target: 29
      }
	},{
	  data: {
        id: 2730,
        path: 'From Pluto to Charon',
        source: 27,
        target: 30
      }
	}
	
	
	
	
	
  ]
};
