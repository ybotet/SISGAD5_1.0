const { z } = require("zod");

const createRolSchema = z.object({
  nombre: z.enum(["admin", "probador", "editor", "visor", "admin_materiales"]),
  descripcion: z.string().max(500).optional(),
  activo: z.boolean().optional(),
});

const updateRolSchema = createRolSchema.partial();

const listRolSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(1000).default(10),
  search: z.string().optional(),
});

module.exports = {
  createRolSchema,
  updateRolSchema,
  listRolSchema,
};
