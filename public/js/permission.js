document.addEventListener("submit",function(event){
    event.preventDefault();
})

 $("#addAdmin").click(function(){
     $.post("https://someleltest.herokuapp.com/api/users/addAdmin",{
		"SID":JSON.parse(localStorage.getItem("SID")),
		"email":$("#email").val(),
		
	},
		  function (status){console.log(status);
                           location.reload();})
    })

 
$("#addOperator").click(function(){
     var op={
        "SID":JSON.parse(localStorage.getItem("SID")),
        "email":$("#email").val(),
        "location":$("#location").val()
    }
	$.post("https://someleltest.herokuapp.com/api/users/addOperator",op
		  ,function (status){console.log(status);
                            location.reload();});	

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
                                     location.reload();}
		})
})
$("#removePermission").click(function(){
    $.post("https://someleltest.herokuapp.com/api/users/removePermission",
          {
        "email":$("#email").val(),
        "SID":JSON.parse(localStorage.getItem("SID"))
    },
          function(status){console.log(status);location.reload();})
})