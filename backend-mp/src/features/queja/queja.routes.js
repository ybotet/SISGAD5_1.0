const express = require("express");
const router = express.Router();
const QuejaController = require("./queja.controller");
const auth = require("../../shared/middleware/auth");
const { tienePermiso } = require("../../shared/middleware/permissions");

router.use(auth);
/**
 * @route   GET /api/tbQueja
 * @desc    Obtener todos los tbQueja
 * @access  Public
 */
router.get("/", QuejaController.getAll);

/**
 * @route   GET /api/tbQueja/:id
 * @desc    Obtener un Queja por ID
 * @access  Public
 */
router.get("/:id", QuejaController.getById);

/**
 * @route   POST /api/tbQueja
 * @desc    Crear nuevo Queja
 * @access  Permiso: quejas.crear
 */
router.post("/", tienePermiso("quejas.crear"), QuejaController.create);

/**
 * @route   PUT /api/tbQueja/:id
 * @desc    Actualizar Queja
 * @access  Permiso: quejas.actualizar
 */
router.put("/:id", tienePermiso("quejas.actualizar"), QuejaController.update);

/**
 * @route   DELETE /api/tbQueja/:id
 * @desc    Eliminar Queja
 * @access  Permiso: quejas.eliminar
 */
router.delete("/:id", tienePermiso("quejas.eliminar"), QuejaController.delete);

/**
 * @route   PATCH /api/tbQueja/:id/cerrar
 * @desc    Cerrar Queja
 * @access  Permiso: quejas.cerrar
 */
router.patch("/:id/cerrar", tienePermiso("quejas.cerrar"), QuejaController.cerrar);

// NOTE: quejas.asignar route documented pending (TASK-B-22 saga) — controller.asignar not yet implemented

// Dashboard endpoints
router.get("/dashboard/summary", QuejaController.dashboardSummary);
router.get("/dashboard/sankey", QuejaController.sankey);
router.get("/dashboard/funnel", QuejaController.funnel);
router.get("/dashboard/heatmap", QuejaController.heatmap);
router.get("/dashboard/historic", QuejaController.historic);
router.get("/dashboard/mttr", QuejaController.mttr);
router.get("/dashboard/recurrentes", QuejaController.recurrentes);
router.get("/dashboard/close_buckets", QuejaController.closeBuckets);

module.exports = router;
