const express = require('express');
const router = express.Router();
const { createFacture } = require('../controllers/factureController');
const  verifyToken  = require('../middleware/authMiddleware');
const { checkManagerRole } = require('../middleware/roleMiddleware'); 
 
router.post('/generer', verifyToken , checkManagerRole , createFacture);

module.exports = router;
