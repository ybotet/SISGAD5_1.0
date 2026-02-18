const express = require('express');
const router = express.Router();
const PropietarioController = require('../controllers/PropietarioController');

/**
 * @route   GET /api/tbPropietario
 * @desc    Obtener todos los tbPropietario
 * @access  Public
 */
router.get('/', PropietarioController.getAll);

/**
 * @route   GET /api/tbPropietario/:id
 * @desc    Obtener un Propietario por ID
 * @access  Public
 */
router.get('/:id', PropietarioController.getById);

/**
 * @route   POST /api/tbPropietario
 * @desc    Crear nuevo Propietario
 * @access  Public
 */
router.post('/', PropietarioController.create);

/**
 * @route   PUT /api/tbPropietario/:id
 * @desc    Actualizar Propietario
 * @access  Public
 */
router.put('/:id', PropietarioController.update);

/**
 * @route   DELETE /api/tbPropietario/:id
 * @desc    Eliminar Propietario
 * @access  Public
 */
router.delete('/:id', PropietarioController.delete);

module.exports = router;
