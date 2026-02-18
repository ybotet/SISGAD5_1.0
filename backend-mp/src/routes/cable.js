const express = require('express');
const router = express.Router();
const CableController = require('../controllers/CableController');

/**
 * @route   GET /api/tbCable
 * @desc    Obtener todos los tbCable
 * @access  Public
 */
router.get('/', CableController.getAll);

/**
 * @route   GET /api/tbCable/:id
 * @desc    Obtener un Cable por ID
 * @access  Public
 */
router.get('/:id', CableController.getById);

/**
 * @route   POST /api/tbCable
 * @desc    Crear nuevo Cable
 * @access  Public
 */
router.post('/', CableController.create);

/**
 * @route   PUT /api/tbCable/:id
 * @desc    Actualizar Cable
 * @access  Public
 */
router.put('/:id', CableController.update);

/**
 * @route   DELETE /api/tbCable/:id
 * @desc    Eliminar Cable
 * @access  Public
 */
router.delete('/:id', CableController.delete);

module.exports = router;
