const express = require('express');
const router = express.Router();
const serviceController = require('../controllers/serviceController');
const verifyToken = require('../middleware/authMiddleware');
const { checkManagerRole } = require('../middleware/roleMiddleware'); // Middleware pour vérifier que l'utilisateur est un manager
 
router.get('/', serviceController.getAllServices);
router.get('/listes', serviceController.getAllServicesScroll);
router.get('/:id', serviceController.getServiceById);
router.post('/', serviceController.uploadImage, serviceController.createService);
router.put('/:id', serviceController.uploadImage, serviceController.updateService);
router.delete('/:id', serviceController.deleteService);
router.get('/:id/details', serviceController.getServiceWithSousServices);

module.exports = router;
