const rateLimit = require("express-rate-limit");

// Límite general para el servicio MP
const mpLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 200, // más permisivo que el Gateway (tráfico interno)
  message: { error: "Demasiadas peticiones al servicio MP" },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = mpLimiter;
