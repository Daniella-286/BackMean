const mongoose = require('mongoose');

const CompetenceSchema = new mongoose.Schema({
  nom_competence: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Competence', CompetenceSchema);
