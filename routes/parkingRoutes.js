const express = require('express');
const { createParking, getAllParkingsController, getParkingByIdController, updateParkingController, deleteParkingController , getParkingsDisponiblesController } = require('../controllers/parkingController');
const verifyToken = require('../middleware/authMiddleware');
const { checkManagerRole } = require('../middleware/roleMiddleware');

const router = express.Router();

router.post('/', verifyToken , checkManagerRole , createParking);
router.get('/', getAllParkingsController);
router.get('/disponibles', getParkingsDisponiblesController);
router.get('/:id', getParkingByIdController);
router.put('/:id', updateParkingController);
router.delete('/:id', deleteParkingController);

module.exports = router;
