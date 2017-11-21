# deployd_collectionstore
Simple collection store to handle updated / added or deleted items 

This is building on the easy to use API-Framework deployd. See: http://deployd.com

It requires the following events setup in all collections meant to be used: 

	post event:
	emit('COLLECTIONNAME:new', this);

	put event:
	emit('COLLECTIONNAME:update', this);

	delete event:
	emit('COLLECTIONNAME:delete', this);

Where COLLECTIONNAME is obviously the name of your collection. (i.e. the put-event for my collection "apples" would be emit('apples:new', this);)

The store can then be used like this. It requires the collection name as an argument, optionaly you can also add a method that will be called after the asynchronous request finished.

	appleStore = new DPDStore('apples', function() { renderApples(); });
	appleStore.connect();

This will load the apples collection, store it in our appleStore and then call your local renderApples() function.

Remember, renderApples is a local method created by you. You don't have to add any callBack function to the store but than you should make sure: appleStore.isInitialized == true, since the connect-request is asynchronous. The renderApples() function might look like this. 

	function renderApples() {
				
		$('#apples').empty(); //Empty the list
		appleStore.items.forEach(function(item) {
			$('<tr id="' + item.id + '">')
				.append('<td>' + item.name + '</td>')
				.append('<td>' + item.color + '</td>')
				.appendTo('#apples');
		});	
	});
	
You also can add some listeners, to update your apple-table according to changes:

	//only delete the deleted apple 
	appleStore.setDeleteListener( function(item) {
		$('#' + item.id).remove();
	});

	//render all apples again when the new or changed apple event triggered 
	appleStore.setUpdateListener(renderApples);
	appleStore.setNewListener(renderApples);
	
Keep in mind, that the store updates itself with every change, even if you don't have any listeners on it. This can create a massive network overhead, so you should think if this store fits your needs before using it.