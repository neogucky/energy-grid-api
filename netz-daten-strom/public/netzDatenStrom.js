var powerType = {
	0 : 'conventional',
	1 : 'wind',
	2 : 'solar',
	3 : 'water'
};

var alarmType = {
	connectionError : 'connection error',
	powerFailure : 'power plant failure',
	overloadWarning : 'overload warning',
	partialBlackout : 'partial blackout',
	unexpectedError : 'unexpected error'
};

var objectType = {
	alarm : 'alarm',
	connection: 'connection',
	transformerstation : 'transformerstation',
	substation : 'substation',
	powerstation : 'powerstation'
}

var german = {
	translate : function(word){
		if (this.words[word] === undefined){
			console.log('Word "' + word + '" can\'t be found in translation');
			return word;
		}
		return this.words[word];
	},
	words : {
		'conventional' : 'Konventionell',
		'wind' : 'Wind',
		'solar' : 'Solar',
		'water' : 'Wasser',
		'connection error' : 'Verbindungsfehler',
		'unexpected error' : 'Unerwarteter Fehler'		
	}
};

/*
*	The parent class of all station types 
*/
function Station(capacity, maxCapacity, id) {
    this.capacity = capacity;
	this.maxCapacity = maxCapacity;
	this.id = id;
}

Station.prototype = {
	capacity : null,
	maxCapacity : null,
	id: null
};

Station.fromPowerStation = function(powerstation) {
    return new this(-powerstation.consumptionInKWh, -powerstation.maxConsumptionInKWh, powerstation.id);
};
Station.fromTransformerStation = function(transformerstation) {
    return new this(transformerstation.consumptionInKWh, transformerstation.maxConsumptionInKWh, transformerstation.id);
};
Station.fromSubStation = function(substation) {
    return new this(substation.highVolatageIntakeInKWh, substation.maxHighVolatageIntakeInKWh, substation.id);
};