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
	
	/* <Helper functions> */
	// Function for creating array from elements with specific selector 
    let $$ = selector => Array.from( document.querySelectorAll( selector ) );

	// Function for trying promisses 
    let tryPromise = fn => Promise.resolve().then( fn );

	// Function for creating json from object
    let toJson = obj => obj.json();
	
	// 	Function for creating plain text from object
    let toText = obj => obj.text();

	// Initialize cytoscape map for future adding graph
    let cy;
	
	/*
	* Function for reading stylesheet using fetch JS API
	* Takes: filename for specific stylesheet
	* Return: readed file
	*/
    let getStylesheet = name => {
      let convert = res => name.match(/[.]json$/) ? toJson(res) : toText(res);

      return fetch(`stylesheets/${name}`).then( convert );
    };
	
	/*
	* Function for applying stylesheet
	* Takes: stylesheet
	* Then applies stylwsheet to cytoscape map
	*/
    let applyStylesheet = stylesheet => {
      if( typeof stylesheet === typeof '' ){
        cy.style().fromString( stylesheet ).update();
      } else {
        cy.style().fromJson( stylesheet ).update();
      }
    };
	
	/*Promise for resolving stylesheet*/
    let applyStylesheetFromSelect = () => Promise.resolve( "style.json" ).then( getStylesheet ).then( applyStylesheet );

	/* Funtcion for readeing .json dataset using fetch API
	*  Takes: filename
	*  Return: dataset in .json format
	*/
    let getDataset = name => fetch(`datasets/${name}`).then( toJson );
	
	/* Function for applying dataset to cytoscape map
	*  Takes: dataset
	*  Applies dataset to map
	*/
    let applyDataset = dataset => {
      // so new eles are offscreen
      cy.zoom(0.001);
      cy.pan({ x: -9999999, y: -9999999 });

      // replace eles
      cy.elements().remove();
      cy.add( dataset );
    }
	
	/*Promise for applying dataset from select*/
    let applyDatasetFromSelect = () => Promise.resolve( "planets.json" ).then( getDataset ).then( applyDataset );

	/*
	* Function for calculating cached centrality
	* Works with cytooscape nodes
	*/
    let calculateCachedCentrality = () => {
      let nodes = cy.nodes();
      if( nodes.length > 0 && nodes[0].data('centrality') == null ){
        let centrality = cy.elements().closenessCentralityNormalized();

        nodes.forEach( n => n.data( 'centrality', centrality.closeness(n) ) );
      }
    };
	/*<helpers for layour>*/
    let maxLayoutDuration = 1500;
    let layoutPadding = 50;
	/*</helpers for layout>*/
	
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
          x2: 15000,
          y2: 15000
        },
        edgeLength: function( e ){
          let w = e.data('weight');

          if( w == null ){
            w = 0.5;
          }

          return 45 / w;
        }
      }
    };
	
	/* Function for getting layout
	*  Takes: name
	*  Returns: layout from collection
	*/
    let getLayout = name => Promise.resolve( layouts[ name ] );
	
	/* Function for appling layout
	*  Takes: layout 
	*  Applies layout to cytoscape map
	*/
    let applyLayout = layout => {
      let l = cy.makeLayout( layout );
      return l.run().promiseOn('layoutstop');
    }
	
	/*Promise for appling layout to cytoscape map*/
    let applyLayoutFromSelect = () => Promise.resolve( "cola" ).then( getLayout ).then( applyLayout );

	/* Function for getting algorithm
	*  Takes: name of algorithm
	*  Return: promise with algorithm
	*/
    let getAlgorithm = (name) => {
      switch (name) {
        case 'astar':return Promise.resolve(cy.elements().aStar.bind(cy.elements()));
        case 'path': return Promise.resolve(cy.elements().aStar.bind(cy.elements())); // replaced with created algorithm
        default: return Promise.resolve(undefined);
      }
    };
	
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
	
	let deliveryData;
	let applyDatasetDeliveries = dataset => {
		deliveryData = dataset;	
	};
	
	let applyDatasetD = () => Promise.resolve( "deliveries.json" ).then( getDataset ).then( applyDatasetDeliveries );
	
	// Function for adding event listeners to submit
	let setEventListeners = () => {
		$("#submit").on("click", function()
		{
			cy.$().removeClass('delivery-place');
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