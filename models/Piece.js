const mongoose = require('mongoose');

const PieceSchema = new mongoose.Schema({
  nom_piece: { type: String, required: true },
  prix_unitaire: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Piece', PieceSchema);
