(function(){
  document.addEventListener('DOMContentLoaded', function(){
	// Help variables 
	// Begin and end are reqiured for aStar algorithm
	// Path for custom algorithm
	// Algo variable for changing algorithm
	// speed variable for speed of shutle
	let begin, end, path, algo, speed;

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
      currentAlgorithm = algResults;
      if (algResults === undefined || algResults.path === undefined) {
        return Promise.resolve();
      }
      else {
        let i = 0;
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
		}
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
              algResults.path[i].addClass('highlighted');
			  cy.animate({
				fit: {
					eles: algResults.path[i],
					padding: 100
				},
				duration: 2000,
				easing: 'ease',
				queue: true
			  });
			  setTimeout(highlightNext, 1200);
			  
			  
			   i++;
            } else {
              // resolve when finished or when a new algorithm has started visualization
              resolve();
            }
          }
          highlightNext();
        });
      }
    };
	
	/*Promise for appplying algorithm*/
    let applyAlgorithmFromSelect = () => Promise.resolve( algo ).then( getAlgorithm ).then( runAlgorithm ).then( animateAlgorithm );
	
	
	let applyDatasetDeliveries = dataset => {
		// Sort dataset
		// Get todays date
		var today = new Date();
		
		// Arrays with deliveries
		var pastDeliveries = new Array();
		var activeDeliveries = new Array();
		var futureDeliveries = new Array();
		
		//  Sort dataset
		for(var i = 0; i < dataset.length; ++i)
		{
			// Check for active and past deliveries 
			if(new Date(dataset[i]["departure_date"]) < today)
			{
				// Past deliveries
				if(new Date(dataset[i]["receiving_date"]) < today)
				{
					pastDeliveries.push(dataset[i]);
				}else{
					activeDeliveries.push(dataset[i]);
				}
			}else{
				futureDeliveries.push(dataset[i]);
			}
		}
		
		$("#past").append("<tr><th> Id </th><th> Mass </th><th> Start point </th><th>End point</th><th> Path </th><th> Type </th><th> Departure date</th><th> Receiving date</th></tr>");		
		// Add past deliveries
		for(var i = 0; i < pastDeliveries.length; ++i)
		{
			$("#past").append("<tr><td>" + pastDeliveries[i]['id'] + "</td><td>" + pastDeliveries[i]['mass'] + "</td><td>" + 
			pastDeliveries[i]['start'] + "</td><td>" + pastDeliveries[i]['end'] + "</td><td>" + pastDeliveries[i]['path'] + "</td><td>" + 
			pastDeliveries[i]['type'] +"</td><td>" + pastDeliveries[i]['departure_date'] +"</td><td>" +  pastDeliveries[i]['receiving_date'] + "</td></tr>");
		}
		
		$("#active").append("<tr><th> Id </th><th> Mass </th><th> Start point </th><th>End point</th><th> Path </th><th> Type </th><th> Departure date</th><th> Receiving date</th></tr>");	
		// Add active deliveries
		for(var i = 0; i < activeDeliveries.length; ++i)
		{
			$("#active").append("<tr><td>" + activeDeliveries[i]['id'] + "</td><td>" + activeDeliveries[i]['mass'] + "</td><td>" + 
			activeDeliveries[i]['start'] + "</td><td>" + activeDeliveries[i]['end'] + "</td><td>" + activeDeliveries[i]['path'] + "</td><td>" + 
			activeDeliveries[i]['type'] +"</td><td>" + activeDeliveries[i]['departure_date'] +"</td><td>" +  activeDeliveries[i]['receiving_date'] + "</td></tr>");
		}
		
		$("#future").append("<tr><th> Id </th><th> Mass </th><th> Start point </th><th>End point</th><th> Path </th><th> Type </th><th> Departure date</th><th> Receiving date</th></tr>");	
		// Add past deliveries
		for(var i = 0; i < futureDeliveries.length; ++i)
		{
			$("#future").append("<tr><td>" + futureDeliveries[i]['id'] + "</td><td>" + futureDeliveries[i]['mass'] + "</td><td>" + 
			futureDeliveries[i]['start'] + "</td><td>" + futureDeliveries[i]['end'] + "</td><td>" + futureDeliveries[i]['path'] + "</td><td>" + 
			futureDeliveries[i]['type'] +"</td><td>" + futureDeliveries[i]['departure_date'] +"</td><td>" +  futureDeliveries[i]['receiving_date'] + "</td></tr>");
		}
	}
	
	/*Promise for getting deliveries dataset*/
	let applyDatasetD = () => Promise.resolve( "deliveries.json" ).then( getDataset ).then( applyDatasetDeliveries );
	
	let createRowListeners = () => {
		// Add event listener for each row in created table
		var tables = document.getElementsByTagName("table");
		for(var j = 0; j < tables.length; ++j){
			var rows = tables[j].getElementsByTagName("tr");
			for(var i = 1; i < rows.length; ++i)
			{
				rows[i].addEventListener('click', function(){									
					if(this.cells[4].innerHTML == "astar")
					{
						// Quick delivery
						speed = 10;
						begin = this.cells[2].innerHTML, end = this.cells[3].innerHTML;
						algo = "astar";
						tryPromise(applyAlgorithmFromSelect);
					}else{
						// In this case path was created manyally or using some other algorithms
						// In DB this case is specified using just list on path nodes
						speed = 5;
						algo = "path";
						path = this.cells[4].innerHTML;
						begin = this.cells[2].innerHTML, end = this.cells[3].innerHTML;
						tryPromise(applyAlgorithmFromSelect);
					}
				});
			}
		}
	}		
	// </Helper functions>
	
	// Write data to page
	tryPromise(applyDatasetD).then(createRowListeners);
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