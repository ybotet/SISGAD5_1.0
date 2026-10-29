const request = require("supertest");
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

// Mock database and models
jest.mock("../src/shared/config/database", () => ({
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
  update: jest.fn(),
  destroy: jest.fn(),
  belongsTo: jest.fn().mockReturnThis(),
  belongsToMany: jest.fn().mockReturnThis(),
  hasMany: jest.fn().mockReturnThis(),
  hasOne: jest.fn().mockReturnThis(),
  toJSON: jest.fn(),
});

jest.mock("../src/features/user/user.model", () => () => createMockModel());
jest.mock("../src/features/rol/rol.model", () => () => createMockModel());
jest.mock("../src/features/permiso/permiso.model", () => () => createMockModel());
jest.mock("../src/features/roles_permiso/roles_permiso.model", () => () => createMockModel());
jest.mock("../src/features/user_rol/user_rol.model", () => () => createMockModel());
jest.mock("../src/features/auth/refresh_token.model", () => {
  const mockRefreshTokenModel = jest.fn();
  // When called as mock(sequelize), return the model itself (with static methods)
  mockRefreshTokenModel.mockImplementation(() => mockRefreshTokenModel);
  mockRefreshTokenModel.belongsTo = jest.fn().mockReturnThis();
  mockRefreshTokenModel.hasMany = jest.fn().mockReturnThis();
  mockRefreshTokenModel.findOne = jest.fn();
  mockRefreshTokenModel.findByPk = jest.fn();
  mockRefreshTokenModel.create = jest.fn();
  mockRefreshTokenModel.hashToken = (token) => require("crypto").createHash("sha256").update(token).digest("hex");
  return mockRefreshTokenModel;
});

process.env.JWT_SECRET = "00f7d9f46b0fe16ff92419e9f0f8ee0510d6249374a267e68dd071851808b38e";
process.env.JWT_EXPIRES_IN = "15m";
process.env.JWT_REFRESH_EXPIRES_IN = "7d";
process.env.DB_HOST = "localhost";
process.env.DB_PORT = "5432";
process.env.DB_USER = "postgres";
process.env.DB_PASSWORD = "test_password_12345678";
process.env.USERS_DB_NAME = "bd_sisgad5_users";
process.env.NODE_ENV = "test";

const { generateAccessToken, generateRefreshToken } = require("../src/shared/config/jwt");
const { RefreshToken } = require("../src/features");
const app = require("../src/server");

describe("Health endpoints", () => {
  it("GET /health returns 200 with UP status", async () => {
    const res = await request(app).get("/health");
    expect(res.status).toBe(200);
    expect(res.body.status).toBe("UP");
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

  it("POST /api/auth/login rejects invalid email format", async () => {
    const res = await request(app).post("/api/auth/login").send({
      email: "not-an-email",
      password: "Test123!",
    });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe("Refresh token flow", () => {
  it("POST /api/auth/refresh rejects empty body", async () => {
    const res = await request(app).post("/api/auth/refresh").send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/auth/refresh rejects missing refreshToken", async () => {
    const res = await request(app).post("/api/auth/refresh").send({ other: "data" });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/auth/logout exists and rejects empty body", async () => {
    const res = await request(app).post("/api/auth/logout").send({});
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });

  it("POST /api/auth/logout rejects missing refreshToken", async () => {
    const res = await request(app).post("/api/auth/logout").send({ other: "data" });
    expect(res.status).toBe(400);
    expect(res.body.success).toBe(false);
  });
});

describe("JWT token handling", () => {
  it("generateAccessToken creates valid token with 15m expiry", () => {
    const token = generateAccessToken({ id: 99, email: "test@example.com" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.id).toBe(99);
    expect(decoded.email).toBe("test@example.com");
    expect(decoded.exp - decoded.iat).toBeLessThanOrEqual(1000); // ~15min = 900s
  });

  it("generateRefreshToken creates valid token with 7d expiry", () => {
    const token = generateRefreshToken({ id: 99, email: "test@example.com" });
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    expect(decoded.id).toBe(99);
    expect(decoded.email).toBe("test@example.com");
    expect(decoded.exp - decoded.iat).toBeGreaterThan(600000); // > ~7days in seconds
  });

  it("Token verification fails with wrong secret", () => {
    const token = jwt.sign({ id: 1 }, "wrong-secret", { expiresIn: "1h" });
    expect(() => jwt.verify(token, process.env.JWT_SECRET)).toThrow();
  });

  it("RefreshToken.hashToken produces SHA-256 hash", () => {
    const token = "test-token-12345";
    const hash = RefreshToken.hashToken(token);
    expect(typeof hash).toBe("string");
    expect(hash.length).toBe(64); // SHA-256 hex = 64 chars
    expect(hash).not.toBe(token); // not plaintext
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
