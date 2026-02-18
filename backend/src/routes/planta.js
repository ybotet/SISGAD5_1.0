const express = require('express');
const router = express.Router();
const PlantaController = require('../controllers/PlantaController');

/**
 * @route   GET /api/tbPlanta
 * @desc    Obtener todos los tbPlanta
 * @access  Public
 */
router.get('/', PlantaController.getAll);

/**
 * @route   GET /api/tbPlanta/:id
 * @desc    Obtener un Planta por ID
 * @access  Public
 */
router.get('/:id', PlantaController.getById);

/**
 * @route   POST /api/tbPlanta
 * @desc    Crear nuevo Planta
 * @access  Public
 */
router.post('/', PlantaController.create);

/**
 * @route   PUT /api/tbPlanta/:id
 * @desc    Actualizar Planta
 * @access  Public
 */
router.put('/:id', PlantaController.update);

/**
 * @route   DELETE /api/tbPlanta/:id
 * @desc    Eliminar Planta
 * @access  Public
 */
router.delete('/:id', PlantaController.delete);

module.exports = router;
