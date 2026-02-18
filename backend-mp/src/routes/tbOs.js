const express = require('express');
const router = express.Router();
const TbOsController = require('../controllers/TbOsController');

/**
 * @route   GET /api/tbOs
 * @desc    Obtener todos los tbOs
 * @access  Public
 */
router.get('/', TbOsController.getAll);

/**
 * @route   GET /api/tbOs/:id
 * @desc    Obtener un TbOs por ID
 * @access  Public
 */
router.get('/:id', TbOsController.getById);

/**
 * @route   POST /api/tbOs
 * @desc    Crear nuevo TbOs
 * @access  Public
 */
router.post('/', TbOsController.create);

/**
 * @route   PUT /api/tbOs/:id
 * @desc    Actualizar TbOs
 * @access  Public
 */
router.put('/:id', TbOsController.update);

/**
 * @route   DELETE /api/tbOs/:id
 * @desc    Eliminar TbOs
 * @access  Public
 */
router.delete('/:id', TbOsController.delete);

module.exports = router;
