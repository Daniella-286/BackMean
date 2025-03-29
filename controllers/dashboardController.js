const dashboardService = require("../services/dashboardServices");

///// Activité du garage (Réparations & Services)

const getTotalInterventionsController = async (req, res) => {
    try {
        const total = await dashboardService.getTotalInterventions();
        res.json({ total });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error });
    }
};

const getAverageInvoiceAmountController = async (req, res) => {
    try {
        const data = await dashboardService.getAverageInvoiceAmount();
        res.json({ average: data });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error });
    }
};

const getInterventionsTermineesParMoisController = async (req, res) => {
    try {
        const { annee } = req.query; // Récupérer l'année depuis les paramètres (optionnel)
        const stats = await dashboardService.getInterventionsTermineesParMois(parseInt(annee));
        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des statistiques des interventions", error });
    }
};

///// Suivi du stock

// Historique des mouvements de stock
const getStockHistoryController = async (req, res) => {
    try {
        const history = await dashboardService.getStockHistory();
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération de l’historique', error });
    }
};

const getStockRestantController = async (req, res) => {
    try {
        const stock = await dashboardService.getStockRestant();
        res.status(200).json(stock);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération du stock restant", error });
    }
};

///// Suivi financier

// Montant total encaissé (par mois/semaine/année)
const getMontantTotalParMoisController = async (req, res) => {
    try {
        const { annee } = req.query; 
        const stats = await dashboardService.getMontantTotalParMois(parseInt(annee));
        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des montants en caisse", error });
    }
};

// Nombre de factures générées et montants totaux
const getFacturesStatsController = async (req, res) => {
    try {
        const stats = await dashboardService.getFacturesStats();
        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération des factures', error });
    }
};

/////  Occupation et gestion du parking

// Taux d'occupation du parking
const getTauxOccupationController = async (req, res) => {
    try {
        const { capacite } = req.query; // Capacité totale du parking
        if (!capacite) return res.status(400).json({ message: 'Capacité du parking requise' });

        const taux = await dashboardService.getTauxOccupation(parseInt(capacite));
        res.status(200).json({ taux });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors du calcul du taux d’occupation', error });
    }
};

// Nombre total de réservations
const getNombreReservationsController = async (req, res) => {
    try {
        const total = await dashboardService.getNombreReservations();
        res.status(200).json({ total });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération du nombre de réservations', error });
    }
};

// Durée moyenne des réservations
const getDureeMoyenneReservationsController = async (req, res) => {
    try {
        const moyenne = await dashboardService.getDureeMoyenneReservations();
        res.status(200).json({ moyenne });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors du calcul de la durée moyenne des réservations', error });
    }
};

// Statistiques générales 

// Nombre total de clients
const getNombreClientsController = async (req, res) => {
    try {
        const total = await dashboardService.getNombreClients();
        res.status(200).json({ total });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération du nombre de clients', error });
    }
};

// Nombre total de réservations (services + parking)
const getNombreReservationsController2 = async (req, res) => {
    try {
        const total = await dashboardService.getNombreReservations2();
        res.status(200).json({ total });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération du nombre de réservations', error });
    }
};

// Nombre total de factures générées (services + parking)
const getNombreFacturesController = async (req, res) => {
    try {
        const total = await dashboardService.getNombreFactures();
        res.status(200).json({ total });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération du nombre de factures', error });
    }
};

module.exports = {
    getTotalInterventionsController,
    getAverageInvoiceAmountController,
    getInterventionsTermineesParMoisController,
    getStockHistoryController,
    getStockRestantController,
    getMontantTotalParMoisController,

    getFacturesStatsController,
    getTauxOccupationController,
    getNombreReservationsController,
    getDureeMoyenneReservationsController,
    getNombreClientsController,
    getNombreReservationsController2,
    getNombreFacturesController
};