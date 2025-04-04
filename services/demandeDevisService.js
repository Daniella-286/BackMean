const DemandeDevis = require('../models/DemandeDevis');
const DemandeDevisDetail = require('../models/DemandeDevisDetail');
const DevisImage = require('../models/DevisImage');
const cloudinary = require('cloudinary').v2;
require('dotenv').config(); 

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const creerDemandeDevis = async (id_vehicule, id_service, probleme, id_client) => {
    try {
        const nouvelleDemande = new DemandeDevis({
            id_vehicule,
            id_service,
            probleme,
            id_client,
            statut: 'En attente'
        });
        await nouvelleDemande.save();
        return nouvelleDemande;
    } catch (error) {
        throw new Error('Erreur lors de la création de la demande de devis: ' + error.message);
    }
};

const ajouterSousServicesDemande = async (id_demande, sous_services) => {
    try {
        if (!Array.isArray(sous_services)) {
            throw new Error('sous_services doit être un tableau');
        }

        const details = sous_services.map(sous_service => ({
            id_demande,
            id_sous_service: sous_service,
        }));

        await DemandeDevisDetail.insertMany(details);
    } catch (error) {
        throw new Error('Erreur lors de l’ajout des sous-services: ' + error.message);
    }
};

const uploadToCloudinary = async (file) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload_stream({ resource_type: 'image' }, (error, result) => {
            if (error) {
                reject(error);
            } else {
                resolve(result.secure_url);
            }
        }).end(file.buffer);
    });
};

const ajouterPhotosDemande = async (id_demande, fichiers) => {
    try {
        const uploadPromises = fichiers.map(async (fichier) => {
            const imageUrl = await uploadToCloudinary(fichier);
            return { id_demande, url: imageUrl };
        });

        const imagesUploadées = await Promise.all(uploadPromises);

        await DevisImage.insertMany(imagesUploadées);

    } catch (error) {
        console.error("Erreur lors de l'upload des images :", error);
        throw error;
    }
};

//////

//Listes des demandes en attente vu par le client
const listesDemandesParClient = async (id_client, date_debut, date_fin, page = 1, limit = 10) => {
    try {
        if (!date_debut || !date_fin) {
            const today = new Date();
            date_fin = date_fin ? new Date(date_fin) : new Date(today);
            date_debut = date_debut ? new Date(date_debut) : new Date(today.setDate(today.getDate() - 30));
            date_debut.setUTCHours(0, 0, 0, 0);
            date_fin.setUTCHours(23, 59, 59, 999);
        } else {
            date_debut = new Date(date_debut);
            date_fin = new Date(date_fin);
        }

        const skip = (page - 1) * limit;

        const demandes = await DemandeDevis.find({
            id_client,
            statut: 'En attente',
            date_demande: { $gte: date_debut, $lte: date_fin }
        })
            .populate('id_vehicule', 'immatriculation')
            .populate('id_service', 'nom_service')
            .sort({ date_demande: -1 })
            .skip(skip)
            .limit(limit);

        const total = await DemandeDevis.countDocuments({
            id_client,
            statut: 'En attente',
            date_demande: { $gte: date_debut, $lte: date_fin }
        });

        const totalPages = Math.ceil(total / limit);

        const demandesDetails = await Promise.all(demandes.map(async (demande) => {
            const details = await DemandeDevisDetail.find({ id_demande: demande._id })
                .populate('id_sous_service', 'nom_sous_service');

            const images = await DevisImage.find({ id_demande: demande._id }).select('url');

            return {
                id_demande: demande._id,
                date_demande: demande.date_demande,
                probleme: demande.probleme,
                statut: demande.statut,
                vehicule: {
                    immatriculation: demande.id_vehicule?.immatriculation || "Non spécifié"
                },
                service_principal: {
                    id: demande.id_service?._id,
                    nom: demande.id_service?.nom_service || "Non spécifié"
                },
                sous_services: details.map(detail => ({
                    id: detail.id_sous_service?._id,
                    nom: detail.id_sous_service?.nom_sous_service
                })),
                images: images.map(image => image.url)
            };
        }));

        return { 
            success: true, 
            page, 
            limit, 
            total, 
            totalPages, 
            demandes: demandesDetails 
        };
    } catch (error) {
        return { success: false, message: 'Erreur lors de la récupération des demandes de devis: ' + error.message };
    }
};

//Listes des demandes en attente vu par le manager pour envoyé les devis
const obtenirDemandesEnAttente = async (date_debut, date_fin, page = 1, limit = 10) => {
    try {
        if (!date_debut || !date_fin) {
            const today = new Date();
            date_fin = date_fin ? new Date(date_fin) : new Date(today);
            date_debut = date_debut ? new Date(date_debut) : new Date(today.setDate(today.getDate() - 30));
        } else {
            date_debut = new Date(date_debut);
            date_fin = new Date(date_fin);
        }
        
        date_debut.setUTCHours(0, 0, 0, 0);
        date_fin.setUTCHours(23, 59, 59, 999);

        // Nombre total de demandes
        const totalDemandes = await DemandeDevis.countDocuments({
            statut: 'En attente',
            date_demande: { $gte: date_debut, $lte: date_fin }
        });

        // Récupérer les demandes avec les informations des véhicules, services et clients
        const demandes = await DemandeDevis.find({
            statut: 'En attente',
            date_demande: { $gte: date_debut, $lte: date_fin }
        })
            .populate('id_vehicule', 'immatriculation')
            .populate('id_service', 'nom_service')
            .populate('id_client', 'nom prenom') // Ajout pour récupérer les informations du client
            .sort({ date_demande: -1 })
            .skip((page - 1) * limit)
            .limit(limit);

        // Ajouter sous-services et images
        const demandesDetails = await Promise.all(demandes.map(async (demande) => {
            const details = await DemandeDevisDetail.find({ id_demande: demande._id })
                .populate('id_sous_service', 'nom_sous_service'); 
    
            const images = await DevisImage.find({ id_demande: demande._id }).select('url');
    
            return {
                id_demande: demande._id,
                date_demande: demande.date_demande,
                probleme: demande.probleme,
                statut: demande.statut,
                client: {
                    nom: demande.id_client?.nom || "Non spécifié",
                    prenom: demande.id_client?.prenom || "Non spécifié"
                },
                vehicule: {
                    immatriculation: demande.id_vehicule?.immatriculation || "Non spécifié"
                },
                service_principal: {
                    id: demande.id_service?._id,
                    nom: demande.id_service?.nom_service || "Non spécifié"
                },
                sous_services: details.map(detail => ({
                    id: detail.id_sous_service?._id,
                    nom: detail.id_sous_service?.nom_sous_service
                })),
                images: images.map(image => image.url)
            };
        }));

        return { 
            success: true, 
            demandes: demandesDetails, 
            pagination: {
                total: totalDemandes,
                page,
                totalPages: Math.ceil(totalDemandes / limit),
                limit
            }
        };
    } catch (error) {
        return { success: false, message: 'Erreur lors de la récupération des demandes en attente: ' + error.message };
    }
};

//Listes des demandes responses vu par le client
const listesDemandesParClientEnvoye = async (id_client, date_debut, date_fin, page = 1, limit = 10) => {
    try {
        if (!date_debut || !date_fin) {
            const today = new Date();
            date_fin = date_fin ? new Date(date_fin) : new Date(today);
            date_debut = date_debut ? new Date(date_debut) : new Date(today.setDate(today.getDate() - 30));
        } else {
            date_debut = new Date(date_debut);
            date_fin = new Date(date_fin);
        }

        date_debut.setUTCHours(0, 0, 0, 0);
        date_fin.setUTCHours(23, 59, 59, 999);

        const skip = (page - 1) * limit;

        // Nombre total de demandes
        const total = await DemandeDevis.countDocuments({
            id_client,
            statut: 'Envoyé',
            date_demande: { $gte: date_debut, $lte: date_fin }
        });

        // Récupération paginée des demandes
        const demandes = await DemandeDevis.find({
            id_client,
            statut: 'Envoyé',
            date_demande: { $gte: date_debut, $lte: date_fin }
        })
            .populate('id_vehicule', 'immatriculation')
            .populate('id_service', 'nom_service')
            .sort({ date_demande: -1 })
            .skip(skip)
            .limit(limit);

        const demandesDetails = await Promise.all(demandes.map(async (demande) => {
            const details = await DemandeDevisDetail.find({ id_demande: demande._id })
                .populate('id_sous_service', 'nom_sous_service'); 
    
            const images = await DevisImage.find({ id_demande: demande._id }).select('url');
    
            return {
                id_demande: demande._id,
                date_demande: demande.date_demande,
                probleme: demande.probleme,
                statut: demande.statut,
                vehicule: {
                    immatriculation: demande.id_vehicule?.immatriculation || "Non spécifié"
                },
                service_principal: {
                    id: demande.id_service?._id,
                    nom: demande.id_service?.nom_service || "Non spécifié"
                },
                sous_services: details.map(detail => ({
                    id: detail.id_sous_service?._id,
                    nom: detail.id_sous_service?.nom_sous_service
                })),
                images: images.map(image => image.url)
            };
        }));

        return { 
            success: true, 
            page, 
            limit, 
            total, 
            totalPages: Math.ceil(total / limit), 
            demandes: demandesDetails 
        };
    } catch (error) {
        return { success: false, message: 'Erreur lors de la récupération des demandes de devis: ' + error.message };
    }
};


module.exports = { listesDemandesParClientEnvoye ,creerDemandeDevis, ajouterSousServicesDemande, ajouterPhotosDemande ,listesDemandesParClient ,obtenirDemandesEnAttente };
