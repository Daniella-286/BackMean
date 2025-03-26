const express = require('express');
const {createPiece , getPieces , getPiece , updatePiece , deletePiece} = require('../controllers/pieceController');
const router = express.Router();
const verifyToken = require('../middleware/authMiddleware'); // Middleware pour vérifier le token
const { checkManagerRole } = require('../middleware/roleMiddleware'); // Middleware pour vérifier que l'utilisateur est un manager

// Création d'une nouvelle pièce
router.post('/', createPiece);

// Récupérer toutes les pièces
router.get('/', getPieces);

// Récupérer une pièce par son ID
router.get('/:id', getPiece);

// Mettre à jour une pièce par son ID
router.put('/:id', updatePiece);

// Supprimer une pièce par son ID
router.delete('/:id', deletePiece);

module.exports = router;
