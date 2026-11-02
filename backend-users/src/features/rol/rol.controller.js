const { TbRol, TbPermiso } = require("../../features");
const { Op } = require("sequelize");

const rolController = {
  // Obtener todos los roles (con paginación y búsqueda)
  getAll: async (req, res) => {
    try {
      const { page = 1, limit = 10, search = "" } = req.query;
      const offset = (page - 1) * limit;

      const where = {};
      if (search) {
        where[Op.or] = [{ nombre: { [Op.iLike]: `%${search}%` } }];
      }

      const data = await TbRol.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset,
        order: [["nombre", "ASC"]],
        include: [
          { model: TbPermiso, as: "tb_permiso", through: { attributes: [] } },
        ],
      });

      res.json({
        success: true,
        data: data.rows,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: data.count,
          pages: Math.ceil(data.count / limit),
        },
      });
    } catch (error) {
      console.error("Error en RolController.getAll:", error);
      res.status(500).json({
        success: false,
        error: "Error interno del servidor",
        message:
          process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },

  // Obtener rol por ID
  getById: async (req, res) => {
    try {
      const { id } = req.params;
      const rol = await TbRol.findByPk(id, {
        include: [
          { model: TbPermiso, as: "tb_permiso", through: { attributes: [] } },
        ],
      });

      if (!rol) {
        return res.status(404).json({
          success: false,
          error: "Rol no encontrado",
        });
      }

      res.json({
        success: true,
        data: rol,
      });
    } catch (error) {
      console.error("Error en RolController.getById:", error);
      res.status(500).json({
        success: false,
        error: "Error interno del servidor",
      });
    }
  },

  // Crear rol
  create: async (req, res) => {
    try {
      const rol = await TbRol.create(req.body);

      res.status(201).json({
        success: true,
        data: rol,
        message: "Rol creado exitosamente",
      });
    } catch (error) {
      console.error("Error en RolController.create:", error);

      if (error.name === "SequelizeValidationError") {
        return res.status(400).json({
          success: false,
          error: "Error de validación",
          details: error.errors.map((err) => err.message),
        });
      }

      if (error.name === "SequelizeUniqueConstraintError") {
        return res.status(409).json({
          success: false,
          error: "El rol ya existe",
        });
      }

      res.status(400).json({
        success: false,
        error: "Error creando rol",
        message: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },

  // Actualizar rol
  update: async (req, res) => {
    try {
      const { id } = req.params;
      const [affectedRows] = await TbRol.update(req.body, {
        where: { id_rol: id },
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: "Rol no encontrado",
        });
      }

      const updated = await TbRol.findByPk(id);

      res.json({
        success: true,
        data: updated,
        message: "Rol actualizado exitosamente",
      });
    } catch (error) {
      console.error("Error en RolController.update:", error);

      if (error.name === "SequelizeValidationError") {
        return res.status(400).json({
          success: false,
          error: "Error de validación",
          details: error.errors.map((err) => err.message),
        });
      }

      res.status(400).json({
        success: false,
        error: "Error actualizando rol",
      });
    }
  },

  // Eliminar rol
  delete: async (req, res) => {
    try {
      const { id } = req.params;

      const affectedRows = await TbRol.destroy({
        where: { id_rol: id },
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: "Rol no encontrado",
        });
      }

      res.json({
        success: true,
        message: "Rol eliminado exitosamente",
      });
    } catch (error) {
      console.error("Error en RolController.delete:", error);
      res.status(500).json({
        success: false,
        error: "Error eliminando rol",
      });
    }
  },
};

module.exports = rolController;
