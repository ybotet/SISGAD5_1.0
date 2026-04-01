const { z } = require("zod");

// Schema base para validaciones de Recorrido
const recorridoBaseSchema = z.object({
  numero: z.number().int().positive().optional().nullable(),
  par: z
    .string()
    .max(6, "ERROR.RECORRIDO.PAR.MAX_LENGTH")
    .optional()
    .nullable(),
  terminal: z
    .string()
    .max(12, "ERROR.RECORRIDO.TERMINAL.MAX_LENGTH")
    .optional()
    .nullable(),
  de: z.string().max(4, "ERROR.RECORRIDO.DE.MAX_LENGTH").optional().nullable(),
  a: z.string().max(4, "ERROR.RECORRIDO.A.MAX_LENGTH").optional().nullable(),
  dirter: z
    .string()
    .max(30, "ERROR.RECORRIDO.DIRTER.MAX_LENGTH")
    .optional()
    .nullable(),
  soporte: z
    .string()
    .max(50, "ERROR.RECORRIDO.SOPORTE.MAX_LENGTH")
    .optional()
    .nullable(),
  canal: z
    .string()
    .max(50, "ERROR.RECORRIDO.CANAL.MAX_LENGTH")
    .optional()
    .nullable(),
  id_telefono: z.number().int().positive().optional().nullable(),
  id_linea: z.number().int().positive().optional().nullable(),
  id_propietario: z.number().int().positive().optional().nullable(),
  id_planta: z.number().int().positive().optional().nullable(),
  id_cable: z.number().int().positive().optional().nullable(),
  id_sistema: z.number().int().positive().optional().nullable(),
});

// Schema para CREAR: base con validaciones requeridas
const createRecorridoSchema = recorridoBaseSchema.refine(
  (data) =>
    data.numero != null && data.id_planta != null && data.id_cable != null,
  {
    message: "ERROR.RECORRIDO.NUMERO.REQUIRED",
    path: ["numero"],
  },
);

// Schema para ACTUALIZAR: base parcial
const updateRecorridoSchema = recorridoBaseSchema.partial();

// Schema para QUERY
const listRecorridoSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z
    .enum([
      "numero",
      "par",
      "terminal",
      "de",
      "a",
      "dirter",
      "soporte",
      "canal",
      "createdAt",
      "updatedAt",
    ])
    .default("createdAt"),
  sortOrder: z.enum(["ASC", "DESC"]).default("DESC"),
  search: z.string().optional(),
});

module.exports = {
  createRecorridoSchema,
  updateRecorridoSchema,
  listRecorridoSchema,
};
