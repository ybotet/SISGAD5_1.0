const express = require("express");
const router = express.Router();
const AsignacionController = require("./asignacion.controller");
const auth = require("../../shared/middleware/auth");
const { tienePermiso } = require("../../shared/middleware/permissions");

router.use(auth);
/**
 * @route   POST /api/asignacion
 * @desc    Crear nueva asignacion
 * @access  Permiso: asignaciones.crear
 */
router.post("/", tienePermiso("asignaciones.crear"), AsignacionController.create);

/**
 * @route   GET /api/asignacion
 * @desc    Obtener todas las asignaciones
 * @access  Permiso: asignaciones.leer
 */
router.get("/", tienePermiso("asignaciones.leer"), AsignacionController.getAll);

/**
 * @route   GET /api/asignacion/:id
 * @desc    Obtener una asignacion por ID
 * @access  Permiso: asignaciones.leer
 */
router.get("/:id", tienePermiso("asignaciones.leer"), AsignacionController.getById);

/**
 * @route   DELETE /api/asignacion/:id
 * @desc    Eliminar una asignacion por ID
 * @access  Permiso: asignaciones.eliminar
 */
router.delete("/:id", tienePermiso("asignaciones.eliminar"), AsignacionController.delete);

module.exports = router;
