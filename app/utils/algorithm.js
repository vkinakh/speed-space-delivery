function CheckInputData(planets, path, ships){
	if (planets.length == 0)
		return 0;
	if (path.length == 0)
		return 0;
	if (ships.length == 0)
		return 0;
	return 1;
}

function TripCost(consumption, weight, fuelPrice){
	var cost = consumption * weight * fuelPrice;
	cost += (0.3 * cost); //накрутка
	return cost;
}

function IndexInArrayByName(array, data){
	var index;
	for (var i = 0;i < array.length; i++)
	{
		if (array[i].name == data)
			{
				index = i;
				break;
			}
	}
	return index;
}

function ShuttleExistence(nameA, container, mainShips, predicate){
	
	//check existence ships on this main planet
	var freeships = [];
	for(var i = 0; i < mainShips.length; i++)
	{
		if (mainShips[i].location == nameA)
			if (mainShips[i].ability == predicate)
				if (mainShips[i].available == true)
					if (mainShips[i].capacity >= container.weight)
						if (mainShips[i].volume >= container.volume)
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

function FormGraph(mainPlanets, mainPath){
	var graph = [];
	for(var i = 0;i < mainPlanets.length; ++i)
	{
		var tempArr = [];
		var tempName = mainPlanets[i].name;
		for(var j = 0;j < mainPath.length; ++j)
		{
			if (mainPath[j].source == tempName)
			{
				var x;
				for(var z = 0;z < mainPlanets.length;z++)
				{
					if (mainPlanets[z].name == mainPath[j].target)
						{
							x = z;
							break;
						}
				}
				tempArr.push({to : x, weight : mainPath[j].weight});
			}
			if (mainPath[j].target == tempName)
			{
				var x;
				for(var z = 0;z < mainPlanets.length;z++)
				{
					if (mainPlanets[z].name == mainPath[j].source)
						{
							x = z;
							break;
						}
				}
				tempArr.push({to : x, weight : mainPath[j].weight});
			}
		}
		graph.push(tempArr);
	}

	return graph;
}

function LevitAlgorithm(mainPlanets, mainPath, nameA, nameB){
	var g = FormGraph(mainPlanets, mainPath);
	var v1, v2;

	for(var i = 0;i < mainPlanets.length;i++)
	{
		if (mainPlanets[i].name == nameA)
			v1 = i;
		if (mainPlanets[i].name == nameB)
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
    console.log(mainPlanets);
    console.log(v2);
    console.log(mainPlanets[v2]);
	if (p[v2] != -1)
	{	
			//rebuilding mimimal path by planets names
			var i = v2;
			minPath.unshift(mainPlanets[v2].name);
			while (p[i] != v1)
			{
				minPath.unshift(mainPlanets[ p[i] ].name);
				i = p[i];
			}
			minPath.unshift(mainPlanets[v1].name);

			//return results
			var result = [];
			result.push(minWeigth);
			result.push(minPath);
			return result;
	}
	else
	{
		return "This Route doesnt exist";
	}

}

function NextSet(arr, n){
	
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

function AllCombinations(n){
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

function LengthPathCombination(combination, container, mainPlanets, mainPath){
	var len = 0;
	var temp = LevitAlgorithm(mainPlanets, mainPath, container.from, container.to[ combination[0] ]);

	if ( !(Array.isArray(temp)) )
	{
		return temp;//path doesnt exist
	}

	len += temp[0];
	for(var i = 1; i < combination.length; ++i)
	{
		temp = LevitAlgorithm(mainPlanets, mainPath, container.to[ combination[i-1] ], container.to[ combination[i] ]);

		if ( !(Array.isArray(temp)) )
		{
			return temp;//path doesnt exist
		}

		len += temp[0];
	}
	return len;
}

function OptimalPath(mainPlanets, mainPath, container){
	var n = container.to.length;
	var lengthsOfPathInCombinations = [];
	var combinations = AllCombinations(n);
	for(var i = 0; i < combinations.length;++i)
	{
		var temp = LengthPathCombination(combinations[i] , container, mainPlanets, mainPath);

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

function LengthAndPlanetsInOptimalPath(mainPlanets, mainPath, container){
	var combination = OptimalPath(mainPlanets, mainPath, container);

	if (typeof combination === "string")
		return combination;//path doesnt exist

	var temp = LevitAlgorithm(mainPlanets, mainPath, container.from, container.to[ combination[0] ]);
	var result = [];
	result.push(temp);
	for(var i = 1; i < combination.length; ++i)
	{
		temp = LevitAlgorithm(mainPlanets, mainPath, container.to[ combination[i-1] ], container.to[ combination[i] ]);
		result.push(temp);
	}
	return result;
}

function PriceAndTime(mainPlanets, mainPath, container, freeShips, fuelPrice){
	var optimalPath = LengthAndPlanetsInOptimalPath(mainPlanets, mainPath, container);

	if (typeof optimalPath === "string")
		return optimalPath;//path doesnt exist

	var result = {'pathsArray': [], 'properties': []};
    result.pathsArray = optimalPath.map(function(i){
       return i[1]; 
    });
	for(var i = 0; i < freeShips.length; ++i)
	{
		var sections = [];
		
		for(var j = 0; j < optimalPath.length; ++j)
		{
			var tempPrice = TripCost(freeShips[i].consumption, optimalPath[j][0], fuelPrice);
			var tempTime = optimalPath[j][0] / freeShips[i].speed;
			var section = {price : tempPrice, time : tempTime, length: optimalPath[j][0]};
			sections.push(section);
		}
        var tempObj = {'shipID': freeShips[i].id, 'properties': sections};
		result.properties.push(tempObj);
	}
	return result;
}

function GetMainPlanets(planets){
	var mainPlanets = [];
	for(var i = 0;i < planets.length;i++)
	{
		if (planets[i].type == "planet")
			mainPlanets.push(planets[i]);
	}
	return mainPlanets;
}

function GetMainPath(planets, path){
	var mainPath = [];
	for(var i = 0;i < path.length; i++)
	{
		if (planets[ IndexInArrayByName(planets, path[i].source) ].type == "moon")
			continue;
		if (planets[ IndexInArrayByName(planets,path[i].target) ].type == "moon")
			continue;
		var tempPath = {source : path[i].source, target : path[i].target, weight : (path[i].length * path[i].difficulty) };
		mainPath.push(tempPath);
	}
	return mainPath;
}

function GetMainShips(ships){
	var mainShips = [];
	for(var i = 0;i < ships.length; ++i)
	{
		if (ships[i].ability == "innerGalactic"||ships[i].ability == "everywhere")
			mainShips.push(ships[i]);
	}
	return mainShips;
}

module.exports.OrdinaryDelivery = function OrdinaryDelivery(planets, path, ships, fuelPrice, container){
	if (CheckInputData(planets, path, ships) == 0)
		return "Data from database isn't correct";

	var mainPlanets = GetMainPlanets(planets);

	var mainPath = GetMainPath(planets, path);
	
	var mainShips = GetMainShips(ships);
    console.log(mainPlanets);
	//array of free ships in freeShips
	var freeShips = ShuttleExistence(container.from, container, mainShips, "innerGalactic");
	if (freeShips == 0)
		return "Ships on this main planet don't exist or too small for this container";
    console.log(freeShips);
	var result = PriceAndTime(mainPlanets, mainPath, container, freeShips, fuelPrice);

	if (typeof result === "string")
		return result;//path doesnt exist

	return result;
}

function PathExistence(nameA, nameB, path){
	var ptrExistence = 0;
	for(var i = 0; i < path.length; i++)
	{
		if (path[i].source == nameA && path[i].target == nameB)
		{
			ptrExistence = 1;
			break;
		}
		if (path[i].target == nameA && path[i].source == nameB)
		{
			ptrExistence = 1;
			break;
		}
	}
	return ptrExistence;
}
	
function IsSatellite(data, planets, ships, container, path){
	var numberInArray = IndexInArrayByName(planets, data);
	
	//check if start planet is satellite
	if (planets[numberInArray].type == "moon")
	{
		var moonOf = planets[numberInArray].moonOf;

		//check if path between satellite and base planet for satellite exist
		ptrExistence = PathExistence(data, moonOf, path);
		if (ptrExistence != 1)
			return "Path between satellite and base planet doesn't exist";

		//check if base planet has a shuttle for satellites(big enought for container)
		var freeSatelliteships = ShuttleExistence(moonOf, container, ships, "nearPlanet");
		if (freeSatelliteships == 0)
			return "Shuttle on base planet for satellites doesn't exist or your container is too big for this satellite shuttle";

		return freeSatelliteships;
	}
	else return 0;

}

function IsBSatelliteForThisMain(container, planets, ships, path){
	var numberInArrayB = IndexInArrayByName(planets, container.to);
	//A is main planet

    //check if B is satellite for this main planet
    if (planets[numberInArrayB].type == "moon")
        {
            if (planets[numberInArrayB].moonOf == container.from)
            {
                //check if path between satellite and base planet for satellite exist
                var ptrExistence = PathExistence(container.to, container.from, path);
                if (ptrExistence != 1)
                    return "Path between satellite and base planet doesn't exist";

                //check if exist satellite shuttle on A(big enought)
                var freeSatelliteships = ShuttleExistence(container.from, container, ships, "nearPlanet");
                if (freeSatelliteships == 0)
                    return "Shuttle on base planet for satellites doesn't exist or your container is too big for this satellite shuttle";

                return freeSatelliteships;
            }
            else
                return 0;
        }
    else
        return 0;	
}

module.exports.QuickDelivery = function QuickDelivery(planets, path, ships, fuelPrice, container){
	if (CheckInputData(planets, path, ships) == 0)
		return "Data from database isn't correct";

	var mainPlanets = GetMainPlanets(planets);
	var mainPath = GetMainPath(planets, path);
	
	var checkASatellite = IsSatellite(container.from, planets, ships, container, path);
	if (checkASatellite == 0) {} //A is not a satellite
	else if (Array.isArray(checkASatellite)) //A is satellite - array with free ships from satellite to base planet
	{
		//search index of path from satellite A to its base planet
		var indexPathA;
			for(var i = 0; i < path.length; i++)
			{
				if (path[i].source == container.from && path[i].target == planets[ IndexInArrayByName(planets,container.from) ].moonOf)
				{
					indexPathA = i;
					break;
				}
				if (path[i].target == container.from && path[i].source == planets[ IndexInArrayByName(planets,container.from) ].moonOf)
				{
					indexPathA = i;
					break;
				}
			}

		//check if B is also satellite for this base planet
		if (planets[ IndexInArrayByName(planets,container.from) ].moonOf == planets[ IndexInArrayByName(planets,container.to) ].moonOf)
		{
			//delivery from one satellite to another satellite of the same base planet
			var temp = [];
			for(var i = 0;i < checkASatellite.length; i++)
			{
				var Route = [];
				Route.push(container.from);
				Route.push( planets[ IndexInArrayByName(planets,container.from) ].moonOf );
				Route.push(container.to);

				//search index for path from satellite B to its base planet
				var indexPathB;
				for(var z = 0; z < path.length; z++)
				{
					if (path[z].source == container.to && path[z].target == planets[ IndexInArrayByName(planets,container.to) ].moonOf)
					{
						indexPathB = z;
						break;
					}
					if (path[z].target == container.to && path[z].source == planets[ IndexInArrayByName(planets,container.to) ].moonOf)
					{
						indexPathB = z;
						break;
					}
				}



				var tempTime = (path[indexPathA].length * path[indexPathA].difficulty + path[indexPathB].length * path[indexPathB].difficulty) / checkASatellite[i].speed;
				var tempPrice = TripCost(checkASatellite[i].consumption, path[indexPathA].length * path[indexPathA].difficulty, fuelPrice) +
				TripCost(checkASatellite[i].consumption, path[indexPathB].length * path[indexPathB].difficulty, fuelPrice);
				temp.push({time : tempTime, price : tempPrice, 'length': path[indexPathA].length + path[indexPathB].length, shipId : checkASatellite[i].id, path : Route});
			}
			return temp;/////////////////////////////////////////////////////

		}
		//if B is base planet for this satellite - return free satellite ships 
		if (container.to == planets[ IndexInArrayByName(planets,container.from) ].moonOf)
		{
			//КОРИСТУВАЧУ ТРЕБА НАДАТИ ВИБІР З МАСИВУ ВІЛЬНИХ ШАТЛІВ
			var temp = [];
			for(var i = 0;i < checkASatellite.length; i++)
			{
				var Route = [];
				Route.push(container.from);
				Route.push(container.to);

				var tempTime = (path[indexPathA].length * path[indexPathA].difficulty) / checkASatellite[i].speed;
				var tempPrice = TripCost(checkASatellite[i].consumption, path[indexPathA].length * path[indexPathA].difficulty, fuelPrice);
				temp.push({time : tempTime, price : tempPrice, 'length':path[indexPathA].length , shipId : checkASatellite[i].id, path : Route});
			}
			return temp;/////////////////////////////////////////////////////
		}
		else
		{
			//A is a satellite so now departure from base planet to nowhere
			//then user can took one of free satellite shutles that are in checkASatellite
			var numberInArrayA = IndexInArrayByName(planets,container.from);
			var moonOfForA = planets[numberInArrayA].moonOf;

					//moonOfForA is base planet and B is not satellite for this base planet moonOfForA
					var checkBaseShuttle = ShuttleExistence(moonOfForA,container,ships, "innerGalactic");
					if (checkBaseShuttle == 0)
					{
						return "Base ships for planet moonOfForA dont exist";
					}
	
					//there are free ships from this main planet moonOfForA in array checkBaseShuttle

					//check if planet B is satellite
					var checkEndSatellite = IsSatellite(container.to, planets, ships,container,path);
					if (checkEndSatellite == 0) {} //B is not a satellite
					else if (Array.isArray(checkEndSatellite)) //B is satellite - array with free ships from base planet to satellite
					{

						//search index of path from satellite B to its base planet
						var indexPathB;
						for(var i = 0; i < path.length; i++)
						{
							if (path[i].source == container.to && path[i].target == planets[ IndexInArrayByName(planets,container.to) ].moonOf)
							{
								indexPathB = i;
								break;
							}
							if (path[i].target == container.to && path[i].source == planets[ IndexInArrayByName(planets,container.to) ].moonOf)
							{
								indexPathB = i;
								break;
							}
						}


						//so now departure from base planet moonOfForA to base planet that is base for satellite B
						//then user can took one of free satellite shutles that are in checkEndSatellite
							var numberInArrayB = IndexInArrayByName(planets,container.to);
							var moonOfForB = planets[numberInArrayB].moonOf;
							//moonOfForA is base planet and moonOfForB is base planet
							//check for existence Routees

							var checkRoute = LevitAlgorithm(mainPlanets, mainPath, moonOfForA, moonOfForB);
							if (Array.isArray(checkRoute))
							{
								var minWeigth = checkRoute[0];
								var minPath = checkRoute[1];
								minPath.unshift(container.from);
								minPath.push(container.to);
								//min Route for delivery is found
								//user can took one of free ships from checkBaseShuttle
								//and then count price and time with minWeigth
								//and then took one of free satellite ships from checkEndSatelites and count price and time with satelliteRouteLength
								//and took one of free satellite shuttles from checkASatellite and count price and time with satelliteRouteLength
								//КОРИСТУВАЧУ ТРЕБА НАДАТИ ВИБІР З ТРЬОХ МАСИВІВ ВІЛЬНИХ ШАТЛІВ
								var temp = [];
								for(var i = 0;i < checkBaseShuttle.length; i++)
								{
									for(var j = 0; j < checkEndSatellite.length;++j )
									{
										for(var z = 0; z < checkASatellite.length;++z )
										{
											var tempTime = minWeigth / checkBaseShuttle[i].speed + (path[indexPathA].length * path[indexPathA].difficulty)
												/ checkASatellite[z].speed +
											(path[indexPathB].length * path[indexPathB].difficulty)/ checkEndSatellite[j].speed;

											var tempPrice = TripCost(checkBaseShuttle[i].consumption, minWeigth, fuelPrice) +
											TripCost(checkASatellite[z].consumption, path[indexPathA].length * path[indexPathA].difficulty, fuelPrice)+
											TripCost(checkEndSatellite[j].consumption, path[indexPathB].length * path[indexPathB].difficulty, fuelPrice);

											var arrShipId = [];
											arrShipId.push(checkASatellite[z].id);
											arrShipId.push(checkBaseShuttle[i].id);
											arrShipId.push(checkEndSatellite[j].id);

											temp.push({time : tempTime, price : tempPrice, 'length': minWeigth + path[indexPathA].length + path[indexPathB].length, shipId : arrShipId, path : minPath});
										}
										
									}
					
								}
								return temp;/////////////////////////////////////////////////////
							}
							else
							{
								return checkRoute;//Route doesnt exist
							}
					}
					else
					{
						return checkEndSatellite;//some problem with data
					}


					//moonOfForA is base planet and B is base planet
					//check for existence Routees

					var checkRoute = LevitAlgorithm(mainPlanets, mainPath, moonOfForA, container.to);
					if (Array.isArray(checkRoute))
					{
						var minWeigth = checkRoute[0];
						var minPath = checkRoute[1];
						minPath.unshift(container.from);
						//min Route for delivery is found
						//user can took one of free ships from checkBaseShips
						//and then count price and time with minWeigth
						//and then took one satellite shuttle from checkASatellite and count price and time with satelliteRouteLength
						//КОРИСТУВАЧУ ТРЕБА НАДАТИ ВИБІР З ДВОХ МАСИВІВ ВІЛЬНИХ ШАТЛІВ
						var temp = [];
						for(var i = 0;i < checkBaseShuttle.length; i++)
						{
							for(var j = 0; j < checkASatellite.length;++j )
							{
								var tempTime = minWeigth / checkBaseShuttle[i].speed + (path[indexPathA].length * path[indexPathA].difficulty)
								/ checkASatellite[j].speed;

								var tempPrice = TripCost(checkBaseShuttle[i].consumption, minWeigth, fuelPrice) +
								TripCost(checkASatellite[j].consumption, path[indexPathA].length * path[indexPathA].difficulty, fuelPrice);

								var arrShipId = [];
								arrShipId.push(checkASatellite[j].id);
								arrShipId.push(checkBaseShuttle[i].id);
											

								temp.push({time : tempTime, price : tempPrice, 'length': minWeigth + path[indexPathA].length, shipId : arrShipId, path : minPath});
							}
					
						}
						return temp;/////////////////////////////////////////////////////
					}
					else
					{
						return checkRoute;//Route doesnt exist
					}

		}
		
	}
	else
	{
		return checkASatellite;//some problem with data
	}







	//A is base planet

	//check if B is satellite for this main planet
	var checkBSatellite = IsBSatelliteForThisMain(container, planets, ships,path);
	if (checkBSatellite == 0) {} //B is not a satellite for this main planet
	else if (Array.isArray(checkBSatellite)) //B is satellite for this main planet - array with free ships from base planet to satellite
	{
		//search index of path from satellite B to its base planet
		var indexPathB;
		for(var i = 0; i < path.length; i++)
		{
			if (path[i].source == container.to && path[i].target == container.from)
			{
				indexPathB = i;
				break;
			}
			if (path[i].target == container.to && path[i].source == container.from)
			{
				indexPathB = i;
				break;
			}
		}

		//КОРИСТУВАЧУ ТРЕБА НАДАТИ ВИБІР З МАСИВУ ВІЛЬНИХ ШАТЛІВ
		var temp = [];
			for(var i = 0;i < checkBSatellite.length; i++)
			{
				var Route = [];
				Route.push(container.from);
				Route.push(container.to);

				var tempTime = (path[indexPathB].length * path[indexPathB].difficulty) / checkBSatellite[i].speed;
				var tempPrice = TripCost(checkBSatellite[i].consumption, path[indexPathB].length * path[indexPathB].difficulty, fuelPrice);
				temp.push({time : tempTime, price : tempPrice, 'length': path[indexPathB].length, shipId : checkBSatellite[i].id, path : Route});
			}
			return temp;/////////////////////////////////////////////////////
	}
	else
	{
		return checkBSatellite;//some problem with data
	}
	

	//A is base planet and B is not satellite for this base planet A
	var checkBaseShuttle = ShuttleExistence(container.from, container, ships, "innerGalactic");
	if (checkBaseShuttle == 0)
	{
		return "Base ships for planet A dont exist";
	}
	
	//there are free ships from this main planet A in array checkBaseShuttle

	//check if planet B is satellite
	var checkEndSatellite = IsSatellite(container.to, planets, ships,container,path);
	if (checkEndSatellite == 0) {} //B is not a satellite
	else if (Array.isArray(checkEndSatellite)) //B is satellite - array with free ships from base planet to satellite
	{
		//search index of path from satellite B to its base planet
		var indexPathB;
		for(var i = 0; i < path.length; i++)
		{
			if (path[i].source == container.to && path[i].target == planets[ IndexInArrayByName(planets,container.to) ].moonOf)
			{
				indexPathB = i;
				break;
			}
			if (path[i].target == container.to && path[i].source == planets[ IndexInArrayByName(planets,container.to) ].moonOf)
			{
				indexPathB = i;
				break;
			}
		}

		//so now departure from base planet A to base planet that is base for satellite B
		//then user can took one of free satellite shutles that are in checkEndSatellite
			var numberInArrayB = IndexInArrayByName(planets,container.to);
			var moonOfForB = planets[numberInArrayB].moonOf;
			//A is base planet and moonOfForB is base planet
			//check for existence Routees

			var checkRoute = LevitAlgorithm(mainPlanets, mainPath, container.from, moonOfForB);
			if (Array.isArray(checkRoute))
			{
				var minWeigth = checkRoute[0];
				var minPath = checkRoute[1];
				minPath.push(container.to);

				//min Route for delivery is found
				//user can took one of free ships from checkBaseShuttle
				//and then count price and time with minWeigth
				//and then took one of free satellite ships from checkEndSatelites and count price and time with satelliteRouteLength
				//КОРИСТУВАЧУ ТРЕБА НАДАТИ ВИБІР З ДВОХ МАСИВІВ ВІЛЬНИХ ШАТЛІВ
				var temp = [];
				for(var i = 0;i < checkBaseShuttle.length; i++)
				{
					for(var j = 0; j < checkEndSatellite.length;++j )
					{
						var tempTime = minWeigth / checkBaseShuttle[i].speed + (path[indexPathB].length * path[indexPathB].difficulty)/ checkEndSatellite[j].speed;

						var tempPrice = TripCost(checkBaseShuttle[i].consumption, minWeigth, fuelPrice) +
						TripCost(checkEndSatellite[j].consumption, path[indexPathB].length * path[indexPathB].difficulty, fuelPrice);

						var arrShipId = [];
						arrShipId.push(checkBaseShuttle[i].id);
						arrShipId.push(checkEndSatellite[j].id);

						temp.push({time : tempTime, price : tempPrice, 'length': minWeigth + path[indexPathB].length, shipId : arrShipId, path : minPath});
					}
					
				}
				return temp;/////////////////////////////////////////////////////
			}
			else
			{
				return checkRoute;//Route doesnt exist
			}
	}
	else
	{
		return checkEndSatellite;//some problem with data
	}


	//A is base planet and B is base planet
	//check for existence Routees

	var checkRoute = LevitAlgorithm(mainPlanets, mainPath, container.from, container.to);
	if (Array.isArray(checkRoute) )
	{
		var minWeigth = checkRoute[0];
		var minPath = checkRoute[1];
		//min Route for delivery is found
		//user can took one of free ships from checkBaseShips
		//and then count price and time with minWeigth
		//КОРИСТУВАЧУ ТРЕБА НАДАТИ ВИБІР З МАСИВУ ВІЛЬНИХ ШАТЛІВ
		var temp = [];
			for(var i = 0;i < checkBaseShuttle.length; i++)
			{
				var tempTime = minWeigth / checkBaseShuttle[i].speed;
				var tempPrice = TripCost(checkBaseShuttle[i].consumption, minWeigth, fuelPrice);
				temp.push({time : tempTime, price : tempPrice, 'length': minWeigth, shipId : checkBaseShuttle[i].id, path : minPath});
			}
			return temp;/////////////////////////////////////////////////////
	}
	else
	{
		return checkRoute;//Route doesnt exist
	}
}

module.exports.formatEstTime = function formatTime(val){
    let date = new Date(0);
	date.setHours(date.getHours()-Math.abs(date.getTimezoneOffset()/60));
	let formatString = '';
    date.setSeconds(val*24*3600);
    if(date.getDate()-1>0) formatString += date.getDate()-1 + ' days ';
 	formatString += date.toTimeString().split(' ')[0];
    return formatString;
}

module.exports.PerpareResponse = function(input){
    if(Array.isArray(input)){
        let result = {'pathsArray': [input[0].path], 'properties': []};
        input.map(function(el){
            let obj = {'properties': [{'price':el.price, 'time': el.time, 'length': el.length}], 'shipID': el.shipId};
            result.properties.push(obj);
        });
        return result;
    }else return '';
}
