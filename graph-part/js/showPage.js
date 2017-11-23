$( document ).ready( function (){
	$.ajax({
		type:'GET',
		url:"https://someleltest.herokuapp.com/api/users/checkPermisiion?SID="+JSON.parse(localStorage.getItem("SID")),
		success:function(response){console.log(response);}
	})
	/*var permision=localStorage.getItem("SID");
	if(!localStorage.getItem("permission")){location.replace("index.html");}*/
	
})
