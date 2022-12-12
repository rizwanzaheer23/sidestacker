const { Router } = require("express");

const db = require("../models");
const gridRouter = Router();

gridRouter.get("/", async (req, res, next) => {
    const grids = await db.Grid.findAll();
  
    res.status(200).send({
      success: true,
      message: "grids successfully retrieved",
      grids,
    });
});

gridRouter.post("/recordMove", async (req, res, next) => {
    const { row, cell, player } = req.body;
    const grid = (await db.Grid.create({ row, cell, player }))?.dataValues;
    const game = (await db.Game.findOne())?.dataValues;
    
    const nextTurn = (game.currentTurn%2) + 1;
    await db.Game.update({ currentTurn: nextTurn }, { where: { id: game.id } })

    if (game.noOfPlayers >= 1 ) {
        global.io.to(game.player1Socket).emit('grid-update', grid);
        global.io.to(game.player1Socket).emit('turn-update', nextTurn);
    }
        
    if (game.noOfPlayers === 2 ) {
        global.io.to(game.player2Socket).emit('grid-update', grid);
        global.io.to(game.player2Socket).emit('turn-update', nextTurn);
    }


    res.status(201).send({
        success: true,
        message: "grid updated successfully",
        grid,
    });
});

module.exports = { route: gridRouter, name: "grid" };
