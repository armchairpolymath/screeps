module.exports = {
	// a function to run the logic for this role
	/** @param {Creep} creep */
	run: function (creep) {
		const target = this.pos.findClosestByRange(FIND_MY_CREEPS, {
            filter: function(object) {
                return object.hits < object.hitsMax;
            }
        });
        if(target) {
            if(this.heal(target) == ERR_NOT_IN_RANGE) {
                this.moveTo(target);
            }
        }
    }
};
