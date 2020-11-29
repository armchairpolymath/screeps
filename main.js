// import modules
require("prototype.creep");
require("prototype.tower");
require("prototype.spawn");



Game.spawns.Spawn1.memory.minCreeps = {
	harvester: 0,
	builder: 1,
	repairer: 1,
	wallRepairer: 1,
	upgrader: 2,
	lorry: 2,
	marine: 0,
	medic: 0,
	archer: 0,
	grunt: 0,
};

Game.spawns.Spawn2.memory.minCreeps = {
	harvester: 1,
	builder: 0,
	repairer: 0,
	wallRepairer: 0,
	upgrader: 1,
	lorry: 0,
	marine: 0,
	medic: 0,
	archer: 0,
	grunt: 0,
};

Game.spawns.Spawn3.memory.minCreeps = {
	harvester: 1,
	builder: 0,
	repairer: 0,
	wallRepairer: 0,
	upgrader: 1,
	lorry: 0,
	marine: 0,
	medic: 0,
	archer: 0,
	grunt: 0,
};

Game.spawns.Spawn4.memory.minCreeps = {
	harvester: 1,
	builder: 0,
	repairer: 0,
	wallRepairer: 0,
	upgrader: 1,
	lorry: 0,
	marine: 0,
	medic: 0,
	archer: 0,
	grunt: 0,
};

/* HOME IS CURRENTLY E66S32

			E66S31
			  |
			E66S32 - E67S32
			  |
			E66S33

*/
//  Insert this line via command line: Game.spawns.Spawn1.memory.claimRoom = "E66S31";

Game.spawns.Spawn1.memory.minLongDistanceHarvesters = { E67S32: 0, E66S33: 0, E66S31: 0 };
Game.spawns.Spawn1.memory.minAirborne = { E67S32: 0, E66S33: 1 };
Game.spawns.Spawn1.memory.minLongDistanceBuilders = { E67S32: 1, E66S33: 1, E66S31: 1 };

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
		tower.defend(true, false); //shouldHeal, shouldRepair
	}

	// for each spawn
	for (let spawnName in Game.spawns) {
		// run spawn logic

		Game.spawns[spawnName].spawnCreepsIfNecessary();
	}
};
