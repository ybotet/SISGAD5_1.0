const { z } = require("zod");

// Schema base para validaciones de Mando
const mandoBaseSchema = z.object({
  mando: z
    .string()
    .max(18, "ERROR.MANDO.MANDO.MAX_LENGTH")
    .regex(/^[a-zA-Z0-9\s]*$/i, "ERROR.MANDO.MANDO.INVALID_CHARS")
    .optional()
    .nullable(),
});

// Schema para CREAR: base con validaciones requeridas
const createMandoSchema = mandoBaseSchema.refine(
  (data) => data.mando != null && data.mando.trim().length > 0,
  {
    message: "ERROR.MANDO.MANDO.REQUIRED",
    path: ["mando"],
  },
);

// Schema para ACTUALIZAR: base parcial
const updateMandoSchema = mandoBaseSchema.partial();

// Schema para QUERY
const listMandoSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(["mando", "createdAt", "updatedAt"]).default("createdAt"),
  sortOrder: z.enum(["ASC", "DESC"]).default("DESC"),
  search: z.string().optional(),
});

module.exports = {
  createMandoSchema,
  updateMandoSchema,
  listMandoSchema,
};
