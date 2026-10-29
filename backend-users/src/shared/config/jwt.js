const jwt = require("jsonwebtoken");
const logger = require("./logger");

const requireJwtSecret = (secret = process.env.JWT_SECRET) => {
  if (!secret || typeof secret !== "string" || secret.length < 32) {
    throw new Error("ERROR.JWT.SECRET_REQUIRED");
  }
  return secret;
};

/**
 * Genera un access token JWT de corta duración (default: 15 min).
 * @param {object} payload — Payload del token (ej: { id, email })
 * @returns {string} — Access token JWT
 */
const generateAccessToken = (payload) => {
  const secret = requireJwtSecret();
  const expiresIn = process.env.JWT_EXPIRES_IN || "15m";
  return jwt.sign(payload, secret, { expiresIn });
};

/**
 * Genera un refresh token JWT de larga duración (default: 7 días).
 * Almacenado en BD para permitir revocación.
 * @param {object} payload — Payload del token (ej: { id, email })
 * @returns {string} — Refresh token JWT
 */
const generateRefreshToken = (payload) => {
  const secret = requireJwtSecret();
  const expiresIn = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
  return jwt.sign(payload, secret, { expiresIn });
};

module.exports = {
  jwt,
  requireJwtSecret,
  generateAccessToken,
  generateRefreshToken,
};
