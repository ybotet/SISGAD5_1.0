const winston = require("winston");
const path = require("path");
const fs = require("fs");

// Crear carpeta de logs si no existe
const baseLogDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(baseLogDir)) fs.mkdirSync(baseLogDir, { recursive: true });

const serviceName = process.env.SERVICE_NAME || process.env.npm_package_name || "backend-mp";

// Niveles personalizados en español
const levels = {
  error: 0, // ERROR
  alerta: 1, // ALERTA
  informacion: 2, // INFORMACION
};

const colors = {
  error: "red",
  alerta: "yellow",
  informacion: "blue",
};

winston.addColors(colors);

const logger = winston.createLogger({
  levels,
  level: process.env.LOG_LEVEL || "informacion",
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.errors({ stack: true }),
    winston.format.splat(),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize({ all: true }),
        winston.format.timestamp(),
        winston.format.printf((info) => {
          const base = `${info.timestamp} [${serviceName}] ${info.level}: ${info.message}`;
          return info.stack ? `${base}\n${info.stack}` : base;
        }),
      ),
    }),
    // Archivo específico del servicio
    new winston.transports.File({
      filename: path.join(baseLogDir, `${serviceName}.log`),
      maxsize: 10 * 1024 * 1024,
      maxFiles: 10,
    }),
    // Archivo común para todo el sistema
    new winston.transports.File({
      filename: path.join(baseLogDir, `system.log`),
      maxsize: 20 * 1024 * 1024,
      maxFiles: 20,
    }),
  ],
});

// Compatibilidad: métodos en español
logger.informacion = (...args) => logger.log("informacion", ...args);
logger.alerta = (...args) => logger.log("alerta", ...args);
// mantener logger.error nativo

// Aliases para compatibilidad con código existente
logger.info = (...args) => logger.informacion(...args);
logger.warn = (...args) => logger.alerta(...args);

module.exports = logger;
