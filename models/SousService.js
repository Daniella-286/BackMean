const mongoose = require('mongoose');

const SousServiceSchema = new mongoose.Schema({
  id_service: { type: mongoose.Schema.Types.ObjectId, ref: 'Service', required: true },
  nom_sous_service: { type: String, required: true },
  tarif: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('SousService', SousServiceSchema);
