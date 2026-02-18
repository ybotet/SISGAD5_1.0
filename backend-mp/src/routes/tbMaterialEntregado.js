const express = require('express');
const router = express.Router();
const TbMaterialEntregadoController = require('../controllers/TbMaterialEntregadoController');

/**
 * @route   GET /api/tbMaterialEntregado
 * @desc    Obtener todos los tbMaterialEntregado
 * @access  Public
 */
router.get('/', TbMaterialEntregadoController.getAll);

/**
 * @route   GET /api/tbMaterialEntregado/:id
 * @desc    Obtener un TbMaterialEntregado por ID
 * @access  Public
 */
router.get('/:id', TbMaterialEntregadoController.getById);

/**
 * @route   POST /api/tbMaterialEntregado
 * @desc    Crear nuevo TbMaterialEntregado
 * @access  Public
 */
router.post('/', TbMaterialEntregadoController.create);

/**
 * @route   PUT /api/tbMaterialEntregado/:id
 * @desc    Actualizar TbMaterialEntregado
 * @access  Public
 */
router.put('/:id', TbMaterialEntregadoController.update);

/**
 * @route   DELETE /api/tbMaterialEntregado/:id
 * @desc    Eliminar TbMaterialEntregado
 * @access  Public
 */
router.delete('/:id', TbMaterialEntregadoController.delete);

module.exports = router;
