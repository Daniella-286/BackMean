const { getMecaniciensNonValides } = require('../services/mecanicienService');

// Récupérer les mécaniciens dont l'inscription n'est pas validée (statut: false)
const getMecaniciensNonValidesController = async (req, res) => {
  try {
    const mecaniciens = await getMecaniciensNonValides();
    res.status(200).json(mecaniciens);
  } catch (error) {
    res.status(500).json({ message: "Erreur lors de la récupération des mécaniciens non validés", error });
  }
};

module.exports = {
  getMecaniciensNonValidesController
};
