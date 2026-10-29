const express = require("express");
const router = express.Router();
const rolesPermisoController = require("./roles_permiso.controller");
const auth = require("../../shared/middleware/auth");
const { tienePermiso } = require("../../shared/middleware/permissions");
const validate = require("../../shared/middleware/validate");
const {
  createRolesPermisoSchema,
  listRolesPermisoSchema,
} = require("./roles_permiso.validation");

router.use(auth);

/**
 * @route   GET /api/roles-permisos
 * @desc    Listar asignaciones rol-permiso
 * @access  Permiso: roles.ver
 */
router.get(
  "/",
  tienePermiso("roles.ver"),
  validate(listRolesPermisoSchema, "query"),
  rolesPermisoController.getAll,
);

/**
 * @route   GET /api/roles-permisos/:id_rol/:id_permiso
 * @desc    Obtener asignación rol-permiso por ID
 * @access  Permiso: roles.ver
 */
router.get(
  "/:id_rol/:id_permiso",
  tienePermiso("roles.ver"),
  rolesPermisoController.getById,
);

/**
 * @route   POST /api/roles-permisos
 * @desc    Crear asignación rol-permiso
 * @access  Permiso: roles.crear
 */
router.post(
  "/",
  tienePermiso("roles.crear"),
  validate(createRolesPermisoSchema, "body"),
  rolesPermisoController.create,
);

/**
 * @route   DELETE /api/roles-permisos/:id_rol/:id_permiso
 * @desc    Eliminar asignación rol-permiso
 * @access  Permiso: roles.eliminar
 */
router.delete(
  "/:id_rol/:id_permiso",
  tienePermiso("roles.eliminar"),
  rolesPermisoController.delete,
);

module.exports = router;
