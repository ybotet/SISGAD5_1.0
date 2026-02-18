const express = require('express');
const router = express.Router();
const TelefonoController = require('../controllers/TelefonoController');

/**
 * @route   GET /api/tbTelefono
 * @desc    Obtener todos los tbTelefono
 * @access  Public
 */
router.get('/', TelefonoController.getAll);

/**
 * @route   GET /api/tbTelefono/:id
 * @desc    Obtener un Telefono por ID
 * @access  Public
 */
router.get('/:id', TelefonoController.getById);

/**
 * @route   POST /api/tbTelefono
 * @desc    Crear nuevo Telefono
 * @access  Public
 */
router.post('/', TelefonoController.create);

/**
 * @route   PUT /api/tbTelefono/:id
 * @desc    Actualizar Telefono
 * @access  Public
 */
router.put('/:id', TelefonoController.update);

/**
 * @route   DELETE /api/tbTelefono/:id
 * @desc    Eliminar Telefono
 * @access  Public
 */
router.delete('/:id', TelefonoController.delete);

module.exports = router;
