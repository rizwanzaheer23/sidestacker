const gameRoute = require("./game");
const gridRoute = require("./grid");

const allRoutes = [gameRoute, gridRoute];

const initializeRoutes = (app) => {
  allRoutes.forEach((router) => {
    app.use(`/api/${router.name}`, router.route);
  });
  return app;
};

module.exports = { initializeRoutes };
