const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const  verifyToken  = require('../middleware/authMiddleware');
const { checkManagerRole , checkMecanicienRole } = require('../middleware/roleMiddleware'); 
 
router.get("/total-interventions", verifyToken, checkManagerRole, dashboardController.getTotalInterventionsController);
router.get('/statistiques/clients',verifyToken, checkManagerRole, dashboardController.getNombreClientsController);
router.get('/parking/reservations',verifyToken, checkManagerRole, dashboardController.getNombreReservationsController);
router.get('/statistiques/mecaniciens',verifyToken, checkManagerRole, dashboardController.getNombreMecaniciensController);
router.get('/total-caisse', verifyToken, checkManagerRole, dashboardController.getTotalCaisseController);

router.get("/montants-factures-par-intervention",verifyToken, checkManagerRole, dashboardController.getAverageInvoiceAmountController);
router.get('/interventions-terminees', dashboardController.getInterventionsTermineesParMoisController);
router.get('/stock/history',verifyToken, checkManagerRole, dashboardController.getStockHistoryController);
router.get('/stock/reste', verifyToken, checkManagerRole , dashboardController.getStockRestantController);
router.get('/finance/montants-caisse', verifyToken, checkManagerRole ,dashboardController.getMontantTotalParMoisController);

module.exports = router;
