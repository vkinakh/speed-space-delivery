$.get("https://someleltest.herokuapp.com/api/planets/getAll",
			  function(data){console.log(data);
							 $.each(data, function (i, planet) {
								 
    $('#from').append($('<option>', { 
        value: i,
        text : planet.name
    }));
	$("#to").append($('<option>',{
		value:i,
		text:planet.name
	}))
});
							} )
		// document.addEventListener("click",function(){
		 var url="https://someleltest.herokuapp.com/api/";
		 url+="orders";
		 document.addEventListener("submit",function(event){event.preventDefault();})// preventDefault
		 $("#makeOrder").click(function(){
		  var sender=$("#sender").val();
		  var reciever=$("#reciever").val();
		  var from = $('#from').find(":selected").text();
		  var to = $('#to').find(":selected").text();
		  var weight=$('#weight').val();
		  var volume=$('#volume').val();
		  var type=$('#type').find(":selected").text();
			 var order={
				 "SID":JSON.parse(localStorage.getItem("SID")),
			"order":{
				"sender":sender,
				"reciever":reciever,
				"from":from,
				"to":to,
				"weight":weight,
				"volume":volume,
				"type":type
			 }};
		 console.log(order);
			 
			 $.ajax({
				 url:url,
				 type:'POST',
				 data:order,
				 success:function(){alert("Order was sent");location.reload();},
				 error:function(status){alert(JSON.stringify(status));console.log(JSON.stringify(order));}
			 })
		 })

 function show(){
			 var url="https://someleltest.herokuapp.com/api/orders?SID=";
		url+=JSON.parse(localStorage.getItem("SID"));
		$.get(url,function(data){
			console.log(data);
			showOrders(data);
		});
		 }
		 $("#hideOrders").click(function(){
			  $("#makeOrderForm").show();
			  $("#showOrders").show();
			  $("#orders").hide();
			  $("#controlForm").hide();
			  $("#createContainer").hide();
			 
		 })
		 $("#showOrders").click(function(){
							  $("#makeOrderForm").hide();
			 				  $("#showOrders").hide();
			 				  $("#orders").show();
			 				  $("#controlForm").show();
			 				  $("#createContainer").show();
			 show();
							   })
		 function showOrders(data){
		var table='<table class="table table-bordered table-hover">';
		table+='<tr><th>form</th><th>location</th><th>price</th><th>reciever</th><th>reg_date</th><th>sender</th><th>status</th>';
  table+='<th>to</th><th>thackID</th><th>type</th><th>volume</th><th>weight</th></tr>'
		for(i=0;i<data.length;++i){
		table+="<tr>"
			table+="<td>"+data[i].from+"</td>";
			table+="<td>"+data[i].location+"</td>";
			table+="<td>"+data[i].price+"</td>";
			table+="<td>"+data[i].reciever+"</td>";
			table+="<td>"+data[i].reg_date+"</td>";
			table+="<td>"+data[i].sender+"</td>";
			table+="<td>"+data[i].status+"</td>";
			table+="<td>"+data[i].to+"</td>";
			table+="<td>"+data[i].trackID+"</td>";
			table+="<td>"+data[i].type+"</td>";
			table+="<td>"+data[i].volume+"</td>";
			table+="<td>"+data[i].weight+"</td>";
			
			
		table+="</tr>"
		}
		table+='</table>';
		document.getElementById("orders").innerHTML=table;
	}
		 $("#accept").click(function(){
			 var accept={
				 "SID":JSON.parse(localStorage.getItem("SID")),
				"trackID":$("#trackID").val(),
				"action":"accept"
			 }
			$.ajax({
			url:"https://someleltest.herokuapp.com/api/orders",
			type:'put',
			data:accept,
			success:function(status){console.log(status);show();}
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
		$("#btnCreateContainer").click(function(){
			var temp=[],location;
			temp=$("#orderID").val();
		    var num="[";
			num+=temp;
			num+="]";
			console.log(temp);
			var num=JSON.parse(num);
			location=$("#location").val();
			var cont= {
			"SID":JSON.parse(localStorage.getItem("SID")),
			"orders":num,
			"location":location
			   }
			$.ajax({
				type:"POST",
				url:"https://someleltest.herokuapp.com/api/orders/createContainer",
				data:cont,
				error:function(status,responseText){console.log(status.responseText);}
			})
			console.log(num);
		})

			
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
		/*$.post("https://someleltest.herokuapp.com/api/orders/createContainer",
			  cont,
		function(status){console.log(status);}
			   )*/
		})
		// console.log(JSON.parse(localStorage.getItem("SID")));
		// console.log(JSON.parse(localStorage.getItem("permission")));
		// console.log(from);
		 //console.log(to);
		 //console.log(weight);
		 //console.log(volume);
		// })
			 