const { DataTypes } = require('sequelize');
const sequelize = require('../config/db');

const AuditLog = sequelize.define('AuditLog', {
  id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
  board_id: DataTypes.UUID,
  event_type: DataTypes.STRING,
  data: DataTypes.JSON
}, {
  timestamps: true,
  tableName: 'audit_logs'
});

module.exports = AuditLog;
