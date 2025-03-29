const express = require('express');
const router = express.Router();
const paiementServiceController = require('../controllers/paiementController');


// Route pour effectuer le paiement d'une facture de service
router.post('/effectuer-paiement-service', paiementServiceController.effectuerPaiementServiceController);


// Route pour effectuer le paiement d'une facture de parking
router.post('/effectuer-paiement-parking', paiementServiceController.effectuerPaiementParkingController);

module.exports = router;
