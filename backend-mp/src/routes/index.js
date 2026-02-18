const express = require('express');
const router = express.Router();


// Importar y usar todas las rutas automáticamente
router.use('/auth', require('./auth'));
router.use('/cable', require('./cable'));
router.use('/clasificacion', require('./clasificacion'));
router.use('/clasificadorclave', require('./clasificadorclave'));
router.use('/clasifpizarra', require('./clasifpizarra'));
router.use('/clave', require('./clave'));
router.use('/grupow', require('./grupow'));
router.use('/linea', require('./linea'));
router.use('/mando', require('./mando'));
router.use('/movimiento', require('./movimiento'));
router.use('/pizarra', require('./pizarra'));
router.use('/planta', require('./planta'));
router.use('/propietario', require('./propietario'));
router.use('/prueba', require('./prueba'));
router.use('/roles', require('./roles'));
router.use('/queja', require('./queja'));
router.use('/tipolinea', require('./tipolinea'));
router.use('/recorrido', require('./recorrido'));
router.use('/resultadoprueba', require('./resultadoprueba'));
router.use('/senalizacion', require('./senalizacion'));
router.use('/sistema', require('./sistema'));
router.use('/telefono', require('./telefono'));
router.use('/tipomovimiento', require('./tipomovimiento'));
router.use('/tipopizarra', require('./tipopizarra'));
router.use('/tipoqueja', require('./tipoqueja'));
router.use('/trabajador', require('./trabajador'));
router.use('/trabajo', require('./trabajo'));
router.use('/trabajotrabajadores', require('./trabajoTrabajadores'));
router.use('/user', require('./user'));


router.use('/tbMaterial', require('./tbMaterial'));
router.use('/tbMaterialempleado', require('./tbMaterialempleado'));
router.use('/tbMaterialEntregado', require('./tbMaterialEntregado'));
router.use('/tbOs', require('./tbOs'));


// Ruta de fallback para APIs no encontradas
router.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint de API no encontrado',
    path: req.originalUrl
  });
});

module.exports = router;
