const { z } = require("zod");

// Schema base para validaciones de Clasificacion
const clasificacionBaseSchema = z.object({
  nombre: z
    .string()
    .max(14, "ERROR.CLASIFICACION.NOMBRE.MAX_LENGTH")
    .regex(/^[a-zA-Z0-9\s]*$/, "ERROR.CLASIFICACION.NOMBRE.INVALID_CHARS")
    .optional()
    .nullable(),
});

// Schema para CREAR: base con validaciones requeridas
const createClasificacionSchema = clasificacionBaseSchema.refine(
  (data) => data.nombre != null && data.nombre.trim().length > 0,
  {
    message: "ERROR.CLASIFICACION.NOMBRE.REQUIRED",
    path: ["nombre"],
  },
);

// Schema para ACTUALIZAR: base parcial
const updateClasificacionSchema = clasificacionBaseSchema.partial();

// Schema para QUERY
const listClasificacionSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(["nombre", "createdAt", "updatedAt"]).default("createdAt"),
  sortOrder: z.enum(["ASC", "DESC"]).default("DESC"),
  search: z.string().optional(),
});

module.exports = {
  createClasificacionSchema,
  updateClasificacionSchema,
  listClasificacionSchema,
};
