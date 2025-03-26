const TypeMouvement = require('../models/TypeMouvement');

const ajouterTypeMouvement = async (nom_type) => {
    try {
        if (!nom_type) {
            return { success: false, message: "Le champ nom_type est requis." };
        }

        const nouveauTypeMouvement = new TypeMouvement({ nom_type });
        await nouveauTypeMouvement.save();

        return { success: true, data: nouveauTypeMouvement, message: "Type de mouvement ajouté avec succès." };
    } catch (error) {
        return { success: false, message: "Erreur lors de l'ajout du type de mouvement.", error: error.message };
    }
};


const getAllTypeMouvements = async () => {
    try {
        const typesMouvements = await TypeMouvement.find().sort({ createdAt: -1 }); // Trie par date décroissante
        return { success: true, data: typesMouvements };
    } catch (error) {
        return { success: false, message: "Erreur lors de la récupération des types de mouvements.", error: error.message };
    }
};

module.exports = {
    ajouterTypeMouvement , getAllTypeMouvements
};
