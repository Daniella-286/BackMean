const pieceService = require('../services/pieceService');

// Créer une nouvelle pièce
const createPiece = async (req, res) => {
  try {
    const piece = await pieceService.addPiece(req.body);
    res.status(201).json(piece);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir toutes les pièces
const getPieces = async (req, res) => {
  try {
    const pieces = await pieceService.getAllPieces();
    res.status(200).json(pieces);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir une pièce par son ID
const getPiece = async (req, res) => {
  try {
    const piece = await pieceService.getPieceById(req.params.id);
    if (!piece) {
      return res.status(404).json({ message: 'Pièce non trouvée' });
    }
    res.status(200).json(piece);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour une pièce
const updatePiece = async (req, res) => {
  try {
    const updatedPiece = await pieceService.updatePiece(req.params.id, req.body);
    if (!updatedPiece) {
      return res.status(404).json({ message: 'Pièce non trouvée' });
    }
    res.status(200).json(updatedPiece);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Supprimer une pièce
const deletePiece = async (req, res) => {
  try {
    const deletedPiece = await pieceService.deletePiece(req.params.id);
    if (!deletedPiece) {
      return res.status(404).json({ message: 'Pièce non trouvée' });
    }
    res.status(200).json({ message: 'Pièce supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createPiece,
  getPieces,
  getPiece,
  updatePiece,
  deletePiece
};
