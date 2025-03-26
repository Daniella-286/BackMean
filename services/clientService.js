const Client = require('../models/Client');

// Récupérer tous les clients
const getAllClients = async () => {
  try {
    return await Client.find().select('-mdp'); // Exclut le mot de passe
  } catch (error) {
    throw new Error('Erreur lors de la récupération des clients: ' + error.message);
  }
};

module.exports = {
  getAllClients
};
