const { z } = require("zod");

// Schema base para validaciones de Linea
const lineaBaseSchema = z.object({
  clavelinea: z
    .string()
    .max(12, "ERROR.LINEA.CLAVELINEA.MAX_LENGTH")
    .optional()
    .nullable(),
  clave_n: z
    .string()
    .max(12, "ERROR.LINEA.CLAVE_N.MAX_LENGTH")
    .optional()
    .nullable(),
  codificacion: z
    .string()
    .max(7, "ERROR.LINEA.CODIFICACION.MAX_LENGTH")
    .optional()
    .nullable(),
  hilos: z
    .string()
    .max(2, "ERROR.LINEA.HILOS.MAX_LENGTH")
    .optional()
    .nullable(),
  desde: z
    .string()
    .max(50, "ERROR.LINEA.DESDE.MAX_LENGTH")
    .optional()
    .nullable(),
  dirde: z
    .string()
    .max(50, "ERROR.LINEA.DIRDE.MAX_LENGTH")
    .optional()
    .nullable(),
  distdesde: z
    .number()
    .min(0, "ERROR.LINEA.DISTDESDE.MIN_VALUE")
    .optional()
    .nullable(),
  zd: z.string().max(20, "ERROR.LINEA.ZD.MAX_LENGTH").optional().nullable(),
  hasta: z
    .string()
    .max(50, "ERROR.LINEA.HASTA.MAX_LENGTH")
    .optional()
    .nullable(),
  dirha: z
    .string()
    .max(50, "ERROR.LINEA.DIRHA.MAX_LENGTH")
    .optional()
    .nullable(),
  disthasta: z
    .number()
    .min(0, "ERROR.LINEA.DISTHASTA.MIN_VALUE")
    .optional()
    .nullable(),
  zh: z.string().max(20, "ERROR.LINEA.ZH.MAX_LENGTH").optional().nullable(),
  esbaja: z.boolean().optional().nullable(),
  facturado: z
    .string()
    .max(60, "ERROR.LINEA.FACTURADO.MAX_LENGTH")
    .optional()
    .nullable(),
  sector: z
    .string()
    .max(2, "ERROR.LINEA.SECTOR.MAX_LENGTH")
    .optional()
    .nullable(),
  id_senalizacion: z
    .number()
    .int()
    .positive("ERROR.SENALIZACION.INVALID")
    .optional()
    .nullable(),
  id_tipolinea: z
    .number()
    .int()
    .positive("ERROR.TIPOLINEA.INVALID")
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
const createLineaSchema = lineaBaseSchema.refine(
  (data) => data.clavelinea != null && data.clavelinea.trim().length > 0,
  {
    message: "ERROR.LINEA.CLAVELINEA.REQUIRED",
    path: ["clavelinea"],
  },
);

// Schema para ACTUALIZAR: base parcial
const updateLineaSchema = lineaBaseSchema.partial();

// Schema para QUERY
const listLineaSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(10000).default(10),
  sortBy: z
    .enum(["clavelinea", "clave_n", "codificacion", "createdAt", "updatedAt"])
    .default("createdAt"),
  sortOrder: z.enum(["ASC", "DESC"]).default("DESC"),
  search: z.string().optional(),
  id_senalizacion: z.coerce.number().int().optional().nullable(),
  id_tipolinea: z.coerce.number().int().optional().nullable(),
  id_propietario: z.coerce.number().int().optional().nullable(),
});

module.exports = {
  createLineaSchema,
  updateLineaSchema,
  listLineaSchema,
};
