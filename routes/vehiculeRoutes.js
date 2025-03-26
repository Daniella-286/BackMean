const express = require('express');
const router = express.Router();
const { listerVehiculesController , ajouterVehiculeController } = require('../controllers/vehiculeController'); // IMPORTATION CORRECTE
const verifyToken = require('../middleware/authMiddleware'); 

// Route protégée pour ajouter un véhicule
router.post('/ajouter-vehicules', verifyToken , ajouterVehiculeController); 

// Route pour lister les véhicules d'un client connecté
router.get('/', verifyToken , listerVehiculesController);

module.exports = router;
