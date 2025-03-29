const express = require('express');
const { getMecaniciensNonValidesController, validateMecanicienController , getMecaniciensController } = require('../controllers/mecanicienController');
const { checkManagerRole } = require('../middleware/roleMiddleware'); 
const verifyToken = require('../middleware/authMiddleware');

const router = express.Router();

router.get("/non-valides", verifyToken, checkManagerRole, getMecaniciensNonValidesController);
router.put("/valider/:id", validateMecanicienController);
router.get('/listes-mecaniciens', getMecaniciensController);

module.exports = router;
