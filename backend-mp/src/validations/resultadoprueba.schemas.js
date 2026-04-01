const { z } = require("zod");

// Schema base para validaciones de Resultadoprueba
const resultadopruebaBaseSchema = z.object({
  resultado: z
    .string()
    .max(20, "ERROR.RESULTADOPRUEBA.RESULTADO.MAX_LENGTH")
    .optional()
    .nullable(),
});

// Schema para CREAR: base con validaciones requeridas
const createResultadopruebaSchema = resultadopruebaBaseSchema.refine(
  (data) => data.resultado != null && data.resultado.trim().length > 0,
  {
    message: "ERROR.RESULTADOPRUEBA.RESULTADO.REQUIRED",
    path: ["resultado"],
  },
);

// Schema para ACTUALIZAR: base parcial
const updateResultadopruebaSchema = resultadopruebaBaseSchema.partial();

// Schema para QUERY
const listResultadopruebaSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(["resultado", "createdAt", "updatedAt"]).default("createdAt"),
  sortOrder: z.enum(["ASC", "DESC"]).default("DESC"),
  search: z.string().optional(),
});

module.exports = {
  createResultadopruebaSchema,
  updateResultadopruebaSchema,
  listResultadopruebaSchema,
};
