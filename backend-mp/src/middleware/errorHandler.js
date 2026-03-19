// middleware/errorHandler.js
const logger = require("../config/logger");

const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Logging estructurado
  if (err.isOperational) {
    logger.warn("Error operacional", {
      message: err.message,
      statusCode: err.statusCode,
      path: req.path,
      method: req.method,
      userId: req.userId || "anonymous",
    });
  } else {
    logger.error("Error de programación (bug)", {
      message: err.message,
      stack: err.stack,
      path: req.path,
    });
  }

  // Respuesta al cliente
  res.status(err.statusCode).json({
    success: false,
    error: err.message,
    statusCode: err.statusCode,
    timestamp: err.timestamp || new Date().toISOString(),
    ...(process.env.NODE_ENV === "development" && { stack: err.stack }),
  });
};

module.exports = errorHandler;
