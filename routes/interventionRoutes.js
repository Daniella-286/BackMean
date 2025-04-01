const express = require('express');
const router = express.Router();
const { getDisponibiliteMecaniciens , updateMecanicien , getHistoriqueIntervention , planifierInterventionController , getPlanningJourController , updateStatusController , addPiece , getEmploiDuTemps , getTaskInterventionController , getInterventionsTermineesController } = require('../controllers/interventionController');
const { checkManagerRole , checkMecanicienRole } = require('../middleware/roleMiddleware'); 
const verifyToken = require('../middleware/authMiddleware');

router.post('/planifier', verifyToken , checkManagerRole , planifierInterventionController);

router.get("/disponibilite-mecaniciens", verifyToken , checkManagerRole , getDisponibiliteMecaniciens);

router.get('/mecanicien/emploi-du-temps',  verifyToken , checkMecanicienRole , getEmploiDuTemps);

router.get('/mecanicien/plainning', verifyToken , checkMecanicienRole , getPlanningJourController);

router.get('/interventions-terminees', verifyToken , checkManagerRole , getInterventionsTermineesController);

router.get('/mecanicien/tache/:idIntervention',  verifyToken , checkMecanicienRole , getTaskInterventionController );

router.put('/update-mecanicien/:idIntervention', verifyToken , checkManagerRole ,  updateMecanicien);

router.get('/historique/:id_vehicule', getHistoriqueIntervention);

router.put('/update-status/:idIntervention',  updateStatusController);

router.post('/ajouter-piece-utilise', addPiece);

module.exports = router;
