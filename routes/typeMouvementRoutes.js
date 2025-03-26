const express = require('express');
const { getAllTypeMouvementsController , ajouterTypeMouvementController} = require('../controllers/typeMouvementController');
const router = express.Router();

// Récupérer tous les types de mouvement
router.get('/', getAllTypeMouvementsController);

router.post('/ajouter', ajouterTypeMouvementController);

module.exports = router;
