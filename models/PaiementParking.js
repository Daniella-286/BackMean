const mongoose = require('mongoose');

const PaiementParkingSchema = new mongoose.Schema({
  id_reservation: { type: mongoose.Schema.Types.ObjectId, ref: 'ReservationParking', required: true },
  montant: { type: Number, required: true },
  date_paiement: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model('PaiementParking', PaiementParkingSchema);
