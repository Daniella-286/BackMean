const { getReservationsConfirmeesParClient , soumettreReservation, getReservationsClient , verifierReservationsNonConfirmees, validerReservationParManager , confirmerReservation , annulerReservation , getReservationsEnAttenteValidationManager } = require('../services/reservationService');
const deadlineService = require('../services/deadlineService');

const soumettreReservationController = async (req, res) => {
  try {
    const { id_parking, id_vehicule, date_debut, date_fin } = req.body;
    const id_client = req.user.id;

    // Récupérer les délais de confirmation
    const deadlines = await deadlineService.getAllDeadlines();
    const deadline_resa = deadlines.deadline_resa; // Nombre de jours autorisés pour confirmer

    // Soumettre la réservation
    const reservation = await soumettreReservation(id_parking, id_client, id_vehicule, date_debut, date_fin);

    res.status(201).json({ 
      message: `Votre réservation est enregistrée. Vous avez ${deadline_resa} jours pour la confirmer.`,
      reservation 
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getReservationsClientController = async (req, res) => {
  try {
    const id_client = req.user.id; // Récupérer l'ID du client connecté depuis le token
    const { date_debut, date_fin } = req.query; // Récupérer les dates depuis les paramètres de requête

    // Appeler le service pour obtenir les réservations
    const reservations = await getReservationsClient(id_client, date_debut, date_fin);

    if (reservations.length === 0) {
      return res.status(200).json({ message: "Aucune réservation trouvée pour cette période." });
    }

    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const confirmerReservationController = async (req, res) => {
  try {
    const { id_reservation } = req.params;

    const result = await confirmerReservation(id_reservation);

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

const getReservationsConfirmeesParClientController = async (req, res) => {
  try {
    const id_client = req.user.id; // Si tu utilises un middleware d'auth
    if (!id_client) {
      return res.status(400).json({ message: "ID client manquant." });
    }

    const reservations = await getReservationsConfirmeesParClient(id_client);

    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const annulerReservationController = async (req, res) => {
  try {
    const { id_reservation } = req.params;

    const result = await annulerReservation(id_reservation);

    res.status(200).json(result);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

//reservation en attente de validation vu par le manager
const getReservationsEnAttenteValidationManagerController = async (req, res) => {
  try {
    const { date_debut, date_fin } = req.query; // Récupérer les dates depuis la requête (GET /endpoint?dateDebut=YYYY-MM-DD&dateFin=YYYY-MM-DD)

    const reservations = await getReservationsEnAttenteValidationManager(date_debut, date_fin);

    if (reservations.length === 0) {
      return res.status(200).json({ message: "Aucune réservation en attente de validation dans cette période" });
    }

    res.status(200).json(reservations);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const validerReservationController = async (req, res) => {
  try {
    const { id_reservation } = req.params;

    // Appeler le service pour valider la réservation par le manager
    const result = await validerReservationParManager(id_reservation);

    // Retourner la réponse
    res.status(200).json({ message: result.message, reservation: result.reservation });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Vérifier les réservations non confirmées à intervalle régulier (par exemple via un cron job)
const verifierReservationsNonConfirmeesController = async (req, res) => {
  try {
    await verifierReservationsNonConfirmees();
    res.status(200).json({ message: 'Vérification terminée' });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


module.exports = { getReservationsConfirmeesParClientController , soumettreReservationController, getReservationsClientController , confirmerReservationController, verifierReservationsNonConfirmeesController , validerReservationController , annulerReservationController , getReservationsEnAttenteValidationManagerController};
