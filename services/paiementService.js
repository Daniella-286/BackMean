const PaiementService = require('../models/PaiementService');
const Facture = require('../models/Facture');
const PaiementParking = require('../models/PaiementParking');
const FactureParking = require('../models/FactureParking');


const effectuerPaiementService = async (id_facture, montant) => {
    try {
        // Vérifier si la facture existe
        const facture = await Facture.findById(id_facture);
        if (!facture) {
            throw new Error("Facture introuvable.");
        }

        // Créer un paiement pour la facture
        const paiement = new PaiementService({
            id_facture: id_facture,
            montant: montant
        });

        // Sauvegarder le paiement
        await paiement.save();

        // Mettre à jour la facture avec le statut payé
        facture.status = 'payée';
        await facture.save();

        return paiement;
    } catch (error) {
        throw new Error("Erreur lors du paiement : " + error.message);
    }
};

const effectuerPaiementParking = async (id_facture, montant) => {
    try {
        // Vérifier si la facture de parking existe
        const factureParking = await FactureParking.findById(id_facture);
        if (!factureParking) {
            throw new Error("Facture de parking introuvable.");
        }

        // Créer un paiement pour la facture de parking
        const paiement = new PaiementParking({
            id_facture: id_facture,
            montant: montant
        });

        // Sauvegarder le paiement
        await paiement.save();

        // Mettre à jour la facture de parking avec le statut payé
        factureParking.status = 'payée';
        await factureParking.save();

        return paiement;
    } catch (error) {
        throw new Error("Erreur lors du paiement : " + error.message);
    }
};

module.exports = { effectuerPaiementService , effectuerPaiementParking };

