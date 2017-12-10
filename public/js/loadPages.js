//------------------------------------variables--------------------------------------------------------//
var pages={ // list of pages thar admin,operator,defaul,unauthorized have access
	admin:["index.html","log-in.html","order.html","planets.html","ships.html","sing-up.html","tfa.html","users.html","main_user_page.html"],
	operator:["index.html","log-in.html","order.html","ships.html","sing-up.html","tfa.html","main_user_page.html"],
	default:["index.html","log-in.html","sing-up.html","tfa.html","main_user_page.html"],
	unauthorized:["index.html","log-in.html","sing-up.html"]
}
var fileName=location.pathname.match(/[^\/]+$/)[0];
	
var availablePages;
	
//------------------------------------functions--------------------------------------------------------//
// convertPermission to permission that need
function convertPermission(perm) {
	'use strict'
	if(perm!=="admin"){
		console.log("Your permission is not admin")
		if(perm!=="operator"){
			console.log("Your permission is not operator")
			if(perm!="default") {
				console.log("You are not authorizerd")
				perm="unauthorized"
				return perm
			}else {perm="default"; return perm} ;
		} else {perm="operator"; return perm}
	} else {perm="admin"; return perm}
}
// audit for possibility see page
function checkAccessByFileName(perm){
	'use strict'
	availablePages=pages[perm];
	var pr=false;
	console.log("List of pages:")
	availablePages.forEach(function(value,index){
		if (fileName===value) pr=true;
		console.log(value);
	})
	if (!pr){window.stop();location.replace("index.html")}
	}

//----------------------------------call functions-----------------------------------------------------//
checkAccessByFileName(convertPermission(JSON.parse(localStorage.getItem("permission"))));

// analog method calling this functions 
/*
localStoragePermission=JSON.parse(localStorage.getItem("permission"));
var convertedPermission =convertPermission(localStoragePermission);
checkAccessByFileName(convertedPermission);*/
	

	


	