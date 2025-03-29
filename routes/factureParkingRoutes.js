const express = require('express');
const router = express.Router();
const factureParkingController = require('../controllers/factureParkingController');
const verifyToken = require('../middleware/authMiddleware');
const { checkManagerRole , checkMecanicienRole } = require('../middleware/roleMiddleware'); 

router.post('/generer', verifyToken , checkManagerRole , factureParkingController.genererFacture);

// Route pour récupérer toutes les factures d'un client
router.get('/facture-client', verifyToken , factureParkingController.getFacturesByClientController);

// Route pour récupérer les détails d'une facture spécifique
router.get('/facture-client/:id_facture', factureParkingController.getFactureDetailsController);

// Récupérer toutes les factures de parking du jour
router.get('/factures-du-jour', verifyToken , checkMecanicienRole , factureParkingController.getFacturesParkingDuJourController);

// Récupérer les détails d'une facture de parking
router.get('/factures-du-jour/:id_facture', factureParkingController.getFactureParkingDetailsController);

module.exports = router;
