const Intervention = require('../models/Intervention');
const RendezVous = require('../models/RendezVous');
const DemandeDevis = require('../models/DemandeDevis');
const Mecanicien = require("../models/Mecanicien");
const DemandeDevisDetail = require('../models/DemandeDevisDetail');
const Piece = require('../models/Piece');
const PieceUtilise = require('../models/PieceUtilise');
const DevisPiece = require('../models/DevisPiece');
const moment = require('moment'); 

const fetchHistoriqueIntervention = async (id_vehicule, page = 1, limit = 10) => {
    try {
        // Définir les limites de la journée actuelle
        const debutJournee = new Date();
        debutJournee.setHours(0, 0, 0, 0); // 00:00:00
        const finJournee = new Date();
        finJournee.setHours(23, 59, 59, 999); // 23:59:59

        const skip = (page - 1) * limit;

        // Rechercher toutes les interventions terminées pour le véhicule
        const interventions = await Intervention.find({ id_vehicule, avancement: "Terminé" }) // 🔹 Ajout du filtre ici
            .populate({
                path: 'id_rdv',
                populate: {
                    path: 'id_demande',
                    model: 'DemandeDevis',
                    populate: { 
                        path: 'id_client', 
                        model: 'Client' 
                    }
                }
            })
            .populate({
                path: 'id_vehicule',
                populate: [
                    { path: 'id_marque', model: 'Marque' },
                    { path: 'id_modele', model: 'Modele' }
                ]
            })
            .skip(skip)
            .limit(limit)
            .exec();

        // Récupérer le nombre total d'interventions terminées pour le véhicule
        const total = await Intervention.countDocuments({ id_vehicule, avancement: "Terminé" });

        if (!interventions || interventions.length === 0) {
            return { success: false, message: "Aucune intervention terminée pour ce véhicule", total, totalPages: 0, currentPage: page };
        }

        // Récupération des sous-services pour chaque intervention terminée
        const historique = await Promise.all(interventions.map(async (intervention) => {
            let services = [];

            if (intervention.id_rdv?.id_demande) {
                const demandeDetails = await DemandeDevisDetail.find({ id_demande: intervention.id_rdv.id_demande._id })
                    .populate({ path: 'id_sous_service', select: 'nom_sous_service' });

                // Formatage pour ne renvoyer que { id, nom }
                services = demandeDetails.map(detail => ({
                    id: detail.id_sous_service._id,
                    nom: detail.id_sous_service.nom_sous_service
                }));
            }

            return {
                id_intervention: intervention._id,
                date_intervention: intervention.date_intervention,
                duree_reparation: intervention.duree_reparation,
                avancement: intervention.avancement,
                vehicule: {
                    immatriculation: intervention.id_vehicule?.immatriculation || "Non renseigné",
                    marque: intervention.id_vehicule?.id_marque?.nom_marque || "Inconnu",
                    modele: intervention.id_vehicule?.id_modele?.nom_modele || "Inconnu"
                },
                client: {
                    nom: intervention.id_rdv?.id_demande?.id_client?.nom || "Non renseigné",
                    prenom: intervention.id_rdv?.id_demande?.id_client?.prenom || "Non renseigné",
                    contact: intervention.id_rdv?.id_demande?.id_client?.contact || "Non renseigné"
                },
                services
            };
        }));

        return {
            success: true,
            historique,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            limit
        };

    } catch (error) {
        console.error("Erreur dans fetchHistoriqueIntervention:", error);
        throw error;
    }
};

const getMecaniciensDisponibles = async (date_intervention, duree_reparation, id_service) => {
    try {
        const dateDebut = new Date(date_intervention);
        const dateFin = new Date(dateDebut.getTime() + duree_reparation * 60 * 60 * 1000);

        // Vérification que la date d'intervention et la durée sont valides
        if (isNaN(dateDebut.getTime()) || duree_reparation <= 0) {
            return { success: false, message: "Date ou durée invalide." };
        }

        //  Récupérer les mécaniciens ayant la compétence requise
        const allMecaniciens = await Mecanicien.find({ id_service: id_service });

        if (allMecaniciens.length === 0) {
            return { success: false, message: "Aucun mécanicien ne possède cette compétence." };
        }

        // Récupérer les interventions qui chevauchent cette plage horaire pour les mécaniciens concernés
        const busyInterventions = await Intervention.find({
            id_mecanicien: { $in: allMecaniciens.map(m => m._id) },
            $or: [
                { date_intervention: { $lt: dateFin }, date_fin_intervention: { $gt: dateDebut } }
            ]
        });

        // Extraire les ID des mécaniciens occupés
        const busyMecaniciens = busyInterventions.map(intervention => intervention.id_mecanicien.toString());

        // Filtrer les mécaniciens disponibles
        const availableMecaniciens = allMecaniciens.filter(mec => !busyMecaniciens.includes(mec._id.toString()));

        // Vérifier si aucun mécanicien n'est disponible
        if (availableMecaniciens.length === 0) {
            return { success: false, message: "Aucun mécanicien disponible pour cet horaire avec cette compétence." };
        }

        return { success: true, mecaniciens: availableMecaniciens };
    } catch (error) {
        console.error("Erreur lors de la récupération des mécaniciens disponibles:", error);
        throw error;
    }
};

const planifierIntervention = async (id_rdv, id_mecanicien, duree_reparation) => {
    try {
        const rdv = await RendezVous.findById(id_rdv);
        if (!rdv) {
            throw new Error("Rendez-vous non trouvé.");
        }
        if (rdv.statut !== 'Confirmé') {
            throw new Error("Seuls les rendez-vous confirmés peuvent être planifiés.");
        }

        // Trouver la demande de devis associée pour récupérer l'id_vehicule
        const demandeDevis = await DemandeDevis.findById(rdv.id_demande);
        if (!demandeDevis) {
            throw new Error("Demande de devis associée non trouvée.");
        }

        // Calcul de la date et heure de fin d'intervention
        const date_intervention = new Date(rdv.date_rendez_vous);
        const date_fin_intervention = new Date(date_intervention);
        date_fin_intervention.setHours(date_intervention.getHours() + duree_reparation); 

        const intervention = new Intervention({
            id_rdv: id_rdv,
            id_vehicule: demandeDevis.id_vehicule,
            id_mecanicien: id_mecanicien,
            date_intervention: date_intervention,
            duree_reparation: duree_reparation,
            date_fin_intervention: date_fin_intervention, 
            avancement: "Planifié" 
        });

        await intervention.save();
        return { success: true, message: "Intervention planifiée avec succès.", intervention };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

const updateInterventionMecanicien = async (idIntervention, idNewMecanicien) => {
    try {
        // Vérifier si l'intervention existe
        const intervention = await Intervention.findById(idIntervention);
        if (!intervention) {
            return { success: false, message: "Intervention non trouvée" };
        }

        // Vérifier si le nouveau mécanicien existe
        const newMecanicien = await Mecanicien.findById(idNewMecanicien);
        if (!newMecanicien) {
            return { success: false, message: "Mécanicien non trouvé" };
        }

        // Mettre à jour l'intervention avec le nouveau mécanicien
        intervention.id_mecanicien = idNewMecanicien;
        await intervention.save();

        return { success: true, message: "Intervention mise à jour avec succès", intervention };

    } catch (error) {
        console.error("Erreur dans updateInterventionMecanicien:", error);
        return { success: false, message: "Erreur serveur : " + error.message };
    }
};

const getEmploiDuTemps = async (mecanicienId) => {
    try {
        // Déterminer la période (aujourd'hui + 7 jours)
        const startDate = moment().startOf('day').toDate(); // Début de la journée actuelle
        const endDate = moment().add(7, 'days').endOf('day').toDate(); // Fin de la journée du 7ème jour

        // Récupérer toutes les interventions assignées à ce mécanicien
        const interventions = await Intervention.find({
            id_mecanicien: mecanicienId,
            date_intervention: { $gte: startDate, $lte: endDate } // Filtrer entre aujourd'hui et 7 jours après
        }).sort({ date_intervention: 1 }); // Trier par date croissante

        return { success: true, data: interventions };
    } catch (error) {
        return { success: false, message: `Erreur : ${error.message}` };
    }
};

const getPlanningJour = async (idMecanicien, date) => {
    try {
        let startDate, endDate;

        if (!date) {
            const today = new Date();
            startDate = new Date(today);
            endDate = new Date(today);
            startDate.setUTCHours(0, 0, 0, 0);
            endDate.setUTCHours(23, 59, 59, 999);
        } else {
            startDate = new Date(date);
            endDate = new Date(date);
            startDate.setUTCHours(0, 0, 0, 0);
            endDate.setUTCHours(23, 59, 59, 999);
        }

        const interventions = await Intervention.find({
            id_mecanicien: idMecanicien,
            date_intervention: { $gte: startDate, $lt: endDate }
        })
        .populate({
            path: 'id_rdv',
            populate: {
                path: 'id_demande',
                model: 'DemandeDevis',
                populate: { 
                    path: 'id_client', 
                    model: 'Client' 
                }
            }
        })
        .populate({
            path: 'id_vehicule',
            populate: [
                { path: 'id_marque', model: 'Marque' },
                { path: 'id_modele', model: 'Modele' }
            ]
        })
        .sort({ heure_intervention: 1 }) // 🔹 Tri par heure d'intervention croissante
        .exec();

        if (!interventions || interventions.length === 0) {
            return { success: false, message: "Aucune intervention prévue pour cette date" };
        }

        // Construction de la réponse sans les sous-services
        const result = interventions.map(intervention => ({
            id_intervention: intervention._id,
            date_intervention: intervention.date_intervention,
            duree_reparation: intervention.duree_reparation,
            avancement: intervention.avancement,
            vehicule: {
                immatriculation: intervention.id_vehicule?.immatriculation || "Non renseigné",
                marque: intervention.id_vehicule?.id_marque?.nom_marque || "Inconnu",
                modele: intervention.id_vehicule?.id_modele?.nom_modele || "Inconnu"
            },
            client: {
                nom: intervention.id_rdv?.id_demande?.id_client?.nom || "Non renseigné",
                prenom: intervention.id_rdv?.id_demande?.id_client?.prenom || "Non renseigné",
                contact: intervention.id_rdv?.id_demande?.id_client?.contact || "Non renseigné"
            }
        }));

        return { success: true, data: result };

    } catch (error) {
        console.error("Erreur dans getPlanningJour:", error);
        return { success: false, message: "Erreur serveur : " + error.message };
    }
};

const getTaskIntervention = async (idIntervention) => {
    try {
        // Vérifier si l'intervention existe
        const intervention = await Intervention.findById(idIntervention)
            .populate({
                path: 'id_rdv',
                populate: {
                    path: 'id_demande',
                    model: 'DemandeDevis'
                }
            })
            .exec();

        if (!intervention) {
            return { success: false, message: "Intervention non trouvée" };
        }

        // Vérifier si une demande de devis est associée
        if (!intervention.id_rdv || !intervention.id_rdv.id_demande) {
            return { success: false, message: "Aucune demande associée à cette intervention" };
        }

        const demandeId = intervention.id_rdv.id_demande._id;

        // Récupérer les sous-services associés
        const sousServices = await DemandeDevisDetail.find({ id_demande: demandeId })
            .populate({ path: 'id_sous_service', select: 'nom_sous_service description' })
            .exec();

        const servicesList = sousServices.map(detail => ({
            id: detail.id_sous_service._id,
            nom: detail.id_sous_service.nom_sous_service,
            description: detail.id_sous_service.description || "Pas de description disponible"
        }));

        // Récupérer les pièces nécessaires pour l'intervention
        const devisPieces = await DevisPiece.find({ id_demande: demandeId })
            .populate({ path: 'id_piece', select: 'nom_piece' })
            .exec();

        const piecesList = devisPieces.map(devis => ({
            id: devis.id_piece._id,
            nom: devis.id_piece.nom_piece,
            quantite: devis.quantite
        }));

        return {
            success: true,
            intervention: {
                id: intervention._id,
                date_intervention: intervention.date_intervention,
                duree_reparation: intervention.duree_reparation,
                avancement: intervention.avancement
            },
            sous_services: servicesList,
            pieces: piecesList
        };

    } catch (error) {
        console.error("Erreur dans getTaskIntervention:", error);
        return { success: false, message: "Erreur serveur : " + error.message };
    }
};

const updateInterventionStatus = async (idIntervention, statut, mecanicienId) => {
    try {
        // Vérifier si le statut est valide
        const validStatuses = ['Début', 'En cours', 'Terminé'];
        if (!validStatuses.includes(statut)) {
            return { success: false, message: 'Statut invalide' };
        }

        // Trouver l'intervention par ID
        const intervention = await Intervention.findById(idIntervention);
        if (!intervention) {
            return { success: false, message: 'Intervention non trouvée' };
        }

        // Vérifier que c'est bien le mécanicien qui met à jour le statut
        if (intervention.id_mecanicien.toString() !== mecanicienId) {
            return { success: false, message: 'Accès non autorisé : vous ne pouvez mettre à jour que vos propres interventions' };
        }

        // Sécuriser les transitions de statut
        if (intervention.avancement === 'Terminé' && (statut === 'En cours' || statut === 'Début')) {
            return { success: false, message: 'Impossible de revenir à "En cours" ou à "Début" après que l\'intervention soit terminée' };
        }

        if (intervention.avancement === 'En cours' && statut === 'Début') {
            return { success: false, message: 'Impossible de revenir à "Début" après que l\'intervention ait commencé' };
        }

        // Mettre à jour le statut
        intervention.avancement = statut;

        // Sauvegarder l'intervention mise à jour
        await intervention.save();
        return { success: true, message: 'Statut mis à jour avec succès' };
    } catch (error) {
        return { success: false, message: `Erreur serveur : ${error.message}` };
    }
};

const addPieceToIntervention = async (idIntervention, idPiece, quantite) => {
    try {
        // Vérifier si l'intervention existe
        const intervention = await Intervention.findById(idIntervention);
        if (!intervention) {
            return { success: false, message: 'Intervention non trouvée' };
        }

        // Vérifier si la pièce existe
        const piece = await Piece.findById(idPiece);
        if (!piece) {
            return { success: false, message: 'Pièce non trouvée' };
        }

        // Récupérer le prix unitaire de la pièce
        const prixUnitaire = piece.prix_unitaire;

        // Créer une nouvelle instance de PieceUtilise avec le prix unitaire
        const newPieceUtilise = new PieceUtilise({
            id_intervention: idIntervention,
            id_piece: idPiece,
            prix_unitaire: prixUnitaire,
            quantite: quantite
        });

        // Sauvegarder la pièce utilisée
        await newPieceUtilise.save();

        return { success: true, message: 'Pièce ajoutée à l\'intervention avec succès' };
    } catch (error) {
        return { success: false, message: `Erreur serveur : ${error.message}` };
    }
};

const getInterventionsTerminees = async (date, page = 1, limit = 10) => {
    try {
        let startDate, endDate;

        // Validation et traitement de la date
        if (!date) {
            const today = new Date();
            startDate = new Date(today.setUTCHours(0, 0, 0, 0)); // Date du jour à 00:00
            endDate = new Date(today.setUTCHours(23, 59, 59, 999)); // Date du jour à 23:59:59
        } else {
            startDate = new Date(date);
            endDate = new Date(date);
            startDate.setUTCHours(0, 0, 0, 0);
            endDate.setUTCHours(23, 59, 59, 999);
        }

        // Calculer le nombre d'éléments à ignorer (skip) basé sur la page
        const skip = (page - 1) * limit;

        // Récupérer les interventions terminées pour cette date avec pagination
        const interventions = await Intervention.find({
            avancement: "Terminé",
            date_intervention: { $gte: startDate, $lt: endDate }
        })
        .skip(skip)
        .limit(limit)
        .populate({
            path: 'id_rdv',
            populate: {
                path: 'id_demande',
                model: 'DemandeDevis',
                populate: { 
                    path: 'id_client', 
                    model: 'Client' 
                }
            }
        })
        .populate({
            path: 'id_vehicule',
            populate: [
                { path: 'id_marque', model: 'Marque' },
                { path: 'id_modele', model: 'Modele' }
            ]
        })
        .sort({ date_intervention: 1 }) 
        .exec();

        // Compter le nombre total d'interventions terminées pour cette date
        const totalInterventions = await Intervention.countDocuments({
            avancement: "Terminé",
            date_intervention: { $gte: startDate, $lt: endDate }
        });

        // Si aucune intervention n'est trouvée
        if (!interventions || interventions.length === 0) {
            return { success: false, message: "Aucune intervention terminée pour cette date", page, limit };
        }

        // Construction de la réponse
        const result = interventions.map(intervention => ({
            id_intervention: intervention._id,
            date_intervention: intervention.date_intervention,
            duree_reparation: intervention.duree_reparation,
            avancement: intervention.avancement,
            vehicule: {
                immatriculation: intervention.id_vehicule?.immatriculation || "Non renseigné",
                marque: intervention.id_vehicule?.id_marque?.nom_marque || "Inconnu",
                modele: intervention.id_vehicule?.id_modele?.nom_modele || "Inconnu"
            },
            client: {
                nom: intervention.id_rdv?.id_demande?.id_client?.nom || "Non renseigné",
                prenom: intervention.id_rdv?.id_demande?.id_client?.prenom || "Non renseigné",
                contact: intervention.id_rdv?.id_demande?.id_client?.contact || "Non renseigné"
            }
        }));

        // Retourner les interventions avec les informations de pagination
        return {
            success: true,
            data: result,
            total: totalInterventions,
            page,
            limit,
            totalPages: Math.ceil(totalInterventions / limit) // Calcul du nombre total de pages
        };

    } catch (error) {
        console.error("Erreur dans getInterventionsTerminees:", error);
        return { success: false, message: "Erreur serveur : " + error.message };
    }
};


module.exports = { fetchHistoriqueIntervention , updateInterventionMecanicien , planifierIntervention , getMecaniciensDisponibles , getPlanningJour , updateInterventionStatus , addPieceToIntervention , getEmploiDuTemps , getTaskIntervention , getInterventionsTerminees };
