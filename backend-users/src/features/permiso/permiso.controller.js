const { TbPermiso } = require("../../features");

const permisoController = {
  async getAll(req, res) {
    try {
      const { page = 1, limit = 10, search = "" } = req.query;
      const offset = (page - 1) * limit;

      const { Op } = require("sequelize");
      const where = {};
      if (search) {
        where[Op.or] = [
          { nombre: { [Op.iLike]: `%${search}%` } },
          { modulo: { [Op.iLike]: `%${search}%` } },
          { accion: { [Op.iLike]: `%${search}%` } },
        ];
      }

      const data = await TbPermiso.findAndCountAll({
        where,
        limit: parseInt(limit),
        offset,
        order: [["nombre", "ASC"]],
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
      console.error("Error en PermisoController.getAll:", error);
      res.status(500).json({
        success: false,
        error: "Error interno del servidor",
      });
    }
  },

  async getById(req, res) {
    try {
      const { id } = req.params;
      const data = await TbPermiso.findByPk(id);

      if (!data) {
        return res.status(404).json({
          success: false,
          error: "Permiso no encontrado",
        });
      }

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error("Error en PermisoController.getById:", error);
      res.status(500).json({
        success: false,
        error: "Error interno del servidor",
      });
    }
  },

  async create(req, res) {
    try {
      const data = await TbPermiso.create(req.body);

      res.status(201).json({
        success: true,
        data,
        message: "Permiso creado exitosamente",
      });
    } catch (error) {
      console.error("Error en PermisoController.create:", error);

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
          error: "El permiso ya existe",
        });
      }

      res.status(400).json({
        success: false,
        error: "Error creando permiso",
        message: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },

  async update(req, res) {
    try {
      const { id } = req.params;
      const [affectedRows] = await TbPermiso.update(req.body, {
        where: { id_permiso: id },
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: "Permiso no encontrado",
        });
      }

      const updated = await TbPermiso.findByPk(id);

      res.json({
        success: true,
        data: updated,
        message: "Permiso actualizado exitosamente",
      });
    } catch (error) {
      console.error("Error en PermisoController.update:", error);

      if (error.name === "SequelizeValidationError") {
        return res.status(400).json({
          success: false,
          error: "Error de validación",
          details: error.errors.map((err) => err.message),
        });
      }

      res.status(400).json({
        success: false,
        error: "Error actualizando permiso",
      });
    }
  },

  async delete(req, res) {
    try {
      const { id } = req.params;

      const affectedRows = await TbPermiso.destroy({
        where: { id_permiso: id },
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: "Permiso no encontrado",
        });
      }

      res.json({
        success: true,
        message: "Permiso eliminado exitosamente",
      });
    } catch (error) {
      console.error("Error en PermisoController.delete:", error);
      res.status(500).json({
        success: false,
        error: "Error eliminando permiso",
      });
    }
  },
};

module.exports = permisoController;
