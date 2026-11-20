const request = require("supertest");

// Variable mutable (prefijo "mock" permitido por Jest) para controlar permisos del usuario mockeado
let mockAuditPermissions = ["auditoria.ver", "quejas.ver"];

// Mock de base de datos — evita conexión real a PostgreSQL
jest.mock("../src/shared/config/database", () => ({
  sequelize: {
    authenticate: jest.fn().mockResolvedValue(true),
    sync: jest.fn().mockResolvedValue(true),
    query: jest.fn().mockResolvedValue([[]]),
    close: jest.fn().mockResolvedValue(true),
    QueryTypes: { SELECT: "SELECT" },
  },
  testConnection: jest.fn().mockResolvedValue(true),
  setupPostgresTimezone: jest.fn().mockResolvedValue(true),
  getLocalDateTime: jest.fn().mockReturnValue("2025-01-01 00:00:00"),
}));

// Mock de auth middleware — establece req.usuario con permisos configurables
jest.mock("../src/shared/middleware/auth", () => {
  return (req, _res, next) => {
    req.userId = 99;
    req.usuario = {
      id_usuario: 99,
      email: "test@example.com",
      activo: true,
      tb_rol: [{ nombre: "admin", tb_permiso: mockAuditPermissions.map((p) => ({ nombre: p })) }],
    };
    next();
  };
});

// Mock de features (modelos Sequelize) para evitar define() real
jest.mock("../src/features", () => {
  const mockModel = {
    findAll: jest.fn().mockResolvedValue([]),
    count: jest.fn().mockResolvedValue(0),
    findByPk: jest.fn().mockResolvedValue(null),
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({ id_queja: 1, num_reporte: "Q-001", id_tipoqueja: 1 }),
    findAndCountAll: jest.fn().mockResolvedValue({ count: 0, rows: [] }),
    update: jest.fn().mockResolvedValue([1, [{ id_queja: 1, estado: "Probada" }]]),
    destroy: jest.fn().mockResolvedValue(1),
    sequelize: { query: jest.fn().mockResolvedValue([[]]) },
    hasMany: jest.fn().mockReturnThis(),
    belongsTo: jest.fn().mockReturnThis(),
    belongsToMany: jest.fn().mockReturnThis(),
  };
  const features = {};
  const names = [
    "Queja", "Trabajo", "Linea", "Pizarra", "Clave", "Asignacion", "Trabajador",
    "Prueba", "Resultadoprueba", "Cable", "Telefono", "Tipoqueja",
  ];
  names.forEach((n) => { features[n] = mockModel; });
  return features;
});

// Mock de auditService (logAuditoria mockeado para tests de endpoint)
jest.mock("../src/shared/services/auditService", () => ({
  logAuditoria: jest.fn().mockResolvedValue({ id_auditoria: 1 }),
  getClientIp: jest.fn().mockReturnValue("127.0.0.1"),
}));

process.env.JWT_SECRET = "00f7d9f46b0fe16ff92419e9f0f8ee0510d6249374a267e68dd071851808b38e";
process.env.DB_HOST = "localhost";
process.env.DB_PORT = "5432";
process.env.DB_USER = "postgres";
process.env.DB_PASSWORD = "test_password_12345678";
process.env.MP_DB_NAME = "bd_sisgad5_mp";
process.env.NODE_ENV = "test";

const app = require("../src/server");
const { sequelize } = require("../src/shared/config/database");

// Real implementación de logAuditoria para tests de unidad
const { logAuditoria: realLogAuditoria } = jest.requireActual("../src/shared/services/auditService");

describe("Auditoría — logAuditoria (unidad)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    sequelize.query.mockResolvedValue([[{ id_auditoria: 1, entidad: "Queja" }]]);
  });

  it("registra fila de auditoría con INSERT parametrizado (sin interpolación de strings)", async () => {
    await realLogAuditoria({
      entidad: "Queja",
      id_entidad: 42,
      accion: "ESTADO",
      desde_estado: "Abierta",
      hacia_estado: "Probada",
      usuario_id: 99,
      detalle: { cambio: "estado", campo: "estado" },
      ip: "127.0.0.1",
    });

    expect(sequelize.query).toHaveBeenCalledTimes(1);
    const [sql, options] = sequelize.query.mock.calls[0];
    expect(sql).toContain("INSERT INTO tb_auditoria");
    expect(sql).toContain("RETURNING id_auditoria");
    expect(sql).not.toMatch(/\$\{.*\}/); // no interpolación de strings
    expect(options.replacements).toEqual([
      "Queja", 42, "ESTADO", "Abierta", "Probada", 99,
      expect.any(String), "127.0.0.1",
    ]);
  });

  it("devuelve la fila insertada (result[0])", async () => {
    const result = await realLogAuditoria({
      entidad: "Trabajo",
      id_entidad: 7,
      accion: "CREATE",
      usuario_id: 5,
      ip: "10.0.0.1",
    });
    expect(result.id_auditoria).toBe(1);
    expect(result.entidad).toBe("Queja");
  });
});

describe("Auditoría — GET /api/mp/queja/:id/historial (ordenado)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuditPermissions = ["auditoria.ver", "quejas.ver"];
    // mockImplementation inspecciona el SQL para devolver filas o conteo según corresponda
    sequelize.query.mockImplementation((sql) => {
      const sqlStr = String(sql);
      if (sqlStr.includes("COUNT")) {
        return Promise.resolve([{ total: "3" }]);
      }
      return Promise.resolve([
        { id_auditoria: 1, entidad: "Queja", accion: "CREATE", desde_estado: null, hacia_estado: "Abierta", usuario_id: 99, created_at: "2025-01-01T00:00:00Z" },
        { id_auditoria: 2, entidad: "Queja", accion: "ESTADO", desde_estado: "Abierta", hacia_estado: "Probada", usuario_id: 99, created_at: "2025-01-02T00:00:00Z" },
        { id_auditoria: 3, entidad: "Queja", accion: "CERRAR", desde_estado: "Resuelta", hacia_estado: "Cerrada", usuario_id: 99, created_at: "2025-01-03T00:00:00Z" },
      ]);
    });
  });

  it("devuelve entradas de auditoría ordenadas por created_at ASC", async () => {
    const res = await request(app).get("/api/mp/queja/42/historial");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBe(3);

    const fechas = res.body.data.map((e) => e.created_at);
    expect(fechas[0]).toBe("2025-01-01T00:00:00Z");
    expect(fechas[1]).toBe("2025-01-02T00:00:00Z");
    expect(fechas[2]).toBe("2025-01-03T00:00:00Z");

    // Verifica que incluye quién (usuario_id), cuándo (created_at) y desde-hacia
    expect(res.body.data[0]).toMatchObject({
      entidad: "Queja",
      accion: "CREATE",
      desde_estado: null,
      hacia_estado: "Abierta",
      usuario_id: expect.any(Number),
    });
  });

  it("usa bind parametrizado (no interpolación) en la consulta de historial", async () => {
    await request(app).get("/api/mp/queja/42/historial");
    const calls = sequelize.query.mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    const [sql] = calls[0];
    expect(sql).toContain("$1");
    expect(sql).toContain("entidad = 'Queja'");
    expect(sql).toContain("ORDER BY created_at ASC");
    expect(sql).not.toMatch(/\$\{.*\}/);
  });
});

describe("Auditoría — GET /api/mp/auditoria (permiso admin, 403 sin permiso)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // Por defecto: 0 resultados
    sequelize.query.mockImplementation((sql) => {
      const sqlStr = String(sql);
      if (sqlStr.includes("COUNT")) {
        return Promise.resolve([{ total: "0" }]);
      }
      return Promise.resolve([]);
    });
  });

  it("retorna 403 cuando el usuario no tiene permiso auditoria.ver", async () => {
    mockAuditPermissions = []; // sin permisos

    const res = await request(app).get("/api/mp/auditoria");

    expect(res.status).toBe(403);
    expect(res.body.success).toBe(false);
    expect(res.body.message).toContain("auditoria.ver");
  });

  it("retorna 200 con lista paginada cuando tiene permiso auditoria.ver", async () => {
    mockAuditPermissions = ["auditoria.ver", "quejas.ver"];
    sequelize.query.mockImplementation((sql) => {
      const sqlStr = String(sql);
      if (sqlStr.includes("COUNT")) {
        return Promise.resolve([{ total: "1" }]);
      }
      return Promise.resolve([
        { id_auditoria: 1, entidad: "Queja", accion: "CREATE", usuario_id: 99, created_at: "2025-01-01T00:00:00Z" },
      ]);
    });

    const res = await request(app).get("/api/mp/auditoria?page=1&limit=20");

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.length).toBe(1);
    expect(res.body.pagination.total).toBe(1);
    expect(res.body.pagination.page).toBe(1);
    expect(res.body.pagination.limit).toBe(20);
  });

  it("filtra por entidad, usuario y acción con parámetros seguros", async () => {
    mockAuditPermissions = ["auditoria.ver"];
    sequelize.query
      .mockResolvedValueOnce([[], [{ total: "0" }]]);

    await request(app)
      .get("/api/mp/auditoria")
      .query({ entidad: "Queja", usuario_id: 99, accion: "CERRAR", fecha_desde: "2025-01-01", fecha_hasta: "2025-12-31" });

    const calls = sequelize.query.mock.calls;
    expect(calls.length).toBeGreaterThan(0);
    const [sql, options] = calls[0];
    expect(sql).toContain("entidad = $1");
    expect(sql).toContain("usuario_id = $2");
    expect(sql).toContain("accion = $3");
    expect(sql).toContain("created_at >= $4");
    expect(sql).toContain("created_at <= $5");
    expect(sql).not.toMatch(/\$\{.*\}/); // sin interpolación de strings
    expect(options.replacements).toEqual([
      "Queja", 99, "CERRAR", expect.any(Date), expect.any(Date),
      expect.any(Number), expect.any(Number),
    ]);
  });
});
