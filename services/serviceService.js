const Service = require('../models/Service');

exports.getAllServices = async () => {
  return await Service.find();
};

exports.getServiceById = async (id) => {
  return await Service.findById(id);
};

exports.createService = async (data) => {
  const newService = new Service(data);
  return await newService.save();
};

exports.updateService = async (id, updateData) => {
  try {
    // Trouver et mettre à jour le service par son ID
    const updatedService = await Service.findByIdAndUpdate(id, updateData, { new: true });

    if (!updatedService) {
      return null;  // Aucun service trouvé pour cet ID
    }

    return updatedService;
  } catch (error) {
    throw new Error('Erreur lors de la mise à jour du service');
  }
};

exports.deleteService = async (id) => {
  return await Service.findByIdAndDelete(id);
};
