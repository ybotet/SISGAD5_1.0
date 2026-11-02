const express = require("express");
const router = express.Router();
const TipoquejaController = require("../controllers/TipoquejaController");
const auth = require("../middleware/auth");
const { tienePermiso } = require("../middleware/permissions");

router.use(auth);
/**
 * @route   GET /api/tbTipoqueja
 * @desc    Obtener todos los tbTipoqueja
 * @access  Public
 */
router.get("/", TipoquejaController.getAll);

/**
 * @route   GET /api/tbTipoqueja/:id
 * @desc    Obtener un Tipoqueja por ID
 * @access  Public
 */
router.get("/:id", TipoquejaController.getById);

/**
 * @route   POST /api/tbTipoqueja
 * @desc    Crear nuevo Tipoqueja
 * @access  Public
 */
router.post(
  "/",
  tienePermiso("nomencladores.gestionar"),
  TipoquejaController.create,
);

/**
 * @route   PUT /api/tbTipoqueja/:id
 * @desc    Actualizar Tipoqueja
 * @access  Public
 */
router.put(
  "/:id",
  tienePermiso("nomencladores.gestionar"),
  TipoquejaController.update,
);

/**
 * @route   DELETE /api/tbTipoqueja/:id
 * @desc    Eliminar Tipoqueja
 * @access  Public
 */
router.delete(
  "/:id",
  tienePermiso("nomencladores.gestionar"),
  TipoquejaController.delete,
);

module.exports = router;
