
var url="https://sspacedelivery.herokuapp.com/api/users/";
var urlGet="https://sspacedelivery.herokuapp.com/api/users?SID=";
var table=document.getElementById("table");
var user_JSON

function loadPlanetsToSelect() {
	'use strict';
	console.log("laodPlanetsToSelect()");
	$.ajax({
		type:'GET',
		url:"https://sspacedelivery.herokuapp.com/api/planets/getAll",
		success:function (data){
			$.each(data, function (i, planet) {
				$('#planetSelect').append($('<option>', { 
					value: i,
					text : planet.name
				}));
				});
					  
		},
		error:function (status){
			alert(status.responseText);
		}
		
	})
}

$(document).ready(function() {
	urlGet+=JSON.parse(localStorage.getItem("SID"));
	loadTable();
	loadPlanetsToSelect();
});
document.addEventListener("submit",function(event){
	event.preventDefault();
		user_JSON={
		"SID":JSON.parse(localStorage.getItem("SID")),
		"email":$("#email").val(),
	}
})
function loadTable(){$.get(urlGet,function (data){
		buildHtmlTable(document.getElementById("table"),data);
	});}

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
	table+="<th style='color:red;'>Remove</th><th style='color:green;'>Permission</th><th style='color:rgb(244, 191, 66)'>Reset</th>"
	
	for (i=0;i<responseArr.length;++i){
		var temp=responseArr[i];
		table+="<tr>";
	for (j=0;j<keys.length;++j){
			table+="<td>";
			if(temp[keys[j]]) table+=temp[keys[j]];else table+="";
			table+="</td>";
			}

		table+="<td><p class='text-center'><i class='fa fa-times-circle fa-2x' style='color:red;' data-title='Remove user .You will  be never able to cancel this action!'  onclick='";
		table+="removeUser(\"";
		table+=temp.email;
		table+="\")'</i></p></td>";
		
		table+="<td><p class='text-center'><i class='fa fa-user-plus fa-2x' data-title='Give this user more privilege.' style='color:green;' onclick='";
		table+="addPermision(\"";
		table+=temp.email;
		table+="\")'</i></p></td>";
		
		table+="<td><p class='text-center'><i class='fa fa-times fa-2x' data-title='Deprive of privileges' style='color:rgb(244, 191, 66);' onclick='";
		table+="removePermission(\"";
		table+=temp.email;
		table+="\")'</i></p></td>";
		
	}
	table+="</table>";
	selector.innerHTML=table;
		}
var emailGlobal;

 function removeUser (email){
	 $.confirm({
	animation:'rotate',
	closeAnimation:'scale',	 
    title: 'Removing user',
    content: 'Do you realy want to remove '+ email,
    type: 'red',
    typeAnimated: true,
	autoClose: 'cancel|4000',
    buttons: {
        remove: {
            text: 'Remove!',
            btnClass: 'btn-red',
            action: function(){
				$.ajax({
		 type:'DELETE',
		 url:url,
		 data:{
			 "email":email,
			 "SID":JSON.parse(localStorage.getItem("SID"))
		 },
		 success:function (){
		 loadTable();
	},
		erorr:function(status){
			alert(status.responseText);
		}
	 })
            }
        },
        cancel: function () {
        }
    }
});
}

function addPermision(email){
	console.log("add permission user "+email);
	emailGlobal=email;
	$( "#dialog" ).dialog();	
}

		function confirmAddPermisionOperator(){
			var location=$('#planetSelect').find(":selected").text();
		console.log(location);
		
		$.ajax({
		type:'POST',
		url:url+"addOperator",
		data:{
			"email":emailGlobal,
			"location":location,
			"SID":JSON.parse(localStorage.getItem("SID"))
		},
		success:function (){
			$( "#dialog" ).dialog( "close" );
			loadTable();
	},
		erorr:function(status){
			
			alert(status.responseText);
		}
	})
		}

		function confirmAddPermisionAdmin(email){
			$.ajax({
			type:'POST',
			url:url+"addAdmin",
			data:{
				"email":emailGlobal,
				"SID":JSON.parse(localStorage.getItem("SID"))
			},
			success:function (){
				$( "#dialog" ).dialog( "close" );
				loadTable();
		},
			erorr:function(status){
				alert(status.responseText);
			}
	})
		}

	
function removePermission(email){
	console.log("permission remove user "+email);
	$.ajax({
		type:'POST',
		url:url+"removePermission",
		data:{
			"email":email,
			"SID":JSON.parse(localStorage.getItem("SID"))
		},
		success:function (){
		 loadTable();
	},
		erorr:function(status){
			alert(status.responseText);
		}
	})
}
