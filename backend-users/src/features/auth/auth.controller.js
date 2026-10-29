const jwt = require("jsonwebtoken");
const crypto = require("crypto");
const { TbUser, TbRol, TbPermiso, RefreshToken, Sesion } = require("../../features");
const {
  requireJwtSecret,
  generateAccessToken,
  generateRefreshToken,
} = require("../../shared/config/jwt");

requireJwtSecret();

// Validación de correo: vacío, formato (@ y dominio), longitud, caracteres permitidos
function validarEmail(email) {
  if (email === undefined || email === null || String(email).trim() === "") {
    return "El correo es obligatorio";
  }
  const s = String(email).trim();
  if (s.length > 254) {
    return "El correo no debe exceder 254 caracteres";
  }
  if (!s.includes("@")) {
    return "El correo debe contener @";
  }
  const [local, domain] = s.split("@");
  if (!local || !domain || !domain.includes(".")) {
    return "El correo debe tener un dominio válido (ej: usuario@dominio.com)";
  }
  const emailRegex =
    /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
  if (!emailRegex.test(s)) {
    return "El correo contiene caracteres no permitidos o formato inválido";
  }
  return null;
}

// Validación de contraseña: vacío, longitud 8-128, sin espacios, requisitos de seguridad
function validarPassword(password) {
  if (password === undefined || password === null) {
    return "La contraseña es obligatoria";
  }
  const s = String(password);
  if (s.length === 0) {
    return "La contraseña es obligatoria";
  }
  if (s.length < 8) {
    return "La contraseña debe tener al menos 8 caracteres";
  }
  if (s.length > 128) {
    return "La contraseña no debe exceder 128 caracteres";
  }
  if (/\s/.test(s)) {
    return "La contraseña no debe contener espacios";
  }
  const tieneMinuscula = /[a-z]/.test(s);
  const tieneMayuscula = /[A-Z]/.test(s);
  const tieneNumero = /[0-9]/.test(s);
  if (!tieneMinuscula || !tieneMayuscula || !tieneNumero) {
    return "La contraseña debe incluir mayúsculas, minúsculas y números";
  }
  return null;
}

/**
 * Registra un evento de sesión en tb_sesiones.
 * @param {number} idUsuario — ID del usuario
 * @param {string} evento — "login" | "refresh" | "logout"
 * @param {object} req — Objeto request de Express (para IP y User-Agent)
 * @param {boolean} exitoso — Si el evento fue exitoso
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
 * Crea un refresh token, lo almacena (hasheado) en BD y devuelve el token original
 * (que se envía al cliente para que lo almacene).
 * @param {object} usuario — Instancia del usuario
 * @returns {Promise<string>} — Refresh token JWT (no hasheado)
 */
async function crearRefreshToken(usuario) {
  const refreshToken = generateRefreshToken({
    id: usuario.id_usuario,
    email: usuario.email,
  });

  // Almacenar hash del token en BD (nunca el token original)
  const hashedToken = RefreshToken.hashToken(refreshToken);

  // Calcular expiración (JWT_REFRESH_EXPIRES_IN default: 7d)
  const refreshExpiry = process.env.JWT_REFRESH_EXPIRES_IN || "7d";
  const expiresAt = new Date();
  if (refreshExpiry.endsWith("d")) {
    expiresAt.setDate(expiresAt.getDate() + parseInt(refreshExpiry));
  } else if (refreshExpiry.endsWith("h")) {
    expiresAt.setHours(expiresAt.getHours() + parseInt(refreshExpiry));
  } else if (refreshExpiry.endsWith("m")) {
    expiresAt.setMinutes(expiresAt.getMinutes() + parseInt(refreshExpiry));
  }

  await RefreshToken.create({
    token: hashedToken,
    id_usuario: usuario.id_usuario,
    expires_at: expiresAt,
  });

  return refreshToken;
}

const authController = {
  // Login — genera access token (15 min) + refresh token (7 días) y registra sesión
  login: async (req, res) => {
    try {
      const { email, password } = req.body;

      const errorEmail = validarEmail(email);
      if (errorEmail) {
        if (email) {
          const usuarioTemp = await TbUser.findOne({ where: { email } });
          if (usuarioTemp) {
            await registrarSesion(usuarioTemp.id_usuario, "login", req, false, errorEmail);
          }
        }
        return res.status(400).json({
          success: false,
          message: errorEmail,
        });
      }
      const errorPassword = validarPassword(password);
      if (errorPassword) {
        if (email) {
          const usuarioTemp = await TbUser.findOne({ where: { email } });
          if (usuarioTemp) {
            await registrarSesion(usuarioTemp.id_usuario, "login", req, false, errorPassword);
          }
        }
        return res.status(400).json({
          success: false,
          message: errorPassword,
        });
      }

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

  // Refrescar token — rota refresh token y emite nuevos tokens
  refresh: async (req, res) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(401).json({
          success: false,
          message: "Refresh token requerido",
        });
      }

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

      // Buscar el refresh token en BD (hasheado)
      const hashedToken = RefreshToken.hashToken(refreshToken);
      const storedToken = await RefreshToken.findOne({
        where: {
          token: hashedToken,
          id_usuario: decoded.id,
        },
      });

      // Validar que existe, no está revocado y no expiró
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

  // Logout — revoca el refresh token y registra la sesión
  logout: async (req, res) => {
    try {
      const { refreshToken } = req.body;

      if (!refreshToken) {
        return res.status(400).json({
          success: false,
          message: "Refresh token requerido",
        });
      }

      // Hashear y revocar el token en BD
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

  // Obtener perfil del usuario autenticado
  perfil: async (req, res) => {
    try {
      const usuario = req.usuario;
      const { password_hash, ...usuarioSinPassword } = usuario.toJSON();

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
