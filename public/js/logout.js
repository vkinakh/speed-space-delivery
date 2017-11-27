$("#logout").click(function (){
	
	location.replace("index.html");
	var url="https://someleltest.herokuapp.com/api/users/logout";
	$.post(url,{
		"SID":JSON.parse(localStorage.getItem("SID"))
		},function (status){
			localStorage.clear();
			console.log(status);
		});
})
