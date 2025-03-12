const mongoose = require('mongoose');

const ParkingSchema = new mongoose.Schema({
  numero: { type: String, required: true },
  tarif: { type: Number, required: true },
  statut: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Parking', ParkingSchema);
