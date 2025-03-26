const { addParking , getParkingsDisponibles , getAllParkings , getParkingById , updateParking , deleteParking } = require('../services/parkingService');

const createParking = async (req, res) => {
  try {
    const parking = await addParking(req.body);
    res.status(201).json(parking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllParkingsController = async (req, res) => {
  try {
    const parkings = await getAllParkings();
    res.status(200).json(parkings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getParkingByIdController = async (req, res) => {
  try {
    const parking = await getParkingById(req.params.id);
    if (!parking) return res.status(404).json({ message: 'Parking non trouvé' });
    res.status(200).json(parking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateParkingController = async (req, res) => {
  try {
    const updatedParking = await updateParking(req.params.id, req.body);
    if (!updatedParking) return res.status(404).json({ message: 'Parking non trouvé' });
    res.status(200).json(updatedParking);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteParkingController = async (req, res) => {
  try {
    await deleteParking(req.params.id);
    res.status(200).json({ message: 'Parking supprimé avec succès' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getParkingsDisponiblesController = async (req, res) => {
  try {
    const { date_debut, date_fin } = req.query; // On récupère les dates depuis la requête

    if (!date_debut || !date_fin) {
      return res.status(400).json({ message: "Les dates de début et de fin sont obligatoires." });
    }

    const parkings = await getParkingsDisponibles(date_debut, date_fin);

    if (parkings.length === 0) {
      return res.status(200).json({ message: "Aucun parking disponible pour cette période." });
    }

    res.status(200).json(parkings);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { createParking, getAllParkingsController , getParkingByIdController , updateParkingController , deleteParkingController , getParkingsDisponiblesController };
