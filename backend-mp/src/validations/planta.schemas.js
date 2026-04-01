const { z } = require("zod");

// Schema base para validaciones de Planta
const plantaBaseSchema = z.object({
  planta: z
    .string()
    .max(12, "ERROR.PLANTA.PLANTA.MAX_LENGTH")
    .optional()
    .nullable(),
});

// Schema para CREAR: base con validaciones requeridas
const createPlantaSchema = plantaBaseSchema.refine(
  (data) => data.planta != null && data.planta.trim().length > 0,
  {
    message: "ERROR.PLANTA.PLANTA.REQUIRED",
    path: ["planta"],
  },
);

// Schema para ACTUALIZAR: base parcial
const updatePlantaSchema = plantaBaseSchema.partial();

// Schema para QUERY
const listPlantaSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(["planta", "createdAt", "updatedAt"]).default("createdAt"),
  sortOrder: z.enum(["ASC", "DESC"]).default("DESC"),
  search: z.string().optional(),
});

module.exports = {
  createPlantaSchema,
  updatePlantaSchema,
  listPlantaSchema,
};
