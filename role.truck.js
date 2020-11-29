module.exports = {
	// a function to run the logic for this role
	/** @param {Creep} creep */
	run: function (creep) {




        
		// if creep is bringing energy to a structure but has no energy left
		if (creep.memory.working == true && creep.store[RESOURCE_MINERAL] == 0) {
			// switch state
			creep.memory.working = false;
		}
		// if creep is harvesting energy but is full
		else if (creep.memory.working == false && creep.store[RESOURCE_MINERAL] == creep.store.getCapacity()) {
			// switch state
			creep.memory.working = true;
		}

		// if creep is supposed to transfer energy to a structure
		if (creep.memory.working == true) {
			// find closest spawn, extension or tower which is not full
			var structure = creep.pos.findClosestByPath(FIND_MY_STRUCTURES, {
				// the second argument for findClosestByPath is an object which takes
				// a property called filter which can be a function
				// we use the arrow operator to define it
				filter: (s) =>
					(s.structureType == STRUCTURE_SPAWN ||
						s.structureType == STRUCTURE_EXTENSION ||
						s.structureType == STRUCTURE_TOWER) &&
					s.store < s.store.getCapacity(),
			});

			if (structure == undefined) {
				structure = creep.room.storage;
			}

			// if we found one
			if (structure != undefined) {
				// try to transfer energy, if it is not in range
				if (creep.transfer(structure, RESOURCE_MINERAL) == ERR_NOT_IN_RANGE) {
					// move towards it
					creep.moveTo(structure, {
                        visualizePathStyle: {
                            fill: "transparent",
                            stroke: "#008000", //Green for harvesting
                            lineStyle: "solid",
                            strokeWidth: 0.08,
                            opacity: 1
                        },
                    });
				}
			}
		}
		// if creep is supposed to get energy
		else {
			//pickup engergy from the ground is more important because it decays
			target = creep.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
				filter: (s) => s.resourceType == RESOURCE_MINERAL,
			});
			if (target) {
				if (creep.pickup(target) == ERR_NOT_IN_RANGE) {
					creep.moveTo(target);
				}
			} 
		}
	},
};
