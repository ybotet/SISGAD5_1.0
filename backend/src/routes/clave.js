const express = require('express');
const router = express.Router();
const ClaveController = require('../controllers/ClaveController');

/**
 * @route   GET /api/tbClave
 * @desc    Obtener todos los tbClave
 * @access  Public
 */
router.get('/', ClaveController.getAll);

/**
 * @route   GET /api/tbClave/:id
 * @desc    Obtener un Clave por ID
 * @access  Public
 */
router.get('/:id', ClaveController.getById);

/**
 * @route   POST /api/tbClave
 * @desc    Crear nuevo Clave
 * @access  Public
 */
router.post('/', ClaveController.create);

/**
 * @route   PUT /api/tbClave/:id
 * @desc    Actualizar Clave
 * @access  Public
 */
router.put('/:id', ClaveController.update);

/**
 * @route   DELETE /api/tbClave/:id
 * @desc    Eliminar Clave
 * @access  Public
 */
router.delete('/:id', ClaveController.delete);

module.exports = router;
