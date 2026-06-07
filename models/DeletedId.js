const mongoose = require('mongoose');

const deletedIdSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true }
}, { timestamps: true });

module.exports = mongoose.model('DeletedId', deletedIdSchema);
