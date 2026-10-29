const env = require("./env");
const logger = require("./logger");
const rateLimit = require("express-rate-limit");

const apiLimiter = rateLimit({
  windowMs: env.RATE_LIMIT_WINDOW_MS,
  max: env.RATE_LIMIT_MAX_REQUESTS,
  message: { error: "Demasiadas peticiones" },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = apiLimiter;
