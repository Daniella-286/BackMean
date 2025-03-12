const mongoose = require('mongoose');

const TypeMouvementSchema = new mongoose.Schema({
  nom_type: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('TypeMouvement', TypeMouvementSchema);
