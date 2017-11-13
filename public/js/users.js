$(document).ready(function() {
    	var url="https://someleltest.herokuapp.com/api/users?SID=";
		url+=JSON.parse(localStorage.getItem("SID"));
	$.get(url,function (data){
		console.log(data);
		show(data);
	});
});

function show(data){
	var table='<table class=" table table-hover table-bordered"><tr>';
		
		var res = data.reduce(function(arr, o) {
  return Object.keys(o).reduce(function(a, k) {
    if (a.indexOf(k) == -1) a.push(k);
    return a;
  }, arr)
}, []);
		console.log(res);

		for(i=0;i<res.length;++i){table+="<th>"+res[i]+"</th>";}
		table+="</tr>";
		for (i=0;i<data.length;++i){
			table+="<tr>";
			var temp=data[i];
		for (var k in temp){table+="<td>"+temp[k]+"</td>";}
			table+="</tr>";
		}
		table+="</table>"
		document.getElementById("users").innerHTML=table;
	}