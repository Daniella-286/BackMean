const mongoose = require('mongoose');

const InterventionSchema = new mongoose.Schema({
  id_rdv: { type: mongoose.Schema.Types.ObjectId, ref: 'RendezVous', required: true },
  id_vehicule: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicule', required: true },
  id_mecanicien: { type: mongoose.Schema.Types.ObjectId, ref: 'Mecanicien', required: true },
  date_intervention: { type: Date, required: true },
  duree_reparation: { type: Number, required: true },
  avancement: { type: Number, enum: [1, 5, 10], default: 1 } // 1=Début, 5=En cours, 10=Terminé
}, { timestamps: true });

module.exports = mongoose.model('Intervention', InterventionSchema);
