const AppError = require("./AppError");

const apiErrors = {
  notFound: (resource = "Recurso") =>
    new AppError(`${resource} no encontrado`, 404),

  unauthorized: (message = "Acceso no autorizado") =>
    new AppError(message, 401),

  forbidden: (message = "Permiso denegado") => new AppError(message, 403),

  badRequest: (message = "Solicitud inválida") => new AppError(message, 400),

  conflict: (message = "Conflicto de recursos") => new AppError(message, 409),

  internal: (message = "Error interno del servidor") =>
    new AppError(message, 500, false), // isOperational = false (bug)
};

module.exports = apiErrors;
