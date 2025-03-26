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

const listerVehiculesParClient = async (id_client) => {
    try {
      // Récupérer les véhicules avec les informations du modèle et de la marque
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

module.exports = { ajouterVehicule , listerVehiculesParClient , updateVehicule };


