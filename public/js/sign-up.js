var signForm=document.getElementById("form");
var confirmForm=document.getElementById("aftreg");
var email;

signForm.addEventListener("submit",sign);

function sign (event){
	'use strict'
	
    event.preventDefault();
    email=$("#email").val();
	var password=$("#password").val();
	
	var signObj={
		"email":email,
		"password":password
	};
	
	if(password!=""&&email!=""){
    var postSign =$.post("https://someleltest.herokuapp.com/api/users/register",
       signObj,function(data,status){
        signForm.style.display="none";
        confirmForm.style.display="block";
        }
          )
	
	postSign.done(function(){console.log("O`k")});
	postSign.fail(function(){alert("Wrong!")});
		
	} else {alert("Field is empty!");}
	
	
	
}

confirmForm.addEventListener("submit",conf);
function conf(event){
	'use strict'
    event.preventDefault();
    
	var code=$("#confirmPassword").val();
	
    var confirmObj={
        "email":email,
        "code":code
    }
	if(code!=""){
      var postConfirm=$.post("https://someleltest.herokuapp.com/api/users/confirm",confirmObj,function(status){	  
           location.replace("log-in.html");
       })
	  postConfirm.done(function (){console.log("Done to confirm!")});
	  postConfirm.fail(function(){console.log("Fail to confirm!")
								 console.log(status)});
       
    } else alert("Confirm Filed is empty!");
}