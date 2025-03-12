const mongoose = require('mongoose');

const ClientSchema = new mongoose.Schema({
  nom: { type: String, required: true },
  prenom: { type: String, required: true },
  date_naissance: { type: Date, required: true },
  genre: { type: String, enum: ['Homme', 'Femme'], required: true },
  contact: { type: String, required: true },
  adresse: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  mdp: { type: String, required: true },
  date_inscription: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('Client', ClientSchema);
