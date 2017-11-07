(function(){
  document.addEventListener('DOMContentLoaded', function(){
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
	
	let applyDatasetUsers = () => Promise.resolve( "https://someleltest.herokuapp.com/api/users?SID=1f9474729a96e84a71d51fe2660c18e1f94de4b242b6a66956d54df762bbfbf3" ).then( getDataset ).then( saveUsers );
	
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
			}
		}, event);
	});
		
	// Function for validating email
	function validateEmail(email) {
		let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		
		let user = false;
		
		for(let i = 0; i < users.length; ++i)
		{
			if(users[i]["email"] == email)
			{
				user = true;
				break;
			}
		}
		
		return re && user;
	};
	
	/* Function for clearing errors */
	let clearErrors = () =>{
		$("#error-receiver").css("visibility", "hidden");
		$("#error-sender").css("visibility", "hidden");
		$("#error-from").css("visibility", "hidden");
		$("#error-to").css("visibility", "hidden");
		$("#error-weight").css("visibility", "hidden");
		$("#error-volume").css("visibility", "hidden");
		$("#error-type").css("visibility", "hidden");
	};
	
	/* Clear all errors when input*/
	$("#sender").on("input", function(){
		clearErrors();
	});
	
	$("#receiver").on("input", function(){
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
		let receiver = $("#receiver").val();
		
		if(sender != "" && sender != undefined && validateEmail(sender))
		{
			if(receiver != "" &&  receiver != undefined && validateEmail(receiver))
			{
				if(startPlanetName == undefined || startPlanetName == "")
				{
					startPlanetName = this.data("name");
					this.addClass('highlighted start');
					$("#from").html(startPlanetName);
				}else{
					if(endPlanetName == "" || endPlanetName == undefined)
					{
						endPlanetName = this.data("name");
						this.addClass('highlighted end');
						$("#to").html(endPlanetName);
					}
				}
			}else{
				$("#error-receiver").css("visibility", "visible");
			}
		}else{
			$("#error-sender").css("visibility", "visible");
		}
	});
	
	/* Function for clearing start planet */
	$("#clear-from").on("click", function(){
		let startId = findPlanetIdByName(startPlanetName);
		cy.getElementById(startId).removeClass("highlighted start");
		startPlanetName = "";
		$("#from").html(startPlanetName);
	});
	
	/* Function for clering end planet */
	$("#clear-to").on("click", function(){
		let endId = findPlanetIdByName(endPlanetName);
		cy.getElementById(endId).removeClass("highlighted end");
		endPlanetName = "";
		$("#to").html(endPlanetName);
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
			data: JSON.parse('{"SID": "1f9474729a96e84a71d51fe2660c18e1f94de4b242b6a66956d54df762bbfbf3","order":{"sender" : "' + sender + '" ,"reciever" : "' + receiver+'" ,"from":"' + start + '" ,"to": "' + to +  '" ,"weight": '+ weight + ' ,"volume":' + volume + ' ,"type": "' + type +'", "estimate":' + false + '}}'),
			success: function (data, textStatus, xhr) {
				$("#dialog-window").css("display", "block");
				$("#dialog-content").html('<span id="close-dialog" class="close">&times;</span>' + 
				'<p>Total time:'+ data['time'] + '</p>' + 
				 '<p>Total price:'+ data['price'] + '</p>' +
				 '<input type="button" value="Submit" id="submit-order" name="submit-order"></input>' +
				 '<input type="button" value="Cancel" id="cancel-order" name="submit-order"></input>');
				 
				 /*Event listeners for dialog window */
				$("#close-dialog").on("click", function(){
					$("#dialog-window").css("display", "none");
				});
				
				$("#cancel-order").on("click", function(){
					$("#dialog-window").css("display", "none");
				});
				
				$("#submit-order").on("click", function(){
					$.ajax({
						url: 'https://someleltest.herokuapp.com/api/orders',
						type: 'POST',
						dataType: 'json',
						data: JSON.parse('{"SID": "1f9474729a96e84a71d51fe2660c18e1f94de4b242b6a66956d54df762bbfbf3","order":{"sender" : "' + sender + '" ,"reciever" : "' + receiver+'" ,"from":"' + start + '" ,"to": "' + to +  '" ,"weight": '+ weight + ' ,"volume":' + volume + ' ,"type": "' + type +'", "estimate":' + true + '}}'),
						success: function (data, textStatus, xhr) {
							$("#dialog-content").html('<span id="close-dialog" class="close">&times;</span>' + 
							'<p>Your order was successfully submitted</p>' + 
							'<input type="button" value="Ok" id="ok" name="ok"></input>');
				 			/*Event listeners for dialog window */
							$("#ok").on("click", function(){
								$("#dialog-window").css("display", "none");
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
		
	/* Function for registering order
	*  Process data 
	*  Make a reguest to server
	*/
	$("#s").on("click", function(){
		// Clear errors
		clearErrors();
		// Get all data
		let sender = $("#sender").val();
		let receiver = $("#receiver").val();
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
									$("#error-type").css("visibility", "visible");
								}
							}else{
								$("#error-volume").css("visibility", "visible");
							}
						}else{
							$("#error-weight").css("visibility", "visible");
						}
					}else{
						$("#error-to").css("visibility", "visible");
					}
				}else{
					$("#error-from").css("visibility", "visible");
				}
			}else{
				$("#receiver").css("visibility", "visible");
			}
		}else{
			$("#sender").css("visibility", "visible");
		}
	});
	// All promises and events
    tryPromise( applyDatasetFromSelect ).then( applyPathsFromSelect ).then( applyStylesheetFromSelect ).then( applyLayoutFromSelect ).then(applyDatasetUsers);

  });
})();

// tooltips with jQuery
$(document).ready(() => $('.tooltip').tooltipster());