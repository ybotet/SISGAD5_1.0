const express = require("express");
const router = express.Router();
const authController = require("./auth.controller");
const auth = require("../../shared/middleware/auth");
const validate = require("../../shared/middleware/validate");
const { loginSchema, refreshSchema, logoutSchema } = require("./auth.validation");

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
 * @route   GET /api/auth/perfil
 * @desc    Obtener perfil del usuario autenticado
 * @access  Private
 */
router.get("/perfil", auth, authController.perfil);

module.exports = router;
