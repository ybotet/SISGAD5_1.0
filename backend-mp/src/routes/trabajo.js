const express = require('express');
const router = express.Router();
const TrabajoController = require('../controllers/TrabajoController');

/**
 * @route   GET /api/tbTrabajo
 * @desc    Obtener todos los tbTrabajo
 * @access  Public
 */
router.get('/', TrabajoController.getAll);

/**
 * @route   GET /api/tbTrabajo/:id
 * @desc    Obtener un Trabajo por ID
 * @access  Public
 */
router.get('/:id', TrabajoController.getById);

/**
 * @route   POST /api/tbTrabajo
 * @desc    Crear nuevo Trabajo
 * @access  Public
 */
router.post('/', TrabajoController.create);

/**
 * @route   PUT /api/tbTrabajo/:id
 * @desc    Actualizar Trabajo
 * @access  Public
 */
router.put('/:id', TrabajoController.update);

/**
 * @route   DELETE /api/tbTrabajo/:id
 * @desc    Eliminar Trabajo
 * @access  Public
 */
router.delete('/:id', TrabajoController.delete);

module.exports = router;
