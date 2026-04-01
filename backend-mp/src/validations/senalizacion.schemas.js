const { z } = require("zod");

// Schema base para validaciones de Senalizacion
const senalizacionBaseSchema = z.object({
  senalizacion: z
    .string()
    .max(25, "ERROR.SENALIZACION.SENALIZACION.MAX_LENGTH")
    .optional()
    .nullable(),
});

// Schema para CREAR: base con validaciones requeridas
const createSenalizacionSchema = senalizacionBaseSchema.refine(
  (data) => data.senalizacion != null && data.senalizacion.trim().length > 0,
  {
    message: "ERROR.SENALIZACION.SENALIZACION.REQUIRED",
    path: ["senalizacion"],
  },
);

// Schema para ACTUALIZAR: base parcial
const updateSenalizacionSchema = senalizacionBaseSchema.partial();

// Schema para QUERY
const listSenalizacionSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z
    .enum(["senalizacion", "createdAt", "updatedAt"])
    .default("createdAt"),
  sortOrder: z.enum(["ASC", "DESC"]).default("DESC"),
  search: z.string().optional(),
});

module.exports = {
  createSenalizacionSchema,
  updateSenalizacionSchema,
  listSenalizacionSchema,
};
