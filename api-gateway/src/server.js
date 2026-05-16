const express = require("express");
const { createProxyMiddleware } = require("http-proxy-middleware");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const requestLogger = require("./middleware/requestLogger");
const logger = require("./config/logger");
const path = require("path");
const dotenv = require("dotenv");
const { globalLimiter, authLimiter } = require("./middleware/rateLimit.js");

// Cargar variables de entorno
dotenv.config({ path: path.join(__dirname, "../../.env.local") });

const app = express();
const PORT = process.env.PORT || 5000;

// ========================================
// 🔧 CONFIGURACIÓN GLOBAL
// ========================================

// CORS - Configuración para desarrollo
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || true,
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With"],
  }),
);

// Logging personalizado (request id + centralizado)
app.use(requestLogger);

// Seguridad con Helmet (ajustado para desarrollo)
app.use(
  helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false,
  }),
);

// (Morgan optional) - keep for low-level HTTP logging if needed
app.use(morgan("combined"));

// ========================================
// 🔄 CONFIGURACIÓN DE PROXIES
// ⚠️ ORDEN CRÍTICO: De más específico a más general
// ========================================

// Función helper para crear proxies con configuración estándar
const createServiceProxy = (target, serviceName, proxyOptions = {}) => {
  return createProxyMiddleware({
    target,
    changeOrigin: true,
    logLevel: process.env.NODE_ENV === "development" ? "debug" : "warn",
    timeout: 15000, // 15 segundos timeout de conexión (optimizado)
    proxyTimeout: 15000, // 15 segundos timeout de respuesta (optimizado)
    onError: (err, req, res) => {
      console.error(`❌ [${serviceName}] Proxy error en ${req.url}:`, err.message);
      if (!res.headersSent) {
        res.status(502).json({
          error: `Servicio ${serviceName} no disponible`,
          message: err.message,
          timestamp: new Date().toISOString(),
        });
      }
    },
    onProxyReq: (proxyReq, req, res) => {
      // Propagar headers importantes (ej. Authorization)
      if (req.headers.authorization) {
        proxyReq.setHeader("Authorization", req.headers.authorization);
      }
      logger.informacion(`🔀 [${serviceName}] ${req.method} ${req.url} → ${target}`);
    },
    onProxyRes: (proxyRes, req, res) => {
      logger.informacion(`✅ [${serviceName}] ${req.url} → ${proxyRes.statusCode}`);
    },
    ...proxyOptions,
  });
};

// ----------------------------------------
// 🔹 USERS SERVICE (NAMESPACE: /api/auth y /api/users)
// ----------------------------------------
app.use(
  "/api/auth",
  authLimiter, // Auth con límite estricto
  createServiceProxy(process.env.USERS_SERVICE_URL || "http://backend-users:5001", "USERS"),
);

app.use(globalLimiter); // Límite global para todas las demás rutas

// /api/users/* -> backend-users /api/*
app.use(
  "/api/users",
  createServiceProxy(process.env.USERS_SERVICE_URL || "http://backend-users:5001", "USERS", {
    pathRewrite: (path) => {
      // Robustez ante cómo Express/ProxyMiddleware maneja el mount path
      if (path.startsWith("/api/users")) return path.replace("/api/users", "/api");
      if (path.startsWith("/api/")) return path;
      return `/api${path}`;
    },
  }),
);

// ----------------------------------------
// 🔹 MATERIALES SERVICE (Go) -> /api/materials
// ----------------------------------------
app.use(
  "/api/materiales",
  createServiceProxy(
    process.env.MATERIALES_SERVICE_URL || "http://backend-materiales:5003",
    "MATERIALES",
    {
      // backend Go espera /api/materiales
      pathRewrite: (path) => {
        // if (path.startsWith("/api/materials"))
        //   return path.replace("/api/materials", "/api/materiales");
        if (path.startsWith("/api/materiales")) return path;
        return `/api/materiales${path}`;
      },
    },
  ),
);

// ----------------------------------------
// 🔹 MP SERVICE -> /api/mp
// ----------------------------------------
app.use(
  "/api/mp",
  createServiceProxy(process.env.MP_SERVICE_URL || "http://backend-mp:5002", "MP", {
    // backend-mp espera rutas bajo /api/*
    pathRewrite: (path) => {
      // if (path.startsWith("/api/mp")) return path.replace("/api/mp", "/api");
      if (path.startsWith("/api/mp")) return path;
      return `/api/mp${path}`;
    },
  }),
);

// ========================================
// 🏥 HEALTH CHECKS
// ========================================

// Health check general del Gateway
app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    service: "api-gateway",
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// Health check por servicio (verifica conectividad)
app.get("/health/services", async (req, res) => {
  const services = {
    users: process.env.USERS_SERVICE_URL,
    mp: process.env.MP_SERVICE_URL,
    materiales: process.env.MATERIALES_SERVICE_URL,
  };

  const results = {};

  for (const [name, url] of Object.entries(services)) {
    if (!url) {
      results[name] = { status: "NOT_CONFIGURED", url: null };
      continue;
    }
    try {
      // Intenta conectar al endpoint /health del servicio (si existe)
      const response = await fetch(`${url}/health`, {
        method: "GET",
        timeout: 3000, // Reducido de 5000ms a 3000ms
      });
      results[name] = {
        status: response.ok ? "UP" : "DOWN",
        url,
        statusCode: response.status,
      };
    } catch (err) {
      // Si no tiene /health, al menos verifica que el puerto responde
      try {
        await fetch(url, { method: "HEAD", timeout: 2000 }); // Reducido de 3000ms a 2000ms
        results[name] = { status: "UP (no /health endpoint)", url };
      } catch {
        results[name] = { status: "DOWN", url, error: err.message };
      }
    }
  }

  const allUp = Object.values(results).every((r) => r.status.includes("UP"));
  res.status(allUp ? 200 : 503).json({
    gateway: "OK",
    services: results,
    timestamp: new Date().toISOString(),
  });
});

// Parsear JSON para peticiones directas al gateway
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ========================================
// 📄 RUTAS INFORMATIVAS
// ========================================

app.get("/", (req, res) => {
  res.json({
    message: "🚀 API Gateway SISGAD5",
    version: "1.0.0",
    environment: process.env.NODE_ENV || "development",
    services: {
      users: {
        url: process.env.USERS_SERVICE_URL,
        endpoints: ["/api/auth/*", "/api/users/*"],
      },
      materiales: {
        url: process.env.MATERIALES_SERVICE_URL,
        endpoints: ["/api/materials/*"],
        language: "Go",
      },
      mp: {
        url: process.env.MP_SERVICE_URL,
        endpoints: ["/api/mp/*"],
      },
    },
    health: "/health",
    healthDetailed: "/health/services",
  });
});

// 404 Handler para rutas no encontradas
app.use((req, res) => {
  res.status(404).json({
    error: "Ruta no encontrada",
    path: req.url,
    method: req.method,
    timestamp: new Date().toISOString(),
  });
});

// ========================================
// 🚀 INICIAR SERVIDOR
// ========================================

const server = app.listen(PORT, "0.0.0.0", () => {
  logger.informacion(`\n🚀 API Gateway corriendo en http://localhost:${PORT}`);
  logger.informacion(`📦 Environment: ${process.env.NODE_ENV || "development"}`);
  logger.informacion(`\n📋 Servicios configurados:`);
  logger.informacion(
    `   👥 Users:     ${process.env.USERS_SERVICE_URL || "http://backend-users:5001"}`,
  );
  logger.informacion(
    `   📦 Materiales: ${process.env.MATERIALES_SERVICE_URL || "http://backend-materiales:5003"} (Go)`,
  );
  logger.informacion(`   🛠️  MP:        ${process.env.MP_SERVICE_URL || "http://backend-mp:5002"}`);
  logger.informacion(`\n🔗 Endpoints:`);
  logger.informacion(`   • GET /health          → Estado del gateway`);
  logger.informacion(`   • GET /health/services → Estado de todos los servicios`);
  logger.informacion(`   • GET /                → Documentación básica\n`);
});

// Graceful shutdown para cerrar conexiones limpiamente
process.on("SIGTERM", () => {
  logger.informacion("🛑 SIGTERM recibido. Cerrando servidor...");
  server.close(() => {
    logger.informacion("✅ Servidor cerrado correctamente");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  logger.informacion("🛑 SIGINT recibido (Ctrl+C). Cerrando servidor...");
  server.close(() => {
    logger.informacion("✅ Servidor cerrado correctamente");
    process.exit(0);
  });
});

// Manejo de errores no capturados
process.on("uncaughtException", (err) => {
  logger.error("💥 Uncaught Exception:", err);
  server.close(() => process.exit(1));
});

process.on("unhandledRejection", (reason, promise) => {
  logger.error("💥 Unhandled Rejection at:", promise, "reason:", reason);
  // No cerramos el servidor para promesas rechazadas, pero se loguea
});

module.exports = app; // Para testing
