const { z } = require("zod");

// Schema base para validaciones de Grupow
const grupowBaseSchema = z.object({
  grupo: z
    .string()
    .min(1, "ERROR.GRUPO.REQUIRED")
    .max(50, "ERROR.GRUPO.MAX_LENGTH")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "ERROR.GRUPO.INVALID_CHARS")
    .optional()
    .nullable(),
});

// Schema para CREAR: base con validaciones requeridas
const createGrupowSchema = grupowBaseSchema.refine(
  (data) => data.grupo != null && data.grupo.trim().length > 0,
  {
    message: "ERROR.GRUPO.REQUIRED",
    path: ["grupo"],
  },
);

// Schema para ACTUALIZAR: base parcial
const updateGrupowSchema = grupowBaseSchema.partial();

// Schema para QUERY
const listGrupowSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(["grupo", "createdAt", "updatedAt"]).default("grupo"),
  sortOrder: z.enum(["ASC", "DESC"]).default("ASC"),
  search: z.string().optional(),
});

module.exports = {
  createGrupowSchema,
  updateGrupowSchema,
  listGrupowSchema,
};
