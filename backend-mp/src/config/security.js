const helmet = require("helmet");

const securityMiddleware = helmet({
  contentSecurityPolicy: false, // Desactivado para desarrollo, activar en producción
  crossOriginEmbedderPolicy: false,
  crossOriginOpenerPolicy: false,
  crossOriginResourcePolicy: { policy: "same-site" },
});

module.exports = securityMiddleware;
