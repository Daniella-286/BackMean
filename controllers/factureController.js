const { genererFacture } = require('../services/factureService');

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

module.exports = { createFacture };
