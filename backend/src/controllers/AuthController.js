const jwt = require('jsonwebtoken');
const { User, Rol, Permiso } = require('../models/index');

// Validación de correo: vacío, formato (@ y dominio), longitud, caracteres permitidos
function validarEmail(email) {
    if (email === undefined || email === null || String(email).trim() === '') {
        return 'El correo es obligatorio';
    }
    const s = String(email).trim();
    if (s.length > 254) {
        return 'El correo no debe exceder 254 caracteres';
    }
    if (!s.includes('@')) {
        return 'El correo debe contener @';
    }
    const [local, domain] = s.split('@');
    if (!local || !domain || !domain.includes('.')) {
        return 'El correo debe tener un dominio válido (ej: usuario@dominio.com)';
    }
    const emailRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?(?:\.[a-zA-Z0-9](?:[a-zA-Z0-9-]{0,61}[a-zA-Z0-9])?)*$/;
    if (!emailRegex.test(s)) {
        return 'El correo contiene caracteres no permitidos o formato inválido';
    }
    return null;
}

// Validación de contraseña: vacío, longitud 8-128, sin espacios, requisitos de seguridad
function validarPassword(password) {
    if (password === undefined || password === null) {
        return 'La contraseña es obligatoria';
    }
    const s = String(password);
    if (s.length === 0) {
        return 'La contraseña es obligatoria';
    }
    if (s.length < 8) {
        return 'La contraseña debe tener al menos 8 caracteres';
    }
    if (s.length > 128) {
        return 'La contraseña no debe exceder 128 caracteres';
    }
    if (/\s/.test(s)) {
        return 'La contraseña no debe contener espacios';
    }
    const tieneMinuscula = /[a-z]/.test(s);
    const tieneMayuscula = /[A-Z]/.test(s);
    const tieneNumero = /[0-9]/.test(s);
    if (!tieneMinuscula || !tieneMayuscula || !tieneNumero) {
        return 'La contraseña debe incluir mayúsculas, minúsculas y números';
    }
    return null;
}

const authController = {
    login: async (req, res) => {
        try {
            const { email, password } = req.body;

            const errorEmail = validarEmail(email);
            if (errorEmail) {
                return res.status(400).json({
                    success: false,
                    message: errorEmail
                });
            }
            const errorPassword = validarPassword(password);
            if (errorPassword) {
                return res.status(400).json({
                    success: false,
                    message: errorPassword
                });
            }

            // Buscar usuario
            const usuario = await User.findOne({
                where: { email },
                include: [{
                    model: Rol,
                    as: 'tb_rol',
                    through: { attributes: [] },
                    include: [{
                        model: Permiso,
                        as: 'tb_permiso',
                        through: { attributes: [] }
                    }]
                }]
            });

            if (!usuario) {
                console.log('❌ Usuario no encontrado:', email);
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }

            if (!usuario.activo) {
                console.log('❌ Usuario inactivo:', email);
                return res.status(401).json({
                    success: false,
                    message: 'Usuario inactivo'
                });
            }

            // Verificar contraseña
            const esPasswordValido = await usuario.verificarPassword(password);
            if (!esPasswordValido) {
                return res.status(401).json({
                    success: false,
                    message: 'Credenciales inválidas'
                });
            }

            // Generar token
            const token = jwt.sign(
                {
                    id: usuario.id_usuario,
                    email: usuario.email
                },
                process.env.JWT_SECRET || 'secreto',
                { expiresIn: '24h' }
            );

            // Omitir password_hash en la respuesta
            const { password_hash, ...usuarioSinPassword } = usuario.toJSON();

            res.json({
                success: true,
                message: 'Login exitoso',
                data: {
                    usuario: usuarioSinPassword,
                    token
                }
            });

        } catch (error) {
            console.error('Error en login:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno del servidor',
                details: process.env.NODE_ENV === 'development' ? (error.message || String(error)) : undefined
            });
        }
    },

    perfil: async (req, res) => {
        try {
            const usuario = req.usuario;
            const { password_hash, ...usuarioSinPassword } = usuario.toJSON();

            res.json({
                success: true,
                data: usuarioSinPassword
            });
        } catch (error) {
            res.status(500).json({
                success: false,
                message: 'Error al obtener perfil'
            });
        }
    }
};

module.exports = authController;