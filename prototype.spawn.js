const global = require("./global");

require("prototype.spawn-roles");

var listOfRoles = [
  "harvester",
  "lorry",
  "claimer",
  "upgrader",
  "repairer",
  "builder",
  "wallRepairer",
  "signer",
  "marine",
  "medic",
  "archer",
  "grunt",
];

StructureSpawn.prototype.updateTactics = function () {
  /** @type {Room} */
  let room = this.room;
  // find all creeps in room
  /** @type {Array.<Creep>} */
  // let creepsInRoom = room.find(FIND_MY_CREEPS);
  //set default minimum number for armed forces population
  this.memory.minArmedCreeps = {
    marine: 0,
    medic: 0,
    archer: 0,
    grunt: 0,
  };

  var spawnsInRoom = this.room.find(FIND_MY_STRUCTURES, {
    filter: (s) => s.structureType === STRUCTURE_SPAWN,
  });

  var containersInRoom = this.room.find(FIND_STRUCTURES, {
    filter: { structureType: STRUCTURE_CONTAINER },
  });
  // if containers exist in the room, then change creeps counts
  // don't use harvesters anymore, use lorries and more.
  containerCount = containersInRoom.length;
  this.room.memory.strategy = this.room.controller.level;

  console.log("strategy " + this.room.controller.level);

  if (this.room.memory.strategy == 1) {
    console.log("1");
    this.memory.minCivilianCreeps = {
      harvester: 2,
      builder: 1,
      repairer: 1,
      wallRepairer: 0,
      upgrader: 1,
      lorry: 0,
    };
  } else if (this.room.memory.strategy >= 2) {
    console.log("2");
    this.memory.minCivilianCreeps = {
      harvester: 1,
      builder: 1,
      repairer: 1,
      wallRepairer: 0,
      upgrader: 3,
      lorry: 0,
    };
  }
};

// create a new function for StructureSpawn
StructureSpawn.prototype.spawnCreepsIfNecessary = function () {
  /** @type {Room} */
  let room = this.room;
  // find all creeps in room
  /** @type {Array.<Creep>} */
  let creepsInRoom = room.find(FIND_MY_CREEPS);

  // count the number of creeps alive for each role in this room
  // _.sum will count the number of properties in Game.creeps filtered by the
  //  arrow function, which checks for the creep being a specific role
  /** @type {Object.<string, number>} */
  let numberOfCreeps = {};
  for (let role of listOfRoles) {
    numberOfCreeps[role] = _.sum(creepsInRoom, (c) => c.memory.role == role);
  }

  if (global.loggingLevel == "verbose") {
    console.log("Harvester | Repairer | Wall-Repairer > Builder > Upgrader");
    console.log(
      "Red for repair |Blue for Building |Green for Harvesting(Solid for Lorry) |Yellow for Upgrading |White for Lorry |Cyan for LD Harvest"
    );

    for (let role of listOfRoles) {
      console.log(
        numberOfCreeps[role] +
          " " +
          role +
          "(s) of the required " +
          this.memory.minCivilianCreeps[role]
      );
    }
  }

  let maxEnergy = room.energyCapacityAvailable;
  let name; //this was set to = undefined.

  // if no harvesters are left AND either no miners or no lorries are left
  //  create a backup creep
  if (numberOfCreeps["harvester"] == 0 && numberOfCreeps["lorry"] == 0) {
    // if there are still miners or enough energy in Storage left
    if (
      numberOfCreeps["miner"] > 0 ||
      (room.storage != undefined && room.storage.store[RESOURCE_ENERGY] >= 550) //enough energy for a miner (!and a lorry)
    ) {
      // create a lorry
      name = this.createLorry(150);
    }
    // if there is no miner and not enough energy in Storage left
    else {
      // create a harvester because it can work on its own
      console.log(this.name + " emergency harvester");
      name = this.createCustomCreep(room.energyAvailable, "harvester");
    }
  }
  // if no backup creep is required
  else {
    // check if all sources have miners
    let sources = room.find(FIND_SOURCES);
    // iterate over all sources
    for (let source of sources) {
      // if the source has no miner
      if (
        !_.some(
          creepsInRoom,
          (c) => c.memory.role == "miner" && c.memory.sourceId == source.id
        )
      ) {
        // check whether or not the source has a container
        /** @type {Array.StructureContainer} */
        let containers = source.pos.findInRange(FIND_STRUCTURES, 1, {
          filter: (s) => s.structureType == STRUCTURE_CONTAINER,
        });
        // if there is a container next to the source
        if (containers.length > 0) {
          // spawn a miner
          name = this.createMiner(source.id);
          break;
        }
      }
    }
  }

  // if none of the above caused a spawn command check for other roles
  if (name == undefined) {
    for (let role of listOfRoles) {
      // check for claim order
      if (role == "claimer" && this.memory.claimRoom != undefined) {
        // try to spawn a claimer
        name = this.createClaimer(this.memory.claimRoom);
        console.log("claimer");
        // if that worked
        if (name != undefined) {
          // delete the claim order
          delete this.memory.claimRoom;
        }
      }
      //check for signer
      if (role == "signer" && this.memory.roomSign != undefined) {
        // try to spawn a signer
        name = this.createSigner(this.memory.roomSign);
        console.log("Signer Name is " + name);
        if (name != undefined) {
          delete this.memory.roomSign;
        }
      }
      // if no claim order was found, check other roles
      else if (numberOfCreeps[role] < this.memory.minCivilianCreeps[role]) {
        if (role == "lorry") {
          name = this.createLorry(150);
        } else {
          name = this.createCustomCreep(maxEnergy, role);
        }
        break;
      } else if (numberOfCreeps[role] < this.memory.minArmedCreeps[role]) {
        if (role == "medic") {
          name = this.createMedic(maxEnergy);
        } else if (role == "archer") {
          name = this.createArcher(maxEnergy);
        } else if (role == "marine") {
          name = this.createMarine(maxEnergy);
        } else {
          name = this.createCustomCreep(maxEnergy, role);
        }
        break;
      }
    }
  }
  // if none of the above caused a spawn command check for Airborne
  /** @type {Object.<string, number>} */
  let numberOfAirborne = {};
  if (name == undefined) {
    // count the number of Airborne
    for (let roomName in this.memory.minAirborne) {
      numberOfAirborne[roomName] = _.sum(
        Game.creeps,
        (c) => c.memory.role == "airborne" && c.memory.target == roomName
      );

      if (numberOfAirborne[roomName] < this.memory.minAirborne[roomName]) {
        name = this.createAirborne(maxEnergy, room.name, roomName);
      }
    }
  }

  // print name to console if spawning was a success
  if (name != undefined && _.isString(name)) {
    console.log(
      this.name +
        " spawned new creep: " +
        name +
        " (" +
        Game.creeps[name].memory.role +
        ")"
    );
    for (let roomName in numberOfAirborne) {
      console.log("Airborne" + roomName + ": " + numberOfAirborne[roomName]);
    }
  }

  // if none of the above caused a spawn command check for LongDistanceHarvesters
  /** @type {Object.<string, number>} */
  let numberOfLongDistanceHarvesters = {};
  if (name == undefined) {
    // count the number of long distance harvesters globally
    for (let roomName in this.memory.minLongDistanceHarvesters) {
      numberOfLongDistanceHarvesters[roomName] = _.sum(
        Game.creeps,
        (c) =>
          c.memory.role == "longDistanceHarvester" &&
          c.memory.target == roomName
      );

      if (
        numberOfLongDistanceHarvesters[roomName] <
        this.memory.minLongDistanceHarvesters[roomName]
      ) {
        name = this.createLongDistanceHarvester(
          maxEnergy,
          2,
          room.name,
          roomName,
          0
        );
      }
    }
  }

  // print name to console if spawning was a success
  if (name != undefined && _.isString(name)) {
    console.log(
      this.name +
        " spawned new creep: " +
        name +
        " (" +
        Game.creeps[name].memory.role +
        ")"
    );
    for (let roomName in numberOfLongDistanceHarvesters) {
      console.log(
        "LongDistanceHarvester" +
          roomName +
          ": " +
          numberOfLongDistanceHarvesters[roomName]
      );
    }
  }
  // if none of the above caused a spawn command check for LongDistanceBuilders
  /** @type {Object.<string, number>} */
  let numberOfLongDistanceBuilders = {};
  if (name == undefined) {
    // count the number of long distance buiders globally
    for (let roomName in this.memory.minLongDistanceBuilders) {
      numberOfLongDistanceBuilders[roomName] = _.sum(
        Game.creeps,
        (c) =>
          c.memory.role == "longDistanceBuilder" && c.memory.target == roomName
      );

      if (
        numberOfLongDistanceBuilders[roomName] <
        this.memory.minLongDistanceBuilders[roomName]
      ) {
        name = this.createLongDistanceBuilder(
          maxEnergy,
          2,
          room.name,
          roomName
        );
      }
    }
  }

  // print name to console if spawning was a success
  if (name != undefined && _.isString(name)) {
    console.log(
      this.name +
        " spawned new creep: " +
        name +
        " (" +
        Game.creeps[name].memory.role +
        ")"
    );
    for (let roomName in numberOfLongDistanceBuilder) {
      console.log(
        "LongDistanceBuilder_" +
          roomName +
          ": " +
          numberOfLongDistanceBuilders[roomName]
      );
    }
  }

  // if none of the above caused a spawn command check for Snipers
  /** @type {Object.<string, number>} */
  let numberOfSnipers = {};
  if (name == undefined) {
    // count the number of long distance buiders globally
    for (let roomName in this.memory.minSnipers) {
      numberOfSnipers[roomName] = _.sum(
        Game.creeps,
        (c) => c.memory.role == "sniper" && c.memory.target == roomName
      );

      if (numberOfSnipers[roomName] < this.memory.minSnipers[roomName]) {
        console.log("bulid a sniper");
        name = this.createSniper(maxEnergy, room.name, roomName);
      }
    }
  }

  // print name to console if spawning was a success
  if (name != undefined && _.isString(name)) {
    console.log(
      this.name +
        " spawned new creep: " +
        name +
        " (" +
        Game.creeps[name].memory.role +
        ")"
    );
    for (let roomName in numberOfSniper) {
      console.log("Sniper_" + roomName + ": " + numberOfSnipers[roomName]);
    }
  }
};
