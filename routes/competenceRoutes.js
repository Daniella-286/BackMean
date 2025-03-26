const express = require('express');
const router = express.Router();
const { createCompetence , getCompetences , getCompetence , updateCompetenceDetails , deleteCompetenceRecord  } = require('../controllers/competenceController');
const verifyToken = require('../middleware/authMiddleware');
const { checkManagerRole } = require('../middleware/roleMiddleware'); // Middleware pour vérifier que l'utilisateur est un manager
 
// Ajouter une compétence
router.post('/', verifyToken , checkManagerRole , createCompetence);

// Récupérer toutes les compétences
router.get('/', getCompetences);

// Récupérer une compétence par ID
router.get('/:id', verifyToken , checkManagerRole , getCompetence);

// Mettre à jour une compétence
router.put('/:id', verifyToken , checkManagerRole , updateCompetenceDetails);

// Supprimer une compétence
router.delete('/:id', verifyToken, checkManagerRole , deleteCompetenceRecord);

module.exports = router;
