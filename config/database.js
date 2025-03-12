const multer = require('multer');
const path = require('path');

// Définir l'endroit où les fichiers seront stockés localement
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/');  // Le dossier où les fichiers seront stockés
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));  // Générer un nom unique pour chaque fichier
  }
});

const upload = multer({ storage: storage });

module.exports = { upload };
