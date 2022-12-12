const express = require("express");
const cors = require("cors");
const db = require("./models");
const { createServer } = require("http");
const { Server } = require("socket.io");
const { initializeRoutes } = require("./routes");

const port = 5000;
let app = express();

app.use(cors())
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

const httpServer = createServer(app);
const io = new Server(httpServer);
global.io = io;

io.on("connection", (socket) => {
  console.log("Player Connected: " + socket.id);
  
  setTimeout(async () => {
    const game = (await db.Game.findOne())?.dataValues;
    if (game.noOfPlayers < 2) {
      io.to(socket.id).emit('new-connection', game.noOfPlayers+1);
      io.to(socket.id).emit('turn-update', 1);
      
      const obj = {
        noOfPlayers: game.noOfPlayers+1,
        [game.noOfPlayers ? "player2Socket" : "player1Socket"]: socket.id
      }
      await db.Game.update({ ...obj }, { where: { id: game.id } });
    }
  })
  

  socket.on('disconnect', async () => {
    console.log("Player Disconnected: " + socket.id);
    const game = (await db.Game.findOne())?.dataValues;
    if (!game) return;

    let obj = {};
    if (game.player1Socket === socket.id) {
      obj = { player1Socket: game.player2Socket, player2Socket: null, noOfPlayers: game.noOfPlayers-1, currentTurn: 1 }
      
    }else if (game.player2Socket === socket.id) {
      obj = { player1Socket: game.player1Socket, player2Socket: null, noOfPlayers: game.noOfPlayers-1, currentTurn: 1 }
    }

    // Reset Game
    if (obj.player1Socket) {
      io.to(obj.player1Socket).emit('reset-game');
    }

    await db.Game.update({ ...obj }, { where: { id: game.id } });
  });
  
});

app = initializeRoutes(app);
app.get("/", (req, res) => {
  res.status(200).send({
    success: true,
    message: "welcome to the beginning of greatness",
  });
});

httpServer.listen(port, () => {
  console.log(`App listening on port ${port}`);
});