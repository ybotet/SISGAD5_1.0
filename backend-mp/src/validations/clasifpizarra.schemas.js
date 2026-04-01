const { z } = require("zod");

// Schema base para validaciones de Clasifpizarra
const clasifpizarraBaseSchema = z.object({
  clasificacion: z
    .string()
    .max(100, "ERROR.CLASIFPIZARRA.CLASIFICACION.MAX_LENGTH")
    .optional()
    .nullable(),
});

// Schema para CREAR: base con validaciones requeridas
const createClasifpizarraSchema = clasifpizarraBaseSchema.refine(
  (data) => data.clasificacion != null && data.clasificacion.trim().length > 0,
  {
    message: "ERROR.CLASIFPIZARRA.CLASIFICACION.REQUIRED",
    path: ["clasificacion"],
  },
);

// Schema para ACTUALIZAR: base parcial
const updateClasifpizarraSchema = clasifpizarraBaseSchema.partial();

// Schema para QUERY
const listClasifpizarraSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z
    .enum(["clasificacion", "createdAt", "updatedAt"])
    .default("clasificacion"),
  sortOrder: z.enum(["ASC", "DESC"]).default("ASC"),
  search: z.string().optional(),
});

module.exports = {
  createClasifpizarraSchema,
  updateClasifpizarraSchema,
  listClasifpizarraSchema,
};
