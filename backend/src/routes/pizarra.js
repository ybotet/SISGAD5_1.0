const express = require('express');
const router = express.Router();
const PizarraController = require('../controllers/PizarraController');

/**
 * @route   GET /api/tbPizarra
 * @desc    Obtener todos los tbPizarra
 * @access  Public
 */
router.get('/', PizarraController.getAll);

/**
 * @route   GET /api/tbPizarra/:id
 * @desc    Obtener un Pizarra por ID
 * @access  Public
 */
router.get('/:id', PizarraController.getById);

/**
 * @route   POST /api/tbPizarra
 * @desc    Crear nuevo Pizarra
 * @access  Public
 */
router.post('/', PizarraController.create);

/**
 * @route   PUT /api/tbPizarra/:id
 * @desc    Actualizar Pizarra
 * @access  Public
 */
router.put('/:id', PizarraController.update);

/**
 * @route   DELETE /api/tbPizarra/:id
 * @desc    Eliminar Pizarra
 * @access  Public
 */
router.delete('/:id', PizarraController.delete);

module.exports = router;
