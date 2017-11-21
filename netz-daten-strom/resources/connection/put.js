if (!(me && me.roles.indexOf("mod") !== -1)) {
  cancel("You must be mod to edit items", 401);
}

emit('connection:update', this);