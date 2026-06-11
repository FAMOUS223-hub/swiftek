const mongoose = require('mongoose');

const ratingSchema = new mongoose.Schema({
  productId: { type: Number, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  review: { type: String, default: '' },
  createdAt: { type: Date, default: Date.now }
});

ratingSchema.index({ productId: 1, userId: 1 }, { unique: true });

module.exports = mongoose.model('Rating', ratingSchema);
