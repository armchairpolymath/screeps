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