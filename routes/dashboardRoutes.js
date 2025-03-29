const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const  verifyToken  = require('../middleware/authMiddleware');
const { checkManagerRole , checkMecanicienRole } = require('../middleware/roleMiddleware'); 
 

///// Activité du garage (Réparations & Services)
router.get("/total-interventions", verifyToken, checkManagerRole, dashboardController.getTotalInterventionsController);
router.get("/montants-factures-par-intervention",verifyToken, checkManagerRole, dashboardController.getAverageInvoiceAmountController);
router.get('/interventions-terminees', dashboardController.getInterventionsTermineesParMoisController);

///// Suivi du stock
router.get('/stock/history',verifyToken, checkManagerRole, dashboardController.getStockHistoryController);
router.get('/stock/reste', verifyToken, checkManagerRole , dashboardController.getStockRestantController);

///// Suivi financier
router.get('/finance/montants-caisse', verifyToken, checkManagerRole ,dashboardController.getMontantTotalParMoisController);
router.get('/finance/factures',verifyToken, checkManagerRole, dashboardController.getFacturesStatsController);

/////  Occupation et gestion du parking
router.get('/parking/occupation', verifyToken, checkManagerRole,dashboardController.getTauxOccupationController);
router.get('/parking/reservations',verifyToken, checkManagerRole, dashboardController.getNombreReservationsController);
router.get('/parking/duree-moyenne',verifyToken, checkManagerRole, dashboardController.getDureeMoyenneReservationsController);

///// Statistiques générales 
router.get('/statistiques/clients',verifyToken, checkManagerRole, dashboardController.getNombreClientsController);
router.get('/statistiques/reservations',verifyToken, checkManagerRole, dashboardController.getNombreReservationsController2);
router.get('/statistiques/factures',verifyToken, checkManagerRole, dashboardController.getNombreFacturesController);

module.exports = router;
