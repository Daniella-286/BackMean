const dashboardService = require("../services/dashboardServices");


const getTotalInterventionsController = async (req, res) => {
    try {
        const total = await dashboardService.getTotalInterventions();
        res.json({ total });
    } catch (error) {
        res.status(500).json({ message: "Erreur serveur", error });
    }
};

const getNombreClientsController = async (req, res) => {
    try {
        const total = await dashboardService.getNombreClients();
        res.status(200).json({ total });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération du nombre de clients', error });
    }
};

const getNombreReservationsController = async (req, res) => {
    try {
        const total = await dashboardService.getNombreReservations();
        res.status(200).json({ total });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération du nombre de réservations', error });
    }
};

const getTotalCaisseController = async (req, res) => {
    try {
        const result = await dashboardService.getTotalCaisse();
        if (result.success) {
            res.status(200).json(result);
        } else {
            res.status(500).json({ success: false, message: result.message });
        }
    } catch (error) {
        res.status(500).json({ success: false, message: `Erreur serveur : ${error.message}` });
    }
};

const getNombreMecaniciensController = async (req, res) => {
    try {
        const total = await dashboardService.getNombreMecaniciens();
        res.status(200).json({ total });
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération du nombre de clients', error });
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

const getStockHistoryController = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const history = await dashboardService.getStockHistory(page, limit);
        
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ message: 'Erreur lors de la récupération de l’historique', error });
    }
};


const getStockRestantController = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;

        const stockData = await dashboardService.getStockRestant(page, limit);
        res.status(200).json(stockData);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération du stock restant", error: error.message });
    }
};


const getMontantTotalParMoisController = async (req, res) => {
    try {
        const { annee } = req.query; 
        const stats = await dashboardService.getMontantTotalParMois(parseInt(annee));
        res.status(200).json(stats);
    } catch (error) {
        res.status(500).json({ message: "Erreur lors de la récupération des montants en caisse", error });
    }
};

module.exports = {
    getTotalInterventionsController,
    getAverageInvoiceAmountController,
    getInterventionsTermineesParMoisController,
    getStockHistoryController,
    getStockRestantController,
    getNombreMecaniciensController,
    getMontantTotalParMoisController,
    getTotalCaisseController,
    getNombreReservationsController,
    getNombreClientsController,
};