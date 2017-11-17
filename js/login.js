    
document.addEventListener("submit",login);

function login (event){
	event.preventDefault();
	var email=$("#email").val();
	var password=$("#password").val();
	var loginObj={
		"email":email,
		"password":password
	}
	if(!emai.lengthl&&!password.length){
		$.ajax({
			type:'POST',
			url:"https://someleltest.herokuapp.com/api/users",
			data:loginObj,
			success:function(data){
				localStorage.setItem("SID",JSON.stringify(data.SID));
				localStorage.setItem("permission",JSON.stringify(data.permission));
				location.replace("office.html");
			},
			error:function(status){alert(status.responseText);}
		})
	}else alert("Fileds is empty!");
}