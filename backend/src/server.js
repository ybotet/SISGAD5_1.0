const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const path = require('path');
const morgan = require('morgan');
require('dotenv').config();

const { testConnection } = require('./config/database');

const app = express();

// Middlewares de seguridad
app.use(helmet());
app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173',
    credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Test database connection
testConnection();

// Cargar todas las rutas automáticamente
const apiRoutes = require('./routes');
app.use('/api', apiRoutes);


// Ruta raíz
app.get('/', (req, res) => {
    res.json({
        message: '🚀 SISGAD5 Backend funcionando!',
        version: '1.0.0',
        timestamp: new Date().toISOString(),
        endpoints: {
            health: '/api/health',
            docs: 'Por implementar',
            api: '/api/*'
        }
    });
});

// Health check route
app.get('/health', (req, res) => {
    res.json({
        status: 'OK',
        message: 'API funcionando correctamente',
        timestamp: new Date().toISOString()
    });
});

// ✅ SOLUCIÓN DEFINITIVA: Manejo de errores 404 sin patrón comodín problemático
app.use((req, res, next) => {
    res.status(404).json({
        error: 'Ruta no encontrada',
        path: req.originalUrl,
        method: req.method,
        message: 'Verifica la URL e intenta nuevamente'
    });
});

// Manejo de errores global
app.use((error, req, res, next) => {
    console.error('Error:', error);
    res.status(500).json({
        error: 'Error interno del servidor',
        message: process.env.NODE_ENV === 'development' ? error.message : 'Contacte al administrador'
    });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`🚀 Backend ejecutándose en puerto ${PORT}`);
    console.log(`📊 Entorno: ${process.env.NODE_ENV}`);
    console.log(`🔗 Health check: http://localhost:${PORT}/health`);
    console.log(`🎯 Frontend: ${process.env.FRONTEND_URL}`);
    console.log(`✅ Sistema listo para recibir peticiones`);
});