const mongoose = require('mongoose');

const MecanicienSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  id_competence: { type: mongoose.Schema.Types.ObjectId, ref: 'Competence', required: true },
  id_service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  date_naissance: { type: Date, required: true },
  genre: { type: String, required: true },
  contact: { type: String, required: true },
  adresse: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mdp: { type: String, required: true },
  date_inscription: { type: Date, default: Date.now },
  statut: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('Mecanicien', MecanicienSchema);
