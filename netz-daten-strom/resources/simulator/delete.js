if (!(me && (me.username == this.user || me.roles.indexOf("tim") !== -1))) {
  cancel("You must be Tim to delete Items", 401);
}


emit('simulator:delete', this);