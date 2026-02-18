const express = require('express');
const router = express.Router();
const MovimientoController = require('../controllers/MovimientoController');

/**
 * @route   GET /api/tbMovimiento
 * @desc    Obtener todos los tbMovimiento
 * @access  Public
 */
router.get('/', MovimientoController.getAll);

/**
 * @route   GET /api/tbMovimiento/:id
 * @desc    Obtener un Movimiento por ID
 * @access  Public
 */
router.get('/:id', MovimientoController.getById);
router.get('/telefono/:telefono', MovimientoController.getMovimientoByTelefono);
router.get('/linea/:linea', MovimientoController.getMovimientoByLinea);

/**
 * @route   POST /api/tbMovimiento
 * @desc    Crear nuevo Movimiento
 * @access  Public
 */
router.post('/', MovimientoController.create);

/**
 * @route   PUT /api/tbMovimiento/:id
 * @desc    Actualizar Movimiento
 * @access  Public
 */
router.put('/:id', MovimientoController.update);

/**
 * @route   DELETE /api/tbMovimiento/:id
 * @desc    Eliminar Movimiento
 * @access  Public
 */
router.delete('/:id', MovimientoController.delete);

module.exports = router;
