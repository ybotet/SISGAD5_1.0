const { z } = require("zod");

// Schema base para validaciones de Pizarra
const pizarraBaseSchema = z.object({
  nombre: z
    .string()
    .min(1, "ERROR.PIZARRA.NOMBRE.REQUIRED")
    .optional()
    .nullable(),
  direccion: z
    .string()
    .min(1, "ERROR.PIZARRA.DIRECCION.REQUIRED")
    .optional()
    .nullable(),
  observacion: z.string().optional().nullable(),
  id_tipopizarra: z
    .number()
    .int()
    .positive("ERROR.TIPOPIZARRA.INVALID")
    .optional()
    .nullable(),
});

// Schema para CREAR: base con validaciones requeridas
const createPizarraSchema = pizarraBaseSchema.refine(
  (data) => data.nombre != null && data.nombre.trim().length > 0,
  {
    message: "ERROR.PIZARRA.NOMBRE.REQUIRED",
    path: ["nombre"],
  },
);

// Schema para ACTUALIZAR: base parcial
const updatePizarraSchema = pizarraBaseSchema.partial();

// Schema para QUERY
const listPizarraSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(1000).default(10),
  sortBy: z
    .enum(["nombre", "direccion", "createdAt", "updatedAt"])
    .default("updatedAt"),
  sortOrder: z.enum(["ASC", "DESC"]).default("DESC"),
  search: z.string().optional(),
  id_tipopizarra: z.coerce.number().int().optional().nullable(),
});

module.exports = {
  createPizarraSchema,
  updatePizarraSchema,
  listPizarraSchema,
};
