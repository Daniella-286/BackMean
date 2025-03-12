const mongoose = require('mongoose');

const FactureSchema = new mongoose.Schema({
  id_client: { type: mongoose.Schema.Types.ObjectId, ref: 'Client', required: true },
  id_intervention: { type: mongoose.Schema.Types.ObjectId, ref: 'Intervention', required: true },
  date_facture: { type: Date, default: Date.now },
  total: { type: Number, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Facture', FactureSchema);
