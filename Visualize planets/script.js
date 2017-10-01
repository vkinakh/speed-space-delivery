"use strict";

document.addEventListener("DOMContentLoaded", function() {
  var cy = cytoscape({
    container: document.getElementById('cy'),
    elements: GlyElements,
    style: [
      {
        selector: 'node',
        style: {
          'label': 'data(planet)',
          'width': 'data(diameter)',
          'height': 'data(diameter)',
          'font-size': '26px',
          'text-halign': 'right',
          'text-valign': 'center',
		  'background-color' : 'data(color)',		  
        }
      }, {
        selector: 'edge',
        style: {
          'curve-style': 'bezier',
          'label': 'data(path)',
          'text-background-color': 'yellow',
          'text-background-opacity': 0.4,
          'width': '6px',
          'target-arrow-shape': 'triangle',
          'control-point-step-size': '140px'
        }
      }
    ],
    layout: {
      name: 'preset',
      fit: false, // it's okay if some of the graph is hidden off-screen because viewport scrolls
      columns: 2,
      avoidOverlap: true,
      avoidOverlapPadding: 80,
    }
  });

  cy.autolock(true);
});