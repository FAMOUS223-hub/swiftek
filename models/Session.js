const mongoose = require('mongoose');

const sessionSchema = new mongoose.Schema({
  token: { type: String, required: true, unique: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  role: { type: String, enum: ['user', 'admin'], default: 'admin' },
  createdAt: { type: Date, default: Date.now },
  lastUsed: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Session', sessionSchema);
