const { Mando } = require("../models");
const { Op } = require("sequelize");
const apiErrors = require("../utils/apiErrors");

const MandoController = {
  /**
   * @desc    Obtener todos los registros
   * @route   GET /api/tbMando
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
          // Buscar en el campo mando
          { mando: { [Op.iLike]: `%${search}%` } },
        ].filter(Boolean);
      }

      // Agregar otros filtros
      Object.keys(filters).forEach((key) => {
        if (filters[key]) {
          whereClause[key] = filters[key];
        }
      });

      const data = await Mando.findAndCountAll({
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
   * @route   GET /api/tbMando/:id
   * @access  Public
   */
  async getById(req, res, next) {
    try {
      const { id } = req.params;
      const data = await Mando.findByPk(id);

      if (!data) {
        return next(apiErrors.notFound("Mando"));
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
   * @route   POST /api/tbMando
   * @access  Public
   */
  async create(req, res, next) {
    try {
      const data = await Mando.create(req.body);

      res.status(201).json({
        success: true,
        data,
        message: "Mando creado exitosamente",
      });
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        const mensajes =
          error.errors?.map((err) => err.message).join(". ") || error.message;
        return next(apiErrors.badRequest(mensajes));
      }

      if (error.name === "SequelizeUniqueConstraintError") {
        return next(apiErrors.conflict("El mando ya existe"));
      }

      return next(error);
    }
  },

  /**
   * @desc    Actualizar registro
   * @route   PUT /api/tbMando/:id
   * @access  Public
   */
  async update(req, res, next) {
    try {
      const { id } = req.params;

      const [affectedRows] = await Mando.update(req.body, {
        where: { id_mando: id },
      });

      if (affectedRows === 0) {
        return next(apiErrors.notFound("Mando"));
      }

      const updatedData = await Mando.findByPk(id);

      res.json({
        success: true,
        data: updatedData,
        message: "Mando actualizado exitosamente",
      });
    } catch (error) {
      if (error.name === "SequelizeValidationError") {
        const mensajes =
          error.errors?.map((err) => err.message).join(". ") || error.message;
        return next(apiErrors.badRequest(mensajes));
      }

      if (error.name === "SequelizeUniqueConstraintError") {
        return next(apiErrors.conflict("El mando ya existe"));
      }

      return next(error);
    }
  },

  /**
   * @desc    Eliminar registro
   * @route   DELETE /api/tbMando/:id
   * @access  Public
   */
  async delete(req, res, next) {
    try {
      const { id } = req.params;

      const affectedRows = await Mando.destroy({
        where: { id_mando: id },
      });

      if (affectedRows === 0) {
        return next(apiErrors.notFound("Mando"));
      }

      res.json({
        success: true,
        message: "Mando eliminado exitosamente",
      });
    } catch (error) {
      return next(error);
    }
  },
};

module.exports = MandoController;
