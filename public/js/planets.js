var url="https://sspacedelivery.herokuapp.com/api/planets";
var urlGet=url+"?SID=";
	urlGet+=JSON.parse(localStorage.getItem("SID"));
var planets_NODE=document.getElementById("planets");
var RESPONSEARR;

$(document).ready(function() {
	document.addEventListener("submit",function(event){
		event.preventDefault();
	});
	myGet(buildHtmlTablePlanets);// завантаження таблиці планет
});
function myGet(responseFunction){
	if(localStorage.getItem("SID")){
	$.ajax({
		 url:urlGet,
		 type:'GET',
		 success:function(data){RESPONSEARR=data;responseFunction(planets_NODE,data);},
		 error:function(status){alert(status.responseText);}
			});
		}else {$.ajax({
			url:"https://sspacedelivery.herokuapp.com/api/planets/getAll",
			type:'GET',
			success:function (data){console.log(data);buildHtmlTablePlanetsUsers(planets_NODE,data)}
		})}
}
//$("#reload").click(function (){console.log("reload");myGet(buildHtmlTablePlanets)}); // обновленя таблиці
function buildHtmlTablePlanets(selector,responseArr){
		
		var position = responseArr.map(function(el){
return el.position;
		});
		
		responseArr = responseArr.map(function(el){
return el.data;
		});
		
			var keys = [];
responseArr.map(function(el){
    for(var k in el){
  if(keys.indexOf(k)===-1) keys.push(k);
    }
});
keys.sort();
		
	
	var table="<table class='table-bordered table-hover table-responsive'>";
	
	table+="<tr>"
	
	for (i=0;i<keys.length;++i){
		table+="<th>"+keys[i]+"</th>";
	}
		table+="<th>X</th><th>Y</th><th style='color:red;'>Delete</th><th style='color:green'>Change</th><th style='color:#0066FF'>Add</th>";
	table+="</tr>"
	
	
	for (i=0;i<responseArr.length;++i){
		var temp=responseArr[i];
		table+="<tr>";
	for (j=0;j<keys.length;++j){
		if(j==0){
			table+='<td style="background-color:';
			table+=temp[keys[j]];
			table+='">';
			table+=temp[keys[j]];
			table+='</td>';;
		}
		else
		{
			table+="<td>";
			if(temp[keys[j]]!== undefined) table+=temp[keys[j]];else table+="";
			table+="</td>";
			}
	}
		if(position[0]){
			table+="<td>"+position[i].x+"</td>";
			table+="<td>"+position[i].y+"</td>";
			}
			table+="<td><i class='fa fa-times-circle fa-2x' style='color:red;' onclick='";
			table+="removePlanet(\"";
			table+=temp.name;
			table+="\")'</i></td>";
		 	table+="<td><i class='fa fa-upload fa-2x' style='color:green;' onclick='";
			table+='changePlanet(\"';
		    table+=temp.name;
			table+="\")'</i></td>";
		if(i==0){table+="<td><i class='fa fa-plus fa-2x' style='color:#0066FF;' onclick='";
			table+='addPlanet(\"';
		    table+=temp.name;
			table+="\")'</i></td>"}
		    table+'</tr>';
		}
	table+="</table>";
	selector.innerHTML=table;
		}
function filldFormByPlanetName(name){
	var proper={};
	RESPONSEARR.forEach(function(el,i){
		if(el.data["name"]==name){
			proper.name=el.data["name"];
			proper.type=el.data["type"];
			proper.diameter=el.data["diameter"];
			proper.galactic=el.data["galactic"];
			proper.image=el.data["image"];
			proper.color=el.data["color"];
			proper.x=el.position["x"];
			proper.y=el.position["y"];
		}
	})
	return proper;
}
function checkChangesPlanetForm(){
		var pr=true;
		
			if(!$('#name').val()){
			$("#name").addClass("text-glow");setTimeout(function () { $("#name").removeClass("text-glow");},1000);pr=false;
			   };
		
			if(!$('#type').val()){
			$("#type").addClass("text-glow");setTimeout(function () { $("#type").removeClass("text-glow");},1000);pr=false;
			   };
		
			if(!$('#diameter').val()){
			$("#diameter").addClass("text-glow");setTimeout(function () { $("#diameter").removeClass("text-glow");},1000);pr=false;
			   };
			if(!$('#galactic').val()){
			$("#galactic").addClass("text-glow");setTimeout(function () { $("#galactic").removeClass("text-glow");},1000);pr=false;
			   };
			if(!$('#image').val()){
			$("#image").addClass("text-glow");setTimeout(function () { $("#image").removeClass("text-glow");},1000);pr=false;
			   };
			if(!$('#color').val()){
			$("#color").addClass("text-glow");setTimeout(function () { $("#color").removeClass("text-glow");},1000);pr=false;
			   };
			if(!$('#x').val()){
			$("#x").addClass("text-glow");setTimeout(function () { $("#x").removeClass("text-glow");},1000);pr= false;
			   };
			if(!$('#y').val()){
			$("#y").addClass("text-glow");setTimeout(function () { $("#y").removeClass("text-glow");},1000);pr=false;
			   };
		return pr;
	}
function changePlanet(planetName){
	console.log(RESPONSEARR);
	var proper=filldFormByPlanetName(planetName);
	var contentTemp='<form>'
		+'<div class="form-group"><lable>Name:<input type="text"  placeholder="name"  id="name" class="form-control"'
		contentTemp+='value=\"'
		contentTemp+=proper["name"];
		contentTemp+='\" disabled></lable></div>'
	
		+'<div class="form-group"><lable>Type:<input type="text"  placeholder="type" id="type" class="form-control"'
		contentTemp+='value=\"'
		contentTemp+=proper["type"];
		contentTemp+='\"></lable></div>'
	
		+'<div class="form-group"><lable>Diameter:<input type="text"  placeholder="diameter" id="diameter" class="form-control"'
		contentTemp+='value=\"'
		contentTemp+=proper["diameter"];
		contentTemp+='\"></lable></div>'
		+'<div class="form-group"><lable>Galactic:<input type="text"  placeholder="galactic" id="galactic" class="form-control"'
		contentTemp+='value=\"'
		contentTemp+=proper["galactic"];
		contentTemp+='\"></lable></div>'
		+'<div class="form-group"><lable>Image:<input type="text"  placeholder="image" id="image" class="form-control"'
		contentTemp+='value=\"'
		contentTemp+=proper["image"];
		contentTemp+='\"></lable></div>'
		+'<div class="form-group"><lable>Color:<input type="text"  placeholder="color" id="color" class="form-control"'
		contentTemp+='value=\"'
		contentTemp+=proper["color"];
		contentTemp+='\"></lable></div>'
		+'<div class="row stye=""><div class="col-3"><div class="form-group"><lable>X:<input type="text"  placeholder="X" id="x" class="form-control" value=\"';
		contentTemp+=proper["x"];
		contentTemp+='\"></lable></div></div>'
		+'<div class="col-3"><div class="form-group"><lable>Y:<input type="text"  placeholder="Y" id="y" class="form-control" value=\"';
		contentTemp+=proper["y"];
		contentTemp+='\"></lable></div></div> </div>';
		contentTemp+='</form>'
	
	$.confirm({
    title: 'Change planet',
    content: contentTemp,
        	
    buttons: {
        formSubmit: {
            text: 'Save changes',
            btnClass: 'btn btn-success',
            action: function () {
				
               if(checkChangesPlanetForm()){
				   console.log($('#name').val());
				   console.log($('#diameter').val());
				   console.log($('#galactic').val());
				   console.log($('#image').val());
				   console.log($('#color').val());
				   console.log($('#x').val());
				   console.log($('#y').val());
				   $.ajax({
					   type:'PUT',
					   url:'https://sspacedelivery.herokuapp.com/api/planets',
					   data:{
						   "SID":JSON.parse(localStorage.getItem("SID")),
						   "planet":{
							   "name":$('#name').val(),
							   "type":$('#type').val(),
						   	   "diameter":$('#diameter').val(),
						       "galactic":$('#galactic').val(),
						       "image":$('#image').val(),
						       "color":$('#color').val(),
							   "position":{
								   "x":$('#x').val(),
								   "y":$('#y').val()
							   }
						   },success:function(){
							  $.alert("Please reload page! Or click on 'reload table' ");
						   }
						  
					   }
				   })
			   }else return false;
            }
        },
        cancel: function () {
            //close
        },
    },
   /* onContentReady: function () {
        // bind to events
        var jc = this;
        this.$content.find('form').on('submit', function (e) {
            // if the user submits the form by pressing enter in the field.
            e.preventDefault();
            jc.$$formSubmit.trigger('click'); // reference the button and click it
        });
    }*/
});
}
function removePlanet(name){
	  $.confirm({
	animation:'rotate',
	closeAnimation:'scale',	 
    title: 'Removing Planet',
    content: 'Do you realy want to remove '+ name,
    type: 'red',
    typeAnimated: true,
	autoClose: 'cancel|4000',
    buttons: {
        remove: {
            text: 'Remove!',
            btnClass: 'btn-red',
            action: function(){
				$.ajax({
		 type:'DELETE',
		 url:url,
		 data:{
			 "SID":JSON.parse(localStorage.getItem("SID")),
			 "planetName":name
		 },
		 success:function (){
		myGet(buildHtmlTablePlanets);
	},
		erorr:function(status){
			alert(status.responseText);
		}
	 })
            }
        },
        cancel: function () {
        }
    }
})
 }
function addPlanet(){
	console.log("add");
	 $.confirm({
	animation:'rotate',
	closeAnimation:'scale',	 
    title: 'Adding Planet',
    typeAnimated: true,
	content:'<form>'
		+'<div class="form-group"><input type="text" id="name" placeholder="name" class="form-control"></div>'
		+'<div class="form-group"><input type="text" id="type" placeholder="type" class="form-control"></div>'
		+'<div class="form-group"><input type="text" id="diameter" placeholder="diameter" class="form-control"></div>'
		+'<div class="form-group"><input type="text" id="galactic" placeholder="galactic" class="form-control"></div>'
		+'<div class="form-group"><input type="text" id="image" placeholder="image" class="form-control"></div>'
		+'<div class="form-group"><input type="text" id="color" placeholder="color" class="form-control"></div> '
        +'<div class="row"><div class="col-3"><div class="form-group"><input type="text" id="x" placeholder="X" class="form-control"></div></div>'
        +'<div class="col-3"><div class="form-group"><input type="text" id="y" placeholder="Y" class="form-control"></div></div></div>'
		+' </form>'
  
		 ,
    buttons: {
       	Add: {
            text: 'Add',
            btnClass: 'btn-success',
            action: function(){
               if(checkChangesPlanetForm()){
				   console.log($('#name').val());
				   console.log($('#diameter').val());
				   console.log($('#galactic').val());
				   console.log($('#image').val());
				   console.log($('#color').val());
				   console.log($('#x').val());
				   console.log($('#y').val());
				   $.ajax({
					   type:'POST',
					   url:'https://sspacedelivery.herokuapp.com/api/planets',
					   data:{
						   "SID":JSON.parse(localStorage.getItem("SID")),
						   "planet":{
							   "name":$('#name').val(),
							   "type":$('#type').val(),
						   	   "diameter":$('#diameter').val(),
						       "galactic":$('#galactic').val(),
						       "image":$('#image').val(),
						       "color":$('#color').val(),
							   "position":{
								   "x":$('#x').val(),
								   "y":$('#y').val()
							   }
						   },success:function(){
							 $.alert("Please reload page!");
						   }
						  
					   }
				   })
			   }else return false;
            }
        },
        cancel: function () {
        }
    }
		 
})
};


