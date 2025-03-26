const mongoose = require('mongoose');

const devisImageSchema = new mongoose.Schema({
  id_demande: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'DemandeDevis',
    required: true,
  },
  url: {
    type: String,
    required: true,
  }
}, { timestamps: true });

module.exports = mongoose.model('DevisImage', devisImageSchema);
