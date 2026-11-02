const express = require("express");
const router = express.Router();
const ResultadopruebaController = require("../controllers/ResultadopruebaController");
const auth = require("../middleware/auth");
const { tienePermiso } = require("../middleware/permissions");

router.use(auth);
/**
 * @route   GET /api/tbResultadoprueba
 * @desc    Obtener todos los tbResultadoprueba
 * @access  Public
 */
router.get("/", ResultadopruebaController.getAll);

/**
 * @route   GET /api/tbResultadoprueba/:id
 * @desc    Obtener un Resultadoprueba por ID
 * @access  Public
 */
router.get("/:id", ResultadopruebaController.getById);

/**
 * @route   POST /api/tbResultadoprueba
 * @desc    Crear nuevo Resultadoprueba
 * @access  Public
 */
router.post(
  "/",
  tienePermiso("nomencladores.gestionar"),
  ResultadopruebaController.create,
);

/**
 * @route   PUT /api/tbResultadoprueba/:id
 * @desc    Actualizar Resultadoprueba
 * @access  Public
 */
router.put(
  "/:id",
  tienePermiso("nomencladores.gestionar"),
  ResultadopruebaController.update,
);

/**
 * @route   DELETE /api/tbResultadoprueba/:id
 * @desc    Eliminar Resultadoprueba
 * @access  Public
 */
router.delete(
  "/:id",
  tienePermiso("nomencladores.gestionar"),
  ResultadopruebaController.delete,
);

module.exports = router;
