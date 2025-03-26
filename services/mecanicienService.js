const Mecanicien = require('../models/Mecanicien');

const getMecaniciensNonValides = async () => {
  try {
    const mecaniciens = await Mecanicien.find({ statut: false });

    if (mecaniciens.length === 0) {
      return { message: "Aucun mécanicien en attente de validation.", data: [] };
    }

    return { message: "Mécaniciens en attente de validation.", data: mecaniciens };
  } catch (error) {
    throw new Error("Erreur lors de la récupération des mécaniciens non validés: " + error.message);
  }
};

const validateMecanicien = async (idMecanicien, id_service) => {
  try {
    const mecanicien = await Mecanicien.findById(idMecanicien);
    if (!mecanicien) {
      throw new Error('Mécanicien non trouvé');
    }

    // Mettre à jour le statut et lui attribuer un service
    mecanicien.statut = true;
    mecanicien.id_service = id_service;
    await mecanicien.save();

    return { message: 'Mécanicien validé avec succès', mecanicien };
  } catch (error) {
    throw new Error("Erreur lors de la validation du mécanicien: " + error.message);
  }
};

module.exports = {
  getMecaniciensNonValides,
  validateMecanicien
};
