const mongoose = require('mongoose');

const DeadlineSchema = new mongoose.Schema({
  deadline_rdv: { type: Number, required: true }, // durée limite pour confirmer un rendez-vous
  deadline_resa: { type: Number, required: true } // durée limite pour confirmer une réservation
}, { timestamps: true });

module.exports = mongoose.model('Deadline', DeadlineSchema);
