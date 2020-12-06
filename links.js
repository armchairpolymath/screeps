var links = {
    run: function (roomName) {
        let arrOut = [];
        let arrIn = [];
        for(index in Game.rooms[roomName].memory.link){
            if(Game.rooms[roomName].memory.link[index].role == 'output'){
                arrOut.push(Game.rooms[roomName].memory.link[index]);
            }
            if(Game.rooms[roomName].memory.link[index].role == 'input'){
                arrIn.push(Game.rooms[roomName].memory.link[index]);
            }
            if(Game.rooms[roomName].memory.link[index].role == 'both'){
                arrOut.push(Game.rooms[roomName].memory.link[index]);
                arrIn.push(Game.rooms[roomName].memory.link[index]);
            }
        }
        for(index in arrOut){
            let linkFrom = Game.getObjectById(arrOut[index].id);
            for(index in arrIn){
                let linkTo = Game.getObjectById(arrIn[index].id);
                if(linkFrom.id != linkTo.id){
                    if(linkFrom.energy > 700 && linkFrom.cooldown == 0 && (linkTo.energy < (linkFrom.energy - 24))){
                        linkFrom.transferEnergy(linkTo);
                    }
                }
            }
        }
    }
};
module.exports = links