var pages={
	admin:["index.html","log-in.html","order.html","planets.html","ships.html","sing-up.html","tfa.html","users.html","main_user_page.html"],
	operator:["index.html","log-in.html","order.html","planets.html","ships.html","sing-up.html","tfa.html","main_user_page.html"],
	default:["index.html","log-in.html","sing-up.html","tfa.html","main_user_page.html"],
	unauthorized:["index.html","log-in.html","sing-up.html","main_user_page.html"]
}

function loadPageByPerm(perm){
	if((perm!=="admin"&&perm!=="operator"&&perm!="default")){perm="unauthorized"}
	console.log(perm)
	
	var fileName=location.pathname.match(/[^\/]+$/)[0];
	console.log(fileName);
	
	var accessPage=pages[perm];
	console.log(accessPage);
	
	var pr=false;
	console.log("List of pages:")
	accessPage.forEach(function(value,index){
		if (fileName===value) pr=true;
		console.log(value);
	})
	if (!pr){window.stop();location.replace("index.html")};
	}
	
	


	loadPageByPerm("asdasd");