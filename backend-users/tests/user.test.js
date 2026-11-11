// tests/user.test.js — TASK-800-01: Cobertura de user.controller.js (CRUD + RBAC)
const createMockModel = () => ({
  findOne: jest.fn(),
  findByPk: jest.fn(),
  build: jest.fn(),
  findAll: jest.fn(),
  findAndCountAll: jest.fn(),
  count: jest.fn(),
  create: jest.fn(),
  bulkCreate: jest.fn(),
  update: jest.fn(),
  destroy: jest.fn(),
  belongsTo: jest.fn().mockReturnThis(),
  belongsToMany: jest.fn().mockReturnThis(),
  hasMany: jest.fn().mockReturnThis(),
  hasOne: jest.fn().mockReturnThis(),
  toJSON: jest.fn(),
});

jest.mock("../src/shared/config/database", () => ({
  sequelize: {
    authenticate: jest.fn().mockResolvedValue(true),
    sync: jest.fn().mockResolvedValue(true),
    close: jest.fn().mockResolvedValue(true),
  },
  testConnection: jest.fn().mockResolvedValue(true),
}));

jest.mock("../src/features/user/user.model", () => () => createMockModel());
jest.mock("../src/features/rol/rol.model", () => () => createMockModel());
jest.mock("../src/features/permiso/permiso.model", () => () => createMockModel());
jest.mock("../src/features/user_rol/user_rol.model", () => () => createMockModel());
jest.mock("../src/features/roles_permiso/roles_permiso.model", () => () => createMockModel());
jest.mock("../src/features/auth/refresh_token.model", () => {
  const m = jest.fn();
  m.mockImplementation(() => m);
  m.belongsTo = jest.fn().mockReturnThis();
  m.hasMany = jest.fn().mockReturnThis();
  m.findOne = jest.fn();
  m.findByPk = jest.fn();
  m.create = jest.fn();
  m.hashToken = (t) => require("crypto").createHash("sha256").update(t).digest("hex");
  return m;
});
jest.mock("../src/features/auth/session.model", () => {
  const m = jest.fn();
  m.mockImplementation(() => m);
  m.belongsTo = jest.fn().mockReturnThis();
  m.hasMany = jest.fn().mockReturnThis();
  m.findOne = jest.fn();
  m.findByPk = jest.fn();
  m.create = jest.fn().mockResolvedValue(true);
  return m;
});

process.env.JWT_SECRET = "00f7d9f46b0fe16ff92419e9f0f8ee0510d6249374a267e68dd071851808b38e";
process.env.NODE_ENV = "test";

const { TbUser, TbRol, User_Roles } = require("../src/features");
const usuariosController = require("../src/features/user/user.controller");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

describe("user.controller.js", () => {
  let res;

  beforeEach(() => {
    jest.clearAllMocks();
    res = mockRes();
  });

  describe("obtenerUsers", () => {
    it("debería devolver usuarios paginados con éxito", async () => {
      const mockRows = [{ id_usuario: 1, nombre: "Ana", email: "a@test.com", tb_rol: [] }];
      TbUser.findAndCountAll.mockResolvedValue({ count: 1, rows: mockRows });

      const req = { query: { page: "1", limit: "10", search: "" } };
      await usuariosController.obtenerUsers(req, res);

      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, pagination: expect.any(Object) })
      );
    });

    it("debería buscar por término (search)", async () => {
      TbUser.findAndCountAll.mockResolvedValue({ count: 0, rows: [] });

      const req = { query: { page: "1", limit: "10", search: "Juan" } };
      await usuariosController.obtenerUsers(req, res);

      expect(TbUser.findAndCountAll).toHaveBeenCalledWith(
        expect.objectContaining({ where: expect.any(Object) })
      );
    });

    it("debería retornar 500 en error inesperado", async () => {
      TbUser.findAndCountAll.mockRejectedValue(new Error("DB error"));

      const req = { query: {} };
      await usuariosController.obtenerUsers(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false })
      );
    });
  });

  describe("crearUser", () => {
    it("debería crear usuario con éxito", async () => {
      const mockUsuario = { id_usuario: 1, email: "nuevo@test.com", nombre: "Nuevo", apellidos: "Usuario" };
      TbUser.findOne.mockResolvedValue(null);
      TbUser.create.mockResolvedValue(mockUsuario);
      TbRol.findAll.mockResolvedValue([]);
      TbUser.findByPk.mockResolvedValue(mockUsuario);

      const req = { body: { email: "nuevo@test.com", password: "Pass123!", nombre: "Nuevo", apellidos: "Usuario", roles: [] } };
      await usuariosController.crearUser(req, res);

      expect(res.status).toHaveBeenCalledWith(201);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: expect.stringContaining("User creado") })
      );
    });

    it("debería crear usuario asignando roles", async () => {
      const mockUsuario = { id_usuario: 1, email: "nuevo@test.com", nombre: "Nuevo", apellidos: "Usuario" };
      const mockRoles = [{ id_rol: 1, nombre: "admin" }];
      TbUser.findOne.mockResolvedValue(null);
      TbUser.create.mockResolvedValue(mockUsuario);
      TbRol.findAll.mockResolvedValue(mockRoles);
      User_Roles.destroy.mockResolvedValue(1);
      User_Roles.bulkCreate.mockResolvedValue([{ id_usuario: 1, id_rol: 1 }]);
      TbUser.findByPk.mockResolvedValue({ ...mockUsuario, tb_rol: mockRoles });

      const req = { body: { email: "nuevo@test.com", password: "Pass123!", nombre: "Nuevo", apellidos: "Usuario", roles: [1] } };
      await usuariosController.crearUser(req, res);

      expect(TbRol.findAll).toHaveBeenCalledWith({ where: { id_rol: [1] } });
      expect(User_Roles.bulkCreate).toHaveBeenCalled();
      expect(res.status).toHaveBeenCalledWith(201);
    });

    it("debería retornar 400 si el email ya existe", async () => {
      TbUser.findOne.mockResolvedValue({ id_usuario: 1 });

      const req = { body: { email: "existente@test.com", password: "Pass123!" } };
      await usuariosController.crearUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: false, message: expect.stringContaining("ya está registrado") })
      );
    });

    it("debería retornar 500 en error inesperado", async () => {
      TbUser.findOne.mockRejectedValue(new Error("DB error"));

      const req = { body: { email: "x@test.com", password: "Pass123!" } };
      await usuariosController.crearUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("actualizarUser", () => {
    it("debería actualizar usuario con éxito", async () => {
      const mockUsuario = { id_usuario: 1, email: "a@test.com", nombre: "Ana", apellidos: "Pérez", activo: true, update: jest.fn().mockResolvedValue(true) };
      TbUser.findByPk.mockResolvedValue(mockUsuario);
      TbRol.findAll.mockResolvedValue([]);

      const req = { params: { id: "1" }, body: { nombre: "Ana María", roles: [] } };
      await usuariosController.actualizarUser(req, res);

      expect(mockUsuario.update).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });

    it("debería actualizar usuario asignando roles", async () => {
      const mockUsuario = { id_usuario: 1, email: "a@test.com", nombre: "Ana", apellidos: "Pérez", activo: true, update: jest.fn().mockResolvedValue(true) };
      const mockRoles = [{ id_rol: 1, nombre: "admin" }];
      TbUser.findByPk.mockResolvedValue(mockUsuario);
      TbRol.findAll.mockResolvedValue(mockRoles);
      User_Roles.destroy.mockResolvedValue(1);
      User_Roles.bulkCreate.mockResolvedValue([{ id_usuario: 1, id_rol: 1 }]);
      TbUser.findByPk.mockResolvedValueOnce(mockUsuario).mockResolvedValueOnce({ ...mockUsuario, tb_rol: mockRoles });

      const req = { params: { id: "1" }, body: { nombre: "Ana María", roles: [1] } };
      await usuariosController.actualizarUser(req, res);

      expect(TbRol.findAll).toHaveBeenCalledWith({ where: { id_rol: [1] } });
      expect(User_Roles.bulkCreate).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true })
      );
    });

    it("debería retornar 404 si el usuario no existe", async () => {
      TbUser.findByPk.mockResolvedValue(null);

      const req = { params: { id: "999" }, body: {} };
      await usuariosController.actualizarUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("debería retornar 500 en error inesperado", async () => {
      TbUser.findByPk.mockRejectedValue(new Error("DB error"));

      const req = { params: { id: "1" }, body: {} };
      await usuariosController.actualizarUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("getUserById", () => {
    it("debería devolver usuario por ID con éxito", async () => {
      const mockUsuario = { id_usuario: 1, nombre: "Ana", tb_rol: [] };
      TbUser.findByPk.mockResolvedValue(mockUsuario);

      const req = { params: { id: "1" } };
      await usuariosController.getUserById(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
    });

    it("debería devolver usuario por ID con roles (deduplica)", async () => {
      const mockUsuario = { id_usuario: 1, nombre: "Ana", tb_rol: [{ id_rol: 1, nombre: "admin" }, { id_rol: 1, nombre: "admin" }] };
      TbUser.findByPk.mockResolvedValue(mockUsuario);

      const req = { params: { id: "1" } };
      await usuariosController.getUserById(req, res);

      expect(res.json).toHaveBeenCalledWith(expect.objectContaining({ success: true }));
      const dataArg = res.json.mock.calls[0][0];
      expect(dataArg.data.tb_rol.length).toBe(1);
    });

    it("debería retornar 404 si el usuario no existe", async () => {
      TbUser.findByPk.mockResolvedValue(null);

      const req = { params: { id: "999" } };
      await usuariosController.getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("debería retornar 500 en error inesperado", async () => {
      TbUser.findByPk.mockRejectedValue(new Error("DB error"));

      const req = { params: { id: "1" } };
      await usuariosController.getUserById(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("eliminarUser", () => {
    it("debería eliminar usuario con éxito", async () => {
      const mockUsuario = { id_usuario: 1, nombre: "Ana", destroy: jest.fn().mockResolvedValue(1) };
      TbUser.findByPk.mockResolvedValue(mockUsuario);

      const req = { params: { id: "1" } };
      await usuariosController.eliminarUser(req, res);

      expect(mockUsuario.destroy).toHaveBeenCalled();
      expect(res.json).toHaveBeenCalledWith(
        expect.objectContaining({ success: true, message: expect.stringContaining("eliminado") })
      );
    });

    it("debería retornar 404 si el usuario no existe", async () => {
      TbUser.findByPk.mockResolvedValue(null);

      const req = { params: { id: "999" } };
      await usuariosController.eliminarUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("debería retornar 500 en error inesperado", async () => {
      TbUser.findByPk.mockRejectedValue(new Error("DB error"));

      const req = { params: { id: "1" } };
      await usuariosController.eliminarUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });

  describe("eliminarVariosUser", () => {
    it("debería retornar 400 si ids no es array o está vacío", async () => {
      for (const body of [{}, { ids: [] }, { ids: null }]) {
        const req = { body };
        await usuariosController.eliminarVariosUser(req, res);
        expect(res.status).toHaveBeenCalledWith(400);
        res = mockRes();
      }
    });

    it("debería retornar 400 si hay IDs inválidos", async () => {
      const req = { body: { ids: [-1, 0, "abc"] } };
      await usuariosController.eliminarVariosUser(req, res);

      expect(res.status).toHaveBeenCalledWith(400);
    });

    it("debería retornar 404 si algunos usuarios no existen", async () => {
      TbUser.count.mockResolvedValue(1);

      const req = { body: { ids: [1, 2] } };
      await usuariosController.eliminarVariosUser(req, res);

      expect(res.status).toHaveBeenCalledWith(404);
    });

    it("debería eliminar varios usuarios con éxito", async () => {
      TbUser.count.mockResolvedValue(2);
      TbUser.destroy.mockResolvedValue(2);

      const req = { body: { ids: [1, 2] } };
      await usuariosController.eliminarVariosUser(req, res);

      expect(TbUser.destroy).toHaveBeenCalledWith({ where: { id_usuario: [1, 2] } });
    });

    it("debería retornar 500 en error inesperado", async () => {
      TbUser.count.mockRejectedValue(new Error("DB error"));

      const req = { body: { ids: [1] } };
      await usuariosController.eliminarVariosUser(req, res);

      expect(res.status).toHaveBeenCalledWith(500);
    });
  });
});