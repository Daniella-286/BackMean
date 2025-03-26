const Competence = require('../models/Competence');

const addCompetence = async (competenceData) => {
  try {
    const competence = new Competence(competenceData);
    await competence.save();
    return competence;
  } catch (error) {
    throw new Error('Erreur lors de l\'ajout de la compétence');
  }
};

const getAllCompetences = async () => {
  try {
    return await Competence.find();
  } catch (error) {
    throw new Error('Erreur lors de la récupération des compétences');
  }
};

const getCompetenceById = async (id) => {
  try {
    return await Competence.findById(id);
  } catch (error) {
    throw new Error('Erreur lors de la récupération de la compétence');
  }
};

const updateCompetence = async (id, competenceData) => {
  try {
    return await Competence.findByIdAndUpdate(id, competenceData, { new: true });
  } catch (error) {
    throw new Error('Erreur lors de la mise à jour de la compétence');
  }
};

const deleteCompetence = async (id) => {
  try {
    return await Competence.findByIdAndDelete(id);
  } catch (error) {
    throw new Error('Erreur lors de la suppression de la compétence');
  }
};

module.exports = {
  addCompetence,
  getAllCompetences,
  getCompetenceById,
  updateCompetence,
  deleteCompetence,
};
