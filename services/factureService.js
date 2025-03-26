const Facture = require('../models/Facture');
const DetailFacture1 = require('../models/DetailFacture1'); // Détails des services
const DetailFacture2 = require('../models/DetailFacture2'); // Détails des pièces
const Intervention = require('../models/Intervention');
const Piece = require('../models/Piece'); // Modèle pour récupérer les prix des pièces
const Service = require('../models/Service'); // Modèle pour récupérer les prix des services
const DevisPiece = require('../models/DevisPiece'); // Modèle des pièces du devis
const PieceUtilise = require('../models/PieceUtilise'); // Modèle des pièces utilisées
const DevisService = require('../models/DevisService'); // Modèle des services du devis

// Générer la facture principale
const generateFacture = async (id_intervention) => {
    try {
        const intervention = await Intervention.findById(id_intervention).populate('id_rdv');

        if (!intervention) throw new Error("Intervention non trouvée.");
        if (intervention.avancement !== 'Terminé') throw new Error("L'intervention doit être terminée pour générer une facture.");

        const id_client = intervention.id_rdv.id_client;


        const nouvelleFacture = new Facture({
            id_client,
            id_intervention,
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

        const intervention = await Intervention.findById(interventionId).populate({
            path: 'id_rdv',
            populate: { path: 'id_demande' }
        });

        if (!intervention) throw new Error("Intervention introuvable.");

        const id_demande = intervention.id_rdv.id_demande;

        // Récupérer les pièces du devis (DevisPiece)
        const piecesDevis = await DevisPiece.find({ id_demande: id_demande });

        for (const piece of piecesDevis) {
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

        // Récupérer les pièces réellement utilisées lors de l'intervention (PieceUtilise)
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
        await DetailFacture2.insertMany(details);

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


module.exports = { genererFacture };
