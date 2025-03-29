const FactureParking = require('../models/FactureParking');
const ReservationParking = require('../models/Reservation');

const genererFacture = async (id_reservation) => {
    try {
        // Vérifier si la réservation existe
        const reservation = await ReservationParking.findById(id_reservation);
        if (!reservation) {
            throw new Error("Réservation introuvable.");
        }

        // Vérifier si une facture existe déjà pour cette réservation
        const factureExistante = await FactureParking.findOne({ id_reservation });
        if (factureExistante) {
            throw new Error("Une facture existe déjà pour cette réservation.");
        }

        // Calcul de la durée en heures
        const dureeMS = new Date(reservation.date_fin) - new Date(reservation.date_debut);
        const dureeHeures = Math.ceil(dureeMS / (1000 * 60 * 60)); // Convertir en heures et arrondir

        // Calcul du total
        const total = dureeHeures * reservation.tarif;

        // Générer un numéro unique pour la facture
        const dernierNumero = await FactureParking.findOne().sort({ numero_facture: -1 }).select("numero_facture");
        const numeroFacture = dernierNumero ? parseInt(dernierNumero.numero_facture.split('-')[1]) + 1 : 1; // Incrémenter le numéro
        const numeroFactureString = `FACTPARK-${numeroFacture.toString().padStart(6, '0')}`; // Format du numéro

        // Extraire l'ID du client de la réservation
        const id_client = reservation.id_client;

        // Créer la facture
        const facture = await FactureParking.create({
            id_reservation,
            id_client, // Ajout de l'ID du client
            numero_facture: numeroFactureString,
            duree_parking: dureeHeures,
            tarif_heure: reservation.tarif,
            total
        });

        // Mettre à jour la réservation pour indiquer que la facture a été générée
        await ReservationParking.findByIdAndUpdate(id_reservation, { facture_genere: true });

        return { success: true, message: "Facture générée avec succès.", data: facture };
    } catch (error) {
        return { success: false, message: "Erreur lors de la génération de la facture : " + error.message };
    }
};

// Fonction pour récupérer les factures du client
const getFacturesByClient = async (id_client, page = 1, limit = 10) => {
    try {
        // Définir les limites de la journée actuelle
        const debutJournee = new Date();
        debutJournee.setHours(0, 0, 0, 0); // 00:00:00
        const finJournee = new Date();
        finJournee.setHours(23, 59, 59, 999); // 23:59:59

        const skip = (page - 1) * limit;

        // Nombre total de factures pour la journée actuelle
        const total = await FactureParking.countDocuments({
            id_client,
            date_facture: { $gte: debutJournee, $lte: finJournee }
        });

        // Récupérer les factures pour la journée avec pagination
        const factures = await FactureParking.find({
            id_client,
            date_facture: { $gte: debutJournee, $lte: finJournee }
        })
        .populate("id_reservation")  // Charger les détails de la réservation
        .sort({ date_facture: -1 })  // Trier par date décroissante
        .skip(skip)
        .limit(limit);

        if (factures.length === 0) {
            return {
                success: true,
                message: "Aucune facture trouvée pour aujourd'hui.",
                factures: [],
                total,
                totalPages: Math.ceil(total / limit),
                currentPage: page,
                limit
            };
        }

        return {
            success: true,
            factures,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            limit
        };
    } catch (error) {
        return { success: false, message: "Erreur lors de la récupération des factures : " + error.message };
    }
};

// Fonction pour récupérer les détails d'une facture
const getFactureDetails = async (id_facture) => {
    try {
        // Récupérer la facture principale
        const facture = await FactureParking.findById(id_facture).populate("id_reservation");

        if (!facture) {
            return { message: "Facture introuvable." };
        }

        // Récupérer la réservation associée pour plus de détails
        const reservation = await ReservationParking.findById(facture.id_reservation);

        if (!reservation) {
            return { message: "Réservation associée à la facture introuvable." };
        }

        // Construction des détails de la facture
        const factureComplete = {
            facture: {
                id: facture._id,
                numero_facture: facture.numero_facture,
                id_client: facture.id_client,
                id_reservation: facture.id_reservation,
                duree_parking: facture.duree_parking,
                tarif_heure: facture.tarif_heure,
                total: facture.total,
                date_facture: facture.date_facture,
            },
            reservation: {
                id_parking: reservation.id_parking,
                id_client: reservation.id_client,
                id_vehicule: reservation.id_vehicule,
                date_debut: reservation.date_debut,
                date_fin: reservation.date_fin,
                tarif: reservation.tarif,
                statut: reservation.statut
            }
        };

        return factureComplete;
    } catch (error) {
        throw new Error("Erreur lors de la récupération des détails de la facture : " + error.message);
    }
};

const getFacturesParkingDuJour = async (page = 1, limit = 10) => {
    try {
        // Définir les limites de la journée actuelle
        const debutJournee = new Date();
        debutJournee.setHours(0, 0, 0, 0);

        const finJournee = new Date();
        finJournee.setHours(23, 59, 59, 999);

        const skip = (page - 1) * limit;

        // Nombre total de factures du jour
        const total = await FactureParking.countDocuments({
            date_facture: { $gte: debutJournee, $lte: finJournee }
        });

        // Récupérer les factures du jour avec pagination
        const facturesParking = await FactureParking.find({
            date_facture: { $gte: debutJournee, $lte: finJournee }
        })
        .populate("id_reservation")  // Charger les détails de la réservation
        .sort({ date_facture: -1 })  // Trier par date décroissante
        .skip(skip)
        .limit(limit);

        return {
            success: true,
            factures: facturesParking,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            limit,
            message: facturesParking.length > 0 ? null : "Aucune facture de parking pour aujourd'hui."
        };
    } catch (error) {
        throw new Error("Erreur lors de la récupération des factures de parking du jour : " + error.message);
    }
};

const getFactureParkingDetails = async (id_facture) => {
    try {
        // Récupérer la facture principale
        const facture = await FactureParking.findById(id_facture).populate("id_reservation");

        if (!facture) {
            return { message: "Facture de parking introuvable." };
        }

        // Construction de la réponse détaillée
        const factureComplete = {
            facture: {
                id: facture._id,
                numero_facture: facture.numero_facture,
                id_client: facture.id_client,
                id_reservation: facture.id_reservation,
                duree_parking: facture.duree_parking,
                tarif_heure: facture.tarif_heure,
                total: facture.total,
                date_facture: facture.date_facture,
            },
        };

        return factureComplete;
    } catch (error) {
        throw new Error("Erreur lors de la récupération des détails de la facture de parking : " + error.message);
    }
};

module.exports = { genererFacture , getFacturesByClient, getFactureDetails , getFacturesParkingDuJour, getFactureParkingDetails };
