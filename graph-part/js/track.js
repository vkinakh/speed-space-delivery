(function(){
  document.addEventListener('DOMContentLoaded', function(){	
	// Initialize cytoscape map for future adding graph
	let cy;
			
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
	
	/*<global variables>*/
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
	/*<global variables>*/
	
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
	
	// All promises and events
    tryPromise( applyDatasetFromSelect ).then( applyPathsFromSelect ).then( applyStylesheetFromSelect ).then( applyLayoutFromSelect );
  });
})();

