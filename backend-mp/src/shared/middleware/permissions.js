const tienePermiso = (permisoRequerido) => {
  return (req, res, next) => {
    try {
      const usuario = req.usuario;

      if (!usuario) {
        console.log("ERROR: No hay usuario en la request");
        return res.status(401).json({
          success: false,
          message: "Usuario no autenticado",
        });
      }

      if (!usuario.tb_rol) {
        console.log("ERROR: Usuario no tiene propiedad tb_rol");
        return res.status(403).json({
          success: false,
          message: "Usuario no tiene roles asignados",
        });
      }

      const posiblesNombres = ["tb_permiso", "tb_permisos", "permisos", "TbPermiso", "TbPermisos"];

      let propiedadPermisos = null;
      for (const nombre of posiblesNombres) {
        if (usuario.tb_rol.length > 0 && usuario.tb_rol[0][nombre]) {
          propiedadPermisos = nombre;
          break;
        }
      }

      if (!propiedadPermisos) {
        console.log("ERROR: No se encontró la propiedad de permisos en los roles");
        return res.status(403).json({
          success: false,
          message: "Usuario no tiene permisos configurados",
        });
      }

      const tienePermiso = usuario.tb_rol.some((rol) => {
        const permisos = rol[propiedadPermisos];
        if (permisos && Array.isArray(permisos)) {
          return permisos.some((p) => {
            if (p.nombre === permisoRequerido) {
              console.log(`✅ Permiso encontrado: ${p.nombre}`);
              return true;
            }
            return false;
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
      console.error("Error en middleware de permisos:", error);
      res.status(500).json({
        success: false,
        message: "Error interno al verificar permisos",
      });
    }
  };
};

module.exports = { tienePermiso };
