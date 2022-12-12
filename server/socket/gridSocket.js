const db = require("../models");

const hoistedIOGrid = (io, socket) => {
  return async function updateGrid(payload) {
    
        const game = await db.Game.findOne();
        const { socketID } = game.dataValues;

        io.to(socketID).emit("grid-update", {
            grid: payload.grid,
        });

    }
};

module.exports = { hoistedIOGrid };