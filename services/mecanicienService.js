const Mecanicien = require('../models/Mecanicien');

// Récupérer les mécaniciens dont l'inscription n'est pas validée (statut: false)
const getMecaniciensNonValides = async () => {
  try {
    const mecaniciensNonValides = await Mecanicien.find({ statut: false });
    return mecaniciensNonValides;
  } catch (error) {
    throw new Error("Erreur lors de la récupération des mécaniciens non validés: " + error.message);
  }
};

module.exports = {
  getMecaniciensNonValides
};
