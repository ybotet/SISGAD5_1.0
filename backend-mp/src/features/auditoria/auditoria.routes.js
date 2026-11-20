const express = require("express");
const router = express.Router();
const AuditoriaController = require("./auditoria.controller");
const auth = require("../../shared/middleware/auth");
const { tienePermiso } = require("../../shared/middleware/permissions");

// Todas las rutas requieren autenticación
router.use(auth);

/**
 * @route   GET /api/mp/auditoria
 * @desc    Listar auditoría (solo admin)
 * @access  Permiso: auditoria.ver
 */
router.get("/", tienePermiso("auditoria.ver"), AuditoriaController.getAll);

module.exports = router;