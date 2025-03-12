const mongoose = require('mongoose');

const DetailFacture2Schema = new mongoose.Schema({
  id_facture: { type: mongoose.Schema.Types.ObjectId, ref: 'Facture', required: true },
  id_piece: { type: mongoose.Schema.Types.ObjectId, ref: 'Piece', required: true },
  prix_unitaire: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('DetailFacture2', DetailFacture2Schema);
