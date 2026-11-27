const request = require("supertest");
const express = require("express");

// --- Mock DB (evita conexión real) ---
const mockTx = {
  commit: jest.fn().mockResolvedValue(),
  rollback: jest.fn().mockResolvedValue(),
};
jest.mock("../src/shared/config/database", () => ({
  sequelize: {
    authenticate: jest.fn().mockResolvedValue(true),
    sync: jest.fn().mockResolvedValue(true),
    query: jest.fn().mockResolvedValue([[]]),
    close: jest.fn().mockResolvedValue(true),
    transaction: jest.fn().mockResolvedValue(mockTx),
  },
  testConnection: jest.fn().mockResolvedValue(true),
  setupPostgresTimezone: jest.fn().mockResolvedValue(true),
  getLocalDateTime: jest.fn().mockReturnValue("2025-01-01 00:00:00"),
}));

// --- Mock auth: usuario admin con permisos ---
jest.mock("../src/shared/middleware/auth", () => {
  return (req, _res, next) => {
    req.userId = 99;
    req.usuario = {
      id_usuario: 99,
      email: "test@example.com",
      activo: true,
      tb_rol: [
        {
          nombre: "admin",
          tb_permiso: [
            { nombre: "asignaciones.crear" },
            { nombre: "asignaciones.leer" },
            { nombre: "trabajos.crear" },
            { nombre: "trabajos.actualizar" },
            { nombre: "quejas.crear" },
          ],
        },
      ],
    };
    next();
  };
});

// --- Mock features: un mock por modelo (independientes) ---
jest.mock("../src/features", () => {
  const mk = () => ({
    findAll: jest.fn().mockResolvedValue([]),
    count: jest.fn().mockResolvedValue(0),
    findByPk: jest.fn().mockResolvedValue(null),
    findOne: jest.fn().mockResolvedValue(null),
    findOrCreate: jest.fn().mockResolvedValue([{ id_clave: 1 }]),
    max: jest.fn().mockResolvedValue(0),
    create: jest.fn().mockResolvedValue({}),
    bulkCreate: jest.fn().mockResolvedValue([]),
    update: jest.fn().mockResolvedValue([1]),
    destroy: jest.fn().mockResolvedValue(1),
    findAndCountAll: jest.fn().mockResolvedValue({ count: 0, rows: [] }),
    sequelize: {
      query: jest.fn().mockResolvedValue([[]]),
      transaction: jest.fn().mockResolvedValue({
        commit: jest.fn().mockResolvedValue(),
        rollback: jest.fn().mockResolvedValue(),
      }),
    },
    hasMany: jest.fn().mockReturnThis(),
    belongsTo: jest.fn().mockReturnThis(),
    belongsToMany: jest.fn().mockReturnThis(),
  });
  const names = [
    "Queja", "Prueba", "Trabajo", "Asignacion", "AsignacionTrabajadores",
    "Resultadoprueba", "Trabajador", "Cable", "Clave", "Linea", "Pizarra",
    "Telefono", "Tipoqueja", "Tipopizarra", "Tipomovimiento", "Tipolinea",
    "Senalizacion", "Sistema", "Planta", "Grupow", "Mando",
    "Clasificacion", "Clasificadorclave", "Clasifpizarra", "Propietario",
    "Movimiento", "TrabajoTrabajadores", "Auditoria",
  ];
  const features = {};
  names.forEach((n) => { features[n] = mk(); });
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
const features = require("../src/features");

// Configura Clave para devolver ids estables según el código (getEstadoClave
// ahora usa findOne + max + create, no findOrCreate).
function setupClaves() {
  const idFor = (code) => (code === "RESUELTO" ? 2 : code === "PEND" ? 3 : 1); // ABIERTO=1
  features.Clave.findOne.mockImplementation(({ where }) => {
    const code = where && where.clave;
    if (code === "ABIERTO" || code === "RESUELTO" || code === "PEND") {
      return Promise.resolve({ id_clave: idFor(code), clave: code });
    }
    return Promise.resolve(null);
  });
  features.Clave.max.mockResolvedValue(10);
  features.Clave.create.mockImplementation((data) =>
    Promise.resolve({ id_clave: data.id_clave, ...data }),
  );
}

beforeEach(() => {
  jest.clearAllMocks();
  setupClaves();
});

describe("Flujo Asignada -> Trabajo (TASK-220-04)", () => {
  test("(a) crear asignación genera trabajo Abierto con operarios y mueve la queja a Asignada", async () => {
    features.Queja.findByPk.mockResolvedValue({ id_queja: 7, estado: "Probada" });
    features.Asignacion.create.mockResolvedValue({
      id_asignacion: 10,
      id_queja: 7,
      toJSON() { return { id_asignacion: 10, id_queja: 7 }; },
    });
    features.Trabajo.create.mockResolvedValue({ id_trabajo: 555, id_queja: 7 });

    const res = await request(app)
      .post("/api/mp/asignacion")
      .send({
        id_queja: 7,
        fechaAsignacion: "2026-11-27T10:00:00",
        trabajadores: [{ id_trabajador: 3 }, { id_trabajador: 4 }],
      });

    expect(res.status).toBe(201);
    expect(res.body.trabajoId).toBe(555);
    expect(features.Trabajo.create).toHaveBeenCalledTimes(1);
    const trabajoArg = features.Trabajo.create.mock.calls[0][0];
    expect(trabajoArg.estado).toBe(1); // Abierto
    expect(trabajoArg.id_queja).toBe(7);
    expect(features.TrabajoTrabajadores.bulkCreate).toHaveBeenCalledTimes(1);
    expect(features.Queja.update).toHaveBeenCalledWith(
      { estado: "Asignada" },
      expect.objectContaining({ where: { id_queja: 7 } }),
    );
  });

  test("(e) la asignación sigue exigiendo estado Probada/Pendiente (Abierta -> 400)", async () => {
    features.Queja.findByPk.mockResolvedValue({ id_queja: 8, estado: "Abierta" });

    const res = await request(app)
      .post("/api/mp/asignacion")
      .send({
        id_queja: 8,
        fechaAsignacion: "2026-11-27T10:00:00",
        trabajadores: [{ id_trabajador: 3 }],
      });

    expect(res.status).toBe(400);
    expect(features.Trabajo.create).not.toHaveBeenCalled();
  });

  test("asignar una queja ya Asignada devuelve 409", async () => {
    features.Queja.findByPk.mockResolvedValue({ id_queja: 9, estado: "Asignada" });

    const res = await request(app)
      .post("/api/mp/asignacion")
      .send({
        id_queja: 9,
        fechaAsignacion: "2026-11-27T10:00:00",
        trabajadores: [{ id_trabajador: 3 }],
      });

    expect(res.status).toBe(409);
    expect(features.Trabajo.create).not.toHaveBeenCalled();
  });

  test("(b) resolver -> completado lleva la queja a Resuelta y el trabajo a Resuelto", async () => {
    const trabajoOpen = {
      id_trabajo: 555,
      id_queja: 7,
      estado: 1, // Abierto
      update: jest.fn().mockResolvedValue(),
      toJSON() { return { id_trabajo: 555, id_queja: 7, estado: 2 }; },
    };
    const trabajoActualizado = {
      toJSON() {
        return { id_trabajo: 555, id_queja: 7, estado: 2, tb_trabajo_trabajadores: [] };
      },
    };
    // Orden de findByPk: trabajo(555) -> queja(7) -> actualizado
    features.Trabajo.findByPk
      .mockResolvedValueOnce(trabajoOpen)
      .mockResolvedValueOnce(trabajoActualizado);
    features.Queja.findByPk.mockResolvedValue({
      id_queja: 7,
      estado: "Asignada",
      update: jest.fn().mockResolvedValue(),
    });

    const res = await request(app)
      .patch("/api/mp/trabajo/555/resolver")
      .send({ resultado: "completado", observaciones: "listo" });

    expect(res.status).toBe(200);
    expect(trabajoOpen.update).toHaveBeenCalledWith(
      expect.objectContaining({ estado: 2 }), // Resuelto
      expect.anything(),
    );
    expect(features.Queja.findByPk).toHaveBeenCalled();
    const queja = await features.Queja.findByPk.mock.results[0].value;
    expect(queja.update).toHaveBeenCalledWith({ estado: "Resuelta" }, expect.anything());
  });

  test("(c) resolver -> pendiente lleva la queja a Pendiente y el trabajo a Pendiente", async () => {
    const trabajoOpen = {
      id_trabajo: 556,
      id_queja: 11,
      estado: 1,
      update: jest.fn().mockResolvedValue(),
      toJSON() { return { id_trabajo: 556, id_queja: 11, estado: 3 }; },
    };
    const trabajoActualizado = {
      toJSON() {
        return { id_trabajo: 556, id_queja: 11, estado: 3, tb_trabajo_trabajadores: [] };
      },
    };
    features.Trabajo.findByPk
      .mockResolvedValueOnce(trabajoOpen)
      .mockResolvedValueOnce(trabajoActualizado);
    const quejaMock = { id_queja: 11, estado: "Asignada", update: jest.fn().mockResolvedValue() };
    features.Queja.findByPk.mockResolvedValue(quejaMock);

    const res = await request(app)
      .patch("/api/mp/trabajo/556/resolver")
      .send({ resultado: "pendiente" });

    expect(res.status).toBe(200);
    expect(trabajoOpen.update).toHaveBeenCalledWith(
      expect.objectContaining({ estado: 3 }), // Pendiente
      expect.anything(),
    );
    expect(quejaMock.update).toHaveBeenCalledWith({ estado: "Pendiente" }, expect.anything());
  });

  test("(d) transición ilegal (queja no Asignada) devuelve 409", async () => {
    const trabajoOpen = {
      id_trabajo: 557,
      id_queja: 12,
      estado: 1,
      update: jest.fn().mockResolvedValue(),
    };
    features.Trabajo.findByPk.mockResolvedValueOnce(trabajoOpen);
    features.Queja.findByPk.mockResolvedValue({ id_queja: 12, estado: "Resuelta" });

    const res = await request(app)
      .patch("/api/mp/trabajo/557/resolver")
      .send({ resultado: "completado" });

    expect(res.status).toBe(409);
    expect(trabajoOpen.update).not.toHaveBeenCalled();
  });

  test("resolver un trabajo que no está Abierto devuelve 409", async () => {
    features.Trabajo.findByPk.mockResolvedValueOnce({
      id_trabajo: 558,
      id_queja: 13,
      estado: 2, // ya Resuelto
      update: jest.fn(),
    });

    const res = await request(app)
      .patch("/api/mp/trabajo/558/resolver")
      .send({ resultado: "completado" });

    expect(res.status).toBe(409);
  });
});