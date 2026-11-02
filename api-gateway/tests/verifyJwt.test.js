const express = require("express");
const jwt = require("jsonwebtoken");
const request = require("supertest");
const { requireJwtSecret } = require("../src/config/jwt");
const verifyJwt = require("../src/middleware/verifyJwt");

const JWT_SECRET = "supersecreto_de_prueba_para_tests_minimo_32_chars";

describe("requireJwtSecret (validación de secreto)", () => {
  it("rechaza secreto ausente", () => {
    expect(() => requireJwtSecret(undefined)).toThrow();
    expect(() => requireJwtSecret("")).toThrow();
  });

  it("rechaza secreto menor de 32 caracteres", () => {
    expect(() => requireJwtSecret("secreto")).toThrow();
    expect(() => requireJwtSecret("a".repeat(31))).toThrow();
  });

  it("acepta secreto de 32 caracteres o más", () => {
    const secret = "a".repeat(32);
    expect(requireJwtSecret(secret)).toBe(secret);
  });
});

describe("verifyJwt middleware", () => {
  let app;

  beforeEach(() => {
    process.env.JWT_SECRET = JWT_SECRET;
    app = express();
    app.use(express.json());

    app.get("/health", (req, res) => {
      res.json({ status: "UP", service: "api-gateway" });
    });

    app.use(verifyJwt);

    app.get("/api/users", (req, res) => {
      res.json({ message: "Datos protegidos", user: req.user });
    });
  });

  describe("Rutas públicas", () => {
    it("GET /health retorna 200 sin token", async () => {
      const res = await request(app).get("/health");
      expect(res.status).toBe(200);
      expect(res.body.status).toBe("UP");
    });
  });

  describe("Sin token de acceso", () => {
    it("GET /api/users sin Authorization retorna 401", async () => {
      const res = await request(app).get("/api/users");
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Token de acceso requerido");
    });

    it("GET /api/users con Authorization no Bearer retorna 401", async () => {
      const res = await request(app)
        .get("/api/users")
        .set("Authorization", "Basic abc123");
      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Token de acceso requerido");
    });
  });

  describe("Token inválido o expirado", () => {
    it("GET /api/users con token JWT inválido retorna 401", async () => {
      const token = jwt.sign({ id: 1, email: "test@test.com" }, "wrong_secret", {
        expiresIn: "15m",
      });
      const res = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(401);
      expect(res.body.success).toBe(false);
      expect(res.body.message).toBe("Token inválido o expirado");
    });

    it("GET /api/users con token expirado retorna 401", async () => {
      const token = jwt.sign({ id: 1, email: "test@test.com" }, JWT_SECRET, {
        expiresIn: "-1s",
      });
      const res = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(401);
      expect(res.body.message).toBe("Token inválido o expirado");
    });
  });

  describe("Token válido", () => {
    it("GET /api/users con token válido pasa la verificación", async () => {
      const token = jwt.sign(
        { id: 1, email: "admin@test.com", roles: ["admin"] },
        JWT_SECRET,
        { expiresIn: "15m" },
      );
      const res = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.user).toEqual({
        id: 1,
        email: "admin@test.com",
        roles: ["admin"],
      });
    });

    it("GET /api/users con token válido sin roles propaga array vacío", async () => {
      const token = jwt.sign(
        { id: 2, email: "user@test.com" },
        JWT_SECRET,
        { expiresIn: "15m" },
      );
      const res = await request(app)
        .get("/api/users")
        .set("Authorization", `Bearer ${token}`);
      expect(res.status).toBe(200);
      expect(res.body.user.roles).toEqual([]);
    });
  });
});
