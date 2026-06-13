const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const Comment = sequelize.define('Comment', {
  productId: { type: DataTypes.INTEGER, allowNull: false },
  text: { type: DataTypes.TEXT, allowNull: false }
}, {
  timestamps: true,
  indexes: [
    { fields: ['productId', 'createdAt'] }
  ]
});

module.exports = Comment;
