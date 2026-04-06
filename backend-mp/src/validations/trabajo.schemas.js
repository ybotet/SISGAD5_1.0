const { z } = require("zod");

// Schema base para validaciones de Trabajo
const trabajoBaseSchema = z.object({
  fecha: z.coerce.date().optional().nullable(),
  probador: z.coerce.number().int().positive().optional().nullable(),
  estado: z.coerce.number().int().positive().optional().nullable(),
  observaciones: z.string().optional().nullable(),
  id_queja: z.coerce.number().int().positive().optional().nullable(),
  trabajadores: z
    .array(
      z.object({
        id_trabajador: z.number().int().positive(),
      }),
    )
    .optional(),
});

// Schema para CREAR: base con validaciones requeridas
const createTrabajoSchema = trabajoBaseSchema
  .refine((data) => data.probador != null && data.probador > 0, {
    message: "ERROR.TRABAJO.PROBADOR.REQUIRED",
    path: ["probador"],
  })
  .refine((data) => data.estado != null && data.estado > 0, {
    message: "ERROR.TRABAJO.ESTADO.REQUIRED",
    path: ["estado"],
  })
  .refine((data) => data.id_queja != null && data.id_queja > 0, {
    message: "ERROR.TRABAJO.ID_QUEJA.REQUIRED",
    path: ["id_queja"],
  });

// Schema para ACTUALIZAR: base parcial
const updateTrabajoSchema = trabajoBaseSchema.partial();

// Schema para QUERY
const listTrabajoSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z
    .enum([
      "fecha",
      "probador",
      "estado",
      "observaciones",
      "id_queja",
      "id_trabajo",
      "createdAt",
      "updatedAt",
    ])
    .default("createdAt"),
  sortOrder: z.enum(["ASC", "DESC"]).default("DESC"),
  search: z.string().optional(),
});

module.exports = {
  createTrabajoSchema,
  updateTrabajoSchema,
  listTrabajoSchema,
};
