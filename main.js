// import modules
require("prototype.creep");
require("prototype.tower");
require("prototype.spawn");

Game.spawns.Spawn1.memory.minCreeps = {
	harvester: 0,
	builder: 2,
	repairer: 1,
	wallRepairer: 1,
	upgrader: 4,
	lorry: 3,
	marine: 0,
	medic: 0,
	archer: 0,
};
// Game.spawns.Spawn1.memory.minLongDistanceHarvesters={'E67S32':6};
// Game.spawns.Spawn1.memory.claimRoom={target: 'E4S15'};
// Game.spawns.Spawn2.memory.minCreeps={'harvester':2,'builder':2,'repairer':2,'wallRepairer':1,'upgrader':2,'lorry':0};

module.exports.loop = function () {
	// check for memory entries of died creeps by iterating over Memory.creeps
	for (let name in Memory.creeps) {
		// and checking if the creep is still alive
		if (Game.creeps[name] == undefined) {
			// if not, delete the memory entry
			delete Memory.creeps[name];
		}
	}

	// for each creeps
	for (let name in Game.creeps) {
		// run creep logic
		Game.creeps[name].runRole();
	}

	// find all towers
	var towers = _.filter(Game.structures, (s) => s.structureType == STRUCTURE_TOWER);
	// for each tower
	for (let tower of towers) {
		// run tower logic
		tower.defend();
	}

	// for each spawn
	for (let spawnName in Game.spawns) {
		// run spawn logic

		Game.spawns[spawnName].spawnCreepsIfNecessary();
	}
};
