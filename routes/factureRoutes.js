const express = require('express');
const router = express.Router();
const { createFacture , getFacturesByClientContoller , getFactureById , getFacturesForMecanicien , getFacturesForMecanicienById } = require('../controllers/factureController');
const  verifyToken  = require('../middleware/authMiddleware');
const { checkManagerRole , checkMecanicienRole } = require('../middleware/roleMiddleware'); 
 
router.post('/generer', verifyToken , checkManagerRole , createFacture);

router.get("/facture-client", verifyToken ,  getFacturesByClientContoller );

router.get("/facture-client/:id_facture", getFactureById);

router.get("/du-jour", verifyToken , checkMecanicienRole ,getFacturesForMecanicien);

router.get("/du-jour/:id_facture", getFacturesForMecanicienById);

module.exports = router;
