const express = require("express");
const router = express.Router();
const QuejaController = require("../controllers/QuejaController");
const auth = require("../middleware/auth");
// const { tienePermiso } = require('../middleware/permissions');

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
 * @access  Public
 */
router.post("/", QuejaController.create);

/**
 * @route   PUT /api/tbQueja/:id
 * @desc    Actualizar Queja
 * @access  Public
 */
router.put("/:id", QuejaController.update);

/**
 * @route   DELETE /api/tbQueja/:id
 * @desc    Eliminar Queja
 * @access  Public
 */
router.delete("/:id", QuejaController.delete);

router.patch("/:id/cerrar", QuejaController.cerrar);

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
