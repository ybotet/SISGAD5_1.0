const express = require('express');
const router = express.Router();
const authController = require('../controllers/AuthController');
const auth = require('../middleware/auth');

router.post('/login', authController.login);
router.get('/perfil', auth, authController.perfil);

module.exports = router;