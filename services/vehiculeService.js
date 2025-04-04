const Vehicule = require('../models/Vehicule');

// Service pour ajouter un véhicule
const ajouterVehicule = async (id_client, vehiculeData) => {
  try {
    const { id_modele, id_marque, couleur, immatriculation, annee } = vehiculeData;

    if (!id_modele || !id_marque || !couleur || !immatriculation || !annee) {
      throw new Error("Tous les champs sont obligatoires.");
    }

    // Création du véhicule avec l'ID du client
    const vehicule = new Vehicule({ id_client, id_modele, id_marque, couleur, immatriculation, annee });
    await vehicule.save();

    return vehicule;
  } catch (error) {
    throw new Error(error.message);
  }
};

const listerVehiculesParClient = async (id_client, page = 1, limit = 10, search = "") => {
  try {
    // Calculer le nombre d'éléments à ignorer (skip) basé sur la page
    const skip = (page - 1) * limit;

    // Filtre de recherche : recherche par immatriculation
    const searchFilter = search
      ? { id_client, immatriculation: { $regex: search, $options: 'i' } } // Recherche par immatriculation
      : { id_client }; // Si aucune recherche, on récupère tous les véhicules du client

    // Récupérer le nombre total de véhicules correspondant au filtre
    const totalVehicules = await Vehicule.countDocuments(searchFilter);

    // Récupérer les véhicules avec les informations du modèle et de la marque, avec pagination
    const vehicules = await Vehicule.find(searchFilter)
      .skip(skip)
      .limit(limit)
      .populate('id_modele', 'nom_modele') // Populate pour récupérer le nom du modèle
      .populate('id_marque', 'nom_marque') // Populate pour récupérer le nom de la marque
      .exec();

    // Calculer le nombre total de pages
    const totalPages = Math.ceil(totalVehicules / limit);

    return {
      vehicules,
      totalVehicules,
      totalPages,
      page,
      limit
    };
  } catch (error) {
    throw new Error('Erreur lors de la récupération des véhicules : ' + error.message);
  }
};


const listerVehiculesParClientSansPagination = async (id_client) => {
  try {
    // Récupérer tous les véhicules du client
    const vehicules = await Vehicule.find({ id_client })
      .populate('id_modele', 'nom_modele') // Populate pour récupérer le nom du modèle
      .populate('id_marque', 'nom_marque') // Populate pour récupérer le nom de la marque
      .exec();

    return vehicules;
  } catch (error) {
    throw new Error('Erreur lors de la récupération des véhicules : ' + error.message);
  }
};



// Mettre à jour un véhicule par son ID
const updateVehicule = async (id, data) => {
  try {
    const vehicule = await Vehicule.findByIdAndUpdate(id, data, { new: true, runValidators: true });
    return vehicule;
  } catch (error) {
    throw new Error('Erreur lors de la mise à jour du véhicule: ' + error.message);
  }
};

// Supprimer un véhicule par son ID
const supprimerVehicule = async (id) => {
  try {
    // Trouver et supprimer le véhicule par son ID
    const vehicule = await Vehicule.findByIdAndDelete(id);
    if (!vehicule) {
      throw new Error("Véhicule non trouvé");
    }
    return vehicule;
  } catch (error) {
    throw new Error('Erreur lors de la suppression du véhicule: ' + error.message);
  }
};

module.exports = { ajouterVehicule , listerVehiculesParClient , updateVehicule , supprimerVehicule , listerVehiculesParClientSansPagination};


