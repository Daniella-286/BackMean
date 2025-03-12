const mongoose = require('mongoose');

const ManagerSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  mdp: { type: String, required: true }
}, { timestamps: true });

module.exports = mongoose.model('Manager', ManagerSchema);
