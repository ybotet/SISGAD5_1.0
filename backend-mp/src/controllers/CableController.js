const apiErrors = require("../utils/apiErrors");
const { Cable } = require("../models");
const { Op } = require("sequelize");

const CableController = {
  /**
   * @desc    Obtener todos los registros
   * @route   GET /api/tbCable
   * @access  Public
   */
  async getAll(req, res, next) {
    try {
      const {
        page = 1,
        limit = 10,
        sortBy = "createdAt",
        sortOrder = "DESC",
        search = "",
        ...filters
      } = req.query;

      const offset = (page - 1) * limit;

      // Construir where clause para búsqueda
      const whereClause = {};
      if (search) {
        whereClause[Op.or] = [{ numero: { [Op.iLike]: `%${search}%` } }];
      }

      // Agregar otros filtros
      Object.keys(filters).forEach((key) => {
        if (filters[key]) {
          whereClause[key] = filters[key];
        }
      });

      const data = await Cable.findAndCountAll({
        where: whereClause,
        include: [
          {
            association: "tb_propietario",
            attributes: ["id_propietario", "nombre"],
          },
        ],
        limit: parseInt(limit),
        offset: offset,
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
      return next(error);
    }
  },

  /**
   * @desc    Obtener un registro por ID
   * @route   GET /api/tbCable/:id
   * @access  Public
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await Cable.findByPk(id, {
        include: [
          {
            association: "tb_propietario",
            attributes: ["id_propietario", "nombre"],
          },
        ],
      });

      if (!data) {
        return next(apiErrors.notFound("Cable"));
      }

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      next(error);
    }
  },

  /**
   * @desc    Crear nuevo registro
   * @route   POST /api/tbCable
   * @access  Public
   */
  async create(req, res, next) {
    try {
      const data = await Cable.create(req.body);

      res.status(201).json({
        success: true,
        data,
        message: "Cable creado exitosamente",
      });
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        return next(apiErrors.badRequest(error.errors[0].message));
      }
      if (error.name === "SequelizeUniqueConstraintError") {
        return next(apiErrors.conflict("Registro duplicado"));
      }

      next(error);
    }
  },

  /**
   * @desc    Actualizar registro
   * @route   PUT /api/tbCable/:id
   * @access  Public
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;

      const [affectedRows] = await Cable.update(req.body, {
        where: { id_cable: id },
      });

      if (affectedRows === 0) {
        return next(apiErrors.notFound("Cable"));
      }

      const updatedData = await Cable.findByPk(id, {
        include: [
          {
            association: "tb_propietario",
            attributes: ["id_propietario", "nombre"],
          },
        ],
      });

      res.json({
        success: true,
        data: updatedData,
        message: "Cable actualizado exitosamente",
      });
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        return next(apiErrors.badRequest(error.errors[0].message));
      }
      if (error.name === "SequelizeUniqueConstraintError") {
        return next(apiErrors.conflict("Registro duplicado"));
      }

      next(error);
    }
  },

  /**
   * @desc    Eliminar registro
   * @route   DELETE /api/tbCable/:id
   * @access  Public
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const affectedRows = await Cable.destroy({
        where: { id_cable: id },
      });

      if (affectedRows === 0) {
        return next(apiErrors.notFound("Cable"));
      }

      res.json({
        success: true,
        message: "Cable eliminado exitosamente",
      });
    } catch (error) {
      next(error);
    }
  },
};

module.exports = CableController;
