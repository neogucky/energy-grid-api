if (!(me && me.roles.indexOf("mod") !== -1)) {
  cancel("You must be mod to delete Items", 401);
}

emit('alarm:delete', this);