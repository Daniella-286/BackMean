const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');

router.get('/', serviceController.getAllServices);
router.get('/:id', serviceController.getServiceById);
router.post('/', serviceController.uploadImage, serviceController.createService);
router.put('/:id', serviceController.uploadImage, serviceController.updateService);
router.delete('/:id', serviceController.deleteService);
router.get('/:id/details', serviceController.getServiceWithSousServices);

module.exports = router;
