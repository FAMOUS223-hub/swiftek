const mongoose = require('mongoose');

const seedProductSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: String,
  category: String,
  brand: String,
  family: String,
  basePrice: Number,
  description: String,
  images: [String],
  specifications: mongoose.Schema.Types.Mixed,
  options: mongoose.Schema.Types.Mixed
}, { timestamps: true });

module.exports = mongoose.model('SeedProduct', seedProductSchema);
