const mongoose = require('mongoose');

const DevisImageSchema = new mongoose.Schema({
  id_demande: { type: mongoose.Schema.Types.ObjectId, ref: 'DemandeDevis', required: true },
  id_manager: { type: mongoose.Schema.Types.ObjectId, ref: 'Manager', required: true }
}, { timestamps: true });

module.exports = mongoose.model('DevisImage', DevisImageSchema);
