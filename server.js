const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const passport = require('passport');
const session = require('express-session');
require('dotenv').config();

// Routes
const serviceRoutes = require('./routes/serviceRoutes');
const sousServiceRoutes = require('./routes/sousServiceRoutes');
const userRoutes = require('./routes/usersRoutes');  
const competenceRoutes = require('./routes/competenceRoutes');
const modeleRoutes = require('./routes/modeleRoutes');
const marqueRoutes = require('./routes/marqueRoutes');
const vehiculeRoutes = require('./routes/vehiculeRoutes');
const mecanicienRoutes = require('./routes/mecanicienRoutes');
const deadlineRoutes = require('./routes/deadlineRoutes');
const parkingRoutes = require('./routes/parkingRoutes');
const seuilStockRoutes = require('./routes/seuilStockRoutes');
const reservationRoutes = require('./routes/reservationRoutes');
const demandeDevisRoutes = require('./routes/demandeDevisRoutes');
const rendezVousRoutes = require('./routes/rendezVousRoutes');
const pieceRoutes = require('./routes/pieceRoutes');
const pieceSousServiceRoutes = require('./routes/pieceSousServiceRoutes');
const interventionRoutes = require('./routes/interventionRoutes');
const clientRoutes = require('./routes/clientRoutes');
const devisRoutes = require('./routes/devisRoutes');
const typeMouvementRoutes = require('./routes/typeMouvementRoutes');
const mouvementStockRoutes = require('./routes/mouvementStockRoutes'); // Import des routes
const factureRoutes = require('./routes/factureRoutes');
const factureParkingRoutes = require('./routes/factureParkingRoutes');
const paiementRoutes = require('./routes/paiementRoutes');
const dashboardRoutes = require("./routes/dashboardRoutes");


const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Permet les requêtes CORS

// Augmenter la limite de taille pour éviter l'erreur "PayloadTooLargeError"
app.use(express.json({ limit: "50mb" })); // Pour les requêtes JSON volumineuses
app.use(express.urlencoded({ limit: "50mb", extended: true })); // Pour les requêtes URL-encoded volumineuses

// Sessions
app.use(session({
  secret: 'secret',  
  resave: false,
  saveUninitialized: true,
}));

// Passport middleware
require('./config/passport')(passport); 
app.use(passport.initialize());
app.use(passport.session());

// Connexion à MongoDB
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("MongoDB connecté"))
  .catch(err => console.log("Erreur de connexion MongoDB :", err));

// Routes
app.use('/api/services', serviceRoutes); 
app.use('/api/sous-services', sousServiceRoutes);  
app.use('/api/users', userRoutes);  
app.use('/api/competences', competenceRoutes);
app.use('/api/vehicules', vehiculeRoutes);
app.use('/api/modeles', modeleRoutes);
app.use('/api/marques', marqueRoutes);
app.use('/api/mecaniciens', mecanicienRoutes);
app.use('/api/deadlines', deadlineRoutes);
app.use('/api/parkings', parkingRoutes);
app.use('/api/seuilstocks', seuilStockRoutes);
app.use('/api/reservations', reservationRoutes);
app.use('/api/demande-devis', demandeDevisRoutes);
app.use('/api/rendez-vous', rendezVousRoutes);
app.use('/api/pieces', pieceRoutes);
app.use('/api/pieces-services', pieceSousServiceRoutes);
app.use('/api/interventions', interventionRoutes);
app.use('/api/clients', clientRoutes);
app.use('/api/devis', devisRoutes);
app.use('/api/type-mouvement', typeMouvementRoutes);
app.use('/api/mouvement-stock', mouvementStockRoutes);
app.use('/api/factures', factureRoutes);
app.use('/api/factures-parking', factureParkingRoutes);
app.use('/api/paiement', paiementRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Démarrer le serveur
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
