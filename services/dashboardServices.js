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
const Mecanicien = require('../models/Mecanicien');

// Nombre total d’interventions réalisées
const getTotalInterventions = async () => {
    return await Intervention.countDocuments({ avancement: "Terminé" });
};

// Nombre total de clients
const getNombreClients = async () => {
    return await Client.countDocuments();
};

// Nombre total de réservations effectuées
const getNombreReservations = async () => {
    return await ReservationParking.countDocuments();
};

// Nombre total en caisse
const getTotalCaisse = async () => {
    try {
        // Somme des paiements de services
        const totalService = await PaiementService.aggregate([
            { $group: { _id: null, total: { $sum: "$montant" } } }
        ]);

        // Somme des paiements de parking
        const totalParking = await PaiementParking.aggregate([
            { $group: { _id: null, total: { $sum: "$montant" } } }
        ]);

        // Calcul du total encaissé
        const totalCaisse = (totalService[0]?.total || 0) + (totalParking[0]?.total || 0);

        return { success: true, totalCaisse };
    } catch (error) {
        return { success: false, message: `Erreur lors du calcul du total en caisse : ${error.message}` };
    }
};

// Nombre total de mécaniciens
const getNombreMecaniciens = async () => {
    return await Mecanicien.countDocuments({ statut: true });
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

// Reste en stock
const getStockRestant = async (page = 1, limit = 10) => {
    try {
        const skip = (page - 1) * limit;

        // Récupérer les pièces avec pagination
        const pieces = await Piece.find().skip(skip).limit(limit);

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
            const dateUTC = new Date();
            dateUTC.setHours(dateUTC.getHours() + 2); // Décale l'heure de +2 heures (ton fuseau horaire)
            const dateConsultation = dateUTC.toISOString();

            // Ajouter aux résultats
            stockRestant.push({
                nom_piece: piece.nom_piece,
                prix_unitaire: piece.prix_unitaire,
                stock_restant: resteEnStock,
                date_consultation: dateConsultation // Date actuelle
            });
        }

        // Compter le nombre total de pièces pour la pagination
        const totalPieces = await Piece.countDocuments();

        return {
            totalPieces,
            page,
            limit,
            totalPages: Math.ceil(totalPieces / limit),
            stockRestant
        };
    } catch (error) {
        throw new Error(`Erreur lors du calcul du stock restant : ${error.message}`);
    }
};

// Récupérer l'historique des mouvements de stock (entrées et sorties)
const getStockHistory = async (page = 1, limit = 10) => {
    try {
        const skip = (page - 1) * limit;
        
        // Compter le nombre total d'éléments
        const totalDocuments = await MouvementStock.countDocuments();
        
        // Récupérer les mouvements de stock avec pagination
        const stockHistory = await MouvementStock.find()
            .populate('id_piece')
            .populate('id_type_mouvement')
            .skip(skip)
            .limit(limit)
            .sort({ date_mouvement: -1 }); // Trier du plus récent au plus ancien

        return {
            totalDocuments,
            page,
            limit,
            totalPages: Math.ceil(totalDocuments / limit),
            stockHistory
        };
    } catch (error) {
        throw new Error(`Erreur lors de la récupération de l’historique : ${error.message}`);
    }
};


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

module.exports = {
    getTotalInterventions,
    getAverageInvoiceAmount,
    getInterventionsTermineesParMois,
    getNombreMecaniciens,
    getStockHistory,
    getStockRestant,
    getMontantTotalParMois,
    getTotalCaisse,
    getNombreReservations,
    getNombreClients
};
