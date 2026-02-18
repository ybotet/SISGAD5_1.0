const jwt = require('jsonwebtoken');

const auth = async (req, res, next) => {
    try {
        const token = req.header('Authorization')?.replace('Bearer ', '');

        if (!token) {
            return res.status(401).json({
                success: false,
                message: 'Token de acceso requerido'
            });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.userId = decoded.id; // Solo guardar el ID del usuario
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