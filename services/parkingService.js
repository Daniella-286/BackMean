const Parking = require('../models/Parking');
const ReservationParking = require('../models/Reservation');

const addParking = async (data) => {
  return await Parking.create(data);
};

const getAllParkings = async () => {
  return await Parking.find();
};

const getParkingById = async (id) => {
  return await Parking.findById(id);
};

const updateParking = async (id, data) => {
  return await Parking.findByIdAndUpdate(id, data, { new: true });
};

const deleteParking = async (id) => {
  return await Parking.findByIdAndDelete(id);
};

const getParkingsDisponibles = async (date_debut, date_fin) => {
  try {
    // Trouver les parkings qui sont réservés dans la période donnée
    const reservations = await ReservationParking.find({
      statut: { $in: ['confirmé', 'validé'] }, // On exclut les réservations annulées ou en attente
      $or: [
        { date_debut: { $lt: date_fin }, date_fin: { $gt: date_debut } }, // Les dates se chevauchent
      ],
    }).distinct('id_parking'); // Récupère uniquement les ID des parkings réservés

    // Trouver les parkings qui ne sont PAS dans la liste des réservés
    const parkingsDisponibles = await Parking.find({
      _id: { $nin: reservations }, // Exclure les parkings déjà réservés
    });

    return parkingsDisponibles;
  } catch (error) {
    throw new Error('Erreur lors de la récupération des parkings disponibles : ' + error.message);
  }
};

module.exports = { addParking, getAllParkings, getParkingById, updateParking, deleteParking , getParkingsDisponibles };
