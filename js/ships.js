var url="https://someleltest.herokuapp.com/api/ships";
var urlGet="https://someleltest.herokuapp.com/api/ships?SID=";
urlGet+=JSON.parse(localStorage.getItem("SID"));
var table=document.getElementById("ships");

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
		},
		error:function (status){
			alert(status.responseText);
		}
	})	
	}


  $("#Add").click(function (){
	  var ship_JSON={
		  "SID":JSON.parse(localStorage.getItem("SID")),
		  "ship":{
		  "location":$("#location").val(),
		  "capacity":$("#capacity").val(),
		  "volume":$("#volume").val(),
		  "speed":$("#speed").val(),
		  "ability":$("#ability").val(),
		  "consumption":$("#consumption").val()
	  }}
	  console.log(ship_JSON);
	 $.ajax({
		  type:"POST",
		  url:url,
		  data:ship_JSON,
		 success:function(){
			 loadShips();
		 },
		 error:function(status){alert(status.responseText)}
	 })

    /*    $.post("https://someleltest.herokuapp.com/api/ships",
        {
            
                "ship":{
                    "location":location,
                    "capacity":capacity,
                    "volume":volume,
                    "ability":"innerGalactic",
                    "speed":speed,
                    "consumption":5,
					"ability":ability
                }
            },
        function(data,status){
            console.log("O`k");
           // location.reload();
        });*/
    })
$("#Delete").click(function (){
	//var url=https://someleltest.herokuapp.com/api/ships
	$.ajax({
		url:"https://someleltest.herokuapp.com/api/ships",
		type:"DELETE",
		data:{
		"SID":JSON.parse(localStorage.getItem("SID")),
		"ship":{
		"id":$("#id").val()	
		}
		},
		success:function(){
			console.log("Ok");
		}
	})
})

function buildHtmlTable(selector,responseArr)
	{
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
			if(temp[keys[j]]) table+=temp[keys[j]];else table+="";
			table+="</td>";
			}
	}

	
	table+="</table>";
	selector.innerHTML=table;
		}