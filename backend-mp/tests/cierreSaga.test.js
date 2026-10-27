jest.mock("../src/shared/config/database", () => ({
  sequelize: {
    authenticate: jest.fn().mockResolvedValue(true),
    sync: jest.fn().mockResolvedValue(true),
    close: jest.fn().mockResolvedValue(true),
    query: jest.fn().mockResolvedValue([[]]),
    transaction: jest.fn().mockResolvedValue({
      commit: jest.fn().mockResolvedValue(),
      rollback: jest.fn().mockResolvedValue(),
    }),
  },
  testConnection: jest.fn().mockResolvedValue(true),
}));

const mockQueja = {
  findByPk: jest.fn(),
  update: jest.fn(),
  sequelize: { query: jest.fn().mockResolvedValue([[]]) },
};
const mockTrabajo = {
  findAll: jest.fn(),
};

jest.mock("../src/features", () => {
  const features = {};
  const mockModel = {
    findAll: jest.fn().mockResolvedValue([]),
    count: jest.fn().mockResolvedValue(0),
    findByPk: jest.fn().mockResolvedValue(null),
    findOne: jest.fn().mockResolvedValue(null),
    create: jest.fn().mockResolvedValue({}),
    update: jest.fn().mockResolvedValue([0]),
    findAndCountAll: jest.fn().mockResolvedValue({ count: 0, rows: [] }),
    sequelize: { query: jest.fn().mockResolvedValue([[]]) },
    hasMany: jest.fn().mockReturnThis(),
    belongsTo: jest.fn().mockReturnThis(),
    belongsToMany: jest.fn().mockReturnThis(),
  };
  return {
    Queja: { ...mockModel, ...mockQueja, findByPk: mockQueja.findByPk, update: mockQueja.update, sequelize: mockQueja.sequelize },
    Trabajo: { ...mockModel, findAll: mockTrabajo.findAll },
  };
});

jest.mock("../src/shared/services/materialesService", () => ({
  MaterialesService: jest.fn().mockImplementation(() => ({
    registrarConsumo: jest.fn(),
  })),
}));

const { MaterialesService } = require("../src/shared/services/materialesService");
const { CierreQuejaSaga } = require("../src/shared/services/cierreQuejaSaga");
const features = require("../src/features");

describe("CierreQuejaSaga", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("retorna compensación QUEJA_NO_ENCONTRADA cuando no existe la queja", async () => {
    features.Queja.findByPk.mockResolvedValue(null);
    const saga = new CierreQuejaSaga();
    const result = await saga.execute(999, {
      id_clavecierre: 1,
      fechaok: "2026-01-01 00:00:00",
      userId: 1,
      token: "token",
    });

    expect(result.success).toBe(false);
    expect(result.compensacion.motivo).toBe("QUEJA_NO_ENCONTRADA");
  });

  it("retorna compensación YA_CERRADA cuando la queja ya está cerrada", async () => {
    features.Queja.findByPk.mockResolvedValue({
      id_queja: 1,
      estado: "Cerrada",
      id_telefono: null,
      id_linea: null,
      id_pizarra: null,
    });
    const saga = new CierreQuejaSaga();
    const result = await saga.execute(1, {
      id_clavecierre: 1,
      fechaok: "2026-01-01 00:00:00",
      userId: 1,
      token: "token",
    });

    expect(result.success).toBe(false);
    expect(result.compensacion.motivo).toBe("YA_CERRADA");
  });

  it("retorna compensación ESTADO_INVALIDO para estado no permitido", async () => {
    features.Queja.findByPk.mockResolvedValue({
      id_queja: 1,
      estado: "Abierta",
      id_telefono: null,
      id_linea: null,
      id_pizarra: null,
    });
    const saga = new CierreQuejaSaga();
    const result = await saga.execute(1, {
      id_clavecierre: 1,
      fechaok: "2026-01-01 00:00:00",
      userId: 1,
      token: "token",
    });

    expect(result.success).toBe(false);
    expect(result.compensacion.motivo).toBe("ESTADO_INVALIDO");
  });

  it("cierra queja sin trabajos y retorna success sin consumo", async () => {
    const savedQueja = { id_queja: 1, estado: "Cerrada" };
    features.Queja.findByPk
      .mockResolvedValueOnce({ id_queja: 1, estado: "Resuelta", id_telefono: null, id_linea: null, id_pizarra: null, fecha: "2026-01-01 00:00:00" })
      .mockResolvedValueOnce(savedQueja);
    features.Queja.update.mockResolvedValue([1]);
    features.Trabajo.findAll.mockResolvedValue([]);

    const mockService = { registrarConsumo: jest.fn() };
    const saga = new CierreQuejaSaga({ materialesService: mockService });
    const result = await saga.execute(1, {
      id_clavecierre: 1,
      fechaok: "2026-01-01 12:00:00",
      userId: 1,
      token: "token",
    });

    expect(result.success).toBe(true);
    expect(result.queja).toEqual(savedQueja);
    expect(result.consumo).toBeNull();
    expect(result.trabajos).toHaveLength(0);
    expect(mockService.registrarConsumo).not.toHaveBeenCalled();
  });

  it("cierra queja con trabajos, llama a Materials, retorna success con consumo", async () => {
    const savedQueja = { id_queja: 1, estado: "Cerrada" };
    features.Queja.findByPk
      .mockResolvedValueOnce({ id_queja: 1, estado: "Probada", id_telefono: null, id_linea: null, id_pizarra: null, fecha: "2026-01-01 00:00:00" })
      .mockResolvedValueOnce(savedQueja);
    features.Queja.update.mockResolvedValue([1]);
    features.Trabajo.findAll.mockResolvedValue([{ id_trabajo: 10, id_trabajador: 5, fecha: "2026-01-01 00:00:00", observaciones: "test" }]);

    const mockService = { registrarConsumo: jest.fn().mockResolvedValue({ id: 100, id_trabajo: 10 }) };
    const saga = new CierreQuejaSaga({ materialesService: mockService });
    const result = await saga.execute(1, {
      id_clavecierre: 1,
      fechaok: "2026-01-01 12:00:00",
      userId: 1,
      token: "bearer-token",
    });

    expect(result.success).toBe(true);
    expect(result.queja).toEqual(savedQueja);
    expect(result.consumo).toEqual({ id: 100, id_trabajo: 10 });
    expect(mockService.registrarConsumo).toHaveBeenCalledWith(
      expect.objectContaining({
        id_trabajo: 10,
        id_trabajador: 5,
      }),
      "bearer-token",
    );
  });

  it("compensa revertiendo cierre cuando Materials falla", async () => {
    const savedQueja = { id_queja: 1, estado: "Cerrada" };
    features.Queja.findByPk
      .mockResolvedValueOnce({ id_queja: 1, estado: "Resuelta", id_telefono: null, id_linea: null, id_pizarra: null, fecha: "2026-01-01 00:00:00" })
      .mockResolvedValueOnce(savedQueja);
    features.Queja.update.mockResolvedValue([1]);
    features.Trabajo.findAll.mockResolvedValue([{ id_trabajo: 10, id_trabajador: 5, fecha: "2026-01-01 00:00:00", observaciones: "test" }]);

    const mockService = { registrarConsumo: jest.fn().mockRejectedValue(new Error("Connection refused")) };
    const saga = new CierreQuejaSaga({ materialesService: mockService });
    const result = await saga.execute(1, {
      id_clavecierre: 1,
      fechaok: "2026-01-01 12:00:00",
      userId: 1,
      token: "token",
    });

    expect(result.success).toBe(false);
    expect(result.compensacion.motivo).toBe("MATERIALES_FALLA");
    expect(features.Queja.update).toHaveBeenCalled();
  });
});
