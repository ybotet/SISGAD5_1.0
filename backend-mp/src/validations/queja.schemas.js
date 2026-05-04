const { z } = require("zod");

// Helper: validar que al menos un identificador tenga valor
const alMenosUnIdentificador = (data) =>
  data.id_telefono != null || data.id_linea != null || data.id_pizarra != null;

// Helper para validar fecha futura considerando solo la fecha (sin hora)
const noEsFutura = (fechaStr) => {
  if (!fechaStr) return true;

  // Parsear la fecha correctamente
  let fecha;
  if (fechaStr.includes("Z") || fechaStr.includes("+")) {
    fecha = new Date(fechaStr);
  } else {
    // Para formatos como "2025-04-01T15:30:00" o "2025-04-01T15:30"
    fecha = new Date(fechaStr.replace("T", " "));
  }

  if (isNaN(fecha.getTime())) return true;

  // Comparar solo la fecha (sin hora) para evitar problemas de zona horaria
  const hoy = new Date();
  const fechaComparar = new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
  const hoyComparar = new Date(hoy.getFullYear(), hoy.getMonth(), hoy.getDate());

  return fechaComparar <= hoyComparar;
};

// 1. Schema BASE con validaciones de campo + nullable
const quejaBaseSchema = z.object({
  // Identificadores: optional + nullable
  id_telefono: z.number().int().positive().optional().nullable(),
  id_linea: z.number().int().positive().optional().nullable(),
  id_pizarra: z.number().int().positive().optional().nullable(),

  // Relaciones con nomencladores
  id_tipoqueja: z.number().int().positive("ERROR.TIPOQUEJA.INVALID").optional().nullable(),
  id_clave: z.number().int().positive("ERROR.CLAVE.INVALID").optional().nullable(),

  // NUEVO: Clave de cierre (solo para cerrar queja)
  id_clavecierre: z.number().int().positive("ERROR.CLAVE.INVALID").optional().nullable(),

  // Metadatos
  reportado_por: z.string().min(2, "ERROR.REPORTANTE.REQUIRED").optional().nullable(),

  // Fecha: más flexible - acepta múltiples formatos
  fecha: z
    .string()
    // .regex(/^\d{4}-\d{2}-\d{2}(T\d{2}:\d{2}(:\d{2}(\.\d{3}Z?)?)?)?$/, "ERROR.FECHA.FORMAT")
    // O usa este pattern más simple que acepta cualquier formato ISO
    // .regex(/^\d{4}-\d{2}-\d{2}(T.*)?$/, "ERROR.FECHA.FORMAT")
    // .refine((val) => val == null || new Date(val) <= new Date(), "ERROR.FECHA.FUTURE")
    .optional()
    .nullable(),

  fechaok: z.coerce.date().optional().nullable(),

  // Campos adicionales
  estado: z
    .enum(["Abierta", "Probada", "Pendiente", "Asignada", "Resuelta", "Cerrada"])
    .optional()
    .nullable(),
  prioridad: z.number().int().min(0).max(5).optional().nullable(),
  probador: z.number().int().positive().optional().nullable(),
});

// 2. Schema para CREAR: base + refinements de negocio
const createQuejaSchema = quejaBaseSchema
  .refine(alMenosUnIdentificador, {
    message: "ERROR.QUEJA.IDENTIFICADOR.REQUIRED",
    path: ["id_telefono"],
  })
  .refine(
    (data) => {
      // Si hay id_clave, entonces fecha es requerida
      if (data.id_clave && !data.fecha) {
        return false;
      }
      return true;
    },
    {
      message: "ERROR.FECHA.REQUIRED_WITH_CLAVE",
      path: ["fecha"],
    },
  );

// 3. Schema para ACTUALIZAR: base parcial
const updateQuejaSchema = quejaBaseSchema.partial();

// 4. Schema para QUERY
const listQuejaSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(1000000).default(10),
  sortBy: z.enum(["fecha", "num_reporte", "prioridad", "estado"]).default("fecha"),
  sortOrder: z.enum(["ASC", "DESC"]).default("DESC"),
  search: z.string().optional(),
  estado: z.enum(["Abierta", "Probada", "Pendiente", "Asignada", "Resuelta", "Cerrada"]).optional(),
  id_tipoqueja: z.coerce.number().int().optional().nullable(),
  fecha_desde: z.string().datetime().optional().nullable(),
  fecha_hasta: z.string().datetime().optional().nullable(),
});

const cerrarQuejaSchema = z.object({
  id_clavecierre: z.number().int().positive("ERROR.CLAVE.INVALID"),
  fechaok: z.coerce.date(),
});

module.exports = {
  createQuejaSchema,
  updateQuejaSchema,
  listQuejaSchema,
  cerrarQuejaSchema,
};
