const express = require('express');
const router = express.Router();
const modeleController = require('../controllers/modeleController');

// CRUD pour le modèle
router.post('/', modeleController.createModele);
router.get('/', modeleController.getAllModeles);
router.get('/:id', modeleController.getModeleById);
router.put('/:id', modeleController.updateModele);
router.delete('/:id', modeleController.deleteModele);
router.get('/marque/:marqueId', modeleController.getModelesByMarque);

module.exports = router;
