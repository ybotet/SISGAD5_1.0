const { z } = require("zod");

// Schema base para validaciones de Propietario
const propietarioBaseSchema = z.object({
  nombre: z
    .string()
    .min(1, "ERROR.PROPIETARIO.NOMBRE.REQUIRED")
    .max(255, "ERROR.PROPIETARIO.NOMBRE.MAX_LENGTH")
    .regex(/^[a-zA-Z0-9\s]+$/i, "ERROR.PROPIETARIO.NOMBRE.INVALID_CHARS")
    .optional()
    .nullable(),
});

// Schema para CREAR: base con validaciones requeridas
const createPropietarioSchema = propietarioBaseSchema.refine(
  (data) => data.nombre != null && data.nombre.trim().length > 0,
  {
    message: "ERROR.PROPIETARIO.NOMBRE.REQUIRED",
    path: ["nombre"],
  },
);

// Schema para ACTUALIZAR: base parcial
const updatePropietarioSchema = propietarioBaseSchema.partial();

// Schema para QUERY
const listPropietarioSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(["nombre", "createdAt", "updatedAt"]).default("createdAt"),
  sortOrder: z.enum(["ASC", "DESC"]).default("DESC"),
  search: z.string().optional(),
});

module.exports = {
  createPropietarioSchema,
  updatePropietarioSchema,
  listPropietarioSchema,
};
