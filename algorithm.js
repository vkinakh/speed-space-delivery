function CheckInputData(planets, path, ships)
{
	if (planets.length == 0)
		return 0;
	if (path.length == 0)
		return 0;
	if (ships.length == 0)
		return 0;
	return 1;
}

function TripCost(consumption, weight, fuelPrice)
{
	var cost = consumption * weight * fuelPrice;
	cost += (0.3 * cost);//накрутка
	return cost;
}

function IndexInArrayByName(array, data)
{
	var index;
	for (var i = 0;i < array.length; i++)
	{
		if (array[i].data.name == data)
			{
				index = i;
				break;
			}
	}
	return index;
}

function BaseShuttleExistence(nameA, conteiner, mainShips)
{
	
	//check existence ships on this main planet 
	var freeships = [];
	for(var i = 0; i < mainShips.length; i++)
	{
		if (mainShips[i].location == nameA)
			if (mainShips[i].planetClass == "main")
				if (mainShips[i].available == "yes")
					if (mainShips[i].capacity >= conteiner.weight)
						if (mainShips[i].volume >= conteiner.volume)
							freeships.push(mainShips[i]);
	}
	if (freeships.length != 0)
	{
		//free ships are on this main planet
		return freeships;
	}	

	//free ships on this main planet dont exist
	return 0;
	
}


function FormGraph(mainPlanets, mainPath)
{
	var graph = [];
	for(var i = 0;i < mainPlanets.length; ++i)
	{
		var tempArr = [];
		var tempName = mainPlanets[i].data.name;
		for(var j = 0;j < mainPath.length; ++j)
		{
			if (mainPath[j].data.source == tempName)
			{
				var x;
				for(var z = 0;z < mainPlanets.length;z++)
				{
					if (mainPlanets[z].data.name == mainPath[j].data.target)
						{
							x = z;
							break;
						}
				}
				tempArr.push({to : x, weight : mainPath[j].data.weight});
			}
			if (mainPath[j].data.target == tempName)
			{
				var x;
				for(var z = 0;z < mainPlanets.length;z++)
				{
					if (mainPlanets[z].data.name == mainPath[j].data.source)
						{
							x = z;
							break;
						}
				}
				tempArr.push({to : x, weight : mainPath[j].data.weight});
			}
		}
		graph.push(tempArr);
	}

	return graph;
}

function LevitAlgorithm(mainPlanets, mainPath, nameA, nameB)
{
	var g = FormGraph(mainPlanets, mainPath);
	var v1, v2;

	for(var i = 0;i < mainPlanets.length;i++)
	{
		if (mainPlanets[i].data.name == nameA)
			v1 = i;
		if (mainPlanets[i].data.name == nameB)
			v2 = i;
	}

	var inf = Number.MAX_VALUE;
	var n = g.length;
	
	var d = [];
	for(var i = 0;i < n; i++)
		d.push(inf);
	d[v1] = 0;


	var id = [];
	for(var i = 0;i < n; i++)
		id.push(0);

	var q = [];
	q.push(v1);

	var p = [];
	for(var i = 0;i < n; i++)
		p.push(-1);


	while(q.length != 0)
	{
		var v = q[0];
		q.shift();
		id[v] = 1;

		for(var i = 0;i < g[v].length; i++)
		{
			var to = g[v][i].to;
			var len = g[v][i].weight;
			if (d[to] > d[v] + len)
			{
				d[to] = d[v] + len;
				if (id[to] == 0)
					q.push(to);
				else if (id[to] == 1)
					q.unshift(to);
				p[to] = v;
				id[to] = 1;
			}
		}
	}

	var minWeigth = d[v2];
	var minPath = [];
	if (p[v2] != -1)
	{	
			//rebuilding mimimal path by planets names
			var i = v2;
			minPath.unshift(mainPlanets[v2].data.name);
			while (p[i] != v1)
			{
				minPath.unshift(mainPlanets[ p[i] ].data.name);
				i = p[i];
			}
			minPath.unshift(mainPlanets[v1].data.name);

			//return results
			var result = [];
			result.push(minWeigth);
			result.push(minPath);
			return result;
	}
	else
	{
		return "This rout doesnt exist";
	}

}

function NextSet(arr, n)
{
	
  var j = n - 2;
  while (j != -1 && arr[j] >= arr[j + 1]) j--;
  if (j == -1)
    return 0; // more sets dont exist
  var k = n - 1;
  while (arr[j] >= arr[k]) k--;

  var temp = arr[j];
  arr[j] = arr[k];
  arr[k] = temp;

  var l = j + 1;
  var r = n - 1; // sort last part of set
  while (l<r)
    {
    	temp = arr[l];
        arr[l] = arr[r];
        arr[r] = temp;
    	l++;
    	r--;
    }
  return arr;

}

function AllCombinations(n)
{
	var combinations = [];
	var tempCombination = [];
	for(var i = 0; i < n; i++)
		tempCombination.push(i);
	combinations.push(tempCombination);
	tempCombination = NextSet(tempCombination,n);
	while(Array.isArray(tempCombination))
	{
		combinations.push(tempCombination);
		tempCombination = NextSet(tempCombination,n);
	}
	return combinations;
}

function LengthPathCombination(combination, conteiner,mainPlanets, mainPath)
{
	var len = 0;
	var temp = LevitAlgorithm(mainPlanets, mainPath, conteiner.from, conteiner.to[ combination[0] ]);

	if ( !(Array.isArray(temp)) )
	{
		return temp;//path doesnt exist
	}

	len += temp[0];
	for(var i = 1; i < combination.length; ++i)
	{
		temp = LevitAlgorithm(mainPlanets, mainPath, conteiner.to[ combination[i-1] ], conteiner.to[ combination[i] ]);

		if ( !(Array.isArray(temp)) )
		{
			return temp;//path doesnt exist
		}

		len += temp[0];
	}
	return len;
}

function OptimalPath(mainPlanets,mainPath,conteiner)
{
	var n = conteiner.to.length;
	var lengthsOfPathInCombinations = [];
	var combinations = AllCombinations(n);
	for(var i = 0; i < combinations.length;++i)
	{
		var temp = LengthPathCombination(combinations[i] , conteiner, mainPlanets, mainPath);

		if (typeof temp === "string") 
			return temp;//path doesnt exist

		lengthsOfPathInCombinations.push( temp );
	}
	var indexMin = 0;
	for(var i = 1; i < lengthsOfPathInCombinations.length; ++i)
	{
		if (lengthsOfPathInCombinations[i] < lengthsOfPathInCombinations[ indexMin ])
			indexMin = i;
	}
	return combinations[indexMin];

}

function LengthAndPlanetsInOptimalPath(mainPlanets,mainPath,conteiner)
{
	var combination = OptimalPath(mainPlanets, mainPath, conteiner);

	if (typeof combination === "string")
		return combination;//path doesnt exist

	var temp = LevitAlgorithm(mainPlanets, mainPath, conteiner.from, conteiner.to[ combination[0] ]);
	var result = [];
	result.push(temp);
	for(var i = 1; i < combination.length; ++i)
	{
		temp = LevitAlgorithm(mainPlanets, mainPath, conteiner.to[ combination[i-1] ], conteiner.to[ combination[i] ]);
		result.push(temp);
	}
	return result;
}


function PriceAndTime(mainPlanets, mainPath, conteiner, freeShips, fuelPrice)
{
	var optimalPath = LengthAndPlanetsInOptimalPath(mainPlanets, mainPath, conteiner);

	if (typeof optimalPath === "string")
		return optimalPath;//path doesnt exist

	var result = [];
	for(var i = 0; i < freeShips.length; ++i)
	{
		var sections = [];
		
		for(var j = 0; j < optimalPath.length; ++j)
		{
			var tempPrice = TripCost(freeShips[i].consumption, optimalPath[j][0], fuelPrice);
			var tempTime = optimalPath[j][0] / freeShips[i].speed;
			var section = {price : tempPrice, time : tempTime, path : optimalPath[j][1]};
			sections.push(section);
		}

		var tempObject = {data : sections, shipId : freeShips[i].id};
		result.push(tempObject);
	}

	return result;
}

function Main(planets, path, ships, fuelPrice, conteiner)
{
	if (CheckInputData(planets, path, ships) == 0)
		return "Data from database isn't correct";

	var mainPlanets = [];
	for(var i = 0;i < planets.length;i++)
	{
		if (planets[i].data.planetClass == "main")
			mainPlanets.push(planets[i]);
	}
	var mainPath = [];
	for(var i = 0;i < path.length; i++)
	{
		if (planets[ IndexInArrayByName(planets,path[i].data.source) ].data.planetClass == "satellite")
			continue;
		if (planets[ IndexInArrayByName(planets,path[i].data.target) ].data.planetClass == "satellite")
			continue;
		var tempPath = {data :{source : path[i].data.source, target : path[i].data.target, weight : (path[i].data.length * path[i].data.difficulty) }};
		mainPath.push(tempPath);
	}
	var mainShips = [];
	for(var i = 0;i < ships.length; ++i)
	{
		if (ships[i].planetClass == "main")
			mainShips.push(ships[i]);
	}


	//array of free ships in freeShips
	var freeShips = BaseShuttleExistence(conteiner.from, conteiner, mainShips);
	if (freeShips == 0)
		return "Ships on this main planet don't exist or too small for this conteiner";

	var result = PriceAndTime(mainPlanets, mainPath, conteiner, freeShips, fuelPrice);

	if (typeof result === "string")
		return result;//path doesnt exist

	return result;
}

	



function Test()
{
	//data from database

	var planets = [];
	planets.push({data:{planetClass : "main", basePlanet : "Earth", name : "Earth"}});
	planets.push({data:{planetClass : "satellite", basePlanet : "Earth", name : "Moon"}});
	planets.push({data:{planetClass : "main", basePlanet : "Venus", name : "Venus"}});
	planets.push({data:{planetClass : "main", basePlanet : "Mars", name : "Mars"}});
	planets.push({data:{planetClass : "main", basePlanet : "Jupiter", name : "Jupiter"}});
	planets.push({data:{planetClass : "main", basePlanet : "Pluton", name : "Pluton"}});
	planets.push({data:{planetClass : "main", basePlanet : "Saturn", name : "Saturn"}});
	planets.push({data:{planetClass : "satellite", basePlanet : "Saturn", name : "Saturn1"}});
	planets.push({data:{planetClass : "satellite", basePlanet : "Saturn", name : "Saturn2"}});
	planets.push({data:{planetClass : "main", basePlanet : "Mercury", name : "Mercury"}});
	planets.push({data:{planetClass : "main", basePlanet : "Neptune", name : "Neptune"}});
	planets.push({data:{planetClass : "satellite", basePlanet : "Neptune", name : "Neptune1"}});
	planets.push({data:{planetClass : "main", basePlanet : "Ab", name : "Ab"}});
	planets.push({data:{planetClass : "main", basePlanet : "Kek", name : "Kek"}});
	planets.push({data:{planetClass : "main", basePlanet : "Ka", name : "Ka"}});
	planets.push({data:{planetClass : "satellite", basePlanet : "Ka", name : "Ka1"}});
	planets.push({data:{planetClass : "satellite", basePlanet : "Ka", name : "Ka2"}});
	planets.push({data:{planetClass : "main", basePlanet : "La", name : "La"}});
	planets.push({data:{planetClass : "main", basePlanet : "Portal", name : "Portal"}});
	planets.push({data:{planetClass : "main", basePlanet : "Z", name : "Z"}});
	planets.push({data:{planetClass : "satellite", basePlanet : "Z", name : "Z1"}});
	planets.push({data:{planetClass : "main", basePlanet : "Lol", name : "Lol"}});
	planets.push({data:{planetClass : "main", basePlanet : "Sun", name : "Sun"}});
	planets.push({data:{planetClass : "main", basePlanet : "Ma", name : "Ma"}});
	planets.push({data:{planetClass : "satellite", basePlanet : "Ma", name : "Ma1"}});
	planets.push({data:{planetClass : "main", basePlanet : "Tu", name : "Tu"}});
	planets.push({data:{planetClass : "main", basePlanet : "Maslo", name : "Maslo"}});
	planets.push({data:{planetClass : "main", basePlanet : "Q", name : "Q"}});
	planets.push({data:{planetClass : "satellite", basePlanet : "Q", name : "Q1"}});
	planets.push({data:{planetClass : "satellite", basePlanet : "Q", name : "Q2"}});
	planets.push({data:{planetClass : "main", basePlanet : "Dupa", name : "Dupa"}});
	planets.push({data:{planetClass : "main", basePlanet : "Mix", name : "Mix"}});
	planets.push({data:{planetClass : "main", basePlanet : "Pih", name : "Pih"}});
	planets.push({data:{planetClass : "satellite", basePlanet : "Pih", name : "Pih1"}});
	planets.push({data:{planetClass : "satellite", basePlanet : "Pih", name : "Pih2"}});
	planets.push({data:{planetClass : "satellite", basePlanet : "Pih", name : "Pih3"}});
	planets.push({data:{planetClass : "main", basePlanet : "Ser", name : "Ser"}});
	planets.push({data:{planetClass : "main", basePlanet : "Am", name : "Am"}});
	planets.push({data:{planetClass : "main", basePlanet : "Frukt", name : "Frukt"}});
	planets.push({data:{planetClass : "main", basePlanet : "Lis", name : "Lis"}});
	planets.push({data:{planetClass : "satellite", basePlanet : "Lis", name : "Lis1"}});

	var path = [];
	path.push({data: {source: "Earth",target: "Pluton",length : 15,difficulty : 3}});
	path.push({data: {source: "Earth",target: "Moon",length : 1,difficulty : 2}});
	path.push({data: {source: "Earth",target: "Mars",length : 16,difficulty : 4}});
	path.push({data: {source: "Earth",target: "Neptune",length : 20,difficulty : 3}});
	path.push({data: {source: "Neptune",target: "Neptune1",length : 4,difficulty : 2}});
	path.push({data: {source: "Mars",target: "Venus",length : 19,difficulty : 4}});
	path.push({data: {source: "Mars",target: "Jupiter",length : 17,difficulty : 3}});
	path.push({data: {source: "Jupiter",target: "Saturn",length : 18,difficulty : 2}});
	path.push({data: {source: "Saturn",target: "Saturn1",length : 2,difficulty : 4}});
	path.push({data: {source: "Saturn",target: "Saturn2",length : 3,difficulty : 3}});
	path.push({data: {source: "Saturn",target: "Mercury",length : 21,difficulty : 2}});
	path.push({data: {source: "Mercury",target: "Neptune",length : 22,difficulty : 4}});
	path.push({data: {source: "Neptune",target: "Ka",length : 24,difficulty : 3}});
	path.push({data: {source: "Ka",target: "Ka1",length : 5,difficulty : 2}});
	path.push({data: {source: "Ka",target: "Ka2",length : 6,difficulty : 4}});
	path.push({data: {source: "Ka",target: "Ab",length : 25,difficulty : 3}});
	path.push({data: {source: "Ab",target: "Kek",length : 27,difficulty : 2}});
	path.push({data: {source: "Kek",target: "Portal",length : 28,difficulty : 4}});
	path.push({data: {source: "Portal",target: "Am",length : 30,difficulty : 3}});
	path.push({data: {source: "Am",target: "Lis",length : 42,difficulty : 2}});
	path.push({data: {source: "Lis",target: "Lis1",length : 8,difficulty : 4}});
	path.push({data: {source: "Lis",target: "Ser",length : 44,difficulty : 3}});
	path.push({data: {source: "Ser",target: "Frukt",length : 43,difficulty : 2}});
	path.push({data: {source: "Ab",target: "Z",length : 26,difficulty : 4}});
	path.push({data: {source: "Z",target: "Z1",length : 7,difficulty : 3}});
	path.push({data: {source: "Z",target: "Lol",length : 31,difficulty : 2}});
	path.push({data: {source: "Lol",target: "Ser",length : 41,difficulty : 4}});
	path.push({data: {source: "Lol",target: "Mix",length : 40,difficulty : 4}});
	path.push({data: {source: "Mix",target: "Dupa",length : 45,difficulty : 3}});
	path.push({data: {source: "Dupa",target: "Q",length : 47,difficulty : 2}});
	path.push({data: {source: "Q",target: "Q1",length : 10,difficulty : 4}});
	path.push({data: {source: "Q",target: "Q2",length : 11,difficulty : 4}});
	path.push({data: {source: "Q",target: "Maslo",length : 48,difficulty : 3}});
	path.push({data: {source: "Maslo",target: "Tu",length : 38,difficulty : 2}});
	path.push({data: {source: "Ma",target: "Ma1",length : 9,difficulty : 4}});
	path.push({data: {source: "Pih",target: "Pih1",length : 12,difficulty : 3}});
	path.push({data: {source: "Pih",target: "Pih2",length : 13,difficulty : 2}});
	path.push({data: {source: "Pih",target: "Pih3",length : 14,difficulty : 4}});
	path.push({data: {source: "Neptune",target: "La",length : 23,difficulty : 4}});
	path.push({data: {source: "Z",target: "Frukt",length : 29,difficulty : 3}});
	path.push({data: {source: "Ka",target: "Lol",length : 32,difficulty : 3}});
	path.push({data: {source: "Ka",target: "Pih",length : 33,difficulty : 3}});
	path.push({data: {source: "Ka",target: "Sun",length : 34,difficulty : 3}});
	path.push({data: {source: "La",target: "Sun",length : 35,difficulty : 3}});
	path.push({data: {source: "La",target: "Ma",length : 36,difficulty : 3}});
	path.push({data: {source: "Ma",target: "Tu",length : 37,difficulty : 3}});
	path.push({data: {source: "Sun",target: "Q",length : 39,difficulty : 3}});
	path.push({data: {source: "Pih",target: "Q",length : 46,difficulty : 3}});


	var ships = [];
	ships.push({id:1, location : "Earth", capacity : 50, volume : 1000, speed : 100, consumption : 10, planetClass : "main", available : "yes"});
	//ships.push({id:2, location : "Earth", capacity : 40, volume : 6000, speed : 250, consumption : 50, planetClass : "main", available : "yes"});
	ships.push({id:4, location : "Venus", capacity : 70, volume : 2000, speed : 70, consumption : 15, planetClass : "main", available : "yes"});

	ships.push({id:3, location : "Earth", capacity : 20, volume : 500, speed : 50, consumption : 5, planetClass : "satellite", available : "yes"});
	ships.push({id:5, location : "Neptune", capacity : 100, volume : 5000, speed : 20, consumption : 20, planetClass : "satellite", available : "yes"});
	ships.push({id:6, location : "Pih", capacity : 35, volume : 450, speed : 150, consumption : 12, planetClass : "satellite", available : "yes"});
	ships.push({id:7, location : "Q", capacity : 35, volume : 450, speed : 150, consumption : 12, planetClass : "satellite", available : "yes"});
	ships.push({id:8, location : "Z", capacity : 35, volume : 450, speed : 150, consumption : 12, planetClass : "satellite", available : "yes"});
	ships.push({id:9, location : "Ma", capacity : 35, volume : 450, speed : 150, consumption : 12, planetClass : "satellite", available : "yes"});
	ships.push({id:10, location : "Saturn", capacity : 35, volume : 450, speed : 150, consumption : 12, planetClass : "satellite", available : "yes"});
	ships.push({id:11, location : "Ka", capacity : 35, volume : 450, speed : 150, consumption : 12, planetClass : "satellite", available : "yes"});
	ships.push({id:12, location : "Lis", capacity : 35, volume : 450, speed : 150, consumption : 12, planetClass : "satellite", available : "yes"});



	var fuelPrice = 10;
	var destinations = [];
	destinations.push("La");
	destinations.push("Saturn");
	destinations.push("Kek");
	destinations.push("Mix");
	destinations.push("Frukt");
	destinations.push("Q");
	destinations.push("Am");
	//destinations.push("Venus");
	//destinations.push("Lol");
	//destinations.push("Pih");

	var conteiner = {from : "Earth", to : destinations, weight : 20, volume : 200};






	var temp = Main(planets, path, ships, fuelPrice, conteiner);
	if (Array.isArray(temp))
	{
		var select = document.getElementById("insertHere");
			
		for(var i=0;i < temp.length;i++)
		{
			p = document.createElement("p");
			p.innerHTML = "ShipId: " + temp[i].shipId + ":";
			select.appendChild(p);

			for(var j = 0; j < temp[i].data.length; ++j)
			{
				p = document.createElement("p");
				p.innerHTML = "time: " + temp[i].data[j].time + " price: " + temp[i].data[j].price;
				select.appendChild(p);

				for(var z = 0; z < temp[i].data[j].path.length; ++z)
				{
					p = document.createElement("p");
					p.innerHTML = temp[i].data[j].path[z];
					select.appendChild(p);
				}
			}
		}
	}
	else
	{
		var select = document.getElementById("insertHere");
		var p = document.createElement("p");
		p.value = i;
		p.innerHTML = temp;
		select.appendChild(p);
	}
	
	
}