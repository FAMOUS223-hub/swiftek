const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const AdminProduct = sequelize.define('AdminProduct', {
  id: { type: DataTypes.BIGINT, primaryKey: true, unique: true },
  name: { type: DataTypes.STRING(255) },
  category: { type: DataTypes.STRING(255) },
  brand: { type: DataTypes.STRING(255) },
  family: { type: DataTypes.STRING(255) },
  basePrice: { type: DataTypes.FLOAT },
  description: { type: DataTypes.TEXT },
  images: { type: DataTypes.JSONB, defaultValue: [] },
  specifications: { type: DataTypes.JSONB, defaultValue: {} },
  options: { type: DataTypes.JSONB, defaultValue: {} },
  inStock: { type: DataTypes.BOOLEAN, defaultValue: true },
  featured: { type: DataTypes.BOOLEAN, defaultValue: false },
  negotiable: { type: DataTypes.BOOLEAN, defaultValue: false },
  _adminOverride: { type: DataTypes.BOOLEAN, defaultValue: false },
  _adminCreated: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  timestamps: true
});

module.exports = AdminProduct;
