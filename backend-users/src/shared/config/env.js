const { z } = require("zod");
const path = require("path");

require("dotenv").config({ path: path.join(__dirname, "../../../../.env.local") });

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "production", "test"])
    .default("development"),

  USERS_PORT: z.coerce.number().int().min(1000).max(65535).default(5001),

  DB_HOST: z.string().min(1, "ERROR.DB.HOST_REQUIRED"),
  DB_PORT: z.coerce.number().int().min(1).max(65535).default(5432),
  DB_USER: z.string().min(1, "ERROR.DB.USER_REQUIRED"),
  DB_PASSWORD: z.string().min(1, "ERROR.DB.PASSWORD_REQUIRED"),
  USERS_DB_NAME: z.string().min(1, "ERROR.DB.NAME_REQUIRED").default("bd_sisgad5_users"),

  JWT_SECRET: z.string().min(32, "ERROR.JWT.SECRET_TOO_SHORT"),
  JWT_EXPIRES_IN: z.string().default("15m"),
  JWT_REFRESH_EXPIRES_IN: z.string().default("7d"),

  USERS_SERVICE_URL: z
    .string()
    .url()
    .optional()
    .default("http://localhost:5001"),

  LOG_LEVEL: z.enum(["error", "warn", "info", "debug"]).default("info"),
  LOG_FILE_PATH: z.string().default("logs/app.log"),

  RATE_LIMIT_WINDOW_MS: z.coerce.number().int().positive().default(900000),
  RATE_LIMIT_MAX_REQUESTS: z.coerce.number().int().positive().default(100),
});

const result = envSchema.safeParse(process.env);

if (!result.success) {
  console.error("❌ CONFIG ERROR: Variables de entorno inválidas para backend-users");
  result.error.errors.forEach((err) => {
    console.error(`  • ${err.path.join(".")}: ${err.message}`);
  });
  process.exit(1);
}

module.exports = result.data;
