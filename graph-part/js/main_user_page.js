/*
* Main function for work in main user page
*/
(function(){
	/* When page is loaded */
	$(document).ready(function(){
		/* Function for table part */
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
		let runAlgorithm = (algorithm) => {
			if (algorithm === undefined) {
				return Promise.resolve(undefined);
			} else{
				let options = {
					root: '#' + begin,
					// astar requires target; goal property is ignored for other algorithms
					goal: '#' + end,
					weight : function(edge){
						return Number(edge.data().length) * Number(edge.data().difficulty);
					}
				};
				return Promise.resolve(algorithm(options));
			}
		};
		
		/*Varible for saving curret algorithm*/
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
						if (currentAlgorithm === algResults && i < algResults.path.length) {
							if(algResults.path[i].group() == 'edges')
							{
								if(type == 'cheap')
								{		
									algResults.path[i].addClass('cheap');
								}else
									if(type == 'regular')
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
					};
					highlightNext();
				});
			}
		};
		
		/* Function for writing data to table
		*  So then it will be shown to user
		*/
		let applyDatasetDeliveries = data => {
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
		dialogTable = $( "#dialog-form" ).dialog({
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
		let applyDatasetD = () => Promise.resolve( "https://someleltest.herokuapp.com/api/orders?SID=" + SID).then( getDataset ).then( applyDatasetDeliveries );
		
		/* Create event listeners for each row in table*/
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
							tryPromise( getAlgorithm ).then( runAlgorithm ).then( animateAlgorithmTable );
						}
					});
				}
			}
		};	

		// Write data to page
		tryPromise(applyDatasetD).then(createRowListeners);	
		
		/* Functions for table part*/
		
		/* Function for registering order*/
		
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
		let dialogRegisterOrder;
		
		/* Dialog window properties */
		dialogRegisterOrder = $( "#dialog-order" ).dialog({
			autoOpen: false,
			height: 350,
			width: 650,
			modal: true,
			buttons: {
				Cancel: function() {
					clearErrors();
					dialog.dialog( "close" );
				},
				Create: function(){
					tryOrder();
				}
			}
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
						dialog.dialog("close");
						$("#dialog-order").html(originalDialogContentOrder);
					});
				},
				error: function (xhr, textStatus, errorThrown) {
					$("#dialog-order").html('<p>During submitting some error occured!</p>' + 
					'<input type="button" value="Ok" id="ok" name="ok"></input>');
					/*Event listeners for dialog window */
					$("#ok").on("click", function(){
						dialog.dialog("close");
						$("#dialog-order").html(originalDialogContentOrder);
					});
				}
			});
		};
		
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
					event: 'mouseout '//unfocus'
				},
				style: {classes: 'qtip-bootstrap'}
			}, event);
		});
		
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
			let startId = findPlanetIdByName(startPlanetName);
			cy.getElementById(startId).removeClass("highlighted start");
			startPlanetName = "";
			$("#from").html("Click to select start planet");
		});
		
		/* Function for clering end planet */
		$("#clear-to").on("click", function(){
			let endId = findPlanetIdByName(endPlanetName);
			cy.getElementById(endId).removeClass("highlighted end");
			endPlanetName = "";
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
						dialogRegisterOrder.dialog("open");
					}else{
						if(endPlanetNameOrder == "" || endPlanetNameOrder == undefined)
						{
							endPlanetNameOrder = this.data("name");
							this.addClass('highlighted end');
							$("#to").html(endPlanetNameOrder);
							dialogRegisterOrder.dialog("open");
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
						dialogRegisterOrder.dialog("close");
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
		
		/* Start register order */
		$("#make-order").on("click", tryOrder);
		
		/* Open dialog window for registering order */
		$("#register-order").on("click", function(){
			dialogRegisterOrder.dialog("open");
			// Clear errors
			clearErrors();
		});
		
		/*Function for showing graph for selecting start planet*/
		$("#from").on("click", function()
		{
			dialogRegisterOrder.dialog("close");
			clearErrors();
		});
		
		/* Function for showing graph for selecting end planet */
		$("#to").on("click", function()
		{
			dialogRegisterOrder.dialog("close");
			clearErrors();
		});
		
		// All promises and events
		tryPromise( applyDatasetFromSelect ).then( applyPathsFromSelect ).then( applyStylesheetFromSelect ).then( applyLayoutFromSelect );
		
		/* Funnctions for registering order */
	});
	
})();