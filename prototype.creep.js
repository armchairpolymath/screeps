var roles = {
    harvester: require('role.harvester'),
    upgrader: require('role.upgrader'),
    builder: require('role.builder'),
    repairer: require('role.repairer'),
    wallRepairer: require('role.wallRepairer'),
    longDistanceHarvester: require('role.longDistanceHarvester'),
    claimer: require('role.claimer'),
    miner: require('role.miner'),
    lorry: require('role.lorry'),
    signer: require('role.signer'),
    marine: require('role.marine')
};

Creep.prototype.runRole =
    function () {
        roles[this.memory.role].run(this);
    };

/** @function 
    @param {bool} useContainer
    @param {bool} useSource */
Creep.prototype.getEnergy =
    function (useContainer, useSource, useDropped) {
        /** @type {StructureContainer} */
        let container;
        // first lets get energy from tombstones
        container = this.pos.findClosestByPath(FIND_TOMBSTONES, {
                filter: s => (s.store[RESOURCE_ENERGY]>10)
        });
        if (useDropped) {
            // try the ground, because decay
            target = this.pos.findClosestByRange(FIND_DROPPED_RESOURCES, {
                filter: s => (s.resourceType == RESOURCE_ENERGY)
            })};
        if(target) {
            if(this.pickup(target) == ERR_NOT_IN_RANGE) {
                this.moveTo(container,{visualizePathStyle:{
                    fill: 'transparent',
                    stroke: '#f00',
                    lineStyle: 'dashed',
                    strokeWidth: .08,
                    opacity: .15
                }});
            }
        };
        
        // if the Creep should look for containers
        if (useContainer) {
            // find closest container
            container = this.pos.findClosestByPath(FIND_STRUCTURES, {
                filter: s => (s.structureType == STRUCTURE_CONTAINER || s.structureType == STRUCTURE_STORAGE) &&
                             s.store[RESOURCE_ENERGY] > 250
            });
            // if one was found
            if (container != undefined) {
                
                // try to withdraw energy, if the container is not in range
                if (this.withdraw(container, RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
                    // move towards it
                    this.moveTo(container,{visualizePathStyle:{
                        fill: 'transparent',
                        stroke: '#fff',
                        lineStyle: 'dashed',
                        strokeWidth: .08,
                        opacity: .15
                    }})
                }
            }
        }
        // if no container was found and the Creep should look for Sources
        if (container == undefined && useSource) {
            // find closest source
            var source = this.pos.findClosestByPath(FIND_SOURCES_ACTIVE);

            // try to harvest energy, if the source is not in range
            if (this.harvest(source) == ERR_NOT_IN_RANGE) {
                // move towards it
                this.moveTo(source,{visualizePathStyle:{
                        fill: 'transparent',
                        stroke: '#080',
                        lineStyle: 'dashed',
                        strokeWidth: .08,
                        opacity: .15
                    }
                });
            }
                
        }
    };