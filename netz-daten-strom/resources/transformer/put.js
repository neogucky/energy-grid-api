if (!(me && me.roles.indexOf("tim") !== -1)) {
  cancel("You must be Tim to edit items", 401);
}

emit('transformer:update', this);