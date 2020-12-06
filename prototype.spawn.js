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

var strategyStartState = true;


StructureSpawn.prototype.updateTactics = function () {
  /** @type {Room} */
  let room = this.room;
  // find all creeps in room
  /** @type {Array.<Creep>} */
  // let creepsInRoom = room.find(FIND_MY_CREEPS);

  let spawnsInRoom = room.find(FIND_MY_STRUCTURES, {
    filter: (s) => (s.structureType = STRUCTURE_SPAWN),
  });

  let containersInRoom = room.find(FIND_STRUCTURES, {
    filter: (s) => (s.structureType = STRUCTURE_CONTAINER),
  });

  containerCount = containersInRoom.length;

  console.log('container count ' +  containerCount);
  for (let spawnName in Game.spawns) {
    this.memory.strategy.tactic = containerCount;
    if (this.memory.strategy.tactic >= 1) {
      this.memory.minCreeps = {
        harvester: 0,
        builder: 1,
        repairer: 1,
        wallRepairer: 1,
        upgrader: 3,
        lorry: 2,
        marine: 0,
        medic: 0,
        archer: 0,
        grunt: 0,
      };
    }
    else {
      this.memory.minCreeps = {
        harvester: 2,
        builder: 1,
        repairer: 1,
        wallRepairer: 0,
        upgrader: 3,
        lorry: 0,
        marine: 0,
        medic: 0,
        archer: 0,
        grunt: 0,
      };
    }
  }
  return strategyStartState;
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
  console.log("Harvester | Repairer | Wall-Repairer > Builder > Upgrader");
  console.log(
    "Red for repair |Blue for Building |Green for Harvesting(Solid for Lorry) |Yellow for Upgrading |White for Lorry |Cyan for LD Harvest"
  );
  console.log(this.name);

  for (let role of listOfRoles) {
    console.log(
      numberOfCreeps[role] +
        " " +
        role +
        "(s) of the required " +
        this.memory.minCreeps[role]
    );
  }

  let maxEnergy = room.energyCapacityAvailable;
  let name = undefined;

  // if no harvesters are left AND either no miners or no lorries are left
  //  create a backup creep
  if (numberOfCreeps["harvester"] == 0 && numberOfCreeps["lorry"] == 0) {
    // if there are still miners or enough energy in Storage left
    if (
      numberOfCreeps["miner"] > 0 ||
      (room.storage != undefined &&
        room.storage.store[RESOURCE_ENERGY] >= 150 + 550)
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
      else if (numberOfCreeps[role] < this.memory.minCreeps[role]) {
        if (role == "lorry") {
          name = this.createLorry(150);
        } else if (role == "medic") {
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

// create a new function for StructureSpawn
StructureSpawn.prototype.createCustomCreep = function (energy, roleName) {
  // create a balanced body as big as possible with the given energy
  var numberOfParts = Math.floor(energy / 200);
  // make sure the creep is not too big (more than 50 parts)
  numberOfParts = Math.min(numberOfParts, Math.floor(50 / 3));
  var body = [];
  for (let i = 0; i < numberOfParts; i++) {
    body.push(WORK);
  }
  for (let i = 0; i < numberOfParts; i++) {
    body.push(CARRY);
  }
  for (let i = 0; i < numberOfParts; i++) {
    body.push(MOVE);
  }

  // create creep with the created body and the given role

  return this.spawnCreep(body, roleName + "_" + Game.time, {
    memory: { role: roleName, working: false, roleChange: false },
  });
};

// create a new function for StructureSpawn
StructureSpawn.prototype.createLongDistanceBuilder = function (
  energy,
  numberOfWorkParts,
  home,
  target
) {
  var numberOfParts = Math.floor(energy / 200);
  // make sure the creep is not too big (more than 50 parts)
  numberOfParts = Math.min(numberOfParts, Math.floor(50 / 3));
  var body = [];
  for (let i = 0; i < numberOfParts; i++) {
    body.push(WORK);
  }
  for (let i = 0; i < numberOfParts; i++) {
    body.push(CARRY);
  }
  for (let i = 0; i < numberOfParts; i++) {
    body.push(MOVE);
  }

  // create creep with the created body
  return this.spawnCreep(body, "ld_Builder_" + Game.time, {
    memory: {
      role: "longDistanceBuilder",
      home: home,
      target: target,
      working: false,
      energyCost: energy,
    },
  });
};

StructureSpawn.prototype.createLongDistanceHarvester = function (
  energy,
  numberOfWorkParts,
  home,
  target,
  sourceIndex
) {
  // create a body with the specified number of WORK parts and one MOVE part per non-MOVE part
  if (energy > 1000) {
    energy == 1000;
  }
  var body = [];
  for (let i = 0; i < numberOfWorkParts; i++) {
    body.push(WORK);
  }

  // 150 = 100 (cost of WORK) + 50 (cost of MOVE)
  energy -= 150 * numberOfWorkParts;

  var numberOfParts = Math.floor(energy / 100);
  // make sure the creep is not too big (more than 50 parts)
  numberOfParts = Math.min(
    numberOfParts,
    Math.floor((50 - numberOfWorkParts * 2) / 2)
  );
  for (let i = 0; i < numberOfParts; i++) {
    body.push(CARRY);
  }
  for (let i = 0; i < numberOfParts + numberOfWorkParts; i++) {
    body.push(MOVE);
  }

  // create creep with the created body
  return this.spawnCreep(body, "ld_Harvester_" + Game.time, {
    memory: {
      role: "longDistanceHarvester",
      home: home,
      target: target,
      sourceIndex: sourceIndex,
      working: false,
      energyCost: energy,
      fillCount: 0,
    },
  });
};
StructureSpawn.prototype.createMarine = function (energy) {
  // create a balanced body as big as possible with the given energy
  var numberOfParts = Math.floor(energy / 460);
  // make sure the creep is not too big (more than 50 parts)
  numberOfParts = Math.min(numberOfParts, Math.floor(50 / 20));
  var body = [];
  for (let i = 0; i < 15; i++) {
    for (let i = 0; i < numberOfParts; i++) {
      body.push(TOUGH);
    }
  }

  for (let i = 0; i < numberOfParts; i++) {
    body.push(ATTACK);
  }
  for (let i = 0; i < numberOfParts; i++) {
    body.push(ATTACK);
  }
  for (let i = 0; i < numberOfParts; i++) {
    body.push(MOVE);
  }
  for (let i = 0; i < numberOfParts; i++) {
    body.push(MOVE);
  }
  for (let i = 0; i < numberOfParts; i++) {
    body.push(MOVE);
  }

  // create creep with the created body and the given role
  return this.spawnCreep(body, "Marine_" + Game.time, {
    memory: { role: "marine", working: false, roleChange: false },
  });
};

StructureSpawn.prototype.createAirborne = function (energy, home, target) {
  // create a balanced body as big as possible with the given energy
  var numberOfParts = Math.floor(energy / 270);
  // make sure the creep is not too big (more than 50 parts)
  numberOfParts = Math.min(numberOfParts, Math.floor(50 / 4));
  var body = [];
  for (let i = 0; i < numberOfParts; i++) {
    body.push(TOUGH);
  }
  for (let i = 0; i < numberOfParts; i++) {
    body.push(ATTACK);
  }
  for (let i = 0; i < numberOfParts; i++) {
    body.push(MOVE);
  }
  for (let i = 0; i < numberOfParts; i++) {
    body.push(MOVE);
  }

  // create creep with the created body and the given role
  return this.spawnCreep(body, "Airborne_" + Game.time, {
    memory: {
      role: "airborne",
      target: target,
      home: home,
      working: false,
      roleChange: false,
    },
  });
};

StructureSpawn.prototype.createSniper = function (energy, home, target) {
  // create a balanced body as big as possible with the given energy
  var numberOfParts = Math.floor(energy / 210);
  // make sure the creep is not too big (more than 50 parts)
  numberOfParts = Math.min(numberOfParts, Math.floor(50 / 3));
  var body = [];
  for (let i = 0; i < numberOfParts; i++) {
    body.push(TOUGH);
  }
  for (let i = 0; i < numberOfParts; i++) {
    body.push(RANGED_ATTACK);
  }
  for (let i = 0; i < numberOfParts; i++) {
    body.push(MOVE);
  }

  // create creep with the created body and the given role
  return this.spawnCreep(body, "Sniper_" + Game.time, {
    memory: {
      role: "sniper",
      target: target,
      home: home,
      working: false,
      roleChange: false,
    },
  });
};

StructureSpawn.prototype.createGrunt = function (energy) {
  // create a balanced body as big as possible with the given energy
  var numberOfParts = Math.floor(energy / 270);
  // make sure the creep is not too big (more than 50 parts)
  numberOfParts = Math.min(numberOfParts, Math.floor(50 / 4));
  var body = [];
  for (let i = 0; i < numberOfParts; i++) {
    body.push(TOUGH);
  }
  for (let i = 0; i < numberOfParts; i++) {
    body.push(ATTACK);
  }
  for (let i = 0; i < numberOfParts; i++) {
    body.push(MOVE);
  }
  for (let i = 0; i < numberOfParts; i++) {
    body.push(MOVE);
  }

  // create creep with the created body and the given role
  return this.spawnCreep(body, "Grunt" + Game.time, {
    memory: { role: "grunt", working: false, roleChange: false },
  });
};

// create a new function for StructureSpawn
StructureSpawn.prototype.createArcher = function (energy) {
  // create a balanced body as big as possible with the given energy
  var numberOfParts = Math.floor(energy / 210);
  // make sure the creep is not too big (more than 50 parts)
  numberOfParts = Math.min(numberOfParts, Math.floor(50 / 3));
  var body = [];
  for (let i = 0; i < numberOfParts; i++) {
    body.push(TOUGH);
  }
  for (let i = 0; i < numberOfParts; i++) {
    body.push(RANGED_ATTACK);
  }
  for (let i = 0; i < numberOfParts; i++) {
    body.push(MOVE);
  }

  // create creep with the created body and the given role
  return this.spawnCreep(body, "Archer_" + Game.time, {
    memory: { role: "archer", working: false, roleChange: false },
  });
};

StructureSpawn.prototype.createMedic = function (energy) {
  // create a balanced body as big as possible with the given energy
  var numberOfParts = Math.floor(energy / 600);
  // make sure the creep is not too big (more than 50 parts)
  numberOfParts = Math.min(numberOfParts, Math.floor(50 / 4));
  var body = [];
  for (let i = 0; i < numberOfParts; i++) {
    body.push(HEAL);
  }
  var body = [];
  for (let i = 0; i < numberOfParts; i++) {
    body.push(HEAL);
  }
  for (let i = 0; i < numberOfParts; i++) {
    body.push(MOVE);
  }
  for (let i = 0; i < numberOfParts; i++) {
    body.push(MOVE);
  }

  // create creep with the created body and the given role
  return this.spawnCreep(body, "Medic_" + Game.time, {
    memory: { role: "medic", working: false, roleChange: false },
  });
};

// create a new function for StructureSpawn
StructureSpawn.prototype.createSigner = function (signContent) {
  return this.spawnCreep([MOVE], "Signer_" + Game.time, {
    memory: { role: "signer", roomSign: signContent },
  });
};

// create a new function for StructureSpawn
StructureSpawn.prototype.createClaimer = function (target) {
  return this.spawnCreep([CLAIM, MOVE], "Claimer_" + Game.time, {
    memory: { role: "claimer", target: target },
  });
};

// create a new function for StructureSpawn
StructureSpawn.prototype.createMiner = function (sourceId) {
  return this.spawnCreep(
    [WORK, WORK, WORK, WORK, WORK, MOVE],
    "Miner_" + Game.time,
    {
      memory: { role: "miner", sourceId: sourceId },
    }
  );
};

// create a new function for StructureSpawn
StructureSpawn.prototype.createLorry = function (energy) {
  // create a body with twice as many CARRY as MOVE parts
  var numberOfParts = Math.floor(energy / 150);
  // make sure the creep is not too big (more than 50 parts)
  numberOfParts = Math.min(numberOfParts, Math.floor(50 / 3));
  var body = [];
  for (let i = 0; i < numberOfParts * 2; i++) {
    body.push(CARRY);
  }
  for (let i = 0; i < numberOfParts; i++) {
    body.push(MOVE);
  }

  // create creep with the created body and the role 'lorry'
  return this.spawnCreep(body, "Lorry_" + Game.time, {
    memory: { role: "lorry", working: false },
  });
};
