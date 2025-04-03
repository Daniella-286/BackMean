const Facture = require('../models/Facture');
const DetailFacture1 = require('../models/DetailFacture1'); 
const DetailFacture2 = require('../models/DetailFacture2'); 
const Intervention = require('../models/Intervention');
const Piece = require('../models/Piece'); 
const Service = require('../models/Service'); 
const DevisPiece = require('../models/DevisPiece');
const PieceUtilise = require('../models/PieceUtilise'); 
const DevisService = require('../models/DevisService'); 

// Générer la facture principale
const generateFacture = async (id_intervention) => {
    try {
        const intervention = await Intervention.findById(id_intervention).populate('id_rdv');

        if (!intervention) throw new Error("Intervention non trouvée.");
        if (intervention.avancement !== 'Terminé') throw new Error("L'intervention doit être terminée pour générer une facture.");

        const id_client = intervention.id_rdv.id_client;

        // Vérifier si une facture existe déjà pour cette intervention
        const factureExistante = await Facture.findOne({ id_intervention });
        if (factureExistante) {
            throw new Error("Une facture existe déjà pour cette intervention.");
        }

        // Générer un numéro unique pour la facture
        const dernierNumero = await Facture.findOne().sort({ numero_facture: -1 }).select("numero_facture");
        const numeroFacture = dernierNumero ? parseInt(dernierNumero.numero_facture.split('-')[1]) + 1 : 1; // Incrémenter le numéro
        const numeroFactureString = `FACT-${numeroFacture.toString().padStart(6, '0')}`; // Format du numéro

        // Créer la facture
        const nouvelleFacture = new Facture({
            id_client,
            id_intervention,
            numero_facture: numeroFactureString,
            total: 0, // On calculera le total après
        });

        const facture = await nouvelleFacture.save();

        return facture;
    } catch (error) {
        console.error("Erreur dans generateFacture :", error.message);
        throw new Error(error.message);
    }
};

// Ajouter les détails des services effectués
const addDetailFacture1 = async (factureId, interventionId) => {
    try {
        const intervention = await Intervention.findById(interventionId).populate({
            path: 'id_rdv',
            populate: { path: 'id_demande' }
        });

        if (!intervention) throw new Error("Intervention introuvable.");

        const id_demande = intervention.id_rdv.id_demande;
        const services = await DevisService.find({ id_demande });


        let totalServices = 0;
        const details = services.map(service => {
            totalServices += service.tarif;
            return {
                id_facture: factureId,
                id_sous_service: service.id_sous_service,
                tarif: service.tarif,
            };
        });

        await DetailFacture1.insertMany(details);

        return totalServices;
    } catch (error) {
        console.error("Erreur dans addDetailFacture1 :", error.message);
        throw new Error("Erreur lors de l'ajout des détails de services : " + error.message);
    }
};

// Ajouter les détails des pièces utilisées
const addDetailFacture2 = async (factureId, interventionId) => {
    try {
        let totalPieces = 0;
        const details = [];

        // Vérifier si l'intervention existe
        const intervention = await Intervention.findById(interventionId);
        if (!intervention) throw new Error("Intervention introuvable.");

        // Récupérer uniquement les pièces réellement utilisées (PieceUtilise)
        const piecesUtilisees = await PieceUtilise.find({ id_intervention: interventionId });

        for (const piece of piecesUtilisees) {
            const infoPiece = await Piece.findById(piece.id_piece);
            if (!infoPiece) continue;

            const sousTotal = piece.quantite * piece.prix_unitaire;
            totalPieces += sousTotal;

            details.push({
                id_facture: factureId,
                id_piece: piece.id_piece,
                quantite: piece.quantite,
                prix_unitaire: piece.prix_unitaire,
            });
        }

        // Insérer toutes les pièces dans DetailFacture2
        if (details.length > 0) {
            await DetailFacture2.insertMany(details);
        }

        return totalPieces;
    } catch (error) {
        console.error("Erreur dans addDetailFacture2 :", error.message);
        throw new Error("Erreur lors de l'ajout des pièces utilisées : " + error.message);
    }
};

// Fonction principale pour générer une facture complète
const genererFacture = async (id_intervention) => {
    try {

        const facture = await generateFacture(id_intervention);

        const totalServices = await addDetailFacture1(facture._id, id_intervention);

        const totalPieces = await addDetailFacture2(facture._id, id_intervention);

        // Mise à jour du total de la facture
        facture.total = totalPieces + totalServices;
        await facture.save();

        //  Récupérer les détails des services facturés
        const detailsServices = await DetailFacture1.find({ id_facture: facture._id }).populate('id_sous_service');

        //  Récupérer les détails des pièces facturées
        const detailsPieces = await DetailFacture2.find({ id_facture: facture._id }).populate('id_piece');

        // Construire la réponse détaillée
        const factureComplete = {
            message: "Facture générée avec succès",
            facture: {
                id: facture._id,
                id_client: facture.id_client,
                numero_facture: facture.numero_facture,
                id_intervention: facture.id_intervention,
                total: facture.total,
                date_facture: facture.date_facture,
            },
            details_services: detailsServices.map(service => ({
                id_sous_service: service.id_sous_service._id,
                nom: service.id_sous_service.nom,
                tarif: service.tarif,
                sous_total: service.tarif
            })),
            total_services: totalServices,
            details_pieces: detailsPieces.map(piece => ({
                id_piece: piece.id_piece._id,
                nom: piece.id_piece.nom,
                quantite: piece.quantite,
                prix_unitaire: piece.prix_unitaire,
                sous_total: piece.quantite * piece.prix_unitaire
            })),
            total_pieces: totalPieces,
            total_facture: facture.total,
        };


        return factureComplete;
    } catch (error) {
        console.error("Erreur lors de la génération de la facture :", error.message);
        throw new Error("Erreur lors de la génération de la facture : " + error.message);
    }
};

const getFacturesByClient = async (id_client, page = 1, limit = 10) => {
    try {
        // Définir les limites de la journée actuelle
        const debutJournee = new Date();
        debutJournee.setHours(0, 0, 0, 0); 

        const finJournee = new Date();
        finJournee.setHours(23, 59, 59, 999); 

        const skip = (page - 1) * limit;

        // Nombre total de factures pour le client aujourd'hui
        const total = await Facture.countDocuments({
            id_client,
            date_facture: { $gte: debutJournee, $lte: finJournee }
        });

        // Récupérer les factures avec pagination
        const factures = await Facture.find({
            id_client,
            date_facture: { $gte: debutJournee, $lte: finJournee }
        })
        .populate("id_intervention") // Charger les détails de l'intervention
        .sort({ date_facture: -1 }) // Trier par date décroissante
        .skip(skip)
        .limit(limit);

        return {
            success: true,
            factures,
            total,
            totalPages: Math.ceil(total / limit),
            page,
            limit,
        };
    } catch (error) {
        return { success: false, message: "Erreur lors de la récupération des factures : " + error.message };
    }
};
  
const getFactureDetails = async (id_facture) => {
    try {
        // Récupérer la facture principale
        const facture = await Facture.findById(id_facture).populate("id_intervention");

        if (!facture) {
            return { message: "Facture introuvable." };
        }

        // Récupérer les détails des services facturés
        const detailsServices = await DetailFacture1.find({ id_facture }).populate("id_sous_service");

        // Récupérer les détails des pièces facturées
        const detailsPieces = await DetailFacture2.find({ id_facture }).populate("id_piece");

        // Calcul du total des services
        const totalServices = detailsServices.reduce((total, service) => total + service.tarif, 0);

        // Calcul du total des pièces
        const totalPieces = detailsPieces.reduce((total, piece) => total + (piece.quantite * piece.prix_unitaire), 0);

        // Construire la réponse détaillée
        const factureComplete = {
            facture: {
                id: facture._id,
                numero_facture: facture.numero_facture,
                id_client: facture.id_client,
                id_intervention: facture.id_intervention,
                total: facture.total,
                date_facture: facture.date_facture,
            },
            details_services: detailsServices.map(service => ({
                id_sous_service: service.id_sous_service._id,
                nom: service.id_sous_service.nom,
                tarif: service.tarif,
                sous_total: service.tarif
            })),
            total_services: totalServices,
            details_pieces: detailsPieces.map(piece => ({
                id_piece: piece.id_piece._id,
                nom: piece.id_piece.nom,
                quantite: piece.quantite,
                prix_unitaire: piece.prix_unitaire,
                sous_total: piece.quantite * piece.prix_unitaire
            })),
            total_pieces: totalPieces,
            total_facture: facture.total,
        };

        return factureComplete;
    } catch (error) {
        throw new Error("Erreur lors de la récupération des détails de la facture : " + error.message);
    }
};

const getFacturesDuJour = async (page = 1, limit = 10) => {
    try {
        // Définition des limites pour la journée en cours
        const debutJournee = new Date();
        debutJournee.setHours(0, 0, 0, 0);

        const finJournee = new Date();
        finJournee.setHours(23, 59, 59, 999);

        const skip = (page - 1) * limit;

        // Nombre total de factures du jour
        const total = await Facture.countDocuments({
            date_facture: { $gte: debutJournee, $lte: finJournee }
        });

        // Récupérer les factures avec pagination
        const factures = await Facture.find({
            date_facture: { $gte: debutJournee, $lte: finJournee }
        })
        .populate("id_intervention") // Charger les détails de l'intervention
        .sort({ date_facture: -1 }) // Trier par date décroissante
        .skip(skip)
        .limit(limit);

        return {
            success: true,
            factures,
            total,
            totalPages: Math.ceil(total / limit),
            page,
            limit,
        };
    } catch (error) {
        return { success: false, message: "Erreur lors de la récupération des factures du jour : " + error.message };
    }
};

const getFacturesDuJourDetails = async (id_facture) => {
    try {
        // Récupérer la facture principale
        const facture = await Facture.findById(id_facture).populate("id_intervention");

        if (!facture) {
            return { message: "Facture introuvable." };
        }

        // Récupérer les détails des services facturés
        const detailsServices = await DetailFacture1.find({ id_facture }).populate("id_sous_service");

        // Récupérer les détails des pièces facturées
        const detailsPieces = await DetailFacture2.find({ id_facture }).populate("id_piece");

        // Calcul du total des services
        const totalServices = detailsServices.reduce((total, service) => total + service.tarif, 0);

        // Calcul du total des pièces
        const totalPieces = detailsPieces.reduce((total, piece) => total + (piece.quantite * piece.prix_unitaire), 0);

        // Construire la réponse détaillée
        const factureComplete = {
            facture: {
                id: facture._id,
                numero_facture: facture.numero_facture,
                id_client: facture.id_client,
                id_intervention: facture.id_intervention,
                total: facture.total,
                date_facture: facture.date_facture,
            },
            details_services: detailsServices.map(service => ({
                id_sous_service: service.id_sous_service._id,
                nom: service.id_sous_service.nom,
                tarif: service.tarif,
                sous_total: service.tarif
            })),
            total_services: totalServices,
            details_pieces: detailsPieces.map(piece => ({
                id_piece: piece.id_piece._id,
                nom: piece.id_piece.nom,
                quantite: piece.quantite,
                prix_unitaire: piece.prix_unitaire,
                sous_total: piece.quantite * piece.prix_unitaire
            })),
            total_pieces: totalPieces,
            total_facture: facture.total,
        };

        return factureComplete;
    } catch (error) {
        throw new Error("Erreur lors de la récupération des détails de la facture : " + error.message);
    }
};


module.exports = { genererFacture , getFacturesByClient , getFactureDetails  , getFacturesDuJour , getFacturesDuJourDetails };
