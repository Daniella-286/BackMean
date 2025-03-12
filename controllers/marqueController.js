const marqueService = require('../services/marqueService');

// Créer une marque
exports.createMarque = async (req, res) => {
  try {
    const marque = await marqueService.createMarque(req.body);
    res.status(201).json(marque);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lire toutes les marques
exports.getAllMarques = async (req, res) => {
  try {
    const marques = await marqueService.getAllMarques();
    res.status(200).json(marques);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lire une marque par son ID
exports.getMarqueById = async (req, res) => {
  try {
    const marque = await marqueService.getMarqueById(req.params.id);
    if (!marque) {
      return res.status(404).json({ message: 'Marque non trouvée' });
    }
    res.status(200).json(marque);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour une marque
exports.updateMarque = async (req, res) => {
  try {
    const marque = await marqueService.updateMarque(req.params.id, req.body);
    if (!marque) {
      return res.status(404).json({ message: 'Marque non trouvée' });
    }
    res.status(200).json(marque);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Supprimer une marque
exports.deleteMarque = async (req, res) => {
  try {
    const marque = await marqueService.deleteMarque(req.params.id);
    if (!marque) {
      return res.status(404).json({ message: 'Marque non trouvée' });
    }
    res.status(200).json({ message: 'Marque supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
