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

module.exports = {
  addPieceSousService,
  getAllPieceSousServices,
  getPieceSousServiceById,
  updatePieceSousService,
  deletePieceSousService
};
