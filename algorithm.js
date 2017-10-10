
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



function TripCost(consumption, length, fuelPrice,  difficulty )
{
	var cost = consumption * length * fuelPrice * difficulty;
	cost += (0.3 * cost);//накрутка
	return cost;
}

function ExistenceOfItems(nameA, nameB, planets)
{
	var ptr1 = 0;
	var ptr2 = 0;
	for (var i = 0; i < planets.length; i++)
	{
			if (planets[i].data.name == nameA)
				ptr1 = 1;
			if (planets[i].data.name == nameB)
				ptr2 = 1;
	}
	return (ptr1 && ptr2);
}

function InequalityItems(nameA, nameB)
{
	if (nameA != nameB)
		return 1;
	else 
		return 0;
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

function IsSatellite(data, planets, ships,request, path)
{
	var numberInArray = IndexInArrayByName(planets,data);
	

	//check if start planet is satellite
	if (planets[numberInArray].data.planetClass == "satellite")
	{
		var basePlanet = planets[numberInArray].data.basePlanet;

		//check if base planet for this satellite exists
		var ptrExistence = 0;
		for (var i = 0;i < planets.length; i++)
		{
			if (planets[i].data.name == basePlanet)
				{
					ptrExistence = 1;
					break;
				}
		}
		if (ptrExistence != 1)
			return "Base planet for satellite doesn't exist1";

		//check if path between satellite and base planet for satellite exist
		ptrExistence = 0;
		for(var i = 0; i < path.length; i++)
		{
			if (path[i].data.source == data && path[i].data.target == basePlanet)
			{
				ptrExistence = 1;
				break;
			}
			if (path[i].data.target == data && path[i].data.source == basePlanet)
			{
				ptrExistence = 1;
				break;
			}
		}
		if (ptrExistence != 1)
			return "Path between satellite and base planet doesn't exist1.1";
		//check if base planet has a shuttle for satellites(enought big for request)
		ptrExistence = 0;
		var freeSatelliteships = [];
		for (var i = 0; i < ships.length; i++)
		{
			if (ships[i].location == basePlanet)
				if (ships[i].planetClass == "satellite")
					if (ships[i].capacity >= request.weight)
						if (ships[i].volume >= request.volume)
							{
								ptrExistence = 1;
								freeSatelliteships.push(ships[i]);
							}
		}
		if (ptrExistence != 1)
			return "Shuttle on base planet for satellites doesn't exist or your request is too big for this satellite shuttle2";

		return freeSatelliteships;
	}
	else
		return 0;

}

function IsBSatelliteForThisMain(request, planets, ships,path)
{
	var numberInArrayB = IndexInArrayByName(planets, request.to);
	//A is main planet

		//check if B is satellite for this main planet
		if (planets[numberInArrayB].data.planetClass == "satellite")
			{
				if (planets[numberInArrayB].data.basePlanet == request.from)
				{
					//check if path between satellite and base planet for satellite exist
					var ptrExistence = 0;
					for(var i = 0; i < path.length; i++)
					{
						if (path[i].data.source == request.to && path[i].data.target == request.from)
						{
							ptrExistence = 1;
							break;
						}
						if (path[i].data.target == request.from && path[i].data.source == request.to)
						{
							ptrExistence = 1;
							break;
						}
					}
					if (ptrExistence != 1)
						return "Path between satellite and base planet doesn't exist2.1";

					//check if exist satellite shuttle on A(big enought)
					ptrExistence = 0;
					var freeSatelliteships = [];
					for (var i = 0; i < ships.length; i++)
					{
						if (ships[i].location == request.from)
							if (ships[i].planetClass == "satellite")
								if (ships[i].capacity >= request.weight)
									if (ships[i].volume >= request.volume)
									{
										ptrExistence = 1;
										freeSatelliteships.push(ships[i]);
									}
					}
					if (ptrExistence != 1)
						return "Shuttle on base planet for satellites doesn't exist or your request is too big for this satellite shuttle3";

					return freeSatelliteships;
				}
				else
					return 0;
			}
		else
			return 0;	
}


function BaseShuttleExistence(nameA,request, planets, ships)
{
	
	//check existence ships on this main planet 
	var freeships = [];
	for(var i = 0; i < ships.length; i++)
	{
		if (ships[i].location == nameA)
			if (ships[i].planetClass == "main")
				if (ships[i].available == "yes")
					if (ships[i].capacity >= request.weight)
						if (ships[i].volume >= request.volume)
							freeships.push(ships[i]);
	}
	if (freeships.length != 0)
	{
		//free ships are on this main planet
		return freeships;
	}	

	//free ships on this main planet dont exist
	return 0;
	
}


function FormGraph(planets, path)
{
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
		mainPath.push(path[i]);
	}
	graph = [];
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
				tempArr.push({to : x, length : mainPath[j].data.length});
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
				tempArr.push({to : x, length : mainPath[j].data.length});
			}
		}
		graph.push(tempArr);
	}

	return graph;
}

function LevitAlgorithm(planets, path, nameA, nameB)
{
	var g = FormGraph(planets, path);
	var v1, v2;

	var mainPlanets = [];
	for(var i = 0;i < planets.length;i++)
	{
		if (planets[i].data.planetClass == "main")
			mainPlanets.push(planets[i]);
	}
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
			var to = g[v][i].to, len = g[v][i].length;
			if (d[to] > d[v] + len)
			{
				d[to] = d[v] + len;
				if (d[to] == 0)
					q.push(to);
				else if (id[to] == 1)
					q.unshift(to);
				p[to] = v;
				
				id[to] = 1;
			}
		}
	}

	var minLength = d[v2];
	var difficulty;
	if (p[v2] != -1)
	{
		var prevV2 = mainPlanets[ p[v2] ].data.name;
		for(var i = 0;i < path.length; i++)
		{
			if (path[i].data.source == prevV2 && path[i].data.target == mainPlanets[v2].data.name)
				{
					difficulty = path[i].data.difficulty;
					break;
				}
			if (path[i].data.target == prevV2 && path[i].data.source == mainPlanets[v2].data.name)
				{
					difficulty = path[i].data.difficulty;
					break;
				}
		}

	}
	else
	{
		return "This rout doesnt exist4";
	}

	//return results
	var result = [];
	result.push(minLength);
	result.push(difficulty);
	return result;
}



function Main(planets, path, ships, fuelPrice, request)
{
	if (CheckInputData(planets, path, ships) == 0)
		return "Data from database isn't correct5";

	if (ExistenceOfItems(request.from, request.to, planets) == 0)
		return "One/both planets to delivery dont exist6";

	if (InequalityItems(request.from, request.to) == 0)
		return "Begin and end planets are the same7";

	var checkASatellite = IsSatellite(request.from, planets, ships,request,path);
	if (checkASatellite == 0) {} //A is not a satellite
	else if (Array.isArray(checkASatellite)) //A is satellite - array with free ships from satellite to base planet
	{
		//search index of path from satellite A to its base planet
		var indexPathA;
			for(var i = 0; i < path.length; i++)
			{
				if (path[i].data.source == request.from && path[i].data.target == planets[ IndexInArrayByName(planets,request.from) ].data.basePlanet)
				{
					indexPathA = i;
					break;
				}
				if (path[i].data.target == request.from && path[i].data.source == planets[ IndexInArrayByName(planets,request.from) ].data.basePlanet)
				{
					indexPathA = i;
					break;
				}
			}

		//if B is base planet for this satellite - return free satellite ships 
		if (request.to == planets[ IndexInArrayByName(planets,request.from) ].data.basePlanet)
		{
			//КОРИСТУВАЧУ ТРЕБА НАДАТИ ВИБІР З МАСИВУ ВІЛЬНИХ ШАТЛІВ
			var temp = [];
			for(var i = 0;i < checkASatellite.length; i++)
			{
				var tempTime = path[indexPathA].data.length / checkASatellite[i].speed;
				var tempPrice = TripCost(checkASatellite[i].consumption, path[indexPathA].data.length, fuelPrice, path[indexPathA].data.difficulty);
				temp.push({time : tempTime, price : tempPrice, id : checkASatellite[i].id});
			}
			return temp;/////////////////////////////////////////////////////
		}
		else
		{
			//A is a satellite so now departure from base planet to nowhere
			//then user can took one of free satellite shutles that are in checkASatellite
			var numberInArrayA = IndexInArrayByName(planets,request.from);
			var basePlanetForA = planets[numberInArrayA].data.basePlanet;

					//basePlanetForA is base planet and B is not satellite for this base planet basePlanetForA
					var checkBaseShuttle = BaseShuttleExistence(basePlanetForA,request, planets, ships);
					if (checkBaseShuttle == 0)
					{
						return "Base ships for planet basePlanetForA dont exist8";
					}
	
					//there are free ships from this main planet basePlanetForA in array checkBaseShuttle

					//check if planet B is satellite
					var checkEndSatellite = IsSatellite(request.to, planets, ships,request,path);
					if (checkEndSatellite == 0) {} //B is not a satellite
					else if (Array.isArray(checkEndSatellite)) //B is satellite - array with free ships from base planet to satellite
					{

						//search index of path from satellite B to its base planet
						var indexPathB;
						for(var i = 0; i < path.length; i++)
						{
							if (path[i].data.source == request.to && path[i].data.target == planets[ IndexInArrayByName(planets,request.to) ].data.basePlanet)
							{
								indexPathB = i;
								break;
							}
							if (path[i].data.target == request.to && path[i].data.source == planets[ IndexInArrayByName(planets,request.to) ].data.basePlanet)
							{
								indexPathB = i;
								break;
							}
						}


						//so now departure from base planet basePlanetForA to base planet that is base for satellite B
						//then user can took one of free satellite shutles that are in checkEndSatellite
							var numberInArrayB = IndexInArrayByName(planets,request.to);
							var basePlanetForB = planets[numberInArrayB].data.basePlanet;
							//basePlanetForA is base planet and basePlanetForB is base planet
							//check for existence routes

							var checkRout = LevitAlgorithm(planets, path, basePlanetForA, basePlanetForB);
							if (Array.isArray(checkRout))
							{
								var difficulty = checkRout[1];
								var minLength = checkRout[0];
								//min rout for delivery is found
								//user can took one of free ships from checkBaseShuttle
								//and then count price and time with minLength and difficulty
								//and then took one of free satellite ships from checkEndSatelites and count price and time with satelliteRoutLength
								//and took one of free satellite shuttles from checkASatellite and count price and time with satelliteRoutLength
								//КОРИСТУВАЧУ ТРЕБА НАДАТИ ВИБІР З ТРЬОХ МАСИВІВ ВІЛЬНИХ ШАТЛІВ
								var temp = [];
								for(var i = 0;i < checkBaseShuttle.length; i++)
								{
									for(var j = 0; j < checkEndSatellite.length;++j )
									{
										for(var z = 0; z < checkASatellite.length;++z )
										{
											var tempTime = minLength / checkBaseShuttle[i].speed + path[indexPathA].data.length / checkASatellite[z].speed +
											path[indexPathB].data.length / checkEndSatellite[j].speed;
											var tempPrice = TripCost(checkBaseShuttle[i].consumption, minLength, fuelPrice, difficulty) +
											TripCost(checkASatellite[z].consumption, path[indexPathA].data.length, fuelPrice, path[indexPathA].data.difficulty)+
											TripCost(checkEndSatellite[j].consumption, path[indexPathB].data.length, fuelPrice, path[indexPathB].data.difficulty);
											temp.push({time : tempTime, price : tempPrice, id : checkBaseShuttle[i].id});
										}
										
									}
					
								}
								return temp;/////////////////////////////////////////////////////
							}
							else
							{
								return checkRout;//rout doesnt exist
							}
					}
					else
					{
						return checkEndSatellite;//some problem with data
					}


					//basePlanetForA is base planet and B is base planet
					//check for existence routes

					var checkRout = LevitAlgorithm(planets, path, basePlanetForA, request.to);
					if (Array.isArray(checkRout))
					{
						var difficulty = checkRout[1];
						var minLength = checkRout[0];
						//min rout for delivery is found
						//user can took one of free ships from checkBaseShips
						//and then count price and time with minLength and difficulty
						//and then took one satellite shuttle from checkASatellite and count price and time with satelliteRoutLength
						//КОРИСТУВАЧУ ТРЕБА НАДАТИ ВИБІР З ДВОХ МАСИВІВ ВІЛЬНИХ ШАТЛІВ
						var temp = [];
						for(var i = 0;i < checkBaseShuttle.length; i++)
						{
							for(var j = 0; j < checkASatellite.length;++j )
							{
								var tempTime = minLength / checkBaseShuttle[i].speed + path[indexPathA].data.length / checkASatellite[j].speed;
								var tempPrice = TripCost(checkBaseShuttle[i].consumption, minLength, fuelPrice, difficulty) +
								TripCost(checkASatellite[j].consumption, path[indexPathA].data.length, fuelPrice, path[indexPathA].data.difficulty);
								temp.push({time : tempTime, price : tempPrice, id : checkBaseShuttle[i].id});
							}
					
						}
						return temp;/////////////////////////////////////////////////////
					}
					else
					{
						return checkRout;//rout doesnt exist
					}





		}
		
	}
	else
	{
		return checkASatellite;//some problem with data
	}







	//A is base planet

	//check if B is satellite for this main planet
	var checkBSatellite = IsBSatelliteForThisMain(request, planets, ships,path);
	if (checkBSatellite == 0) {} //B is not a satellite for this main planet
	else if (Array.isArray(checkBSatellite)) //B is satellite for this main planet - array with free ships from base planet to satellite
	{
		//search index of path from satellite B to its base planet
		var indexPathB;
		for(var i = 0; i < path.length; i++)
		{
			if (path[i].data.source == request.to && path[i].data.target == request.from)
			{
				indexPathB = i;
				break;
			}
			if (path[i].data.target == request.to && path[i].data.source == request.from)
			{
				indexPathB = i;
				break;
			}
		}

		//КОРИСТУВАЧУ ТРЕБА НАДАТИ ВИБІР З МАСИВУ ВІЛЬНИХ ШАТЛІВ
		var temp = [];
			for(var i = 0;i < checkBSatellite.length; i++)
			{
				var tempTime = path[indexPathB].data.length / checkBSatellite[i].speed;
				var tempPrice = TripCost(checkBSatellite[i].consumption, path[indexPathB].data.length, fuelPrice, path[indexPathB].data.difficulty);
				temp.push({time : tempTime, price : tempPrice, id : checkBSatellite[i].id});
			}
			return temp;/////////////////////////////////////////////////////
	}
	else
	{
		return checkBSatellite;//some problem with data
	}
	

	//A is base planet and B is not satellite for this base planet A
	var checkBaseShuttle = BaseShuttleExistence(request.from, request, planets, ships);
	if (checkBaseShuttle == 0)
	{
		return "Base ships for planet A dont exist9";
	}
	
	//there are free ships from this main planet A in array checkBaseShuttle

	//check if planet B is satellite
	var checkEndSatellite = IsSatellite(request.to, planets, ships,request,path);
	if (checkEndSatellite == 0) {} //B is not a satellite
	else if (Array.isArray(checkEndSatellite)) //B is satellite - array with free ships from base planet to satellite
	{
		//search index of path from satellite B to its base planet
		var indexPathB;
		for(var i = 0; i < path.length; i++)
		{
			if (path[i].data.source == request.to && path[i].data.target == planets[ IndexInArrayByName(planets,request.to) ].data.basePlanet)
			{
				indexPathB = i;
				break;
			}
			if (path[i].data.target == request.to && path[i].data.source == planets[ IndexInArrayByName(planets,request.to) ].data.basePlanet)
			{
				indexPathB = i;
				break;
			}
		}

		//so now departure from base planet A to base planet that is base for satellite B
		//then user can took one of free satellite shutles that are in checkEndSatellite
			var numberInArrayB = IndexInArrayByName(planets,request.to);
			var basePlanetForB = planets[numberInArrayB].data.basePlanet;
			//A is base planet and basePlanetForB is base planet
			//check for existence routes

			var checkRout = LevitAlgorithm(planets, path, request.from, basePlanetForB);
			if (Array.isArray(checkRout))
			{
				var difficulty = checkRout[1];
				var minLength = checkRout[0];
				//min rout for delivery is found
				//user can took one of free ships from checkBaseShuttle
				//and then count price and time with minLength and difficulty
				//and then took one of free satellite ships from checkEndSatelites and count price and time with satelliteRoutLength
				//КОРИСТУВАЧУ ТРЕБА НАДАТИ ВИБІР З ДВОХ МАСИВІВ ВІЛЬНИХ ШАТЛІВ
				var temp = [];
				for(var i = 0;i < checkBaseShuttle.length; i++)
				{
					for(var j = 0; j < checkEndSatellite.length;++j )
					{
						var tempTime = minLength / checkBaseShuttle[i].speed + path[indexPathB].data.length / checkEndSatellite[j].speed;
						var tempPrice = TripCost(checkBaseShuttle[i].consumption, minLength, fuelPrice, difficulty) +
						TripCost(checkEndSatellite[j].consumption, path[indexPathB].data.length, fuelPrice, path[indexPathB].data.difficulty);
						temp.push({time : tempTime, price : tempPrice, id : checkBaseShuttle[i].id});
					}
					
				}
				return temp;/////////////////////////////////////////////////////
			}
			else
			{
				return checkRout;//rout doesnt exist
			}
	}
	else
	{
		return checkEndSatellite;//some problem with data
	}


	//A is base planet and B is base planet
	//check for existence routes

	var checkRout = LevitAlgorithm(planets, path, request.from, request.to);
	if (Array.isArray(checkRout) )
	{
		var difficulty = checkRout[1];
		var minLength = checkRout[0];
		//min rout for delivery is found
		//user can took one of free ships from checkBaseShips
		//and then count price and time with minLength and difficulty
		//КОРИСТУВАЧУ ТРЕБА НАДАТИ ВИБІР З МАСИВУ ВІЛЬНИХ ШАТЛІВ
		var temp = [];
			for(var i = 0;i < checkBaseShuttle.length; i++)
			{
				var tempTime = minLength / checkBaseShuttle[i].speed;
				var tempPrice = TripCost(checkBaseShuttle[i].consumption, minLength, fuelPrice, difficulty);
				temp.push({time : tempTime, price : tempPrice, id : checkBaseShuttle[i].id});
			}
			return temp;/////////////////////////////////////////////////////
	}
	else
	{
		return checkRout;//rout doesnt exist
	}
}



function Test()
{
	//data from database

	var planets = [];
	planets.push({data:{planetClass : "main", basePlanet : "Earth", name : "Earth"}});
	planets.push({data:{planetClass : "satellite", basePlanet : "Earth", name : "Moon"}});
	planets.push({data:{planetClass : "main", basePlanet : "Venus", name : "Venus"}});
	planets.push({data:{planetClass : "main", basePlanet : "Mars", name : "Mars"}});
	planets.push({data:{planetClass : "satellite", basePlanet : "Venus", name : "Pi"}});

	var path = [];
	path.push({data: {source: "Earth",target: "Venus",length : 88,difficulty : 3}});
	path.push({data: {source: "Earth",target: "Moon",length : 10,difficulty : 2}});
	path.push({data: {source: "Pi",target: "Venus",length : 15,difficulty : 4}});


	var ships = [];
	ships.push({id:1, location : "Earth", capacity : 50, volume : 1000, speed : 100, consumption : 10, planetClass : "main", available : "yes"});
	ships.push({id:6, location : "Earth", capacity : 40, volume : 6000, speed : 250, consumption : 50, planetClass : "main", available : "yes"});
	ships.push({id:2, location : "Earth", capacity : 20, volume : 500, speed : 50, consumption : 5, planetClass : "satellite", available : "yes"});
	ships.push({id:3, location : "Venus", capacity : 70, volume : 2000, speed : 70, consumption : 15, planetClass : "satellite", available : "yes"});
	ships.push({id:4, location : "Earth", capacity : 100, volume : 5000, speed : 20, consumption : 20, planetClass : "satellite", available : "yes"});
	ships.push({id:5, location : "Venus", capacity : 35, volume : 450, speed : 150, consumption : 12, planetClass : "satellite", available : "yes"});

	var fuelPrice = 10;
	var request = {trackID:"undefined", from : "Moon", to : "Pi", weight : 20, volume : 200, price:"undefined", 
				reg_date:"undefined", send_date:"undefined", delivery_date:"undefined", recieve_date:"undefined", status:"undefined"};






	var temp = Main(planets, path, ships, fuelPrice, request);
	if (Array.isArray(temp))
	{
		var select = document.getElementById("insertHere");
		for(var i=0;i < temp.length;i++)
		{
			var p = document.createElement("p");
			p.value = i;
			p.innerHTML = "time:"+temp[i].time + " price:" + temp[i].price + " id:" + temp[i].id;
			select.appendChild(p);
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