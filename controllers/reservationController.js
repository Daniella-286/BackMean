const { getReservationsValides , getReservationsConfirmees ,  soumettreReservation, getReservationsClient , verifierReservationsNonConfirmees, validerReservationParManager , confirmerReservation , annulerReservation , getReservationsEnAttenteValidationManager , getReservationsFacturables } = require('../services/reservationService');
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
    const { date_debut, date_fin, page = 1, limit = 10 } = req.query; // Récupérer les dates et pagination

    // Appeler le service pour obtenir les réservations avec pagination
    const result = await getReservationsClient(id_client, date_debut, date_fin, parseInt(page), parseInt(limit));

    if (!result.success) {
      return res.status(200).json({ message: result.message });
    }

    // Retourner la réponse avec les données de réservation et la pagination
    return res.status(200).json({
      success: true,
      data: result.reservations,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages
    });
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

const getReservationsValidesController = async (req, res) => {
  try {
    const id_client = req.user.id; // ID du client connecté

    if (!id_client) {
      return res.status(400).json({ message: "ID client manquant." });
    }

    const { date_debut, date_fin, page = 1, limit = 10 } = req.query; // Récupérer les paramètres

    // Appeler le service pour obtenir les réservations confirmées avec pagination et filtres
    const result = await getReservationsValides(
      id_client, 
      date_debut, 
      date_fin, 
      parseInt(page), 
      parseInt(limit)
    );

    if (!result.success) {
      return res.status(200).json({ message: result.message });
    }

    return res.status(200).json({
      success: true,
      data: result.reservations,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages
    });
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

const getReservationsConfirmeesController = async (req, res) => {
  try {
    const id_client = req.user.id; // ID du client connecté depuis le token
    const { date_debut, date_fin, page = 1, limit = 10 } = req.query;

    // Appel du service pour récupérer les réservations confirmées
    const result = await getReservationsConfirmees(id_client, date_debut, date_fin, parseInt(page), parseInt(limit));

    if (!result.success) {
      return res.status(200).json({ message: result.message });
    }

    // Retourner la réponse avec les données paginées
    return res.status(200).json({
      success: true,
      data: result.reservations,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

//reservation en attente de validation vu par le manager
const getReservationsEnAttenteValidationManagerController = async (req, res) => {
  try {
    const { date_debut, date_fin } = req.query; // Récupérer les dates depuis la requête (GET /endpoint?dateDebut=YYYY-MM-DD&dateFin=YYYY-MM-DD)
    const { page = 1, limit = 10 } = req.query; // Récupérer les paramètres page et limit de la requête

    // Appeler le service pour obtenir les réservations en attente de validation avec pagination
    const result = await getReservationsEnAttenteValidationManager(date_debut, date_fin, parseInt(page), parseInt(limit));

    if (!result.success) {
      return res.status(200).json({ message: "Aucune réservation en attente de validation dans cette période" });
    }

    // Retourner la réponse avec les résultats paginés et les informations de pagination
    res.status(200).json({
      success: true,
      reservations: result.reservations,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
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

const getReservationsFacturablesController = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query; // Récupérer les paramètres page et limit depuis la requête

    // Appeler le service pour obtenir les réservations facturables avec pagination
    const result = await getReservationsFacturables(parseInt(page), parseInt(limit));

    if (!result.success) {
      return res.status(200).json(result);
    }

    // Retourner les résultats avec les informations de pagination
    res.status(200).json({
      success: true,
      reservations: result.reservations,
      total: result.total,
      page: result.page,
      limit: result.limit,
      totalPages: result.totalPages,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = { getReservationsFacturablesController , getReservationsConfirmeesController ,  getReservationsValidesController , soumettreReservationController, getReservationsClientController , confirmerReservationController, verifierReservationsNonConfirmeesController , validerReservationController , annulerReservationController , getReservationsEnAttenteValidationManagerController};
