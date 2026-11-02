const express = require("express");
const router = express.Router();
const MandoController = require("../controllers/MandoController");
const auth = require("../middleware/auth");
const { tienePermiso } = require("../middleware/permissions");

router.use(auth);

/**
 * @route   GET /api/tbMando
 * @desc    Obtener todos los tbMando
 * @access  Public
 */
router.get("/", MandoController.getAll);

/**
 * @route   GET /api/tbMando/:id
 * @desc    Obtener un Mando por ID
 * @access  Public
 */
router.get("/:id", MandoController.getById);

/**
 * @route   POST /api/tbMando
 * @desc    Crear nuevo Mando
 * @access  Public
 */
router.post(
  "/",
  tienePermiso("nomencladores.gestionar"),
  MandoController.create,
);

/**
 * @route   PUT /api/tbMando/:id
 * @desc    Actualizar Mando
 * @access  Public
 */
router.put(
  "/:id",
  tienePermiso("nomencladores.gestionar"),
  MandoController.update,
);

/**
 * @route   DELETE /api/tbMando/:id
 * @desc    Eliminar Mando
 * @access  Public
 */
router.delete(
  "/:id",
  tienePermiso("nomencladores.gestionar"),
  MandoController.delete,
);

module.exports = router;
