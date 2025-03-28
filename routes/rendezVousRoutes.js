const express = require('express');
const verifyToken = require('../middleware/authMiddleware'); // Middleware pour vérifier le token
const { checkManagerRole } = require('../middleware/roleMiddleware'); // Middleware pour vérifier que l'utilisateur est un manager
const { rendezVousParIdController , getRendezVousEnAttente , getRendezVousClient ,getRendezVousConfirmes ,creerRendezVous , confirmerRendezVousController , annulerRendezVousController , validerRendezVousController , marquerRendezVousNonDisponibleController , modifierRendezVousController } = require('../controllers/rendezVousController');

const router = express.Router();

// Route pour que le client prenne un rendez-vous
router.post('/prendre-rendez-vous', verifyToken, creerRendezVous);

// Route pour récupérer les rendez-vous d'un client avec un filtre par date
router.get('/mes-rendez-vous', verifyToken, getRendezVousClient);

// Route pour que le manager consulte la liste des rendez-vous en attente
router.get('/en-attente', verifyToken, checkManagerRole, getRendezVousEnAttente);

// Route pour que le manager consulte la liste des rendez-vous confirmés hanaovana interventions
router.get('/confirmes', verifyToken, checkManagerRole, getRendezVousConfirmes);

// Route pour que le client puisse modifier son rendez-vous
router.put('/modifier/:id_rdv', verifyToken, modifierRendezVousController);

// Route pour que le client annule un rendez-vous
router.put('/annuler/:id_rdv', verifyToken, annulerRendezVousController);

// Route pour que le client confirme un rendez-vous
router.put('/confirmer/:id_rdv', verifyToken, confirmerRendezVousController);

// Route pour que le manager valide un rendez-vous
router.put('/valider/:id_rdv', validerRendezVousController);

// Route pour que le manager marque un rendez-vous comme "Non disponible"
router.put('/indisponible/:id_rdv', marquerRendezVousNonDisponibleController);

router.get('/:id_rdv', rendezVousParIdController);

module.exports = router;
