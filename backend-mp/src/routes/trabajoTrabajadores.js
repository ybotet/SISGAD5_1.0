const express = require('express');
const router = express.Router();
const TrabajoTrabajadoresController = require('../controllers/TrabajoTrabajadoresController');

/**
 * @route   GET /api/tbTrabajoTrabajadores
 * @desc    Obtener todos los tbTrabajoTrabajadores
 * @access  Public
 */
router.get('/', TrabajoTrabajadoresController.getAll);

/**
 * @route   GET /api/tbTrabajoTrabajadores/:id
 * @desc    Obtener un TrabajoTrabajadores por ID
 * @access  Public
 */
router.get('/:id', TrabajoTrabajadoresController.getById);

/**
 * @route   POST /api/tbTrabajoTrabajadores
 * @desc    Crear nuevo TrabajoTrabajadores
 * @access  Public
 */
router.post('/', TrabajoTrabajadoresController.create);

/**
 * @route   PUT /api/tbTrabajoTrabajadores/:id
 * @desc    Actualizar TrabajoTrabajadores
 * @access  Public
 */
router.put('/:id', TrabajoTrabajadoresController.update);

/**
 * @route   DELETE /api/tbTrabajoTrabajadores/:id
 * @desc    Eliminar TrabajoTrabajadores
 * @access  Public
 */
router.delete('/:id', TrabajoTrabajadoresController.delete);

module.exports = router;
