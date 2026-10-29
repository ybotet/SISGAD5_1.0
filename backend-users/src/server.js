const express = require("express");
const helmet = require("helmet");
const path = require("path");
const dotenv = require("dotenv");
const config = require("./shared/config/env");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./shared/config/swagger");

const requestLogger = require("./shared/middleware/requestLogger");
const securityMiddleware = require("./shared/config/security");
const usersLimiter = require("./shared/config/rateLimit");
const authMiddleware = require("./shared/middleware/auth");

dotenv.config({ path: path.join(__dirname, "../../.env.local") });

const { testConnection } = require("./shared/config/database");

const app = express();

// 1️⃣ Body parsers (SIEMPRE primero)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2️⃣ Seguridad base (Helmet)
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// 3️⃣ Rate limiting
app.use("/api", usersLimiter);

// 4️⃣ Swagger docs
app.use(
  "/api/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "SISGAD5 API Docs - Users Service",
  }),
);

// 5️⃣ Logger personalizado
app.use(requestLogger);

// 6️⃣ Security middleware adicional
app.use(securityMiddleware);

// 7️⃣ Test DB
testConnection();

// 8️⃣ Rutas (después de middlewares)
const apiRoutes = require("./routes");
app.use("/api", apiRoutes);

// 9️⃣ Rutas públicas (health, root)
app.get("/", (req, res) => {
  res.json({
    message: "🚀 SISGAD5 Microservicio Usuarios funcionando!",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "UP",
    message: "Microservicio Usuarios funcionando correctamente",
    timestamp: new Date().toISOString(),
  });
});

// 🔟 Manejo de errores 404
app.use((req, res) => {
  res.status(404).json({
    error: "Ruta no encontrada",
    path: req.originalUrl,
    method: req.method,
  });
});

// 1️⃣1️⃣ Manejo de errores global
const errorHandler = require("./shared/middleware/errorHandler");
app.use(errorHandler);

const PORT = config.USERS_PORT || 5001;

// Only start server when run directly (not required by tests)
if (require.main === module) {
  app.listen(PORT, () => {
    console.log(`🚀 Microservicio Usuarios ejecutándose en puerto ${PORT}`);
    console.log(`📊 Entorno: ${process.env.NODE_ENV || "development"}`);
  });
}

module.exports = app;
