const Intervention = require("../models/Intervention");
const Facture = require("../models/Facture");
const DetailFacture1 = require("../models/DetailFacture1");
const Piece = require('../models/Piece');
const MouvementStock = require('../models/MouvementStock');
const Client = require('../models/Client');
const ReservationParking = require('../models/Reservation');
const FactureService = require('../models/Facture');
const FactureParking = require('../models/FactureParking');
const TypeMouvement = require('../models/TypeMouvement');
const PaiementService = require('../models/PaiementService');
const PaiementParking = require('../models/PaiementParking');

///// Activité du garage (Réparations & Services)

// Nombre total d’interventions réalisées
const getTotalInterventions = async () => {
    return await Intervention.countDocuments({ avancement: "Terminé" });
};

// Moyenne des montants facturés par intervention
const getAverageInvoiceAmount = async () => {
    const result = await Facture.aggregate([
        {
            $group: {
                _id: null,
                avgAmount: { $avg: "$total" },
            },
        },
    ]);
    return result.length > 0 ? result[0].avgAmount : 0;
};

// Interventions terminées par mois
const getInterventionsTermineesParMois = async (annee) => {
    try {
        // Si aucune année spécifiée, prendre l'année actuelle
        const anneeRecherchee = annee || new Date().getFullYear();

        const stats = await Intervention.aggregate([
            // Filtrer les interventions terminées dans l'année choisie
            {
                $match: {
                    avancement: "Terminé",
                    date_fin_intervention: {
                        $gte: new Date(`${anneeRecherchee}-01-01T00:00:00.000Z`),
                        $lt: new Date(`${anneeRecherchee + 1}-01-01T00:00:00.000Z`)
                    }
                }
            },
            // Extraire le mois à partir de la date de fin
            {
                $group: {
                    _id: { $month: "$date_fin_intervention" }, // Mois de fin d'intervention
                    total: { $sum: 1 } // Nombre d'interventions terminées
                }
            },
            // Trier par mois (1 = Janvier, 12 = Décembre)
            { $sort: { "_id": 1 } }
        ]);

        // Convertir les résultats en un format plus lisible
        const result = Array.from({ length: 12 }, (_, i) => ({
            mois: i + 1,
            nombre_interventions: 0
        }));

        stats.forEach(stat => {
            result[stat._id - 1].nombre_interventions = stat.total;
        });

        return {
            annee: anneeRecherchee,
            statistiques: result
        };

    } catch (error) {
        throw new Error(`Erreur lors de la récupération des statistiques d'interventions : ${error.message}`);
    }
};

///// Suivi du stock

// Récupérer l'historique des mouvements de stock (entrées et sorties)
const getStockHistory = async () => {
    return await MouvementStock.find().populate('id_piece');
};

// Reste en stock
const getStockRestant = async () => {
    try {
        // Récupérer toutes les pièces
        const pieces = await Piece.find();

        let stockRestant = [];

        for (const piece of pieces) {
            // Calculer les entrées (mouvements de type "Entrée de stock")
            const entrees = await MouvementStock.aggregate([
                { $match: { id_piece: piece._id } },
                { 
                    $lookup: { 
                        from: "typemouvements", 
                        localField: "id_type_mouvement", 
                        foreignField: "_id", 
                        as: "type" 
                    } 
                },
                { $unwind: "$type" },
                { $match: { "type.nom_type": "Entrée" } },
                { $group: { _id: null, total: { $sum: "$quantite" } } }
            ]);

            // Calculer les sorties (mouvements de type "Sortie de stock")
            const sorties = await MouvementStock.aggregate([
                { $match: { id_piece: piece._id } },
                { 
                    $lookup: { 
                        from: "typemouvements", 
                        localField: "id_type_mouvement", 
                        foreignField: "_id", 
                        as: "type" 
                    } 
                },
                { $unwind: "$type" },
                { $match: { "type.nom_type": "Sortie" } },
                { $group: { _id: null, total: { $sum: "$quantite" } } }
            ]);

            // Calculer le stock restant
            const totalEntrees = entrees.length > 0 ? entrees[0].total : 0;
            const totalSorties = sorties.length > 0 ? sorties[0].total : 0;
            const resteEnStock = totalEntrees - totalSorties;

            // Ajouter aux résultats
            stockRestant.push({
                nom_piece: piece.nom_piece,
                prix_unitaire: piece.prix_unitaire,
                stock_restant: resteEnStock,
                date_consultation: new Date().toISOString() // Date actuelle
            });
        }

        return stockRestant;
    } catch (error) {
        throw new Error(`Erreur lors du calcul du stock restant : ${error.message}`);
    }
};

///// Suivi financier

// Montant total encaissé (par période)
const getMontantTotalParMois = async (annee) => {
    try {
        // Si aucune année spécifiée, prendre l'année actuelle
        const anneeRecherchee = annee || new Date().getFullYear();

        // Pipeline d'agrégation pour les paiements de service
        const paiementsService = await PaiementService.aggregate([
            {
                $match: {
                    date_paiement: {
                        $gte: new Date(`${anneeRecherchee}-01-01T00:00:00.000Z`),
                        $lt: new Date(`${anneeRecherchee + 1}-01-01T00:00:00.000Z`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: "$date_paiement" }, // Mois du paiement
                    total: { $sum: "$montant" } // Total des paiements
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // Pipeline d'agrégation pour les paiements de parking
        const paiementsParking = await PaiementParking.aggregate([
            {
                $match: {
                    date_paiement: {
                        $gte: new Date(`${anneeRecherchee}-01-01T00:00:00.000Z`),
                        $lt: new Date(`${anneeRecherchee + 1}-01-01T00:00:00.000Z`)
                    }
                }
            },
            {
                $group: {
                    _id: { $month: "$date_paiement" }, // Mois du paiement
                    total: { $sum: "$montant" } // Total des paiements
                }
            },
            { $sort: { "_id": 1 } }
        ]);

        // Formatage des résultats
        const result = Array.from({ length: 12 }, (_, i) => ({
            mois: i + 1,
            montant_service: 0,
            montant_parking: 0
        }));

        paiementsService.forEach(p => {
            result[p._id - 1].montant_service = p.total;
        });

        paiementsParking.forEach(p => {
            result[p._id - 1].montant_parking = p.total;
        });

        return {
            annee: anneeRecherchee,
            statistiques: result
        };

    } catch (error) {
        throw new Error(`Erreur lors de la récupération des montants en caisse : ${error.message}`);
    }
};

// Nombre de factures générées et montants totaux
const getFacturesStats = async () => {
    const nbFacturesService = await FactureService.countDocuments();
    const totalMontantService = await FactureService.aggregate([
        { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    const nbFacturesParking = await FactureParking.countDocuments();
    const totalMontantParking = await FactureParking.aggregate([
        { $group: { _id: null, total: { $sum: '$total' } } }
    ]);

    return {
        nbFactures: nbFacturesService + nbFacturesParking,
        montant_total: (totalMontantService[0]?.total || 0) + (totalMontantParking[0]?.total || 0)
    };
};

/////  Occupation et gestion du parking

// Taux d'occupation du parking (réservations en cours)
const getTauxOccupation = async (capaciteTotale) => {
    const reservationsEnCours = await ReservationParking.countDocuments({ statut: 'active' });
    return ((reservationsEnCours / capaciteTotale) * 100).toFixed(2); // En pourcentage
};

// Nombre total de réservations effectuées
const getNombreReservations = async () => {
    return await ReservationParking.countDocuments();
};

// Durée moyenne des réservations (en heures)
const getDureeMoyenneReservations = async () => {
    const result = await ReservationParking.aggregate([
        { 
            $project: { 
                duree: { $divide: [{ $subtract: ["$date_fin", "$date_debut"] }, 1000 * 60 * 60] } 
            } 
        },
        { $group: { _id: null, moyenne: { $avg: "$duree" } } }
    ]);

    return result[0]?.moyenne?.toFixed(2) || 0; // Durée moyenne en heures
};

///// Statistiques générales 

// Nombre total de clients
const getNombreClients = async () => {
    return await Client.countDocuments();
};

// Nombre total de réservations (services + parking)
const getNombreReservations2 = async () => {
    const reservationsServices = await Intervention.countDocuments();
    const reservationsParking = await ReservationParking.countDocuments();
    return reservationsServices + reservationsParking;
};

// Nombre total de factures générées (services + parking)
const getNombreFactures = async () => {
    const facturesServices = await FactureService.countDocuments();
    const facturesParking = await FactureParking.countDocuments();
    return facturesServices + facturesParking;
};


module.exports = {
    getTotalInterventions,
    getAverageInvoiceAmount,
    getInterventionsTermineesParMois,
    getStockHistory,
    getStockRestant,
    getMontantTotalParMois,

    getFacturesStats,
    getTauxOccupation,
    getNombreReservations,
    getDureeMoyenneReservations,
    getNombreClients,
    getNombreReservations2,
    getNombreFactures
};
