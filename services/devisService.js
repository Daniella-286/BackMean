const DemandeDevis = require('../models/DemandeDevis');
const DemandeDevisDetail = require('../models/DemandeDevisDetail');
const PieceSousService = require('../models/PieceSousService');
const DevisService = require('../models/DevisService');
const DevisPiece = require('../models/DevisPiece');
const SousService = require('../models/SousService');
const Piece = require('../models/Piece'); 

const envoyerDevis = async (id_demande) => {
    try {
        const demande = await DemandeDevis.findById(id_demande);
        
        if (!demande) {
            return { success: false, message: "Demande de devis introuvable." };
        }

        if (demande.statut === 'Envoyé') {
            return { success: false, message: "Cette demande a déjà été envoyée." };
        }

        // Récupérer les détails de la demande
        const detailsDemande = await DemandeDevisDetail.find({ id_demande });

        // Insérer les services dans DevisService avec leur tarif actuel
        const devisServices = await Promise.all(detailsDemande.map(async (detail) => {
            const sousService = await SousService.findById(detail.id_sous_service);
            if (!sousService) {
                throw new Error(`Sous-service introuvable: ${detail.id_sous_service}`);
            }

            return await DevisService.create({
                id_demande,
                id_sous_service: sousService._id,
                tarif: sousService.tarif // Dénormalisation du tarif
            });
        }));

        // Insérer les pièces nécessaires dans DevisPiece
        const devisPieces = await Promise.all(detailsDemande.map(async (detail) => {
            const pieces = await PieceSousService.find({ id_sous_service: detail.id_sous_service });
        
            return await Promise.all(pieces.map(async (piece) => {
                const pieceDetails = await Piece.findById(piece.id_piece); 
        
                if (!pieceDetails) {
                    throw new Error(`Pièce introuvable: ${piece.id_piece}`);
                }
        
                return await DevisPiece.create({
                    id_demande,
                    id_sous_service: piece.id_sous_service,
                    id_piece: piece.id_piece,
                    quantite: piece.quantite,
                    prix_unitaire: pieceDetails.prix_unitaire 
                });
            }));
        }));

        // Mettre à jour le statut en "Envoyé"
        demande.statut = 'Envoyé';
        await demande.save();

        return { 
            success: true, 
            message: "Devis envoyé avec succès.", 
            data: { devisServices, devisPieces } 
        };
    } catch (error) {
        return { success: false, message: "Erreur lors de l'envoi du devis: " + error.message };
    }
};

const getDevisDetails = async (id_demande) => {
    try {
        const services = await DevisService.find({ id_demande })
            .populate("id_sous_service", "nom_sous_service"); // Affiche le nom et la description du sous-service
        
        const pieces = await DevisPiece.find({ id_demande })
            .populate("id_sous_service")
            .populate("id_piece", "nom_piece");

        if (!services.length && !pieces.length) {
            return { success: false, message: "Aucun détail trouvé pour ce devis." };
        }

        // Calcul du total des sous-services
        const totalServices = services.reduce((total, service) => {
            return total + (service.tarif || 0);
        }, 0);

        // Calcul du total des pièces
        const totalPieces = pieces.reduce((total, piece) => {
            return total + ((piece.prix_unitaire || 0) * (piece.quantite || 1));
        }, 0);

        // Total général du devis
        const totalDevis = totalServices + totalPieces;

        return {
            success: true,
            data: { services, pieces , totalServices, totalPieces, totalDevis }
        };
    } catch (error) {
        return { success: false, message: "Erreur lors de la récupération du devis: " + error.message };
    }
};

module.exports = {
    envoyerDevis , getDevisDetails
};
