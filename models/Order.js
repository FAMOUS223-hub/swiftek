const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const Order = sequelize.define('Order', {
  orderRef: { type: DataTypes.STRING(50), allowNull: false, unique: true },
  items: { type: DataTypes.JSONB, allowNull: false, defaultValue: [] },
  total: { type: DataTypes.FLOAT, allowNull: false },
  status: { type: DataTypes.STRING(20), defaultValue: 'pending' },
  customerInfo: { type: DataTypes.JSONB, defaultValue: {} },
  recipient: { type: DataTypes.JSONB, defaultValue: {} }
}, {
  timestamps: true
});

module.exports = Order;
