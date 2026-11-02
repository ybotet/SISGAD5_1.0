const { z } = require("zod");

/**
 * Query schema para GET /api/auth/sesiones (TASK-300-08)
 * Historial de sesiones consultable con filtros y paginación.
 */
const sesionesQuerySchema = z.object({
  evento: z
    .enum(["login", "refresh", "logout"], {
      errorMap: () => ({ message: "ERROR.SESION.EVENTO_INVALIDO" }),
    })
    .optional(),
  exitoso: z
    .enum(["true", "false"], {
      errorMap: () => ({ message: "ERROR.SESION.EXITOSO_INVALIDO" }),
    })
    .optional(),
  desde: z.coerce.date({
    errorMap: () => ({ message: "ERROR.SESION.FECHA_DESDE_INVALIDA" }),
  }).optional(),
  hasta: z.coerce.date({
    errorMap: () => ({ message: "ERROR.SESION.FECHA_HASTA_INVALIDA" }),
  }).optional(),
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
});

/**
 * Params schema para GET /api/auth/sesiones/usuario/:id_usuario
 */
const sesionesUsuarioParamsSchema = z.object({
  id_usuario: z.coerce.number().int().positive("ERROR.USUARIO.ID_INVALIDO"),
});

module.exports = {
  sesionesQuerySchema,
  sesionesUsuarioParamsSchema,
};
