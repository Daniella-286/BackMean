const deadlineService = require('../services/deadlineService');

const createDeadline = async (req, res) => {
  try {
    const deadline = await deadlineService.addDeadline(req.body);
    res.status(201).json(deadline);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllDeadlines = async (req, res) => {
  try {
    const deadlines = await deadlineService.getAllDeadlines();
    res.status(200).json(deadlines);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getDeadlineById = async (req, res) => {
  try {
    const deadline = await deadlineService.getDeadlineById(req.params.id);
    if (!deadline) return res.status(404).json({ message: 'Deadline non trouvé' });
    res.status(200).json(deadline);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateDeadline = async (req, res) => {
  try {
    const updatedDeadline = await deadlineService.updateDeadline(req.params.id, req.body);
    if (!updatedDeadline) return res.status(404).json({ message: 'Deadline non trouvé' });
    res.status(200).json(updatedDeadline);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteDeadline = async (req, res) => {
  try {
    await deadlineService.deleteDeadline(req.params.id);
    res.status(200).json({ message: 'Deadline supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createDeadline, getAllDeadlines, getDeadlineById, updateDeadline, deleteDeadline };
