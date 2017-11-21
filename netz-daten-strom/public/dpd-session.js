function DPDSession(sessionStore){
	this.sessionStore = sessionStore;
	this.sessionID;
	this.isConnected;
	this.SESSION_LIFETIME = 300000 /*(5 min)*/;
	this.lastExtension = 0;
}

/*
 *	Try to get a new session from the server
 *	
 *  If successfull calls: onSuccessCallback()
 *	If unsuccesfull calls: onErrorCallback(errorMessage)
 */
DPDSession.prototype.getSession = function( onSuccessCallback, onErrorCallback ){
	var self = this;
	
	var error;
	
	//check if there is already a generator session running
	var sessions = self.sessionStore.items;
	for (key in sessions){
		if (sessions[key].sessionTime + self.SESSION_LIFETIME > (new Date().getTime())){
			var reservedUntil = new Date(sessions[key].sessionTime + self.SESSION_LIFETIME);
			var hours = reservedUntil.getHours();
			var minutes = "0" + reservedUntil.getMinutes();
			error = 'Another session owned by "' + sessions[key].user + '" is already running. (till ' +   hours + ':' + minutes.substr(-2) + ')';
		}	
	}
	
	if (error == undefined){
		dpd.simulator.post({
			sessionTime: new Date().getTime(), 
		}, function(result, error) {
			if (error != undefined){
				onErrorCallback(error);
			} else {
				self.sessionID = result.id;
				self.isConnected = true;
				onSuccessCallback();
			}
		});
	}
	
	if (error != undefined){
		onErrorCallback(error);
	}
			
	return;
};

DPDSession.prototype.extendSession = function( onErrorCallback, onSuccessCallback ){
	var self = this;
	var timestamp = new Date().getTime();
	this.sessionStore.put(this.sessionID, {sessionTime : timestamp}, 
		function(result, error){ 
			if (error != undefined){
				self.lastExtension = timestamp;
				onSuccessCallback();
			} else {
				onErrorCallback(error);
			}
		}
	);
};

DPDSession.prototype.getSessionLifetime = function(){
	var reservedUntil = new Date(self.lastExtension + self.SESSION_LIFETIME);
	var hours = reservedUntil.getHours();
	var minutes = "0" + reservedUntil.getMinutes();
	var seconds = "0" + reservedUntil.getSeconds();
	return hours + ':' + minutes.substr(-2) + ':' + seconds.substr(-2);
};