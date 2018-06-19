var meldungen = ['OrtsNetzstation Dankwartsgrube überschreitet maximale Kapazität.', 'OrtsNetzstation Dankwartsgrube arbeitet wieder in den vorgegebenen Parametern. (Entwarnung)', 'Ortsnetzstation Universität sendet keine Daten mehr.', 'Ortsnetzstation Universität sendet wieder Daten (Entwarnung).', 'Blockheizkraftwerk Universität produziert unerwartet hohe Stromkapazitäten.', 'Ortsnetzstation Universität hat einen negativen Verbrauch.', 'Ortsnetzstation Universität kann überproduktion nicht mehr an das Mittelspannungsnetz leiten.',  'Blockheizkraftwerk Universität meldet bevorstehende Kernschmelze.' ];

$(document).ready(function() {
	
	var stores = [];
	//initialize stores (dirty sequential chaining)
	stores['transformerstation'] = new DPDStore('transformerstation', function() { stores['substation'].connect(); });
	stores['substation'] = new DPDStore('substation', function() { stores['powerstation'].connect(); });
	stores['powerstation'] = new DPDStore('powerstation', function() { stores['connection'].connect(); });
	stores['connection'] = new DPDStore('connection', function() { stores['area'].connect(); });
	stores['area'] = new DPDStore('area',  function() { stores['alarm'].connect({ $sort: {dateTime: -1}, $limit: 10}); });
	stores['alarm'] = new DPDStore('alarm', renderAlarmMessages);
	
	//start the chain
	stores['transformerstation'].connect();

    function addAlarm(message) {
				
        $('<tr class="alarm" id="' + message.id + '">')
            .append('<td class="date">' + getDateTime(message.dateTime) + '</td>')
			.append('<td class="importance importance_' +  message.importance +'">' + message.importance + '</td>')
			.append('<td class="alarmType">' + getAlarmType(message.alarmType) + '</td>')
			.append('<td class="message">' + message.message + '</td>')
			.append('<td class="area">' + getArea(message.areaID) + '</td>')
			.append('<td class="trigger">' + getTrigger(message.triggerTypeID, message.triggerID) + '</td>')
			.append('<td class="isAcknowledged">' + message.isAck + '</td>')
			.append('<td class="delete"></td>')
            .appendTo('#alarm_list');

		$('<a class="button">')
			.text('bestätigen')
			.click({id: message.id, isAck : true }, acknowledgeAlarm)
			.appendTo('#' +  message.id + ' .delete');
			
    }

	stores['alarm'].setNewListener(function(alarm) {
		console.log('new');
		addAlarm(alarm);
		$('html, body').animate({
			scrollTop: $('#' + alarm.id).offset().top
		}, 2000);
	});
	
	stores['alarm'].setDeleteListener(function(alarm) {
		console.log('delete: ' + alarm.id);
		$('#' + alarm.id).remove();
	});
	
	stores['alarm'].setUpdateListener(function(alarm) {
		console.log('update: ' + alarm.id);
		//FIXME: update using the addAlarm function to make the dataBinding consistent
		var message = $('#' + alarm.id);
		message.find('.date').text(alarm.dateTime);
		message.find('.importance').text(alarm.importance);
		message.find('.message').text(alarm.message);
		message.find('.isAcknowledged').text(alarm.isAck);
	});
		
	function getArea(areaID){
		var areaObject = stores['area'].getByID(areaID);
		if (areaObject.error){
			console.log(areaObject.message);
			return "Unbekannt";
		} else {
			return areaObject.name;
		}
	}
	
	function getDateTime (timestamp) {
		var date = new Date(timestamp);
		return date.getDate().padStart(2,0) + '.' + (date.getMonth() + 1).padStart(2,0) + '.' + date.getFullYear() + ' ' + date.getHours().padStart(2,0) + ':' + date.getMinutes().padStart(2,0) + ':' + date.getSeconds().padStart(2,0); 
	}
	
	function getTrigger(triggerTypeID, triggerID){

		if (stores[triggerTypeID] === undefined){
			return 'No store for ' + triggerTypeID + ' available';
		}
				
		var triggerObject = stores[triggerTypeID].getByID(triggerID);
		if (triggerObject.error){
			return triggerObject.message;
		} else {
			return triggerObject.name;
		}
	}
		
	function getAlarmType(type){
		var result;
		if (alarmType[type]){
			result = alarmType[type];
		} else {
			result = 'unbekannter Alarm';
		}
		
		return result;
	}
		
	function renderAlarmMessages() {
		
		console.log('render alarm messages');
		
		$('#alarm_list').empty();
		for (var key in stores['alarm'].items) { 
			addAlarm(stores['alarm'].items[key]); 
		}
			
	}
		
	function acknowledgeAlarm (event){
		dpd.alarm.put(event.data.id, {isAck : event.data.isAck} ,function(result, error) {
		  // Do something
		});
	}
			
	
});
