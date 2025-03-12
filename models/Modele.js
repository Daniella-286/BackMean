const mongoose = require('mongoose');

const ModeleSchema = new mongoose.Schema({
  nom_modele: { type: String, required: true },
  marque: { type: mongoose.Schema.Types.ObjectId, ref: 'Marque', required: true }
}, { timestamps: true });

module.exports = mongoose.model('Modele', ModeleSchema);
