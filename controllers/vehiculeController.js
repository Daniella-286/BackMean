const { ajouterVehicule , listerVehiculesParClient , updateVehicule } = require('../services/vehiculeService');

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
    const vehicules = await listerVehiculesParClient(id_client);

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

module.exports = {
  ajouterVehiculeController,
  listerVehiculesController,
  updateVehiculeController
};