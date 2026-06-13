const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const Session = sequelize.define('Session', {
  token: { type: DataTypes.STRING(255), allowNull: false, unique: true },
  role: { type: DataTypes.STRING(20), defaultValue: 'admin' },
  lastUsed: { type: DataTypes.DATE, defaultValue: DataTypes.NOW }
}, {
  timestamps: true
});

module.exports = Session;
