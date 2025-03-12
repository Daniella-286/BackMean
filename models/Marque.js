const mongoose = require('mongoose');

const MarqueSchema = new mongoose.Schema({
  nom_marque: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Marque', MarqueSchema);
