const Vehicule = require('../models/Vehicule');

// Ajouter un véhicule
const ajouterVehicule = async (req, res) => {
  try {
      // Récupérer l'ID du client depuis le token
      const id_client = req.user.id; 

      const { id_modele, id_marque, couleur, immatriculation, annee } = req.body;

      if (!id_modele || !id_marque || !couleur || !immatriculation || !annee) {
          return res.status(400).json({ message: "Tous les champs sont obligatoires." });
      }

      // Création du véhicule avec l'ID du client extrait du token
      const vehicule = new Vehicule({ id_client, id_modele, id_marque, couleur, immatriculation, annee });
      await vehicule.save();

      res.status(201).json({ message: "Véhicule ajouté avec succès", vehicule });
  } catch (error) {
      res.status(500).json({ message: "Erreur serveur", error: error.message });
  }
};

module.exports = { ajouterVehicule };  
