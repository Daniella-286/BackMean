const LocalStrategy = require('passport-local').Strategy;
const bcrypt = require('bcryptjs');
const Client = require('../models/Client');
const Manager = require('../models/Manager');
const Mecanicien = require('../models/Mecanicien');

module.exports = function (passport) {
  const authenticateUser = async (email, mdp, done, role) => {
    try {
      let user;
      if (role === 'client') user = await Client.findOne({ email });
      if (role === 'manager') user = await Manager.findOne({ email });
      if (role === 'mecanicien') user = await Mecanicien.findOne({ email });

      if (!user) return done(null, false, { message: 'Utilisateur non trouvé' });

      const isMatch = await bcrypt.compare(mdp, user.mdp);
      if (!isMatch) return done(null, false, { message: 'Mot de passe incorrect' });

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  };

  passport.use('client', new LocalStrategy(
    { usernameField: 'email', passwordField: 'mdp' },
    (email, mdp, done) => authenticateUser(email, mdp, done, 'client')
  ));

  passport.use('manager', new LocalStrategy(
    { usernameField: 'email', passwordField: 'mdp' },
    (email, mdp, done) => authenticateUser(email, mdp, done, 'manager')
  ));

  passport.use('mecanicien', new LocalStrategy(
    { usernameField: 'email', passwordField: 'mdp' },
    (email, mdp, done) => authenticateUser(email, mdp, done, 'mecanicien')
  ));

  // Sérialisation et désérialisation de l'utilisateur
  passport.serializeUser((user, done) => {
    done(null, { id: user.id, role: user.constructor.modelName });
  });

  passport.deserializeUser(async (obj, done) => {
    try {
      let user;
      if (obj.role === 'Client') user = await Client.findById(obj.id);
      if (obj.role === 'Manager') user = await Manager.findById(obj.id);
      if (obj.role === 'Mecanicien') user = await Mecanicien.findById(obj.id);

      done(null, user);
    } catch (err) {
      done(err);
    }
  });
};
