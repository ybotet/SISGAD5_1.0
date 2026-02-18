const express = require('express');
const router = express.Router();
const SistemaController = require('../controllers/SistemaController');

/**
 * @route   GET /api/sistema
 * @desc    Obtener todos los sistema
 * @access  Public
 */
router.get('/', SistemaController.getAll);

/**
 * @route   GET /api/sistema/:id
 * @desc    Obtener un Sistema por ID
 * @access  Public
 */
router.get('/:id', SistemaController.getById);

/**
 * @route   POST /api/sistema
 * @desc    Crear nuevo Sistema
 * @access  Public
 */
router.post('/', SistemaController.create);

/**
 * @route   PUT /api/sistema/:id
 * @desc    Actualizar Sistema
 * @access  Public
 */
router.put('/:id', SistemaController.update);

/**
 * @route   DELETE /api/sistema/:id
 * @desc    Eliminar Sistema
 * @access  Public
 */
router.delete('/:id', SistemaController.delete);

module.exports = router;