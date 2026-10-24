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
        req.userId = decoded.id; // Guardar el ID del usuario

        // Obtener la información completa del usuario desde backend-users
        try {
            const usersServiceUrl = process.env.USERS_SERVICE_URL || 'http://localhost:5001';
            const response = await fetch(`${usersServiceUrl}/api/auth/perfil`, {
                method: 'GET',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const userData = await response.json();
                req.usuario = userData.data; // Guardar el usuario completo
            } else {
                console.error('Error al obtener usuario desde backend-users:', response.status);
                return res.status(401).json({
                    success: false,
                    message: 'Error al validar usuario'
                });
            }
        } catch (error) {
            console.error('Error en llamada a backend-users:', error);
            return res.status(500).json({
                success: false,
                message: 'Error interno al validar usuario'
            });
        }

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