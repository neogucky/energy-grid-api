if (!(me && me.roles.indexOf("tim") !== -1)) {
  cancel("You must be Tim to delete items", 401);
}

emit('connection:delete', this);