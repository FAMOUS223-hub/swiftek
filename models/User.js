const { DataTypes } = require('sequelize');
const sequelize = require('./db');
const bcrypt = require('bcryptjs');

const User = sequelize.define('User', {
  name: { type: DataTypes.STRING(255), allowNull: false },
  email: { type: DataTypes.STRING(255), allowNull: false, unique: true },
  password: { type: DataTypes.STRING(255), allowNull: false },
  role: { type: DataTypes.STRING(20), defaultValue: 'user' },
  isSuperAdmin: { type: DataTypes.BOOLEAN, defaultValue: false },
  permissions: { type: DataTypes.JSONB, defaultValue: ['products', 'orders', 'users'] },
  verified: { type: DataTypes.BOOLEAN, defaultValue: false },
  verificationToken: { type: DataTypes.STRING(255), defaultValue: null },
  status: { type: DataTypes.STRING(20), defaultValue: 'active' },
  suspendedAt: { type: DataTypes.DATE, defaultValue: null },
  revokedAt: { type: DataTypes.DATE, defaultValue: null },
  resetOtp: { type: DataTypes.STRING(10), defaultValue: null },
  resetOtpExpires: { type: DataTypes.DATE, defaultValue: null },
  resetOtpSentAt: { type: DataTypes.DATE, defaultValue: null },
  resetPasswordToken: { type: DataTypes.STRING(255), defaultValue: null },
  resetPasswordExpires: { type: DataTypes.DATE, defaultValue: null },
  resetOtpAttempts: { type: DataTypes.INTEGER, defaultValue: 0 }
}, {
  timestamps: true,
  hooks: {
    beforeCreate: async (user) => {
      user.password = await bcrypt.hash(user.password, 12);
    },
    beforeUpdate: async (user) => {
      if (user.changed('password')) {
        user.password = await bcrypt.hash(user.password, 12);
      }
    }
  }
});

User.prototype.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = User;
