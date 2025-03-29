const PieceSousService = require('../models/PieceSousService');

const addPieceSousService = async (data) => {
  const pieceSousService = new PieceSousService(data);
  await pieceSousService.save();
  return pieceSousService;
};

const getAllPieceSousServices = async () => {
  return await PieceSousService.find()
    .populate('id_sous_service')
    .populate('id_piece')
    .populate('quantite');        
};

const getPieceSousServiceById = async (id) => {
  return await PieceSousService.findById(id)
    .populate('id_sous_service')
    .populate('id_piece')
    .populate('quantite');
};

const updatePieceSousService = async (id, data) => {
  return await PieceSousService.findByIdAndUpdate(id, data, { new: true })
    .populate('id_sous_service')
    .populate('id_piece')
    .populate('quantite');
};

const deletePieceSousService = async (id) => {
  return await PieceSousService.findByIdAndDelete(id);
};

const getPiecesBySousService = async (id_sous_service) => {
  try {
    // Recherche de toutes les relations Piece-SousService correspondant à l'id_sous_service
    const piecesSousService = await PieceSousService.find({ id_sous_service })
      .populate('id_sous_service') // Pour obtenir les informations du sous-service
      .populate('id_piece') // Pour obtenir les informations de la pièce
      .exec();

    if (piecesSousService.length === 0) {
      return { success: false, message: "Aucune pièce trouvée pour ce sous-service." };
    }

    return { success: true, piecesSousService };
  } catch (error) {
    return { success: false, message: error.message };
  }
};


module.exports = {
  addPieceSousService,
  getAllPieceSousServices,
  getPieceSousServiceById,
  updatePieceSousService,
  deletePieceSousService,
  getPiecesBySousService
};
