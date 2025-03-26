const { getDevisDetails } = require("../services/devisService");

const getDevisDetailsController = async (req, res) => {
    try {
        const { id_demande } = req.params;

        const resultat = await getDevisDetails(id_demande);

        if (!resultat.success) {
            return res.status(404).json({ message: resultat.message });
        }

        return res.status(200).json(resultat);
    } catch (error) {
        return res.status(500).json({ message: "Erreur interne du serveur: " + error.message });
    }
};

module.exports = { getDevisDetailsController };
