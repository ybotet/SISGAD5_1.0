// backend-mp/src/config/env.js
const { z } = require("zod");
const path = require("path");

// 🔹 Cargar variables desde la raíz (ya lo hace dotenv en server.js, pero por seguridad)
require("dotenv").config({ path: path.join(__dirname, "../../../.env.local") });

// 🔹 Schema con SOLO las variables que necesita este microservicio
const envSchema = z.object({
  // Entorno
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  // Puerto (MP específico)
  MP_PORT: z.coerce.number().int().min(1000).max(65535).default(5002),

  // Base de datos (críticas)
  DB_HOST: z.string().min(1, "ERROR.DB.HOST_REQUIRED"),
  DB_PORT: z.coerce.number().int().min(1).max(65535).default(5432),
  DB_USER: z.string().min(1, "ERROR.DB.USER_REQUIRED"),
  DB_PASSWORD: z.string().min(1, "ERROR.DB.PASSWORD_REQUIRED"),
  MP_DB_NAME: z.string().min(1, "ERROR.DB.NAME_REQUIRED"),

  // JWT (crítico para auth)
  JWT_SECRET: z.string().min(32, "ERROR.JWT.SECRET_TOO_SHORT"),
  JWT_EXPIRES_IN: z.string().default("24h"),

  // Servicios externos (opcionales para desarrollo)
  USERS_SERVICE_URL: z
    .string()
    .url()
    .optional()
    .default("http://localhost:5001"),

  // Logging
  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
  LOG_FILE_PATH: z.string().default("logs/app.log"),

  // Seguridad
  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),
});

// 🔹 Validar y exportar
const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error(
    "❌ CONFIG ERROR: Variables de entorno inválidas para backend-mp",
  );
  result.error.errors.forEach((err) => {
    console.error(`  • ${err.path.join(".")}: ${err.message}`);
  });
  process.exit(1);
}

// ✅ Exportar config tipada y lista para usar
module.exports = result.data;
