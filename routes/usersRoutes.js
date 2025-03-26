const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');

router.post('/register/client', userController.registerClient);
router.post('/login/client', userController.loginClient);

router.post('/register/manager', userController.registerManager);
router.post('/login/manager', userController.loginManager);

router.post('/register/mecanicien', userController.registerMecanicien);
router.post('/login/mecanicien', userController.loginMecanicien);

module.exports = router;
