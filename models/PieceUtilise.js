const mongoose = require('mongoose');

const PieceUtiliseSchema = new mongoose.Schema({
  id_intervention: { type: mongoose.Schema.Types.ObjectId, ref: 'Intervention', required: true },
  id_piece: { type: mongoose.Schema.Types.ObjectId, ref: 'Piece', required: true },
  quantite: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('PieceUtilise', PieceUtiliseSchema);
