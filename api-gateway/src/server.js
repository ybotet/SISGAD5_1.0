const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
require("dotenv").config();

const app = express();

// Middlewares de seguridad
app.use(helmet());
app.use(
  cors({
    origin: process.env.FRONTEND_URL || "http://localhost:5173",
    credentials: true,
  }),
);
app.use(morgan("combined"));

// Proxy para microservicio de usuarios
app.use(
  "/api/auth",
  createProxyMiddleware({
    target: process.env.USERS_SERVICE_URL || "http://localhost:5001",
    changeOrigin: true,
    pathRewrite: {
      "^/api/auth": "/api/auth",
    },
  }),
);

app.use(
  "/api/user",
  createProxyMiddleware({
    target: process.env.USERS_SERVICE_URL || "http://localhost:5001",
    changeOrigin: true,
    pathRewrite: {
      "^/api/user": "/api/user",
    },
  }),
);

app.use(
  "/api/roles",
  createProxyMiddleware({
    target: process.env.USERS_SERVICE_URL || "http://localhost:5001",
    changeOrigin: true,
    pathRewrite: {
      "^/api/roles": "/api/roles",
    },
  }),
);

// Proxy para microservicio de servicios (todas las demás rutas /api/*)
app.use(
  "/api",
  createProxyMiddleware({
    target: process.env.MP_SERVICE_URL || "http://localhost:5002",
    changeOrigin: true,
  }),
);

// Ruta raíz
app.get("/", (req, res) => {
  res.json({
    message: "🚀 API Gateway SISGAD5 funcionando!",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
    services: {
      users: process.env.USERS_SERVICE_URL || "http://localhost:5001",
      mp: process.env.MP_SERVICE_URL || "http://localhost:5002",
    },
  });
});

// Health check route
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "API Gateway funcionando correctamente",
    timestamp: new Date().toISOString(),
  });
});

// Manejo de errores
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

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 API Gateway ejecutándose en puerto ${PORT}`);
  console.log(`📊 Entorno: ${process.env.NODE_ENV}`);
  console.log(`🔗 Health check: http://localhost:${PORT}/health`);
  console.log(
    `👥 Servicio Usuarios: ${process.env.USERS_SERVICE_URL || "http://localhost:5001"}`,
  );
  console.log(
    `🛠️ Servicio Servicios: ${process.env.MP_SERVICE_URL || "http://localhost:5002"}`,
  );
  console.log(`✅ Gateway listo para recibir peticiones`);
});
