const express = require('express');
const router = express.Router();
const { getReservationsConfirmeesParClientController , soumettreReservationController, getReservationsClientController , confirmerReservationController, verifierReservationsNonConfirmeesController , validerReservationController , annulerReservationController , getReservationsEnAttenteValidationManagerController } = require('../controllers/reservationController');
const verifyToken = require('../middleware/authMiddleware');
const { checkManagerRole } = require('../middleware/roleMiddleware'); 
 
// Route pour soumettre une réservation
router.post('/', verifyToken , soumettreReservationController);

router.get('/reservations-client', verifyToken, getReservationsClientController);

router.get('/attente-validation-manager', verifyToken , checkManagerRole , getReservationsEnAttenteValidationManagerController);

router.get('/confirmees', verifyToken, getReservationsConfirmeesParClientController);

router.put('/:id_reservation/confirmer', confirmerReservationController);

router.put('/:id_reservation/valider', verifyToken , checkManagerRole , validerReservationController);

router.put('/:id_reservation/annuler', annulerReservationController);

// Route pour vérifier les réservations non confirmées (annuler automatiquement celles qui sont dépassées)
// router.get('/verifier', verifierReservationsNonConfirmeesController);

module.exports = router;

