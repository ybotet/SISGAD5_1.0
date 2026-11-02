const logger = require("./logger");

const requireJwtSecret = (secret = process.env.JWT_SECRET) => {
  if (!secret || typeof secret !== "string") {
    throw new Error("ERROR.JWT.SECRET_REQUIRED");
  }
  if (secret.length < 32) {
    throw new Error("ERROR.JWT.SECRET_TOO_SHORT");
  }
  return secret;
};

module.exports = { requireJwtSecret };
