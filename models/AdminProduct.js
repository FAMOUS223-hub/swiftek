const mongoose = require('mongoose');

const adminProductSchema = new mongoose.Schema({
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
  negotiable: { type: Boolean, default: false },
  _adminOverride: Boolean,
  _adminCreated: Boolean
}, { timestamps: true });

module.exports = mongoose.model('AdminProduct', adminProductSchema);
