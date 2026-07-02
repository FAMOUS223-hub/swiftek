const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const TrashItem = sequelize.define('TrashItem', {
  id: { type: DataTypes.INTEGER, primaryKey: true, unique: true },
  name: { type: DataTypes.STRING(255) },
  category: { type: DataTypes.STRING(255) },
  brand: { type: DataTypes.STRING(255) },
  family: { type: DataTypes.STRING(255) },
  basePrice: { type: DataTypes.FLOAT },
  description: { type: DataTypes.TEXT },
  images: { type: DataTypes.JSONB, defaultValue: [] },
  specifications: { type: DataTypes.JSONB, defaultValue: {} },
  options: { type: DataTypes.JSONB, defaultValue: {} },
  negotiable: { type: DataTypes.BOOLEAN, defaultValue: false },
  _trashedAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  _wasAdminProduct: { type: DataTypes.BOOLEAN, defaultValue: false },
  _adminOverride: { type: DataTypes.BOOLEAN, defaultValue: false },
  _adminCreated: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  timestamps: true
});

module.exports = TrashItem;
