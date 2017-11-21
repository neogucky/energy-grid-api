if (me) {
  this.user = me.username;
  var timestamp = this.sessionTime;
  //set generatorSession
   dpd.users.put(me.id, {
    lastLogin: timestamp
  }, function() {});
  emit('simulator:new', this);
} else {
    cancel('Must be logged in');
}