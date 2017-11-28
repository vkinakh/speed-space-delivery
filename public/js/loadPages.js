$( document ).ready( function (){
	$.ajax({
		type:'GET',
		url:"https://someleltest.herokuapp.com/api/users/checkPermision?SID="+JSON.parse(localStorage.getItem("SID")),
		success:function(response){console.log(response);}
	})
	})
	var permission=JSON.parse(localStorage.getItem("permission"));
	permission=permission? permission:"unauthorized";

var pages={
	admin:["index.html","log-in.html","order.html","planets.html","register_order.html","ships.html","sing-up.html","tfa.html","users.html"],
	operator:["index.html","log-in.html","order.html","planets.html","register_order.html","ships.html","sing-up.html","tfa.html"],
	default:["index.html","log-in.html","order.html","planets.html","register_order.html","sing-up.html","tfa.html"],
	unauthorized:["index.html","log-in.html","order.html","planets.html","register_order.html","sing-up.html"]
}
function loadPageByPerm(perm){
	console.log(perm);
	console.log(typeof(perm));
	var fileName=location.pathname.match(/[^\/]+$/)[0];
	var accessPage=pages[perm];
	console.log(accessPage);
	var pr=false;
	$.each(accessPage, function( index, value ) {
 	if (fileName===value) pr=true;
	})
	if (!pr){window.stop();location.replace("index.html")};
}
loadPageByPerm(permission);