const express = require("express");
const router = express.Router();
const TipomovimientoController = require("../controllers/TipomovimientoController");
const auth = require("../middleware/auth");
const { tienePermiso } = require("../middleware/permissions");

router.use(auth);
/**
 * @route   GET /api/tbTipomovimiento
 * @desc    Obtener todos los tbTipomovimiento
 * @access  Public
 */
router.get("/", TipomovimientoController.getAll);

/**
 * @route   GET /api/tbTipomovimiento/:id
 * @desc    Obtener un Tipomovimiento por ID
 * @access  Public
 */
router.get("/:id", TipomovimientoController.getById);

/**
 * @route   POST /api/tbTipomovimiento
 * @desc    Crear nuevo Tipomovimiento
 * @access  Public
 */
router.post(
  "/",
  tienePermiso("nomencladores.gestionar"),
  TipomovimientoController.create,
);

/**
 * @route   PUT /api/tbTipomovimiento/:id
 * @desc    Actualizar Tipomovimiento
 * @access  Public
 */
router.put(
  "/:id",
  tienePermiso("nomencladores.gestionar"),
  TipomovimientoController.update,
);

/**
 * @route   DELETE /api/tbTipomovimiento/:id
 * @desc    Eliminar Tipomovimiento
 * @access  Public
 */
router.delete(
  "/:id",
  tienePermiso("nomencladores.gestionar"),
  TipomovimientoController.delete,
);

module.exports = router;
