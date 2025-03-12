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

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Permet les requêtes CORS
app.use(express.json()); // Permet d'analyser les corps de requêtes JSON
app.use(express.urlencoded({ extended: true }));

// Sessions
app.use(session({
  secret: 'secret',  // Change cela avec une clé secrète plus sécurisée
  resave: false,
  saveUninitialized: true,
}));

// Passport middleware
require('./config/passport')(passport); // Ajoute la configuration de passport
app.use(passport.initialize());
app.use(passport.session());

// Connexion à MongoDB
console.log("URI MongoDB :", process.env.MONGO_URI);
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


// Démarrer le serveur
app.listen(PORT, () => console.log(`Serveur démarré sur le port ${PORT}`));
