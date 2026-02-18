const express = require('express');
const router = express.Router();
const ClasificadorclaveController = require('../controllers/ClasificadorclaveController');

/**
 * @route   GET /api/tbClasificadorclave
 * @desc    Obtener todos los tbClasificadorclave
 * @access  Public
 */
router.get('/', ClasificadorclaveController.getAll);

/**
 * @route   GET /api/tbClasificadorclave/:id
 * @desc    Obtener un Clasificadorclave por ID
 * @access  Public
 */
router.get('/:id', ClasificadorclaveController.getById);

/**
 * @route   POST /api/tbClasificadorclave
 * @desc    Crear nuevo Clasificadorclave
 * @access  Public
 */
router.post('/', ClasificadorclaveController.create);

/**
 * @route   PUT /api/tbClasificadorclave/:id
 * @desc    Actualizar Clasificadorclave
 * @access  Public
 */
router.put('/:id', ClasificadorclaveController.update);

/**
 * @route   DELETE /api/tbClasificadorclave/:id
 * @desc    Eliminar Clasificadorclave
 * @access  Public
 */
router.delete('/:id', ClasificadorclaveController.delete);

module.exports = router;
