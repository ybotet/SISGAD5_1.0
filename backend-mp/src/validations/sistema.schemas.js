const { z } = require("zod");

// Schema base para validaciones de Sistema
const sistemaBaseSchema = z.object({
  id_propietario: z.number().int().positive().optional().nullable(),
  sistema: z
    .string()
    .max(15, "ERROR.SISTEMA.SISTEMA.MAX_LENGTH")
    .optional()
    .nullable(),
  direccion: z
    .string()
    .max(30, "ERROR.SISTEMA.DIRECCION.MAX_LENGTH")
    .optional()
    .nullable(),
});

// Schema para CREAR: base con validaciones requeridas
const createSistemaSchema = sistemaBaseSchema.refine(
  (data) => data.sistema != null && data.sistema.trim().length > 0,
  {
    message: "ERROR.SISTEMA.SISTEMA.REQUIRED",
    path: ["sistema"],
  },
);

// Schema para ACTUALIZAR: base parcial
const updateSistemaSchema = sistemaBaseSchema.partial();

// Schema para QUERY
const listSistemaSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z
    .enum(["sistema", "direccion", "createdAt", "updatedAt"])
    .default("createdAt"),
  sortOrder: z.enum(["ASC", "DESC"]).default("DESC"),
  search: z.string().optional(),
});

module.exports = {
  createSistemaSchema,
  updateSistemaSchema,
  listSistemaSchema,
};
