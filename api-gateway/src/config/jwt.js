function requireJwtSecret(secret = process.env.JWT_SECRET) {
  if (!secret || typeof secret !== "string" || secret.length < 32) {
    throw new Error("JWT_SECRET debe tener al menos 32 caracteres");
  }
  return secret;
}

module.exports = { requireJwtSecret };
