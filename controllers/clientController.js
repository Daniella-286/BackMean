const { getAllClients } = require('../services/clientService');

// Récupérer tous les clients
const getAllClientsController = async (req, res) => {
  try {
    const clients = await getAllClients();
    res.status(200).json(clients);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
    getAllClientsController
};
