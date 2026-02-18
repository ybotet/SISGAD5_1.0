const express = require('express');
const router = express.Router();
const ClasificacionController = require('../controllers/ClasificacionController');

/**
 * @route   GET /api/tbClasificacion
 * @desc    Obtener todos los tbClasificacion
 * @access  Public
 */
router.get('/', ClasificacionController.getAll);

/**
 * @route   GET /api/tbClasificacion/:id
 * @desc    Obtener un Clasificacion por ID
 * @access  Public
 */
router.get('/:id', ClasificacionController.getById);

/**
 * @route   POST /api/tbClasificacion
 * @desc    Crear nuevo Clasificacion
 * @access  Public
 */
router.post('/', ClasificacionController.create);

/**
 * @route   PUT /api/tbClasificacion/:id
 * @desc    Actualizar Clasificacion
 * @access  Public
 */
router.put('/:id', ClasificacionController.update);

/**
 * @route   DELETE /api/tbClasificacion/:id
 * @desc    Eliminar Clasificacion
 * @access  Public
 */
router.delete('/:id', ClasificacionController.delete);

module.exports = router;
