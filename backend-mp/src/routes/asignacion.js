const express = require("express");
const router = express.Router();
const AsignacionController = require("../controllers/AsignacionController");
const auth = require("../middleware/auth");
const { tienePermiso } = require("../middleware/permissions");

router.use(auth);
/**
 * @route   POST /api/asignacion
 * @desc    Crear nueva asignacion
 * @access  Public
 */
router.post("/", AsignacionController.create);

/**
 * @route   GET /api/asignacion
 * @desc    Obtener todas las asignaciones
 * @access  Public
 */
router.get("/", AsignacionController.getAll);

/**
 * @route   GET /api/asignacion/:id
 * @desc    Obtener una asignacion por ID
 * @access  Public
 */
router.get("/:id", AsignacionController.getById);

module.exports = router;
