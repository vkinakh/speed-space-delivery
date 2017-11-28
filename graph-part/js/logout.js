$("#logout").click(function (){
	$.post("https://someleltest.herokuapp.com/api/users/logout",{
		"SID":JSON.parse(localStorage.getItem("SID"))
		},function (status){
		console.log(status);
		});
	localStorage.clear();
	location.replace("index.html");
})