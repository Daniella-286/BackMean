const mongoose = require('mongoose');

const DemandeDevisSchema = new mongoose.Schema({
  id_vehicule: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicule', required: true },
  id_service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  id_client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },  // Ajout de l'id_client
  date_demande: { type: Date, default: Date.now },
  probleme: { type: String, required: true },
  statut: { type: String, enum: ['En attente', 'Envoyé'], default: 'En attente' }
}, { timestamps: true });

module.exports = mongoose.model('DemandeDevis', DemandeDevisSchema);
