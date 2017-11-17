(function(){
  document.addEventListener('DOMContentLoaded', function(){
	// Unable inputs
	$( "#from" ).prop( "disabled", true );
	$( "#to" ).prop( "disabled", true );
	
	let dialog;
	
	/*Function for submitting order*/
	let registerOrder = () =>
	{
		$.ajax({
			url: 'https://someleltest.herokuapp.com/api/orders',
			type: 'POST',
			dataType: 'json',
			data: JSON.parse('{"SID":"'+  SID + '","order":{"sender" : "' + sender + '" ,"reciever" : "' + receiver+'" ,"from":"' + start + '" ,"to": "' + to +  '" ,"weight": '+ weight + ' ,"volume":' + volume + ' ,"type": "' + type +'", "estimate":' + true + '}}'),
			success: function (data, textStatus, xhr) {
				$("#submit-order").html('<p>Your delivery was succesfully submitted!</p>' + 
				'<input type="button" value="Ok" id="ok" name="ok"></input>');
				 /*Event listeners for dialog window */
				$("#ok").on("click", function(){
					dialog.dialog("close");
				});
			},
			error: function (xhr, textStatus, errorThrown) {
				$("#submit-order").html('<p>During submitting some error occured!</p>' + 
				'<input type="button" value="Ok" id="ok" name="ok"></input>');
				 /*Event listeners for dialog window */
				$("#ok").on("click", function(){
					dialog.dialog("close");
				});
			}
		});
	};
	
	/* Dialog window */
	dialog = $( "#dialog-order" ).dialog({
		autoOpen: false,
		height: 300,
		width: 350,
		modal: true,
		buttons: {
			Cancel: function() {
				dialog.dialog( "close" );
			},
			Submit: function(){
				registerOrder();
			}
		}
	});
	
	// Initialize cytoscape map for future adding graph
    let cy;
	
	// Variable for saving users
	let users;
	
	// Names of start and end planets
	let startPlanetName, endPlanetName;
	
	/* Function for applying dataset to cytoscape map
	*  Takes: dataset
	*  Applies dataset to map
	*/
	let saveUsers = dataset => {	
		// Save planets 
		users = dataset;
	};
	
	let applyDatasetUsers = () => Promise.resolve( "https://someleltest.herokuapp.com/api/users?SID=" + SID).then( getDataset ).then( saveUsers );
	
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
		
	// Function for validating email
	function validateEmail(email) {
		let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(email);
	};
	
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
				if(startPlanetName == undefined || startPlanetName == "")
				{
					startPlanetName = this.data("name");
					this.addClass('highlighted start');
					$("#from").val(startPlanetName);
				}else{
					if(endPlanetName == "" || endPlanetName == undefined)
					{
						endPlanetName = this.data("name");
						this.addClass('highlighted end');
						$("#to").val(endPlanetName);
					}
				}
			}else{
				$('#reciever').qtip({
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
				});
			}
		}else{
			$('#sender').qtip({
				position: {
					target: $("#sender")
				},
				content: {
					text: 'Error! Enter valid sender email!'
				},
				show: {ready: true},
				hide: {event: false},
				style: {classes: 'qtip-red qtip-bootstrap'}
			});
		}
	});
	
	/* Function for clearing start planet */
	$("#clear-from").on("click", function(){
		let startId = findPlanetIdByName(startPlanetName);
		cy.getElementById(startId).removeClass("highlighted start");
		startPlanetName = "";
		$("#from").val(startPlanetName);
	});
	
	/* Function for clering end planet */
	$("#clear-to").on("click", function(){
		let endId = findPlanetIdByName(endPlanetName);
		cy.getElementById(endId).removeClass("highlighted end");
		endPlanetName = "";
		$("#to").val(endPlanetName);
	});
	
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
	
	/* Function for submiting order
	*  Takes: data for request
	*  Pops dialog window with price and time
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
				dialog.dialog("open");
				$("#submit-order").html("<p>Total price: " + data['price'] + "</p>"+
				"<p>Total delivery time: " + data['time'] + "</p>");
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
		
	/* Function for registering order
	*  Process data 
	*  Make a reguest to server
	*/
	$("#submit-order").on("click", function(){
		// Clear errors
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
				if(startPlanetName != "" && startPlanetName != undefined && validatePlanetName(startPlanetName))
				{
					if(endPlanetName != "" && endPlanetName != undefined && endPlanetName != startPlanetName && validatePlanetName(endPlanetName))
					{
						if(weight != "" && weight != undefined && weight > 0)
						{
							if(volume != "" && volume != undefined && volume > 0)
							{
								if(type != "" && type != undefined)
								{
									submitOrder(sender, receiver, startPlanetName, endPlanetName, weight, volume, type);
								}else{
									$('#type').qtip({
										content: {
											text: 'Error! Select type of delivery!'
										},
										show: {ready: true},
										hide: {event: false},
										style: {classes: 'qtip-red qtip-bootstrap'}
									});
								}
							}else{
								$('#volume').qtip({
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
								});
							}
						}else{
							$('#weight').qtip({
							content: {
								text: 'Error! Enter valid weight!'
							},
							position: {
								target: $("#weight")
							},
							show: {ready: true},
							hide: {event: false},
							style: {classes: 'qtip-red qtip-bootstrap'}
							});
						}
					}else{
						$('#to').qtip({
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
					});
					}
				}else{
					$('#from').qtip({
						position: {
							target: $("#from")
						},
						content: {
							text: 'Error! Select start planet!'
						},
						show: {ready: true},
						hide: {event: false},
						style: {classes: 'qtip-red qtip-bootstrap'}
					});
				}
			}else{
				$('#reciever').qtip({
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
				});
			}
		}else{
			$('#sender').qtip({
				position: {
					target: $("#sender")
				},
				content: {
					text: 'Error! Enter valid sender email!'
				},
				show: {ready: true},
				hide: {event: false},
				style: {classes: 'qtip-red qtip-bootstrap'}
			});
		}
	});
	// All promises and events
    tryPromise( applyDatasetFromSelect ).then( applyPathsFromSelect ).then( applyStylesheetFromSelect ).then( applyLayoutFromSelect ).then(applyDatasetUsers);

  });
})();
