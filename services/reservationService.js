const ReservationParking = require('../models/Reservation');
const Parking = require('../models/Parking');
const Deadline = require('../models/Deadline');

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
const getReservationsClient = async (id_client, date_debut, date_fin, page = 1, limit = 10) => {
  try {
    // Si aucune date n'est fournie, prendre les 7 derniers jours par défaut
    if (!date_debut || !date_fin) {
      const today = new Date();
      date_fin = date_fin ? new Date(date_fin) : new Date(today); // Copier today pour éviter la modification
      date_debut = date_debut ? new Date(date_debut) : new Date(today.setDate(today.getDate() - 7)); // Par défaut, 7 jours avant aujourd'hui
      date_debut.setUTCHours(0, 0, 0, 0);
      date_fin.setUTCHours(23, 59, 59, 999);
    } else {
      date_debut = new Date(date_debut);
      date_fin = new Date(date_fin);
    }

    date_fin.setDate(date_fin.getDate() + 7); // Décaler la date de fin de 7 jours

    // Filtrer les réservations
    const filter = {
      id_client: id_client,
      statut: "En attente",
      date_limite_confirmation: { $gte: date_debut, $lte: date_fin }
    };

    // Calculer l'offset (skip) pour la pagination
    const skip = (page - 1) * limit;

    // Rechercher les réservations du client avec pagination
    const reservations = await ReservationParking.find(filter)
      .skip(skip) // Appliquer l'offset
      .limit(limit) // Limiter le nombre de résultats par page
      .populate("id_parking", "numero")
      .populate("id_vehicule", "marque modele immatriculation") // Infos du véhicule
      .sort({ date_debut: -1 }); // Trier par date décroissante (plus récente en premier)

    // Compter le nombre total de réservations pour la pagination
    const totalReservations = await ReservationParking.countDocuments(filter);

    if (reservations.length === 0) {
      return { success: true, message: "Aucune réservation trouvée pour cette période." };
    }

    // Retourner les réservations avec informations de pagination
    return {
      success: true,
      reservations: reservations,
      total: totalReservations,
      page,
      limit,
      totalPages: Math.ceil(totalReservations / limit) // Calculer le nombre total de pages
    };
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

const getReservationsValides = async (id_client, date_debut, date_fin, page = 1, limit = 10) => {
  try {
    // Si aucune date n'est fournie, prendre les 7 derniers jours par défaut
    if (!date_debut || !date_fin) {
      const today = new Date();
      date_fin = date_fin ? new Date(date_fin) : new Date(today); // Copier today pour éviter la modification
      date_debut = date_debut ? new Date(date_debut) : new Date(today.setDate(today.getDate() - 7)); // Par défaut, 7 jours avant aujourd'hui
      date_debut.setUTCHours(0, 0, 0, 0);
      date_fin.setUTCHours(23, 59, 59, 999);
    } else {
      date_debut = new Date(date_debut);
      date_fin = new Date(date_fin);
    }

    // Filtrer les réservations confirmées du client avec la période donnée
    const filter = {
      id_client: id_client,
      statut: "Validé",
      date_debut: { $gte: date_debut, $lte: date_fin }
    };

    // Calculer l'offset (skip) pour la pagination
    const skip = (page - 1) * limit;

    // Rechercher les réservations confirmées avec pagination
    const reservations = await ReservationParking.find(filter)
      .skip(skip)
      .limit(limit)
      .populate("id_vehicule", "marque modele immatriculation") // Infos du véhicule
      .populate("id_parking", "numero") // Infos du parking
      .sort({ date_debut: -1 }); // Trier par date décroissante

    // Compter le nombre total de réservations pour la pagination
    const totalReservations = await ReservationParking.countDocuments(filter);

    if (reservations.length === 0) {
      return { success: true, message: "Aucune réservation confirmée trouvée pour cette période." };
    }

    return {
      success: true,
      reservations,
      total: totalReservations,
      page,
      limit,
      totalPages: Math.ceil(totalReservations / limit)
    };
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

const getReservationsConfirmees = async (id_client, date_debut, date_fin, page = 1, limit = 10) => {
  try {
    // Si aucune date n'est fournie, prendre les 7 derniers jours par défaut
    if (!date_debut || !date_fin) {
      const today = new Date();
      date_fin = date_fin ? new Date(date_fin) : new Date(today);
      date_debut = date_debut ? new Date(date_debut) : new Date(today.setDate(today.getDate() - 7));

      date_debut.setUTCHours(0, 0, 0, 0);
      date_fin.setUTCHours(23, 59, 59, 999);
    } else {
      date_debut = new Date(date_debut);
      date_fin = new Date(date_fin);
    }

    // Filtrer les réservations avec statut "Confirmé"
    const filter = {
      id_client,
      statut: "Confirmé",
      date_debut: { $gte: date_debut, $lte: date_fin }
    };

    // Calcul de la pagination
    const skip = (page - 1) * limit;

    // Recherche des réservations
    const reservations = await ReservationParking.find(filter)
      .skip(skip)
      .limit(limit)
      .populate("id_parking", "numero")
      .populate("id_vehicule", "marque modele immatriculation")
      .sort({ date_debut: -1 });

    // Compter le nombre total de réservations confirmées
    const totalReservations = await ReservationParking.countDocuments(filter);

    if (reservations.length === 0) {
      return { success: true, message: "Aucune réservation confirmée trouvée pour cette période." };
    }

    return {
      success: true,
      reservations,
      total: totalReservations,
      page,
      limit,
      totalPages: Math.ceil(totalReservations / limit)
    };
  } catch (error) {
    throw new Error(error.message);
  }
};

//reservation en attente de validation vu par le manager
const getReservationsEnAttenteValidationManager = async (date_debut, date_fin, page = 1, limit = 10) => {
  try {
    // Si aucune date n'est fournie, définir une période par défaut (30 jours avant aujourd'hui)
    if (!date_debut || !date_fin) {
      const today = new Date();
      date_fin = date_fin ? new Date(date_fin) : new Date(today); // Copier today pour éviter la modification
      date_debut = date_debut ? new Date(date_debut) : new Date(today.setDate(today.getDate() - 7)); // Par défaut, 30 jours avant aujourd'hui
      date_debut.setUTCHours(0, 0, 0, 0);
      date_fin.setUTCHours(23, 59, 59, 999);
    } else {
      date_debut = new Date(date_debut);
      date_fin = new Date(date_fin);
    }

    date_fin.setDate(date_fin.getDate() + 7);

    // Calculer l'offset (skip) pour la pagination
    const skip = (page - 1) * limit;

    // Exécution de la requête MongoDB avec les dates en UTC (ISODate explicite) et la pagination
    const reservations = await ReservationParking.find({
      statut: "Confirmé",
      date_limite_confirmation: { $gte: date_debut, $lte: date_fin }
    })
      .skip(skip) // Appliquer l'offset
      .limit(limit) // Limiter le nombre de résultats par page
      .populate("id_parking")
      .populate({ path: "id_client", select: "nom prenom email telephone" })
      .populate({ path: "id_vehicule", select: "marque modele annee immatriculation" });

    // Compter le nombre total de réservations pour la pagination
    const totalReservations = await ReservationParking.countDocuments({
      statut: "Confirmé",
      date_limite_confirmation: { $gte: date_debut, $lte: date_fin }
    });

    // Retourner les résultats avec les informations de pagination
    return {
      success: true,
      reservations,
      total: totalReservations,
      page,
      limit,
      totalPages: Math.ceil(totalReservations / limit), // Calculer le nombre total de pages
    };
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

const getReservationsFacturables = async (page = 1, limit = 10) => {
  try {
    const today = new Date();

    today.setHours(today.getHours() + 1);

    console.log("Today:", today);

    // Calculer l'offset (skip) pour la pagination
    const skip = (page - 1) * limit;

    // Exécution de la requête MongoDB avec pagination
    const reservations = await ReservationParking.find({
      statut: "Validé",
      date_fin: { $lte: today },
      facture_genere: false
    })
      .skip(skip) // Appliquer l'offset
      .limit(limit) // Limiter le nombre de résultats par page
      .populate("id_parking", "numero")
      .populate("id_client", "nom prenom email")
      .populate("id_vehicule", "marque modele immatriculation");

    // Compter le nombre total de réservations pour la pagination
    const totalReservations = await ReservationParking.countDocuments({
      statut: "Validé",
      date_fin: { $lte: today },
      facture_genere: false
    });

    if (reservations.length === 0) {
      return {
        message: "Aucune réservation à facturer.",
        total: 0,
        page,
        limit,
        totalPages: 0,
      };
    }

    // Retourner les résultats paginés avec les informations de pagination
    return {
      success: true,
      reservations,
      total: totalReservations,
      page,
      limit,
      totalPages: Math.ceil(totalReservations / limit), // Calculer le nombre total de pages
    };
  } catch (error) {
    throw new Error("Erreur lors de la récupération des réservations facturables : " + error.message);
  }
};

module.exports = { getReservationsValides , getReservationsConfirmees ,  soumettreReservation, getReservationsClient , verifierReservationsNonConfirmees , validerReservationParManager , annulerReservation , confirmerReservation , getReservationsEnAttenteValidationManager , getReservationsFacturables };
