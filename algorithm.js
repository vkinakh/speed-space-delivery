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

function ShuttleExistence(nameA, conteiner, mainShips, predicate)
{
	
	//check existence ships on this main planet 
	var freeships = [];
	for(var i = 0; i < mainShips.length; i++)
	{
		if (mainShips[i].location == nameA)
			if (mainShips[i].planetClass == predicate)
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


function GetMainPlanets(planets)
{
	var mainPlanets = [];
	for(var i = 0;i < planets.length;i++)
	{
		if (planets[i].data.planetClass == "main")
			mainPlanets.push(planets[i]);
	}
	return mainPlanets;
}

function GetMainPath(planets,path)
{
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
	return mainPath;
}

function GetMainShips(ships)
{
	var mainShips = [];
	for(var i = 0;i < ships.length; ++i)
	{
		if (ships[i].planetClass == "main")
			mainShips.push(ships[i]);
	}
	return mainShips;
}


function OrdinaryDelivery(planets, path, ships, fuelPrice, conteiner)
{
	if (CheckInputData(planets, path, ships) == 0)
		return "Data from database isn't correct";

	var mainPlanets = GetMainPlanets(planets);

	var mainPath = GetMainPath(planets,path);
	
	var mainShips = GetMainShips(ships);
	


	//array of free ships in freeShips
	var freeShips = ShuttleExistence(conteiner.from, conteiner, mainShips, "main");
	if (freeShips == 0)
		return "Ships on this main planet don't exist or too small for this conteiner";

	var result = PriceAndTime(mainPlanets, mainPath, conteiner, freeShips, fuelPrice);

	if (typeof result === "string")
		return result;//path doesnt exist

	return result;
}


function PathExistence(nameA, nameB, path)
{
	var ptrExistence = 0;
	for(var i = 0; i < path.length; i++)
	{
		if (path[i].data.source == nameA && path[i].data.target == nameB)
		{
			ptrExistence = 1;
			break;
		}
		if (path[i].data.target == nameA && path[i].data.source == nameB)
		{
			ptrExistence = 1;
			break;
		}
	}
	return ptrExistence;
}
	
function IsSatellite(data, planets, ships,conteiner, path)
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
			return "Base planet for satellite doesn't exist";

		//check if path between satellite and base planet for satellite exist
		ptrExistence = PathExistence(data, basePlanet, path);
		if (ptrExistence != 1)
			return "Path between satellite and base planet doesn't exist";

		//check if base planet has a shuttle for satellites(enought big for conteiner)
		var freeSatelliteships = ShuttleExistence(basePlanet, conteiner, ships, "satellite");
		if (freeSatelliteships == 0)
			return "Shuttle on base planet for satellites doesn't exist or your conteinet is too big for this satellite shuttle";

		return freeSatelliteships;
	}
	else
		return 0;

}

function IsBSatelliteForThisMain(conteiner, planets, ships,path)
{
	var numberInArrayB = IndexInArrayByName(planets, conteiner.to);
	//A is main planet

		//check if B is satellite for this main planet
		if (planets[numberInArrayB].data.planetClass == "satellite")
			{
				if (planets[numberInArrayB].data.basePlanet == conteiner.from)
				{
					//check if path between satellite and base planet for satellite exist
					var ptrExistence = PathExistence(conteiner.to, conteiner.from, path);
					if (ptrExistence != 1)
						return "Path between satellite and base planet doesn't exist";

					//check if exist satellite shuttle on A(big enought)
					var freeSatelliteships = ShuttleExistence(conteiner.from, conteiner, ships, "satellite");
					if (freeSatelliteships == 0)
						return "Shuttle on base planet for satellites doesn't exist or your conteiner is too big for this satellite shuttle";

					return freeSatelliteships;
				}
				else
					return 0;
			}
		else
			return 0;	
}



function QuickDelivery(planets, path, ships, fuelPrice, conteiner)
{
	if (CheckInputData(planets, path, ships) == 0)
		return "Data from database isn't correct";

	var mainPlanets = GetMainPlanets(planets);
	var mainPath = GetMainPath(planets,path);
	
	var checkASatellite = IsSatellite(conteiner.from, planets, ships,conteiner,path);
	if (checkASatellite == 0) {} //A is not a satellite
	else if (Array.isArray(checkASatellite)) //A is satellite - array with free ships from satellite to base planet
	{
		//search index of path from satellite A to its base planet
		var indexPathA;
			for(var i = 0; i < path.length; i++)
			{
				if (path[i].data.source == conteiner.from && path[i].data.target == planets[ IndexInArrayByName(planets,conteiner.from) ].data.basePlanet)
				{
					indexPathA = i;
					break;
				}
				if (path[i].data.target == conteiner.from && path[i].data.source == planets[ IndexInArrayByName(planets,conteiner.from) ].data.basePlanet)
				{
					indexPathA = i;
					break;
				}
			}

		//if B is base planet for this satellite - return free satellite ships 
		if (conteiner.to == planets[ IndexInArrayByName(planets,conteiner.from) ].data.basePlanet)
		{
			//КОРИСТУВАЧУ ТРЕБА НАДАТИ ВИБІР З МАСИВУ ВІЛЬНИХ ШАТЛІВ
			var temp = [];
			for(var i = 0;i < checkASatellite.length; i++)
			{
				var rout = [];
				rout.push(conteiner.from);
				rout.push(conteiner.to);

				var tempTime = (path[indexPathA].data.length * path[indexPathA].data.difficulty) / checkASatellite[i].speed;
				var tempPrice = TripCost(checkASatellite[i].consumption, path[indexPathA].data.length * path[indexPathA].data.difficulty, fuelPrice);
				temp.push({time : tempTime, price : tempPrice, shipId : checkASatellite[i].id, path : rout});
			}
			return temp;/////////////////////////////////////////////////////
		}
		else
		{
			//A is a satellite so now departure from base planet to nowhere
			//then user can took one of free satellite shutles that are in checkASatellite
			var numberInArrayA = IndexInArrayByName(planets,conteiner.from);
			var basePlanetForA = planets[numberInArrayA].data.basePlanet;

					//basePlanetForA is base planet and B is not satellite for this base planet basePlanetForA
					var checkBaseShuttle = ShuttleExistence(basePlanetForA,conteiner,ships, "main");
					if (checkBaseShuttle == 0)
					{
						return "Base ships for planet basePlanetForA dont exist";
					}
	
					//there are free ships from this main planet basePlanetForA in array checkBaseShuttle

					//check if planet B is satellite
					var checkEndSatellite = IsSatellite(conteiner.to, planets, ships,conteiner,path);
					if (checkEndSatellite == 0) {} //B is not a satellite
					else if (Array.isArray(checkEndSatellite)) //B is satellite - array with free ships from base planet to satellite
					{

						//search index of path from satellite B to its base planet
						var indexPathB;
						for(var i = 0; i < path.length; i++)
						{
							if (path[i].data.source == conteiner.to && path[i].data.target == planets[ IndexInArrayByName(planets,conteiner.to) ].data.basePlanet)
							{
								indexPathB = i;
								break;
							}
							if (path[i].data.target == conteiner.to && path[i].data.source == planets[ IndexInArrayByName(planets,conteiner.to) ].data.basePlanet)
							{
								indexPathB = i;
								break;
							}
						}


						//so now departure from base planet basePlanetForA to base planet that is base for satellite B
						//then user can took one of free satellite shutles that are in checkEndSatellite
							var numberInArrayB = IndexInArrayByName(planets,conteiner.to);
							var basePlanetForB = planets[numberInArrayB].data.basePlanet;
							//basePlanetForA is base planet and basePlanetForB is base planet
							//check for existence routes

							var checkRout = LevitAlgorithm(mainPlanets, mainPath, basePlanetForA, basePlanetForB);
							if (Array.isArray(checkRout))
							{
								var minWeigth = checkRout[0];
								var minPath = checkRout[1];
								minPath.unshift(conteiner.from);
								minPath.push(conteiner.to);
								//min rout for delivery is found
								//user can took one of free ships from checkBaseShuttle
								//and then count price and time with minWeigth
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
											var tempTime = minWeigth / checkBaseShuttle[i].speed + (path[indexPathA].data.length * path[indexPathA].data.difficulty)
												/ checkASatellite[z].speed +
											(path[indexPathB].data.length * path[indexPathB].data.difficulty)/ checkEndSatellite[j].speed;

											var tempPrice = TripCost(checkBaseShuttle[i].consumption, minWeigth, fuelPrice) +
											TripCost(checkASatellite[z].consumption, path[indexPathA].data.length * path[indexPathA].data.difficulty, fuelPrice)+
											TripCost(checkEndSatellite[j].consumption, path[indexPathB].data.length * path[indexPathB].data.difficulty, fuelPrice);

											var arrShipId = [];
											arrShipId.push(checkASatellite[z].id);
											arrShipId.push(checkBaseShuttle[i].id);
											arrShipId.push(checkEndSatellite[j].id);

											temp.push({time : tempTime, price : tempPrice, shipId : arrShipId, path : minPath});
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

					var checkRout = LevitAlgorithm(mainPlanets, mainPath, basePlanetForA, conteiner.to);
					if (Array.isArray(checkRout))
					{
						var minWeigth = checkRout[0];
						var minPath = checkRout[1];
						minPath.unshift(conteiner.from);
						//min rout for delivery is found
						//user can took one of free ships from checkBaseShips
						//and then count price and time with minWeigth
						//and then took one satellite shuttle from checkASatellite and count price and time with satelliteRoutLength
						//КОРИСТУВАЧУ ТРЕБА НАДАТИ ВИБІР З ДВОХ МАСИВІВ ВІЛЬНИХ ШАТЛІВ
						var temp = [];
						for(var i = 0;i < checkBaseShuttle.length; i++)
						{
							for(var j = 0; j < checkASatellite.length;++j )
							{
								var tempTime = minWeigth / checkBaseShuttle[i].speed + (path[indexPathA].data.length * path[indexPathA].data.difficulty)
								/ checkASatellite[j].speed;

								var tempPrice = TripCost(checkBaseShuttle[i].consumption, minWeigth, fuelPrice) +
								TripCost(checkASatellite[j].consumption, path[indexPathA].data.length * path[indexPathA].data.difficulty, fuelPrice);

								var arrShipId = [];
								arrShipId.push(checkASatellite[j].id);
								arrShipId.push(checkBaseShuttle[i].id);
											

								temp.push({time : tempTime, price : tempPrice, shipId : arrShipId, path : minPath});
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
	var checkBSatellite = IsBSatelliteForThisMain(conteiner, planets, ships,path);
	if (checkBSatellite == 0) {} //B is not a satellite for this main planet
	else if (Array.isArray(checkBSatellite)) //B is satellite for this main planet - array with free ships from base planet to satellite
	{
		//search index of path from satellite B to its base planet
		var indexPathB;
		for(var i = 0; i < path.length; i++)
		{
			if (path[i].data.source == conteiner.to && path[i].data.target == conteiner.from)
			{
				indexPathB = i;
				break;
			}
			if (path[i].data.target == conteiner.to && path[i].data.source == conteiner.from)
			{
				indexPathB = i;
				break;
			}
		}

		//КОРИСТУВАЧУ ТРЕБА НАДАТИ ВИБІР З МАСИВУ ВІЛЬНИХ ШАТЛІВ
		var temp = [];
			for(var i = 0;i < checkBSatellite.length; i++)
			{
				var rout = [];
				rout.push(conteiner.from);
				rout.push(conteiner.to);

				var tempTime = (path[indexPathB].data.length * path[indexPathB].data.difficulty) / checkBSatellite[i].speed;
				var tempPrice = TripCost(checkBSatellite[i].consumption, path[indexPathB].data.length * path[indexPathB].data.difficulty, fuelPrice);
				temp.push({time : tempTime, price : tempPrice, shipId : checkBSatellite[i].id, path : rout});
			}
			return temp;/////////////////////////////////////////////////////
	}
	else
	{
		return checkBSatellite;//some problem with data
	}
	

	//A is base planet and B is not satellite for this base planet A
	var checkBaseShuttle = ShuttleExistence(conteiner.from, conteiner,ships, "main");
	if (checkBaseShuttle == 0)
	{
		return "Base ships for planet A dont exist";
	}
	
	//there are free ships from this main planet A in array checkBaseShuttle

	//check if planet B is satellite
	var checkEndSatellite = IsSatellite(conteiner.to, planets, ships,conteiner,path);
	if (checkEndSatellite == 0) {} //B is not a satellite
	else if (Array.isArray(checkEndSatellite)) //B is satellite - array with free ships from base planet to satellite
	{
		//search index of path from satellite B to its base planet
		var indexPathB;
		for(var i = 0; i < path.length; i++)
		{
			if (path[i].data.source == conteiner.to && path[i].data.target == planets[ IndexInArrayByName(planets,conteiner.to) ].data.basePlanet)
			{
				indexPathB = i;
				break;
			}
			if (path[i].data.target == conteiner.to && path[i].data.source == planets[ IndexInArrayByName(planets,conteiner.to) ].data.basePlanet)
			{
				indexPathB = i;
				break;
			}
		}

		//so now departure from base planet A to base planet that is base for satellite B
		//then user can took one of free satellite shutles that are in checkEndSatellite
			var numberInArrayB = IndexInArrayByName(planets,conteiner.to);
			var basePlanetForB = planets[numberInArrayB].data.basePlanet;
			//A is base planet and basePlanetForB is base planet
			//check for existence routes

			var checkRout = LevitAlgorithm(mainPlanets, mainPath, conteiner.from, basePlanetForB);
			if (Array.isArray(checkRout))
			{
				var minWeigth = checkRout[0];
				var minPath = checkRout[1];
				minPath.push(conteiner.to);

				//min rout for delivery is found
				//user can took one of free ships from checkBaseShuttle
				//and then count price and time with minWeigth
				//and then took one of free satellite ships from checkEndSatelites and count price and time with satelliteRoutLength
				//КОРИСТУВАЧУ ТРЕБА НАДАТИ ВИБІР З ДВОХ МАСИВІВ ВІЛЬНИХ ШАТЛІВ
				var temp = [];
				for(var i = 0;i < checkBaseShuttle.length; i++)
				{
					for(var j = 0; j < checkEndSatellite.length;++j )
					{
						var tempTime = minWeigth / checkBaseShuttle[i].speed + (path[indexPathB].data.length * path[indexPathB].data.difficulty)/ checkEndSatellite[j].speed;

						var tempPrice = TripCost(checkBaseShuttle[i].consumption, minWeigth, fuelPrice) +
						TripCost(checkEndSatellite[j].consumption, path[indexPathB].data.length * path[indexPathB].data.difficulty, fuelPrice);

						var arrShipId = [];
						arrShipId.push(checkBaseShuttle[i].id);
						arrShipId.push(checkEndSatellite[j].id);

						temp.push({time : tempTime, price : tempPrice, shipId : arrShipId, path : minPath});
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

	var checkRout = LevitAlgorithm(mainPlanets, mainPath, conteiner.from, conteiner.to);
	if (Array.isArray(checkRout) )
	{
		var minWeigth = checkRout[0];
		var minPath = checkRout[1];
		//min rout for delivery is found
		//user can took one of free ships from checkBaseShips
		//and then count price and time with minWeigth
		//КОРИСТУВАЧУ ТРЕБА НАДАТИ ВИБІР З МАСИВУ ВІЛЬНИХ ШАТЛІВ
		var temp = [];
			for(var i = 0;i < checkBaseShuttle.length; i++)
			{
				var tempTime = minWeigth / checkBaseShuttle[i].speed;
				var tempPrice = TripCost(checkBaseShuttle[i].consumption, minWeigth, fuelPrice);
				temp.push({time : tempTime, price : tempPrice, shipId : checkBaseShuttle[i].id, path : minPath});
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
	ships.push({id:2, location : "Earth", capacity : 40, volume : 6000, speed : 250, consumption : 50, planetClass : "main", available : "yes"});
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

	//var conteiner = {from : "Earth", to : destinations, weight : 20, volume : 200};
	var conteiner = {from : "Moon", to : "Pih3", weight : 20, volume : 200};


	if (Array.isArray(conteiner.to))
	{
		//ordinary delivery

		var temp = OrdinaryDelivery(planets, path, ships, fuelPrice, conteiner);
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
	else
	{
		//quick delivery
		var temp = QuickDelivery(planets, path, ships, fuelPrice, conteiner);
		if (Array.isArray(temp))
		{
			var select = document.getElementById("insertHere");
			for(var i=0;i < temp.length;i++)
			{
				var p = document.createElement("p");
				p.value = i;
				p.innerHTML = "time: "+temp[i].time + " price: " + temp[i].price + " Ship id: ";
				select.appendChild(p);

				if (Array.isArray(temp[i].shipId))
				{
					for(var z = 0; z < temp[i].shipId.length;++z)
					{
						var p = document.createElement("p");
						p.innerHTML = temp[i].shipId[z];
						select.appendChild(p);
					}
				}
				else
				{
					var p = document.createElement("p");
					p.innerHTML = temp[i].shipId;
					select.appendChild(p);
				}
				
				var p = document.createElement("p");
				p.innerHTML = "Path: ";
				select.appendChild(p);

				for(var j = 0; j < temp[i].path.length; ++j)
				{
					var p = document.createElement("p");
					p.innerHTML = temp[i].path[j];
					select.appendChild(p);
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


	
	
	
}