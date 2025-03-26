const Deadline = require('../models/deadline');

// Ajouter un deadline
const addDeadline = async (data) => {
  return await Deadline.create(data);
};

// Récupérer tous les deadlines
const getAllDeadlines = async () => {
  return await Deadline.find();
};

// Récupérer un deadline par ID
const getDeadlineById = async (id) => {
  return await Deadline.findById(id);
};

// Mettre à jour un deadline
const updateDeadline = async (id, data) => {
  return await Deadline.findByIdAndUpdate(id, data, { new: true });
};

// Supprimer un deadline
const deleteDeadline = async (id) => {
  return await Deadline.findByIdAndDelete(id);
};

module.exports = { addDeadline, getAllDeadlines, getDeadlineById, updateDeadline, deleteDeadline };
