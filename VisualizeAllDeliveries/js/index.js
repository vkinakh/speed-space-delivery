(function(){
  document.addEventListener('DOMContentLoaded', function(){
	// Help variables 
	// Begin and end are reqiured for aStar algorithm
	// Path for custom algorithm
	// Algo variable for changing algorithm
	// speed variable for speed of shutle
	let begin, end, path, algo, speed;

	// <Helper functions>
	// Function for creating array from elements with specific selector 
    let $$ = selector => Array.from( document.querySelectorAll( selector ) );
	
	// Function for selecting all elements with all selectors
    //let $ = selector => document.querySelector( selector );

	// Function for trying promisses 
    let tryPromise = fn => Promise.resolve().then( fn );

	// Function for creating json from object
    let toJson = obj => obj.json();
	
	// 	Function for creating plain text from object
    let toText = obj => obj.text();

	// Initialize cytoscape map for future adding graph
    let cy;
	
	// Promise for reading specific stylesheet
    let getStylesheet = name => {
      let convert = res => name.match(/[.]json$/) ? toJson(res) : toText(res);

      return fetch(`stylesheets/${name}`).then( convert );
    };
    let applyStylesheet = stylesheet => {
      if( typeof stylesheet === typeof '' ){
        cy.style().fromString( stylesheet ).update();
      } else {
        cy.style().fromJson( stylesheet ).update();
      }
    };
    let applyStylesheetFromSelect = () => Promise.resolve( "custom-style.json" ).then( getStylesheet ).then( applyStylesheet );

	// Promise for reading specific dataset
    let getDataset = name => fetch(`datasets/${name}`).then( toJson );
    let applyDataset = dataset => {
      // so new eles are offscreen
      cy.zoom(0.001);
      cy.pan({ x: -9999999, y: -9999999 });

      // replace eles
      cy.elements().remove();
      cy.add( dataset );
    }
    let applyDatasetFromSelect = () => Promise.resolve( "custom.json" ).then( getDataset ).then( applyDataset );

	// Functions for getting layer
    let calculateCachedCentrality = () => {
      let nodes = cy.nodes();

      if( nodes.length > 0 && nodes[0].data('centrality') == null ){
        let centrality = cy.elements().closenessCentralityNormalized();

        nodes.forEach( n => n.data( 'centrality', centrality.closeness(n) ) );
      }
    };

    let $layout = $('#layout');
    let maxLayoutDuration = 1500;
    let layoutPadding = 50;
    let concentric = function( node ){
      calculateCachedCentrality();

      return node.data('centrality');
    };
    let levelWidth = function( nodes ){
      calculateCachedCentrality();

      let min = nodes.min( n => n.data('centrality') ).value;
      let max = nodes.max( n => n.data('centrality') ).value;
      return ( max - min ) / 5;
    };
	
	// Dict of all layers
    let layouts = {
      cola: {
        name: 'cola',
        padding: layoutPadding,
        nodeSpacing: 12,
        edgeLengthVal: 45,
        animate: true,
        randomize: true,
        maxSimulationTime: maxLayoutDuration,
        boundingBox: { // to give cola more space to resolve initial overlaps
          x1: 0,
          y1: 0,
          x2: 10000,
          y2: 10000
        },
        edgeLength: function( e ){
          let w = e.data('weight');

          if( w == null ){
            w = 0.5;
          }

          return 45 / w;
        }
      },
      custom: { // replace with your own layout parameters
        name: 'preset',
        padding: layoutPadding
      }
    };
    let prevLayout;
    let getLayout = name => Promise.resolve( layouts[ name ] );
    let applyLayout = layout => {
      if( prevLayout ){
        prevLayout.stop();
      }

      let l = prevLayout = cy.makeLayout( layout );

      return l.run().promiseOn('layoutstop');
    }
    let applyLayoutFromSelect = () => Promise.resolve( "cola" ).then( getLayout ).then( applyLayout );

	// Get algorithms
    let getAlgorithm = (name) => {
      switch (name) {
        case 'bfs': return Promise.resolve(cy.elements().bfs.bind(cy.elements()));
        case 'dfs': return Promise.resolve(cy.elements().dfs.bind(cy.elements()));
        case 'astar':return Promise.resolve(cy.elements().aStar.bind(cy.elements()));
        case 'none': return Promise.resolve(undefined);
        case 'path': return Promise.resolve(cy.elements().aStar.bind(cy.elements())); // replaced with created algorithm
        default: return Promise.resolve(undefined);
      }
    };
	
	// Values for A* algorithm
    let runAlgorithm = (algorithm) => {
      if (algorithm === undefined) {
        return Promise.resolve(undefined);
      } else{
        let options = {
          root: '#' + begin,
          // astar requires target; goal property is ignored for other algorithms
          goal: '#' + end,
		  weight : function(edge){
			  return Number(edge.weight);
		  }
        };
        return Promise.resolve(algorithm(options));
      }
    }
    let currentAlgorithm;
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
          algResults.path[ids.length - 1].addClass('highlighted end');
          // i is not advanced to 1, so start node is effectively highlighted twice.
          // this is intentional; creates a short pause between highlighting ends and highlighting the path
        }
        return new Promise(resolve => {
          let highlightNext = () => {
            if (currentAlgorithm === algResults && i < algResults.path.length) {
              algResults.path[i].addClass('highlighted');
             
			  if(Number(algResults.path[i].id()) > 30)
			  {
				  //alert(algResults.path[i].data('weight'));
				  setTimeout(highlightNext, 500 * algResults.path[i].data('weight') / speed);
			  }else{
				setTimeout(highlightNext, 500);
			  }
			  
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
		
		$("#past-deliveries").append("<tr><th> Id </th><th> Mass </th><th> Start point </th><th>End point</th><th> Path </th><th> Type </th><th> Departure date</th><th> Receiving date</th></tr>");		
		// Add past deliveries
		for(var i = 0; i < pastDeliveries.length; ++i)
		{
			$("#past-deliveries").append("<tr><td>" + pastDeliveries[i]['id'] + "</td><td>" + pastDeliveries[i]['mass'] + "</td><td>" + 
			pastDeliveries[i]['start'] + "</td><td>" + pastDeliveries[i]['end'] + "</td><td>" + pastDeliveries[i]['path'] + "</td><td>" + 
			pastDeliveries[i]['type'] +"</td><td>" + pastDeliveries[i]['departure_date'] +"</td><td>" +  pastDeliveries[i]['receiving_date'] + "</td></tr>");
		}
		
		$("#active-deliveries").append("<tr><th> Id </th><th> Mass </th><th> Start point </th><th>End point</th><th> Path </th><th> Type </th><th> Departure date</th><th> Receiving date</th></tr>");	
		// Add active deliveries
		for(var i = 0; i < activeDeliveries.length; ++i)
		{
			$("#active-deliveries").append("<tr><td>" + activeDeliveries[i]['id'] + "</td><td>" + activeDeliveries[i]['mass'] + "</td><td>" + 
			activeDeliveries[i]['start'] + "</td><td>" + activeDeliveries[i]['end'] + "</td><td>" + activeDeliveries[i]['path'] + "</td><td>" + 
			activeDeliveries[i]['type'] +"</td><td>" + activeDeliveries[i]['departure_date'] +"</td><td>" +  activeDeliveries[i]['receiving_date'] + "</td></tr>");
		}
		
		$("#future-deliveries").append("<tr><th> Id </th><th> Mass </th><th> Start point </th><th>End point</th><th> Path </th><th> Type </th><th> Departure date</th><th> Receiving date</th></tr>");	
		// Add past deliveries
		for(var i = 0; i < futureDeliveries.length; ++i)
		{
			$("#future-deliveries").append("<tr><td>" + futureDeliveries[i]['id'] + "</td><td>" + futureDeliveries[i]['mass'] + "</td><td>" + 
			futureDeliveries[i]['start'] + "</td><td>" + futureDeliveries[i]['end'] + "</td><td>" + futureDeliveries[i]['path'] + "</td><td>" + 
			futureDeliveries[i]['type'] +"</td><td>" + futureDeliveries[i]['departure_date'] +"</td><td>" +  futureDeliveries[i]['receiving_date'] + "</td></tr>");
		}
	}
	
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