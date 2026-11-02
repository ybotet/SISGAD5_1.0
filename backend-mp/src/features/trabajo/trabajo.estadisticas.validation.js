const { z } = require("zod");

/**
 * Validaciones para endpoints de estadísticas de trabajos (TASK-710-08).
 */

// Params: id_trabajador opcional (filtro) en /estadisticas/trabajadores
const trabajadorStatsQuerySchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(20),
  sortBy: z
    .enum([
      "id_trabajador",
      "clave_trabajador",
      "nombre",
      "total_trabajos",
      "horas_totales",
      "primera_fecha",
      "ultima_fecha",
    ])
    .default("total_trabajos"),
  sortOrder: z.enum(["ASC", "DESC"]).default("DESC"),
});

// Params: id_queja en /estadisticas/queja/:id_queja
const quejaStatsParamsSchema = z.object({
  id_queja: z.coerce.number().int().positive(),
});

// Params: id_trabajo en /:id/estadisticas
const trabajoStatsParamsSchema = z.object({
  id: z.coerce.number().int().positive(),
});

module.exports = {
  trabajadorStatsQuerySchema,
  quejaStatsParamsSchema,
  trabajoStatsParamsSchema,
};
