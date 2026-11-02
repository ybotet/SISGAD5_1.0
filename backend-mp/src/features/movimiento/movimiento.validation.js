const { z } = require("zod");

// Schema base para validaciones de Movimiento
const movimientoBaseSchema = z.object({
  id_tipomovimiento: z
    .number()
    .int()
    .positive("ERROR.TIPOMOVIMIENTO.INVALID")
    .optional()
    .nullable(),
  fecha: z
    .string()
    .refine((val) => !isNaN(Date.parse(val)), {
      message: "ERROR.MOVIMIENTO.FECHA.INVALID",
    })
    .optional()
    .nullable(),
  motivo: z
    .string()
    .max(100, "ERROR.MOVIMIENTO.MOTIVO.MAX_LENGTH")
    .optional()
    .nullable(),
  id_os: z.number().int().positive("ERROR.OS.INVALID").optional().nullable(),
  os: z
    .string()
    .max(50, "ERROR.MOVIMIENTO.OS.MAX_LENGTH")
    .optional()
    .nullable(),
  id_telefono: z
    .number()
    .int()
    .positive("ERROR.TELEFONO.INVALID")
    .optional()
    .nullable(),
  id_linea: z
    .number()
    .int()
    .positive("ERROR.LINEA.INVALID")
    .optional()
    .nullable(),
});

// Schema para CREAR: base con validaciones requeridas
const createMovimientoSchema = movimientoBaseSchema.refine(
  (data) => data.id_tipomovimiento != null,
  {
    message: "ERROR.TIPOMOVIMIENTO.REQUIRED",
    path: ["id_tipomovimiento"],
  },
);

// Schema para ACTUALIZAR: base parcial
const updateMovimientoSchema = movimientoBaseSchema.partial();

// Schema para QUERY
const listMovimientoSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z
    .enum(["fecha", "motivo", "createdAt", "updatedAt"])
    .default("createdAt"),
  sortOrder: z.enum(["ASC", "DESC"]).default("DESC"),
  search: z.string().optional(),
  id_tipomovimiento: z.coerce.number().int().optional().nullable(),
  id_telefono: z.coerce.number().int().optional().nullable(),
  id_linea: z.coerce.number().int().optional().nullable(),
});

module.exports = {
  createMovimientoSchema,
  updateMovimientoSchema,
  listMovimientoSchema,
};
