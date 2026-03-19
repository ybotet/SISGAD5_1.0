const { Clasificacion } = require("../models");
const { Op } = require("sequelize");
const apiErrors = require("../utils/apiErrors");

const ClasificacionController = {
  /**
   * @desc    Obtener todos los registros
   * @route   GET /api/tbClasificacion
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
        whereClause[Op.or] = [{ nombre: { [Op.iLike]: `%${search}%` } }];
      }

      // Agregar otros filtros
      Object.keys(filters).forEach((key) => {
        if (filters[key]) {
          whereClause[key] = filters[key];
        }
      });

      const data = await Clasificacion.findAndCountAll({
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
   * @route   GET /api/tbClasificacion/:id
   * @access  Public
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await Clasificacion.findByPk(id);

      if (!data) {
        return next(apiErrors.notFound("Clasificacion"));
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
   * @route   POST /api/tbClasificacion
   * @access  Public
   */
  async create(req, res, next) {
    try {
      const data = await Clasificacion.create(req.body);

      res.status(201).json({
        success: true,
        data,
        message: "Clasificacion creado exitosamente",
      });
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        const mensajes =
          error.errors?.map((err) => err.message).join(". ") || error.message;
        return next(apiErrors.badRequest(mensajes));
      }

      if (error.name === "SequelizeUniqueConstraintError") {
        return next(apiErrors.conflict("La clasificación ya existe"));
      }

      return next(error);
    }
  },

  /**
   * @desc    Actualizar registro
   * @route   PUT /api/tbClasificacion/:id
   * @access  Public
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;

      const [affectedRows] = await Clasificacion.update(req.body, {
        where: { id_clasificacion: id },
      });

      if (affectedRows === 0) {
        return next(apiErrors.notFound("Clasificacion"));
      }

      const updatedData = await Clasificacion.findByPk(id);

      res.json({
        success: true,
        data: updatedData,
        message: "Clasificacion actualizado exitosamente",
      });
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        const mensajes =
          error.errors?.map((err) => err.message).join(". ") || error.message;
        return next(apiErrors.badRequest(mensajes));
      }

      if (error.name === "SequelizeUniqueConstraintError") {
        return next(apiErrors.conflict("La clasificación ya existe"));
      }

      return next(error);
    }
  },

  /**
   * @desc    Eliminar registro
   * @route   DELETE /api/tbClasificacion/:id
   * @access  Public
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const affectedRows = await Clasificacion.destroy({
        where: { id_clasificacion: id },
      });

      if (affectedRows === 0) {
        return next(apiErrors.notFound("Clasificacion"));
      }

      res.json({
        success: true,
        message: "Clasificacion eliminado exitosamente",
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = ClasificacionController;
