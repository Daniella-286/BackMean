const cloudinary = require('cloudinary').v2;
const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');

// Configuration Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

// Stockage des images des services
const serviceStorage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: {
    folder: 'services', // Stockage dans le dossier "services"
    allowed_formats: ['jpg', 'jpeg', 'png', 'gif'],
  },
});

// Middleware Multer pour l'upload des images des services
const uploadServiceImage = multer({ storage: serviceStorage }).single('image');

const storage = multer.memoryStorage();
const uploadDevisImage = multer({ storage: storage, limits: { fileSize: 10 * 1024 * 1024 } }).array('images', 5);

module.exports = { cloudinary, uploadServiceImage, uploadDevisImage };
