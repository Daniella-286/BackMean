const express = require('express');
const router = express.Router();
const mecanicienController = require('../controllers/mecanicienController');

// Récupérer les mécaniciens dont l'inscription n'est pas validée
router.get('/non-valides', mecanicienController.getMecaniciensNonValidesController);

module.exports = router;
