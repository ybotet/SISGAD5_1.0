const { z } = require("zod");

// Schema base para validaciones de Telefono
const telefonoBaseSchema = z.object({
  telefono: z
    .string()
    .min(6, "ERROR.TELEFONO.TELEFONO.MIN_LENGTH")
    .max(12, "ERROR.TELEFONO.TELEFONO.MAX_LENGTH")
    .regex(/^[0-9+\-\s()]+$/, "ERROR.TELEFONO.TELEFONO.INVALID_FORMAT")
    .optional()
    .nullable(),
  nombre: z
    .string()
    .max(30, "ERROR.TELEFONO.NOMBRE.MAX_LENGTH")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s]+$/, "ERROR.TELEFONO.NOMBRE.INVALID_FORMAT")
    .optional()
    .nullable(),
  direccion: z
    .string()
    .max(50, "ERROR.TELEFONO.DIRECCION.MAX_LENGTH")
    .optional()
    .nullable(),
  lic: z
    .string()
    .max(50, "ERROR.TELEFONO.LIC.MAX_LENGTH")
    .optional()
    .nullable(),
  zona: z
    .string()
    .max(20, "ERROR.TELEFONO.ZONA.MAX_LENGTH")
    .optional()
    .nullable(),
  esbaja: z.boolean().optional().nullable(),
  extensiones: z.number().int().nonnegative().optional().nullable(),
  facturado: z
    .string()
    .max(60, "ERROR.TELEFONO.FACTURADO.MAX_LENGTH")
    .optional()
    .nullable(),
  sector: z
    .string()
    .max(2, "ERROR.TELEFONO.SECTOR.MAX_LENGTH")
    .optional()
    .nullable(),
  id_mando: z.number().int().positive().optional().nullable(),
  id_clasificacion: z.number().int().positive().optional().nullable(),
});

// Schema para CREAR: base con validaciones requeridas
const createTelefonoSchema = telefonoBaseSchema.refine(
  (data) => data.telefono != null && data.telefono.trim().length > 0,
  {
    message: "ERROR.TELEFONO.TELEFONO.REQUIRED",
    path: ["telefono"],
  },
);

// Schema para ACTUALIZAR: base parcial
const updateTelefonoSchema = telefonoBaseSchema.partial();

// Schema para QUERY
const listTelefonoSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(10000).default(10),
  sortBy: z
    .enum([
      "telefono",
      "nombre",
      "direccion",
      "lic",
      "zona",
      "esbaja",
      "extensiones",
      "facturado",
      "sector",
      "id_mando",
      "id_clasificacion",
      "createdAt",
      "updatedAt",
    ])
    .default("updatedAt"),
  sortOrder: z.enum(["ASC", "DESC"]).default("DESC"),
  search: z.string().optional(),
});

module.exports = {
  createTelefonoSchema,
  updateTelefonoSchema,
  listTelefonoSchema,
};
