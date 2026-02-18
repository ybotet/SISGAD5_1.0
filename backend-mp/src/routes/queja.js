const express = require('express');
const router = express.Router();
const QuejaController = require('../controllers/QuejaController');

/**
 * @route   GET /api/tbQueja
 * @desc    Obtener todos los tbQueja
 * @access  Public
 */
router.get('/', QuejaController.getAll);

/**
 * @route   GET /api/tbQueja/:id
 * @desc    Obtener un Queja por ID
 * @access  Public
 */
router.get('/:id', QuejaController.getById);

/**
 * @route   POST /api/tbQueja
 * @desc    Crear nuevo Queja
 * @access  Public
 */
router.post('/', QuejaController.create);

/**
 * @route   PUT /api/tbQueja/:id
 * @desc    Actualizar Queja
 * @access  Public
 */
router.put('/:id', QuejaController.update);

/**
 * @route   DELETE /api/tbQueja/:id
 * @desc    Eliminar Queja
 * @access  Public
 */
router.delete('/:id', QuejaController.delete);

module.exports = router;
