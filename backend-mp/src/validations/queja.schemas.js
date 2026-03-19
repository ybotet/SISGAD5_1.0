const { z } = require("zod");

// 🔹 Helper: validar que al menos un identificador tenga valor
const alMenosUnIdentificador = (data) =>
  data.id_telefono != null || data.id_linea != null || data.id_pizarra != null;

// 🔹 1. Schema BASE con validaciones de campo + nullable
const quejaBaseSchema = z.object({
  // Identificadores: optional + nullable
  id_telefono: z.number().int().positive().optional().nullable(),
  id_linea: z.number().int().positive().optional().nullable(),
  id_pizarra: z.number().int().positive().optional().nullable(),

  // Relaciones con nomencladores
  id_tipoqueja: z
    .number()
    .int()
    .positive("ERROR.TIPOQUEJA.INVALID")
    .optional()
    .nullable(),
  id_clave: z
    .number()
    .int()
    .positive("ERROR.CLAVE.INVALID")
    .optional()
    .nullable(),

  // Metadatos
  reportado_por: z
    .string()
    .min(2, "ERROR.REPORTANTE.REQUIRED")
    .optional()
    .nullable(),

  // Fecha: si se envía (y no es null), debe ser datetime válido y no futura
  // fecha: z
  //   .string()
  //   .datetime("ERROR.FECHA.FORMAT")
  //   .refine(
  //     (val) => val == null || new Date(val) <= new Date(),
  //     "ERROR.FECHA.FUTURE",
  //   )
  //   .optional()
  //   .nullable(),

  // Campos adicionales
  estado: z
    .enum(["Abierta", "En Proceso", "Pendiente", "Resuelto", "Cerrada"])
    .optional()
    .nullable(),
  prioridad: z.number().int().min(0).max(5).optional().nullable(),
  probador: z.number().int().positive().optional().nullable(),
});

// 🔹 2. Schema para CREAR: base + refinements de negocio
// ✅ Usar 'const' para que exista como variable local
const createQuejaSchema = quejaBaseSchema
  .refine(alMenosUnIdentificador, {
    message: "ERROR.QUEJA.IDENTIFICADOR.REQUIRED",
    path: ["id_telefono"],
  })
  .refine((data) => data.id_clave == null || data.fecha != null, {
    message: "ERROR.FECHA.REQUIRED_WITH_CLAVE",
    path: ["fecha"],
  });

// 🔹 3. Schema para ACTUALIZAR: base parcial
const updateQuejaSchema = quejaBaseSchema.partial();

// 🔹 4. Schema para QUERY
const listQuejaSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  sortBy: z
    .enum(["fecha", "num_reporte", "prioridad", "estado"])
    .default("fecha"),
  sortOrder: z.enum(["ASC", "DESC"]).default("DESC"),
  search: z.string().optional(),
  estado: z
    .enum(["Abierta", "En Proceso", "Pendiente", "Resuelto", "Cerrada"])
    .optional(),
  id_tipoqueja: z.coerce.number().int().optional().nullable(),
  fecha_desde: z.string().datetime().optional().nullable(),
  fecha_hasta: z.string().datetime().optional().nullable(),
});

// ✅ Exportar correctamente (las variables SÍ existen en este ámbito)
module.exports = {
  createQuejaSchema,
  updateQuejaSchema,
  listQuejaSchema,
};
