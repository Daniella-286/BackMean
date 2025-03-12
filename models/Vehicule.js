const mongoose = require('mongoose');

const VehiculeSchema = new mongoose.Schema({
  id_client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  id_modele: { type: mongoose.Schema.Types.ObjectId, ref: 'Modele', required: true },
  id_marque: { type: mongoose.Schema.Types.ObjectId, ref: 'Marque', required: true },
  couleur: { type: String, required: true },
  immatriculation: { type: String, required: true, unique: true },
  annee: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Vehicule', VehiculeSchema);
