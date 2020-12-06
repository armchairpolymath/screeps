var roleBuilder = require("role.builder");
module.exports = {
	// a function to run the logic for this role
	/** @param {Creep} creep */
	run: function (creep) {
		// if creep is bringing energy to a structure but has no energy left
		if (creep.memory.working == true && creep.carry.energy == 0) {
			// switch state
			creep.memory.working = false;
		}
		// if creep is harvesting energy but is full
		else if (creep.memory.working == false && creep.carry.energy == creep.carryCapacity) {
			// switch state
			creep.memory.working = true;
			creep.memory.roleChange = false;
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
					s.energy < s.energyCapacity,
			});

			if (structure == undefined) {
				structure = creep.room.storage;
			}

			// if we found one
			if (structure != undefined) {
				// try to transfer energy, if it is not in range
				// console.log(creep + '-' + structure);
				if (creep.transfer(structure, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
					// move towards it
					// creep.pos.createConstructionSite(STRUCTURE_ROAD);
					creep.moveTo(structure, {
						visualizePathStyle: {
							fill: "transparent",
							stroke: "#008000", //Green for harvesting
							lineStyle: "dashed",
							strokeWidth: 0.08,
							opacity: 1,
						},
					});
				}
			} else {
				// look for construction sites
				creep.memory.roleChange = true;
				roleBuilder.run(creep);
			}
		}

		// if creep is supposed to harvest energy from source
		else {
			var shouldICreateRoad = false;

			if (shouldICreateRoad) {
				// creep.pos.createConstructionSite(STRUCTURE_ROAD);
			}

			creep.getEnergy(false, true, false, false); //container, source, dropped, storage
		}
	},
};
