const express = require('express');
const router = express.Router();
const LineaController = require('../controllers/LineaController');

/**
 * @route   GET /api/tbLinea
 * @desc    Obtener todos los tbLinea
 * @access  Public
 */
router.get('/', LineaController.getAll);

/**
 * @route   GET /api/tbLinea/:id
 * @desc    Obtener un Linea por ID
 * @access  Public
 */
router.get('/:id', LineaController.getById);

/**
 * @route   POST /api/tbLinea
 * @desc    Crear nuevo Linea
 * @access  Public
 */
router.post('/', LineaController.create);

/**
 * @route   PUT /api/tbLinea/:id
 * @desc    Actualizar Linea
 * @access  Public
 */
router.put('/:id', LineaController.update);

/**
 * @route   DELETE /api/tbLinea/:id
 * @desc    Eliminar Linea
 * @access  Public
 */
router.delete('/:id', LineaController.delete);

module.exports = router;
