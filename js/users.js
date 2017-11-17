var url="https://someleltest.herokuapp.com/api/users/";
var urlGet="https://someleltest.herokuapp.com/api/users?SID=";
var table=document.getElementById("table");
var user_JSON
$(document).ready(function() {
		urlGet+=JSON.parse(localStorage.getItem("SID"));
	loadTable();
});
document.addEventListener("submit",function(event){
	event.preventDefault();
		user_JSON={
		"SID":JSON.parse(localStorage.getItem("SID")),
		"email":$("#email").val(),
	}
})
function loadTable(){$.get(urlGet,function (data){
		console.log(data);
		buildHtmlTable(document.getElementById("table"),data);
	});}

function buildHtmlTable(selector,responseArr)
	{
			var keys = [];
responseArr.map(function(el){
    for(var k in el){
  if(keys.indexOf(k)===-1) keys.push(k);
    }
});
keys.sort();
		

	
	var table="<table class='table-bordered table-hover table-responsive'>";
	
	table+="<tr>"
	console.log(keys);
	for (i=0;i<keys.length;++i){
		table+="<th>"+keys[i]+"</th>";
	}
	
	for (i=0;i<responseArr.length;++i){
		var temp=responseArr[i];
		table+="<tr>";
	for (j=0;j<keys.length;++j){
			table+="<td>";
			if(temp[keys[j]]) table+=temp[keys[j]];else table+="";
			table+="</td>";
			}
	}

	
	table+="</table>";
	selector.innerHTML=table;
		}


 $("#addAdmin").click(function(){
     $.ajax({
     	 type:"POST",
		 url:"https://someleltest.herokuapp.com/api/users/addAdmin",
		 data:user_JSON,
		 success:function(status){console.log(status);loadTable()},
		 error:function(status){alert(status.responseText)}
	 });
 });
					  
$("#addOperator").click(function(){
     var op={
        "SID":JSON.parse(localStorage.getItem("SID")),
        "email":$("#email").val(),
        "location":$("#location").val()
    }
	 
	$.post("https://someleltest.herokuapp.com/api/users/addOperator",op
		  ,function (status){console.log(status);
                           loadTable();});	

	})
$("#dellUser").click(function(){
   $.ajax({
			url:"https://someleltest.herokuapp.com/api/users",
			type:'DELETE',
			data:{
				"email":$("#email").val(),
				"SID":JSON.parse(localStorage.getItem("SID"))
			},
			success:function (status){console.log(status);
                                     loadTable();;}
		})
})
$("#removePermission").click(function(){
    $.post("https://someleltest.herokuapp.com/api/users/removePermission",
          {
        "email":$("#email").val(),
        "SID":JSON.parse(localStorage.getItem("SID"))
    },
          function(status){console.log(status);loadTable();})
})