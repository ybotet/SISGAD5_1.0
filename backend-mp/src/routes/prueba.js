const express = require('express');
const router = express.Router();
const PruebaController = require('../controllers/PruebaController');

/**
 * @route   GET /api/tbPrueba
 * @desc    Obtener todos los tbPrueba
 * @access  Public
 */
router.get('/', PruebaController.getAll);

/**
 * @route   GET /api/tbPrueba/:id
 * @desc    Obtener un Prueba por ID
 * @access  Public
 */
router.get('/:id', PruebaController.getById);

/**
 * @route   POST /api/tbPrueba
 * @desc    Crear nuevo Prueba
 * @access  Public
 */
router.post('/', PruebaController.create);

/**
 * @route   PUT /api/tbPrueba/:id
 * @desc    Actualizar Prueba
 * @access  Public
 */
router.put('/:id', PruebaController.update);

/**
 * @route   DELETE /api/tbPrueba/:id
 * @desc    Eliminar Prueba
 * @access  Public
 */
router.delete('/:id', PruebaController.delete);

module.exports = router;
