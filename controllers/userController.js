const Client = require('../models/Client');
const Manager = require('../models/Manager');
const Mecanicien = require('../models/Mecanicien');
const { hashPassword, comparePassword, generateToken } = require('../services/authService');
const passport = require('passport');

// INSCRIPTION CLIENT
const registerClient = async (req, res) => {
    const { nom, prenom, date_naissance, genre, contact, adresse, email, mdp } = req.body;
    try {
        let client = await Client.findOne({ email });
        if (client) return res.status(400).json({ message: 'Client déjà existant' });

        const hashedPassword = await hashPassword(mdp);
        client = new Client({ nom, prenom, date_naissance, genre, contact, adresse, email, mdp: hashedPassword });

        await client.save();
        res.status(201).json({ message: 'Client enregistré avec succès' });
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
};

// CONNEXION CLIENT
const loginClient = (req, res, next) => {
    passport.authenticate('client', { session: false }, (err, client, info) => {
        if (err || !client) return res.status(400).json({ message: info?.message || 'Authentification échouée' });
        const token = generateToken(client, 'client');
        res.json({ message: 'Connexion réussie', token });
    })(req, res, next);    
};

// INSCRIPTION MANAGER (Créé manuellement)
const registerManager = async (req, res) => {
    const { email, mdp } = req.body;
    try {
        let manager = await Manager.findOne({ email });
        if (manager) return res.status(400).json({ message: 'Manager déjà existant' });

        const hashedPassword = await hashPassword(mdp);
        manager = new Manager({ email, mdp: hashedPassword });

        await manager.save();
        res.status(201).json({ message: 'Manager enregistré avec succès' });
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
};

// CONNEXION MANAGER
const loginManager = (req, res, next) => {
    passport.authenticate('manager', { session: false }, (err, manager, info) => {
        if (err || !manager) return res.status(400).json({ message: info?.message || 'Authentification échouée' });

        const token = generateToken(manager, 'manager');
        res.json({ message: 'Connexion réussie', token });
    })(req, res, next);
};

// INSCRIPTION MECANICIEN
const registerMecanicien = async (req, res) => {
    const { nom, prenom, id_competence, id_service, date_naissance, genre, contact, adresse, email, mdp } = req.body;
    try {
        let mecanicien = await Mecanicien.findOne({ email });
        if (mecanicien) return res.status(400).json({ message: 'Mécanicien déjà existant' });

        const hashedPassword = await hashPassword(mdp);
        mecanicien = new Mecanicien({
            nom, prenom, id_competence, id_service, date_naissance, genre, contact, adresse, email,
            mdp: hashedPassword, statut: false
        });

        await mecanicien.save();
        res.status(201).json({ message: 'Mécanicien enregistré, en attente de validation par un manager' });
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
};

// VALIDATION MECANICIEN PAR MANAGER
const validateMecanicien = async (req, res) => {
    try {
        const mecanicien = await Mecanicien.findById(req.params.id);
        if (!mecanicien) return res.status(404).json({ message: 'Mécanicien non trouvé' });

        // Mettre à jour le statut du mécanicien pour valider son compte
        mecanicien.statut = true;
        await mecanicien.save();
        res.json({ message: 'Mécanicien validé avec succès' });
    } catch (err) {
        res.status(500).json({ message: 'Erreur serveur', error: err.message });
    }
};


// CONNEXION MECANICIEN
const loginMecanicien = (req, res, next) => {
    passport.authenticate('mecanicien', { session: false }, async (err, mecanicien, info) => {
      if (err || !mecanicien) {
        return res.status(400).json({ message: info?.message || 'Authentification échouée' });
      }
  
      // Vérifier si le mécanicien est validé (statut = true)
      if (!mecanicien.statut) {
        return res.status(403).json({ message: 'Votre demande n\'a pas encore été validée. Veuillez attendre l\'approbation.' });
      }
  
      // Si le mécanicien est validé, on génère un token
      const token = generateToken(mecanicien, 'mecanicien');
      res.json({ message: 'Connexion réussie', token });
    })(req, res, next);
  };
  


module.exports = {
    registerClient,
    loginClient,
    registerManager,
    loginManager,
    registerMecanicien,
    validateMecanicien,
    loginMecanicien
};
