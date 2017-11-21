var url="https://someleltest.herokuapp.com/api/planets";
var urlGet=url+"?SID=";
	urlGet+=JSON.parse(localStorage.getItem("SID"));
var planets_NODE=document.getElementById("planets");

$(document).ready(function() {
	document.addEventListener("submit",function(event){
		event.preventDefault();
	});
	myGet(buildHtmlTablePlanets);// завантаження таблиці планет
});

function myGet(responseFunction){
	$.ajax({
		 url:urlGet,
		 type:'GET',
		 success:function(data){responseFunction(planets_NODE,data)},
		 error:function(status){alert(status.responseText);}
			});
}

function myPost(obj_JSON){
	console.log(obj_JSON);
 $.ajax({
	 url:url,
	 type:'POST',
	 data:obj_JSON,
	 success:function(){alert("O`k");myGet(buildHtmlTablePlanets)},
	 error:function(status){alert(status.responseText); return false;}
		})
}



function deletePlanet (param) {
	console.log(param);
	$.ajax({
		"url":url,
		type:'DELETE',
		data:{
			"SID":JSON.parse(localStorage.getItem("SID")),
			"planetName":param
		},
		success:function(){console.log("success in delete");myGet(buildHtmlTablePlanets)},
	 	error:function(status){alert(status.responseText);}
		
	//})
})
}

$("#add").click(function(){addPlanet()});
$("#reload").click(function (){console.log("reload");myGet(buildHtmlTablePlanets)}); // обновленя таблиці
$("#delete").click(function(){var name=$("#name").val();deletePlanet(name);myGet(buildHtmlTablePlanets)}); // видалення планети по параметру

function buildHtmlTablePlanets(selector,responseArr)
	{
		var position = responseArr.map(function(el){
return el.position;
		});
		
		responseArr = responseArr.map(function(el){
return el.data;
		});
		
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
		table+="<th>X</th><th>Y</th>";
	table+="</tr>"
	
	
	for (i=0;i<responseArr.length;++i){
		var temp=responseArr[i];
		table+="<tr>";
	for (j=0;j<keys.length;++j){
		if(j==0){
			table+='<td style="background-color:';
			table+=temp[keys[j]];
			table+='">';
			table+=temp[keys[j]];
			table+='</td>';;
		}
		else
		{
			table+="<td>";
			if(temp[keys[j]]) table+=temp[keys[j]];else table+="";
			table+="</td>";
			}
	}
		if(position[0]){
			table+="<td>"+position[i].x+"</td>";
			table+="<td>"+position[i].y+"</td>";
			}
			table+'</tr>';
		}

	
	table+="</table>";
	selector.innerHTML=table;
		}
			




function addPlanet(){
	var planetJSON={
		"SID":JSON.parse(localStorage.getItem("SID")),
		"planet":{
		"name":$("#name").val(),
		"diameter":$("#diameter").val(),
		"type":$("#type").val(),
		"galactic":$("#galactic").val(),
		"position":{
			"x":$("#x").val(),
			"y":$("#y").val()
		},
		"image":$("#image").val(),
		
		"color":$("#color").val()
	}
	}
	myPost(planetJSON);// mypost
};


