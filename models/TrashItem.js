const mongoose = require('mongoose');

const trashItemSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: String,
  category: String,
  brand: String,
  family: String,
  basePrice: Number,
  description: String,
  images: [String],
  specifications: mongoose.Schema.Types.Mixed,
  options: mongoose.Schema.Types.Mixed,
  _trashedAt: { type: Date, default: Date.now },
  _wasAdminProduct: Boolean,
  _adminOverride: Boolean,
  _adminCreated: Boolean
}, { timestamps: true });

module.exports = mongoose.model('TrashItem', trashItemSchema);
