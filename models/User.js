const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: { type: String, required: true, trim: true },
  email: { type: String, required: true, unique: true, lowercase: true, trim: true },
  password: { type: String, required: true },
  role: { type: String, enum: ['user', 'admin'], default: 'user' },
  isSuperAdmin: { type: Boolean, default: false },
  permissions: { type: [String], default: ['products', 'orders', 'users'] },
  verified: { type: Boolean, default: false },
  verificationToken: { type: String, default: null },
  status: { type: String, enum: ['active', 'suspended', 'revoked'], default: 'active' },
  suspendedAt: { type: Date, default: null },
  revokedAt: { type: Date, default: null },
  resetOtp: { type: String, default: null },
  resetOtpExpires: { type: Date, default: null },
  resetOtpSentAt: { type: Date, default: null },
  resetPasswordToken: { type: String, default: null },
  resetPasswordExpires: { type: Date, default: null },
  resetOtpAttempts: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now }
});

userSchema.pre('save', async function() {
  if (!this.isModified('password')) return;
  this.password = await bcrypt.hash(this.password, 12);
});

userSchema.methods.comparePassword = async function(candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
