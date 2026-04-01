const { z } = require("zod");

// Schema base para validaciones de Tipolinea
const tipolineaBaseSchema = z.object({
  tipo: z
    .string()
    .max(23, "ERROR.TIPOLINEA.TIPO.MAX_LENGTH")
    .optional()
    .nullable(),
});

// Schema para CREAR: base con validaciones requeridas
const createTipolineaSchema = tipolineaBaseSchema.refine(
  (data) => data.tipo != null && data.tipo.trim().length > 0,
  {
    message: "ERROR.TIPOLINEA.TIPO.REQUIRED",
    path: ["tipo"],
  },
);

// Schema para ACTUALIZAR: base parcial
const updateTipolineaSchema = tipolineaBaseSchema.partial();

// Schema para QUERY
const listTipolineaSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z
    .enum(["tipo", "id_tipolinea", "createdAt", "updatedAt"])
    .default("tipo"),
  sortOrder: z.enum(["ASC", "DESC"]).default("ASC"),
  search: z.string().optional(),
});

module.exports = {
  createTipolineaSchema,
  updateTipolineaSchema,
  listTipolineaSchema,
};
