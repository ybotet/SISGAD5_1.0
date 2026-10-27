const request = require("supertest");
const express = require("express");

// Mock database to prevent connection during tests
jest.mock("../src/shared/config/database", () => ({
  sequelize: {
    authenticate: jest.fn().mockResolvedValue(true),
    sync: jest.fn().mockResolvedValue(true),
    query: jest.fn().mockResolvedValue([[]]),
    close: jest.fn().mockResolvedValue(true),
  },
  testConnection: jest.fn().mockResolvedValue(true),
  setupPostgresTimezone: jest.fn().mockResolvedValue(true),
  getLocalDateTime: jest.fn().mockReturnValue("2025-01-01 00:00:00"),
}));

// Mock auth middleware — always sets req.usuario with admin permissions
jest.mock("../src/shared/middleware/auth", () => {
  return (req, _res, next) => {
    req.userId = 99;
    req.usuario = {
      id_usuario: 99,
      email: "test@example.com",
      activo: true,
      tb_rol: [{ nombre: "admin", tb_permiso: [{ nombre: "quejas.crear" }] }],
    };
    next();
  };
});

// Mock features (models) to avoid Sequelize.define calls
jest.mock("../src/features", () => {
  const mockModel = {
    findAll: jest.fn().mockResolvedValue([]),
    count: jest.fn().mockResolvedValue(0),
    findByPk: jest.fn().mockResolvedValue(null),
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({}),
    findAndCountAll: jest.fn().mockResolvedValue({ count: 0, rows: [] }),
    sequelize: { query: jest.fn().mockResolvedValue([[]]) },
    hasMany: jest.fn().mockReturnThis(),
    belongsTo: jest.fn().mockReturnThis(),
    belongsToMany: jest.fn().mockReturnThis(),
  };
  const features = {};
  const names = [
    "Queja", "Prueba", "Trabajo", "Asignacion", "AsignacionTrabajadores",
    "Resultadoprueba", "Trabajador", "Cable", "Clave", "Linea", "Pizarra",
    "Telefono", "Tipoqueja", "Tipopizarra", "Tipomovimiento", "Tipolinea",
    "Senalizacion", "Sistema", "Planta", "Grupow", "Mando",
    "Clasificacion", "Clasificadorclave", "Clasifpizarra", "Propietario",
    "Movimiento",
  ];
  names.forEach((n) => { features[n] = mockModel; });
  return features;
});

process.env.JWT_SECRET = "00f7d9f46b0fe16ff92419e9f0f8ee0510d6249374a267e68dd071851808b38e";
process.env.MP_DB_NAME = "bd_sisgad5_mp";
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
    expect(res.body.message).toContain("funcionando");
  });
});

describe("Queja routes with mocked auth", () => {
  it("GET /api/mp/queja returns 200 (auth mocked)", async () => {
    const res = await request(app).get("/api/mp/queja");
    expect(res.status).toBe(200);
  });
});
