const jwt = require('jsonwebtoken');
const { User, Rol, Permiso } = require('../models');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        console.log('🔐 Verificando token...');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token de acceso requerido'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        console.log('✅ Token válido, ID usuario:', decoded.id);
        const usuario = await User.findByPk(decoded.id, {
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
            console.log('Usuario no encontrado con ID:', decoded.id);
            return res.status(401).json({
                success: false,
                message: 'Usuario no válido'
            });
        }

        if (!usuario.activo) {
            console.log('Usuario inactivo:', decoded.id);
            return res.status(401).json({
                success: false,
                message: 'Usuario inactivo'
            });
        }

        req.usuario = usuario;
        next();
    } catch (error) {
        console.error('Error en middleware auth:', error);
        res.status(401).json({
            success: false,
            message: 'Token inválido'
        });
    }
};

module.exports = auth;