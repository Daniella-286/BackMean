const mongoose = require('mongoose');

const DevisPieceSchema = new mongoose.Schema({
  id_demande: { type: mongoose.Schema.Types.ObjectId, ref: 'DemandeDevis', required: true },
  id_sous_service: { type: mongoose.Schema.Types.ObjectId, ref: 'SousService', required: true },
  id_piece: { type: mongoose.Schema.Types.ObjectId, ref: 'Piece', required: true },
  quantite: { type: Number, required: true },
  prix_unitaire: { type: Number, required: true } // Dénormalisation du prix unitaire de la pièce
}, { timestamps: true });

module.exports = mongoose.model('DevisPiece', DevisPieceSchema);
