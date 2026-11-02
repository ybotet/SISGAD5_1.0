const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");
const auth = require("../../shared/middleware/auth");
const validate = require("../../shared/middleware/validate");
const { tienePermiso } = require("../../shared/middleware/permissions");
const { loginSchema, refreshSchema, logoutSchema, passwordChangeSchema } = require("./auth.validation");
const {
  sesionesQuerySchema,
  sesionesUsuarioParamsSchema,
} = require("./session.validation");

/**
 * @route   POST /api/auth/login
 * @desc    Login de usuario — genera access token + refresh token
 * @access  Public
 */
router.post(
  "/login",
  validate(loginSchema, "body"),
  authController.login,
);

/**
 * @route   POST /api/auth/refresh
 * @desc    Refrescar tokens — rota refresh token y emite nuevos tokens
 * @access  Public
 */
router.post(
  "/refresh",
  validate(refreshSchema, "body"),
  authController.refresh,
);

/**
 * @route   POST /api/auth/logout
 * @desc    Logout — revoca el refresh token en BD
 * @access  Public (revoca el refresh token proporcionado)
 */
router.post(
  "/logout",
  validate(logoutSchema, "body"),
  authController.logout,
);

/**
 * @route   PATCH /api/auth/password
 * @desc    Cambio de contraseña self-service (autenticado)
 * @access  Private
 */
router.patch(
  "/password",
  auth,
  validate(passwordChangeSchema, "body"),
  authController.cambiarPassword,
);

/**
 * @route   GET /api/auth/perfil
 * @desc    Obtener perfil del usuario autenticado
 * @access  Private
 */
router.get("/perfil", auth, authController.perfil);

/**
 * @route   GET /api/auth/sesiones
 * @desc    Historial de sesiones del usuario autenticado (IP, user-agent, timestamp)
 *          Filtros: evento, exitoso, desde, hasta + paginación (page, limit)
 * @access  Private (self-service)
 */
router.get(
  "/sesiones",
  auth,
  validate(sesionesQuerySchema, "query"),
  authController.misSesiones,
);

/**
 * @route   GET /api/auth/sesiones/usuario/:id_usuario
 * @desc    Historial de sesiones de un usuario específico (auditoría/administración)
 * @access  Private — requiere permiso `sesiones:read_all`
 */
router.get(
  "/sesiones/usuario/:id_usuario",
  auth,
  tienePermiso("sesiones:read_all"),
  validate(sesionesUsuarioParamsSchema, "params"),
  validate(sesionesQuerySchema, "query"),
  authController.sesionesDeUsuario,
);

module.exports = router;
