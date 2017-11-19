var signForm=document.getElementById("form");
var confirmForm=document.getElementById("aftreg");
var email;
var url="https://someleltest.herokuapp.com/api/users/";
var regEmail = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;

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
								console.log("erorr while saving 'back-end trouble' code 400");
							}
						},
						error:function(status){
								alert(status.responseText);
							}
					})	
						}else{
							alert("Passwords isn`t equals!");
							$("#password").val('');
							$("#password2").val('');
						}
	} else {alert("Input at least 8 characters");$("#password").val('');$("#password2").val('')}
	} else {alert("This isn`t email!");$("#email").val('');}
	
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