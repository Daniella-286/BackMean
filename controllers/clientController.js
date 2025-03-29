const { getAllClients } = require('../services/clientService');

// Récupérer tous les clients avec pagination
const getAllClientsController = async (req, res) => {
  try {
    const { page = 1, limit = 10, search = "", sortOrder = "asc" } = req.query;

    const result = await getAllClients(page, limit, search, sortOrder);

    if (result.data.length === 0) {
      return res.status(200).json({ message: "Aucun client trouvé." });
    }

    res.status(200).json(result);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = {
  getAllClientsController
};
