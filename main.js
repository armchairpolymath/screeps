// import modules
require("prototype.creep");
require("prototype.tower");
require("prototype.spawn");
require("prototype.link");

/* Game.spawns.Spawn2.memory.minCreeps = {
  harvester: 0,
  builder: 1,
  repairer: 0,
  wallRepairer: 0,
  upgrader: 0,
  lorry: 1,
  marine: 0,
  medic: 0,
  archer: 0,
  grunt: 0,
}; 

Game.spawns.Spawn3.memory.minCreeps = {
  harvester: 0,
  builder: 1,
  repairer: 1,
  wallRepairer: 1,
  upgrader: 1,
  lorry: 2,
  marine: 0,
  medic: 0,
  archer: 0,
  grunt: 0,
};

Game.spawns.Spawn4.memory.minCreeps = {
  harvester: 0,
  builder: 0,
  repairer: 1,
  wallRepairer: 0,
  upgrader: 1,
  lorry: 2,
  marine: 0,
  medic: 0,
  archer: 0,
  grunt: 0,
};
*/

/* HOME IS CURRENTLY E44S47

			E66S31
			  |
			E44S47 - E45S47
			  |
			E44S48

*/

/*
//  Insert this line via command line: Game.spawns.Spawn1.memory.claimRoom = "E45S47";

 Game.spawns.Spawn1.memory.minLongDistanceHarvesters = {
  E45S47: 0,
  E44S48: 0,
  E44S46: 0,
}; 

Game.spawns.Spawn1.memory.minAirborne = { E45S47: 0, E44S48: 0, E44S46: 0 };

Game.spawns.Spawn1.memory.minLongDistanceBuilders = {
  E45S47: 1,
  E44S48: 0,
  E44S46: 0,
};

Game.spawns.Spawn1.memory.minAirborne = { E44S46: 1, E66S33: 0, E66S34: 0 };
*/

/*

Game.spawns.Spawn1.memory.minSnipers = { E67S32: 0, E66S33: 0, E66S34: 0 };
Game.spawns.Spawn1.memory.minLongDistanceBuilders = {
  E67S32: 0,
  E66S33: 0,
  E66S31: 0,
};
Game.spawns.Spawn2.memory.minLongDistanceHarvesters = {
  E68S32: 0,
  E66S33: 0,
  E66S31: 0,
};

*/

// Game.rooms.E66S32.memory.links = { 0: 'linkFrom', 1:'linkTo'};

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
  var towers = _.filter(
    Game.structures,
    (s) => s.structureType == STRUCTURE_TOWER
  );
  // for each tower
  for (let tower of towers) {
    // run tower logic
    tower.defend(true, false); //shouldHeal, shouldRepair
  }

  /*
  // find all links
  var linkFrom = Game.rooms["E66S32"].lookForAt("structure", 6, 22)[0];
  console.log("link from " + linkFrom);
  var linkTo = linkFrom.pos.findInRange(FIND_MY_STRUCTURES, 2, {
    filter: { structureType: STRUCTURE_LINK },
  })[0];
  console.log("link to " + linkTo);
  linkFrom.transferEnergy(linkTo);
*/

  // for each spawn
  for (let spawnName in Game.spawns) {
    // run spawn logic
    
    if (Game.time % 2==1){
      Game.spawns[spawnName].updateTactics();
    }
    
    
    Game.spawns[spawnName].spawnCreepsIfNecessary();
  }
};
