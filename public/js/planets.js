$( document ).ready(function() {
    var url="https://someleltest.herokuapp.com/api/planets?SID=";
		url+=JSON.parse(localStorage.getItem("SID"));
		$.get( url, function( planets ) {
			console.log(planets);
	showPlanetsOpp(planets);
		})
});

function showPlanetsOpp(data){
	console.log(data.length)
var table='<table class="table table-bordered table-hover">';
	table+="<tr><th>Id</th><th>Galactic</th><th>Name</th><th>type</th>+<th>moonOf</th><th>Diametr</th></tr>"
	for (i=0;i<data.length;++i){
		table+="<tr>";
		table+="<td>"+data[i].data["id"]+"</td>";
		table+="<td>"+data[i].data["galactic"]+"</td>";
		table+="<td>"+data[i].data["name"]+"</td>";
		table+="<td>"+data[i].data["type"]+"</td>";
		if(data[i].data.moonOf) table+="<td>"+data[i].data.moonOf+"</td>"	;else table+="<td>" + "</td>";
		table+="<td>"+data[i].data["diameter"]+"</td>";
		table+="<td"
		table+="</tr>";
	}
	table+="</table>";
document.getElementById("planets").innerHTML=table;
	}