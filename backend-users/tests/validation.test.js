// tests/validation.test.js — TASK-800-01: Cobertura de validaciones Zod (auth + user)
const {
  loginSchema,
  refreshSchema,
  logoutSchema,
  passwordChangeSchema,
} = require("../src/features/auth/auth.validation");
const {
  createUserSchema,
  updateUserSchema,
  listUserSchema,
  getUserSchema,
} = require("../src/features/user/user.validation");

const checkValid = (schema, data) => {
  const result = schema.safeParse(data);
  return { ok: result.success, error: result.success ? null : result.error };
};

describe("auth.validation.js", () => {
  describe("loginSchema", () => {
    it("acepta email y password válidos", () => {
      const { ok } = checkValid(loginSchema, {
        email: "a@test.com",
        password: "Pass123!",
      });
      expect(ok).toBe(true);
    });

    it("rechaza email inválido", () => {
      const { ok } = checkValid(loginSchema, {
        email: "no-email",
        password: "Pass123!",
      });
      expect(ok).toBe(false);
    });

    it("rechaza password vacío", () => {
      const { ok } = checkValid(loginSchema, {
        email: "a@test.com",
        password: "",
      });
      expect(ok).toBe(false);
    });

    it("rechaza campos faltantes", () => {
      const { ok } = checkValid(loginSchema, { email: "a@test.com" });
      expect(ok).toBe(false);
    });
  });

  describe("refreshSchema", () => {
    it("acepta refreshToken válido", () => {
      const { ok } = checkValid(refreshSchema, { refreshToken: "abc123def456" });
      expect(ok).toBe(true);
    });

    it("rechaza refreshToken vacío", () => {
      const { ok } = checkValid(refreshSchema, { refreshToken: "" });
      expect(ok).toBe(false);
    });
  });

  describe("logoutSchema", () => {
    it("acepta refreshToken", () => {
      const { ok } = checkValid(logoutSchema, { refreshToken: "abc123" });
      expect(ok).toBe(true);
    });
  });

  describe("passwordChangeSchema", () => {
    it("acepta contraseñas válidas", () => {
      const { ok } = checkValid(passwordChangeSchema, {
        password_actual: "OldPass123!",
        password_nueva: "NewPass123!",
      });
      expect(ok).toBe(true);
    });

    it("rechaza nueva contraseña débil", () => {
      const { ok } = checkValid(passwordChangeSchema, {
        password_actual: "OldPass123!",
        password_nueva: "123",
      });
      expect(ok).toBe(false);
    });

    it("rechaza password_actual vacío", () => {
      const { ok } = checkValid(passwordChangeSchema, {
        password_actual: "",
        password_nueva: "NewPass123!",
      });
      expect(ok).toBe(false);
    });
  });
});

describe("user.validation.js", () => {
  describe("createUserSchema", () => {
    it("acepta datos válidos de creación", () => {
      const { ok } = checkValid(createUserSchema, {
        email: "nuevo@test.com",
        password: "Pass123!",
        nombre: "Juan",
        apellidos: "Pérez",
      });
      expect(ok).toBe(true);
    });

    it("rechaza email inválido", () => {
      const { ok } = checkValid(createUserSchema, {
        email: "no-email",
        password: "Pass123!",
        nombre: "Juan",
        apellidos: "Pérez",
      });
      expect(ok).toBe(false);
    });

    it("rechaza password débil", () => {
      const { ok } = checkValid(createUserSchema, {
        email: "a@test.com",
        password: "123",
        nombre: "Juan",
        apellidos: "Pérez",
      });
      expect(ok).toBe(false);
    });

    it("rechaza campos obligatorios faltantes", () => {
      const { ok } = checkValid(createUserSchema, {
        email: "a@test.com",
        password: "Pass123!",
      });
      expect(ok).toBe(false);
    });
  });

  describe("updateUserSchema", () => {
    it("acepta actualización parcial", () => {
      const { ok } = checkValid(updateUserSchema, {
        nombre: "Juan",
        apellidos: "Pérez",
      });
      expect(ok).toBe(true);
    });

    it("acepta objeto vacío (actualización opcional)", () => {
      const { ok } = checkValid(updateUserSchema, {});
      expect(ok).toBe(true);
    });
  });

  describe("listUserSchema", () => {
    it("acepta paginación y search válidos", () => {
      const { ok } = checkValid(listUserSchema, {
        page: "1",
        limit: "10",
        search: "Juan",
      });
      expect(ok).toBe(true);
    });

    it("rechaza page no numérico", () => {
      const { ok } = checkValid(listUserSchema, { page: "abc" });
      expect(ok).toBe(false);
    });
  });

  describe("getUserSchema", () => {
    it("acepta id numérico válido", () => {
      const { ok } = checkValid(getUserSchema, { id: "42" });
      expect(ok).toBe(true);
    });

    it("rechaza id no numérico", () => {
      const { ok } = checkValid(getUserSchema, { id: "abc" });
      expect(ok).toBe(false);
    });
  });
});