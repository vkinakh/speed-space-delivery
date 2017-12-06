var url="https://sspacedelivery.herokuapp.com/api/ships";
var urlGet="https://sspacedelivery.herokuapp.com/api/ships?SID=";
urlGet+=JSON.parse(localStorage.getItem("SID"));
var table=document.getElementById("ships");
var RESPONSEARR;

document.addEventListener("submit",function(event){
	event.preventDefault();
});

$( document ).ready(function() {
 loadShips();
});
 
function loadShips(){
		$.ajax({
		type:'GET',
		url:urlGet,
		success:function(data){
			buildHtmlTable(table,data)
			RESPONSEARR=data;
		},
		error:function (status){
			alert(status.responseText);
		}
	})	
	}
function filldFormByShipId(id){
	var proper={};
	RESPONSEARR.forEach(function(el,i){
		if(el["id"]==id){
			proper.id=el["id"];
			proper.location=el["location"];
			proper.capacity=el["capacity"];
			proper.volume=el["volume"];
			proper.ability=el["ability"];
			proper.speed=el["speed"];
			proper.consumption=el["consumption"];
			proper.available=el["available"];
		}
	})
	return proper;
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
	console.log(keys);
	for (i=0;i<keys.length;++i){
		table+="<th>"+keys[i]+"</th>";
	}
	
	for (i=0;i<responseArr.length;++i){
		var temp=responseArr[i];
		table+="<tr>";
	for (j=0;j<keys.length;++j){
			table+="<td>";
			if(temp[keys[j]]!== undefined) table+=temp[keys[j]];else table+="";
			table+="</td>";
			}
		table+="<td><i class='fa fa-times-circle fa-2x' style='color:red;' onclick='";
			table+="removeShip(\"";
			table+=temp.id;
			table+="\")'</i></td>";
		 	table+="<td><i class='fa fa-upload fa-2x' style='color:green;' onclick='";
			table+='changeShip(\"';
		    table+=temp.id;
			table+="\")'</i></td>";
		if(i==0){
			table+="<td><i class='fa fa-plus fa-2x' style='color:#0066FF;' onclick='";
			table+='addShip(\"';	
			table+="\")'</i></td>";
			}
		    table+'</tr>';
		console.log(temp)
	}

	
	table+="</table>";
	selector.innerHTML=table;
		}
function checkChangesShipForm(){
	console.log("checkChanges!");
	console.log($('#1').val())
	console.log($('#2').val())
	console.log($('#3').val())
	console.log($('#4').val())
	console.log($('#5').val())
	console.log($('#6').val())
	console.log($('#7').val())
	var pr=true;
	
			if(!$('#1').val()){
			$("#1").addClass("text-glow");setTimeout(function () { $("#1").removeClass("text-glow");},1000);pr=false;
			   };
	
			if(!$('#2').val()){
			$("#2").addClass("text-glow");setTimeout(function () { $("#2").removeClass("text-glow");},1000);pr=false;
			   };
	
			if(!$('#3').val()){
			$("#3").addClass("text-glow");setTimeout(function () { $("#3").removeClass("text-glow");},1000);pr=false;
			   };
	
			if(!$('#4').val()){
			$("#4").addClass("text-glow");setTimeout(function () { $("#4").removeClass("text-glow");},1000);pr=false;
			   };
	
			if(!$('#5').val()){
			$("#5").addClass("text-glow");setTimeout(function () { $("#5").removeClass("text-glow");},1000);pr=false;
			   };
	
			if(!$('#6').val()){
			$("#6").addClass("text-glow");setTimeout(function () { $("#6").removeClass("text-glow");},1000);pr=false;
			   };
			
			
			if(!$('#7').val()){
			$("#7").addClass("text-glow");setTimeout(function () { $("#7").removeClass("text-glow");},1000);pr=false;
			   };
		return pr;
	}

function removeShip(id){
	  $.confirm({
	animation:'rotate',
	closeAnimation:'scale',	 
    title: 'Removing Planet',
    content: 'Do you realy want to remove ship with id:'+id,
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
			 "SID":JSON.parse(localStorage.getItem("SID")),
			 "ship":{id}
		 },
		 success:function (){
		loadShips();
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
})
 }
function addShip(){
	
	var contentTemp='<form>'
		+'<div class="form-group"><lable>Location: <input type="text" id="1" placeholder="location" class="form-control" value=\"\"></lable></div>'
		+'<div class="form-group">Capacity: <lable><input type="text" id="2" placeholder="capacity" class="form-control"></lable></div>'
		+'<div class="form-group"><lable>Volume: <input type="text" id="3" placeholder="volume" class="form-control" value=\"\"></lable></div>'
		+'<div class="form-group"><lable>Ability: <input type="text" id="4" placeholder="ability" class="form-control"></lable></div>'
		+'<div class="form-group"><lable>Speed: <input type="text" id="5" placeholder="speed" class="form-control"></lable></div>'
		+'<div class="form-group"><lable>Consumption: <input type="text" id="6" placeholder="consumption" class="form-control"></lable></div>'
		+'<div class="form-group"><lable>Available: <input type="text" id="7" placeholder="available" class="form-control"  value=\"true\" disabled></lable></div>'
		+' </form>';
	
	console.log("add");
	 $.confirm({
	animation:'rotate',
	closeAnimation:'scale',	 
    title: 'Adding Ship',
    typeAnimated: true,
	content:contentTemp,
    buttons: {
       	Add: {
            text: 'Add',
            btnClass: 'btn-success',
            action: function(){
				if(checkChangesShipForm()){
					$.ajax({
					   type:'POST',
					   url:'https://sspacedelivery.herokuapp.com/api/ships',
					   data:{
						   "SID":JSON.parse(localStorage.getItem("SID")),
						   "ship":{
							   "location":$('#1').val(),
							   "capacity":$('#2').val(),
						   	   "volume":$('#3').val(),
						       "ability":$('#4').val(),
						       "speed":$('#5').val(),
						       "consumption":$('#6').val(),
						   },success:function(){
							 $.alert("Please reload page!");
						   }
						  
					   }
				   })
				}else return false;
            }
        },
        cancel: function () {
        }
    }
		 
})
};

function changeShip(id){
	console.log(id);
	var proper=filldFormByShipId(id);
	console.log(proper);
	var contentTemp='<form>'
		+'<div class="form-group"><lable>Location: <input type="text" id="1" placeholder="location" class="form-control" value=\"'
		contentTemp+=proper["location"];
	    contentTemp+='\"></lable></div>'
		+'<div class="form-group">Capacity: <lable><input type="text" id="2" placeholder="capacity" class="form-control"value=\"'
		contentTemp+=proper["capacity"];
	    contentTemp+='\"></lable></div>'
		+'<div class="form-group"><lable>Volume: <input type="text" id="3" placeholder="volume" class="form-control" value=\"'
		contentTemp+=proper["volume"];
	    contentTemp+='\"></lable></div>'
		+'<div class="form-group"><lable>Ability: <input type="text" id="4" placeholder="ability" class="form-control" value=\"'
		contentTemp+=proper["ability"];
	    contentTemp+='\"></lable></div>'
		+'<div class="form-group"><lable>Speed: <input type="text" id="5" placeholder="speed" class="form-control" value=\"'
		contentTemp+=proper["speed"];
	    contentTemp+='\"></lable></div>'
		+'<div class="form-group"><lable>Consumption: <input type="text" id="6" placeholder="consumption" class="form-control" value=\"'
		contentTemp+=proper["consumption"];
	    contentTemp+='\"></lable></div>'
		+'<div class="form-group"><lable>Available: <input type="text" id="7" placeholder="available" class="form-control"  value=\"'
		contentTemp+=proper["available"];
	    contentTemp+='\"></lable></div>'
		+' </form>';
	
	$.confirm({
    title: 'Change planet',
    content: contentTemp,
        	
    buttons: {
        formSubmit: {
            text: 'Save changes',
            btnClass: 'btn btn-success',
            action: function(){
				if(checkChangesShipForm()){
					console.log(proper["id"]);
					$.ajax({
					   type:'PUT',
					   url:'https://sspacedelivery.herokuapp.com/api/ships',
					   data:{
						   "SID":JSON.parse(localStorage.getItem("SID")),
						   "ship":{
							   "id":proper["id"],
							   "location":$('#1').val(),
							   "capacity":$('#2').val(),
						   	   "volume":$('#3').val(),
						       "ability":$('#4').val(),
						       "speed":$('#5').val(),
						       "consumption":$('#6').val(),
						   }},success:function(){
							loadShips();
						   }
						  
					   })
				}else return false;
            }
        },
        cancel: function () {
        },
    },
 
});
}