const { getAllTypeMouvements , ajouterTypeMouvement} = require('../services/typeMouvementService');

const getAllTypeMouvementsController  = async (req, res) => {
  try {
    const typeMouvements = await getAllTypeMouvements();
    res.status(200).json(typeMouvements); 
  } catch (error) {
    res.status(500).json({ message: error.message }); 
  }
};

const ajouterTypeMouvementController = async (req, res) => {
  try {
      const { nom_type } = req.body;
      const result = await ajouterTypeMouvement(nom_type);

      res.status(result.success ? 201 : 400).json(result);
  } catch (error) {
      res.status(500).json({ success: false, message: "Erreur serveur", error: error.message });
  }
};

module.exports = {
  getAllTypeMouvementsController  , ajouterTypeMouvementController
};
