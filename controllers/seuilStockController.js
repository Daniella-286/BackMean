const seuilStockService = require('../services/seuilStockService');

const createSeuilStock = async (req, res) => {
  try {
    const seuilStock = await seuilStockService.addSeuilStock(req.body);
    res.status(201).json(seuilStock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllSeuilStocks = async (req, res) => {
  try {
    const seuilStocks = await seuilStockService.getAllSeuilStocks();
    res.status(200).json(seuilStocks);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getSeuilStockById = async (req, res) => {
  try {
    const seuilStock = await seuilStockService.getSeuilStockById(req.params.id);
    if (!seuilStock) return res.status(404).json({ message: 'Seuil de stock non trouvé' });
    res.status(200).json(seuilStock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateSeuilStock = async (req, res) => {
  try {
    const updatedSeuilStock = await seuilStockService.updateSeuilStock(req.params.id, req.body);
    if (!updatedSeuilStock) return res.status(404).json({ message: 'Seuil de stock non trouvé' });
    res.status(200).json(updatedSeuilStock);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteSeuilStock = async (req, res) => {
  try {
    await seuilStockService.deleteSeuilStock(req.params.id);
    res.status(200).json({ message: 'Seuil de stock supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createSeuilStock, getAllSeuilStocks, getSeuilStockById, updateSeuilStock, deleteSeuilStock };
