const mongoose = require('mongoose');

const FactureParkingSchema = new mongoose.Schema({
  id_reservation: { type: mongoose.Schema.Types.ObjectId, ref: 'ReservationParking', required: true },
  id_client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true }, // Ajout de l'ID du client
  numero_facture: { type: String, unique: true, required: true },  // Numéro unique de facture
  date_facture: { type: Date, default: Date.now },
  duree_parking: { type: Number, required: true },
  tarif_heure: { type: Number, required: true },
  total: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('FactureParking', FactureParkingSchema);
