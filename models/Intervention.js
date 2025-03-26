const mongoose = require('mongoose');

const InterventionSchema = new mongoose.Schema({
  id_rdv: { type: mongoose.Schema.Types.ObjectId, ref: 'RendezVous', required: true },
  id_vehicule: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicule', required: true },
  id_mecanicien: { type: mongoose.Schema.Types.ObjectId, ref: 'Mecanicien', required: true },
  date_intervention: { type: Date, required: true },
  duree_reparation: { type: Number, required: true }, // En heures
  date_fin_intervention: { type: Date, required: true }, // Ajout du champ
  avancement: { type: String, enum: ['Planifié', 'Début', 'En cours', 'Terminé'], default: 'Planifié' }
}, { timestamps: true });

module.exports = mongoose.model('Intervention', InterventionSchema);
