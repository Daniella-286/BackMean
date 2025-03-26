const { listesDemandesParClientEnvoye , creerDemandeDevis, ajouterSousServicesDemande, ajouterPhotosDemande , listesDemandesParClient , obtenirDemandesEnAttente } = require('../services/demandeDevisService');
const { envoyerDevis } = require('../services/devisService');

const soumettreDemandeDevis = async (req, res) => {
    try {
        const { id_vehicule, id_service, probleme, sous_services } = req.body;
        const fichiers = req.files; 
        const id_client = req.user.id; 

        if (!id_vehicule || !id_service || !probleme) {
            return res.status(400).json({ message: 'Tous les champs sont obligatoires.' });
        }

        const demande = await creerDemandeDevis(id_vehicule, id_service, probleme , id_client);

        let sousServicesArray = [];
        if (typeof sous_services === 'string') {
            sousServicesArray = JSON.parse(sous_services);
        } else {
            sousServicesArray = sous_services;
        }

        if (sousServicesArray.length > 0) {
            await ajouterSousServicesDemande(demande._id, sousServicesArray);
        }

        if (fichiers && fichiers.length > 0) {
            await ajouterPhotosDemande(demande._id, fichiers);
        }

        res.status(201).json({ message: 'Demande de devis envoyée avec succès.', demande });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Listes des demandes envoyés vu par le client et avec statut
const listerDemandesClient = async (req, res) => {
    try {
        const id_client = req.user.id; 
        const { date_debut, date_fin } = req.query; 

        const result = await listesDemandesParClient(id_client, date_debut, date_fin);

        if (!result.success) {
            return res.status(400).json({ message: result.message });
        }

        if (!result.demandes || result.demandes.length === 0) {
            return res.status(200).json({ message: "Aucune demande en attente trouvée pour cette période." });
        }

        res.status(200).json({ demandes: result.demandes });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Listes des demandes envoyés vu par le manager pour envoyé les devis
const afficherDemandesEnAttente = async (req, res) => {
    try {
        const { date_debut, date_fin } = req.query; // Récupérer les dates de filtrage

        const result = await obtenirDemandesEnAttente(date_debut, date_fin);

        if (!result.success) {
            return res.status(400).json({ message: result.message });
        }

        if (!result.demandes || result.demandes.length === 0) {
            return res.status(200).json({ message: "Aucune demande en attente trouvée pour cette période." });
        }

        res.status(200).json({ demandes: result.demandes });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

//Listes des demandes envoyés vu par le client et avec statut
const listerDemandesClientEnvoye = async (req, res) => {
    try {
        const id_client = req.user.id; 
        const { date_debut, date_fin } = req.query; 

        const result = await listesDemandesParClientEnvoye(id_client, date_debut, date_fin);

        if (!result.success) {
            return res.status(400).json({ message: result.message });
        }

        if (!result.demandes || result.demandes.length === 0) {
            return res.status(200).json({ message: "Aucune devis envoyé pour cette période."});
        }

        res.status(200).json({ demandes: result.demandes });
    } catch (error) {
        res.status(500).json({ message: "Une erreur est survenue : " + error.message });
    }
};

///

const envoyerDevisController = async (req, res) => {
    try {
        const { id_demande } = req.params;
        const resultat = await envoyerDevis(id_demande);

        if (!resultat.success) {
            return res.status(400).json({ message: resultat.message });
        }

        return res.status(200).json({ 
            message: resultat.message,
            data: resultat.data // On retourne aussi les données insérées
        });
    } catch (error) {
        return res.status(500).json({ message: "Erreur interne du serveur: " + error.message });
    }
};


module.exports = { envoyerDevisController, listerDemandesClientEnvoye , soumettreDemandeDevis , listerDemandesClient , afficherDemandesEnAttente };
