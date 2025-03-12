const express = require('express');
const router = express.Router();
const marqueController = require('../controllers/marqueController');

// CRUD pour la marque
router.post('/', marqueController.createMarque);
router.get('/', marqueController.getAllMarques);
router.get('/:id', marqueController.getMarqueById);
router.put('/:id', marqueController.updateMarque);
router.delete('/:id', marqueController.deleteMarque);

module.exports = router;
