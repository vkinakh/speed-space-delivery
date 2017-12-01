var signForm=document.getElementById("form");
var confirmForm=document.getElementById("aftreg");
var email;
var url="https://someleltest.herokuapp.com/api/users/";
var regEmail = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
var registerField=document.getElementsByClassName("form-group");
signForm.addEventListener("submit",sign);
confirmForm.addEventListener("submit",conf);

function sign (event){
	'use strict'
    event.preventDefault();
	
    email=$( "#email" ).val();
	var password= $( "#password" ).val();
	var password2= $( "#password2" ).val();
	
	var sign_JSON= {
		"email":email,
		"password":password
	};
	 // audit fields for sign up
	if(regEmail.test(email)){
			if(password.length>=8){
				if(password===password2){
					$.ajax({
						type:"POST",
						url:url+"register",
						data:sign_JSON,
						statusCode:{
							200:function (){
								signForm.style.display="none";
								confirmForm.style.display="block";
							},
							400:function(){
								$.alert("erorr while saving 'back-end trouble' code 400");
							}
						},
						error:function(status){
								alert(status.responseText);
							}
					})	
						}else{ // add tooltip and red color for input
							$("#password").val('');
							$("#password2").val('');
							$("#password").addClass("text-glow");
							$(registerField[2]).addClass("hint2");
							setTimeout(function () { $("#email").removeClass("text-glow");
													   $(registerField[2]).removeClass("hint2");
													   }, 2000);
							setTimeout(function(){$(registerField[2]).removeClass("hint2");},1000)
							$("#password2").val(''); $("#password2").addClass("text-glow");
							setTimeout(function () { $("#password2").removeClass("text-glow"); }, 2000);
	
						}
	} else { 
		$("#password").val(''); $("#password").addClass("text-glow");
		$(registerField[1]).addClass("hint2");
            setTimeout(function () { $("#email").removeClass("text-glow");
								   $(registerField[1]).removeClass("hint2");
								   }, 2000);
		setTimeout(function(){$(registerField[1]).removeClass("hint2");},1000)
		$("#password2").val(''); $("#password2").addClass("text-glow");
        setTimeout(function () { $("#password2").removeClass("text-glow"); }, 2000);
			
			}
	} else {$("#email").val('');
			$("#password").val('');
			$("#password2").val('');
			$("#email").addClass("text-glow");
			$(registerField[0]).addClass("hint2");
            setTimeout(function () { $("#email").removeClass("text-glow");
								   $(registerField[0]).removeClass("hint2");
								   }, 2000);
		   }
}


function conf(event){
	'use strict'
    event.preventDefault();
    
	var code=$("#confirmPassword").val();
	
    var confirm_JSON={
        "email":email,
        "code":code
    }
	if(code.length){
		$.ajax({
			type:"POST",
			url:url+"confirm",
			data:confirm_JSON,
			statusCode:{
				200:function(){
					location.replace("log-in.html");
				},
				400:function (){
					alert("Wrong code!");
				}
			},
			erorr:function(status){alert(status.responseText)}
		})
       
    } else alert("Confirm Filed is empty!");
}