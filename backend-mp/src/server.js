const express = require("express");
// const cors = require("cors"); // ❌ ELIMINAR CORS
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const { testConnection } = require("./config/database");

const app = express();

// ❌ NO USAR CORS AQUÍ - El API Gateway maneja CORS
app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(morgan("combined"));

// Test database connection
testConnection();

// Cargar todas las rutas automáticamente
const apiRoutes = require("./routes");
app.use("/api", apiRoutes);

// Ruta raíz
app.get("/", (req, res) => {
  res.json({
    message: "🚀 SISGAD5 Backend-MP funcionando!",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

// Health check route
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "API de backend-mp funcionando correctamente",
    timestamp: new Date().toISOString(),
  });
});

// Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({
    error: "Ruta no encontrada",
    path: req.originalUrl,
    method: req.method,
  });
});

// Manejo de errores global
app.use((error, req, res, next) => {
  console.error("Error:", error);
  res.status(500).json({
    error: "Error interno del servidor",
    message:
      process.env.NODE_ENV === "development"
        ? error.message
        : "Contacte al administrador",
  });
});

const PORT = process.env.PORT || 5002; // Cambiar a 5002 para evitar conflicto

app.listen(PORT, () => {
  console.log(`🚀 Backend MP ejecutándose en puerto ${PORT}`);
  console.log(`📊 Entorno: ${process.env.NODE_ENV || "development"}`);
});
