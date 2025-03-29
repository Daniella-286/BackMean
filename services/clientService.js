const Client = require('../models/Client');

// Récupérer tous les clients avec pagination
const getAllClients = async (page = 1, limit = 10, search = "", sortOrder = "asc") => {
  try {
    const skip = (page - 1) * limit;

    // Filtre de recherche : Recherche par nom et prénom (insensible à la casse)
    const searchFilter = search
      ? {
          $or: [
            { nom: { $regex: search, $options: 'i' } }, // Recherche dans le nom
            { prenom: { $regex: search, $options: 'i' } } // Recherche dans le prénom
          ]
        }
      : {};

    // Tri par date de naissance : croissant ou décroissant
    const sort = sortOrder === "asc" ? { date_inscription: 1 } : { date_inscription: -1 };

    // Récupérer les clients avec filtre de recherche, tri, et pagination
    const clients = await Client.find(searchFilter)
      .select('-mdp') // Exclut le mot de passe
      .skip(skip)
      .limit(limit)
      .sort(sort);

    const total = await Client.countDocuments(searchFilter); // Nombre total de clients après filtrage
    const totalPages = Math.ceil(total / limit);

    return { page, limit, total, totalPages, data: clients };
  } catch (error) {
    throw new Error('Erreur lors de la récupération des clients: ' + error.message);
  }
};


module.exports = {
  getAllClients
};
