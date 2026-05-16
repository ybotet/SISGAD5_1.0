const winston = require("winston");
const path = require("path");
const fs = require("fs");

const baseLogDir = path.join(process.cwd(), "logs");
if (!fs.existsSync(baseLogDir)) fs.mkdirSync(baseLogDir, { recursive: true });

const serviceName = process.env.SERVICE_NAME || process.env.npm_package_name || "api-gateway";

const levels = { error: 0, alerta: 1, informacion: 2 };
const colors = { error: "red", alerta: "yellow", informacion: "blue" };
winston.addColors(colors);

const logger = winston.createLogger({
  levels,
  level: process.env.LOG_LEVEL || "informacion",
  format: winston.format.combine(winston.format.timestamp(), winston.format.json()),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(
          (info) => `${info.timestamp} [${serviceName}] ${info.level}: ${info.message}`,
        ),
      ),
    }),
    new winston.transports.File({ filename: path.join(baseLogDir, `${serviceName}.log`) }),
    new winston.transports.File({ filename: path.join(baseLogDir, `system.log`) }),
  ],
});

logger.informacion = (...args) => logger.log("informacion", ...args);
logger.alerta = (...args) => logger.log("alerta", ...args);
logger.info = (...args) => logger.informacion(...args);
logger.warn = (...args) => logger.alerta(...args);

module.exports = logger;
