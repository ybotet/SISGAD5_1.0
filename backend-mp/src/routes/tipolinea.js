const express = require("express");
const router = express.Router();
const TipolineaController = require("../controllers/TipolineaController");
const auth = require("../middleware/auth");
const { tienePermiso } = require("../middleware/permissions");

router.use(auth);
/**
 * @route   GET /api/tbTipolinea
 * @desc    Obtener todos los tbTipolinea
 * @access  Public
 */
router.get("/", TipolineaController.getAll);

/**
 * @route   GET /api/tbTipolinea/:id
 * @desc    Obtener un Tipolinea por ID
 * @access  Public
 */
router.get("/:id", TipolineaController.getById);

/**
 * @route   POST /api/tbTipolinea
 * @desc    Crear nuevo Tipolinea
 * @access  Public
 */
router.post(
  "/",
  tienePermiso("nomencladores.gestionar"),
  TipolineaController.create,
);

/**
 * @route   PUT /api/tbTipolinea/:id
 * @desc    Actualizar Tipolinea
 * @access  Public
 */
router.put(
  "/:id",
  tienePermiso("nomencladores.gestionar"),
  TipolineaController.update,
);

/**
 * @route   DELETE /api/tbTipolinea/:id
 * @desc    Eliminar Tipolinea
 * @access  Public
 */
router.delete(
  "/:id",
  tienePermiso("nomencladores.gestionar"),
  TipolineaController.delete,
);

module.exports = router;
