/*
    This script contains functionalities for the scenarios page
*/
var selected = "box0";
var selectedLine = "line0";

/* test data */
var scenarios = '[' +
'{ "id": 0,"name": "Szenario 1","description": "Startet die Testumgebung mit dem Standardszenario." },' + 
'{ "id": 1,"name":"Szenario 2","description": "Startet die Testumgebung mit dem Standardszenario." },' +
'{"id": 2,"name": "Szenario 3","description": "Startet die Testumgebung mit dem Standardszenario."} ]';

var data = JSON.parse(scenarios);

/* read API */
/* deactivated at the moment
function status(response) {
  		if (response.status >= 200 && response.status < 300) {
    		return Promise.resolve(response)
  		} else {
    	return Promise.reject(new Error(response.statusText))
  		}
	}

	function json(response) {
  		return response.json()
	}
	
	fetch("test.json")
  	.then(status)
  	.then(json)
  	.then(function(data) {
		
    //console.log(data); //show the data
    */
	
	function onLoad() { // delete this line, if reading data from API
	
	console.log(data); //show the data
	console.log(data.length); //show the data
	
	for (var i = 0; i <= data.length; i++) {
		/* create elements */
		var box = document.createElement('div');
		var name = document.createElement('div');
		var line = document.createElement('hr');
		var description = document.createElement('div');
		
		/* set classes and ids */
		if (i == 0) {
			box.className = "box-selected"; //selected the first box
			line.className = "line-selected";
		} else {
		box.className = "box";
		line.className = "line";
		}
		name.className = "text-medium deselect";
		description.className = "text-medium deselect";
		
		box.id = "box" + i;
		name.id = "name" + i;
		line.id = "line" + i;
		description.id = "des" + i;
		
		/* add function */
		box.onclick = function(node) {
			// get the last character
			var number = node.target.id.substr(node.target.id.length - 1);
			var test = "box" + number; // create string to compare
			var testLine = "line" + number;
			
			// change the selected element
			if (test != selected) {
				document.getElementById(selected).className = "box";
				document.getElementById(selectedLine).className = "line";
				document.getElementById(test).className = "box-selected";
				document.getElementById(testLine).className = "line-selected";
				selected = test;
				selectedLine = testLine;
			}
		};
		
		/* add content to elements */
		box.appendChild(name);
		box.appendChild(line);
		box.appendChild(description);
		
		name.innerHTML = data[i].name;
		description.innerHTML = data[i].description;
		
		/* show the full box */
		var list = document.getElementById('scenarioList');
		list.appendChild(box);
	}
    
  	}
  	/* deactivated at the moment
  	)
  	.catch(function(error) {
    	console.log('Fetch Error :-S', error);
  	});
  	*/
	
	/* set the number of the selected box as url parameter*/
	function getSelectedElement() {
		var link = selected.substr(selected.length - 1);
		document.getElementById("btn0").setAttribute("href", "simulation.html?id=" + link);
		return false;
	}
