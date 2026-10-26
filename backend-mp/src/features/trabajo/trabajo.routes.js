const express = require("express");
const router = express.Router();
const TrabajoController = require("./trabajo.controller");
const auth = require("../../shared/middleware/auth");
const { tienePermiso } = require("../../shared/middleware/permissions");

router.use(auth);
/**
 * @route   GET /api/tbTrabajo
 * @desc    Obtener todos los tbTrabajo
 * @access  Public
 */
router.get("/", TrabajoController.getAll);

/**
 * @route   GET /api/tbTrabajo/:id
 * @desc    Obtener un Trabajo por ID
 * @access  Public
 */
router.get("/:id", TrabajoController.getById);

/**
 * @route   POST /api/tbTrabajo
 * @desc    Crear nuevo Trabajo
 * @access  Permiso: trabajos.crear
 */
router.post("/", tienePermiso("trabajos.crear"), TrabajoController.create);

/**
 * @route   PUT /api/tbTrabajo/:id
 * @desc    Actualizar Trabajo
 * @access  Permiso: trabajos.actualizar
 */
router.put("/:id", tienePermiso("trabajos.actualizar"), TrabajoController.update);

/**
 * @route   DELETE /api/tbTrabajo/:id
 * @desc    Eliminar Trabajo
 * @access  Permiso: trabajos.eliminar
 */
router.delete("/:id", tienePermiso("trabajos.eliminar"), TrabajoController.delete);

/**
 * @route   PATCH /api/tbTrabajo/:id/cerrar
 * @desc    Cerrar Trabajo
 * @access  Permiso: trabajos.cerrar
 */
router.patch("/:id/cerrar", tienePermiso("trabajos.cerrar"), TrabajoController.cerrar);

module.exports = router;
