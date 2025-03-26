const mongoose = require('mongoose');

const PieceSousServiceSchema = new mongoose.Schema({
  id_sous_service: { type: mongoose.Schema.Types.ObjectId, ref: 'SousService', required: true },
  id_piece: { type: mongoose.Schema.Types.ObjectId, ref: 'Piece', required: true },
  quantite: { type: Number , required: true },
}, { timestamps: true });

module.exports = mongoose.model('PieceSousService', PieceSousServiceSchema);
