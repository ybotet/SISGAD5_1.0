const { z } = require("zod");

const createPermisoSchema = z.object({
  nombre: z.string().min(1, "ERROR.NOMBRE.REQUIRED").max(100),
  descripcion: z.string().max(500).optional(),
  modulo: z.string().min(1, "ERROR.MODULO.REQUIRED").max(50),
  accion: z.string().min(1, "ERROR.ACCION.REQUIRED").max(50),
});

const updatePermisoSchema = createPermisoSchema.partial();

const listPermisoSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(1000).default(10),
  search: z.string().optional(),
});

module.exports = {
  createPermisoSchema,
  updatePermisoSchema,
  listPermisoSchema,
};
