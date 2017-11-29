    
document.addEventListener("submit",login);

function login (event){
	event.preventDefault();
	var email=$("#email").val();
	var password=$("#password").val();
	var loginObj={
		"email":email,
		"password":password
	}
	if(email.length&&password.length){
		$.ajax({
			type:'POST',
			url:"https://someleltest.herokuapp.com/api/users",
			data:loginObj,
			success:function(data){
				localStorage.setItem("SID",JSON.stringify(data.SID));
			//	alert(data.SID);
				localStorage.setItem("permission",JSON.stringify(data.permission));
				location.replace("main_user_page.html");
			},
			error:function(status){alert(status.responseText);}
		})
	}else alert("Fileds is empty!");
}