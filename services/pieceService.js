const Piece = require('../models/Piece');

// Créer une nouvelle pièce
const addPiece = async (data) => {
  const piece = new Piece(data);
  await piece.save();
  return piece;
};

// Obtenir toutes les pièces
const getAllPieces = async () => {
  return await Piece.find();
};

// Obtenir une pièce par son ID
const getPieceById = async (id) => {
  return await Piece.findById(id);
};

// Mettre à jour une pièce par son ID
const updatePiece = async (id, data) => {
  return await Piece.findByIdAndUpdate(id, data, { new: true });
};

// Supprimer une pièce par son ID
const deletePiece = async (id) => {
  return await Piece.findByIdAndDelete(id);
};

module.exports = {
  addPiece,
  getAllPieces,
  getPieceById,
  updatePiece,
  deletePiece
};
