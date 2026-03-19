const { Propietario } = require("../models");
const { Op } = require("sequelize");
const apiErrors = require("../utils/apiErrors");

const PropietarioController = {
  /**
   * @desc    Obtener todos los registros
   * @route   GET /api/tbPropietario
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
        whereClause[Op.or] = [
          // Buscar en el campo nombre
          { nombre: { [Op.iLike]: `%${search}%` } },
        ].filter(Boolean);
      }

      // Agregar otros filtros
      Object.keys(filters).forEach((key) => {
        if (filters[key]) {
          whereClause[key] = filters[key];
        }
      });

      const data = await Propietario.findAndCountAll({
        where: whereClause,
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
   * @route   GET /api/tbPropietario/:id
   * @access  Public
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await Propietario.findByPk(id);

      if (!data) {
        return next(apiErrors.notFound("Propietario"));
      }

      res.json({
        success: true,
        data,
      });
    } catch (error) {
      return next(error);
    }
  },

  /**
   * @desc    Crear nuevo registro
   * @route   POST /api/tbPropietario
   * @access  Public
   */
  async create(req, res, next) {
    try {
      const data = await Propietario.create(req.body);

      res.status(201).json({
        success: true,
        data,
        message: "Propietario creado exitosamente",
      });
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        const mensaje =
          error.errors?.map((err) => err.message).join(". ") ||
          "Error de validación";
        return next(apiErrors.badRequest(mensaje));
      }

      if (error.name === "SequelizeUniqueConstraintError") {
        return next(apiErrors.conflict("El propietario ya existe"));
      }

      return next(error);
    }
  },

  /**
   * @desc    Actualizar registro
   * @route   PUT /api/tbPropietario/:id
   * @access  Public
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;

      const [affectedRows] = await Propietario.update(req.body, {
        where: { id_propietario: id },
      });

      if (affectedRows === 0) {
        return next(apiErrors.notFound("Propietario"));
      }

      const updatedData = await Propietario.findByPk(id);

      res.json({
        success: true,
        data: updatedData,
        message: "Propietario actualizado exitosamente",
      });
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        const mensaje =
          error.errors?.map((err) => err.message).join(". ") ||
          "Error de validación";
        return next(apiErrors.badRequest(mensaje));
      }

      if (error.name === "SequelizeUniqueConstraintError") {
        return next(apiErrors.conflict("El propietario ya existe"));
      }

      return next(error);
    }
  },

  /**
   * @desc    Eliminar registro
   * @route   DELETE /api/tbPropietario/:id
   * @access  Public
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const affectedRows = await Propietario.destroy({
        where: { id_propietario: id },
      });

      if (affectedRows === 0) {
        return next(apiErrors.notFound("Propietario"));
      }

      res.json({
        success: true,
        message: "Propietario eliminado exitosamente",
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = PropietarioController;
