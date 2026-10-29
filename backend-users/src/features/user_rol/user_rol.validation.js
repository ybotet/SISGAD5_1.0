const { z } = require("zod");

const createUserRolSchema = z.object({
  id_usuario: z.number().int().positive(),
  id_rol: z.number().int().positive(),
});

const listUserRolSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(1000).default(10),
  search: z.string().optional(),
});

module.exports = {
  createUserRolSchema,
  listUserRolSchema,
};
