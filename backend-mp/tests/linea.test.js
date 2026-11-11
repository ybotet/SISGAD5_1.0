const request = require("supertest");

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
      tb_rol: [{ nombre: "admin", tb_permiso: [{ nombre: "lineas.crear" }] }],
    };
    next();
  };
});

// Helper para crear un objeto de línea con toJSON
const mockLineaInstance = (overrides = {}) => ({
  id_linea: 1,
  clavelinea: "L001",
  esbaja: false,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
  ...overrides,
  toJSON: function () {
    return {
      id_linea: this.id_linea,
      clavelinea: this.clavelinea,
      esbaja: this.esbaja,
      created_at: this.created_at,
      updated_at: this.updated_at,
    };
  },
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
    update: jest.fn().mockResolvedValue([1]),
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

// Sobrescribir Linea y Queja con mocks específicos para los tests de baja/reactivar
const features = require("../src/features");
features.Linea.update = jest.fn().mockResolvedValue([1]);
features.Linea.findByPk = jest.fn().mockResolvedValue(mockLineaInstance());
features.Queja.count = jest.fn().mockResolvedValue(0);

process.env.JWT_SECRET = "00f7d9f46b0fe16ff92419e9f0f8ee0510d6249374a267e68dd071851808b38e";
process.env.DB_HOST = "localhost";
process.env.DB_PORT = "5432";
process.env.DB_USER = "postgres";
process.env.DB_PASSWORD = "test_password_12345678";
process.env.MP_DB_NAME = "bd_sisgad5_mp";
process.env.NODE_ENV = "test";

const app = require("../src/server");

describe("Línea darBaja / reactivar routes", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    features.Linea.update.mockResolvedValue([1]);
    features.Linea.findByPk.mockResolvedValue(mockLineaInstance({ esbaja: false }));
    features.Queja.count.mockResolvedValue(0);
  });

  describe("PATCH /api/mp/linea/:id/baja", () => {
    it("debería dar de baja una línea sin quejas activas", async () => {
      const res = await request(app).patch("/api/mp/linea/1/baja");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("baja");
      expect(features.Linea.update).toHaveBeenCalledWith(
        { esbaja: true },
        { where: { id_linea: "1" } },
      );
    });

    it("debería bloquear baja si hay quejas asociadas no completadas", async () => {
      features.Queja.count.mockResolvedValue(2);

      const res = await request(app).patch("/api/mp/linea/1/baja");
      expect(res.status).toBe(400);
      expect(res.body.success).toBe(false);
      expect(res.body.error).toContain("no completadas");
      expect(features.Linea.update).not.toHaveBeenCalled();
    });

    it("debería retornar 404 si la línea no existe", async () => {
      features.Linea.update.mockResolvedValue([0]);

      const res = await request(app).patch("/api/mp/linea/999/baja");
      expect(res.status).toBe(404);
    });
  });

  describe("PATCH /api/mp/linea/:id/reactivar", () => {
    it("debería reactivar una línea", async () => {
      features.Linea.findByPk.mockResolvedValue(mockLineaInstance({ esbaja: false }));

      const res = await request(app).patch("/api/mp/linea/1/reactivar");
      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.message).toContain("reactiv");
      expect(features.Linea.update).toHaveBeenCalledWith(
        { esbaja: false },
        { where: { id_linea: "1" } },
      );
    });

    it("debería retornar 404 si la línea no existe al reactivar", async () => {
      features.Linea.update.mockResolvedValue([0]);

      const res = await request(app).patch("/api/mp/linea/999/reactivar");
      expect(res.status).toBe(404);
    });
  });

  describe("Ruta /:id no debe interceptar /:id/baja", () => {
    it("debería que PATCH /:id/baja llegue a darBaja, no a getById", async () => {
      const res = await request(app).patch("/api/mp/linea/1/baja");
      expect(res.status).toBe(200);
      expect(features.Linea.update).toHaveBeenCalledWith(
        { esbaja: true },
        { where: { id_linea: "1" } },
      );
    });
  });
});
