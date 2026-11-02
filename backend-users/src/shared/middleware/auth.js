const jwt = require("jsonwebtoken");
const { TbUser, TbRol, TbPermiso } = require("../../features");

const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        message: "Token de acceso requerido",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const usuario = await TbUser.findByPk(decoded.id, {
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
      return res.status(401).json({
        success: false,
        message: "Usuario no válido",
      });
    }

    if (!usuario.activo) {
      return res.status(401).json({
        success: false,
        message: "Usuario inactivo",
      });
    }

    req.usuario = usuario;
    next();
  } catch (error) {
    res.status(401).json({
      success: false,
      message: "Token inválido",
    });
  }
};

module.exports = auth;
