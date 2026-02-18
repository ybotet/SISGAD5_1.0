const express = require('express');
const router = express.Router();

// Importar y usar todas las rutas automáticamente
router.use('/auth', require('./auth'));
router.use('/user', require('./user'));
router.use('/roles', require('./roles'));

// Ruta de fallback para APIs no encontradas
router.use((req, res) => {
  res.status(404).json({
    success: false,
    error: 'Endpoint de API no encontrado',
    path: req.originalUrl
  });
});

module.exports = router;