const express = require('express');
const router = express.Router();
const { listerVehiculesController , ajouterVehiculeController , updateVehiculeController , supprimerVehiculeController } = require('../controllers/vehiculeController'); // IMPORTATION CORRECTE
const verifyToken = require('../middleware/authMiddleware'); 

// Route protégée pour ajouter un véhicule
router.post('/ajouter-vehicules', verifyToken , ajouterVehiculeController); 

// Route pour lister les véhicules d'un client connecté
router.get('/', verifyToken , listerVehiculesController);

// Route pour mettre à jour un véhicule par son ID
router.put('/:id', updateVehiculeController);

// Route pour supprimer un véhicule par son ID
router.delete('/:id', supprimerVehiculeController);

module.exports = router;
