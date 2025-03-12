const sousServiceService = require('../services/sousServiceService');
const SousService = require('../models/SousService');

exports.getAllSousServices = async (req, res) => {
  try {
    const sousServices = await sousServiceService.getAllSousServices();
    res.status(200).json(sousServices);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

exports.getSousServiceById = async (req, res) => {
  try {
    const sousService = await sousServiceService.getSousServiceById(req.params.id);
    if (!sousService) {
      return res.status(404).json({ message: 'Sous-service non trouvé' });
    }
    res.status(200).json(sousService);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

exports.createSousService = async (req, res) => {
  try {
    const newSousService = await sousServiceService.createSousService(req.body);
    res.status(201).json(newSousService);
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la création', error });
  }
};

exports.updateSousService = async (req, res) => {
  try {
    const updatedSousService = await sousServiceService.updateSousService(req.params.id, req.body);
    if (!updatedSousService) {
      return res.status(404).json({ message: 'Sous-service non trouvé' });
    }
    res.status(200).json(updatedSousService);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

exports.deleteSousService = async (req, res) => {
  try {
    const deletedSousService = await sousServiceService.deleteSousService(req.params.id);
    if (!deletedSousService) {
      return res.status(404).json({ message: 'Sous-service non trouvé' });
    }
    res.status(200).json({ message: 'Sous-service supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// Récupérer les sous-services d'un service spécifique
exports.getSousServicesByService = async (req, res) => {
  try {
      const { idService } = req.params; // Récupère l'ID du service depuis l'URL
      console.log("ID Service reçu :", idService); // Vérifie si l'ID est bien reçu
      
      const sousServices = await SousService.find({ id_service: idService });

      if (!sousServices.length) {
          return res.status(404).json({ message: "Aucun sous-service trouvé pour ce service." });
      }

      res.status(200).json(sousServices);
  } catch (error) {
      console.error("Erreur lors de la récupération des sous-services :", error);
      res.status(500).json({ message: "Erreur lors de la récupération des sous-services.", error: error.message });
  }
};