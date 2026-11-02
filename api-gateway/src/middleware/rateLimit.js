const rateLimit = require("express-rate-limit");

// Configuración general para toda la API
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // Máximo 100 peticiones por IP en 15 min
});

// Configuración estricta para auth (login, registro)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 5, // Solo 5 intentos de login por IP
  message: { error: "Demasiados intentos de autenticación" },
  skipSuccessfulRequests: true, // No contar logins exitosos
});

module.exports = {
  globalLimiter,
  authLimiter,
};
