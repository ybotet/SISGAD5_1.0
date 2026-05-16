const logger = require("../config/logger");
const { randomUUID } = require("crypto");

const requestLogger = (req, res, next) => {
  const start = Date.now();
  const requestId =
    typeof randomUUID === "function"
      ? randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
  res.setHeader("X-Request-Id", requestId);
  req.requestId = requestId;

  res.on("finish", () => {
    const duration = Date.now() - start;
    const meta = {
      requestId,
      method: req.method,
      url: req.originalUrl,
      status: res.statusCode,
      duration_ms: duration,
      ip: req.ip || req.connection?.remoteAddress,
    };

    if (res.statusCode >= 500) logger.error("Request error", meta);
    else if (res.statusCode >= 400) logger.alerta("Request alerta", meta);
    else logger.informacion("Request completed", meta);
  });

  next();
};

module.exports = requestLogger;
