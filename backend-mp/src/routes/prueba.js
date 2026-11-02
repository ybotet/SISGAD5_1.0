const express = require("express");
const router = express.Router();
const PruebaController = require("../controllers/PruebaController");
const auth = require("../middleware/auth");
const { tienePermiso } = require("../middleware/permissions");

router.use(auth);
/**
 * @route   GET /api/tbPrueba
 * @desc    Obtener todos los tbPrueba
 * @access  Public
 */
router.get("/", PruebaController.getAll);

/**
 * @route   GET /api/tbPrueba/:id
 * @desc    Obtener un Prueba por ID
 * @access  Public
 */
router.get("/:id", PruebaController.getById);

/**
 * @route   POST /api/tbPrueba
 * @desc    Crear nuevo Prueba
 * @access  Public
 */
router.post(
  "/",
  tienePermiso("nomencladores.gestionar"),
  PruebaController.create,
);

/**
 * @route   PUT /api/tbPrueba/:id
 * @desc    Actualizar Prueba
 * @access  Public
 */
router.put(
  "/:id",
  tienePermiso("nomencladores.gestionar"),
  PruebaController.update,
);

/**
 * @route   DELETE /api/tbPrueba/:id
 * @desc    Eliminar Prueba
 * @access  Public
 */
router.delete(
  "/:id",
  tienePermiso("nomencladores.gestionar"),
  PruebaController.delete,
);

module.exports = router;
