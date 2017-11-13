    
document.addEventListener("submit",pre);
function pre(event){
	event.preventDefault();
        $.post("https://someleltest.herokuapp.com/api/users",
        {
            "email":$("#email").val(),
            "password":$("#password").val()
        },
			   function (data){
            localStorage.setItem("SID",JSON.stringify(data.SID));
			localStorage.setItem("permission",JSON.stringify(data.permission));
	location.replace("office.html");
			//if(status==='success')  {location.replace("office.html")} else {
              //  alert("invalid password or email");
            //    document.getElementById("#password").value="";
            console.log(status);
            }
        )
	}