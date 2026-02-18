const express = require('express');
const router = express.Router();
const ClasifpizarraController = require('../controllers/ClasifpizarraController');

/**
 * @route   GET /api/tbClasifpizarra
 * @desc    Obtener todos los tbClasifpizarra
 * @access  Public
 */
router.get('/', ClasifpizarraController.getAll);

/**
 * @route   GET /api/tbClasifpizarra/:id
 * @desc    Obtener un Clasifpizarra por ID
 * @access  Public
 */
router.get('/:id', ClasifpizarraController.getById);

/**
 * @route   POST /api/tbClasifpizarra
 * @desc    Crear nuevo Clasifpizarra
 * @access  Public
 */
router.post('/', ClasifpizarraController.create);

/**
 * @route   PUT /api/tbClasifpizarra/:id
 * @desc    Actualizar Clasifpizarra
 * @access  Public
 */
router.put('/:id', ClasifpizarraController.update);

/**
 * @route   DELETE /api/tbClasifpizarra/:id
 * @desc    Eliminar Clasifpizarra
 * @access  Public
 */
router.delete('/:id', ClasifpizarraController.delete);

module.exports = router;
