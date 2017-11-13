var form1=document.getElementById("form");
var form2=document.getElementById("aftreg");
var name;
form1.addEventListener("submit",pre);
function pre (event){
    event.preventDefault();
   name=document.getElementById("email").value;
        email=$("#email").val();
        $.post("https://someleltest.herokuapp.com/api/users/register",
        {
            "email":email,
            "password":$("#password").val()
        },
        function(data,status){
        form1.style.display="none";
        form2.style.display="block";
        }
        )
}
form2.addEventListener("submit",conf);
function conf(event){
    event.preventDefault();
  
   /*    $.post("https://someleltest.herokuapp.com/api/users/200",
             function(status){
        console.log(status);
            setTimeout(location.replace("office.html"), 5000);
       })*/
       $.post("https://someleltest.herokuapp.com/api/users/confirm",
        {
            "email":email,
            "code":$("#confirmField").val()
			
        },function(status){
           location.replace("office.html");
               
       })
       
    }