(function(){
  document.addEventListener('DOMContentLoaded', function(){
	// Note that $$ or $ is usually refers to getting elements from page
	// Some cool jQuery style of names
	// Operator => is new ECMAscript 6 specification
	// It works the same as 
	/*
		var a = [
			"We're up all night 'til the sun",
			"We're up all night to get some",
			"We're up all night for good fun",
			"We're up all night to get lucky"
		];

		// These two assignments are equivalent:

		// Old-school:
		var a2 = a.map(function(s){ return s.length });

		// ECMAscript 6 using arrow functions
		var a3 = a.map( s => s.length );
	*/
	// <Helper functions>
	// Function for creating array from elements with specific selector 
    let $$ = selector => Array.from( document.querySelectorAll( selector ) );
	
	// Function for selecting all elements with all selectors
    let $ = selector => document.querySelector( selector );

	// Function for trying promisses 
    let tryPromise = fn => Promise.resolve().then( fn );

	// Function for creating json from object
    let toJson = obj => obj.json();
	
	// 	Function for creating plain text from object
    let toText = obj => obj.text();

	// Initialize cytoscape map for future adding graph
    let cy;

	// Promise for reading specific stylesheet
    let $stylesheet = $('#style');
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
    //let $dataset = $('#data');
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
      concentricCentrality: {
        name: 'concentric',
        padding: layoutPadding,
        animate: true,
        animationDuration: maxLayoutDuration,
        concentric: concentric,
        levelWidth: levelWidth
      },
      concentricHierarchyCentrality: {
        name: 'concentric',
        padding: layoutPadding,
        animate: true,
        animationDuration: maxLayoutDuration,
        concentric: concentric,
        levelWidth: levelWidth,
        sweep: Math.PI * 2 / 3,
        clockwise: true,
        startAngle: Math.PI * 1 / 6
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
    let applyLayoutFromSelect = () => Promise.resolve( $layout.value ).then( getLayout ).then( applyLayout );

	// Get algorithms
    let $algorithm = $('#algorithm');
    let getAlgorithm = (name) => {
      switch (name) {
        case 'bfs': return Promise.resolve(cy.elements().bfs.bind(cy.elements()));
        case 'dfs': return Promise.resolve(cy.elements().dfs.bind(cy.elements()));
        case 'astar': return Promise.resolve(cy.elements().aStar.bind(cy.elements()));
        case 'none': return Promise.resolve(undefined);
        case 'custom': return Promise.resolve(undefined); // replace with algorithm of choice
        default: return Promise.resolve(undefined);
      }
    };
	
	// Values for A* algorithm
    let runAlgorithm = (algorithm) => {
      if (algorithm === undefined) {
        return Promise.resolve(undefined);
      } else {
        let options = {
          root: '#' + $("#start-point").value,
          // astar requires target; goal property is ignored for other algorithms
          goal: '#' + $("#end-point").value
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
        // for astar, highlight first and final before showing path
        if (algResults.distance) {
          // Among DFS, BFS, A*, only A* will have the distance property defined
          algResults.path.first().addClass('highlighted start');
          algResults.path.last().addClass('highlighted end');
          // i is not advanced to 1, so start node is effectively highlighted twice.
          // this is intentional; creates a short pause between highlighting ends and highlighting the path
        }
        return new Promise(resolve => {
          let highlightNext = () => {
            if (currentAlgorithm === algResults && i < algResults.path.length) {
              algResults.path[i].addClass('highlighted');
              i++;
              setTimeout(highlightNext, 500);
            } else {
              // resolve when finished or when a new algorithm has started visualization
              resolve();
            }
          }
          highlightNext();
        });
      }
    };
    let applyAlgorithmFromSelect = () => Promise.resolve( $algorithm.value ).then( getAlgorithm ).then( runAlgorithm ).then( animateAlgorithm );
	// </Helper functions>
	
	// Create cytoscape map for graph
    cy = window.cy = cytoscape({
      container: $('#cy')
    });

	// All promises and events
	// Load dataset and stylesheet and add layout
    tryPromise( applyDatasetFromSelect ).then( applyStylesheetFromSelect ).then( applyLayoutFromSelect );

    $layout.addEventListener('change', applyLayoutFromSelect);

    $('#redo-layout').addEventListener('click', applyLayoutFromSelect);

	// Listener for showing or not selects
    $algorithm.addEventListener('change', function()
	{
		$(".hidden-error-start").style.visibility = "hidden";
		$(".hidden-error-end").style.visibility = "hidden";
		if($algorithm.value == "bfs" || $algorithm.value == "dfs")
		{
			$(".hidden-select-start").style.visibility = "visible";
			$(".hidden-select-end").style.visibility = "hidden";
			$(".hidden-button").style.visibility = "visible";
		}else{
			if($algorithm.value == "astar")
			{
				$(".hidden-select-start").style.visibility = "visible";
				$(".hidden-select-end").style.visibility = "visible";
				$(".hidden-button").style.visibility = "visible";
			}else{
				$(".hidden-select-start").style.visibility = "hidden";
				$(".hidden-select-end").style.visibility = "hidden";
				$(".hidden-button").style.visibility = "hidden";
			}
		}	
	});
	
	// Applying algorithm
    $('#do-algorithm').addEventListener('click', function()
	{		
		if($algorithm.value == "bfs" || $algorithm.value == "dfs")
		{
			if($("#start-point").value == "None")
			{
				$(".hidden-error-start").style.visibility = "visible";
				return false;
			}else{
				tryPromise(applyAlgorithmFromSelect);
			}
		}else{
			if($algorithm.value == "astar")
			{
				if($("#start-point").value == "None" || $("#end-point").value == "None")
				{
					$(".hidden-error-start").style.visibility = "visible";
					$(".hidden-error-end").style.visibility = "visible";
					return false;
				}else{
					tryPromise(applyAlgorithmFromSelect);
				}
			}
		}
		
	});
	
	// Listener on change start point
	$("#start-point").addEventListener('change', function()
	{
		$(".hidden-error-start").style.visibility = "hidden";
	});
	
	// Listener on change end point
	$("#end-point").addEventListener('change', function()
	{
		$(".hidden-error-end").style.visibility = "hidden";
	});
  });
})();

// tooltips with jQuery
$(document).ready(() => $('.tooltip').tooltipster());