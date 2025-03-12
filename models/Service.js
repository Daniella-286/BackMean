const mongoose = require('mongoose');

const ServiceSchema = new mongoose.Schema({
  nom_service: { type: String, required: true },
  description: { type: String, required: true },
  imageUrl: { type: String },  // Stocke l'URL de l'image
}, { timestamps: true });

module.exports = mongoose.model('Service', ServiceSchema);
