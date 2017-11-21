if (!me) {
    cancel('Must be logged in');
} 

emit('simulator:update', this);