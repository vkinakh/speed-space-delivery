/*
*  This file contains functions, which are used for all pages with cytoscape map/graph
*/
// Global variable for saving planets and paths
let planets, paths;

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
let getDataset = name => fetch(name).then( toJson );

/* Function for applying dataset to cytoscape map
*  Takes: dataset
*  Applies dataset to map
*/
let applyDataset = dataset => {
    cy.zoom(0.001);
    cy.pan({ x: -9999999, y: -9999999 });
	
	// Save planets 
	planets = dataset;

    // replace eles
    cy.elements().remove();
    cy.add( dataset );
};

/* Function for applying paths to cytoscape map
*  Takes: dataset
*  Applies dataset to map
*/
let applyPaths = dataset => {
	// Save paths
	paths = dataset;
	cy.zoom(0.001);
	cy.pan({ x: -9999999, y: -9999999 });
	
	// Reorganize ids 
	for(let i = 0; i < dataset.length; ++i)
	{
		dataset[i]["data"]["id"] = cy.elements().length + 1 + i;
		
		let source = dataset[i]["data"]["source"];
		// Find element with name == source
		let findSource = -1;
		for(let j = 0; j < planets.length; ++j)
		{
			if(source == planets[j]["data"]["name"])
			{
				findSource = j + 1;
				dataset[i]["data"]["source"] = planets[j]["data"]["id"];
				break;
			}
		}
		
		// Source wasnt founded
		if(findSource == -1)
		{
			dataset = dataset.filter(item => item !== dataset[i]);
		}	
		
		let target = dataset[i]["data"]["target"];
		
		let findTarget = -1;
		// Find element with name == target
		for(let k = 0; k < planets.length; ++k)
		{
			if(target == planets[k]["data"]["name"])
			{
				findTarget = k + 1;
				dataset[i]["data"]["target"] = planets[k]["data"]["id"];
				break;
			}
		}
		
		if(findTarget == -1)
		{
			dataset = dataset.filter(item => item !== dataset[i]);
		}
	}		
	
	// add elements
	cy.add(dataset);
};

/*Promise for applying dataset from select*/
let applyDatasetFromSelect = () => Promise.resolve( "https://someleltest.herokuapp.com/api/planets?SID=1f9474729a96e84a71d51fe2660c18e1f94de4b242b6a66956d54df762bbfbf3" ).then( getDataset ).then( applyDataset );

/*Promise for applying paths*/
let applyPathsFromSelect = () => Promise.resolve( "https://someleltest.herokuapp.com/api/paths?SID=1f9474729a96e84a71d51fe2660c18e1f94de4b242b6a66956d54df762bbfbf3").then(getDataset).then(applyPaths)

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
let getAlgorithm = () => {
	return Promise.resolve(cy.elements().aStar.bind(cy.elements()));
};

/* Helper function for finding if of planet id by name
*  Takes: string name 
*  Returns: string id for this planet
*/
let findPlanetIdByName = (name) =>{
	for(let i = 0; i < planets.length; ++i)
	{
		if(planets[i]["data"]["name"] == name)
		{
			return planets[i]["data"]["id"];
		}				
	}
	return -1;
}
	
/* Helper function for finding path id by source and target
*  Takes: string target id, string source id
*  Return: id of path 
*/
let findPathIdById = (sourceID, targetID) =>{
	for(let i = 0; i < paths.length; ++i)
	{
		if(paths[i]["data"]["sourceID"] == sourceID && paths[i]["data"]["targetID"] == targetID)
		{
			return paths[i]["data"]["id"];
		}
	}
	return -1;
}

/* Helper function for converting time from DB into 
*  format: days hours minutes seconds
*  Takes: number from DB
*  Return: string
*/
function formatTime(val){
    let date = new Date(0);
 date.setHours(date.getHours()-Math.abs(date.getTimezoneOffset()/60));
 let formatString = '';
    date.setSeconds(val*24*3600);
    if(date.getDate()-1>0) formatString += date.getDate()-1 + ' days ';
  formatString += date.toTimeString().split(' ')[0];
    return formatString;
}


