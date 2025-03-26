const mongoose = require('mongoose');

const ReservationParkingSchema = new mongoose.Schema({
  id_parking: { type: mongoose.Schema.Types.ObjectId, ref: 'Parking', required: true },
  id_client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  id_vehicule: { type: mongoose.Schema.Types.ObjectId, ref: 'Vehicule', required: true },
  date_reservation: { type: Date, default: Date.now },
  date_debut: { type: Date, required: true },
  date_fin: { type: Date, required: true },
  tarif: { type: Number}, 
  statut: { type: String, enum: ['En attente', 'Confirmé', 'Validé', 'Annulé'], default: 'En attente' },
  date_limite_confirmation: { type: Date}, 
  date_validation: { type: Date } 
}, { timestamps: true });

module.exports = mongoose.model('ReservationParking', ReservationParkingSchema);
