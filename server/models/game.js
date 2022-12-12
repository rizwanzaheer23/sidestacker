'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Game extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here
    }
  }
  Game.init({
    player1Socket: DataTypes.STRING,
    player2Socket: DataTypes.STRING,
    noOfPlayers: DataTypes.NUMBER,
    currentTurn: DataTypes.NUMBER
  }, {
    sequelize,
    modelName: 'Game',
  });
  return Game;
};