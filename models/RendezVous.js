const mongoose = require('mongoose');

const RendezVousSchema = new mongoose.Schema({
  id_demande: { type: mongoose.Schema.Types.ObjectId, ref: 'DemandeDevis', required: true },
  date_rendez_vous: { type: Date, required: true },
  statut: { type: String, enum: ['confirmé', 'annulé', 'en attente'], default: 'en attente' }
}, { timestamps: true });

module.exports = mongoose.model('RendezVous', RendezVousSchema);
