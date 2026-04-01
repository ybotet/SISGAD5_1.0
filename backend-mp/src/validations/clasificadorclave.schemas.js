const { z } = require("zod");

// Schema base para validaciones de Clasificadorclave
const clasificadorclaveBaseSchema = z.object({
  clasificador: z
    .string()
    .min(1, "ERROR.CLASIFICADORCLAVE.CLASIFICADOR.REQUIRED")
    .max(255, "ERROR.CLASIFICADORCLAVE.CLASIFICADOR.MAX_LENGTH")
    .optional()
    .nullable(),
});

// Schema para CREAR: base con validaciones requeridas
const createClasificadorclaveSchema = clasificadorclaveBaseSchema.refine(
  (data) => data.clasificador != null && data.clasificador.trim().length > 0,
  {
    message: "ERROR.CLASIFICADORCLAVE.CLASIFICADOR.REQUIRED",
    path: ["clasificador"],
  },
);

// Schema para ACTUALIZAR: base parcial
const updateClasificadorclaveSchema = clasificadorclaveBaseSchema.partial();

// Schema para QUERY
const listClasificadorclaveSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z
    .enum(["clasificador", "createdAt", "updatedAt"])
    .default("clasificador"),
  sortOrder: z.enum(["ASC", "DESC"]).default("ASC"),
  search: z.string().optional(),
});

module.exports = {
  createClasificadorclaveSchema,
  updateClasificadorclaveSchema,
  listClasificadorclaveSchema,
};
