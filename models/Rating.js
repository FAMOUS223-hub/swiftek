const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const Rating = sequelize.define('Rating', {
  productId: { type: DataTypes.INTEGER, allowNull: false },
  rating: { type: DataTypes.INTEGER, allowNull: false },
  review: { type: DataTypes.TEXT, defaultValue: '' }
}, {
  timestamps: true,
  indexes: [
    { fields: ['productId', 'userId'], unique: true },
    { fields: ['productId'] }
  ]
});

module.exports = Rating;
