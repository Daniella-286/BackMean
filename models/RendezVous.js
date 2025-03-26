const mongoose = require('mongoose');

const RendezVousSchema = new mongoose.Schema({
  id_demande: { type: mongoose.Schema.Types.ObjectId, ref: 'DemandeDevis', required: true },
  id_client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  date_prise_rendez_vous: { type: Date, default: Date.now }, // Date à laquelle le client a pris RDV
  date_rendez_vous: { type: Date, required: true },
  date_confirmation: { type: Date },
  date_limite_confirmation: { type: Date, required: true }, // Calculée en fonction du délai
  statut: { type: String, enum: ['En attente' , 'Validé' , 'Non disponible' , 'Confirmé', 'Annulé'], default: 'En attente' }
}, { timestamps: true });

module.exports = mongoose.model('RendezVous', RendezVousSchema);
