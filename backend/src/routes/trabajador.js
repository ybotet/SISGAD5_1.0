const express = require('express');
const router = express.Router();
const TrabajadorController = require('../controllers/TrabajadorController');
const Trabajador = require('../models/Trabajador');

/**
 * @route   GET /api/tbTrabajador
 * @desc    Obtener todos los tbTrabajador
 * @access  Public
 */
router.get('/', TrabajadorController.getAll);
router.get('/getProbadores', TrabajadorController.getProbadores);

/**
 * @route   GET /api/tbTrabajador/:id
 * @desc    Obtener un Trabajador por ID
 * @access  Public
 */
router.get('/:id', TrabajadorController.getById);

/**
 * @route   POST /api/tbTrabajador
 * @desc    Crear nuevo Trabajador
 * @access  Public
 */
router.post('/', TrabajadorController.create);

/**
 * @route   PUT /api/tbTrabajador/:id
 * @desc    Actualizar Trabajador
 * @access  Public
 */
router.put('/:id', TrabajadorController.update);

/**
 * @route   DELETE /api/tbTrabajador/:id
 * @desc    Eliminar Trabajador
 * @access  Public
 */
router.delete('/:id', TrabajadorController.delete);



module.exports = router;
