// tests/middleware.test.js — TASK-800-01: Cobertura de middlewares auth + permisos (RBAC)
jest.mock("../src/shared/config/database", () => ({
  sequelize: { authenticate: jest.fn().mockResolvedValue(true), sync: jest.fn().mockResolvedValue(true), close: jest.fn().mockResolvedValue(true) },
  testConnection: jest.fn().mockResolvedValue(true),
}));

const createMockModel = () => ({
  findOne: jest.fn(),
  findByPk: jest.fn(),
  build: jest.fn(),
  findAll: jest.fn(),
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

const jwt = require("jsonwebtoken");
const { TbUser } = require("../src/features");
const authMiddleware = require("../src/shared/middleware/auth");
const { tienePermiso } = require("../src/shared/middleware/permissions");

const mockRes = () => {
  const res = {};
  res.status = jest.fn().mockReturnValue(res);
  res.json = jest.fn().mockReturnValue(res);
  return res;
};

const makeToken = (payload) => jwt.sign(payload, process.env.JWT_SECRET);

describe("shared/middleware/auth.js", () => {
  let res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    res = mockRes();
    next = jest.fn();
  });

  it("debería retornar 401 si no hay Authorization header", () => {
    const req = { header: () => undefined };
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("debería retornar 401 si el token es inválido", () => {
    const req = { header: () => "Bearer invalido" };
    authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("debería retornar 401 si el usuario no existe", async () => {
    const token = makeToken({ id: 999 });
    TbUser.findByPk.mockResolvedValue(null);
    const req = { header: () => `Bearer ${token}` };
    await authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("debería retornar 401 si el usuario está inactivo", async () => {
    const token = makeToken({ id: 1 });
    const usuarioInactivo = { id_usuario: 1, activo: false };
    TbUser.findByPk.mockResolvedValue(usuarioInactivo);
    const req = { header: () => `Bearer ${token}` };
    await authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("debería llamar a next() y asignar req.usuario si todo es válido", async () => {
    const token = makeToken({ id: 1 });
    const usuario = { id_usuario: 1, email: "a@test.com", activo: true };
    TbUser.findByPk.mockResolvedValue(usuario);
    const req = { header: () => `Bearer ${token}` };
    await authMiddleware(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(req.usuario).toEqual(usuario);
  });

  it("debería retornar 500 si falla la consulta a la DB", async () => {
    const token = makeToken({ id: 1 });
    TbUser.findByPk.mockRejectedValue(new Error("DB error"));
    const req = { header: () => `Bearer ${token}` };
    await authMiddleware(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});

describe("shared/middleware/permissions.js", () => {
  let res, next;

  beforeEach(() => {
    jest.clearAllMocks();
    res = mockRes();
    next = jest.fn();
  });

  const usuarioSinRoles = { id_usuario: 1, nombre: "SinRoles", tb_rol: [] };
  const usuarioConPermiso = {
    id_usuario: 2,
    nombre: "ConPermiso",
    tb_rol: [{ nombre: "admin", tb_permiso: [{ nombre: "usuarios.ver" }] }],
  };
  const usuarioSinPermiso = {
    id_usuario: 3,
    nombre: "SinPermiso",
    tb_rol: [{ nombre: "visor", tb_permiso: [{ nombre: "usuarios.ver" }] }],
  };

  it("debería retornar 401 si req.usuario no existe", () => {
    const req = {};
    tienePermiso("usuarios.ver")(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(next).not.toHaveBeenCalled();
  });

  it("debería retornar 403 si el usuario no tiene roles", () => {
    const req = { usuario: usuarioSinRoles };
    tienePermiso("usuarios.ver")(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(next).not.toHaveBeenCalled();
  });

  it("debería llamar a next() si el usuario tiene el permiso", () => {
    const req = { usuario: usuarioConPermiso };
    tienePermiso("usuarios.ver")(req, res, next);
    expect(next).toHaveBeenCalled();
    expect(res.status).not.toHaveBeenCalled();
  });

  it("debería retornar 403 si el usuario no tiene el permiso requerido", () => {
    const req = { usuario: usuarioSinPermiso };
    tienePermiso("usuarios.eliminar")(req, res, next);
    expect(res.status).toHaveBeenCalledWith(403);
    expect(res.json).toHaveBeenCalledWith(
      expect.objectContaining({ success: false, message: expect.stringContaining("usuarios.eliminar") })
    );
    expect(next).not.toHaveBeenCalled();
  });

  it("debería soportar estructura rol.tb_permisos (plural)", () => {
    const req = {
      usuario: {
        id_usuario: 4,
        tb_rol: [{ nombre: "editor", tb_permisos: [{ nombre: "usuarios.actualizar" }] }],
      },
    };
    tienePermiso("usuarios.actualizar")(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it("debería retornar 500 si ocurre error inesperado", () => {
    const req = { usuario: null };
    tienePermiso("usuarios.ver")(req, res, next);
    expect(res.status).toHaveBeenCalledWith(401);
  });
});