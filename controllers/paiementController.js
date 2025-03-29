const paiementServiceService = require('../services/paiementService');

const effectuerPaiementServiceController = async (req, res) => {
    try {
        const { id_facture, montant } = req.body;

        // Effectuer le paiement
        const paiement = await paiementServiceService.effectuerPaiementService(id_facture, montant);

        res.status(201).json({
            message: "Paiement effectué avec succès.",
            paiement: paiement
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const effectuerPaiementParkingController = async (req, res) => {
    try {
        const { id_facture, montant } = req.body;

        // Effectuer le paiement
        const paiement = await paiementServiceService.effectuerPaiementParking(id_facture, montant);

        res.status(201).json({
            message: "Paiement de parking effectué avec succès.",
            paiement: paiement
        });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = { effectuerPaiementServiceController , effectuerPaiementParkingController};
