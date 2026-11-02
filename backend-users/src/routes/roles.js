const express = require('express');
const router = express.Router();
const rolesController = require('../controllers/RolController');
const auth = require('../middleware/auth');
const { tienePermiso } = require('../middleware/permissions');

router.use(auth);

router.get('/', tienePermiso('usuarios.ver'), rolesController.obtenerRoles);

module.exports = router;