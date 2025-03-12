const Modele = require('../models/Modele');

const getAllModeles = async () => {
  return await Modele.find().populate('marque', 'nom_marque');
};

const getModelesByMarque = async (marqueId) => {
  return await Modele.find({ marque: marqueId }).populate('marque', 'nom_marque');
};

const getModeleById = async (id) => {
  return await Modele.findById(id).populate('marque', 'nom_marque');
};

const createModele = async (data) => {
  const newModele = new Modele(data);
  return await newModele.save();
};

const updateModele = async (id, data) => {
  return await Modele.findByIdAndUpdate(id, data, { new: true }).populate('marque', 'nom_marque');
};

const deleteModele = async (id) => {
  return await Modele.findByIdAndDelete(id);
};

module.exports = { getAllModeles, getModelesByMarque, getModeleById, createModele, updateModele, deleteModele };
