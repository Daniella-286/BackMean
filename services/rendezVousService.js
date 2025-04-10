const Deadline = require('../models/Deadline');
const RendezVous = require('../models/RendezVous');

const prendreRendezVous = async (id_client, id_demande, date_rdv) => {
    try {
        // Récupérer la deadline en jours
        const deadlineConfig = await Deadline.findOne();
        if (!deadlineConfig) {
            throw new Error("Aucune configuration de délai trouvée.");
        }
        
        const deadlineRdvJours = deadlineConfig.deadline_rdv; // Nombre de jours de délai
        const datePriseRdv = new Date(); // Date actuelle

        // Calculer la date limite de confirmation
        const dateLimiteConfirmation = new Date(date_rdv);
        dateLimiteConfirmation.setDate(dateLimiteConfirmation.getDate() - deadlineRdvJours);
        dateLimiteConfirmation.setUTCHours(23, 59, 59, 999);


        // Créer le rendez-vous
        const rendezVous = new RendezVous({
            id_client,
            id_demande,
            date_prise_rendez_vous: datePriseRdv,
            date_rendez_vous: date_rdv,
            date_limite_confirmation: dateLimiteConfirmation
        });

        await rendezVous.save();
        return { success: true, message: "Rendez-vous pris avec succès.", rendezVous };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

const rendezVousParId = async (id_rdv) => {
    try {
        const rendezVous = await RendezVous.findById(id_rdv);

        if (!rendezVous) {
            return { success: false, message: "Rendez-vous introuvable." };
        }

        return { success: true , rendezVous };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

//VU PAR LE MANGER
const fetchRendezVousEnAttente = async (date_debut, date_fin, page = 1, limit = 10) => {
    try {
        if (!date_debut || !date_fin) {
            const today = new Date();
            date_fin = date_fin ? new Date(date_fin) : new Date(today); // Si date_fin est vide, on prend aujourd'hui
            date_debut = date_debut ? new Date(date_debut) : new Date(today.setDate(today.getDate() - 7)); // 7 jours avant

            date_debut.setUTCHours(0, 0, 0, 0);
            date_fin.setUTCHours(23, 59, 59, 999);
        } else {
            date_debut = new Date(date_debut);
            date_fin = new Date(date_fin);
        }

        // Filtre avec les nouvelles dates
        const filter = {
            statut: 'En attente',
            date_prise_rendez_vous: { $gte: date_debut, $lte: date_fin }
        };

        // Calculer le nombre d'éléments à ignorer (skip) basé sur la page
        const skip = (page - 1) * limit;

        // Récupérer les rendez-vous en attente avec pagination
        const rendezVousList = await RendezVous.find(filter)
            .skip(skip)
            .limit(limit)
            .populate('id_client', 'nom email')
            .populate('id_demande', 'description probleme_decrit')
            .sort({ date_prise_rendez_vous: -1 })
            .exec(); // Ajout de exec()

        // Compter le nombre total de rendez-vous en attente
        const totalRendezVous = await RendezVous.countDocuments(filter);

        if (rendezVousList.length === 0) {
            return { success: true, message: "Aucun rendez-vous en attente trouvé pour cette période." };
        }

        // Retourner les rendez-vous avec les informations de pagination
        return {
            success: true,
            rendezVous: rendezVousList,
            total: totalRendezVous,
            page,
            limit,
            totalPages: Math.ceil(totalRendezVous / limit) // Calcul du nombre total de pages
        };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

const validerRendezVous = async (id_rdv) => {
    try {
        const rendezVous = await RendezVous.findById(id_rdv);
        if (!rendezVous) {
            return { success: false, message: "Rendez-vous introuvable." };
        }

        const maintenant = new Date();

        if (maintenant > rendezVous.date_limite_confirmation) {
            return { success: false, message: "Ce rendez-vous ne peut pas être validé. Délai dépasé" };
        }

        // Mettre à jour le statut
        rendezVous.statut = 'Validé';
        await rendezVous.save();

        return { success: true, message: "Rendez-vous validé avec succès." };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

const marquerRendezVousNonDisponible = async (id_rdv) => {
    try {
        const rendezVous = await RendezVous.findById(id_rdv);
        if (!rendezVous) {
            return { success: false, message: "Rendez-vous introuvable." };
        }

        // Vérifier si le rendez-vous est déjà marqué comme non disponible
        if (rendezVous.statut === 'Non disponible') {
            return { success: false, message: "Ce rendez-vous est déjà marqué comme non disponible." };
        }

        // Vérifier si le rendez-vous est déjà annulé ou confirmé
        if (rendezVous.statut === 'Annulé') {
            return { success: false, message: "Ce rendez-vous est annulé et ne peut pas être marqué comme non disponible." };
        }

        if (rendezVous.statut === 'Confirmé') {
            return { success: false, message: "Ce rendez-vous a déjà été confirmé et ne peut pas être marqué comme non disponible." };
        }

        // Vérifier si le délai de confirmation est dépassé
        const maintenant = new Date();
        if (maintenant > rendezVous.date_limite_confirmation) {
            return { success: false, message: "Le délai pour modifier ce rendez-vous est dépassé." };
        }

        // Mettre à jour le statut du rendez-vous
        rendezVous.statut = 'Non disponible';
        await rendezVous.save();

        return { success: true, message: "Rendez-vous marqué comme non disponible avec succès." };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

//VU PAR LE Client
const fetchRendezVousClient = async (id_client, date_debut, date_fin, page = 1, limit = 10) => {
    try {
        if (!id_client) {
            return { success: false, message: "L'ID du client est requis." };
        }

        if (!date_debut || !date_fin) {
            const today = new Date();
            date_fin = date_fin ? new Date(date_fin) : new Date(today); // Si date_fin est vide, on prend aujourd'hui
            date_debut = date_debut ? new Date(date_debut) : new Date(today.setDate(today.getDate() - 7)); // 7 jours avant

            date_debut.setUTCHours(0, 0, 0, 0);
            date_fin.setUTCHours(23, 59, 59, 999);
        } else {
            date_debut = new Date(date_debut);
            date_fin = new Date(date_fin);
        }

        // Création du filtre avec statut "Validé"
        const filter = {
            id_client,
            statut: "Validé", // Seuls les rendez-vous validés
            date_prise_rendez_vous: { $gte: date_debut, $lte: date_fin }
        };

        // Calculer le nombre d'éléments à ignorer (skip) basé sur la page
        const skip = (page - 1) * limit;

        // Recherche des rendez-vous avec `populate` et pagination
        const rendezVousList = await RendezVous.find(filter)
            .skip(skip)
            .limit(limit)
            .populate('id_client', 'nom email')
            .populate('id_demande', 'description probleme_decrit')
            .exec(); 

        // Compter le nombre total de rendez-vous validés pour calculer le nombre total de pages
        const totalRendezVous = await RendezVous.countDocuments(filter);

        if (rendezVousList.length === 0) {
            return { success: true, message: "Aucun rendez-vous validé trouvé pour cette période." };
        }

        // Retourner les rendez-vous avec les informations de pagination
        return {
            success: true,
            rendezVous: rendezVousList,
            total: totalRendezVous,
            page,
            limit,
            totalPages: Math.ceil(totalRendezVous / limit) // Calcul du nombre total de pages
        };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

const confirmerRendezVous = async (id_rdv) => {
    try {
        const rendezVous = await RendezVous.findById(id_rdv);
        if (!rendezVous) {
            return { success: false, message: "Rendez-vous introuvable." };
        }

        const maintenant = new Date();

        if (maintenant > rendezVous.date_limite_confirmation) {
            rendezVous.statut = 'Annulé';
            await rendezVous.save();
            return { success: false, message: "Délai de confirmation dépassé. Le rendez-vous a été annulé automatiquement." };
        }

        // Mise à jour du statut et de la date de confirmation
        rendezVous.statut = 'Confirmé';
        rendezVous.date_confirmation = maintenant;
        await rendezVous.save();

        return { success: true, message: "Rendez-vous confirmé avec succès." };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

const annulerRendezVous = async (id_rdv) => {
    try {
        const rendezVous = await RendezVous.findById(id_rdv);
        if (!rendezVous) {
            return { success: false, message: "Rendez-vous introuvable." };
        }

        // Vérifier si le rendez-vous est déjà annulé ou confirmé
        if (rendezVous.statut === 'Annulé') {
            return { success: false, message: "Ce rendez-vous est déjà annulé." };
        }

        if (rendezVous.statut === 'Confirmé') {
            return { success: false, message: "Ce rendez-vous a déjà été confirmé, vous ne pouvez plus l'annuler." };
        }

        // Vérifier si le délai de confirmation est dépassé
        const maintenant = new Date();
        if (maintenant > rendezVous.date_limite_confirmation) {
            return { success: false, message: "Le délai pour annuler ce rendez-vous est dépassé." };
        }

        // Mettre à jour le statut du rendez-vous
        rendezVous.statut = 'Annulé';
        await rendezVous.save();

        return { success: true, message: "Rendez-vous annulé avec succès." };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

const modifierRendezVous = async (id_rdv, nouvelle_date_rdv) => {
    try {
        const rendezVous = await RendezVous.findById(id_rdv);

        if (!rendezVous) {
            return { success: false, message: "Rendez-vous introuvable." };
        }

        // Vérifier si le rendez-vous est dans un état modifiable
        if (rendezVous.statut === 'Validé') {
            return { success: false, message: "Vous ne pouvez pas modifier ce rendez-vous , il est déjà validé par le garage" };
        }

        if (rendezVous.statut === 'Confirmé') {
            return { success: false, message: "Vous ne pouvez pas modifier ce rendez-vous , vous l'avez déjà confirmé" };
        }

        // Récupérer la configuration des délais
        const deadlineConfig = await Deadline.findOne();
        if (!deadlineConfig) {
            return { success: false, message: "Aucune configuration de délai trouvée." };
        }

        const deadlineRdvJours = deadlineConfig.deadline_rdv; // Nombre de jours de délai
        const datePriseRdv = new Date(); // Date actuelle

        // Calculer la date limite de confirmation
        const dateLimiteConfirmation = new Date(nouvelle_date_rdv);
        dateLimiteConfirmation.setDate(dateLimiteConfirmation.getDate() - deadlineRdvJours);
        dateLimiteConfirmation.setUTCHours(23, 59, 59, 999);

        // Mettre à jour les valeurs du rendez-vous
        rendezVous.date_rendez_vous = nouvelle_date_rdv;
        rendezVous.date_prise_rendez_vous = datePriseRdv;
        rendezVous.date_limite_confirmation = dateLimiteConfirmation;
        rendezVous.statut = 'En attente'; // Remettre en attente après modification

        await rendezVous.save();

        return { success: true, message: "Rendez-vous modifié avec succès.", rendezVous };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

const fetchConfirmedRendezVousByClient = async (id_client, date_debut, date_fin, page = 1, limit = 10) => {
    try {
        if (!id_client) {
            return { success: false, message: "L'ID du client est requis." };
        }

        if (!date_debut || !date_fin) {
            const today = new Date();
            date_fin = date_fin ? new Date(date_fin) : new Date(today); // Si vide, on prend aujourd'hui
            date_debut = date_debut ? new Date(date_debut) : new Date(today.setDate(today.getDate() - 7)); // Par défaut, 7 jours avant

            date_debut.setUTCHours(0, 0, 0, 0);
            date_fin.setUTCHours(23, 59, 59, 999);
        } else {
            date_debut = new Date(date_debut);
            date_fin = new Date(date_fin);
        }

        // Création du filtre avec statut "Confirmé"
        const filter = {
            id_client,
            statut: "Confirmé",
            date_prise_rendez_vous: { $gte: date_debut, $lte: date_fin }
        };

        // Calculer l'offset (skip) pour la pagination
        const skip = (page - 1) * limit;

        // Recherche des rendez-vous confirmés avec `populate` et pagination
        const rendezVousList = await RendezVous.find(filter)
            .skip(skip)
            .limit(limit)
            .populate('id_client', 'nom email')
            .populate('id_demande', 'description probleme_decrit')
            .sort({ date_prise_rendez_vous: -1 }) // Tri par date décroissante
            .exec();

        // Compter le nombre total de rendez-vous confirmés pour calculer le nombre total de pages
        const totalRendezVous = await RendezVous.countDocuments(filter);

        if (rendezVousList.length === 0) {
            return { success: true, message: "Aucun rendez-vous confirmé trouvé pour cette période." };
        }

        // Retourner les rendez-vous avec les informations de pagination
        return {
            success: true,
            rendezVous: rendezVousList,
            total: totalRendezVous,
            page,
            limit,
            totalPages: Math.ceil(totalRendezVous / limit) // Calcul du nombre total de pages
        };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

const fetchRendezVousAttenteOuNonDispo = async (id_client, date_debut, date_fin, page = 1, limit = 10) => {
    try {
        if (!id_client) {
            return { success: false, message: "L'ID du client est requis." };
        }

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

        const filter = {
            id_client,
            statut: { $in: ["En attente", "Non disponible"] },
            date_prise_rendez_vous: { $gte: date_debut, $lte: date_fin }
        };

        const skip = (page - 1) * limit;

        const rendezVousList = await RendezVous.find(filter)
            .skip(skip)
            .limit(limit)
            .populate('id_client', 'nom email')
            .populate('id_demande', 'description probleme_decrit')
            .exec();

        const totalRendezVous = await RendezVous.countDocuments(filter);

        if (rendezVousList.length === 0) {
            return { success: true, message: "Aucun rendez-vous en attente ou non disponible trouvé pour cette période." };
        }

        return {
            success: true,
            rendezVous: rendezVousList,
            total: totalRendezVous,
            page,
            limit,
            totalPages: Math.ceil(totalRendezVous / limit)
        };
    } catch (error) {
        return { success: false, message: error.message };
    }
};

//vu par le manager pour intervenir
const fetchRendezVousConfirmes = async (date_debut, date_fin, page = 1, limit = 10) => {
    try {
        if (!date_debut || !date_fin) {
            const today = new Date();
            date_fin = date_fin ? new Date(date_fin) : new Date(today); // Si date_fin est vide, on prend aujourd'hui
            date_debut = date_debut ? new Date(date_debut) : new Date(today.setDate(today.getDate() - 30)); // Par défaut, 30 jours avant

            date_debut.setUTCHours(0, 0, 0, 0);
            date_fin.setUTCHours(23, 59, 59, 999);
        } else {
            date_debut = new Date(date_debut);
            date_fin = new Date(date_fin);
        }

        // Filtre avec la gestion des dates
        const filter = {
            statut: 'Confirmé',
            intervention: false, 
            date_confirmation: { $gte: date_debut, $lte: date_fin }
        };

        // Calculer l'offset (skip) pour la pagination
        const skip = (page - 1) * limit;

        // Recherche des rendez-vous confirmés avec `populate` et pagination
        const rendezVousList = await RendezVous.find(filter)
            .skip(skip)
            .limit(limit)
            .populate('id_client', 'nom email')
            .populate('id_demande', 'description probleme_decrit')
            .exec(); // Ajout de exec()

        // Compter le nombre total de rendez-vous confirmés pour calculer le nombre total de pages
        const totalRendezVous = await RendezVous.countDocuments(filter);

        if (rendezVousList.length === 0) {
            return { success: true, message: "Aucun rendez-vous confirmé trouvé pour cette période." };
        }

        // Retourner les rendez-vous avec les informations de pagination
        return {
            success: true,
            rendezVous: rendezVousList,
            total: totalRendezVous,
            page,
            limit,
            totalPages: Math.ceil(totalRendezVous / limit) // Calcul du nombre total de pages
        };
    } catch (error) {
        return { success: false, message: error.message };
    }
};


module.exports = { rendezVousParId , fetchRendezVousAttenteOuNonDispo , fetchRendezVousEnAttente , fetchConfirmedRendezVousByClient , fetchRendezVousClient ,fetchRendezVousConfirmes , prendreRendezVous , modifierRendezVous, validerRendezVous , confirmerRendezVous ,annulerRendezVous , marquerRendezVousNonDisponible };
