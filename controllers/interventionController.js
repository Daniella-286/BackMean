const interventionService = require('../services/interventionService');

const getHistoriqueIntervention = async (req, res) => {
    try {
        const { id_vehicule } = req.params;
        const { page = 1, limit = 10 } = req.query;

        if (!id_vehicule) {
            return res.status(400).json({ success: false, message: "ID du véhicule requis." });
        }

        const result = await interventionService.fetchHistoriqueIntervention(id_vehicule, page, limit);

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const getDisponibiliteMecaniciens = async (req, res) => {
    try {
        const { date_intervention, duree_reparation, id_service, page = 1, limit = 10 } = req.query;

        if (!date_intervention || !duree_reparation || !id_service) {
            return res.status(400).json({ success: false, message: "Date, durée et service sont requis." });
        }

        if (isNaN(duree_reparation) || duree_reparation <= 0) {
            return res.status(400).json({ success: false, message: "La durée de réparation doit être un nombre positif." });
        }

        const result = await interventionService.getMecaniciensDisponibles(
            date_intervention,
            parseInt(duree_reparation),
            id_service,
            parseInt(page),
            parseInt(limit)
        );

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const planifierInterventionController = async (req, res) => {
    try {
        const { id_rdv, id_mecanicien, duree_reparation } = req.body;

        if (!id_rdv || !id_mecanicien || !duree_reparation) {
            return res.status(400).json({ success: false, message: "Tous les champs sont requis." });
        }

        const result = await interventionService.planifierIntervention(id_rdv, id_mecanicien, duree_reparation);
        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

const updateMecanicien = async (req, res) => {
    try {
        const { idNewMecanicien } = req.body;

        const idIntervention = req.params;

        // Vérifier si les paramètres sont fournis
        if (!idIntervention || !idNewMecanicien) {
            return res.status(400).json({ success: false, message: "Veuillez fournir l'ID de l'intervention et du nouveau mécanicien." });
        }

        // Appeler le service pour mettre à jour l'intervention
        const result = await updateInterventionMecanicien(idIntervention, idNewMecanicien);
        return res.status(result.success ? 200 : 400).json(result);

    } catch (error) {
        console.error("Erreur dans updateMecanicien:", error);
        res.status(500).json({ success: false, message: "Erreur serveur : " + error.message });
    }
};

const getEmploiDuTemps = async (req, res) => {
    const mecanicienId = req.user.id; // ID du mécanicien connecté (récupéré depuis l'authentification)
    try {
        const response = await interventionService.getEmploiDuTemps(mecanicienId);
        if (response.success) {
            return res.status(200).json(response);
        } else {
            return res.status(400).json(response);
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Erreur serveur : ' + error.message });
    }
};

const getPlanningJourController = async (req, res) => {
    try {
        const date = req.query.date ;
        const idMecanicien =  req.user.id;

        const tasks = await interventionService.getPlanningJour(idMecanicien, date);

        return res.status(200).json(tasks);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getTaskInterventionController = async (req, res) => {
    try {
        const { idIntervention } = req.params;
        const result = await interventionService.getTaskIntervention(idIntervention);

        if (!result.success) {
            return res.status(404).json({ success: false, message: result.message });
        }

        return res.status(200).json(result);
    } catch (error) {
        console.error("Erreur dans getDetailsIntervention:", error);
        return res.status(500).json({ success: false, message: "Erreur interne du serveur" });
    }
};

const updateStatusController = async (req, res) => {
    try {
        const { statut } = req.body;
        const { idIntervention } = req.params;

        const result = await interventionService.updateInterventionStatus(idIntervention, statut);
        res.status(200).json(result);
    } catch (error) {
        res.status(400).json({ success: false, message: error.message });
    }
};

const addPiece = async (req, res) => {
    const { id_intervention, id_piece, quantite } = req.body;

    if (!id_intervention || !id_piece || !quantite) {
        return res.status(400).json({ success: false, message: 'Tous les champs sont nécessaires' });
    }

    try {
        const response = await interventionService.addPieceToIntervention(id_intervention, id_piece, quantite);
        if (response.success) {
            return res.status(200).json(response);
        } else {
            return res.status(400).json(response);
        }
    } catch (error) {
        return res.status(500).json({ success: false, message: 'Erreur serveur : ' + error.message });
    }
};

const getInterventionsTermineesController = async (req, res) => {
    try {
        const { date, page = 1, limit = 10 } = req.query;

        // Validation de la date
        if (date && isNaN(new Date(date).getTime())) {
            return res.status(400).json({ success: false, message: "Date invalide." });
        }

        // Appeler le service pour récupérer les interventions terminées avec pagination
        const result = await interventionService.getInterventionsTerminees(date, parseInt(page), parseInt(limit));
        return res.status(result.success ? 200 : 400).json(result);

    } catch (error) {
        console.error("Erreur dans getInterventionsTermineesController:", error);
        return res.status(500).json({ success: false, message: "Erreur serveur : " + error.message });
    }
};

module.exports = { getDisponibiliteMecaniciens , updateMecanicien , getHistoriqueIntervention , planifierInterventionController , getPlanningJourController , updateStatusController , addPiece , getEmploiDuTemps , getTaskInterventionController , getInterventionsTermineesController };
