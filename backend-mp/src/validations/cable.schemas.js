const { z } = require("zod");

// Schema base para validaciones de Cable
const cableBaseSchema = z.object({
  numero: z
    .string()
    .max(13, "ERROR.CABLE.NUMERO.MAX_LENGTH")
    .optional()
    .nullable(),
  direccion: z
    .string()
    .max(60, "ERROR.CABLE.DIRECCION.MAX_LENGTH")
    .optional()
    .nullable(),
  id_propietario: z
    .number()
    .int()
    .positive("ERROR.PROPIETARIO.INVALID")
    .optional()
    .nullable(),
});

// Schema para CREAR: base con validaciones requeridas
const createCableSchema = cableBaseSchema.refine(
  (data) => data.numero != null && data.numero.trim().length > 0,
  {
    message: "ERROR.CABLE.NUMERO.REQUIRED",
    path: ["numero"],
  },
);

// Schema para ACTUALIZAR: base parcial
const updateCableSchema = cableBaseSchema.partial();

// Schema para QUERY
const listCableSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z
    .enum(["numero", "direccion", "createdAt", "updatedAt"])
    .default("createdAt"),
  sortOrder: z.enum(["ASC", "DESC"]).default("DESC"),
  search: z.string().optional(),
  id_propietario: z.coerce.number().int().optional().nullable(),
});

module.exports = {
  createCableSchema,
  updateCableSchema,
  listCableSchema,
};
