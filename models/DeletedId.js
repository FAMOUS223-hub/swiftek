const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const DeletedId = sequelize.define('DeletedId', {
  id: { type: DataTypes.INTEGER, primaryKey: true, unique: true }
}, {
  timestamps: true
});

module.exports = DeletedId;
