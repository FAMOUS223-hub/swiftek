const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
  productId: { type: Number, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  text: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

commentSchema.index({ productId: 1, createdAt: -1 });

module.exports = mongoose.model('Comment', commentSchema);
