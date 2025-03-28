const { rendezVousParId , fetchRendezVousEnAttente , fetchRendezVousConfirmes ,fetchConfirmedRendezVousByClient,prendreRendezVous , confirmerRendezVous , fetchRendezVousClient ,modifierRendezVous, annulerRendezVous , validerRendezVous , marquerRendezVousNonDisponible } = require('../services/rendezVousService');

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
        const { date_debut, date_fin } = req.query; // Récupérer les filtres de date

        const result = await fetchRendezVousEnAttente(date_debut, date_fin);
        res.status(200).json(result);

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
        const { date_debut, date_fin } = req.query; // Filtrer par date

        const result = await fetchRendezVousClient(id_client, date_debut, date_fin);
        res.status(200).json(result);

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
        const id_client = req.user.id; // ID du client connecté (extrait du token)
        const { date_debut, date_fin } = req.query;

        const result = await fetchConfirmedRendezVousByClient(id_client, date_debut, date_fin);

        if (!result.success) {
            return res.status(400).json({ success: false, message: result.message });
        }

        return res.status(200).json({ success: true, data: result.rendezVous });
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
};

//VU PAR LE MANGER pour intervenir
const getRendezVousConfirmes = async (req, res) => {
    try {
        const { date_debut, date_fin } = req.query;

        const result = await fetchRendezVousConfirmes(date_debut, date_fin);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error: error.message });
    }
};

module.exports = { rendezVousParIdController , getRendezVousEnAttente, getConfirmedRendezVousByClientController , getRendezVousClient , getRendezVousConfirmes ,creerRendezVous , modifierRendezVousController , confirmerRendezVousController , annulerRendezVousController , validerRendezVousController , marquerRendezVousNonDisponibleController  };
