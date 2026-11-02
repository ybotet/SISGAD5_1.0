const express = require("express");
const router = express.Router();
const permisoController = require("./permiso.controller");
const auth = require("../../shared/middleware/auth");
const { tienePermiso } = require("../../shared/middleware/permissions");
const validate = require("../../shared/middleware/validate");
const {
  createPermisoSchema,
  updatePermisoSchema,
  listPermisoSchema,
} = require("./permiso.validation");

router.use(auth);

/**
 * @route   GET /api/permisos
 * @desc    Listar permisos con paginación
 * @access  Permiso: permisos.ver
 */
router.get(
  "/",
  tienePermiso("permisos.ver"),
  validate(listPermisoSchema, "query"),
  permisoController.getAll,
);

/**
 * @route   GET /api/permisos/:id
 * @desc    Obtener permiso por ID
 * @access  Permiso: permisos.ver
 */
router.get(
  "/:id",
  tienePermiso("permisos.ver"),
  permisoController.getById,
);

/**
 * @route   POST /api/permisos
 * @desc    Crear nuevo permiso
 * @access  Permiso: permisos.crear
 */
router.post(
  "/",
  tienePermiso("permisos.crear"),
  validate(createPermisoSchema, "body"),
  permisoController.create,
);

/**
 * @route   PUT /api/permisos/:id
 * @desc    Actualizar permiso
 * @access  Permiso: permisos.actualizar
 */
router.put(
  "/:id",
  tienePermiso("permisos.actualizar"),
  validate(updatePermisoSchema, "body"),
  permisoController.update,
);

/**
 * @route   DELETE /api/permisos/:id
 * @desc    Eliminar permiso
 * @access  Permiso: permisos.eliminar
 */
router.delete(
  "/:id",
  tienePermiso("permisos.eliminar"),
  permisoController.delete,
);

module.exports = router;
