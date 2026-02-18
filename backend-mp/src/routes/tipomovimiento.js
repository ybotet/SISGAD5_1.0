const express = require('express');
const router = express.Router();
const TipomovimientoController = require('../controllers/TipomovimientoController');

/**
 * @route   GET /api/tbTipomovimiento
 * @desc    Obtener todos los tbTipomovimiento
 * @access  Public
 */
router.get('/', TipomovimientoController.getAll);

/**
 * @route   GET /api/tbTipomovimiento/:id
 * @desc    Obtener un Tipomovimiento por ID
 * @access  Public
 */
router.get('/:id', TipomovimientoController.getById);

/**
 * @route   POST /api/tbTipomovimiento
 * @desc    Crear nuevo Tipomovimiento
 * @access  Public
 */
router.post('/', TipomovimientoController.create);

/**
 * @route   PUT /api/tbTipomovimiento/:id
 * @desc    Actualizar Tipomovimiento
 * @access  Public
 */
router.put('/:id', TipomovimientoController.update);

/**
 * @route   DELETE /api/tbTipomovimiento/:id
 * @desc    Eliminar Tipomovimiento
 * @access  Public
 */
router.delete('/:id', TipomovimientoController.delete);

module.exports = router;
