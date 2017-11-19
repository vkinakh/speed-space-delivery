$(document).ready(function(){
	
if (localStorage.getItem("permission")===null){
	console.log("Yout are nor autorized");
}
	var permission=JSON.parse(localStorage.getItem("permission"));
	switch(permission){
	case "admin":{
		console.log("switch admin");
		break;
	}
		
	case "operator" :{
		console.log("switch operator");
		var admin=document.getElementsByClassName("admin operator");
			for (i=0;i<admins.length;i++){
				admin[i].style.display="none";
			}
		console.log(admin.length);
		break;
	}	
	default:{
		console.log("switch default");
		var admin=document.getElementsByClassName("admin operator");
		for (i=0;i<admin.length;i++){
			admin[i].style.display="none";
		}
		var operator=document.getElementsByClassName("operator");
		for (i=0;i<operator.length;i++){
			operator[i].style.display="none";
		}
		console.log("admin length= "+admin.length);
		console.log("operator length= "+operator.length);
		break;
		}
}
})

