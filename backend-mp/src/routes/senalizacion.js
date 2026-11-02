const express = require("express");
const router = express.Router();
const SenalizacionController = require("../controllers/SenalizacionController");
const auth = require("../middleware/auth");
const { tienePermiso } = require("../middleware/permissions");

router.use(auth);
/**
 * @route   GET /api/tbSenalizacion
 * @desc    Obtener todos los tbSenalizacion
 * @access  Public
 */
router.get("/", SenalizacionController.getAll);

/**
 * @route   GET /api/tbSenalizacion/:id
 * @desc    Obtener un Senalizacion por ID
 * @access  Public
 */
router.get("/:id", SenalizacionController.getById);

/**
 * @route   POST /api/tbSenalizacion
 * @desc    Crear nuevo Senalizacion
 * @access  Public
 */
router.post(
  "/",
  tienePermiso("nomencladores.gestionar"),
  SenalizacionController.create,
);

/**
 * @route   PUT /api/tbSenalizacion/:id
 * @desc    Actualizar Senalizacion
 * @access  Public
 */
router.put(
  "/:id",
  tienePermiso("nomencladores.gestionar"),
  SenalizacionController.update,
);

/**
 * @route   DELETE /api/tbSenalizacion/:id
 * @desc    Eliminar Senalizacion
 * @access  Public
 */
router.delete(
  "/:id",
  tienePermiso("nomencladores.gestionar"),
  SenalizacionController.delete,
);

module.exports = router;
