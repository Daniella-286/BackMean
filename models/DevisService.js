const mongoose = require('mongoose');

const DevisServiceSchema = new mongoose.Schema({
  id_demande: { type: mongoose.Schema.Types.ObjectId, ref: 'DemandeDevis', required: true },
  id_sous_service: { type: mongoose.Schema.Types.ObjectId, ref: 'SousService', required: true },
  tarif: { type: Number, required: true } // Dénormalisation du tarif du service à une date précise
}, { timestamps: true });

module.exports = mongoose.model('DevisService', DevisServiceSchema);
