const mongoose = require('mongoose');

const DeadlineSchema = new mongoose.Schema({
  deadline_rdv: { type: Number, required: true }, // durée limite en jours pour confirmer un rendez-vous
  deadline_resa: { type: Number, required: true } // durée limite en jours pour confirmer une réservation
}, { timestamps: true });

// Vérifier si le modèle existe déjà avant de le compiler
module.exports = mongoose.models.Deadline || mongoose.model('Deadline', DeadlineSchema);
