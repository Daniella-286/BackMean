const { ajouterVehicule , listerVehiculesParClient , updateVehicule , supprimerVehicule } = require('../services/vehiculeService');

// Contrôleur pour ajouter un véhicule
const ajouterVehiculeController = async (req, res) => {
  try {
    const id_client = req.user.id;

    const vehicule = await ajouterVehicule(id_client, req.body);
    res.status(201).json({ message: "Véhicule ajouté avec succès", vehicule });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Contrôleur pour lister les véhicules d'un client
const listerVehiculesController = async (req, res) => {
  try {
    const id_client = req.user.id;
    
    // Récupérer les paramètres de requête pour la pagination et la recherche
    const { page = 1, limit = 3, search = "" } = req.query;

    // Appeler le service pour récupérer les véhicules
    const vehicules = await listerVehiculesParClient(id_client, parseInt(page), parseInt(limit), search);

    if (vehicules.length === 0) {
      return res.status(404).json({ message: 'Aucun véhicule trouvé pour ce client.' });
    }

    res.status(200).json(vehicules);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


const updateVehiculeController = async (req, res) => {
  try {
    const { id } = req.params;
    const updatedVehicule = await updateVehicule(id, req.body);
    
    if (!updatedVehicule) {
      return res.status(404).json({ message: 'Véhicule non trouvé' });
    }

    res.status(200).json(updatedVehicule);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const supprimerVehiculeController = async (req, res) => {
  try {
    const { id } = req.params; // Récupérer l'ID du véhicule dans les paramètres de la requête
    
    // Appeler le service pour supprimer le véhicule
    const vehiculeSupprime = await supprimerVehicule(id);
    
    res.status(200).json({ message: "Véhicule supprimé avec succès", vehicule: vehiculeSupprime });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  ajouterVehiculeController,
  listerVehiculesController,
  updateVehiculeController,
  supprimerVehiculeController
};