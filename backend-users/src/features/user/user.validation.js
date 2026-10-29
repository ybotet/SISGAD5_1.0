const { z } = require("zod");

const createUserSchema = z.object({
  email: z
    .string()
    .email("ERROR.EMAIL.INVALID")
    .max(254, "ERROR.EMAIL.TOO_LONG"),
  password: z
    .string()
    .min(8, "ERROR.PASSWORD.TOO_SHORT")
    .max(128, "ERROR.PASSWORD.TOO_LONG")
    .refine((val) => !/\s/.test(val), "ERROR.PASSWORD.NO_SPACES")
    .refine(
      (val) => /[a-z]/.test(val) && /[A-Z]/.test(val) && /[0-9]/.test(val),
      "ERROR.PASSWORD.REQUIREMENTS",
    ),
  nombre: z
    .string()
    .min(1, "ERROR.NOMBRE.REQUIRED")
    .max(100, "ERROR.NOMBRE.TOO_LONG"),
  apellidos: z
    .string()
    .min(1, "ERROR.APELLIDOS.REQUIRED")
    .max(100, "ERROR.APELLIDOS.TOO_LONG"),
  roles: z
    .array(z.number().int().positive())
    .optional(),
  activo: z.boolean().optional(),
});

const updateUserSchema = createUserSchema.partial();

const listUserSchema = z.object({
  page: z.coerce.number().int().positive().default(1),
  limit: z.coerce.number().int().min(1).max(1000).default(10),
  search: z.string().optional(),
});

const getUserSchema = z.object({
  id: z.coerce.number().int().positive(),
});

module.exports = {
  createUserSchema,
  updateUserSchema,
  listUserSchema,
  getUserSchema,
};
