const mongoose = require('mongoose');

const PaiementServiceSchema = new mongoose.Schema({
  id_facture: { type: mongoose.Schema.Types.ObjectId, ref: 'Facture', required: true },
  montant: { type: Number, required: true },
  date_paiement: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('PaiementService', PaiementServiceSchema);
