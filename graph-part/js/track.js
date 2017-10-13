(function(){
  document.addEventListener('DOMContentLoaded', function(){
	/*<global variables>*/
	// Help variables 
	// Begin and end are reqiured for aStar algorithm
	// Path for custom algorithm
	// Algo variable for changing algorithm
	let begin, end, path, algo;

	// Set speed variables for different paths
	var speed;
	var speedQuick = 10, speedRegular = 10;
	
	// Abstract value for time spent in journey
	var time = 0;
	
	// Todays date
	var today = new Date();
	
	// Values for start of jpurney time and for end of journey time
	let beginTime, endTime;
	/*<global variables>*/
	
	// Initialize cytoscape map for future adding graph
	let cy;
				
	/* Function for running aStar algorithm
	*  As custom algorithm is aStar - based 
	*  Takes: algrorithm as promise
	*  Sets option from global variables
	*  Return: resolve promise algorithm with options
	*/
	let runAlgorithm = (algorithm) => {
      if (algorithm === undefined) {
        return Promise.resolve(undefined);
      } else{
        let options = {
          root: '#' + begin,
          // astar requires target; goal property is ignored for other algorithms
          goal: '#' + end,
		  weight : function(edge){
			  return Number(edge.data("weight"));
		  }
        };
        return Promise.resolve(algorithm(options));
      }
    }
	
	/*Varible for saving curret algorithm*/
	let currentAlgorithm;
	
	/* Function for animating algorithm
	*  In this case it will show the position of delivery 
	*  Takes: algResults returned by runAlgorithm
	*  Applies algorithm with animation
	*/
    let animateAlgorithm = (algResults) => {
		// clear old algorithm results
		cy.$().removeClass('highlighted start end');
		cy.$().removeClass('delivery-place');
		currentAlgorithm = algResults;
		if (algResults === undefined || algResults.path === undefined) {
			return Promise.resolve();
		}
		else {
			let i = 0;
			let timeUnitsTodayBeginDiff;
			// for path algorithm
			if(algo == "path")
			{
				// get all path ids
				var ids = path.split(',');
				algResults.path.length = ids.length;
				for(var k = 1; k < ids.length - 1; ++k)
				{
					algResults.path[k] = cy.getElementById(ids[k]);
				}	
				// Set right distance
				var distance = 0;
				// Time, which is needed for path
				time = 4;
				for(var k = 1; k < ids.length - 1; ++k)
				{
					if(algResults.path[k].group() == "edges")
					{
						distance += Number(algResults.path[k].data("weight"));
						time += (Number(algResults.path[k].data("weight")) / speed);
					}else{
						if(algResults.path[k].group() == "nodes")
						{
							time += 2.0;
						}
					}
				}
				algResults.distance = distance;
			}else{
				// Case astar path algorithm
				time = 4;
				for(var k = 1; k < algResults.path.length - 1; ++k)
				{
					if(algResults.path[k].group() == "edges")
					{
						time += (Number(algResults.path[k].data("weight")) / speed);
					}else{
						if(algResults.path[k].group() == "nodes")
						{
							time += 2.0;
						}
					}
				}
		}	
		// Compute abstract time to real time
		let beginEndTimeDiff = Math.abs(beginTime.getTime() - endTime.getTime());
		let secondsInAbsractTime = beginEndTimeDiff / time;
			
		// Compute how many abstract time goes thtow from start to today
		let todayBeginTimeDiff = Math.abs(today.getTime() - beginTime.getTime());
		timeUnitsTodayBeginDiff = todayBeginTimeDiff / secondsInAbsractTime + 4;
		
        // for astar, highlight first and final before showing path
        if (algResults.distance) {
          // Among DFS, BFS, A*, only A* will have the distance property defined
          algResults.path[0].addClass('highlighted start');
          algResults.path[algResults.path.length - 1].addClass('highlighted end');
          // i is not advanced to 1, so start node is effectively highlighted twice.
          // this is intentional; creates a short pause between highlighting ends and highlighting the path
        }
        return new Promise(resolve => {
          let highlightNext = () => {
            if (currentAlgorithm === algResults && i < algResults.path.length) {
			  while(timeUnitsTodayBeginDiff > 0){
			    if(algResults.path[i].group() == "nodes")
			    {
					timeUnitsTodayBeginDiff -= 2;
			    }else{
					timeUnitsTodayBeginDiff -= algResults.path[i].data("weight") / speed;
				}
				algResults.path[i].addClass('highlighted');
				setTimeout(highlightNext, 500);
				
				i++;
			  }

            } else {
              // resolve when finished or when a new algorithm has started visualization
              resolve();
            }
          }
		  cy.animate({
			fit: {
				eles: algResults.path[i],
				padding: 200
			},
			duration: 700,
			easing: 'ease',
			queue: true
		});
		algResults.path[i].addClass('delivery-place');
		highlightNext();
        });
      }
    };
	
	/*Promise for appplying algorithm*/
    let applyAlgorithmFromSelect = () => Promise.resolve( algo ).then( getAlgorithm ).then( runAlgorithm ).then( animateAlgorithm );
	
	/*Variable for saving delivery data*/
	let deliveryData;
	
	/* Function for appling dataset
	*  Takes: dataset
	*  Applies dataset to cytoscape map
	*/
	let applyDatasetDeliveries = dataset => {
		deliveryData = dataset;	
	};
	
	/*Promise for getting deliveries dataset*/
	let applyDatasetD = () => Promise.resolve( "deliveries.json" ).then( getDataset ).then( applyDatasetDeliveries );
	
	// Function for adding event listeners to submit
	let setEventListeners = () => {
		$("#submit").on("click", function()
		{
			cy.$().removeClass('delivery-place');
			cy.$().removeClass('start-delivery-place');
			cy.$().removeClass('end-delivery-place');
			
			cy.stop();
			// Here must be some validation
			if($("#truck-number").val() != "" && $("#truck-number").val() != undefined)
			{
				// Simple search
				for(var i = 0; i < deliveryData.length; ++i)
				{
					if(deliveryData[i]["id"] == $("#truck-number").val())
					{
						// Algo for getting lenght of all path 
						// Quick path
						if(deliveryData[i]["path"] == "astar")
						{
							if(today == undefined)
							{
								today = new Date();
							}
							speed = speedQuick;
							begin = deliveryData[i]["start"];
							end = deliveryData[i]["end"];
							algo = "astar";
							beginTime = new Date(deliveryData[i]["departure_date"]);
							endTime = new Date(deliveryData[i]["receiving_date"]);
							// Get today date to compare
							if(today.getTime() < endTime.getTime()){
								tryPromise(applyAlgorithmFromSelect);
							}else if(today.getTime() < beginTime.getTime())
							{
								
								cy.getElementById(begin).addClass("start-delivery-place");
								cy.animate({
									fit: {
										eles: cy.getElementById(begin),
										padding: 200
									},
									duration: 700,
									easing: 'ease',
									queue: true
								});
							}
							else{
								cy.getElementById(end).addClass("end-delivery-place");
								cy.animate({
									fit: {
										eles: cy.getElementById(end),
										padding: 200
									},
									duration: 700,
									easing: 'ease',
									queue: true
								});
							}
						}else{
							if(today == undefined)
							{
								today = new Date();
							}
							// Regular delivery
							speed = speedRegular;
							begin = deliveryData[i]["start"];
							end = deliveryData[i]["end"];
							algo = "path";
							path = deliveryData[i]["path"];
							beginTime = new Date(deliveryData[i]["departure_date"]);
							endTime = new Date(deliveryData[i]["receiving_date"]);
							// Get today date to compare
							var today = new Date();
							if(today.getTime() < endTime.getTime()){
								tryPromise(applyAlgorithmFromSelect);
							}else if(today < beginTime)
							{
								cy.getElementById(begin).addClass("start-delivery-place");
								cy.animate({
									fit: {
										eles: cy.getElementById(begin),
										padding: 200
									},
									duration: 700,
									easing: 'ease',
									queue: true
								});
							}
							else{
								cy.getElementById(end).addClass("end-delivery-place");
								cy.animate({
									fit: {
										eles: cy.getElementById(end),
										padding: 200
									},
									duration: 700,
									easing: 'ease',
									queue: true
								});
							}
						}
						return true;
					}
				}
			}
		});
	}
		
	// </Helper functions>
	
	// Write data to page
	tryPromise(applyDatasetD).then(setEventListeners);
	// Create cytoscape map for graph
    cy = window.cy = cytoscape({
      container: $('#cy')
    });
	
	
	// All promises and events
    tryPromise( applyDatasetFromSelect ).then( applyStylesheetFromSelect ).then( applyLayoutFromSelect );
  });
})();

// tooltips with jQuery
$(document).ready(() => $('.tooltip').tooltipster());