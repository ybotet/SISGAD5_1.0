const express = require("express");
const router = express.Router();
const userRolController = require("./user_rol.controller");
const auth = require("../../shared/middleware/auth");
const { tienePermiso } = require("../../shared/middleware/permissions");
const validate = require("../../shared/middleware/validate");
const {
  createUserRolSchema,
  listUserRolSchema,
} = require("./user_rol.validation");

router.use(auth);

/**
 * @route   GET /api/user_rol
 * @desc    Listar asignaciones usuario-rol
 * @access  Permiso: usuarios.ver
 */
router.get(
  "/",
  tienePermiso("usuarios.ver"),
  validate(listUserRolSchema, "query"),
  userRolController.getAll,
);

/**
 * @route   POST /api/user_rol
 * @desc    Crear asignación usuario-rol
 * @access  Permiso: usuarios.crear
 */
router.post(
  "/",
  tienePermiso("usuarios.crear"),
  validate(createUserRolSchema, "body"),
  userRolController.create,
);

/**
 * @route   DELETE /api/user_rol/:id_usuario/:id_rol
 * @desc    Eliminar asignación usuario-rol
 * @access  Permiso: usuarios.eliminar
 */
router.delete(
  "/:id_usuario/:id_rol",
  tienePermiso("usuarios.eliminar"),
  userRolController.delete,
);

module.exports = router;
