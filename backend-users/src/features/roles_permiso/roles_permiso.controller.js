const { Roles_Permisos } = require("../../features");
const { Op } = require("sequelize");

const rolesPermisoController = {
  async getAll(req, res) {
    try {
      const { page = 1, limit = 10, sortBy = "createdAt", sortOrder = "DESC", search = "", ...filters } = req.query;
      const offset = (page - 1) * limit;

      const whereClause = {};
      if (search) {
        if (!isNaN(search)) {
          const searchNum = parseInt(search);
          whereClause[Op.or] = [{ id_rol: searchNum }, { id_permiso: searchNum }];
        }
      }

      Object.keys(filters).forEach((key) => {
        if (filters[key]) {
          whereClause[key] = filters[key];
        }
      });

      const data = await Roles_Permisos.findAndCountAll({
        where: whereClause,
        limit: parseInt(limit),
        offset,
        order: [[sortBy, sortOrder.toUpperCase()]],
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
      console.error("Error en RolesPermisoController.getAll:", error);
      res.status(500).json({
        success: false,
        error: "Error interno del servidor",
        message: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },

  async getById(req, res) {
    try {
      const { id_rol, id_permiso } = req.params;
      const data = await Roles_Permisos.findOne({
        where: { id_rol: parseInt(id_rol), id_permiso: parseInt(id_permiso) },
      });

      if (!data) {
        return res.status(404).json({
          success: false,
          error: "RolesPermiso no encontrado",
        });
      }

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      console.error("Error en RolesPermisoController.getById:", error);
      res.status(500).json({
        success: false,
        error: "Error interno del servidor",
      });
    }
  },

  async create(req, res) {
    try {
      const data = await Roles_Permisos.create(req.body);

      res.status(201).json({
        success: true,
        data,
        message: "RolesPermiso creado exitosamente",
      });
    } catch (error) {
      console.error("Error en RolesPermisoController.create:", error);

      if (error.name === "SequelizeValidationError") {
        return res.status(400).json({
          success: false,
          error: "Error de validación",
          details: error.errors.map((err) => err.message),
        });
      }

      res.status(400).json({
        success: false,
        error: "Error creando RolesPermiso",
        message: process.env.NODE_ENV === "development" ? error.message : undefined,
      });
    }
  },

  async delete(req, res) {
    try {
      const { id_rol, id_permiso } = req.params;

      const affectedRows = await Roles_Permisos.destroy({
        where: { id_rol: parseInt(id_rol), id_permiso: parseInt(id_permiso) },
      });

      if (affectedRows === 0) {
        return res.status(404).json({
          success: false,
          error: "RolesPermiso no encontrado",
        });
      }

      res.json({
        success: true,
        message: "RolesPermiso eliminado exitosamente",
      });
    } catch (error) {
      console.error("Error en RolesPermisoController.delete:", error);
      res.status(500).json({
        success: false,
        error: "Error eliminando RolesPermiso",
      });
    }
  },
};

module.exports = rolesPermisoController;
