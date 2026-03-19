const logger = require("../config/logger");

const requestLogger = (req, res, next) => {
  const start = Date.now();

  res.on("finish", () => {
    const duration = Date.now() - start;
    logger.info("Request completed", {
      method: req.method,
      url: req.originalUrl,
      path: req.path,
      status: res.statusCode,
      duration_ms: duration,
      ip: req.ip || req.connection.remoteAddress,

      userId: req.userId || req.usuario?.id || "anonymous",
      userRole: req.usuario?.role || req.usuario?.rol || null,

      userAgent: req.get("user-agent"),
    });
  });

  next();
};

module.exports = requestLogger;
