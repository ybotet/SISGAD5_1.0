const express = require("express");
const router = express.Router();
const usuariosController = require("./user.controller");
const auth = require("../../shared/middleware/auth");
const { tienePermiso } = require("../../shared/middleware/permissions");
const validate = require("../../shared/middleware/validate");
const {
  createUserSchema,
  updateUserSchema,
  getUserSchema,
  listUserSchema,
} = require("./user.validation");

// Todas las rutas requieren autenticación
router.use(auth);

/**
 * @route   GET /api/user
 * @desc    Listar usuarios con paginación
 * @access  Permiso: usuarios.ver
 */
router.get(
  "/",
  tienePermiso("usuarios.ver"),
  validate(listUserSchema, "query"),
  usuariosController.obtenerUsers,
);

/**
 * @route   GET /api/user/:id
 * @desc    Obtener usuario por ID
 * @access  Permiso: usuarios.ver
 */
router.get(
  "/:id",
  tienePermiso("usuarios.ver"),
  validate(getUserSchema, "params"),
  usuariosController.getUserById,
);

/**
 * @route   POST /api/user
 * @desc    Crear nuevo usuario
 * @access  Permiso: usuarios.crear
 */
router.post(
  "/",
  tienePermiso("usuarios.crear"),
  validate(createUserSchema, "body"),
  usuariosController.crearUser,
);

/**
 * @route   PUT /api/user/:id
 * @desc    Actualizar usuario
 * @access  Permiso: usuarios.actualizar
 */
router.put(
  "/:id",
  tienePermiso("usuarios.actualizar"),
  validate(getUserSchema, "params"),
  validate(updateUserSchema, "body"),
  usuariosController.actualizarUser,
);

/**
 * @route   DELETE /api/user/:id
 * @desc    Eliminar usuario
 * @access  Permiso: usuarios.eliminar
 */
router.delete(
  "/:id",
  tienePermiso("usuarios.eliminar"),
  validate(getUserSchema, "params"),
  usuariosController.eliminarUser,
);

/**
 * @route   DELETE /api/user
 * @desc    Eliminar múltiples usuarios
 * @access  Permiso: usuarios.eliminar
 */
router.delete(
  "/",
  tienePermiso("usuarios.eliminar"),
  usuariosController.eliminarVariosUser,
);

module.exports = router;
