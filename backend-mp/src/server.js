const express = require("express");
const helmet = require("helmet");
const path = require("path");
const dotenv = require("dotenv");
const config = require("./config/env");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./config/swagger");

// Middlewares personalizados
const requestLogger = require("./middleware/requestLogger");
const securityMiddleware = require("./config/security");
const mpLimiter = require("./config/rateLimit");
const authMiddleware = require("./middleware/auth"); // ⚠️ Asegúrate de importar tu auth

dotenv.config({ path: path.join(__dirname, "../../.env.local") });
const { testConnection } = require("./config/database");

const app = express();

// 1️⃣ Body parsers (SIEMPRE primero)
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// 2️⃣ Seguridad base (Helmet)
app.use(helmet({ crossOriginResourcePolicy: { policy: "cross-origin" } }));

// 3️⃣ Rate limiting (ANTES de las rutas)
app.use("/api/mp", mpLimiter);

app.use(
  "/api/mp/docs",
  swaggerUi.serve,
  swaggerUi.setup(swaggerSpec, {
    explorer: true,
    customCss: ".swagger-ui .topbar { display: none }",
    customSiteTitle: "SISGAD5 API Docs",
  }),
);

// 4️⃣ Autenticación GLOBAL (para que req.user esté disponible)
// ⚠️ Si tu auth está solo en rutas específicas, muévelo aquí como middleware global
app.use("/api/mp", authMiddleware);

// 5️⃣ Logger personalizado (DESPUÉS de auth, para capturar req.user)
app.use(requestLogger);

// 6️⃣ Security middleware adicional (si aplica)
app.use(securityMiddleware);

// 7️⃣ Test DB
testConnection();

// 8️⃣ Rutas (AHORA SÍ, después de todos los middlewares)
const apiRoutes = require("./routes");
app.use("/api/mp", apiRoutes);

// 9️⃣ Rutas públicas (health, root)
app.get("/", (req, res) => {
  res.json({
    message: "🚀 SISGAD5 Backend-MP funcionando!",
    version: "1.0.0",
    timestamp: new Date().toISOString(),
  });
});

app.get("/health", (req, res) => {
  res.json({
    status: "OK",
    message: "API de backend-mp funcionando correctamente",
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

// 1️⃣1️⃣ Manejo de errores global (SIEMPRE al final)
const errorHandler = require("./middleware/errorHandler");
app.use(errorHandler);

const PORT = config.MP_PORT || 5002;
app.listen(PORT, () => {
  console.log(`🚀 Backend MP ejecutándose en puerto ${PORT}`);
});
