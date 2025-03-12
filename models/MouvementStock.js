const mongoose = require('mongoose');

const MouvementStockSchema = new mongoose.Schema({
  id_piece: { type: mongoose.Schema.Types.ObjectId, ref: 'Piece', required: true },
  id_type_mouvement: { type: mongoose.Schema.Types.ObjectId, ref: 'TypeMouvement', required: true },
  quantite: { type: Number, required: true },
  date_mouvement: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('MouvementStock', MouvementStockSchema);
