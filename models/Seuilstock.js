const mongoose = require('mongoose');

const SeuilStockSchema = new mongoose.Schema({
  quantite: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('SeuilStock', SeuilStockSchema);
