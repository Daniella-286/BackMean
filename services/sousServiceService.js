const SousService = require('../models/SousService');

exports.getAllSousServices = async () => {
  return await SousService.find().populate('id_service');
};

exports.getSousServiceById = async (id) => {
  return await SousService.findById(id).populate('id_service');
};

exports.createSousService = async (data) => {
  const newSousService = new SousService(data);
  return await newSousService.save();
};

exports.updateSousService = async (id, data) => {
  return await SousService.findByIdAndUpdate(id, data, { new: true });
};

exports.deleteSousService = async (id) => {
  return await SousService.findByIdAndDelete(id);
};

const getSousServicesByService = async (idService) => {
  return await SousService.find({ id_service: idService });
};