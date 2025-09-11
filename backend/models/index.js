const sequelize = require('../config/db');

const User = require('./User');
const Board = require('./Board');
const Column = require('./Column');
const Card = require('./Card');
const AuditLog = require('./AuditLog');

// Board -> Columns
Board.hasMany(Column, { foreignKey: 'board_id', onDelete: 'CASCADE' });
Column.belongsTo(Board, { foreignKey: 'board_id' });

// Column -> Cards
Column.hasMany(Card, { foreignKey: 'column_id', onDelete: 'CASCADE' });
Card.belongsTo(Column, { foreignKey: 'column_id' });

// Board -> AuditLog
Board.hasMany(AuditLog, { foreignKey: 'board_id', onDelete: 'CASCADE' });
AuditLog.belongsTo(Board, { foreignKey: 'board_id' });

// Card -> User (assignee)
User.hasMany(Card, { foreignKey: 'assignee_id' });
Card.belongsTo(User, { foreignKey: 'assignee_id' });

// Board -> User (owner)
User.hasMany(Board, { foreignKey: 'owner_id' });
Board.belongsTo(User, { foreignKey: 'owner_id' });

module.exports = { sequelize, User, Board, Column, Card, AuditLog };
