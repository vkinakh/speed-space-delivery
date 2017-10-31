(function(){
  document.addEventListener('DOMContentLoaded', function(){
	// Help variables 
	// Begin and end are reqiured for aStar algorithm
	let begin, end;

	// Initialize cytoscape map for future adding graph
    let cy;
	
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
					return Number(edge.data("length")) * Number(edge.data("difficult"));
				}
			};
			return Promise.resolve(algorithm(options));
		}
	}
				
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
              algResults.path[i].addClass('highlighted');
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
		
	/*Promise for getting deliveries dataset*/
	let applyDatasetD = () => Promise.resolve( "https://someleltest.herokuapp.com/api/orders?SID=95b7f8bcab2eb50b6b8f4a09e0296bad1f7da270d5ed1967d315ac05cf01ab39" ).then( getDataset ).then( applyDatasetDeliveries );
	
	let createRowListeners = () => {
		// Add event listener for each row in created table
		var tables = document.getElementsByTagName("table");
		for(var j = 0; j < tables.length; ++j){
			var rows = tables[j].getElementsByTagName("tr");
			for(var i = 1; i < rows.length; ++i)
			{
				rows[i].addEventListener('click', function(){
					// Get begin and end values					
					begin = findPlanetIdByName(this.cells[12].innerHTML);
					end = findPlanetIdByName(this.cells[11].innerHTML);
					
					if(begin != -1 && end != -1)
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
	
	// Write data to page
	tryPromise(applyDatasetD).then(createRowListeners);
	
	// All promises and events
    tryPromise( applyDatasetFromSelect ).then( applyPathsFromSelect ).then( applyStylesheetFromSelect ).then( applyLayoutFromSelect );

  });
})();

// tooltips with jQuery
$(document).ready(() => $('.tooltip').tooltipster());