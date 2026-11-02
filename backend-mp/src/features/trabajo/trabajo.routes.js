const express = require("express");
const router = express.Router();
const TrabajoController = require("./trabajo.controller");
const TrabajoEstadisticasController = require("./trabajo.estadisticas.controller");
const validate = require("../../shared/middleware/validate");
const {
  trabajadorStatsQuerySchema,
  quejaStatsParamsSchema,
  trabajoStatsParamsSchema,
} = require("./trabajo.estadisticas.validation");
const auth = require("../../shared/middleware/auth");
const { tienePermiso } = require("../../shared/middleware/permissions");

router.use(auth);

// ============================================================
// ESTADÍSTICAS (TASK-710-08 — variantes B y E)
// ⚠️ Deben declararse ANTES de /:id para no ser capturadas por él
// ============================================================

/**
 * @route   GET /api/trabajo/estadisticas/trabajadores
 * @desc    Estadísticas agrupadas por trabajador (vista B)
 * @access  Auth
 */
router.get(
  "/estadisticas/trabajadores",
  validate(trabajadorStatsQuerySchema, "query"),
  TrabajoEstadisticasController.porTrabajador,
);

/**
 * @route   GET /api/trabajo/estadisticas/queja/:id_queja
 * @desc    Estadísticas de los trabajos de una queja (vista B/E)
 * @access  Auth
 */
router.get(
  "/estadisticas/queja/:id_queja",
  validate(quejaStatsParamsSchema, "params"),
  TrabajoEstadisticasController.porQueja,
);

/**
 * @route   GET /api/trabajo/:id/estadisticas
 * @desc    Ficha estadística individual de un trabajo (vista E)
 * @access  Auth
 */
router.get(
  "/:id/estadisticas",
  validate(trabajoStatsParamsSchema, "params"),
  TrabajoEstadisticasController.trabajoDetalle,
);

// ============================================================
// CRUD estándar
// ============================================================

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

module.exports = router;
