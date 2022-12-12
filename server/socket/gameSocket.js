const db = require("../models");

const hoistedIOGame = (io, socket) => {
  return async function updateGame(payload) {
    
        const game = await db.Game.findOne();

        const { socketID } = game.dataValues;
        io.to(socketID).emit("game-update", {
            currentTurn: payload.currentTurn,
        });

    }
};

module.exports = { hoistedIOGame };