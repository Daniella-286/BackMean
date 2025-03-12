const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const multerStorageCloudinary = require('multer-storage-cloudinary').CloudinaryStorage;

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Configurer Multer pour Cloudinary
const storage = new multerStorageCloudinary({
  cloudinary: cloudinary,
  params: {
    folder: 'services',  // Dossier où tes images seront stockées
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
  },
});

const upload = multer({ storage });

module.exports = { cloudinary, upload };
