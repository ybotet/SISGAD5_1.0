const express = require('express');
const router = express.Router();
const TipopizarraController = require('../controllers/TipopizarraController');

/**
 * @route   GET /api/tbTipopizarra
 * @desc    Obtener todos los tbTipopizarra
 * @access  Public
 */
router.get('/', TipopizarraController.getAll);

/**
 * @route   GET /api/tbTipopizarra/:id
 * @desc    Obtener un Tipopizarra por ID
 * @access  Public
 */
router.get('/:id', TipopizarraController.getById);

/**
 * @route   POST /api/tbTipopizarra
 * @desc    Crear nuevo Tipopizarra
 * @access  Public
 */
router.post('/', TipopizarraController.create);

/**
 * @route   PUT /api/tbTipopizarra/:id
 * @desc    Actualizar Tipopizarra
 * @access  Public
 */
router.put('/:id', TipopizarraController.update);

/**
 * @route   DELETE /api/tbTipopizarra/:id
 * @desc    Eliminar Tipopizarra
 * @access  Public
 */
router.delete('/:id', TipopizarraController.delete);

module.exports = router;
