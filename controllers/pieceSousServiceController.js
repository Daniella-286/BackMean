const pieceSousServiceService = require('../services/pieceSousServiceService');

// Créer une nouvelle relation Piece - SousService
const createPieceSousService = async (req, res) => {
  try {
    const pieceSousService = await pieceSousServiceService.addPieceSousService(req.body);
    res.status(201).json(pieceSousService);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir toutes les relations Piece - SousService
const getPieceSousServices = async (req, res) => {
  try {
    const pieceSousServices = await pieceSousServiceService.getAllPieceSousServices();
    res.status(200).json(pieceSousServices);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Obtenir une relation Piece - SousService par son ID
const getPieceSousService = async (req, res) => {
  try {
    const pieceSousService = await pieceSousServiceService.getPieceSousServiceById(req.params.id);
    if (!pieceSousService) {
      return res.status(404).json({ message: 'Relation non trouvée' });
    }
    res.status(200).json(pieceSousService);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour une relation Piece - SousService par son ID
const updatePieceSousService = async (req, res) => {
  try {
    const updatedPieceSousService = await pieceSousServiceService.updatePieceSousService(req.params.id, req.body);
    if (!updatedPieceSousService) {
      return res.status(404).json({ message: 'Relation non trouvée' });
    }
    res.status(200).json(updatedPieceSousService);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Supprimer une relation Piece - SousService par son ID
const deletePieceSousService = async (req, res) => {
  try {
    const deletedPieceSousService = await pieceSousServiceService.deletePieceSousService(req.params.id);
    if (!deletedPieceSousService) {
      return res.status(404).json({ message: 'Relation non trouvée' });
    }
    res.status(200).json({ message: 'Relation supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getPiecesBySousService = async (req, res) => {
  try {
    const { id_sous_service } = req.params;

    const result = await pieceSousServiceService.getPiecesBySousService(id_sous_service);

    if (!result.success) {
      return res.status(404).json({ success: false, message: result.message });
    }

    return res.status(200).json({ success: true, piecesSousService: result.piecesSousService });
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createPieceSousService,
  getPieceSousServices,
  getPieceSousService,
  updatePieceSousService,
  deletePieceSousService,
  getPiecesBySousService
};
