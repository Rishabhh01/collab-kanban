// models/Board.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../config/db');

class Board extends Model {}

Board.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    owner_id: { type: DataTypes.UUID, allowNull: false }
  },
  {
    sequelize,
    modelName: 'Board',
    tableName: 'boards',
    timestamps: true
  }
);

module.exports = Board;


