$("#logout").click(function (){
	$.ajax({
		type:'POST',
		url:"https://someleltest.herokuapp.com/api/users/logout",
		data:{
		"SID":JSON.parse(localStorage.getItem("SID"))	
		},
		success:function(){
							localStorage.clear();
							location.replace("index.html")
						  },
		error:function(){alert("Some wrong!"); localStorage.clear();
						location.replace("index.html");}
		
	})
	$.post("https://someleltest.herokuapp.com/api/users/logout",{
		},function (status){
		console.log(status);
		alert("Log out success");
		});
/*	;*/
})