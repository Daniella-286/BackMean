const mongoose = require('mongoose');

const ReservationParkingSchema = new mongoose.Schema({
  id_parking: { type: mongoose.Schema.Types.ObjectId, ref: 'Parking', required: true },
  id_vehicule: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicule', required: true },
  date_reservation: { type: Date, default: Date.now },
  date_debut: { type: Date, required: true },
  date_fin: { type: Date, required: true },
  tarif: { type: Number, required: true }, // Dénormalisation du tarif du parking
  statut: { type: String, enum: ['réservé', 'annulé', 'expiré'], default: 'réservé' }
}, { timestamps: true });

module.exports = mongoose.model('ReservationParking', ReservationParkingSchema);
