const tienePermiso = (permisoRequerido) => {
    return (req, res, next) => {
        try {
            const usuario = req.usuario;

            if (!usuario) {
                console.log('ERROR: No hay usuario en la request');
                return res.status(401).json({
                    success: false,
                    message: 'Usuario no autenticado'
                });
            }

            if (!usuario.tb_rol) {
                console.log('ERROR: Usuario no tiene propiedad tb_rol');
                return res.status(403).json({
                    success: false,
                    message: 'Usuario no tiene roles asignados'
                });
            }

            console.log('Cantidad de roles:', usuario.tb_rol.length);

            // Recorre cada rol y sus permisos
            usuario.tb_rol.forEach((rol, index) => {
                const posiblesNombres = ['tb_permiso', 'tb_permisos', 'permisos', 'TbPermiso', 'TbPermisos'];
                let propiedadPermisos = null;

                for (const nombre of posiblesNombres) {
                    if (rol[nombre]) {
                        propiedadPermisos = nombre;
                        break;
                    }
                }
            });

            // Busca el permiso requerido
            const tienePermiso = usuario.tb_rol.some(rol => {
                // Primero intenta con tb_permiso (basado en tu log)
                if (rol.tb_permiso && Array.isArray(rol.tb_permiso)) {
                    return rol.tb_permiso.some(permiso => {
                        const tiene = permiso.nombre === permisoRequerido;
                        if (tiene) {
                            console.log(`¡Permiso encontrado! ${permiso.nombre} en rol ${rol.nombre}`);
                        }
                        return tiene;
                    });
                }

                // Si no, intenta con tb_permisos
                if (rol.tb_permisos && Array.isArray(rol.tb_permisos)) {
                    return rol.tb_permisos.some(permiso => {
                        const tiene = permiso.nombre === permisoRequerido;
                        if (tiene) {
                        }
                        return tiene;
                    });
                }

                return false;
            });

            if (!tienePermiso) {
                return res.status(403).json({
                    success: false,
                    message: `Permiso denegado. Se requiere: ${permisoRequerido}`
                });
            }

            next();
        } catch (error) {
            console.error('Error en middleware de permisos:', error);
            res.status(500).json({
                success: false,
                message: 'Error interno al verificar permisos'
            });
        }
    };
};

module.exports = { tienePermiso };