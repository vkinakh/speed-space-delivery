 // Variable
/*---------------------------------------------------------------------------------------------*/

var url="https://someleltest.herokuapp.com/api/orders/";
var urlGet="https://someleltest.herokuapp.com/api/orders?SID=";
urlGet+=JSON.parse(localStorage.getItem("SID"));
var table=document.getElementById("table");

// function defenitions 
/*----------------------------------------------------------------------------------------------*/

function loadPlanetsToSelect() {
	'use strict';
	console.log("laodPlanetsToSelect()");
	$.ajax({
		type:'GET',
		url:"https://someleltest.herokuapp.com/api/planets/getAll",
		success:function (data){
			$.each(data, function (i, planets) {
				$('#from').append($('<option>', { 
					value: i,
					text : planets.name
				}));
				$("#to").append($('<option>',{
					value:i,
					text:planets.name
				}))
				});
					  
		},
		error:function (status){
			alert(status.responseText);
		}
		
	})
}


function reloadPage () {
	location.reload();
}
function orderSend(data){
	alert("Success sent");
	location.reload();
}
function myPost(obj_JSON,action){
	'use strict';
	
	$.ajax({
		type:'POST',
		url:url,
		data:obj_JSON,
		success:function (data) {console.log("success myPost!");action(data)},
		error:function (status) {alert(status.responseText);}
	})
}
function buildHtmlTable(selector,responseArr){
			var keys = [];
responseArr.map(function(el){
    for(var k in el){
  if(keys.indexOf(k)===-1) keys.push(k);
    }
});
keys.sort();
		

	
	var table="<table class='table-bordered table-hover table-responsive'>";
	
	table+="<tr>"
	for (i=0;i<keys.length;++i){
		table+="<th>"+keys[i]+"</th>";
	}
	
	for (i=0;i<responseArr.length;++i){
		var temp=responseArr[i];
		table+="<tr>";
	for (j=0;j<keys.length;++j){
			table+="<td>";
			if(temp[keys[j]]) table+=temp[keys[j]];else table+="";
			table+="</td>";
			}
	}

	
	table+="</table>";
	selector.innerHTML=table;
		}
function loadTableOrders(){
	console.log("loadTableOrders()");
	
	$.ajax({
	type:"GET",
	url:urlGet,
	success:function (data){buildHtmlTable(table,data)},
	errorr:function (){alert(status.responseText)},
	statusCode:{
		404 :function (){
			console.log("This page isn`t avalible code 401");
	
		},
		200:function (){
			console.log("success myGet! code200");
		},
		401:function (){
			alert("You are unauthorized");
			console.log("code 401");
		}
	}
		
	})
}
function listenterClickMakeOrder(){
	'use strict';
	
	$("#makeOrder").click(function(){
	 var order_JSON={
		 "SID":JSON.parse(localStorage.getItem("SID")),
	"order":{
		"sender":$("#sender").val(),
		"reciever":$("#reciever").val(),
		"from":$('#from').find(":selected").text(),
		"to":$('#to').find(":selected").text(),
		"weight":$('#weight').val(),
		"volume":$('#volume').val(),
		"type":$('#type').find(":selected").text()
	 }}
	 myPost(order_JSON,orderSend);
	 })
}
function listenterClickAccept(){
$("#accept").click(function(){
	
	 var accept_JSON={
		 "SID":JSON.parse(localStorage.getItem("SID")),
		"trackID":$("#trackID").val(),
		"action":"accept"
	 }
	 
	$.ajax({
	url:url,
	type:'PUT',
	data:accept_JSON,
	success:function(status){console.log(status);loadTableOrders();},
	error:function(status){alert(status.responseText);} 
}) 
})	
}
function  listenerClickOpenTableOrders(){
	
	$( "#openTableOrders" ).click(function(){
		loadTableOrders(); 
})
	}




function listenerClickCreateContainer(){
	console.log("listenerClickCreateContainer()");
	$( "#btnCreateContainer" ).click(function(){
		
	var temp=[],location;
	temp=$("#orderID").val();
	var num="[";
	num+=temp;
	num+="]";
	var num=JSON.parse(num);
	location=$("#location").val();
		
	var container= {
	"SID":JSON.parse(localStorage.getItem("SID")),
	"orders":num,
	"location":location
	   }


	$.ajax({
		type:"POST",
		url:url+"createContainer",
		data:container,
		success:function(data){alert("Success create container");myGetBuildTableOrders();console.log(data)},
		error:function(status,responseText){console.log(status.responseText);}
	})
	
	})

}

/*

$("#btnConfirmContainer").click(function(){
	var data={
"SID":JSON.parse(localStorage.getItem("SID")),
"shipID":$("#orderID").val(),
"containerID":$("#location").val()
}





		$.ajax({
type:'POST', 
url: 'https://someleltest.herokuapp.com/api/orders/confirmContainer', 
data: JSON.stringify(data), 
contentType: 'application/json',
success:function(status){console.log(status);},
error:function (status){alert(status.responseText);}
})
})



$("#cancel").click(function(){
	  var accept={
		 "SID":JSON.parse(localStorage.getItem("SID")),
		"trackID":$("#trackID").val(),
		"action":"cancel"
	 }
	$.ajax({
	url:"https://someleltest.herokuapp.com/api/orders",
	type:'put',
	data:accept,
	success:function(status){console.log(status);show();}
}) 
  })



									// List of called functions
/*-----------------------------------------------------------------------------------------------------------*/
$( document ).ready(function(){
	'use strict'
	loadPlanetsToSelect (); // works without "SID"
	
	
	document.addEventListener("submit",function(event){	 
	event.preventDefault();
	})
	
	listenerClickOpenTableOrders();
	listenterClickMakeOrder();
    listenterClickAccept();
	}) 

	



















