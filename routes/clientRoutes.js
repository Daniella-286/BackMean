const express = require('express');
const { getAllClientsController } = require('../controllers/clientController');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware'); // Middleware pour vérifier le token
const { checkManagerRole } = require('../middleware/roleMiddleware'); // Middleware pour vérifier que l'utilisateur est un manager

// Route pour récupérer tous les clients
router.get('/', verifyToken , checkManagerRole , getAllClientsController);

module.exports = router;
