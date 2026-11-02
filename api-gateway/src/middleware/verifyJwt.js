const jwt = require("jsonwebtoken");
const { requireJwtSecret } = require("../config/jwt");

const PUBLIC_ROUTES = [
  "/api/auth/login",
  "/api/auth/register",
  "/health",
  "/health/services",
  "/",
];

function isPublicRoute(reqPath) {
  return PUBLIC_ROUTES.some((route) => {
    if (route === reqPath) return true;
    return reqPath.startsWith(route + "/");
  });
}

function verifyJwt(req, res, next) {
  if (isPublicRoute(req.path) || isPublicRoute(req.originalUrl)) {
    return next();
  }

  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      success: false,
      message: "Token de acceso requerido",
    });
  }

  const token = authHeader.substring(7);

  try {
    const secret = requireJwtSecret();
    const decoded = jwt.verify(token, secret);

    req.user = {
      id: decoded.id,
      email: decoded.email,
      roles: decoded.roles || [],
    };

    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "Token inválido o expirado",
    });
  }
}

module.exports = verifyJwt;
