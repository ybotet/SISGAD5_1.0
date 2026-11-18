const rateLimit = require("express-rate-limit");

// Configuración estricta solo para auth (login, registro)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Solo 5 intentos de login por IP
  message: { error: "Demasiados intentos de autenticación" },
  skipSuccessfulRequests: true, // No contar logins exitosos
});

module.exports = {
  authLimiter,
};
