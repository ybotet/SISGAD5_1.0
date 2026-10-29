const express = require("express");
const router = express.Router();
const rolController = require("./rol.controller");
const auth = require("../../shared/middleware/auth");
const { tienePermiso } = require("../../shared/middleware/permissions");
const validate = require("../../shared/middleware/validate");
const {
  createRolSchema,
  updateRolSchema,
  listRolSchema,
} = require("./rol.validation");

router.use(auth);

/**
 * @route   GET /api/roles
 * @desc    Listar roles con paginación
 * @access  Permiso: usuarios.ver
 */
router.get(
  "/",
  tienePermiso("usuarios.ver"),
  validate(listRolSchema, "query"),
  rolController.getAll,
);

/**
 * @route   GET /api/roles/:id
 * @desc    Obtener rol por ID
 * @access  Permiso: usuarios.ver
 */
router.get(
  "/:id",
  tienePermiso("usuarios.ver"),
  rolController.getById,
);

/**
 * @route   POST /api/roles
 * @desc    Crear nuevo rol
 * @access  Permiso: roles.crear
 */
router.post(
  "/",
  tienePermiso("roles.crear"),
  validate(createRolSchema, "body"),
  rolController.create,
);

/**
 * @route   PUT /api/roles/:id
 * @desc    Actualizar rol
 * @access  Permiso: roles.actualizar
 */
router.put(
  "/:id",
  tienePermiso("roles.actualizar"),
  validate(updateRolSchema, "body"),
  rolController.update,
);

/**
 * @route   DELETE /api/roles/:id
 * @desc    Eliminar rol
 * @access  Permiso: roles.eliminar
 */
router.delete(
  "/:id",
  tienePermiso("roles.eliminar"),
  rolController.delete,
);

module.exports = router;
