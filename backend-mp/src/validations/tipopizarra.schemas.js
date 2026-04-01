const { z } = require("zod");

// Schema base para validaciones de Tipopizarra
const tipopizarraBaseSchema = z.object({
  tipo: z
    .string()
    .max(20, "ERROR.TIPOPIZARRA.TIPO.MAX_LENGTH")
    .optional()
    .nullable(),
  id_clasifpizarra: z.number().int().positive().optional().nullable(),
});

// Schema para CREAR: base con validaciones requeridas
const createTipopizarraSchema = tipopizarraBaseSchema
  .refine((data) => data.tipo != null && data.tipo.trim().length > 0, {
    message: "ERROR.TIPOPIZARRA.TIPO.REQUIRED",
    path: ["tipo"],
  })
  .refine(
    (data) => data.id_clasifpizarra != null && data.id_clasifpizarra > 0,
    {
      message: "ERROR.TIPOPIZARRA.ID_CLASIFPIZARRA.REQUIRED",
      path: ["id_clasifpizarra"],
    },
  );

// Schema para ACTUALIZAR: base parcial
const updateTipopizarraSchema = tipopizarraBaseSchema.partial();

// Schema para QUERY
const listTipopizarraSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(500).default(10),
  sortBy: z
    .enum([
      "tipo",
      "id_clasifpizarra",
      "id_tipopizarra",
      "createdAt",
      "updatedAt",
    ])
    .default("createdAt"),
  sortOrder: z.enum(["ASC", "DESC"]).default("DESC"),
  search: z.string().optional(),
});

module.exports = {
  createTipopizarraSchema,
  updateTipopizarraSchema,
  listTipopizarraSchema,
};
