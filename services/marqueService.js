const Marque = require('../models/Marque');

// Créer une marque
exports.createMarque = async (data) => {
  const marque = new Marque(data);
  return await marque.save();
};

// Lire toutes les marques
exports.getAllMarques = async () => {
  return await Marque.find();
};

// Lire une marque par son ID
exports.getMarqueById = async (id) => {
  return await Marque.findById(id);
};

// Mettre à jour une marque
exports.updateMarque = async (id, data) => {
  return await Marque.findByIdAndUpdate(id, data, { new: true });
};

// Supprimer une marque
exports.deleteMarque = async (id) => {
  return await Marque.findByIdAndDelete(id);
};
