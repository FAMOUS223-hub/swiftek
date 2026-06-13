const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const Config = sequelize.define('Config', {
  key: { type: DataTypes.STRING(255), allowNull: false, unique: true },
  value: { type: DataTypes.JSONB }
}, {
  timestamps: true
});

module.exports = Config;
