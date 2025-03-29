const { rendezVousParId , fetchRendezVousEnAttente , fetchConfirmedRendezVousByClient , fetchRendezVousConfirmes ,prendreRendezVous , confirmerRendezVous , fetchRendezVousClient ,modifierRendezVous, annulerRendezVous , validerRendezVous , marquerRendezVousNonDisponible , fetchRendezVousAttenteOuNonDispo } = require('../services/rendezVousService');

const creerRendezVous = async (req, res) => {
    try {
        const id_client = req.user.id; // Récupération de l'ID du client via le token
        const { id_demande, date_rendez_vous } = req.body;

        if (!id_demande || !date_rendez_vous) {
            return res.status(400).json({ message: "Tous les champs sont requis (id_demande, date_rendez_vous)." });
        }

        const result = await prendreRendezVous(id_client , id_demande, date_rendez_vous);
        res.status(201).json(result);

    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

const rendezVousParIdController = async (req, res) => {
    try {
        const { id_rdv } = req.params;

        if (!id_rdv) {
            return res.status(400).json({ message: "L'identifiant du rendez-vous est requis." });
        }

        const result = await rendezVousParId(id_rdv);
        res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

//VU PAR LE MANGER
const getRendezVousEnAttente = async (req, res) => {
    try {
        const { date_debut, date_fin, page = 1, limit = 10 } = req.query; // Récupérer les filtres de date, page et limit

        // Appeler la fonction pour récupérer les rendez-vous en attente avec pagination
        const result = await fetchRendezVousEnAttente(date_debut, date_fin, parseInt(page), parseInt(limit));
        
        // Retourner la réponse
        res.status(result.success ? 200 : 400).json(result);

    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};


const validerRendezVousController = async (req, res) => {
    try {
        const { id_rdv } = req.params;

        const result = await validerRendezVous(id_rdv);
        res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

const marquerRendezVousNonDisponibleController = async (req, res) => {
    try {
        const { id_rdv } = req.params;

        const result = await marquerRendezVousNonDisponible(id_rdv);
        res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

//VU PAR LE CLIENT
const getRendezVousClient = async (req, res) => {
    try {
        const id_client = req.user.id; // Récupérer l'ID du client depuis le token
        const { date_debut, date_fin, page = 1, limit = 10 } = req.query; // Récupérer les filtres de date, page et limit

        // Appeler la fonction pour récupérer les rendez-vous validés avec pagination
        const result = await fetchRendezVousClient(id_client, date_debut, date_fin, parseInt(page), parseInt(limit));
        
        // Retourner la réponse
        res.status(result.success ? 200 : 400).json(result);

    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};


const confirmerRendezVousController = async (req, res) => {
    try {
        const { id_rdv } = req.params;

        const result = await confirmerRendezVous(id_rdv);
        res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

const annulerRendezVousController = async (req, res) => {
    try {
        const { id_rdv } = req.params;

        const result = await annulerRendezVous(id_rdv);
        res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

const modifierRendezVousController = async (req, res) => {
    try {
        const { id_rdv } = req.params;
        const date_rendez_vous = req.body;

        if (!date_rendez_vous) {
            return res.status(400).json({ message: "Les champs Date_rendez_vous sont requis." });
        }

        const result = await modifierRendezVous(id_rdv, date_rendez_vous);
        res.status(result.success ? 200 : 400).json(result);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

const getConfirmedRendezVousByClientController = async (req, res) => {
    try {
        const id_client = req.user.id; // Récupérer l'ID du client depuis le token
        const { date_debut, date_fin, page = 1, limit = 10 } = req.query; // Récupérer les filtres de date, page et limit

        // Appeler la fonction pour récupérer les rendez-vous confirmés avec pagination
        const result = await fetchConfirmedRendezVousByClient(id_client, date_debut, date_fin, parseInt(page), parseInt(limit));
        
        if (!result.success) {
            return res.status(400).json({ success: false, message: result.message });
        }

        // Retourner la réponse avec les données et informations de pagination
        return res.status(200).json({
            success: true,
            data: result.rendezVous,
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages
        });

    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getRendezVousAttenteOuNonDispo = async (req, res) => {
    try{
        const id_client = req.user.id; // Récupérer l'ID du client depuis le token
        const { date_debut, date_fin, page = 1, limit = 10 } = req.query; // Récupérer les filtres de date, page et limit
        
        const result = await fetchRendezVousAttenteOuNonDispo(id_client, date_debut, date_fin, Number(page), Number(limit));

        if (!result.success) {
            return res.status(400).json({ success: false, message: result.message });
        }

        return res.status(200).json({
            success: true,
            data: result.rendezVous,
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
    
};

//VU PAR LE MANGER pour intervenir
const getRendezVousConfirmes = async (req, res) => {
    try {
        const { date_debut, date_fin, page = 1, limit = 10 } = req.query; // Récupérer les paramètres de pagination

        // Appeler la fonction pour récupérer les rendez-vous confirmés avec pagination
        const result = await fetchRendezVousConfirmes(date_debut, date_fin, parseInt(page), parseInt(limit));

        if (!result.success) {
            return res.status(400).json({ success: false, message: result.message });
        }

        // Retourner la réponse avec les données et les informations de pagination
        return res.status(200).json({
            success: true,
            data: result.rendezVous,
            total: result.total,
            page: result.page,
            limit: result.limit,
            totalPages: result.totalPages
        });
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

module.exports = { rendezVousParIdController , getConfirmedRendezVousByClientController , getRendezVousEnAttente, getRendezVousClient , getRendezVousConfirmes ,creerRendezVous , modifierRendezVousController , confirmerRendezVousController , annulerRendezVousController , validerRendezVousController , marquerRendezVousNonDisponibleController  , getRendezVousAttenteOuNonDispo };
