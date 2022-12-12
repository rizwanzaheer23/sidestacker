const { hoistedIOGame } = require("./gameSocket");
const { hoistedIOGrid } = require("./gridSocket");

const configureSockets = (io, socket) => {
    return {
        gameSocket: hoistedIOGame(io),
        gridSocket: hoistedIOGrid(io),
    };
};

const onConnection = (io) => (socket) => {
  const { gridSocket, gameSocket } = configureSockets(io, socket);
  socket.on("grid-update", gridSocket);
  socket.on("game-update", gameSocket);
};

module.exports = { onConnection };