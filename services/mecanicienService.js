const Mecanicien = require('../models/Mecanicien');

const getMecaniciensNonValides = async (page = 1, limit = 10, search = "", sortOrder = "asc") => {
  try {
    // Calculer le nombre d'éléments à ignorer (skip) basé sur la page
    const skip = (page - 1) * limit;

    // Filtre de recherche : Recherche par nom et prénom
    const searchFilter = search
      ? {
          $or: [
            { nom: { $regex: search, $options: 'i' } }, // Recherche dans le nom
            { prenom: { $regex: search, $options: 'i' } } // Recherche dans le prénom
          ],
          statut: false // On ne cherche que les mécaniciens non validés
        }
      : { statut: false }; // Si aucune recherche, on filtre simplement par statut

    // Tri par date de naissance : croissant ou décroissant
    const sort = sortOrder === "asc" ? { date_inscription: 1 } : { date_inscription: -1 };

    // Récupérer les mécaniciens non validés avec filtre de recherche, tri et pagination
    const mecaniciens = await Mecanicien.find(searchFilter)
      .skip(skip)
      .limit(limit)
      .sort(sort);

    // Vérifier si des mécaniciens sont trouvés
    if (mecaniciens.length === 0) {
      return { success: true, message: "Aucun mécanicien en attente de validation.", data: [], page, limit };
    }

    // Compter le nombre total de mécaniciens non validés pour la pagination
    const totalMecaniciens = await Mecanicien.countDocuments(searchFilter);

    // Retourner les mécaniciens avec des informations de pagination
    return {
      success: true,
      message: "Mécaniciens en attente de validation.",
      data: mecaniciens,
      total: totalMecaniciens,
      page,
      limit,
      totalPages: Math.ceil(totalMecaniciens / limit) // Calcul du nombre total de pages
    };
  } catch (error) {
    console.error("Erreur dans la récupération des mécaniciens non validés:", error);
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

const getMecaniciens = async (search = "") => {
  try {
    // Filtre de recherche : Recherche par nom et prénom
    const searchFilter = search
      ? {
          $or: [
            { nom: { $regex: search, $options: 'i' } }, // Recherche dans le nom
            { prenom: { $regex: search, $options: 'i' } } // Recherche dans le prénom
          ],
          statut: true // On ne cherche que les mécaniciens validés
        }
      : { statut: true }; // Si aucune recherche, on filtre simplement par statut

    // Récupérer les mécaniciens validés avec le filtre de recherche
    const mecaniciens = await Mecanicien.find(searchFilter);

    // Vérifier si des mécaniciens sont trouvés
    if (mecaniciens.length === 0) {
      return { success: true, message: "Aucun mécanicien trouvé.", data: [] };
    }

    return {
      success: true,
      message: "Mécaniciens trouvés.",
      data: mecaniciens
    };
  } catch (error) {
    console.error("Erreur dans la récupération des mécaniciens validés:", error);
    throw new Error("Erreur lors de la récupération des mécaniciens validés: " + error.message);
  }
};

module.exports = {
  getMecaniciensNonValides,
  validateMecanicien,
  getMecaniciens
};
