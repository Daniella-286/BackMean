const express = require('express');
const router = express.Router();
const sousServiceController = require('../controllers/sousServiceController');

router.get('/', sousServiceController.getAllSousServices);
router.get('/:id', sousServiceController.getSousServiceById);
router.post('/', sousServiceController.createSousService);
router.put('/:id', sousServiceController.updateSousService);
router.delete('/:id', sousServiceController.deleteSousService);
router.get('/service/:idService', sousServiceController.getSousServicesByService);

module.exports = router;
