const express = require('express');
const router = express.Router();
const { createCompetence , getCompetences , getCompetence , updateCompetenceDetails , deleteCompetenceRecord  } = require('../controllers/competenceController');
const verifyToken = require('../middleware/authMiddleware');
const { checkManagerRole } = require('../middleware/roleMiddleware'); // Middleware pour vérifier que l'utilisateur est un manager
 
// Ajouter une compétence
router.post('/', createCompetence);

// Récupérer toutes les compétences
router.get('/', getCompetences);

// Récupérer une compétence par ID
router.get('/:id', getCompetence);

// Mettre à jour une compétence
router.put('/:id', updateCompetenceDetails);

// Supprimer une compétence
router.delete('/:id', deleteCompetenceRecord);

module.exports = router;
