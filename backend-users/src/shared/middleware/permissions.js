const tienePermiso = (permisoRequerido) => {
  return (req, res, next) => {
    try {
      const usuario = req.usuario;

      if (!usuario) {
        return res.status(401).json({
          success: false,
          message: "Usuario no autenticado",
        });
      }

      if (!usuario.tb_rol) {
        return res.status(403).json({
          success: false,
          message: "Usuario no tiene roles asignados",
        });
      }

      const tienePermiso = usuario.tb_rol.some((rol) => {
        if (rol.tb_permiso && Array.isArray(rol.tb_permiso)) {
          return rol.tb_permiso.some((permiso) => {
            return permiso.nombre === permisoRequerido;
          });
        }

        if (rol.tb_permisos && Array.isArray(rol.tb_permisos)) {
          return rol.tb_permisos.some((permiso) => {
            return permiso.nombre === permisoRequerido;
          });
        }

        return false;
      });

      if (!tienePermiso) {
        return res.status(403).json({
          success: false,
          message: `Permiso denegado. Se requiere: ${permisoRequerido}`,
        });
      }

      next();
    } catch (error) {
      res.status(500).json({
        success: false,
        message: "Error interno al verificar permisos",
      });
    }
  };
};

module.exports = { tienePermiso };
