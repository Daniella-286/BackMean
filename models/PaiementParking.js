const mongoose = require('mongoose');

const PaiementParkingSchema = new mongoose.Schema({
  id_facture: { type: mongoose.Schema.Types.ObjectId, ref: 'FactureParking', required: true },  // Remplacement de id_reservation par id_facture
  montant: { type: Number, required: true },
  date_paiement: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('PaiementParking', PaiementParkingSchema);
