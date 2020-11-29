module.exports = {
	// a function to run the logic for this role
	/** @param {Creep} creep */
	run: function (creep) {
	    var target = creep.pos.findClosestByRange(FIND_HOSTILE_STRUCTURES);
        if (target) {
            console.log('spawn');
			if (creep.attack(target) == ERR_NOT_IN_RANGE) {
				creep.moveTo(target);
			}
        }
        var target = creep.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
        if(target) {
            console.log('creep');
            if (creep.attack(target) == ERR_NOT_IN_RANGE) {
				creep.moveTo(target);
            }
        }
        else if(creep.room.name != creep.memory.target) {
            console.log(creep.room.name + " & " + creep.memory.target);
            // find exit to target room
            var exit = creep.room.findExitTo(creep.memory.target);
            // move to exit
            creep.moveTo(creep.pos.findClosestByRange(exit));
        }
	}
};
