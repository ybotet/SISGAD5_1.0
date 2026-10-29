const { z } = require("zod");

const loginSchema = z.object({
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
});

const refreshSchema = z.object({
  refreshToken: z.string().min(1, "ERROR.REFRESH_TOKEN.REQUIRED"),
});

const logoutSchema = z.object({
  refreshToken: z.string().min(1, "ERROR.REFRESH_TOKEN.REQUIRED"),
});

module.exports = {
  loginSchema,
  refreshSchema,
  logoutSchema,
};
