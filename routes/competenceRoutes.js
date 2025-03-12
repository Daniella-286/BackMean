const express = require('express');
const router = express.Router();
const competenceController = require('../controllers/competenceController');

// Ajouter une compétence
router.post('/', competenceController.createCompetence);

// Récupérer toutes les compétences
router.get('/', competenceController.getCompetences);

// Récupérer une compétence par ID
router.get('/:id', competenceController.getCompetence);

// Mettre à jour une compétence
router.put('/:id', competenceController.updateCompetenceDetails);

// Supprimer une compétence
router.delete('/:id', competenceController.deleteCompetenceRecord);

module.exports = router;
