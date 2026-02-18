const express = require('express');
const router = express.Router();
const TbMaterialController = require('../controllers/TbMaterialController');

/**
 * @route   GET /api/tbMaterial
 * @desc    Obtener todos los tbMaterial
 * @access  Public
 */
router.get('/', TbMaterialController.getAll);

/**
 * @route   GET /api/tbMaterial/:id
 * @desc    Obtener un TbMaterial por ID
 * @access  Public
 */
router.get('/:id', TbMaterialController.getById);

/**
 * @route   POST /api/tbMaterial
 * @desc    Crear nuevo TbMaterial
 * @access  Public
 */
router.post('/', TbMaterialController.create);

/**
 * @route   PUT /api/tbMaterial/:id
 * @desc    Actualizar TbMaterial
 * @access  Public
 */
router.put('/:id', TbMaterialController.update);

/**
 * @route   DELETE /api/tbMaterial/:id
 * @desc    Eliminar TbMaterial
 * @access  Public
 */
router.delete('/:id', TbMaterialController.delete);

module.exports = router;
