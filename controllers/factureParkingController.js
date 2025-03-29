const factureParkingService = require('../services/factureParkingService');

const genererFacture = async (req, res) => {
    try {
        const { id_reservation } = req.body;
        const result = await factureParkingService.genererFacture(id_reservation);
        if (!result.success) {
            return res.status(400).json(result);
        }
        res.status(201).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

// Fonction pour récupérer les factures d'un client
const getFacturesByClientController = async (req, res) => {
    try {
        const id_client = req.user.id;
        const { page = 1, limit = 10 } = req.query;

        // Conversion des valeurs en nombres si nécessaires
        const pageNumber = Number(page);
        const limitNumber = Number(limit);

        // Appel du service avec tous les paramètres
        const result = await factureParkingService.getFacturesByClient(id_client, pageNumber, limitNumber);

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ message: "Erreur serveur : " + error.message });
    }
};


// Fonction pour récupérer les détails d'une facture
const getFactureDetailsController = async (req, res) => {
    try {
        const { id_facture } = req.params;
        const facture = await factureParkingService.getFactureDetails(id_facture);

        if (facture.message) {
            return res.status(404).json({ message: facture.message });
        }

        return res.status(200).json(facture);
    } catch (error) {
        return res.status(500).json({ message: "Erreur serveur : " + error.message });
    }
};

const getFacturesParkingDuJourController = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const result = await factureParkingService.getFacturesParkingDuJour(page, limit);
        res.status(200).json(result);
    } catch (error) {
        res.status(500).json({ success: false, message: error.message });
    }
};

const getFactureParkingDetailsController = async (req, res) => {
    try {
        const { id_facture } = req.params;
        const factureDetails = await factureParkingService.getFactureParkingDetails(id_facture);
        res.status(200).json(factureDetails);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};


module.exports = { genererFacture , getFacturesByClientController , getFactureDetailsController , getFacturesParkingDuJourController, getFactureParkingDetailsController};
