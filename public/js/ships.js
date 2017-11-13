$( document ).ready(function() {
 
    
		var url="https://someleltest.herokuapp.com/api/ships?SID=";
       url+=JSON.parse(localStorage.getItem("SID")); 
		$.get(url,
   
            function (data,status)
            {
                console.log(data);
			showShips(data);
            }
             )
    document.addEventListener("submit",pre);
 
});
function pre(event){
    event.preventDefault();
}
          $("#Add").click(function (){
               var location=$("#location").val();
    		   var capacity=$("#capacity").val();
    		   var volume=$("#volume").val();
    		   var speed=$("#speed").val();
	 		   var ability=$("#ability").val();
        $.post("https://someleltest.herokuapp.com/api/ships",
        {
            "SID":JSON.parse(localStorage.getItem("SID")),
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
        });
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

function showShips(data){
	 var table='<table class="table table-hover table-bordered">';
		 table+="<th>Id</th><th>location</th><th>capacity</th><th>volume</th><th>ability</th></tr>";
	 for (i=0;i<data.length;++i)
		 {
			
			 table+="<tr>";
			 table+="<td>"+data[i].id+"</td>";
			 table+="<td>"+data[i].location+"</td>";
			 //table+"<td>"+data[i].speed+"</td>";
			 table+="<td>"+data[i].capacity+"</td>";
			 table+="<td>"+data[i].volume+"</td>";
			 table+="<td>"+data[i].ability+"</td>";
			 table+="</tr>"
			 console.log(data[i].speed);
		 }
	 table+="</table>";
	 
	 document.getElementById("ships").innerHTML=table;
 }