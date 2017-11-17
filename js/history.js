$(document).ready(function (){
    var url="https://someleltest.herokuapp.com/api/orders?SID=";
    url+=JSON.parse(localStorage.getItem("SID"));
    $.get(url,function(data){
        console.log(data);
        show(data);
    })
})
function show(array){
        var table='<table class="table table-hover table-bordered">';
    table+='<tr><th>from</th><th>price</th><th>reciever</th><th>reg_date</th><th>sender</th><th>status</th><th>to</th><th>trackID</th><th>type</th><th>volume</th><th>weight</th></tr>';
    for (i=0;i<array.length;++i){
        var temp=array[i];
        table+='<tr>';
        table+='<td>'+temp.from+'</td>';
        table+='<td>'+temp.price+'</td>';
        table+='<td>'+temp.reciever+'</td>';
        table+='<td>'+temp.reg_date+'</td>';
        table+='<td>'+temp.sender+'</td>';
        table+='<td>'+temp.status+'</td>';
        table+='<td>'+temp.to+'</td>';
        table+='<td>'+temp.trackID+'</td>';
        table+='<td>'+temp.type+'</td>';
        table+='<td>'+temp.volume+'</td>';
        table+='<td>'+temp.weight+'</td>';
        table+='</tr>';

    }
    
        table+="</table>";
    document.getElementById("history").innerHTML=table;
}