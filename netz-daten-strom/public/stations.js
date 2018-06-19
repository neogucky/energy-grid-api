$(document).ready(function() {
	
	var stores = [];
	//initialize stores (dirty sequential chaining)
	stores['transformerstation'] = new DPDStore('transformerstation', function() { stores['substation'].connect(); });
	stores['substation'] = new DPDStore('substation', function() { stores['powerstation'].connect(); });
	stores['powerstation'] = new DPDStore('powerstation', function() { stores['area'].connect(); });
	stores['area'] = new DPDStore('area',  function() { renderStations() });
	
	//start the chain
	stores['transformerstation'].connect();
	
	var ZeroTime = new Date().getTime();

    function addTransformerStation(message) {

        $('<tr class="station" id="' + message.id + '">')
            .appendTo('#station_list');
		updateTransformerStation(message);
    }
	
	function updateTransformerStation(message) {
		var updatedRow = $('<tr class="station" id="' + message.id + '">')
			.append('<td class="type">Ortsnetzstation</td>')
            .append('<td class="name">' + message.name + '</td>')
			.append('<td class="consumption">' + Math.floor(message.consumptionInKWh) + '</td>')
			.append('<td class="consumptionPercent">' +   roundTwoPlaces((message.consumptionInKWh / message.maxConsumptionInKWh) * 100) + '%</td>')
			.append('<td class="maxConsumption">' + message.maxConsumptionInKWh + '</td>');
			
		$('#' +  message.id).html(updatedRow.contents());
	}
	
	function addSubStation(message) {		
        $('<tr class="station" id="' + message.id + '">')
            .appendTo('#station_list');
		updateSubStation(message);
    }
	
	function updateSubStation(message){
		var updatedRow = $('<tr class="station" id="' + message.id + '">')
		    .append('<td class="type">Umspannwerk</td>')
            .append('<td class="name">' + message.name + '</td>')
			.append('<td class="consumption">' + Math.floor(message.highVoltageIntakeInKWh) + '</td>')
			.append('<td class="consumptionPercent">' +   roundTwoPlaces((message.highVoltageIntakeInKWh / message.maxHighVoltageIntakeInKWh) * 100) + '%</td>')
			.append('<td class="maxConsumption">' + message.maxHighVoltageIntakeInKWh + '</td>');

		$('#' +  message.id).html(updatedRow.contents());
	}
	
	function addPowerStation(message) {		
        $('<tr class="station" id="' + message.id + '">')
            .appendTo('#station_list');
		updatePowerStation(message);
    }
	
	function updatePowerStation(message) {	
        var updatedRow = $('<tr class="station" id="' + message.id + '">')
			.append('<td class="type">Kraftwerk (' + german.translate(powerType[message.powerType]) + ')</td>')
            .append('<td class="name">' + message.name + '</td>')
			.append('<td class="consumption">' +  Math.floor(message.consumptionInKWh) + '</td>')
			.append('<td class="consumptionPercent">' +   -roundTwoPlaces((message.consumptionInKWh / message.maxConsumptionInKWh) * 100) + '%</td>')
			.append('<td class="maxConsumption">' + message.maxConsumptionInKWh + '</td>');
			
		$('#' +  message.id).html(updatedRow.contents());
    }
	
	stores['transformerstation'].setUpdateListener(function(item) {
		console.log('updated on: ' +  (new Date().getTime() - ZeroTime) / 1000);
		updateTransformerStation(item);

	});
	
	stores['powerstation'].setUpdateListener(function(item) {
		console.log('updated on: ' +  (new Date().getTime() - ZeroTime) / 1000);
		updatePowerStation(item);
	});
		
	stores['substation'].setUpdateListener(function(item) {
		console.log('updated on: ' +  (new Date().getTime() - ZeroTime) / 1000);
		updateSubStation(item);
	});
	
		
	function renderStations() {
		
		console.log('render stations');
		
		$('#station_list').empty();
		for (var key in stores['transformerstation'].items) { 
			addTransformerStation(stores['transformerstation'].items[key]); 
		}
		for (var key in stores['substation'].items) { 
			addSubStation(stores['substation'].items[key]); 
		}
		for (var key in stores['powerstation'].items) { 
			addPowerStation(stores['powerstation'].items[key]); 
		}
			
	}	
	
	function roundTwoPlaces(number){
		return Math.round(number * 100) / 100;
	}
	
});