var powerType = {
	0 : 'conventional', /* Conventional energy production, independent from weather etc. */
	1 : 'wind',
	2 : 'solar',
	3 : 'water',
	4 : 'storage' /* Energy storage can store energy on high production and emit it on high consumption. */
};

var alarmType = {
	communicationError : { textID : 'alarm.communication', minPriority : 5, maxPriority : 5 }, 
	powerFailure : { textID : 'alarm.powerfailure', minPriority : 5, maxPriority : 5 }, 
	overloadWarning : { textID : 'alarm.overload', minPriority : 5, maxPriority : 5 }, 
	energyShortage : { textID : 'alarm.shortage', minPriority : 8, maxPriority : 8 }, 
	componentDefect : { textID : 'alarm.shortage', minPriority : 8, maxPriority : 8 }, 
	doorOpened : { textID : 'alarm.door.open', minPriority : 3, maxPriority : 3 }, 
	doorClosed : { textID : 'alarm.door.closed', minPriority : 3, maxPriority : 3 }, 
	occupiedWarning : { textID : 'alarm.occupied.warning', minPriority : 3, maxPriority : 3 }, 
	occupiedAlarm : { textID : 'alarm.occupied.danger', minPriority : 10, maxPriority : 10 }, 
	unexpectedError : { textID : 'alarm.unexpected', minPriority : 1, maxPriority : 10 }
};

var objectType = {
	alarm : 'alarm',
	connection: 'connection',
	transformerstation : 'transformerstation',
	substation : 'substation',
	powerstation : 'powerstation'
}

var german = {
	translate : function(textResource){
		if (this.resources[textResource] === undefined){
			console.log('Text resource "' + textResource + '" can\'t be found in translation');
			return textResource;
		}
		return this.resources[textResource];
	},
	resources : {
		'energy.conventional' : 'Konventionell',
		'energy.wind' : 'Wind',
		'energy.solar' : 'Solar',
		'energy.water' : 'Wasser',
		'alarm.connection' : 'Verbindungsfehler',
		'alarm.unexpected' : 'Unerwarteter Fehler'		
	}
};

/*
*	The parent class of all station types 
*/
function Station(capacity, maxCapacity, needInKWh, id) {
    this.capacity = capacity;
	this.maxCapacity = maxCapacity;
	this.needInKWh = needInKWh;
	this.id = id;
}

Station.prototype = {
	capacity : null,
	maxCapacity : null,
	needInKWh : null, /* FIXME: this is a helper so that transformerstations know their need even when disconnected */
	id: null
};

Station.fromPowerStation = function(powerstation) {
    return new this(-powerstation.consumptionInKWh, -powerstation.maxConsumptionInKWh, 0, powerstation.id);
};
Station.fromTransformerStation = function(transformerstation) {
    return new this(transformerstation.consumptionInKWh, transformerstation.maxConsumptionInKWh, transformerstation.needInKWh, transformerstation.id);
};
Station.fromSubStation = function(substation) {
    return new this(substation.highVolatageIntakeInKWh, substation.maxHighVolatageIntakeInKWh, 0, substation.id);
};