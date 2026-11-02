const { z } = require("zod");

// Schema base para validaciones de Tipomovimiento
const tipomovimientoBaseSchema = z.object({
  movimiento: z
    .string()
    .max(3, "ERROR.TIPOMOVIMIENTO.MOVIMIENTO.MAX_LENGTH")
    .optional()
    .nullable(),
  estadobaja: z.boolean().optional().nullable(),
});

// Schema para CREAR: base con validaciones requeridas
const createTipomovimientoSchema = tipomovimientoBaseSchema.refine(
  (data) => data.movimiento != null && data.movimiento.trim().length > 0,
  {
    message: "ERROR.TIPOMOVIMIENTO.MOVIMIENTO.REQUIRED",
    path: ["movimiento"],
  },
);

// Schema para ACTUALIZAR: base parcial
const updateTipomovimientoSchema = tipomovimientoBaseSchema.partial();

// Schema para QUERY
const listTipomovimientoSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z
    .enum([
      "movimiento",
      "estadobaja",
      "id_tipomovimiento",
      "createdAt",
      "updatedAt",
    ])
    .default("movimiento"),
  sortOrder: z.enum(["ASC", "DESC"]).default("ASC"),
  search: z.string().optional(),
});

module.exports = {
  createTipomovimientoSchema,
  updateTipomovimientoSchema,
  listTipomovimientoSchema,
};
