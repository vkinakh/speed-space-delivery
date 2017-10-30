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
					timeUnitsTodayBeginDiff -= algResults.path[i].data("length") * algResults.path[i].data("difficulty") / speed;
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
	
	/* Variable for saving containers */
	let containers;
	
	/* Function for saving constiners to variable */
	let applyContainers = dataset =>{
		containers = dataset;
	}

	/* Promise for getting container dataset*/
	let applyDatasetContainers = () => Promise.resolve("https://someleltest.herokuapp.com/api/orders/containers?SID=5a425a70c3f5382a0c485de05ca5c1cfa285b91deabcc85defeb1ae803063fa2").then(getDataset).then(applyDatasetContainers);
	
	/*Promise for getting deliveries dataset*/
	let applyDatasetD = () => Promise.resolve("https://someleltest.herokuapp.com/api/orders?SID=5a425a70c3f5382a0c485de05ca5c1cfa285b91deabcc85defeb1ae803063fa2"  ).then( getDataset ).then( applyDatasetDeliveries );
	
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
				let currentDelivery, currentShip;
				for(var i = 0; i < deliveryData.length; ++i)
				{
					if(deliveryData[i]["id"] == $("#truck-number").val())
					{
						currentDelivery = deliveryData[i];
						for(var j = 0; j < containers.length; ++j)
						{
							if(containers[j]["id"] == currentDelivery["containerID"])
							{
								currentShip = containers[j];
							}
							break;
						}
						break;
					}
				}
				
				if(currentDelivery["status"] == "registered" || currentDelivery["status"] == "accepted")
				{
					let begin = findPlanetIdByName(currentDelivery["location"]);
					if(begin != -1)
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
				}else if(currentDelivery["status"] == "inprogress")
				{
					let containerID = this.cells[0].innerHTML;
					let currentPath;
					for(var k = 0; k < containers.length; ++k)
					{
						// Find container with currecnt delivery
						if(containers[k]["id"] == containerID)
						{
							currentPath = String(containers[k]["pathsArray"]).split(',');
							break;
						}
					}
					// Get current contaier path
					let posSource = currentPath.indexOf(this.cells[1].innerHTML);
					let posTarget = currentPath.indexOf(this.cells[2].innerHTML);
						
					// Add planets to path
					planetPath = [];
						
					// Check if container goes into source first
					if(posSource < posTarget)
					{
						for(let index = posSource; posTarget <= posTarget; ++index)
						{
							let idOfPlanet = findPlanetIdByName(currentPath[index]);
							if(idOfPlanet != -1)
							{
								planetPath.push(idOfPlanet);
							}else{
								// Some handlers 
								// Maybe for erroe as a span line 
								return;
							}
						}
							
						path = []
						path.push(planetPath[0]);
						// Now all planets are in array
						for(let index = 1; index < planetPath.length; ++index)
						{
							let pathId = findPathIdById(planetPath[index-1], planetPath[index]);
							if(pathId != -1){
								path.push(pathId);
								path.push(planetPath[index]);
							}else{
								// Also some error
								return;
							}
								
						}
						// Apply algorithm
						algo = "path";
						begin = planetPath[0], end = planetPath[planetPath.length - 1];
						tryPromise(applyAlgorithmFromSelect);
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
    tryPromise( applyDatasetFromSelect ).then( applyPathsFromSelect ).then( applyStylesheetFromSelect ).then( applyLayoutFromSelect );
  });
})();

// tooltips with jQuery
$(document).ready(() => $('.tooltip').tooltipster());