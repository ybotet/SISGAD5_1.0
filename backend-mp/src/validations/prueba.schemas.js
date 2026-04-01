const { z } = require("zod");

// Schema base para validaciones de Prueba
const pruebaBaseSchema = z.object({
  fecha: z
    .string()
    .optional()
    .nullable()
    .refine(
      (val) => {
        if (val == null) return true; // null/undefined es válido
        const date = new Date(val);
        return !isNaN(date.getTime());
      },
      { message: "ERROR.PRUEBA.FECHA.INVALID_DATE" },
    ),
  id_resultado: z.number().int().positive().optional().nullable(),
  id_trabajador: z.number().int().positive().optional().nullable(),
  id_cable: z.number().int().positive().optional().nullable(),
  id_clave: z.number().int().positive().optional().nullable(),
  id_queja: z.number().int().positive().optional().nullable(),
});

// Schema para CREAR: base con validaciones requeridas
const createPruebaSchema = pruebaBaseSchema.refine(
  (data) => data.id_queja != null && data.id_clave != null,
  {
    message: "ERROR.PRUEBA.ID_QUEJA.REQUIRED",
    path: ["id_queja"],
  },
);

// Schema para ACTUALIZAR: base parcial
const updatePruebaSchema = pruebaBaseSchema.partial();

// Schema para QUERY
const listPruebaSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z.enum(["fecha", "createdAt", "updatedAt"]).default("createdAt"),
  sortOrder: z.enum(["ASC", "DESC"]).default("ASC"),
  search: z.string().optional(),
});

module.exports = {
  createPruebaSchema,
  updatePruebaSchema,
  listPruebaSchema,
};
