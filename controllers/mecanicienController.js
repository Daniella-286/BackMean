const { getMecaniciensNonValides, validateMecanicien } = require('../services/mecanicienService');

// Liste des mécaniciens non validés
const getMecaniciensNonValidesController = async (req, res) => {
  try {
    const result = await getMecaniciensNonValides();
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// Validation d'un mécanicien par le manager
const validateMecanicienController = async (req, res) => {
  try {
    const { id_service } = req.body;
    if (!id_service) {
      return res.status(400).json({ message: "L'ID du service est requis pour valider le mécanicien." });
    }

    const result = await validateMecanicien(req.params.id, id_service);
    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  getMecaniciensNonValidesController,
  validateMecanicienController
};
