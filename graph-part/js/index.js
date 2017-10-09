/*
*  This file contains functions<, which are used for all pages with cytoscape map/graph
*/
// Function for creating array from elements with specific selector 
let $$ = selector => Array.from( document.querySelectorAll( selector ) );

// Function for trying promisses 
let tryPromise = fn => Promise.resolve().then( fn );

// Function for creating json from object
let toJson = obj => obj.json();
	
// 	Function for creating plain text from object
let toText = obj => obj.text();

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
    cy.zoom(0.001);
    cy.pan({ x: -9999999, y: -9999999 });

    // replace eles
    cy.elements().remove();
    cy.add( dataset );
};

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
/*</helpers for layout>*/

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




