const MouvementStock = require('../models/MouvementStock');
const Piece = require('../models/Piece');
const TypeMouvement = require('../models/TypeMouvement');
const mongoose = require("mongoose"); // Assurez-vous que mongoose est bien importé


// Récupérer le type de mouvement (Entrée ou Sortie)
const getTypeMouvement = async (id_type_mouvement) => {
    return await TypeMouvement.findById(id_type_mouvement);
};

const calculerResteStock = async (id_piece) => {
    try {
        const ObjectId = mongoose.Types.ObjectId; // Conversion ObjectId

        // Vérification avec find().populate()
        const testFind = await MouvementStock.find({ id_piece: id_piece }).populate("id_type_mouvement");

        // Correction : transformation explicite de id_type_mouvement en ObjectId
        const entrees = await MouvementStock.aggregate([
            { $match: { id_piece: new ObjectId(id_piece) } },
            { $lookup: { 
                from: "typemouvements", 
                localField: "id_type_mouvement", 
                foreignField: "_id", 
                as: "type" 
            } },
            { $unwind: { path: "$type", preserveNullAndEmptyArrays: true } },
            { $match: { "type.nom_type": "Entrée" } },
            { $group: { _id: null, totalEntre: { $sum: "$quantite" } } }
        ]);

        const sorties = await MouvementStock.aggregate([
            { $match: { id_piece: new ObjectId(id_piece) } },
            { $lookup: { 
                from: "typemouvements", 
                localField: "id_type_mouvement", 
                foreignField: "_id", 
                as: "type" 
            } },
            { $unwind: { path: "$type", preserveNullAndEmptyArrays: true } },
            { $match: { "type.nom_type": "Sortie" } },
            { $group: { _id: null, totalSortie: { $sum: "$quantite" } } }
        ]);

        // Extraction des valeurs (si vide, prendre 0)
        const totalEntre = entrees.length > 0 ? entrees[0].totalEntre : 0;
        const totalSortie = sorties.length > 0 ? sorties[0].totalSortie : 0;

        const resteStock = totalEntre - totalSortie;

        return resteStock;

    } catch (error) {
        console.error("❌ Erreur lors du calcul du stock restant :", error);
        throw new Error("Impossible de calculer le stock restant.");
    }
};

// Vérifier si la quantité demandée est disponible en stock
const verifierStockDisponible = async (id_piece, quantite) => {
    const resteStock = await calculerResteStock(id_piece); // Récupérer le stock restant
    if (resteStock < quantite) {
        throw new Error("Quantité insuffisante en stock. Stock disponible : " + resteStock);
    }
};

// Ajouter un mouvement de stock
const ajouterMouvementStock = async (id_piece, id_type_mouvement, quantite) => {
    const mouvement = new MouvementStock({ id_piece, id_type_mouvement, quantite });
    await mouvement.save();
};

// Fonction principale qui gère les mouvements
const gererMouvementStock = async (id_piece, id_type_mouvement, quantite) => {
    const typeMouvement = await getTypeMouvement(id_type_mouvement);


    if (!typeMouvement) throw new Error("Type de mouvement invalide.");

    if (typeMouvement.nom_type === "Sortie") {
        await verifierStockDisponible(id_piece, quantite);
        await Piece.findByIdAndUpdate(id_piece, { $inc: { quantite_stock: -quantite } });
    } else {
        await Piece.findByIdAndUpdate(id_piece, { $inc: { quantite_stock: quantite } });
    }

    await ajouterMouvementStock(id_piece, id_type_mouvement, quantite);
};

module.exports = {
    gererMouvementStock
};
