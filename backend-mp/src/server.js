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

// Cargar variables
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

// Middleware para normalizar todas las fechas entrantes
app.use((req, res, next) => {
  const normalizeDates = (obj) => {
    if (!obj || typeof obj !== "object") return obj;

    for (const key in obj) {
      const value = obj[key];

      // Si es un string que parece datetime-local
      if (
        typeof value === "string" &&
        value.includes("T") &&
        value.match(/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}/)
      ) {
        // Convertir "2026-05-01T15:30" a "2026-05-01 15:30:00"
        obj[key] = value.replace("T", " ") + ":00";
      }
      // Si es un objeto Date
      else if (value instanceof Date) {
        const year = value.getFullYear();
        const month = String(value.getMonth() + 1).padStart(2, "0");
        const day = String(value.getDate()).padStart(2, "0");
        const hours = String(value.getHours()).padStart(2, "0");
        const minutes = String(value.getMinutes()).padStart(2, "0");
        const seconds = String(value.getSeconds()).padStart(2, "0");
        obj[key] = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
      }
      // Recursivo para objetos anidados
      else if (typeof value === "object" && value !== null) {
        normalizeDates(value);
      }
    }
  };

  if (req.body) normalizeDates(req.body);
  if (req.query) normalizeDates(req.query);

  next();
});

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

const logger = require("./config/logger");
const PORT = config.MP_PORT || 5002;
app.listen(PORT, () => {
  logger.informacion(`🚀 Backend MP ejecutándose en puerto ${PORT}`);
});
