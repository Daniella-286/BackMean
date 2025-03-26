const express = require('express');
const { mouvementStockController } = require('../controllers/mouvementStockController');

const router = express.Router();

// Route pour ajouter un mouvement de stock (entrée ou sortie)
router.post('/', mouvementStockController);

module.exports = router;
