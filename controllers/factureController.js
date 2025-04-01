const { genererFacture , getFacturesByClient , getFactureDetails , getFacturesDuJour , getFacturesDuJourDetails } = require('../services/factureService');

const createFacture = async (req, res) => {
    try {
        const { id_intervention } = req.body;

        if (!id_intervention) {
            return res.status(400).json({ message: "L'ID de l'intervention est requis." });
        }

        const facture = await genererFacture(id_intervention);
        return res.status(201).json({ message: "Facture générée avec succès", facture });
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getFacturesByClientContoller = async (req, res) => {
    try {
        const id_client = req.user.id;
        const { page = 1, limit = 10 } = req.query; // Récupération de la pagination

        if (!id_client) {
            return res.status(400).json({ message: "L'ID du client est requis." });
        }

        const result = await getFacturesByClient(id_client, Number(page), Number(limit));

        if (!result.success) {
            return res.status(400).json({ message: result.message });
        }

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getFactureById = async (req, res) => {
    try {
        const { id_facture } = req.params;
        const factureDetails = await getFactureDetails(id_facture);

        return res.status(200).json(factureDetails);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getFacturesForMecanicien = async (req, res) => {
    try {
        const { page = 1, limit = 10, numero_facture } = req.query;

        // Conversion des paramètres
        const pageNumber = parseInt(page, 10);
        const limitNumber = parseInt(limit, 10);
        const numeroFactureString = numero_facture ? String(numero_facture) : null;

        const result = await getFacturesDuJour(pageNumber, limitNumber, numeroFactureString);

        if (!result.success) {
            return res.status(400).json({ message: result.message });
        }

        return res.status(200).json(result);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

const getFacturesForMecanicienById = async (req, res) => {
    try {
        const { id_facture } = req.params;
        const factureDetails = await getFacturesDuJourDetails(id_facture);
        return res.status(200).json(factureDetails);
    } catch (error) {
        return res.status(500).json({ message: error.message });
    }
};

module.exports = { createFacture , getFacturesByClientContoller , getFactureById , getFacturesForMecanicien , getFacturesForMecanicienById };
