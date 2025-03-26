const serviceService = require('../services/serviceService');
const { cloudinary, uploadServiceImage } = require('../config/cloudinaryConfig'); // Importer la configuration de Cloudinary
const Service = require('../models/Service');
const SousService = require('../models/SousService');

// Middleware pour gérer l'upload de l'image avec Cloudinary
exports.uploadImage = uploadServiceImage;  // Corrige l'import ici // Middleware pour gérer l'upload

exports.getAllServices = async (req, res) => {
  try {
    const services = await serviceService.getAllServices();
    res.status(200).json(services);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

exports.getServiceById = async (req, res) => {
  try {
    const service = await serviceService.getServiceById(req.params.id);
    if (!service) {
      return res.status(404).json({ message: 'Service non trouvé' });
    }
    res.status(200).json(service);
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

exports.createService = async (req, res) => {
  try {
    const { nom_service, description } = req.body;

    // Vérifie si l'image a été téléchargée
    if (!req.file) {
      return res.status(400).json({ message: "Aucune image n'a été téléchargée" });
    }

    // Upload de l'image sur Cloudinary
    cloudinary.uploader.upload(req.file.path, async (error, result) => {
      if (error) {
        return res.status(500).json({ message: 'Erreur lors de l\'upload de l\'image', error });
      }

      // Récupérer l'URL de l'image stockée sur Cloudinary
      const imageUrl = result.secure_url;

      // Créer un nouveau service avec l'URL de l'image
      const newService = await serviceService.createService({ nom_service, description, imageUrl });
      res.status(201).json(newService);
    });
  } catch (error) {
    res.status(400).json({ message: 'Erreur lors de la création du service', error });
  }
};

// Mettre à jour un service (avec image optionnelle)
exports.updateService = async (req, res) => {
  try {
    const { nom_service, description } = req.body;

    // Vérifier si une nouvelle image a été uploadée
    let imageUrl = req.file ? req.file.secure_url : undefined;  // Utiliser l'URL générée par Cloudinary

    // Préparer les données à mettre à jour
    const updateData = { nom_service, description };

    if (imageUrl) {
      updateData.imageUrl = imageUrl;  // Mettre à jour l'image avec l'URL de Cloudinary
    }

    // Mettre à jour le service dans la base de données
    const updatedService = await serviceService.updateService(req.params.id, updateData);

    if (!updatedService) {
      return res.status(404).json({ message: 'Service non trouvé' });
    }

    // Retourner le service mis à jour
    res.status(200).json(updatedService);

  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};


exports.deleteService = async (req, res) => {
  try {
    const deletedService = await serviceService.deleteService(req.params.id);
    if (!deletedService) {
      return res.status(404).json({ message: 'Service non trouvé' });
    }
    res.status(200).json({ message: 'Service supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: 'Erreur serveur', error });
  }
};

// liste des sous-service par service avec details de service et de ses sous-services
exports.getServiceWithSousServices = async (req, res) => {
  try {
      const { id } = req.params; // Récupérer l'ID du service depuis l'URL

      // Vérifier si le service existe
      const service = await Service.findById(id);
      if (!service) {
          return res.status(404).json({ message: "Service non trouvé." });
      }

      // Récupérer les sous-services liés à ce service
      const sousServices = await SousService.find({ id_service: id });

      // Retourner le service avec ses sous-services
      res.status(200).json({
          service,
          sousServices
      });
  } catch (error) {
      res.status(500).json({
          message: "Erreur lors de la récupération du service et de ses sous-services.",
          error: error.message
      });
  }
};