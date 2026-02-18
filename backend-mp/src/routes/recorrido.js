const express = require('express');
const router = express.Router();
const RecorridoController = require('../controllers/RecorridoController');

/**
 * @route   GET /api/tbRecorrido
 * @desc    Obtener todos los tbRecorrido
 * @access  Public
 */
router.get('/', RecorridoController.getAll);

/**
 * @route   GET /api/tbRecorrido/:id
 * @desc    Obtener un Recorrido por ID
 * @access  Public
 */
router.get('/:id', RecorridoController.getById);

/**
 * @route   POST /api/tbRecorrido
 * @desc    Crear nuevo Recorrido
 * @access  Public
 */
router.post('/', RecorridoController.create);

/**
 * @route   PUT /api/tbRecorrido/:id
 * @desc    Actualizar Recorrido
 * @access  Public
 */
router.put('/:id', RecorridoController.update);

/**
 * @route   DELETE /api/tbRecorrido/:id
 * @desc    Eliminar Recorrido
 * @access  Public
 */
router.delete('/:id', RecorridoController.delete);

module.exports = router;
