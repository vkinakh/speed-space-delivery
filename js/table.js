// Help variables 
// Begin and end are reqiured for aStar algorithm
let begin, end;

// Initialize cytoscape map for future adding graph
let cy;
	
// Variable for storing type of delivery
let type;
	
/* Function for running aStar algorithm
*  As custom algorithm is aStar - based 
*  Takes: algrorithm as promise
*  Sets option from global variables
*  Return: resolve promise algorithm with options
*/
let runAlgorithm = (algorithm) => {
	if (algorithm === undefined) {
		return Promise.resolve(undefined);
	} else{
		let options = {
			root: '#' + begin,
			// astar requires target; goal property is ignored for other algorithms
			goal: '#' + end,
			weight : function(edge){
				return Number(edge.data().length) * Number(edge.data().difficulty);
			}
		};
		return Promise.resolve(algorithm(options));
	}
};
				
/*Varible for saving curret algorithm*/
let currentAlgorithm;

/* Function for animating algorithm
*  In this case it will show the position of delivery 
*  Takes: algResults returned by runAlgorithm
*  Applies algorithm with animation
*/
let animateAlgorithm = (algResults) => {
    // clear old algorithm results
    cy.$().removeClass('highlighted start end');
	cy.$().removeClass('cheap regular quick');
    currentAlgorithm = algResults;
	  
    if (algResults === undefined || algResults.path === undefined) {
      return Promise.resolve();
    }
    else {
      let i = 0;
      // for astar, highlight first and final before showing path
      if (algResults.distance) {
		// Among DFS, BFS, A*, only A* will have the distance property defined
		algResults.path[0].addClass('highlighted start');
        algResults.path[algResults.path.length - 1].addClass('highlighted end');
        // i is not advanced to 1, so start node is effectively highlighted twice.
        // this is intentional; creates a short pause between highlighting ends and highlighting the path
      }
      return new Promise(resolve => {
        let highlightNext = () => {
            if (currentAlgorithm === algResults && i < algResults.path.length) {
			  if(algResults.path[i].group() == 'edges')
			  {
				if(type == 'cheap')
				{
					algResults.path[i].addClass('cheap');
				}else
				if(type == 'regular')
				{
					algResults.path[i].addClass('regular');
				}else{
					algResults.path[i].addClass('quick');
				}
			  }else{
				algResults.path[i].addClass('highlighted');
			  }
			  cy.animate({
				fit: {
					eles: algResults.path[i],
					padding: 100
				},
				duration: 2000,
				easing: 'ease',
				queue: true
			  });
			  setTimeout(highlightNext, 1200);
			   i++;
            } else {
              // resolve when finished or when a new algorithm has started visualization
              resolve();
            }
          }
          highlightNext();
        });
      }
    };

(function(){
  document.addEventListener('DOMContentLoaded', function(){
	let applyDatasetDeliveries = data => {
		var table='<table class="table table-bordered table-hover">';
        table+='<tr><th>trackID</th><th>esttime</th><th>sender</th><th>reciever</th><th>type</th><th>status</th><th>reg_date</th><th>price</th>';
		table+='<th>volume</th><th>weight</th><th>location</th><th>to</th><th>from</th></tr>'
        for(i=0;i<data.length;++i){
        table+="<tr>"
            table+="<td>"+data[i].trackID+"</td>";
            table+="<td>"+formatTime(data[i].esttime)+"</td>";
            table+="<td>"+data[i].sender+"</td>";
            table+="<td>"+data[i].reciever+"</td>";
            table+="<td>"+data[i].type+"</td>";
            table+="<td>"+data[i].status+"</td>";
            table+="<td>"+data[i].reg_date+"</td>";
            table+="<td>"+data[i].price+"</td>";
            table+="<td>"+data[i].volume+"</td>";
            table+="<td>"+data[i].weight+"</td>";
			table+="<td>"+data[i].location+"</td>";
			table+="<td>"+data[i].to+"</td>";
			table+="<td>"+data[i].from+"</td>";
        table+="</tr>"
        }
        table+='</table>';
        document.getElementById("orders").innerHTML=table;
	}
	
	/* Dialog window */
	let dialog;
	dialog = $( "#dialog-form" ).dialog({
		autoOpen: false,
		height: 550,
		width: 1050,
		modal: true,
		buttons: {
			Cancel: function() {
				dialog.dialog( "close" );
			}
		}
	});
	
	/* Listener for button*/
	$( "#show-table" ).button().on( "click", function() {
		dialog.dialog( "open" );
	});
		
	/*Promise for getting deliveries dataset*/
	let applyDatasetD = () => Promise.resolve( "https://sspacedelivery.herokuapp.com/api/orders?SID=" + SID).then( getDataset ).then( applyDatasetDeliveries );
	
	let createRowListeners = () => {
		// Add event listener for each row in created table
		var tables = document.getElementsByTagName("table");
		for(var j = 0; j < tables.length; ++j){
			var rows = tables[j].getElementsByTagName("tr");
			for(var i = 1; i < rows.length; ++i)
			{
				rows[i].addEventListener('click', function(){
					// Close dialog window
					dialog.dialog( "close" );
					// Get begin and end values					
					begin = findPlanetIdByName(this.cells[12].innerHTML);
					end = findPlanetIdByName(this.cells[11].innerHTML);
					
					type = this.cells[4].innerHTML;
				
					if(begin != -1 && end != -1 && type != "" && type != undefined)
					{
						tryPromise( getAlgorithm ).then( runAlgorithm ).then( animateAlgorithm );
					}
				});
			}
		}
	}		
	// </Helper functions>
	// Create cytoscape map for graph
    cy = window.cy = cytoscape({
      container: $('#cy')
    });
	
		/* Display planet info on mouseover */
	cy.on('mouseover', 'node', function(event) {
		let node = event.cyTarget;
		let info = "Planet name: " + node.data("name") + "<br/>" + "Galactic: " + node.data("galactic") + "<br/>"+"URL: " + node.data("image");
		node.qtip({
			content: info,
			show: {
				event: event.type,
				ready: true
			},
			hide: {
				event: 'mouseout unfocus'
			},
			style: {classes: 'qtip-bootstrap'}
		}, event);
	});
	
	// Write data to page
	tryPromise(applyDatasetD).then(createRowListeners);
	
	// All promises and events
    tryPromise( applyDatasetFromSelect ).then( applyPathsFromSelect ).then( applyStylesheetFromSelect ).then( applyLayoutFromSelect );

  });
})();