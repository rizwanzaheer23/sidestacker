const { Router } = require("express");

const db = require("../models");
const gameRouter = Router();

gameRouter.get("/", async (req, res, next) => {
  const game = await db.Game.findOne();

  res.status(200).send({
    success: true,
    message: "game successfully retrieved",
    game,
  });
});

gameRouter.post("/new", async (req, res, next) => {
  let game = (await db.Game.findOne()).dataValues;
  if (game) {
    game = await db.Game.update({ currentTurn: 1, noOfPlayers: 0, player1Socket: null, player2Socket: null }, { where: { id: game.id } });
  }else {
    game = await db.Game.create({ currentTurn: 1, noOfPlayers: 0, player1Socket: null, player2Socket: null });
  }

  res.status(201).send({
    success: true,
    message: "new game initialized",
    game,
  });
});

module.exports = { route: gameRouter, name: "game" };
