const { gererMouvementStock } = require('../services/mouvementStockService');

const mouvementStockController = async (req, res) => {
    const { id_piece, id_type_mouvement, quantite } = req.body;

    try {
        await gererMouvementStock(id_piece, id_type_mouvement, quantite);
        res.status(201).json({ message: "Mouvement de stock enregistré avec succès." });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

module.exports = { mouvementStockController };
