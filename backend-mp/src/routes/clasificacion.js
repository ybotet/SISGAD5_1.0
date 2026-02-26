const express = require("express");
const router = express.Router();
const ClasificacionController = require("../controllers/ClasificacionController");
const auth = require("../middleware/auth");
const { tienePermiso } = require("../middleware/permissions");

router.use(auth);
/**
 * @route   GET /api/tbClasificacion
 * @desc    Obtener todos los tbClasificacion
 * @access  Public
 */
router.get("/", ClasificacionController.getAll);

/**
 * @route   GET /api/tbClasificacion/:id
 * @desc    Obtener un Clasificacion por ID
 * @access  Public
 */
router.get("/:id", ClasificacionController.getById);

/**
 * @route   POST /api/tbClasificacion
 * @desc    Crear nuevo Clasificacion
 * @access  Public
 */
router.post(
  "/",
  tienePermiso("nomencladores.gestionar"),
  ClasificacionController.create,
);

/**
 * @route   PUT /api/tbClasificacion/:id
 * @desc    Actualizar Clasificacion
 * @access  Public
 */
router.put(
  "/:id",
  tienePermiso("nomencladores.gestionar"),
  ClasificacionController.update,
);

/**
 * @route   DELETE /api/tbClasificacion/:id
 * @desc    Eliminar Clasificacion
 * @access  Public
 */
router.delete(
  "/:id",
  tienePermiso("nomencladores.gestionar"),
  ClasificacionController.delete,
);

module.exports = router;
