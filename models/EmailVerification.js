const { DataTypes } = require('sequelize');
const sequelize = require('./db');

const EmailVerification = sequelize.define('EmailVerification', {
  email: { type: DataTypes.STRING(255), allowNull: false },
  otp: { type: DataTypes.STRING(10), allowNull: false },
  expiresAt: { type: DataTypes.DATE, allowNull: false },
  sentAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  attempts: { type: DataTypes.INTEGER, defaultValue: 0 },
  verified: { type: DataTypes.BOOLEAN, defaultValue: false }
}, {
  timestamps: false,
  indexes: [
    { fields: ['email'] },
    { fields: ['expiresAt'] },
    { fields: ['sentAt'] }
  ]
});

module.exports = EmailVerification;
