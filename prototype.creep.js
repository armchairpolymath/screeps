var roles = {
  harvester: require("role.harvester"),
  upgrader: require("role.upgrader"),
  builder: require("role.builder"),
  repairer: require("role.repairer"),
  wallRepairer: require("role.wallRepairer"),
  longDistanceHarvester: require("role.longDistanceHarvester"),
  claimer: require("role.claimer"),
  miner: require("role.miner"),
  lorry: require("role.lorry"),
  signer: require("role.signer"),
  marine: require("role.marine"),
  medic: require("role.medic"),
  grunt: require("role.grunt"),
  airborne: require("role.airborne"),
  longDistanceBuilder: require("role.longDistanceBuilder"),
  truck: require("role.truck"),
  sniper: require("role.sniper"),
};

const global = require("./global");

Creep.prototype.runRole = function () {
  roles[this.memory.role].run(this);
};

Creep.prototype.getEnergy = function () {
  var target;
  var container;
  var storage;
  var useDropped;

  var containersInRoom = this.room.find(FIND_STRUCTURES, {
    filter: { structureType: STRUCTURE_CONTAINER },
  });
  // if containers exist in the room, then change creeps counts
  // don't use harvesters anymore, use lorries and more.
  containerCount = containersInRoom.length;
  // determine who should go where for energy.

  if (this.memory.role == "harvester") {
    if (containerCount == 0) {
      useSource = true;
      useContainer = false;
    } else {
      useSource = false;
      useContainer = true;
    }
    useDropped = true;
    useStorage = false;
  }

  if (this.memory.role == "builder") {
    if (containerCount == 0) {
      useSource = true;
      useContainer = false;
    } else {
      useSource = false;
      useContainer = true;
    }
    useStorage = false;
    useDropped = true;
  }

  if (this.memory.role == "repairer") {
    if (containerCount == 0) {
      useSource = true;
      useContainer = false;
    } else {
      useSource = false;
      useContainer = true;
    }
    useStorage = true;
    useDropped = true;
  }

  if (this.memory.role == "repairer") {
    if (containerCount == 0) {
      useSource = true;
      useContainer = false;
    } else {
      useSource = false;
      useContainer = true;
    }
    useStorage = true;
    useDropped = true;
  }

  if (this.memory.role == "upgrader") {
    if (containerCount == 0) {
      useSource = true;
      useContainer = false;
    } else {
      useSource = false;
      useContainer = true;
    }
    useStorage = true;
    useDropped = false;
  }
  if (this.memory.role == "wallRepairer") {
    if (containerCount == 0) {
      useSource = true;
      useContainer = false;
    } else {
      useSource = false;
      useContainer = true;
    }
    useStorage = true;
    useDropped = true;
  }
  if (this.memory.role == "longDistanceBuilder") {
    if (containerCount == 0) {
      useSource = true;
      useContainer = false;
    } else {
      useSource = false;
      useContainer = true;
    }
    useStorage = true;
    useDropped = true;
  }

  if (this.ticksToLive > 80) {
    if (useDropped) {
      // try the ground, because decay
      if (global.loggingLevel == "verbose") {
        this.say("dropped");
      }
      target = this.pos.findClosestByPath(FIND_DROPPED_RESOURCES, {
        filter: (s) => s.resourceType == RESOURCE_ENERGY && s.amount > 75,
      });
    }

    if (target) {
      if (this.pickup(target) == ERR_NOT_IN_RANGE) {
        this.moveTo(target, {
          visualizePathStyle: {
            fill: "transparent",
            stroke: "#008000", //Green for harvesting
            lineStyle: "solid",
            strokeWidth: 0.08,
            opacity: 1,
          },
        });
      }
    }

    // if the Creep should look for storage
    if (useStorage && target == undefined) {
      if (global.loggingLevel == "verbose") {
        this.say("storage");
      }
      // find the closest storage
      storage = this.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (s) =>
          s.structureType == STRUCTURE_STORAGE &&
          s.store[RESOURCE_ENERGY] > 450,
      });
      //if one was found
      if (storage != undefined) {
        if (this.withdraw(storage, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          //move towards it
          this.moveTo(storage, {
            visualizePathStyle: {
              fill: "transparent",
              stroke: "#fff",
              lineStyle: "dashed",
              strokeWidth: 0.08,
              opacity: 0.15,
            },
          });
        }
      }
    }

    // if the Creep should look for containers
    if (useContainer && target == undefined && storage == undefined) {
      if (global.loggingLevel == "verbose") {
        this.say("container");
      }
      // find closest container
      container = this.pos.findClosestByPath(FIND_STRUCTURES, {
        filter: (s) =>
          (s.structureType == STRUCTURE_CONTAINER ||
            s.structureType == STRUCTURE_STORAGE) &&
          s.store[RESOURCE_ENERGY] > 450,
      });
      // if one was found
      if (container != undefined) {
        // try to withdraw energy, if the container is not in range
        if (this.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          // move towards it
          this.moveTo(container, {
            visualizePathStyle: {
              fill: "transparent",
              stroke: "#fff",
              lineStyle: "dashed",
              strokeWidth: 0.08,
              opacity: 0.15,
            },
          });
        }
      }
    }
    // if no container was found and the Creep should look for Sources
    if (
      useSource &&
      target == undefined &&
      storage == undefined &&
      container == undefined
    ) {
      if (global.loggingLevel == "verbose") {
        this.say("source");
      }
      // find closest source
      var source = this.pos.findClosestByPath(FIND_SOURCES_ACTIVE);

      // try to harvest energy, if the source is not in range
      if (this.harvest(source) == ERR_NOT_IN_RANGE) {
        // move towards it
        this.moveTo(source, {
          visualizePathStyle: {
            fill: "transparent",
            stroke: "#080",
            lineStyle: "dashed",
            strokeWidth: 0.08,
            opacity: 0.15,
          },
        });
      }
    }
  } else {
    if (global.loggingLevel == "verbose") {
      this.say("Forget Me");
    }
    this.memory.working = true;
  }
};
