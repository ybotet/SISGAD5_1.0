const jwt = require("jsonwebtoken");
const { TbUser, TbRol, TbPermiso, RefreshToken, Sesion } = require("../../features");
const {
  requireJwtSecret,
  generateAccessToken,
  generateRefreshToken,
} = require("../../shared/config/jwt");

requireJwtSecret();

/**
 * Registra un evento de sesión en tb_sesiones.
 * @param {number|null} idUsuario — ID del usuario (null si no se conoce)
 * @param {string} evento — "login" | "refresh" | "logout"
 * @param {object} req — Objeto request de Express (para IP y User-Agent)
 * @param {boolean} [exitoso=true] — Si el evento fue exitoso
 * @param {string} [detalle] — Detalle opcional (error, etc.)
 */
async function registrarSesion(idUsuario, evento, req, exitoso = true, detalle = null) {
  try {
    const ip =
      req.headers["x-forwarded-for"] ||
      req.connection?.remoteAddress ||
      req.socket?.remoteAddress ||
      null;

    await Sesion.create({
      id_usuario: idUsuario,
      evento,
      ip,
      user_agent: req.headers["user-agent"] || null,
      exitoso,
      detalle,
    });
  } catch (error) {
    console.warn("⚠️ No se pudo registrar sesión:", error.message);
  }
}

/**
 * Calcula la fecha de expiración a partir de una duración estilo "7d", "15m" o "2h".
 * @param {string} expiry — Duración (ej: "7d", "15m", "2h")
 * @returns {Date} — Fecha de expiración calculada
 */
function calcularExpiry(expiry) {
  const expiresAt = new Date();
  const match = expiry.match(/^(\d+)([dhm])$/);
  if (match) {
    const [, num, unit] = match;
    const n = parseInt(num, 10);
    if (unit === "d") expiresAt.setDate(expiresAt.getDate() + n);
    else if (unit === "h") expiresAt.setHours(expiresAt.getHours() + n);
    else if (unit === "m") expiresAt.setMinutes(expiresAt.getMinutes() + n);
  }
  return expiresAt;
}

/**
 * Crea un refresh token, lo almacena (hasheado) en BD y devuelve el token original.
 * @param {object} usuario — Instancia del usuario
 * @returns {Promise<string>} — Refresh token JWT (no hasheado)
 */
async function crearRefreshToken(usuario) {
  const refreshToken = generateRefreshToken({
    id: usuario.id_usuario,
    email: usuario.email,
  });

  await RefreshToken.create({
    token: RefreshToken.hashToken(refreshToken),
    id_usuario: usuario.id_usuario,
    expires_at: calcularExpiry(process.env.JWT_REFRESH_EXPIRES_IN || "7d"),
  });

  return refreshToken;
}

const authController = {
  /**
   * Login — genera access token (15 min) + refresh token (7 días) y registra sesión.
   * La validación de email/password se realiza en la capa de rutas vía Zod (loginSchema).
   */
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      // Buscar usuario con roles y permisos
      const usuario = await TbUser.findOne({
        where: { email },
        include: [
          {
            model: TbRol,
            as: "tb_rol",
            through: { attributes: [] },
            include: [
              {
                model: TbPermiso,
                as: "tb_permiso",
                through: { attributes: [] },
              },
            ],
          },
        ],
      });

      if (!usuario) {
        console.log("❌ Usuario no encontrado:", email);
        return res.status(401).json({
          success: false,
          message: "Credenciales inválidas",
        });
      }

      if (!usuario.activo) {
        console.log("❌ Usuario inactivo:", email);
        await registrarSesion(usuario.id_usuario, "login", req, false, "Usuario inactivo");
        return res.status(401).json({
          success: false,
          message: "Usuario inactivo",
        });
      }

      // Verificar contraseña
      const esPasswordValido = await usuario.verificarPassword(password);
      if (!esPasswordValido) {
        await registrarSesion(usuario.id_usuario, "login", req, false, "Contraseña inválida");
        return res.status(401).json({
          success: false,
          message: "Credenciales inválidas",
        });
      }

      // Generar access token (15 min)
      const accessToken = generateAccessToken({
        id: usuario.id_usuario,
        email: usuario.email,
      });

      // Generar y almacenar refresh token (7 días)
      const refreshToken = await crearRefreshToken(usuario);

      // Registrar sesión exitosa
      await registrarSesion(usuario.id_usuario, "login", req, true);

      // Omitir password_hash en la respuesta
      const { password_hash, ...usuarioSinPassword } = usuario.toJSON();

      res.json({
        success: true,
        message: "Login exitoso",
        data: {
          usuario: usuarioSinPassword,
          accessToken,
          refreshToken,
        },
      });
    } catch (error) {
      console.error("Error en login:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
        details:
          process.env.NODE_ENV === "development" ? error.message || String(error) : undefined,
      });
    }
  },

  /**
   * Refresh — rota refresh token y emite nuevos tokens.
   */
  refresh: async (req, res) => {
    try {
      const { refreshToken } = req.body;

      // Verificar firma JWT del refresh token
      let decoded;
      try {
        decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
      } catch (err) {
        await registrarSesion(null, "refresh", req, false, "Token inválido");
        return res.status(401).json({
          success: false,
          message: "Refresh token inválido o expirado",
        });
      }

      // Buscar el refresh token en BD (hasheado) y validar expiración/revocación
      const storedToken = await RefreshToken.findOne({
        where: {
          token: RefreshToken.hashToken(refreshToken),
          id_usuario: decoded.id,
        },
      });

      if (!storedToken || !storedToken.isValid()) {
        await registrarSesion(decoded.id, "refresh", req, false, "Token no encontrado o inválido");
        return res.status(401).json({
          success: false,
          message: "Refresh token inválido, expirado o revocado",
        });
      }

      // Buscar usuario
      const usuario = await TbUser.findByPk(decoded.id);
      if (!usuario || !usuario.activo) {
        await registrarSesion(decoded.id, "refresh", req, false, "Usuario inactivo");
        return res.status(401).json({
          success: false,
          message: "Token inválido o usuario inactivo",
        });
      }

      // Revocar refresh token anterior (rotación)
      await storedToken.update({ revoked: true });

      // Generar nuevos tokens
      const accessToken = generateAccessToken({
        id: usuario.id_usuario,
        email: usuario.email,
      });
      const newRefreshToken = await crearRefreshToken(usuario);

      // Registrar sesión de refresh
      await registrarSesion(usuario.id_usuario, "refresh", req, true);

      res.json({
        success: true,
        message: "Token refrescado exitosamente",
        data: {
          accessToken,
          refreshToken: newRefreshToken,
        },
      });
    } catch (error) {
      console.error("Error en refresh:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },

  /**
   * Logout — revoca el refresh token en BD y registra la sesión.
   */
  logout: async (req, res) => {
    try {
      const { refreshToken } = req.body;

      const hashedToken = RefreshToken.hashToken(refreshToken);
      const storedToken = await RefreshToken.findOne({
        where: { token: hashedToken },
      });

      if (storedToken) {
        await storedToken.update({ revoked: true });
        await registrarSesion(storedToken.id_usuario, "logout", req, true);
      }

      res.json({
        success: true,
        message: "Logout exitoso. Refresh token revocado.",
      });
    } catch (error) {
      console.error("Error en logout:", error);
      res.status(500).json({
        success: false,
        message: "Error interno del servidor",
      });
    }
  },

  /**
   * Obtiene el perfil del usuario autenticado.
   */
  perfil: async (req, res) => {
    try {
      const { password_hash, ...usuarioSinPassword } = req.usuario.toJSON();

      res.json({
        success: true,
        data: usuarioSinPassword,
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error al obtener perfil",
      });
    }
  },
};

module.exports = authController;
