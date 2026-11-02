const { z } = require("zod");

// Schema base para validaciones de Trabajador
const trabajadorBaseSchema = z.object({
  clave_trabajador: z
    .string()
    .max(10, "ERROR.TRABAJADOR.CLAVE_TRABAJADOR.MAX_LENGTH")
    .optional()
    .nullable(),
  id_operario_v: z
    .string()
    .max(10, "ERROR.TRABAJADOR.ID_OPERARIO_V.MAX_LENGTH")
    .optional()
    .nullable(),
  nombre: z
    .string()
    .max(18, "ERROR.TRABAJADOR.NOMBRE.MAX_LENGTH")
    .optional()
    .nullable(),
  cargo: z
    .string()
    .max(40, "ERROR.TRABAJADOR.CARGO.MAX_LENGTH")
    .optional()
    .nullable(),
  id_grupow: z.number().int().positive().optional().nullable(),
  activo: z.boolean().optional().nullable(),
});

// Schema para CREAR: base con validaciones requeridas
const createTrabajadorSchema = trabajadorBaseSchema
  .refine(
    (data) =>
      data.clave_trabajador != null && data.clave_trabajador.trim().length > 0,
    {
      message: "ERROR.TRABAJADOR.CLAVE_TRABAJADOR.REQUIRED",
      path: ["clave_trabajador"],
    },
  )
  .refine((data) => data.nombre != null && data.nombre.trim().length > 0, {
    message: "ERROR.TRABAJADOR.NOMBRE.REQUIRED",
    path: ["nombre"],
  })
  .refine((data) => data.cargo != null && data.cargo.trim().length > 0, {
    message: "ERROR.TRABAJADOR.CARGO.REQUIRED",
    path: ["cargo"],
  })
  .refine((data) => data.id_grupow != null && data.id_grupow > 0, {
    message: "ERROR.TRABAJADOR.ID_GRUPOW.REQUIRED",
    path: ["id_grupow"],
  });

// Schema para ACTUALIZAR: base parcial
const updateTrabajadorSchema = trabajadorBaseSchema.partial();

// Schema para QUERY
const listTrabajadorSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(10000).default(10),
  sortBy: z
    .enum([
      "clave_trabajador",
      "nombre",
      "cargo",
      "id_grupow",
      "activo",
      "id_trabajador",
      "createdAt",
      "updatedAt",
    ])
    .default("createdAt"),
  sortOrder: z.enum(["ASC", "DESC"]).default("DESC"),
  search: z.string().optional(),
});

module.exports = {
  createTrabajadorSchema,
  updateTrabajadorSchema,
  listTrabajadorSchema,
};
