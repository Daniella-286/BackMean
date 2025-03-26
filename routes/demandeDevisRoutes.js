const express = require('express');
const router = express.Router();
const { envoyerDevisController , listerDemandesClientEnvoye , soumettreDemandeDevis , listerDemandesClient , afficherDemandesEnAttente , listerDemandesEnvoyeesClient } = require('../controllers/demandeDevisController');
const  verifyToken  = require('../middleware/authMiddleware');
const { uploadDevisImage } = require('../config/cloudinaryConfig');
const { checkManagerRole } = require('../middleware/roleMiddleware'); // Middleware pour vérifier que l'utilisateur est un manager
 
// Route pour soumettre une demande de devis avec images
router.post('/', verifyToken , uploadDevisImage, soumettreDemandeDevis);

// Route pour obtenir toutes les demandes de devis en attente d'un client
router.get('/mes-demandes', verifyToken , listerDemandesClient);

// Route pour obtenir toutes les demandes de devis statut = Envoyé d'un client
router.get('/mes-devis', verifyToken , listerDemandesClientEnvoye);

// Route protégée : seul un manager peut voir les demandes en attente
router.get('/demandes-en-attente', verifyToken , checkManagerRole , afficherDemandesEnAttente);

// Endpoint pour envoyer un devis
router.put('/envoyer-devis/:id_demande', envoyerDevisController);

module.exports = router;
