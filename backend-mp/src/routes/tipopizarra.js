const express = require("express");
const router = express.Router();
const TipopizarraController = require("../controllers/TipopizarraController");
const auth = require("../middleware/auth");
const { tienePermiso } = require("../middleware/permissions");

router.use(auth);
/**
 * @route   GET /api/tbTipopizarra
 * @desc    Obtener todos los tbTipopizarra
 * @access  Public
 */
router.get("/", TipopizarraController.getAll);

/**
 * @route   GET /api/tbTipopizarra/:id
 * @desc    Obtener un Tipopizarra por ID
 * @access  Public
 */
router.get("/:id", TipopizarraController.getById);

/**
 * @route   POST /api/tbTipopizarra
 * @desc    Crear nuevo Tipopizarra
 * @access  Public
 */
router.post(
  "/",
  tienePermiso("nomencladores.gestionar"),
  TipopizarraController.create,
);

/**
 * @route   PUT /api/tbTipopizarra/:id
 * @desc    Actualizar Tipopizarra
 * @access  Public
 */
router.put(
  "/:id",
  tienePermiso("nomencladores.gestionar"),
  TipopizarraController.update,
);

/**
 * @route   DELETE /api/tbTipopizarra/:id
 * @desc    Eliminar Tipopizarra
 * @access  Public
 */
router.delete(
  "/:id",
  tienePermiso("nomencladores.gestionar"),
  TipopizarraController.delete,
);

module.exports = router;
