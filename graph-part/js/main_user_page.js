/* Main functions for work in main user page */
// System ID for each user (taken from local storage after authentification)
let SID = "3f46fd78c4c97533a687e06fafe91872d8fe40dc755220d82f4e55d2be118ca4";

// Global variable for saving planets and paths
let planets, paths;

/*Variable for saving delivery data*/
let deliveryData;

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
    return fetch(`../stylesheets/${name}`).then( convert );
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
    cy.pan({ x:32200, y: 0 });
	
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
let applyDatasetFromSelect = () => Promise.resolve( "https://someleltest.herokuapp.com/api/planets?SID=" + SID).then( getDataset ).then( applyDataset );

/*Promise for applying paths*/
let applyPathsFromSelect = () => Promise.resolve( "https://someleltest.herokuapp.com/api/paths?SID=" + SID).then(getDataset).then(applyPaths)

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

/* Function for validating start planet 
*  Takes: planet name
*  Checks if planet is in DB
*  Return: bool
*/
let validatePlanetName =(name) =>{
	let valid = false;
	for(let i = 0; i < planets.length; ++i)
	{
		if(planets[i]["data"]["name"] == name && planets[i]["data"]["type"] != "star")
		{
			valid = true;
			break;
		}
	}
	return valid;
};

// Function for validating email
let validateEmail = (email) => {
	let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
	return re.test(email);
};

/* Main functions to work */
(function(){
	$(document).ready(function(){
		/* Functions for working with graph */
	// Initialize cytoscape map for future adding graph
	let cy;
	
	// Create cytoscape map for graph
    cy = window.cy = cytoscape({
      container: $('#cy')
    });
	
	/* Display planet info on mouseover */
	cy.on('mouseover', 'node', function(event) {
		let node = event.cyTarget;
		let info = "Planet name: " + node.data("name") + "<br/>" + "Galactic: " + node.data("galactic") + "<br/>"+"URL: " + node.data("image");
		node.qtip({
			content: info,
			show: {
				event: event.type,
				ready: true
			},
			hide: {
				event: 'mouseout unfocus'
			},
			style: {classes: 'qtip-bootstrap'}
		}, event);
	});
	/* Functions for working with graph */
	
	/* Functions for register order part */
	/* Variable for saving original content inside dialog window */
	let originalDialogContentOrder = $("#dialog-order").html();
	
	/* Function for clearing errors */
	let clearErrors = () =>{
		$('#sender').qtip("hide");
		$('#reciever').qtip("hide");
		$('#from').qtip("hide");
		$('#to').qtip("hide");
		$('#weight').qtip("hide");
		$('#volume').qtip("hide");
		$('#type').qtip("hide");
	};  
	
	/* Dialog window to register order */
	let dialogOrder;
	
	/* Dialog window properties */
	dialogOrder = $( "#dialog-order" ).dialog({
		autoOpen: false,
		height: 300,
		width: 650,
		modal: true
	});
	
	/*Function for registering order
	* It is a final method 
	* It sends register response to server and order will be saved in DB
	*/
	let registerOrder = (sender, receiver, start, to, weight, volume, type) =>
	{
		$.ajax({
			url: 'https://someleltest.herokuapp.com/api/orders',
			type: 'POST',
			dataType: 'json',
			data: JSON.parse('{"SID":"'+  SID + '","order":{"sender" : "' + sender + '" ,"reciever" : "' + receiver+'" ,"from":"' + start + '" ,"to": "' + to +  '" ,"weight": '+ weight + ' ,"volume":' + volume + ' ,"type": "' + type +'", "estimate":' + true + '}}'),
			success: function (data, textStatus, xhr) {
				$("#dialog-order").html('<p>Your delivery was succesfully submitted!</p>' + 
				'<button type="button" value="Ok" id="ok" name="ok" class="btn btn-info"></button>');
				 /*Event listeners for dialog window */
				$("#ok").on("click", function(){
					dialogOrder.dialog("close");
					$("#dialog-order").html(originalDialogContentOrder);
				});
			},
			error: function (xhr, textStatus, errorThrown) {
				$("#dialog-order").html('<p>During submitting some error occured!</p>' + 
				'<input type="button" value="Ok" id="ok" name="ok"></input>');
				 /*Event listeners for dialog window */
				$("#ok").on("click", function(){
					dialogOrder.dialog("close");
					$("#dialog-order").html(originalDialogContentOrder);
				});
			}
		});
	};
	
	// Names of start and end planets
	let startPlanetNameOrder, endPlanetNameOrder;
	
	/* Clear all errors when input*/
	$("#sender").on("input", function(){
		clearErrors();
	});
	
	$("#reciever").on("input", function(){
		clearErrors();
	});
	
	$("#from").on("input", function(){
		clearErrors();
	});
	
	$("#to").on("input", function(){
		clearErrors();
	});
	
	$("#weight").on("input", function(){
		clearErrors();
	});
	
	$("#volume").on("input", function(){
		clearErrors();
	});
	
	$("#type").on("input", function(){
		clearErrors();
	});
	
	/* Function for clearing start planet */
	$("#clear-from").on("click", function(){
		let startId = findPlanetIdByName(startPlanetNameOrder);
		cy.getElementById(startId).removeClass("highlighted start");
		startPlanetNameOrder = "";
		$("#from").html("Click to select start planet");
	});
	
	/* Function for clering end planet */
	$("#clear-to").on("click", function(){
		let endId = findPlanetIdByName(endPlanetNameOrder);
		cy.getElementById(endId).removeClass("highlighted end");
		endPlanetNameOrder = "";
		$("#to").html("Click to select end planet");
	});
	
	/* Fucntion for registering order
	*  Works after tapping on some node 
	*  Saves start and end nodes data
	*/
	cy.on('tap', 'node', function(evt){
		// Remove all error 
		clearErrors();

		// Get all data
		let sender = $("#sender").val();
		let receiver = $("#reciever").val();
		
		if(sender != "" && sender != undefined && validateEmail(sender))
		{
			if(receiver != "" &&  receiver != undefined && validateEmail(receiver))
			{
				if(startPlanetNameOrder == undefined || startPlanetNameOrder == "")
				{
					startPlanetNameOrder = this.data("name");
					this.addClass('highlighted start');
					$("#from").html(startPlanetNameOrder);
					dialogOrder.dialog("open");
				}else{
					if(endPlanetNameOrder == "" || endPlanetNameOrder == undefined)
					{
						endPlanetNameOrder = this.data("name");
						this.addClass('highlighted end');
						$("#to").html(endPlanetNameOrder);
						dialogOrder.dialog("open");
					}
				}
			}else{
			/*	$('#reciever').qtip({
					position: {
						target: $("#reciever"),
						at: 'top left'
					},
					content: {
						text: 'Error! Enter valid receiver email!'
					},
					show: {ready: true},
					hide: {event: false},
					style: {classes: 'qtip-red qtip-bootstrap'}
				});*/
			}
		}else{
		/*	$('#sender').qtip({
				position: {
					target: $("#sender")
				},
				content: {
					text: 'Error! Enter valid sender email!'
				},
				show: {ready: true},
				hide: {event: false},
				style: {classes: 'qtip-red qtip-bootstrap'}
			});*/
		}
	});
	
	/* Function for submiting order
	*  It is second method 
	*  Takes: data for request
	*  Shows info about delivery 
	*  Wait user to register order
	*/
	let submitOrder = function(sender, receiver, start, to, weight, volume, type)
	{
		let d;
		// Finally make a request
		$.ajax({
			url: 'https://someleltest.herokuapp.com/api/orders',
			type: 'POST',
			dataType: 'json',
			data: JSON.parse('{"SID": "' + SID +'","order":{"sender" : "' + sender + '" ,"reciever" : "' + receiver+'" ,"from":"' + start + '" ,"to": "' + to +  '" ,"weight": '+ weight + ' ,"volume":' + volume + ' ,"type": "' + type +'", "estimate":' + false + '}}'),
			success: function (data, textStatus, xhr) {
				$("#makeOrderForm").css("display", "none");
				$("#dialog-order").html("<p>Total price: " + data['price'] + "</p>"+
				"<p>Total delivery time: " + data['time'] + "</p>" + 
				'<div class="row"><div class="col-6"><button type="button" class="btn btn-info" id="submit-order">Submit</button></div><div class="col-6"><button type="button" class="btn btn-danger" id="cancel-order">Cancel</button></div></div>');
				
				$("#submit-order").on("click", function(){
					registerOrder(sender, receiver, start, to, weight, volume, type);
				});
				$("#cancel-order").on("click", function(){
					dialogOrder.dialog("close");
					$("#dialog-order").html(originalDialogContentOrder);
				});
			},
			error: function (xhr, textStatus, errorThrown) {
				$("#dialog-content").html('<span id="close-dialog" class="close">&times;</span>' + 
				'<p>During submitting some error occured!</p>' + 
				'<input type="button" value="Ok" id="ok" name="ok"></input>');
				 /*Event listeners for dialog window */
				$("#ok").on("click", function(){
					$("#dialog-window").css("display", "none");
				});
			}
		});
	};
	
	let tryOrder = () => {
		clearErrors();
		// Get all data
		let sender = $("#sender").val();
		let receiver = $("#reciever").val();
		let weight = Number($("#weight").val());
		let volume = Number($("#volume").val());
		let type = $("#type").val();
		
		if(sender != "" && sender != undefined && validateEmail(sender))
		{
			if(receiver != "" && receiver != undefined && validateEmail(receiver))
			{
				if(startPlanetNameOrder != "" && startPlanetNameOrder != undefined && validatePlanetName(startPlanetNameOrder))
				{
					if(endPlanetNameOrder != "" && endPlanetNameOrder != undefined && endPlanetNameOrder != startPlanetNameOrder && validatePlanetName(endPlanetNameOrder))
					{
						if(weight != "" && weight != undefined && weight > 0)
						{
							if(volume != "" && volume != undefined && volume > 0)
							{
								if(type != "" && type != undefined)
								{
									submitOrder(sender, receiver, startPlanetNameOrder, endPlanetNameOrder, weight, volume, type);
								}else{
									
									/*$('#type').qtip({
										content: {
											text: 'Error! Select type of delivery!'
										},
										show: {ready: true},
										hide: {event: false},
										style: {classes: 'qtip-red qtip-bootstrap'}
									});*/
								}
							}else{
								/*$('#volume').qtip({
									content: {
										text: 'Error! Enter valid volume!'
									},
									position: {
										target: $("#volume"),
										at: "top left"
									},
									show: {ready: true},
									hide: {event: false},
									style: {classes: 'qtip-red qtip-bootstrap'}
								});*/
							}
						}else{
							/*$('#weight').qtip({
							content: {
								text: 'Error! Enter valid weight!'
							},
							position: {
								target: $("#weight")
							},
							show: {ready: true},
							hide: {event: false},
							style: {classes: 'qtip-red qtip-bootstrap'}
							});*/
						}
					}else{
					/*	$('#to').qtip({
						content: {
							text: 'Error! Select end planet!'
						},
						position: {
							target: $("#to"),
							at: "top left"
						},
						show: {ready: true},
						hide: {event: false},
						style: {classes: 'qtip-red qtip-bootstrap'}
					});*/
					}
				}else{
					/*$('#from').qtip({
						position: {
							target: $("#from")
						},
						content: {
							text: 'Error! Select start planet!'
						},
						show: {ready: true},
						hide: {event: false},
						style: {classes: 'qtip-red qtip-bootstrap'}
					});*/
				}
			}else{
				/*$('#reciever').qtip({
					position: {
						target: $("#reciever"),
						at: 'top left'
					},
					content: {
						text: 'Error! Enter valid receiver email!'
					},
					show: {ready: true},
					hide: {event: false},
					style: {classes: 'qtip-red qtip-bootstrap'}
				});*/
			}
		}else{
		/*	$('#sender').qtip({
				position: {
					target: $("#sender")
				},
				content: {
					text: 'Error! Enter valid sender email!'
				},
				show: {ready: true},
				hide: {event: false},
				style: {classes: 'qtip-red qtip-bootstrap'}
			});*/
		}
	};
	
	$("#make-order").on("click", tryOrder);
		
	/* Open dialog window for registering order */
	$("#register-order").on("click", function(){
		dialogOrder.dialog("open");
		// Clear errors
		clearErrors();
	});
	
	/*Function for showing graph for selecting start planet*/
	$("#from").on("click", function()
	{
		dialogOrder.dialog("close");
		clearErrors();
	});
	
	/* Function for showing graph for selecting end planet */
	$("#to").on("click", function()
	{
		dialogOrder.dialog("close");
		clearErrors();
	});
	/* Functions for register order part*/
	
	/* Functions for track order part*/
	/* Function for appling dataset
	*  Takes: dataset
	*  Applies dataset to cytoscape map
	*/
	let applyDatasetDeliveriesTrack = dataset => {
		deliveryData = dataset;	
	};
	
	/*Promise for getting deliveries dataset*/
	let applyDatasetTrack = () => Promise.resolve("https://someleltest.herokuapp.com/api/orders?SID=" + SID).then( getDataset ).then( applyDatasetDeliveriesTrack );
	
	$("#track-number").on("input", function(){
		$("#error").css("visibility","hidden");
	});
	
	// Help variables 
	// Begin and end are reqiured for aStar algorithm
	// Path for custom algorithm
	// Algo variable for changing algorithm
	let beginTrack, endTrack;
		
	// Todays date
	let today;
	
	// Values for start of jpurney time and for end of journey time
	let beginTime, expectedDeliveryTime;

	/* Variables for working with dialog window*/ 
	let dialogTrack, form;
	
	/* Function for running aStar algorithm
	*  As custom algorithm is aStar - based 
	*  Takes: algrorithm as promise
	*  Sets option from global variables
	*  Return: resolve promise algorithm with options
	*/
	let runAlgorithmTrack = (algorithm) => {
		if (algorithm === undefined) {
			return Promise.resolve(undefined);
		} else{
			let options = {
				root: '#' + beginTrack,
				// astar requires target; goal property is ignored for other algorithms
				goal: '#' + endTrack,
				weight : function(edge){
					return Number(edge.data().length) * Number(edge.data().difficulty);
				}
			};
			return Promise.resolve(algorithm(options));
		}
	};
	
	/*Promise for appplying algorithm*/
	let applyAlgorithmFromSelect = () => tryPromise(getAlgorithm).then( runAlgorithmTrack ).then( animateAlgorithmTrack );
	
	/*Varible for saving curret algorithm*/
	let currentAlgorithm;
	
	/* Function for animating algorithm
	*  In this case it will show the position of delivery 
	*  Takes: algResults returned by runAlgorithm
	*  Applies algorithm with animation
	*/
	let animateAlgorithmTrack = (algResults) => {
		// clear old algorithm results
		cy.$().removeClass('highlighted start end');
		cy.$().removeClass('delivery-place');
		currentAlgorithm = algResults;
		if (algResults === undefined || algResults.path === undefined) {
			return Promise.resolve();
		}	
		else {
			let i = 0;
			// for path algorithm
			// Case astar path algorithm
			let time = 4;
			for(let k = 1; k < algResults.path.length - 1; ++k)
			{
				if(algResults.path[k].group() == "edges")
				{
					time += Number(algResults.path[k].data().length * algResults.path[k].data().difficulty);
			}else{
				if(algResults.path[k].group() == "nodes")
				{
					time += 2.0;
				}
			}
		}
			// Compute abstract time to real time
			let secondsInAbsractTime = expectedDeliveryTime / time;
				
			// Compute how many abstract time goes thtow from start to today
			let todayBeginTimeDiff = Math.abs(today.getTime() - beginTime.getTime());
			let timeUnitsTodayBeginDiff = todayBeginTimeDiff / secondsInAbsractTime + 4;
		
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
					if (currentAlgorithm === algResults && i < algResults.path.length && timeUnitsTodayBeginDiff > 0) {
						do{
							if(algResults.path[i].group() == "nodes")
							{
								timeUnitsTodayBeginDiff -= 2;
							}else{
								timeUnitsTodayBeginDiff -= (Number(algResults.path[i].data().length) * Number(algResults.path[i].data().difficulty));
							}
							if(timeUnitsTodayBeginDiff > 0){
								i++;
							}
						}while(timeUnitsTodayBeginDiff > 0 && i < algResults.path.length);
						cy.animate({
							fit: {
								eles: algResults.path[i],
								padding: 200
							},
							duration: 700,
							easing: 'ease',
							queue: true
						});
						
						if(i < algResults.path.length)
						{	
							// show info
							if(algResults.path[i].group() == "edges")
							{
								$("#delivery-info").text(
								"Your delivery is on path between " + cy.getElementById(algResults.path[i].data().source).data().name + " and " 
								+ cy.getElementById(algResults.path[i].data().target).data().name + ".");
								$("#delivery-info").css("visibility", "visible");
							}
							algResults.path[i].addClass('delivery-place');
							highlightNext();
						}
					} else {
						// resolve when finished or when a new algorithm has started visualization
						resolve();
					}
				}
				highlightNext();
			});
		}
	};
	
	let findDelivery = () =>
	{
		cy.$().removeClass('delivery-place');
		cy.$().removeClass('start-delivery-place');
		cy.$().removeClass('end-delivery-place');
		cy.$().removeClass('highlighted');
		cy.$().removeClass('end');
		cy.$().removeClass('start');
			
		$("#delivery-info").css("visibility", "hidden");
			
		cy.stop();
		// Here must be some validation
		if($("#track-number").val() != "" && $("#track-number").val() != undefined)
		{
			// Simple search
			let currentDelivery = -1;
			for(let i = 0; i < deliveryData.length; ++i)
			{
				if(deliveryData[i]["trackID"] == Number($("#track-number").val()))
				{
					currentDelivery = deliveryData[i];
					break;
				}
			}
				
			if(currentDelivery != -1){
				if(currentDelivery["status"] == "registered" || currentDelivery["status"] == "accepted")
				{
					
					beginTrack = findPlanetIdByName(currentDelivery["from"]);
					if(beginTrack != -1)
					{
						dialogTrack.dialog( "close" );
						cy.getElementById(beginTrack).addClass("start-delivery-place");
						cy.animate({
							fit: {
								eles: cy.getElementById(beginTrack),
								padding: 200
							},
							duration: 700,
							easing: 'ease',		
							queue: true
						});
					}
				}else if(currentDelivery["status"] == "inprogress")
				{
					let beginPlanet = currentDelivery["from"];
					let endPlanet = currentDelivery["to"];
				
					beginTrack = findPlanetIdByName(beginPlanet);
					endTrack = findPlanetIdByName(endPlanet);
					if(beginTrack != -1 && endTrack != -1)
					{
						if(today == undefined)
						{
							today = new Date();
						}	
						
						if(currentDelivery["send_date"] != undefined)
						{
							dialogTrack.dialog( "close" );
							beginTime = new Date(currentDelivery["send_date"]);
							expectedDeliveryTime = currentDelivery["esttime"] * 24 * 60 * 60 * 1000; // in milliseconds
							if(today.getTime() - beginTime.getTime() < expectedDeliveryTime)
							{
								tryPromise(applyAlgorithmFromSelect);
							}else{
								cy.getElementById(endTrack).addClass('delivery-place');	
								cy.animate({
								fit: {
									eles: cy.getElementById(endTrack),
									padding: 200
								},
								duration: 700,
								easing: 'ease',		
								queue: true
								});
							}
						}
					}
				}else if(currentDelivery["status"] == "waitingpickup" || currentDelivery["status"] == "delivered")
				{
					dialogTrack.dialog( "close" );
					endTrack = findPlanetIdByName(currentDelivery["to"]);
					if(beginTrack != -1)
					{
						cy.getElementById(endTrack).addClass("end-delivery-place");
						cy.animate({
							fit: {
								eles: cy.getElementById(endTrack),
								padding: 200
							},
							duration: 700,
							easing: 'ease',		
							queue: true
						});
					}
				}else if(currentDelivery["status"] == "canceled")
				{
					$("#error").html("<b>Error!</b>This delivery was canceled!");
					$("#error").css("visibility","visible");
				}else if(currentDelivery["status"] == "returned")
				{
					$("#error").html("<b>Error!</b>This delivery was returned!");
					$("#error").css("visibility","visible");
				}
			}else{
				$("#error").html("<b>Error!</b>Invalid track ID!");
				$("#error").css("visibility","visible");
			}
		}else{
			$("#error").html("<b>Error!</b>Please, enter track ID!");
			$("#error").css("visibility","visible");
		}
	};
	
	// Write data to page
	tryPromise(applyDatasetTrack);
	
	dialogTrack = $( "#dialog-form" ).dialog({
		autoOpen: false,
		height: 250,
		width: 300,
		modal: true,
		buttons: {
			"Find": findDelivery,
			Cancel: function() {
				dialogTrack.dialog( "close" );
			}
		},
		close: function() {
			form[ 0 ].reset();
		}
	});
	
	form = dialogTrack.find( "form" ).on( "submit", function( event ) {
		event.preventDefault();
		dialogTrack.dialog( "close" );
		findDelivery();
	});	
	
	$( "#track-delivery" ).on( "click", function() {
		dialogTrack.dialog( "open" );
	});
	/* Functions for track order part */
	// Begin and end are reqiured for aStar algorithm
	let beginTable, endTable;
	
	// Variable for storing type of delivery
	let typeTable;
	
	/* Function for running aStar algorithm
	*  As custom algorithm is aStar - based 
	*  Takes: algrorithm as promise
	*  Sets option from global variables
	*  Return: resolve promise algorithm with options
	*/
	let runAlgorithmTable = (algorithm) => {
		if (algorithm === undefined) {
			return Promise.resolve(undefined);
		} else{
			let options = {
				root: '#' + beginTable,
				// astar requires target; goal property is ignored for other algorithms
				goal: '#' + endTable,
				weight : function(edge){
					return Number(edge.data().length) * Number(edge.data().difficulty);
				}
			};
			return Promise.resolve(algorithm(options));
		}
	};
	
	/*Varible for saving current algorithm*/
	let currentAlgorithmTable;
	
	/* Function for animating algorithm
	*  In this case it will show the position of delivery 
	*  Takes: algResults returned by runAlgorithm
	*  Applies algorithm with animation
	*/
	let animateAlgorithmTable = (algResults) => {
		// clear old algorithm results
		cy.$().removeClass('highlighted start end');
		cy.$().removeClass('cheap regular quick');
		currentAlgorithmTable = algResults;
	  
		if (algResults === undefined || algResults.path === undefined) {
			return Promise.resolve();
		}
		else {
			let i = 0;
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
					if (currentAlgorithmTable === algResults && i < algResults.path.length) {
						if(algResults.path[i].group() == 'edges')
						{
							if(typeTable == 'cheap')
							{
								algResults.path[i].addClass('cheap');
							}else
								if(typeTable == 'regular')
								{
									algResults.path[i].addClass('regular');
								}else{
									algResults.path[i].addClass('quick');
								}
						}else{
							algResults.path[i].addClass('highlighted');
						}
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
	
	/* Function for writing orders data to dialog form */
	let applyDatasetDeliveriesTable = data => {
		let table='<table class="table table-bordered table-hover">';
        table+='<tr><th>trackID</th><th>esttime</th><th>sender</th><th>reciever</th><th>type</th><th>status</th><th>reg_date</th><th>price</th>';
		table+='<th>volume</th><th>weight</th><th>location</th><th>to</th><th>from</th></tr>'
        for(let i=0;i<data.length;++i){
        table+="<tr>"
            table+="<td>"+data[i].trackID+"</td>";
            table+="<td>"+formatTime(data[i].esttime)+"</td>";
            table+="<td>"+data[i].sender+"</td>";
            table+="<td>"+data[i].reciever+"</td>";
            table+="<td>"+data[i].type+"</td>";
            table+="<td>"+data[i].status+"</td>";
            table+="<td>"+data[i].reg_date+"</td>";
            table+="<td>"+data[i].price+"</td>";
            table+="<td>"+data[i].volume+"</td>";
            table+="<td>"+data[i].weight+"</td>";
			table+="<td>"+data[i].location+"</td>";
			table+="<td>"+data[i].to+"</td>";
			table+="<td>"+data[i].from+"</td>";
        table+="</tr>"
        }
        table+='</table>';
        $("#orders").html(table);
	};
	
	/* Dialog window */
	let dialogTable;
	dialogTable = $( "#dialog-table" ).dialog({
		autoOpen: false,
		height: 550,
		width: 1050,
		modal: true,
		buttons: {
			Cancel: function() {
				dialogTable.dialog( "close" );
			}
		}
	});
	
	/* Listener for button*/
	$( "#show-table" ).on( "click", function() {
		dialogTable.dialog( "open" );
	});
	
	/*Promise for getting deliveries dataset*/
	let applyDatasetTable = () => Promise.resolve( "https://someleltest.herokuapp.com/api/orders?SID=" + SID).then( getDataset ).then( applyDatasetDeliveriesTable );
	
		let createRowListeners = () => {
		// Add event listener for each row in created table
		let tables = document.getElementsByTagName("table");
		for(let j = 0; j < tables.length; ++j){
			let rows = tables[j].getElementsByTagName("tr");
			for(let i = 1; i < rows.length; ++i)
			{
				rows[i].addEventListener('click', function(){
					// Close dialog window
					dialogTable.dialog( "close" );
					// Get begin and end values					
					beginTable = findPlanetIdByName(this.cells[12].innerHTML);
					endTable = findPlanetIdByName(this.cells[11].innerHTML);
					
					typeTable = this.cells[4].innerHTML;
				
					if(beginTable != -1 && endTable != -1 && typeTable != "" && typeTable != undefined)
					{
						tryPromise( getAlgorithm ).then( runAlgorithmTable ).then( animateAlgorithmTable );
					}
				});
			}
		}
	};
	
	// Write data to page
	tryPromise(applyDatasetTable).then(createRowListeners);
	/* Functions for table order part*/
	
	/* Function for table order part*/
	// All promises and events
    tryPromise( applyDatasetFromSelect ).then( applyPathsFromSelect ).then( applyStylesheetFromSelect ).then( applyLayoutFromSelect );
		
	});
	
})();