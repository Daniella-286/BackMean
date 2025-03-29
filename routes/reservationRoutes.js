const express = require('express');
const router = express.Router();
const { getReservationsValidesController , getReservationsConfirmeesController , getReservationsFacturablesController , soumettreReservationController, getReservationsClientController , confirmerReservationController, verifierReservationsNonConfirmeesController , validerReservationController , annulerReservationController , getReservationsEnAttenteValidationManagerController } = require('../controllers/reservationController');
const verifyToken = require('../middleware/authMiddleware');
const { checkManagerRole } = require('../middleware/roleMiddleware'); 
 
// Route pour soumettre une réservation
router.post('/', verifyToken , soumettreReservationController);

router.get('/reservations-client', verifyToken, getReservationsClientController);

router.get('/attente-validation-manager', verifyToken , checkManagerRole , getReservationsEnAttenteValidationManagerController);

router.get('/confirmees', verifyToken, getReservationsValidesController);

router.get('/facturables',  verifyToken , checkManagerRole , getReservationsFacturablesController );

router.put('/:id_reservation/confirmer', confirmerReservationController);

router.put('/:id_reservation/valider', validerReservationController);

router.put('/:id_reservation/annuler', annulerReservationController);

router.get("/reservations/confirmees", verifyToken, getReservationsConfirmeesController);

// Route pour vérifier les réservations non confirmées (annuler automatiquement celles qui sont dépassées)
// router.get('/verifier', verifierReservationsNonConfirmeesController);

module.exports = router;

