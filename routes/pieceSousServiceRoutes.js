const express = require('express');
const {createPieceSousService , getPieceSousServices , getPieceSousService , updatePieceSousService , deletePieceSousService } = require('../controllers/pieceSousServiceController');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware'); // Middleware pour vérifier le token
const { checkManagerRole } = require('../middleware/roleMiddleware'); // Middleware pour vérifier que l'utilisateur est un manager


// Créer une nouvelle relation Piece - SousService
router.post('/', createPieceSousService);

// Récupérer toutes les relations Piece - SousService
router.get('/', getPieceSousServices);

// Récupérer une relation Piece - SousService par son ID
router.get('/:id', getPieceSousService);

// Mettre à jour une relation Piece - SousService par son ID
router.put('/:id', updatePieceSousService);

// Supprimer une relation Piece - SousService par son ID
router.delete('/:id', deletePieceSousService);

module.exports = router;
