const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const SeedProduct = sequelize.define('SeedProduct', {
  id: { type: DataTypes.INTEGER, primaryKey: true, unique: true },
  name: { type: DataTypes.STRING(255) },
  category: { type: DataTypes.STRING(255) },
  brand: { type: DataTypes.STRING(255) },
  family: { type: DataTypes.STRING(255) },
  basePrice: { type: DataTypes.FLOAT },
  description: { type: DataTypes.TEXT },
  images: { type: DataTypes.JSONB, defaultValue: [] },
  specifications: { type: DataTypes.JSONB, defaultValue: {} },
  options: { type: DataTypes.JSONB, defaultValue: {} }
}, {
  timestamps: true
});

module.exports = SeedProduct;
