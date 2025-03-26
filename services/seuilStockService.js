const SeuilStock = require('../models/Seuilstock');

// Ajouter un seuil de stock
const addSeuilStock = async (data) => {
  return await SeuilStock.create(data);
};

// Récupérer tous les seuils de stock
const getAllSeuilStocks = async () => {
  return await SeuilStock.find();
};

// Récupérer un seuil de stock par ID
const getSeuilStockById = async (id) => {
  return await SeuilStock.findById(id);
};

// Mettre à jour un seuil de stock
const updateSeuilStock = async (id, data) => {
  return await SeuilStock.findByIdAndUpdate(id, data, { new: true });
};

// Supprimer un seuil de stock
const deleteSeuilStock = async (id) => {
  return await SeuilStock.findByIdAndDelete(id);
};

module.exports = { addSeuilStock, getAllSeuilStocks, getSeuilStockById, updateSeuilStock, deleteSeuilStock };
