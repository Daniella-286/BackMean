const ReservationParking = require('../models/Reservation');
const Parking = require('../models/Parking');
const Deadline = require('../models/deadline');

const soumettreReservation = async (id_parking, id_client , id_vehicule, date_debut, date_fin) => {
  try {
    // Vérifier que les paramètres sont bien définis
    if (! id_client || !id_parking || !id_vehicule || !date_debut || !date_fin) {
      throw new Error('Tous les champs sont obligatoires.');
    }

    // Récupérer les informations du parking (incluant le tarif)
    const parking = await Parking.findById(id_parking);

    if (!parking) {
      throw new Error('Parking non trouvé');
    }

    const deadline = await Deadline.findOne();
    if (!deadline) {
      return res.status(500).json({ message: "Aucune configuration de délai trouvée dans la base de données." });
    }

    const date_limite_confirmation = new Date(date_debut);
    date_limite_confirmation.setDate(date_limite_confirmation.getDate() - deadline.deadline_resa);
    date_limite_confirmation.setUTCHours(23, 59, 59, 999);

    // Créer la réservation avec le statut 'en attente'
    const reservation = new ReservationParking({
      id_parking,
      id_client,
      id_vehicule,
      date_debut,
      date_fin,
      tarif: parking.tarif, 
      statut: 'En attente',
      date_limite_confirmation, 
    });

    await reservation.save();

    return reservation;
  } catch (error) {
    console.error("Erreur lors de la soumission de la réservation :", error.message);
    throw new Error(error.message);
  }
};

//Liste reservation des clients connecté en attente
const getReservationsClient = async (id_client, date_debut, date_fin) => {
  try {
    // Si aucune date n'est fournie, prendre les 30 derniers jours
    if (!date_debut || !date_fin) {
      const today = new Date();
      date_fin = date_fin ? new Date(date_fin) : new Date(today); // Copier today pour éviter la modification
      date_debut = date_debut ? new Date(date_debut) : new Date(today.setDate(today.getDate() - 30)); // Par défaut, 30 jours avant aujourd'hui
      date_debut.setUTCHours(0, 0, 0, 0);
      date_fin.setUTCHours(23, 59, 59, 999);
    } else {
      date_debut = new Date(date_debut);
      date_fin = new Date(date_fin);
    }

    // Ajouter 5 jours à la date de fin
    date_fin.setDate(date_fin.getDate() + 5);
    
    // Rechercher les réservations du client connecté entre ces dates
    const reservations = await ReservationParking.find({
      id_client: id_client,
      statut: "En attente",
      date_limite_confirmation : { $gte: date_debut, $lte: date_fin }
    })
      .populate("id_parking", "nom adresse") // Infos du parking
      .populate("id_vehicule", "marque modele immatriculation") // Infos du véhicule
      .sort({ date_debut: -1 }); // Trier par date décroissante (plus récente en premier)

    return reservations;
  } catch (error) {
    throw new Error(error.message);
  }
};

const confirmerReservation = async (id_reservation) => {
  try {
    const reservation = await ReservationParking.findById(id_reservation);

    if (!reservation) {
      throw new Error('Réservation non trouvée');
    }

    // Vérifier si la date limite est dépassée
    const now = new Date();
    if (now > reservation.date_limite_confirmation) {
      reservation.statut = 'Annulé'; // Annuler la réservation si le délai est dépassé
      await reservation.save();
      throw new Error('Le délai de confirmation est dépassé. La réservation a été annulée.');
    }

    // Confirmer la réservation
    reservation.statut = 'Confirmé';
    reservation.date_validation = new Date(); // Enregistrer la date de validation du client
    await reservation.save();

    return { message: 'Réservation confirmée par le client.', reservation };
  } catch (error) {
    throw new Error(error.message); // Lever une exception au lieu d'utiliser res.status()
  }
};

const getReservationsConfirmeesParClient = async (id_client) => {
  try {
    const reservations = await ReservationParking.find({ 
      id_client: id_client, 
      statut: 'Confirmé' 
    })
    .populate('id_vehicule') // Récupère les infos du véhicule
    .populate('id_parking');  // Récupère les infos du parking

    return reservations;
  } catch (error) {
    throw new Error("Erreur lors de la récupération des réservations confirmées : " + error.message);
  }
};

const annulerReservation = async (id_reservation) => {
  try {
    const reservation = await ReservationParking.findById(id_reservation);

    if (!reservation) {
      throw new Error("Réservation non trouvée");
    }

    // Vérifier si la réservation est déjà confirmée
    if (reservation.statut === "Confirmé") {
      throw new Error("Cette réservation est déjà confirmée et ne peut plus être annulée.");
    }

    if (reservation.statut === "Validé") {
      throw new Error("Cette réservation est déjà validée et ne peut plus être annulée.");
    }

    // Vérifier si la date actuelle est avant la date limite de confirmation
    const maintenant = new Date();
    if (maintenant > reservation.date_limite_confirmation) {
      throw new Error("Le délai d'annulation est dépassé. Vous ne pouvez plus annuler cette réservation.");
    }

    // Annuler la réservation
    reservation.statut = "Annulé";
    await reservation.save();

    return { message: "Réservation annulée avec succès.", reservation };
  } catch (error) {
    throw new Error(error.message);
  }
};

//reservation en attente de validation vu par le manager
const getReservationsEnAttenteValidationManager = async (date_debut, date_fin) => {
  try {
    if (!date_debut || !date_fin) {
      const today = new Date();
      date_fin = date_fin ? new Date(date_fin) : new Date(today); // Copier today pour éviter la modification
      date_debut = date_debut ? new Date(date_debut) : new Date(today.setDate(today.getDate() - 30)); // Par défaut, 30 jours avant aujourd'hui
      date_debut.setUTCHours(0, 0, 0, 0);
      date_fin.setUTCHours(23, 59, 59, 999);
    } else {
      date_debut = new Date(date_debut);
      date_fin = new Date(date_fin);
    }

    date_fin.setDate(date_fin.getDate() + 5);

    // Exécution de la requête MongoDB avec les dates en UTC (ISODate explicite)
    const reservations = await ReservationParking.find({
      statut: "Confirmé",
      date_limite_confirmation : { $gte: date_debut, $lte: date_fin }
    })
      .populate("id_parking")
      .populate({ path: "id_client", select: "nom prenom email telephone" })
      .populate({ path: "id_vehicule", select: "marque modele annee immatriculation" });

    return reservations;
  } catch (error) {
    throw new Error(error.message);
  }
};

const validerReservationParManager = async (id_reservation) => {
  try {
    // Trouver la réservation par son ID
    const reservation = await ReservationParking.findById(id_reservation);

    if (!reservation) {
      throw new Error('Réservation non trouvée');
    }

    // Vérifier que la réservation a été confirmée par le client
    if (reservation.statut !== 'Confirmé') {
      throw new Error('La réservation doit d\'abord être confirmée par le client.');
    }

    // Validation de la réservation par le manager
    reservation.statut = 'Validé';
    await reservation.save();

    // Mise à jour du statut du parking à 'occupé'
    const parking = await Parking.findById(reservation.id_parking);
    await parking.save();

    return { message: 'Réservation validée avec succès .', reservation };
  } catch (error) {
    throw new Error(error.message);
  }
};

const verifierReservationsNonConfirmees = async () => {
  try {
    // Récupérer les réservations en attente avec une date limite dépassée
    const reservations = await ReservationParking.find({
      statut: 'En attente',
      date_limite_confirmation: { $lt: new Date() }, // Date limite dépassée
    });

    for (const reservation of reservations) {
      // Annuler la réservation si la date limite est dépassée
      reservation.statut = 'Annulé';
      await reservation.save();
    }

  } catch (error) {
    throw new Error('Erreur lors de la vérification des réservations non confirmées : ' + error.message);
  }
};


module.exports = { getReservationsConfirmeesParClient , soumettreReservation, getReservationsClient , verifierReservationsNonConfirmees , validerReservationParManager , annulerReservation , confirmerReservation , getReservationsEnAttenteValidationManager };
