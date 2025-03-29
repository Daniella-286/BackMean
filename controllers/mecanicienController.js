const { getMecaniciensNonValides, validateMecanicien , getMecaniciens } = require('../services/mecanicienService');

// Liste des mécaniciens non validés
const getMecaniciensNonValidesController = async (req, res) => {
  try {
    // Récupérer les paramètres de pagination et recherche de la requête (avec valeurs par défaut)
    const { page = 1, limit = 10, search = "", sortOrder = "asc" } = req.query;

    // Appeler le service pour récupérer les mécaniciens non validés avec recherche et tri
    const result = await getMecaniciensNonValides(page, limit, search, sortOrder);

    // Vérifier si l'opération a réussi et envoyer la réponse appropriée
    return res.status(200).json(result);
  } catch (error) {
    // En cas d'erreur, envoyer une réponse avec le message d'erreur
    console.error("Erreur dans getMecaniciensNonValidesController:", error);
    return res.status(500).json({ success: false, message: error.message });
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

const getMecaniciensController = async (req, res) => {
  try {
    const { search = "" } = req.query;

    const result = await getMecaniciens(search);

    if (!result.success) {
      return res.status(404).json({ success: false, message: result.message });
    }

    return res.status(200).json({
      success: true,
      message: result.message,
      data: result.data
    });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getMecaniciensNonValidesController,
  validateMecanicienController,
  getMecaniciensController
};
