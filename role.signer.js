

module.exports = {
    // a function to run the logic for this role
    run: function(creep) {
        if(creep.room.controller && creep.memory.roomSign) {
            if(creep.signController(creep.room.controller, creep.memory.roomSign) == ERR_NOT_IN_RANGE) {
                creep.moveTo(creep.room.controller);
            }
        }
        
    }   
};