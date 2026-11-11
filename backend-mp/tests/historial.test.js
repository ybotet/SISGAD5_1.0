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
    "Movimiento", "Recorrido",
  ];
  names.forEach((n) => { features[n] = mockModel; });
  return features;
});

process.env.JWT_SECRET = "00f7d9f46b0fe16ff92419e9f0f8ee0510d6249374a267e68dd071851808b38e";
process.env.DB_HOST = "localhost";
process.env.DB_PORT = "5432";
process.env.DB_USER = "postgres";
process.env.DB_PASSWORD = "test_password_12345678";
process.env.MP_DB_NAME = "bd_sisgad5_mp";
process.env.NODE_ENV = "test";

const app = require("../src/server");

// Modelo mockeado compartido para pruebas directas del servicio
const models = require("../src/features");

const mockModelInstance = (overrides = {}) => ({
  id: 1,
  created_at: "2025-01-01T00:00:00Z",
  updated_at: "2025-01-01T00:00:00Z",
  ...overrides,
  toJSON: function () {
    return { ...this };
  },
});

const { getHistorial } = require("../src/features/historial/HistorialService");

describe("Historial service (unit)", () => {
  beforeEach(() => {
    models.Telefono.findByPk.mockResolvedValue(null);
    models.Linea.findByPk.mockResolvedValue(null);
    models.Pizarra.findByPk.mockResolvedValue(null);
    models.Queja.findAll.mockResolvedValue([]);
    models.Movimiento.findAll.mockResolvedValue([]);
    models.Recorrido.findAll.mockResolvedValue([]);
  });

  it("telefono: devuelve eventos ordenados por fecha desc", async () => {
    const telefonoMock = mockModelInstance({ id_telefono: 1, telefono: "1234567" });
    const quejaMock = mockModelInstance({
      id_queja: 10, estado: "Abierta", fecha: "2025-01-05", id_telefono: 1,
    });
    const movimientoMock = mockModelInstance({
      id_movimiento: 20, motivo: "Cambio", fecha: "2025-01-03", id_telefono: 1,
    });
    const recorridoMock = mockModelInstance({
      id_recorrido: 30, numero: 5, created_at: "2025-01-01", id_telefono: 1,
    });

    models.Telefono.findByPk.mockResolvedValue(telefonoMock);
    models.Queja.findAll.mockImplementationOnce(() => Promise.resolve([quejaMock]));
    models.Movimiento.findAll.mockImplementationOnce(() => Promise.resolve([movimientoMock]));
    models.Recorrido.findAll.mockImplementationOnce(() => Promise.resolve([recorridoMock]));

    const result = await getHistorial("telefono", 1, { models });
    expect(result.entidad).toBe("telefono");
    expect(result.id).toBe(1);
    expect(result.eventos.length).toBe(3);
    const fechas = result.eventos.map((e) => e.fecha);
    expect(fechas[0]).toBe("2025-01-05");
    expect(fechas[2]).toBe("2025-01-01");
  });

  it("linea: devuelve eventos ordenados por fecha desc", async () => {
    const lineaMock = mockModelInstance({ id_linea: 1, clavelinea: "L001" });
    const quejaMock = mockModelInstance({
      id_queja: 11, estado: "Resuelta", fecha: "2025-01-10", id_linea: 1,
    });
    const movimientoMock = mockModelInstance({
      id_movimiento: 21, motivo: "Mantenimiento", fecha: "2025-01-08", id_linea: 1,
    });

    models.Linea.findByPk.mockResolvedValue(lineaMock);
    models.Queja.findAll.mockImplementationOnce(() => Promise.resolve([quejaMock]));
    models.Movimiento.findAll.mockImplementationOnce(() => Promise.resolve([movimientoMock]));
    models.Recorrido.findAll.mockResolvedValue([]);

    const result = await getHistorial("linea", 1, { models });
    expect(result.entidad).toBe("linea");
    expect(result.eventos.length).toBe(2);
    const fechas = result.eventos.map((e) => e.fecha);
    expect(fechas[0]).toBe("2025-01-10");
    expect(fechas[1]).toBe("2025-01-08");
  });

  it("pizarra: devuelve solo quejas (no movimientos ni recorridos)", async () => {
    const pizarraMock = mockModelInstance({ id_pizarra: 1, nombre: "Pizarra A" });
    const quejaMock = mockModelInstance({
      id_queja: 12, estado: "Abierta", fecha: "2025-01-07", id_pizarra: 1,
    });

    models.Pizarra.findByPk.mockResolvedValue(pizarraMock);
    models.Queja.findAll.mockImplementationOnce(() => Promise.resolve([quejaMock]));
    models.Movimiento.findAll.mockResolvedValue([]);
    models.Recorrido.findAll.mockResolvedValue([]);

    const result = await getHistorial("pizarra", 1, { models });
    expect(result.entidad).toBe("pizarra");
    expect(result.eventos.length).toBe(1);
    expect(result.eventos[0].tipo).toBe("queja");
  });

  it("telefono: entidad inexistente → notFound", async () => {
    models.Telefono.findByPk.mockResolvedValue(null);
    await expect(getHistorial("telefono", 999, { models })).rejects.toThrow();
  });
});

describe("Historial endpoints (supertest)", () => {
  beforeEach(() => {
    models.Telefono.findByPk.mockResolvedValue(null);
    models.Linea.findByPk.mockResolvedValue(null);
    models.Pizarra.findByPk.mockResolvedValue(null);
  });

  it("GET /api/mp/telefono/:id/historial → 404 si no existe", async () => {
    const res = await request(app).get("/api/mp/telefono/999/historial");
    expect(res.status).toBe(404);
  });

  it("GET /api/mp/linea/:id/historial → 404 si no existe", async () => {
    const res = await request(app).get("/api/mp/linea/999/historial");
    expect(res.status).toBe(404);
  });

  it("GET /api/mp/pizarra/:id/historial → 404 si no existe", async () => {
    const res = await request(app).get("/api/mp/pizarra/999/historial");
    expect(res.status).toBe(404);
  });

  it("GET /api/mp/telefono/:id/historial → 200 con entidad vacía", async () => {
    const telefonoMock = mockModelInstance({ id_telefono: 1, telefono: "1234567" });
    models.Telefono.findByPk.mockResolvedValue(telefonoMock);
    models.Queja.findAll.mockResolvedValue([]);
    models.Movimiento.findAll.mockResolvedValue([]);
    models.Recorrido.findAll.mockResolvedValue([]);

    const res = await request(app).get("/api/mp/telefono/1/historial?limit=5");
    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.entidad).toBe("telefono");
    expect(res.body.data.id).toBe("1");
    expect(Array.isArray(res.body.data.eventos)).toBe(true);
    expect(models.Queja.findAll).toHaveBeenCalledWith(
      expect.objectContaining({ limit: 5 })
    );
  });
});
