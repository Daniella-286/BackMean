const mongoose = require('mongoose');

const DemandeDevisSchema = new mongoose.Schema({
  id_vehicule: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicule', required: true },
  id_service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  date_demande: { type: Date, default: Date.now },
  probleme: { type: String, required: true },
  statut: { type: String, enum: ['En attente', 'Accepté', 'Refusé'], default: 'En attente' }
}, { timestamps: true });

module.exports = mongoose.model('DemandeDevis', DemandeDevisSchema);
