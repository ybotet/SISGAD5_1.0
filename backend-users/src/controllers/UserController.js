const { User, Rol, User_Roles } = require('../models/index');
const { Op } = require('sequelize');

const usuariosController = {
    // Obtener todos los usuarios (con paginación)
    obtenerUsers: async (req, res) => {
        try {
            const { page = 1, limit = 10, search = '' } = req.query;
            const offset = (page - 1) * limit;

            const whereCondition = {};
            if (search) {
                whereCondition[Op.or] = [
                    { nombre: { [Op.like]: `%${search}%` } },
                    { apellidos: { [Op.like]: `%${search}%` } },
                    { email: { [Op.like]: `%${search}%` } }
                ];
            }

            const { count, rows: usuarios } = await User.findAndCountAll({
                where: whereCondition,
                attributes: { exclude: ['password_hash'] },
                include: [{
                    model: Rol,
                    as: 'tb_rol',
                    through: { attributes: [] },
                    attributes: ['id_rol', 'nombre', 'descripcion']
                }],
                limit: parseInt(limit),
                offset: offset,
                order: [['createdAt', 'DESC']]
            });

            res.json({
                success: true,
                data: usuarios.map(u => {
                    if (u.tb_rol && Array.isArray(u.tb_rol)) {
                        const uniq = [];
                        const seen = new Set();
                        u.tb_rol.forEach(r => {
                            if (!seen.has(r.id_rol)) {
                                seen.add(r.id_rol);
                                uniq.push(r);
                            }
                        });
                        u.tb_rol = uniq;
                    }
                    return u;
                }),
                pagination: {
                    page: parseInt(page),
                    limit: parseInt(limit),
                    total: count,
                    pages: Math.ceil(count / limit)
                }
            });

        } catch (error) {
            console.error('Error al obtener usuarios:', error);
            res.status(500).json({
                success: false,
                message: 'Error al obtener usuarios'
            });
        }
    },

    // Crear usuario
    crearUser: async (req, res) => {
        try {
            const { email, password, nombre, apellidos, roles } = req.body;

            // Verificar si el email ya existe
            const usuarioExistente = await User.findOne({ where: { email } });
            if (usuarioExistente) {
                return res.status(400).json({
                    success: false,
                    message: 'El email ya está registrado'
                });
            }

            // Crear usuario
            const usuario = await User.create({
                email,
                password_hash: password,
                nombre,
                apellidos
            });

            // Asignar roles si se proporcionaron (gestión directa de la tabla intermedia)
            if (roles && roles.length > 0) {
                const rolesEncontrados = await Rol.findAll({ where: { id_rol: roles } });
                // Eliminar posibles asignaciones existentes (por seguridad)
                await User_Roles.destroy({ where: { id_usuario: usuario.id_usuario } });
                // Insertar las nuevas relaciones
                const inserts = rolesEncontrados.map(r => ({ id_usuario: usuario.id_usuario, id_rol: r.id_rol }));
                if (inserts.length > 0) await User_Roles.bulkCreate(inserts);
            }

            // Obtener usuario con roles
            const usuarioConRoles = await User.findByPk(usuario.id_usuario, {
                attributes: { exclude: ['password_hash'] },
                include: [{
                    model: Rol,
                    as: 'tb_rol',
                    through: { attributes: [] }
                }]
            });

            // Asegurar roles únicos antes de responder
            if (usuarioConRoles && usuarioConRoles.tb_rol && Array.isArray(usuarioConRoles.tb_rol)) {
                const seen = new Set();
                usuarioConRoles.tb_rol = usuarioConRoles.tb_rol.filter(r => {
                    if (seen.has(r.id_rol)) return false;
                    seen.add(r.id_rol);
                    return true;
                });
            }

            res.status(201).json({
                success: true,
                message: 'User creado exitosamente',
                data: usuarioConRoles
            });

        } catch (error) {
            console.error('Error al crear usuario:', error);
            res.status(500).json({
                success: false,
                message: 'Error al crear usuario'
            });
        }
    },

    // Actualizar usuario
    actualizarUser: async (req, res) => {
        try {
            const { id } = req.params;
            const { email, nombre, apellidos, activo, roles } = req.body;

            console.log('Datos recibidos para actualizar:', req.body);

            const usuario = await User.findByPk(id);
            if (!usuario) {
                return res.status(404).json({
                    success: false,
                    message: 'Usuario no encontrado'
                });
            }

            // Actualizar campos
            await usuario.update({
                email: email || usuario.email,
                nombre: nombre || usuario.nombre,
                apellidos: apellidos || usuario.apellidos,
                activo: activo !== undefined ? activo : usuario.activo
            });

            console.log('roles recibidos para actualizar:', roles);
            // Actualizar roles si se proporcionaron (gestión directa de la tabla intermedia)
            if (roles) {
                const rolesEncontrados = await Rol.findAll({ where: { id_rol: roles } });
                await User_Roles.destroy({ where: { id_usuario: usuario.id_usuario } });
                const inserts = rolesEncontrados.map(r => ({ id_usuario: usuario.id_usuario, id_rol: r.id_rol }));
                if (inserts.length > 0) await User_Roles.bulkCreate(inserts);
            }

            // Obtener usuario actualizado
            const usuarioActualizado = await User.findByPk(id, {
                attributes: { exclude: ['password_hash'] },
                include: [{
                    model: Rol,
                    as: 'tb_rol',
                    through: { attributes: [] }
                }]
            });

            // Asegurar roles únicos antes de responder
            if (usuarioActualizado && usuarioActualizado.tb_rol && Array.isArray(usuarioActualizado.tb_rol)) {
                const seen = new Set();
                usuarioActualizado.tb_rol = usuarioActualizado.tb_rol.filter(r => {
                    if (seen.has(r.id_rol)) return false;
                    seen.add(r.id_rol);
                    return true;
                });
            }

            res.json({
                success: true,
                message: 'User actualizado exitosamente',
                data: usuarioActualizado
            });

        } catch (error) {
            console.error('Error al actualizar usuario:', error);
            res.status(500).json({
                success: false,
                message: 'Error al actualizar usuario'
            });
        }
    },

    // Eliminar usuario
    eliminarUser: async (req, res) => {
        try {
            const { id } = req.params;

            const usuario = await User.findByPk(id);
            if (!usuario) {
                return res.status(404).json({
                    success: false,
                    message: 'User no encontrado'
                });
            }

            await usuario.destroy();

            res.json({
                success: true,
                message: 'User eliminado exitosamente'
            });

        } catch (error) {
            console.error('Error al eliminar usuario:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar usuario'
            });
        }
    },

    eliminarVariosUser: async (req, res) => {
        try{
            const { ids } = req.body; // Recibir un array de IDs

            if (!Array.isArray(ids) || ids.length === 0) {
                return res.status(400).json({
                    success: false,
                    message: 'Se debe proporcionar un array de IDs para eliminar'
                });
            }

            // Validar que todos los IDs sean números (si tu id es numérico)
            const idsInvalidos = ids.filter(id => isNaN(id) || id <= 0);
            if (idsInvalidos.length > 0) {
                return res.status(400).json({
                    success: false,
                    message: `Los siguientes IDs no son válidos: ${idsInvalidos.join(', ')}`
                });
            }

            // Verificar si los usuarios existen antes de eliminar (opcional)
            const usuariosExistentes = await User.count({
                where: { id_usuario: ids }
            });

            if (usuariosExistentes !== ids.length) {
                return res.status(404).json({
                    success: false,
                    message: 'Algunos usuarios no existen'
                });
            }

            // Eliminar los usuarios
            const eliminados = await User.destroy({ 
                where: { id_usuario: ids } 
            });

            res.json({
                success: true,
                message: `Se eliminaron ${eliminados} usuario(s) exitosamente`,
                eliminados: eliminados,
                totalSolicitados: ids.length
            });

        } catch (error) {
            console.error('Error al eliminar usuarios:', error);
            res.status(500).json({
                success: false,
                message: 'Error al eliminar usuarios'
            });
        }
    }
};

module.exports = usuariosController;