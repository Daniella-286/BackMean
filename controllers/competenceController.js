const { addCompetence, getAllCompetences, getCompetenceById, updateCompetence, deleteCompetence } = require('../services/competenceService');

// Ajouter une compétence
const createCompetence = async (req, res) => {
  try {
    const competence = await addCompetence(req.body);
    res.status(201).json(competence);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer toutes les compétences
const getCompetences = async (req, res) => {
  try {
    const competences = await getAllCompetences();
    res.status(200).json(competences);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Récupérer une compétence par ID
const getCompetence = async (req, res) => {
  try {
    const competence = await getCompetenceById(req.params.id);
    if (!competence) {
      return res.status(404).json({ message: 'Compétence non trouvée' });
    }
    res.status(200).json(competence);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Mettre à jour une compétence
const updateCompetenceDetails = async (req, res) => {
  try {
    const updatedCompetence = await updateCompetence(req.params.id, req.body);
    if (!updatedCompetence) {
      return res.status(404).json({ message: 'Compétence non trouvée' });
    }
    res.status(200).json(updatedCompetence);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Supprimer une compétence
const deleteCompetenceRecord = async (req, res) => {
  try {
    const deletedCompetence = await deleteCompetence(req.params.id);
    if (!deletedCompetence) {
      return res.status(404).json({ message: 'Compétence non trouvée' });
    }
    res.status(200).json({ message: 'Compétence supprimée avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createCompetence,
  getCompetences,
  getCompetence,
  updateCompetenceDetails,
  deleteCompetenceRecord
};
