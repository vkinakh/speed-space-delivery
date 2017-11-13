$("#logout").click(function (){
			localStorage.clear();
		var url="https://someleltest.herokuapp.com/api/users/logout";
		$.post(url,{
			"SID":JSON.parse(localStorage.getItem("SID"))
		},function (status){
			console.log(status);
			//localStorage.clear();
            location.replace("index.html");
		});
	})