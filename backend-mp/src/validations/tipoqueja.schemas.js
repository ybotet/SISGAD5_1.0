const { z } = require("zod");

// Schema base para validaciones de Tipoqueja
const tipoquejaBaseSchema = z.object({
  tipoqueja: z.string().optional().nullable(),
  servicio: z.string().optional().nullable(),
});

// Schema para CREAR: base con validaciones requeridas
const createTipoquejaSchema = tipoquejaBaseSchema.refine(
  (data) => data.tipoqueja != null && data.tipoqueja.trim().length > 0,
  {
    message: "ERROR.TIPOQUEJA.TIPOQUEJA.REQUIRED",
    path: ["tipoqueja"],
  },
);

// Schema para ACTUALIZAR: base parcial
const updateTipoquejaSchema = tipoquejaBaseSchema.partial();

// Schema para QUERY
const listTipoquejaSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z
    .enum(["tipoqueja", "servicio", "id_tipoqueja", "createdAt", "updatedAt"])
    .default("createdAt"),
  sortOrder: z.enum(["ASC", "DESC"]).default("DESC"),
  search: z.string().optional(),
});

module.exports = {
  createTipoquejaSchema,
  updateTipoquejaSchema,
  listTipoquejaSchema,
};
