const express = require('express');
const router = express.Router();
const GrupowController = require('../controllers/GrupowController');

/**
 * @route   GET /api/grupow
 * @desc    Obtener todos los grupow
 * @access  Public
 */
router.get('/', GrupowController.getAll);

/**
 * @route   GET /api/grupow/:id
 * @desc    Obtener un Grupow por ID
 * @access  Public
 */
router.get('/:id', GrupowController.getById);

/**
 * @route   POST /api/grupow
 * @desc    Crear nuevo Grupow
 * @access  Public
 */
router.post('/', GrupowController.create);

/**
 * @route   PUT /api/grupow/:id
 * @desc    Actualizar Grupow
 * @access  Public
 */
router.put('/:id', GrupowController.update);

/**
 * @route   DELETE /api/grupow/:id
 * @desc    Eliminar Grupow
 * @access  Public
 */
router.delete('/:id', GrupowController.delete);

module.exports = router;
