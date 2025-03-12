// routes/vehiculeRoutes.js
const express = require('express');
const router = express.Router();
const { ajouterVehicule } = require('../controllers/vehiculeController');
const verifyToken = require('../middleware/authMiddleware'); // Le middleware de vérification du token

// Route protégée pour ajouter un véhicule
router.post('/', verifyToken, ajouterVehicule); // Le middleware `verifyToken` s'assure que l'utilisateur est authentifié

module.exports = router;
