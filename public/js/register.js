(function(){
  document.addEventListener('DOMContentLoaded', function(){  
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
	let dialog;
	
	/* Dialog window properties */
	dialog = $( "#dialog-order" ).dialog({
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
	let registerOrder = () =>
	{
		$.ajax({
			url: 'https://sspacedelivery.herokuapp.com/api/orders',
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
	
	// Initialize cytoscape map for future adding graph
    let cy;
	
	// Create cytoscape map for graph
    cy = window.cy = cytoscape({
      container: $('#cy')
    });
		
	// Names of start and end planets
	let startPlanetName, endPlanetName;
		
	/* Display planet info on mouseover */
	/*cy.on('mouseover', 'node', function(event) {
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
	});*/
		
	// Function for validating email
	let validateEmail = (email) => {
		let re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
		return re.test(email);
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
					$("#from").html(startPlanetName);
					dialog.dialog("open");
				}else{
					if(endPlanetName == "" || endPlanetName == undefined)
					{
						endPlanetName = this.data("name");
						this.addClass('highlighted end');
						$("#to").html(endPlanetName);
						dialog.dialog("open");
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
			url: 'https://sspacedelivery.herokuapp.com/api/orders',
			type: 'POST',
			dataType: 'json',
			data: JSON.parse('{"SID": "' + SID +'","order":{"sender" : "' + sender + '" ,"reciever" : "' + receiver+'" ,"from":"' + start + '" ,"to": "' + to +  '" ,"weight": '+ weight + ' ,"volume":' + volume + ' ,"type": "' + type +'", "estimate":' + false + '}}'),
			success: function (data, textStatus, xhr) {
				$("#makeOrderForm").css("display", "none");
				/*$("#submit-order").html("<p>Total price: " + data['price'] + "</p>"+
				"<p>Total delivery time: " + data['time'] + "</p>");*/
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
	
	/* Function for trying order when user have all fields
	*  First method
	*  Validating data
	*/
	  // Check input fields
	  /*
	  function validDatas() {
	
    var pr = true;
    var name = document.getElementById("name").value;
    var surname = document.getElementById("surname").value;
    var lastname = document.getElementById("lastname").value;
    var email = document.getElementById("email").value;
    var password=document.getElementById("psw").value;
    var password2=document.getElementById("psw2").value;



    if (!regName.test(name)) {
        document.getElementById("name").value = ""; $("#name").addClass("text-glow");
        setTimeout(function () { $("#name").removeClass("text-glow"); }, 2000);
        pr = false;
    }
    if (!regName.test(surname)) {
        document.getElementById("surname").value = "";
        $("#surname").addClass("text-glow");
        setTimeout(function () { $("#surname").removeClass("text-glow"); }, 2000);
        pr = false;

    }
    if (!regName.test(lastname)) {
        document.getElementById("lastname").value = "";
        $("#lastname").addClass("text-glow");
        setTimeout(function () { $("#lastname").removeClass("text-glow"); }, 2000);
        pr = false;

    }
    if (!regEmail.test(email)) {
        document.getElementById("email").value = "";
        $("#email").addClass("text-glow");
        setTimeout(function () { $("#email").removeClass("text-glow"); }, 2000);
        pr = false;
    }
    if (password.length!=0 && password2.length!=0) {
        if (password != password2) { pr = false; 
									
			document.getElementById("psw").value = "";
        $("#psw").addClass("text-glow");
        setTimeout(function () { $("#psw").removeClass("text-glow"); }, 2000);
			
			 document.getElementById("psw2").value = "";
        $("#psw2").addClass("text-glow");
        setTimeout(function () { $("#psw2").removeClass("text-glow"); }, 2000);
									
								   } else {
        }
    } else {
       // alert("One of your passwords is empty");
		 document.getElementById("psw").value = "";
        $("#psw").addClass("text-glow");
        setTimeout(function () { $("#psw").removeClass("text-glow"); }, 2000);
		
		 document.getElementById("psw2").value = "";
        $("#psw2").addClass("text-glow");
        setTimeout(function () { $("#psw2").removeClass("text-glow"); }, 2000);
		
        document.getElementById("psw").value = "";
        document.getElementById("psw2").value = "";
        pr = false;
    }
  
    return pr;
}
	  */
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
	}
		
	/* Open dialog window for registering order */
	$("#register-order").on("click", function(){
		dialog.dialog("open");
		// Clear errors
		clearErrors();
	});
	
	/*Function for showing graph for selecting start planet*/
	$("#from").on("click", function()
	{
		dialog.dialog("close");
		clearErrors();
	});
	
	/* Function for showing graph for selecting end planet */
	$("#to").on("click", function()
	{
		dialog.dialog("close");
		clearErrors();
	});
	
	// All promises and events
    tryPromise( applyDatasetFromSelect ).then( applyPathsFromSelect ).then( applyStylesheetFromSelect ).then( applyLayoutFromSelect );

  });
})();
