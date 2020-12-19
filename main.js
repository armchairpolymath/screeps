// import modules
require("prototype.creep");
require("prototype.tower");
require("prototype.spawn");
require("prototype.link");

//set to verbose for creep output

Game.spawns.Spawn1.memory.minLongDistanceHarvesters = {
	E21N27: 2,
	W9S17: 0,
};


// Game.rooms.E66S32.memory.links = { 0: 'linkFrom', 1:'linkTo'};
var homeRoom;
var northRoom;
var southRoom;
var eastRoom;
var westRoom;

module.exports.loop = function () {
  //Game.Memory.loggingLevel == "verbose";

  // set homeRoom based on location of spawn1
  if (homeRoom === undefined) {
    homeRoom = Game.spawns["Spawn1"].room.name;
    const exits = Game.map.describeExits(homeRoom);
    console.log(JSON.stringify(exits));
    console.log("home room is :" + homeRoom);
  }

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
    tower.defend(true, true); //shouldHeal, shouldRepair
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

    // do this every other tick to save CPU, this could even happen even less often so long as it is shorter than then shortest spawn time in ticks.
    if (Game.time % 2 == 1) {
      Game.spawns[spawnName].updateTactics();
    }

    Game.spawns[spawnName].spawnCreepsIfNecessary();
  }
};
