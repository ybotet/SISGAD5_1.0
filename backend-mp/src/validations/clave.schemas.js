const { z } = require("zod");

// Schema base para validaciones de Clave
const claveBaseSchema = z.object({
  clave: z.string().max(8, "ERROR.CLAVE.CLAVE.MAX_LENGTH").optional().nullable(),
  descripcion: z.string().max(25, "ERROR.CLAVE.DESCRIPCION.MAX_LENGTH").optional().nullable(),
  valor_p: z.number().min(0, "ERROR.CLAVE.VALOR_P.MIN_VALUE").optional().nullable(),
  id_clasificadorclave: z
    .number()
    .int()
    .positive("ERROR.CLASIFICADORCLAVE.INVALID")
    .optional()
    .nullable(),
  es_pendiente: z.boolean().optional().nullable(),
});

// Schema para CREAR: base con validaciones requeridas
const createClaveSchema = claveBaseSchema.refine(
  (data) => data.clave != null && data.clave.trim().length > 0,
  {
    message: "ERROR.CLAVE.CLAVE.REQUIRED",
    path: ["clave"],
  },
);

// Schema para ACTUALIZAR: base parcial
const updateClaveSchema = claveBaseSchema.partial();

// Schema para QUERY
const listClaveSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(1000).default(10),
  sortBy: z.enum(["clave", "descripcion", "createdAt", "updatedAt"]).default("createdAt"),
  sortOrder: z.enum(["ASC", "DESC"]).default("DESC"),
  search: z.string().optional(),
  id_clasificadorclave: z.coerce.number().int().optional().nullable(),
});

module.exports = {
  createClaveSchema,
  updateClaveSchema,
  listClaveSchema,
};
