const modeleService = require('../services/modeleService');

// Créer un modèle
exports.createModele = async (req, res) => {
  try {
    const modele = await modeleService.createModele(req.body);
    res.status(201).json(modele);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lire tous les modèles
exports.getAllModeles = async (req, res) => {
  try {
    const modeles = await modeleService.getAllModeles();
    res.status(200).json(modeles);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Lire un modèle par son ID
exports.getModeleById = async (req, res) => {
  try {
    const modele = await modeleService.getModeleById(req.params.id);
    if (!modele) {
      return res.status(404).json({ message: 'Modèle non trouvé' });
    }
    res.status(200).json(modele);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour un modèle
exports.updateModele = async (req, res) => {
  try {
    const modele = await modeleService.updateModele(req.params.id, req.body);
    if (!modele) {
      return res.status(404).json({ message: 'Modèle non trouvé' });
    }
    res.status(200).json(modele);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Supprimer un modèle
exports.deleteModele = async (req, res) => {
  try {
    const modele = await modeleService.deleteModele(req.params.id);
    if (!modele) {
      return res.status(404).json({ message: 'Modèle non trouvé' });
    }
    res.status(200).json({ message: 'Modèle supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//liste des modèles d'une marque
exports.getModelesByMarque = async (req, res) => {
    try {
      const modeles = await modeleService.getModelesByMarque(req.params.marqueId);
      res.json(modeles);
    } catch (error) {
      res.status(500).json({ message: error.message });
    }
};
