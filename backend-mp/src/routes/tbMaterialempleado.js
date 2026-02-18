const express = require('express');
const router = express.Router();
const TbMaterialempleadoController = require('../controllers/TbMaterialempleadoController');

/**
 * @route   GET /api/tbMaterialempleado
 * @desc    Obtener todos los tbMaterialempleado
 * @access  Public
 */
router.get('/', TbMaterialempleadoController.getAll);

/**
 * @route   GET /api/tbMaterialempleado/:id
 * @desc    Obtener un TbMaterialempleado por ID
 * @access  Public
 */
router.get('/:id', TbMaterialempleadoController.getById);

/**
 * @route   POST /api/tbMaterialempleado
 * @desc    Crear nuevo TbMaterialempleado
 * @access  Public
 */
router.post('/', TbMaterialempleadoController.create);

/**
 * @route   PUT /api/tbMaterialempleado/:id
 * @desc    Actualizar TbMaterialempleado
 * @access  Public
 */
router.put('/:id', TbMaterialempleadoController.update);

/**
 * @route   DELETE /api/tbMaterialempleado/:id
 * @desc    Eliminar TbMaterialempleado
 * @access  Public
 */
router.delete('/:id', TbMaterialempleadoController.delete);

module.exports = router;
