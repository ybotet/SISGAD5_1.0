const { z } = require("zod");

const createRolesPermisoSchema = z.object({
  id_rol: z.number().int().positive(),
  id_permiso: z.number().int().positive(),
});

const listRolesPermisoSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(1000).default(10),
  search: z.string().optional(),
});

module.exports = {
  createRolesPermisoSchema,
  listRolesPermisoSchema,
};
