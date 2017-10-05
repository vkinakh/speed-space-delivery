var regName = /[A-ZА-Я]+[a-zа-я]{1,30}/;
var regEmail = /(?:[a-z0-9!#$%&'*+/=?^_`{|}~-]+(?:\.[a-z0-9!#$%&'*+/=?^_`{|}~-]+)*|"(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21\x23-\x5b\x5d-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])*")@(?:(?:[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.)+[a-z0-9](?:[a-z0-9-]*[a-z0-9])?|\[(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?|[a-z0-9-]*[a-z0-9]:(?:[\x01-\x08\x0b\x0c\x0e-\x1f\x21-\x5a\x53-\x7f]|\\[\x01-\x09\x0b\x0c\x0e-\x7f])+)\])/;
    var today = new Date();
    var dd = today.getDate();
    var mm = today.getMonth() + 1; 
    var yyyy = today.getFullYear();

    if (dd < 10) {
        dd = '0' + dd
    }

    if (mm < 10) {
        mm = '0' + mm
    }

    today = yyyy + '-' + mm + '-' + dd;
    document.getElementById("date").setAttribute("max", today);

         function check(reg, text) {
       if(reg.test(text)){return true} else {return false;} 
         }
         function validEqual(text1,text2){
             var equal=new regExp(text1);
             return equal.test(text2);
         }
         function myFunction() {
             document.addEventListener("submit", function (event) {
                 event.preventDefault()
             });
             
             if(validDatas()) succesReg();
             
         }
                    
function isEmpty(str) {
    return (!str || 0 === str.length);
}

function succesReg(){
    document.getElementById("form").style.display="none";
    document.getElementById("aftreg").style.display="block";
}
function validDatas() {
    var pr = true;
    var name = document.getElementById("name").value;
    var surname = document.getElementById("surname").value;
    var lastname = document.getElementById("lastname").value;
    var email = document.getElementById("email").value;
    var bd=document.getElementById("date").value;


    if (!check(regName, name)) {
        document.getElementById("name").value = ""; $("#name").addClass("text-glow");
        setTimeout(function () { $("#name").removeClass("text-glow"); }, 2000);
        pr = false;
    }
    if (!check(regName, surname)) {
        document.getElementById("surname").value = "";
        $("#surname").addClass("text-glow");
        setTimeout(function () { $("#surname").removeClass("text-glow"); }, 2000);
        pr = false;

    }
    if (!check(regName, lastname)) {
        document.getElementById("lastname").value = "";
        $("#lastname").addClass("text-glow");
        setTimeout(function () { $("#lastname").removeClass("text-glow"); }, 2000);
        pr = false;

    }
    if (!check(regEmail, email)) {
        document.getElementById("email").value = "";
        $("#email").addClass("text-glow");
        setTimeout(function () { $("#email").removeClass("text-glow"); }, 2000);
        pr = false;
    }
   if (isEmpty(bd)){
        document.getElementById("date").value = "";
        $("#date").addClass("text-glow");
        setTimeout(function () { $("#date").removeClass("text-glow"); }, 2000);
        pr = false;
   }
  
    return pr;
}