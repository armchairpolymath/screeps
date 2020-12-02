// create a new function for StructureTower
StructureTower.prototype.defend = function (shouldHeal, shouldRepair) {
	// find closes hostile creep
	var target = this.pos.findClosestByRange(FIND_HOSTILE_CREEPS);
	// if one is found...
	if (target != undefined) {
		// ...FIRE!
		this.attack(target);
	}
	if (shouldHeal) {
		const target = this.pos.findClosestByRange(FIND_MY_CREEPS, {
			filter: function (object) {
				return object.hits < object.hitsMax;
			}
		});
		this.heal(target);
	}
	if (shouldRepair) {
		var target = this.pos.findClosestByPath(FIND_STRUCTURES, {
			// the second argument for findClosestByPath is an object which takes
			// a property called filter which can be a function
			// we use the arrow operator to define it
			filter: (s) => s.hits < s.hitsMax && s.structureType != STRUCTURE_WALL,
		});
		
		this.repair(target);
	}
};
