const Service = require('../models/Service');

exports.getAllServices = async (page = 1, limit = 10) => {
  try {
    // Calculer l'offset pour la pagination
    const skip = (page - 1) * limit;

    // Récupérer les services avec pagination
    const services = await Service.find()
      .skip(skip)  // Appliquer l'offset
      .limit(limit);  // Limiter le nombre de résultats par page

    // Compter le nombre total de services pour la pagination
    const totalServices = await Service.countDocuments();

    // Retourner les résultats paginés avec les informations de pagination
    return {
      services,
      total: totalServices,
      page,
      limit,
      totalPages: Math.ceil(totalServices / limit), // Calculer le nombre total de pages
    };
  } catch (error) {
    throw new Error('Erreur lors de la récupération des services : ' + error.message);
  }
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
