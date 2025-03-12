const mongoose = require('mongoose');

const DemandeDevisDetailSchema = new mongoose.Schema({
  id_demande: { type: mongoose.Schema.Types.ObjectId, ref: 'DemandeDevis', required: true },
  id_sous_service: { type: mongoose.Schema.Types.ObjectId, ref: 'SousService', required: true }
}, { timestamps: true });

module.exports = mongoose.model('DemandeDevisDetail', DemandeDevisDetailSchema);
