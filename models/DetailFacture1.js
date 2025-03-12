const mongoose = require('mongoose');

const DetailFacture1Schema = new mongoose.Schema({
  id_facture: { type: mongoose.Schema.Types.ObjectId, ref: 'Facture', required: true },
  id_sous_service: { type: mongoose.Schema.Types.ObjectId, ref: 'SousService', required: true },
  tarif: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('DetailFacture1', DetailFacture1Schema);
