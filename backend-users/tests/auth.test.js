const request = require("supertest");
const jwt = require("jsonwebtoken");

// Mock database and models
jest.mock("../src/config/database", () => ({
  sequelize: {
    authenticate: jest.fn().mockResolvedValue(true),
    sync: jest.fn().mockResolvedValue(true),
    close: jest.fn().mockResolvedValue(true),
  },
  testConnection: jest.fn().mockResolvedValue(true),
}));

const createMockModel = () => ({
  findOne: jest.fn(),
  findByPk: jest.fn(),
  build: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  belongsTo: jest.fn().mockReturnThis(),
  belongsToMany: jest.fn().mockReturnThis(),
  hasMany: jest.fn().mockReturnThis(),
  hasOne: jest.fn().mockReturnThis(),
  toJSON: jest.fn(),
});

jest.mock("../src/models/User", () => () => createMockModel());
jest.mock("../src/models/Rol", () => () => createMockModel());
jest.mock("../src/models/Permiso", () => () => createMockModel());
jest.mock("../src/models/Roles_Permisos", () => () => createMockModel());
jest.mock("../src/models/User_Roles", () => () => createMockModel());

process.env.JWT_SECRET = "00f7d9f46b0fe16ff92419e9f0f8ee0510d6249374a267e68dd071851808b38e";
process.env.DB_NAME = "bd_sisgad5_users";
process.env.NODE_ENV = "test";

const app = require("../src/server");

describe("Health endpoints", () => {
  it("GET /health returns 200 with OK status", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("OK");
  });

  it("GET / returns service info", async () => {
    const res = await request(app).get("/");
    expect(res.status).toBe(200);
    expect(res.body.message).toContain("Usuarios");
  });
});

describe("Auth route structure", () => {
  it("POST /api/auth/login exists and rejects empty body", async () => {
    const res = await request(app).post("/api/auth/login").send({});
    expect([400, 401]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/auth/login rejects missing email", async () => {
    const res = await request(app).post("/api/auth/login").send({ password: "Test123!" });
    expect([400, 401]).toContain(res.status);
    expect(res.body.success).toBe(false);
  });
});

describe("JWT token handling", () => {
  it("Generates valid token with user claims", () => {
    const token = jwt.sign({ id: 99, email: "test@example.com" }, process.env.JWT_SECRET, {
      expiresIn: "24h",
    });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.id).toBe(99);
    expect(decoded.email).toBe("test@example.com");
  });

  it("Token verification fails with wrong secret", () => {
    const token = jwt.sign({ id: 1 }, "wrong-secret", { expiresIn: "1h" });
    expect(() => jwt.verify(token, process.env.JWT_SECRET)).toThrow();
  });
});

describe("Route protection", () => {
  it("GET /api/user without token returns 401", async () => {
    const res = await request(app).get("/api/user");
    expect(res.status).toBe(401);
  });

  it("GET /api/user with invalid token returns 401", async () => {
    const res = await request(app).get("/api/user").set("Authorization", "Bearer invalid.token.here");
    expect(res.status).toBe(401);
  });
});
